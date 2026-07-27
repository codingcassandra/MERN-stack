import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import api from "../api/client";
import "./Login.css";

export default function Login() {
  const [params] = useSearchParams();
  const isSignup = params.get("mode") === "signup";
  const navigate = useNavigate();

  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [status, setStatus] = useState("idle"); // idle | loading | error | verify-sent
  const [error, setError] = useState("");

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    try {
      if (isSignup) {
        await api.signup(form);
        // Backend sends a verification email; don't log the user in yet.
        setStatus("verify-sent");
      } else {
        const res = await api.login({ email: form.email, password: form.password });
        localStorage.setItem("authToken", res.token);
        navigate("/dashboard");
      }
    } catch (err) {
      setStatus("error");
      setError(err.message || "Something went wrong. Please try again.");
    }
  }

  if (status === "verify-sent") {
    return (
      <main className="auth-page">
        <div className="container auth-container">
          <div className="label-panel auth-panel">
            <p className="eyebrow">Almost there</p>
            <h1 className="label-panel-title">Check your inbox</h1>
            <p className="auth-verify-copy">
              We sent a verification link to <strong>{form.email}</strong>. Confirm
              your address to activate your account.
            </p>
            <button
              className="btn btn-ghost btn-block"
              onClick={() => api.resendVerification(form.email)}
            >
              Resend email
            </button>
            <Link to="/login" className="auth-back-link">
              Back to log in
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <div className="container auth-container">
        <div className="label-panel auth-panel">
          <p className="eyebrow">{isSignup ? "Create account" : "Welcome back"}</p>
          <h1 className="label-panel-title">
            {isSignup ? "Start your log" : "Log in to NutriFuel"}
          </h1>

          {status === "error" && (
            <p className="banner banner-error" role="alert">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {isSignup && (
              <div className="name-row">
                <div className="field">
                  <label htmlFor="firstName">First name</label>
                  <input
                    id="firstName"
                    type="text"
                    required
                    autoComplete="given-name"
                    value={form.firstName}
                    onChange={update("firstName")}
                  />
                </div>
                <div className="field">
                  <label htmlFor="lastName">Last name</label>
                  <input
                    id="lastName"
                    type="text"
                    required
                    autoComplete="family-name"
                    value={form.lastName}
                    onChange={update("lastName")}
                  />
                </div>
              </div>
            )}

            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={update("email")}
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                autoComplete={isSignup ? "new-password" : "current-password"}
                value={form.password}
                onChange={update("password")}
              />
              <span className="field-hint">At least 8 characters.</span>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={status === "loading"}>
              {status === "loading"
                ? "Please wait…"
                : isSignup
                ? "Create account"
                : "Log in"}
            </button>
          </form>

          <p className="auth-switch">
            {isSignup ? (
              <>
                Already have an account? <Link to="/login">Log in</Link>
              </>
            ) : (
              <>
                New here? <Link to="/login?mode=signup">Create an account</Link>
              </>
            )}
          </p>
        </div>
      </div>
    </main>
  );
}
