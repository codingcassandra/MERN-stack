const Workout = require("../models/Workout");

const formatWorkout = (workout) => ({
  id: workout._id.toString(),
  _id: workout._id,
  workoutType: workout.workoutType,
  exercises: workout.exercises,
  duration: workout.duration,
  caloriesBurned: workout.caloriesBurned,
  workoutDate: workout.workoutDate,
});

// @desc    Get all logged workouts for the authenticated user
// @route   GET /api/workouts
const getWorkouts = async (req, res) => {
  try {
    const workouts = await Workout.find({ user: req.user._id }).sort({ workoutDate: -1 });
    res.status(200).json(workouts.map(formatWorkout));
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Log a new workout for the authenticated user
// @route   POST /api/workouts
const createWorkout = async (req, res) => {
  try {
    const { workoutType, exercises, duration, caloriesBurned, workoutDate } = req.body;

    const newWorkout = await Workout.create({
      user: req.user._id,
      workoutType,
      exercises,
      duration,
      caloriesBurned,
      workoutDate,
    });

    res.status(201).json(formatWorkout(newWorkout));
  } catch (error) {
    res.status(400).json({ message: "Failed to create workout", error: error.message });
  }
};

// @desc    Update a logged workout (only the owner may update it)
// @route   PUT /api/workouts/:id
const updateWorkout = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }

    if (workout.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to modify this workout" });
    }

    const updatedWorkout = await Workout.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(formatWorkout(updatedWorkout));
  } catch (error) {
    res.status(400).json({ message: "Failed to update workout", error: error.message });
  }
};

// @desc    Delete a logged workout (only the owner may delete it)
// @route   DELETE /api/workouts/:id
const deleteWorkout = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }

    if (workout.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to modify this workout" });
    }

    await workout.deleteOne();
    res.status(200).json({ message: "Workout deleted successfully", id: req.params.id });
  } catch (error) {
    res.status(400).json({ message: "Failed to delete workout", error: error.message });
  }
};

module.exports = {
  getWorkouts,
  createWorkout,
  updateWorkout,
  deleteWorkout,
  formatWorkout,
};
