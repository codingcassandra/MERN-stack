const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected");
  } catch (error) {
    // Don't process.exit() here: on Vercel this kills the whole serverless
    // function mid-request, taking down unrelated routes with it.
    console.error("MongoDB Connection Error:", error.message);
  }
};

module.exports = connectDB;