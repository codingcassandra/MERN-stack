const Meal = require("../models/Meal");

const dayRange = (dateParam) => {
  const day = dateParam && dateParam !== "today" ? new Date(dateParam) : new Date();
  const start = new Date(day.getFullYear(), day.getMonth(), day.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
};

// @desc    Aggregate today's (or a given day's) meals into dashboard totals
// @route   GET /api/dashboard?date=today
const getDashboard = async (req, res) => {
  try {
    const { start, end } = dayRange(req.query.date);

    const meals = await Meal.find({
      user: req.user._id,
      createdAt: { $gte: start, $lt: end },
    }).sort({ createdAt: 1 });

    const totals = meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.calories,
        protein: acc.protein + meal.protein,
        carbs: acc.carbs + meal.carbs,
        fats: acc.fats + meal.fats,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );

    res.status(200).json({
      calories: { consumed: totals.calories, goal: req.user.calorieGoal },
      protein: { value: totals.protein, goal: req.user.proteinGoal },
      carbs: { value: totals.carbs, goal: req.user.carbGoal },
      fats: { value: totals.fats, goal: req.user.fatGoal },
      meals: meals.map((meal) => ({
        name: meal.name,
        calories: meal.calories,
        time: meal.createdAt.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }),
      })),
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = { getDashboard };
