// controllers/nutritionController.js

// @desc    Get nutritional data for a specific food item
// @route   GET /api/nutrition?query=foodName
const getNutritionData = async (req, res) => {
  try {
    // 1. Grab the food item from the URL query string (e.g., ?query=chicken)
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Please provide a food query" });
    }

    // 2. Securely access your secret API key from the .env file
    const apiKey = process.env.SPOONACULAR_API_KEY;

    // 3. Make the request to the Spoonacular API 
    // (Using the guessNutrition endpoint as an example)
    const url = `https://api.spoonacular.com/recipes/guessNutrition?title=${query}&apiKey=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch from Spoonacular API");
    }

    // 4. Send the data back to your frontend
    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = { getNutritionData };
