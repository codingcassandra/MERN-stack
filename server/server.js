require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
// 1. IMPORT YOUR NEW MEAL ROUTES
const mealRoutes = require("./routes/mealRoutes");
const nutritionRoutes = require("./routes/nutritionRoutes");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use("/api/nutrition", nutritionRoutes);

// 2. MOUNT THE MEAL ROUTES MIDDLEWARE
app.use("/api/meals", mealRoutes);

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Workout Meal API is running!"
    });
});

const PORT = process.env.PORT || 5001;

// 3. WRAP THE LISTENER & EXPORT THE APP FOR JEST
// This ensures Jest can import the file for tests without locking up your port.
if (require.main === module) {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
}

module.exports = app;
