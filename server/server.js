require("dotenv").config();

const express = require("express");
const cors = require("cors");
const passport = require("passport");
const connectDB = require("./config/db");
// 1. IMPORT YOUR NEW MEAL ROUTES
const mealRoutes = require("./routes/mealRoutes");
const nutritionRoutes = require("./routes/nutritionRoutes");
require("./config/passport");

const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use("/api/nutrition", nutritionRoutes);
app.use("/api/foods/search", nutritionRoutes);

// 2. MOUNT THE MEAL ROUTES MIDDLEWARE
app.use("/api/meals", mealRoutes);
app.use("/api/food-log", mealRoutes);
app.use(passport.initialize());

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Workout Meal API is running!"
    });
});

app.use("/api/auth", authRoutes);

if (require.main === module) {
    connectDB();

    const PORT = process.env.PORT || 5001;

    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
}

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "NutriTrack API is running!"
  });
});

app.use("/api/auth", authRoutes);

// 3. WRAP THE LISTENER & EXPORT THE APP FOR JEST
if (require.main === module) {
  connectDB();
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

module.exports = app;
