const mongoose = require("mongoose");
const { MUSCLE_GROUPS } = require("../utils/muscleNutrition");

const workoutSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    workoutType: {
      type: String,
      required: true,
    },

    exercises: [
      {
        name: { type: String, required: true },
        muscleGroup: { type: String, enum: MUSCLE_GROUPS, required: true },
        sets: { type: Number, required: true },
        reps: Number,
        weight: Number,
      },
    ],

    duration: {
      type: Number,
      required: true,
    },

    caloriesBurned: {
      type: Number,
      default: 0,
    },

    workoutDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Workout", workoutSchema);
