const express = require("express");
const router = express.Router();

// Import the controller functions
const {
  getMeals,
  createMeal,
  updateMeal,
  deleteMeal,
} = require("../controllers/mealController");

// TOMORROW: Import Cassandra's auth middleware once it's done
// const auth = require("../middleware/auth");

// Map routes to controllers
router.route("/").get(getMeals).post(createMeal);
router.route("/:id").put(updateMeal).delete(deleteMeal);

/* 
  TOMORROW'S UPDATE: 
  Just drop the auth middleware into the chain to protect the routes!
  router.route("/").get(auth, getMeals).post(auth, createMeal);
  router.route("/:id").put(auth, updateMeal).delete(auth, deleteMeal);
*/

module.exports = router;
