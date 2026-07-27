import { NavLink, useNavigate } from "react-router-dom";
import api from "../api/client";

/**
 * Top navigation. `user` is optional — pass null/undefined for logged-out state.
 */
export default function Navbar({ user }) {
  const navigate = useNavigate();
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  async function handleLogout() {
    try {
      await api.logout();
    } catch {
      // Still clear the local session even if the network call fails.
    }
    localStorage.removeItem("authToken");
    navigate("/login", { replace: true });
  }

  return (
    <header className="navbar">
      <nav className="navbar-inner" aria-label="Main navigation">
        <NavLink to="/" className="brand">
          <span className="brand-mark" aria-hidden="true">
            NF
          </span>
          NutriFuel
        </NavLink>

        {user && (
          <ul className="nav-links">
            <li>
              <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink to="/food-log" className={({ isActive }) => (isActive ? "active" : "")}>
                Food Log
              </NavLink>
            </li>
            <li>
              <NavLink to="/search" className={({ isActive }) => (isActive ? "active" : "")}>
                Add Food
              </NavLink>
            </li>
            <li>
              <NavLink to="/workouts" className={({ isActive }) => (isActive ? "active" : "")}>
                Workouts
              </NavLink>
            </li>
          </ul>
        )}

        {user ? (
          <div className="nav-user">
            <NavLink to="/profile" aria-label={`${user.name}'s profile`}>
              <span className="avatar" aria-hidden="true">
                {initials}
              </span>
            </NavLink>
            <button type="button" className="nav-logout" onClick={handleLogout}>
              Log out
            </button>
          </div>
        ) : (
          <NavLink to="/login" className="btn btn-lime">
            Log In
          </NavLink>
        )}
      </nav>
    </header>
  );
}
