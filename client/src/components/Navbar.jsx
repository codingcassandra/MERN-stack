import { NavLink } from "react-router-dom";

/**
 * Top navigation. `user` is optional — pass null/undefined for logged-out state.
 */
export default function Navbar({ user }) {
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";

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
          </ul>
        )}

        {user ? (
          <div className="nav-user">
            <NavLink to="/profile" aria-label={`${user.name}'s profile`}>
              <span className="avatar" aria-hidden="true">
                {initials}
              </span>
            </NavLink>
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
