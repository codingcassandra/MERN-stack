const mongoose = require("mongoose");

const mealSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    calories: {
      type: Number,
      required: true,
    },

    protein: {
      type: Number,
      required: true,
    },

    carbs: {
      type: Number,
      required: true,
    },

    fats: {
      type: Number,
      required: true,
    },

    ingredients: [
      String
    ],

    image: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Meal", mealSchema);