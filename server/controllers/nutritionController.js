// controllers/nutritionController.js

const RESULTS_LIMIT = 8;

const nutrientAmount = (nutrients, label) =>
  (nutrients || []).find((n) => (n.name || n.title) === label)?.amount ?? 0;

const titleCase = (name) => (name ? name[0].toUpperCase() + name.slice(1) : name);

// @desc    Search foods matching a query and return macros for each
// @route   GET /api/nutrition?query=foodName
const getNutritionData = async (req, res) => {
  try {
    const query = req.query.query || req.query.q;

    if (!query) {
      return res.status(400).json({ message: "Please provide a food query" });
    }

    const apiKey = process.env.SPOONACULAR_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ message: "Spoonacular API key is not configured" });
    }

    // 1. Search for ingredients matching the query (name + id only).
    const searchUrl = `https://api.spoonacular.com/food/ingredients/search?query=${encodeURIComponent(
      query
    )}&number=${RESULTS_LIMIT}&apiKey=${apiKey}`;

    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (!searchRes.ok) {
      throw new Error(searchData.message || "Failed to search Spoonacular");
    }

    // 2. Fetch macros for each match (100g basis) in parallel.
    const results = await Promise.all(
      (searchData.results || []).map(async (item) => {
        const infoUrl = `https://api.spoonacular.com/food/ingredients/${item.id}/information?amount=100&unit=grams&apiKey=${apiKey}`;
        const infoRes = await fetch(infoUrl);

        if (!infoRes.ok) {
          return null;
        }

        const info = await infoRes.json();
        const nutrients = info.nutrition?.nutrients;

        return {
          id: String(item.id),
          name: titleCase(info.name) || item.name,
          calories: Math.round(nutrientAmount(nutrients, "Calories")),
          protein: Math.round(nutrientAmount(nutrients, "Protein")),
          carbs: Math.round(nutrientAmount(nutrients, "Carbohydrates")),
          fats: Math.round(nutrientAmount(nutrients, "Fat")),
        };
      })
    );

    res.status(200).json(results.filter(Boolean));
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = { getNutritionData };
