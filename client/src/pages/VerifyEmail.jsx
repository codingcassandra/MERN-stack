import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/client";
import "./Login.css";

/**
 * Route: /verify-email/:token
 * Called when the user clicks the verification link from their email.
 */
export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState("checking"); // checking | success | error

  useEffect(() => {
    let active = true;
    api
      .verifyEmail(token)
      .then(() => active && setStatus("success"))
      .catch(() => active && setStatus("error"));
    return () => {
      active = false;
    };
  }, [token]);

  return (
    <main className="auth-page">
      <div className="container auth-container">
        <div className="label-panel auth-panel" style={{ textAlign: "center" }}>
          {status === "checking" && (
            <>
              <p className="eyebrow">One moment</p>
              <h1 className="label-panel-title">Confirming your email…</h1>
            </>
          )}

          {status === "success" && (
            <>
              <p className="eyebrow">Verified</p>
              <h1 className="label-panel-title">You're all set</h1>
              <p className="auth-verify-copy">Your email is confirmed. You can log in now.</p>
              <Link to="/login" className="btn btn-primary btn-block">
                Go to log in
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <p className="eyebrow">Link expired</p>
              <h1 className="label-panel-title">Couldn't verify that link</h1>
              <p className="auth-verify-copy">
                This link may have expired or already been used. Request a new one from
                the log in page.
              </p>
              <Link to="/login" className="btn btn-ghost btn-block">
                Back to log in
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
