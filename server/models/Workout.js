const mongoose = require("mongoose");

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
        name: String,
        sets: Number,
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