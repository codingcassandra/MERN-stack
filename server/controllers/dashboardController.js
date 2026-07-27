const Meal = require("../models/Meal");
const Workout = require("../models/Workout");
const { getMuscleGroupBonuses } = require("../utils/muscleNutrition");

const dayRange = (dateParam) => {
  const day = dateParam && dateParam !== "today" ? new Date(dateParam) : new Date();
  const start = new Date(day.getFullYear(), day.getMonth(), day.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
};

// @desc    Aggregate today's (or a given day's) meals + workouts into
//          dashboard totals, bumping protein/carb goals based on what
//          muscle groups were trained today.
// @route   GET /api/dashboard?date=today
const getDashboard = async (req, res) => {
  try {
    const { start, end } = dayRange(req.query.date);

    const [meals, workouts] = await Promise.all([
      Meal.find({ user: req.user._id, createdAt: { $gte: start, $lt: end } }).sort({ createdAt: 1 }),
      Workout.find({ user: req.user._id, workoutDate: { $gte: start, $lt: end } }),
    ]);

    const totals = meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.calories,
        protein: acc.protein + meal.protein,
        carbs: acc.carbs + meal.carbs,
        fats: acc.fats + meal.fats,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );

    const muscleRecommendations = getMuscleGroupBonuses(workouts);
    const totalProteinBonus = muscleRecommendations.reduce((sum, m) => sum + m.proteinBonus, 0);
    const totalCarbsBonus = muscleRecommendations.reduce((sum, m) => sum + m.carbsBonus, 0);

    // Protein/carbs eaten above the base goal count toward paying down the
    // workout bonus pool; whatever's left is split back across muscle
    // groups proportional to their share of the bonus (so multi-group
    // sessions don't each get credited the full surplus independently).
    const proteinSurplus = Math.max(totals.protein - req.user.proteinGoal, 0);
    const carbsSurplus = Math.max(totals.carbs - req.user.carbGoal, 0);
    const proteinBonusRemaining = Math.max(totalProteinBonus - proteinSurplus, 0);
    const carbsBonusRemaining = Math.max(totalCarbsBonus - carbsSurplus, 0);

    res.status(200).json({
      calories: { consumed: totals.calories, goal: req.user.calorieGoal },
      protein: { value: totals.protein, goal: req.user.proteinGoal + totalProteinBonus },
      carbs: { value: totals.carbs, goal: req.user.carbGoal + totalCarbsBonus },
      fats: { value: totals.fats, goal: req.user.fatGoal },
      meals: meals.map((meal) => ({
        name: meal.name,
        calories: meal.calories,
        time: meal.createdAt.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }),
      })),
      muscleRecommendations: muscleRecommendations.map((m) => ({
        muscleGroup: m.muscleGroup,
        setsLogged: m.setsLogged,
        proteinRemaining: Math.round(proteinBonusRemaining * (m.proteinBonus / totalProteinBonus)),
        carbsRemaining: Math.round(carbsBonusRemaining * (m.carbsBonus / totalCarbsBonus)),
      })),
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = { getDashboard };
