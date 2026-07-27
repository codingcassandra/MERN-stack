require("dotenv").config();

const express = require("express");
const cors = require("cors");
const passport = require("passport");
const connectDB = require("./config/db");
const mealRoutes = require("./routes/mealRoutes");
const nutritionRoutes = require("./routes/nutritionRoutes");
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const profileRoutes = require("./routes/profileRoutes");
require("./config/passport");

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(passport.initialize());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "NutriTrack API is running!"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/nutrition", nutritionRoutes);
app.use("/api/foods/search", nutritionRoutes);
app.use("/api/meals", mealRoutes);
app.use("/api/food-log", mealRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/profile", profileRoutes);

// Runs on every cold start (serverless) and once at boot (local/traditional hosting).
connectDB();

if (require.main === module) {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

module.exports = app;
