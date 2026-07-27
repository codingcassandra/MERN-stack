const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      default: null,
    },

    firstName: {
      type: String,
      required: true,
    },

    lastName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      default: null,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationToken: {
      type: String,
      default: null,
    },

    calorieGoal: {
      type: Number,
      default: 2100,
    },

    proteinGoal: {
      type: Number,
      default: 140,
    },

    carbGoal: {
      type: Number,
      default: 230,
    },

    fatGoal: {
      type: Number,
      default: 70,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);