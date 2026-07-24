import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

/**
 * Route: /oauth-success
 * Google OAuth lands here (see server/controllers/authController.js
 * googleCallback) with the JWT in a query param.
 */
export default function OAuthSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get("token");
    if (token) {
      localStorage.setItem("authToken", token);
      navigate("/dashboard", { replace: true });
    } else {
      navigate("/login?error=google-auth-failed", { replace: true });
    }
  }, [params, navigate]);

  return (
    <main className="auth-page">
      <div className="container auth-container">
        <div className="label-panel auth-panel" style={{ textAlign: "center" }}>
          <p className="eyebrow">One moment</p>
          <h1 className="label-panel-title">Signing you in…</h1>
        </div>
      </div>
    </main>
  );
}
