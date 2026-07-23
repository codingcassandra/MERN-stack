require("dotenv").config();

const express = require("express");
const cors = require("cors");
const passport = require("passport");
const connectDB = require("./config/db");
require("./config/passport");

const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
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

module.exports = app;
