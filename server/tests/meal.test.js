const mongoose = require("mongoose");
const request = require("supertest");
require("dotenv").config();

// Import the app and database connection
const app = require("../server");
const connectDB = require("../config/db");
const Meal = require("../models/Meal");

let mealId; // This will store the ID of our test meal to use in PUT and DELETE

beforeAll(async () => {
  // Connect to the live database before running tests
  await connectDB();
});

afterAll(async () => {
  // Failsafe: Clean up the test meal directly from the DB just in case the DELETE test fails
  if (mealId) {
    await Meal.findByIdAndDelete(mealId);
  }
  // Close the connection so the terminal doesn't hang
  await mongoose.connection.close();
});

describe("Meal API Endpoints", () => {
  
  // --- 1. POST: Create a Meal ---
  it("should create a new meal", async () => {
    const res = await request(app).post("/api/meals").send({
      name: "Protein Shake",
      calories: 250,
      protein: 40,
      carbs: 10,
      fats: 5,
      ingredients: ["Milk", "Water", "Whey Protein"]
    });

    expect(res.statusCode).toEqual(201);
    expect(res.body.name).toEqual("Protein Shake");
    expect(res.body).toHaveProperty("_id");

    // Save the newly generated MongoDB _id for the upcoming tests
    mealId = res.body._id; 
  });

  // --- 2. GET: Read all Meals ---
  it("should fetch all meals", async () => {
    const res = await request(app).get("/api/meals");

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    // Since we just created a meal, the array should have at least 1 item
    expect(res.body.length).toBeGreaterThan(0); 
  });

  // --- 3. PUT: Update the Meal ---
  it("should update the logged meal", async () => {
    const res = await request(app).put(`/api/meals/${mealId}`).send({
      calories: 300, // Updating calories
      fats: 7        // Updating fats
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.calories).toEqual(300);
    expect(res.body.fats).toEqual(7);
  });

  // --- 4. DELETE: Remove the Meal ---
  it("should delete the logged meal", async () => {
    const res = await request(app).delete(`/api/meals/${mealId}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual("Meal deleted successfully");
    
    // Nullify the ID so the afterAll hook doesn't try to delete it again
    mealId = null; 
  });

});
