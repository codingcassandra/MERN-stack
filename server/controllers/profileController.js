const User = require("../models/User");

const shapeProfile = (user) => ({
  name: `${user.firstName} ${user.lastName}`.trim(),
  email: user.email,
  emailVerified: user.isVerified,
  calorieGoal: user.calorieGoal,
  proteinGoal: user.proteinGoal,
  carbGoal: user.carbGoal,
  fatGoal: user.fatGoal,
});

// @desc    Get the authenticated user's profile + goals
// @route   GET /api/profile
const getProfile = async (req, res) => {
  res.status(200).json(shapeProfile(req.user));
};

// @desc    Update the authenticated user's name + daily goals
// @route   PUT /api/profile
const updateProfile = async (req, res) => {
  try {
    const { name, calorieGoal, proteinGoal, carbGoal, fatGoal } = req.body;
    const user = await User.findById(req.user._id);

    if (name?.trim()) {
      const [firstName, ...rest] = name.trim().split(" ");
      user.firstName = firstName;
      user.lastName = rest.join(" ") || user.lastName;
    }

    if (calorieGoal !== undefined) user.calorieGoal = calorieGoal;
    if (proteinGoal !== undefined) user.proteinGoal = proteinGoal;
    if (carbGoal !== undefined) user.carbGoal = carbGoal;
    if (fatGoal !== undefined) user.fatGoal = fatGoal;

    await user.save();

    res.status(200).json(shapeProfile(user));
  } catch (error) {
    res.status(400).json({ message: "Failed to update profile", error: error.message });
  }
};

module.exports = { getProfile, updateProfile };
