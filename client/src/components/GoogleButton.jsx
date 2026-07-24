import api from "../api/client";

/**
 * Redirects to the backend's Google OAuth entry point
 * (e.g. GET /api/auth/google via Passport.js), which handles
 * the OAuth handshake and redirects back with a session/JWT.
 */
export default function GoogleButton({ label = "Continue with Google" }) {
  return (
    <a href={api.googleLoginUrl()} className="btn-google" role="button">
      <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <path
          fill="#FFC107"
          d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
        />
        <path
          fill="#FF3D00"
          d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6 29.6 4 24 4c-7.6 0-14.1 4.3-17.7 10.7z"
        />
        <path
          fill="#4CAF50"
          d="M24 44c5.5 0 10.4-1.9 14.3-5.1l-6.6-5.4C29.7 35.4 27 36.4 24 36.4c-5.3 0-9.7-3.4-11.3-8.1l-6.6 5.1C9.8 39.6 16.3 44 24 44z"
        />
        <path
          fill="#1976D2"
          d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.6 5.4C41.6 35.6 44 30.2 44 24c0-1.3-.1-2.7-.4-3.5z"
        />
      </svg>
      {label}
    </a>
  );
}
