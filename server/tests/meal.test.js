process.env.JWT_SECRET = "test-secret";
process.env.CLIENT_URL = "http://localhost:3000";
process.env.GOOGLE_CLIENT_ID = "test-client-id";
process.env.GOOGLE_CLIENT_SECRET = "test-client-secret";
process.env.GOOGLE_CALLBACK_URL = "http://localhost:5001/api/auth/google/callback";

jest.mock("../models/Meal");
jest.mock("../models/User");

const request = require("supertest");
const jwt = require("jsonwebtoken");
const Meal = require("../models/Meal");
const User = require("../models/User");
const app = require("../server");

const userId = "507f1f77bcf86cd799439011";
const otherUserId = "507f1f77bcf86cd799439099";
const authHeader = `Bearer ${jwt.sign({ id: userId }, process.env.JWT_SECRET)}`;

const baseMeal = {
  _id: "60d5ec49f1b2c8b1f8e4b1a2",
  user: userId,
  name: "Protein Shake",
  calories: 250,
  protein: 40,
  carbs: 10,
  fats: 5,
  ingredients: ["Milk", "Water", "Whey Protein"],
  createdAt: new Date("2026-01-01T12:00:00Z"),
};

beforeEach(() => {
  User.findById.mockReturnValue({
    select: jest.fn().mockResolvedValue({ _id: userId, email: "jane@example.com" }),
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/meals", () => {
  it("rejects requests with no token", async () => {
    const res = await request(app).get("/api/meals");
    expect(res.status).toBe(401);
  });

  it("returns only the authenticated user's meals", async () => {
    Meal.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([baseMeal]) });

    const res = await request(app).get("/api/meals").set("Authorization", authHeader);

    expect(res.status).toBe(200);
    expect(Meal.find).toHaveBeenCalledWith({ user: userId });
    expect(res.body[0].name).toBe("Protein Shake");
    expect(res.body[0].id).toBe(baseMeal._id);
  });
});

describe("POST /api/meals", () => {
  it("creates a meal owned by the authenticated user", async () => {
    Meal.create.mockResolvedValue(baseMeal);

    const res = await request(app)
      .post("/api/meals")
      .set("Authorization", authHeader)
      .send({
        name: "Protein Shake",
        calories: 250,
        protein: 40,
        carbs: 10,
        fats: 5,
        ingredients: ["Milk", "Water", "Whey Protein"],
      });

    expect(res.status).toBe(201);
    expect(Meal.create).toHaveBeenCalledWith(expect.objectContaining({ user: userId }));
    expect(res.body.name).toBe("Protein Shake");
    expect(res.body._id).toBe(baseMeal._id);
  });
});

describe("PUT /api/meals/:id", () => {
  it("updates a meal the user owns", async () => {
    Meal.findById.mockResolvedValue({ ...baseMeal, user: { toString: () => userId } });
    Meal.findByIdAndUpdate.mockResolvedValue({ ...baseMeal, calories: 300, fats: 7 });

    const res = await request(app)
      .put(`/api/meals/${baseMeal._id}`)
      .set("Authorization", authHeader)
      .send({ calories: 300, fats: 7 });

    expect(res.status).toBe(200);
    expect(res.body.calories).toBe(300);
    expect(res.body.fats).toBe(7);
  });

  it("rejects updating another user's meal", async () => {
    Meal.findById.mockResolvedValue({ ...baseMeal, user: { toString: () => otherUserId } });

    const res = await request(app)
      .put(`/api/meals/${baseMeal._id}`)
      .set("Authorization", authHeader)
      .send({ calories: 300 });

    expect(res.status).toBe(403);
  });

  it("returns 404 for a missing meal", async () => {
    Meal.findById.mockResolvedValue(null);

    const res = await request(app)
      .put("/api/meals/does-not-exist")
      .set("Authorization", authHeader)
      .send({ calories: 300 });

    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/meals/:id", () => {
  it("deletes a meal the user owns", async () => {
    const deleteOne = jest.fn().mockResolvedValue(true);
    Meal.findById.mockResolvedValue({ ...baseMeal, user: { toString: () => userId }, deleteOne });

    const res = await request(app)
      .delete(`/api/meals/${baseMeal._id}`)
      .set("Authorization", authHeader);

    expect(res.status).toBe(200);
    expect(deleteOne).toHaveBeenCalled();
  });

  it("rejects deleting another user's meal", async () => {
    Meal.findById.mockResolvedValue({ ...baseMeal, user: { toString: () => otherUserId } });

    const res = await request(app)
      .delete(`/api/meals/${baseMeal._id}`)
      .set("Authorization", authHeader);

    expect(res.status).toBe(403);
  });
});
