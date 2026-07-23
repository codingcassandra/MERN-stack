# NutriFuel — Front End

React front end for the team's MERN nutrition tracker. Owns the UI/UX layer:
pages, components, styling, routing, and the AJAX layer that talks to the
Express API.

## Design concept

The visual identity borrows the layout language of an actual **Nutrition
Facts label** — thick black rules, stacked data rows, mono numerals — and
reinterprets it in a bold green/lime palette. That system (`.label-panel`,
`.label-row`, `.stat-card`) is reused across the dashboard, food log, and
search results so the whole app reads as one thing, not a template.

- **Colors:** ink `#12231a`, paper `#f7f5ee`, green `#2e7d46`, lime `#c6f135`
  (sparing accent), coral `#ff6b4a` (sparing accent)
- **Type:** Archivo Black (display/headers), Inter (body/UI), IBM Plex Mono
  (all numeric data — calories, macros, prices-of-food-as-fuel)

## Folder structure

```
src/
  api/client.js        fetch wrapper — every network call goes through here
  components/          Navbar, StatCard, CalorieRing, GoogleButton
  pages/                Landing, Login, VerifyEmail, Dashboard, FoodLog,
                        FoodSearch, Profile  (each with its own .css)
  styles/
    theme.css           design tokens (colors, type, spacing)
    components.css      shared component styles (buttons, forms, label-panel)
  App.jsx               routes
```

## Integrating into the team's app

1. Copy `src/` into your project's `src/` (merge, don't overwrite anything
   teammates have already built).
2. Install routing:
   ```
   npm install react-router-dom
   ```
3. In `index.html`, add these to `<head>` for the fonts (with `preconnect`
   so they don't block first render — matters for the Lighthouse
   performance score):
   ```html
   <link rel="preconnect" href="https://fonts.googleapis.com" />
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
   <link
     href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;700&display=swap"
     rel="stylesheet"
   />
   <meta name="viewport" content="width=device-width, initial-scale=1" />
   ```
4. Set the API base URL in a `.env` file (Vite):
   ```
   VITE_API_BASE_URL=http://localhost:5000/api
   ```
5. Render `<App />` from `main.jsx`.

## Status check against the actual backend repo (codingcassandra/MERN-stack)

As of the last check, the backend has `server.js`, MongoDB connection, and
three Mongoose models, but the auth controller/routes, Google OAuth config,
and email sender are still empty stub files — nothing to hit yet. Confirmed
field names already reflected in this frontend:

- `User`: `firstName`, `lastName` (not a single `name`), `email`, `password`,
  `isVerified`, `verificationToken`, `googleId`
- `Meal`: `name`, `calories`, `protein`, `carbs`, `fats` (plural — not `fat`),
  `ingredients[]`, `image`

**Open questions to settle with the team before wiring this up for real:**

1. There's also a `Workout` model (exercises, duration, `caloriesBurned`).
   If workout tracking is actually in scope, this frontend doesn't have
   those screens yet — worth confirming before the demo.
2. No third-party nutrition API is integrated yet — `Meal` currently looks
   like it'll just be your own MongoDB collection. The project requires a
   real third-party integration, so decide whether `/api/foods/search`
   proxies something like USDA FoodData Central / Nutritionix, or if a
   different third-party API covers that requirement instead.
3. No user-goals/profile model exists yet for the calorie/macro targets the
   Profile page edits — someone needs to add that field (either on `User`
   or a separate `Goals` collection).
4. Since routes aren't written yet, the exact paths below are a proposal,
   not a confirmed contract — agree on them with whoever's building
   `authRoutes.js` / `workoutRoutes.js` before both sides drift further.

## What the backend needs to expose

`src/api/client.js` calls these routes — check them off with whoever owns
Express/Mongo:

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/auth/signup` | create account, send verification email |
| POST | `/api/auth/login` | email/password login |
| POST | `/api/auth/logout` | clear session |
| GET | `/api/auth/google` | Passport Google OAuth entry point |
| POST | `/api/auth/verify-email/:token` | confirm email from link |
| POST | `/api/auth/resend-verification` | resend the email |
| GET | `/api/dashboard?date=` | today's totals |
| GET | `/api/food-log?date=` | logged entries |
| POST | `/api/food-log` | add entry |
| DELETE | `/api/food-log/:id` | remove entry |
| GET | `/api/foods/search?q=` | proxy to the third-party nutrition API |
| GET/PUT | `/api/profile` | get/update goals & account info |

All pages currently fall back to demo data if a call fails, so the UI stays
reviewable/demoable even before the backend routes exist — remove the
fallback data once real endpoints are live.

## Auth/email verification flow (front-end side)

- **Google OAuth:** `GoogleButton` is a plain link to `GET /api/auth/google`
  — the backend (Passport.js) owns the actual OAuth handshake and redirects
  back with a session cookie or JWT.
- **Email verification:** after signup, `Login.jsx` shows a "check your
  inbox" screen instead of logging the user in. The link in that email
  should point at `/verify-email/:token`, which `VerifyEmail.jsx` handles by
  calling `POST /api/auth/verify-email/:token`.

## Accessibility / Lighthouse notes already baked in

- Visible focus rings on all interactive elements (not suppressed)
- `prefers-reduced-motion` respected globally
- Form inputs all have associated `<label>`s
- Images/icons marked `aria-hidden` where decorative; SVG progress ring has
  a descriptive `aria-label`
- Semantic landmarks (`<header>`, `<main>`, `<nav>`, `<footer>`)
- Color contrast checked against the ink/paper/green palette (no light-gray-
  on-white body text)

Still worth doing before presenting: run Lighthouse against the deployed
build (not `npm start` dev mode — dev builds are unminified and will tank
the Performance score), compress/lazy-load any real food images you add, and
confirm the font `display=swap` is in place so text doesn't block render.
