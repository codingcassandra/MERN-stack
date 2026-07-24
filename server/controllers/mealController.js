const Meal = require("../models/Meal");

// @desc    Get all logged meals for a user
// @route   GET /api/meals
const getMeals = async (req, res) => {
  try {
    // TOMORROW: Swap this to use the authenticated user's ID
    // const meals = await Meal.find({ user: req.user.id });
    
    const dummyUserId = "60d5ec49f1b2c8b1f8e4b1a2"; 
    const meals = await Meal.find({ user: dummyUserId });
    
    res.status(200).json(meals);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Log a new meal
// @route   POST /api/meals
const createMeal = async (req, res) => {
  try {
    // Destructuring all the fields required by your Meal schema
    const { name, calories, protein, carbs, fats, ingredients, image } = req.body;

    // TOMORROW: Swap dummyUserId for req.user.id
    const dummyUserId = "60d5ec49f1b2c8b1f8e4b1a2"; 

    const newMeal = await Meal.create({
      user: dummyUserId,
      name,
      calories,
      protein,
      carbs,
      fats,
      ingredients,
      image
    });

    res.status(201).json(newMeal);
  } catch (error) {
    res.status(400).json({ message: "Failed to create meal", error: error.message });
  }
};

// @desc    Update a logged meal
// @route   PUT /api/meals/:id
const updateMeal = async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id);

    if (!meal) {
      return res.status(404).json({ message: "Meal not found" });
    }

    // TOMORROW: Add a check here to ensure req.user.id === meal.user.toString()
    // so users can't edit other people's meals!

    const updatedMeal = await Meal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // Returns the updated document
    );

    res.status(200).json(updatedMeal);
  } catch (error) {
    res.status(400).json({ message: "Failed to update meal", error: error.message });
  }
};

// @desc    Delete a logged meal
// @route   DELETE /api/meals/:id
const deleteMeal = async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id);

    if (!meal) {
      return res.status(404).json({ message: "Meal not found" });
    }

    // TOMORROW: Add a check here to ensure req.user.id === meal.user.toString()

    await meal.deleteOne();
    res.status(200).json({ message: "Meal deleted successfully", id: req.params.id });
  } catch (error) {
    res.status(400).json({ message: "Failed to delete meal", error: error.message });
  }
};

module.exports = {
  getMeals,
  createMeal,
  updateMeal,
  deleteMeal,
};
