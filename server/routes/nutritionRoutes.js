// routes/nutritionRoutes.js
const express = require("express");
const router = express.Router();
const { getNutritionData } = require("../controllers/nutritionController");

// Map the GET request to our new controller
router.get("/", getNutritionData);

module.exports = router;
