import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import VerifyEmail from "./pages/VerifyEmail";
import Dashboard from "./pages/Dashboard";
import FoodLog from "./pages/FoodLog";
import FoodSearch from "./pages/FoodSearch";
import Profile from "./pages/Profile";

import "./styles/theme.css";
import "./styles/components.css";

/**
 * NOTE for the team: this currently renders demo/placeholder data on the
 * authenticated pages so the UI is reviewable standalone. Swap in real
 * auth state (e.g. from context or a /api/me check) to gate routes and
 * pass the real `user` object down to Navbar/Dashboard/FoodLog/etc.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/food-log" element={<FoodLog />} />
        <Route path="/search" element={<FoodSearch />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}
