/**
 * NutriFuel API client
 * ---------------------
 * Thin fetch wrapper for talking to the Express/MongoDB backend.
 * All calls are async (AJAX) and return parsed JSON.
 *
 * Set VITE_API_BASE_URL in your .env (Vite) or REACT_APP_API_BASE_URL (CRA)
 * to point at the backend, e.g. http://localhost:5000
 */

const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) ||
  process.env.REACT_APP_API_BASE_URL ||
  "/api";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include", // send session/JWT cookie for auth'd routes
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  let body = null;
  try {
    body = await res.json();
  } catch {
    // no JSON body (e.g. 204)
  }

  if (!res.ok) {
    const message = body?.message || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return body;
}

export const api = {
  // ---- Auth ----
  // data: { firstName, lastName, email, password } — matches server/models/User.js
  signup: (data) =>
    request("/auth/signup", { method: "POST", body: JSON.stringify(data) }),

  login: (data) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(data) }),

  logout: () => request("/auth/logout", { method: "POST" }),

  googleLoginUrl: () => `${API_BASE}/auth/google`,

  verifyEmail: (token) =>
    request(`/auth/verify-email/${encodeURIComponent(token)}`, {
      method: "POST",
    }),

  resendVerification: (email) =>
    request("/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  // ---- Dashboard ----
  getDashboard: (date) => request(`/dashboard?date=${date ?? "today"}`),

  // ---- Food log ----
  getFoodLog: (date) => request(`/food-log?date=${date ?? "today"}`),

  addFoodEntry: (entry) =>
    request("/food-log", { method: "POST", body: JSON.stringify(entry) }),

  deleteFoodEntry: (id) => request(`/food-log/${id}`, { method: "DELETE" }),

  // ---- Third-party nutrition data search (proxied through backend) ----
  searchFoods: (query) =>
    request(`/foods/search?q=${encodeURIComponent(query)}`),

  // ---- Profile ----
  getProfile: () => request("/profile"),

  updateProfile: (data) =>
    request("/profile", { method: "PUT", body: JSON.stringify(data) }),
};

export default api;
