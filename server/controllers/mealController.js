const Meal = require("../models/Meal");

// Shapes a Meal document for the frontend (adds `id` + a human-readable
// `time` alongside the raw Mongo fields, so both /api/meals consumers and
// the food-log UI can read the same response).
const formatMeal = (meal) => ({
  id: meal._id.toString(),
  _id: meal._id,
  name: meal.name,
  calories: meal.calories,
  protein: meal.protein,
  carbs: meal.carbs,
  fats: meal.fats,
  ingredients: meal.ingredients,
  image: meal.image,
  time: meal.createdAt?.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }),
  createdAt: meal.createdAt,
});

// @desc    Get all logged meals for the authenticated user
// @route   GET /api/meals
const getMeals = async (req, res) => {
  try {
    const meals = await Meal.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(meals.map(formatMeal));
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Log a new meal for the authenticated user
// @route   POST /api/meals
const createMeal = async (req, res) => {
  try {
    const { name, calories, protein, carbs, fats, ingredients, image } = req.body;

    const newMeal = await Meal.create({
      user: req.user._id,
      name,
      calories,
      protein,
      carbs,
      fats,
      ingredients,
      image,
    });

    res.status(201).json(formatMeal(newMeal));
  } catch (error) {
    res.status(400).json({ message: "Failed to create meal", error: error.message });
  }
};

// @desc    Update a logged meal (only the owner may update it)
// @route   PUT /api/meals/:id
const updateMeal = async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id);

    if (!meal) {
      return res.status(404).json({ message: "Meal not found" });
    }

    if (meal.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to modify this meal" });
    }

    const updatedMeal = await Meal.findByIdAndUpdate(req.params.id, req.body, { new: true });

    res.status(200).json(formatMeal(updatedMeal));
  } catch (error) {
    res.status(400).json({ message: "Failed to update meal", error: error.message });
  }
};

// @desc    Delete a logged meal (only the owner may delete it)
// @route   DELETE /api/meals/:id
const deleteMeal = async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id);

    if (!meal) {
      return res.status(404).json({ message: "Meal not found" });
    }

    if (meal.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to modify this meal" });
    }

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
  formatMeal,
};
