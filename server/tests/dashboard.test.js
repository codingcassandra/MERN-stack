process.env.JWT_SECRET = "test-secret";
process.env.CLIENT_URL = "http://localhost:3000";
process.env.GOOGLE_CLIENT_ID = "test-client-id";
process.env.GOOGLE_CLIENT_SECRET = "test-client-secret";
process.env.GOOGLE_CALLBACK_URL = "http://localhost:5001/api/auth/google/callback";

jest.mock("../models/Meal");
jest.mock("../models/Workout");
jest.mock("../models/User");
jest.mock("../config/db");

const request = require("supertest");
const jwt = require("jsonwebtoken");
const Meal = require("../models/Meal");
const Workout = require("../models/Workout");
const User = require("../models/User");
const app = require("../server");

const userId = "507f1f77bcf86cd799439011";
const authHeader = `Bearer ${jwt.sign({ id: userId }, process.env.JWT_SECRET)}`;

const baseUser = {
  _id: userId,
  email: "jane@example.com",
  calorieGoal: 2100,
  proteinGoal: 140,
  carbGoal: 230,
  fatGoal: 70,
};

const mockDashboardData = (meals, workouts) => {
  Meal.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(meals) });
  Workout.find.mockResolvedValue(workouts);
};

beforeEach(() => {
  User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(baseUser) });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/dashboard", () => {
  it("rejects requests with no token", async () => {
    const res = await request(app).get("/api/dashboard");
    expect(res.status).toBe(401);
  });

  it("returns base goals with no recommendations when nothing was logged", async () => {
    mockDashboardData([], []);

    const res = await request(app).get("/api/dashboard").set("Authorization", authHeader);

    expect(res.status).toBe(200);
    expect(res.body.protein.goal).toBe(baseUser.proteinGoal);
    expect(res.body.carbs.goal).toBe(baseUser.carbGoal);
    expect(res.body.muscleRecommendations).toEqual([]);
  });

  it("bumps the protein/carb goal by the workout bonus and reports it per muscle group", async () => {
    mockDashboardData(
      [],
      [{ exercises: [{ muscleGroup: "legs", sets: 4 }] }] // 4 sets -> +12g protein, +8g carbs
    );

    const res = await request(app).get("/api/dashboard").set("Authorization", authHeader);

    expect(res.status).toBe(200);
    expect(res.body.protein.goal).toBe(baseUser.proteinGoal + 12);
    expect(res.body.carbs.goal).toBe(baseUser.carbGoal + 8);
    expect(res.body.muscleRecommendations).toEqual([
      { muscleGroup: "legs", setsLogged: 4, proteinRemaining: 12, carbsRemaining: 8 },
    ]);
  });

  it("reduces the remaining bonus once meals eaten today cover the base goal", async () => {
    mockDashboardData(
      [{ calories: 2200, protein: 150, carbs: 230, fats: 70, createdAt: new Date() }],
      [{ exercises: [{ muscleGroup: "legs", sets: 4 }] }] // bonus: +12g protein, +8g carbs
    );

    const res = await request(app).get("/api/dashboard").set("Authorization", authHeader);

    // 150g eaten vs. a 140g base goal = 10g surplus, which pays down the
    // 12g protein bonus, leaving 2g still recommended for legs.
    expect(res.body.muscleRecommendations[0].proteinRemaining).toBe(2);
    // 230g eaten exactly matches the 230g base carb goal, no surplus, so
    // the full 8g carb bonus is still recommended.
    expect(res.body.muscleRecommendations[0].carbsRemaining).toBe(8);
  });

  it("splits the remaining bonus proportionally across multiple trained muscle groups", async () => {
    mockDashboardData(
      [],
      [
        {
          exercises: [
            { muscleGroup: "chest", sets: 4 }, // +12g protein
            { muscleGroup: "arms", sets: 2 }, // +6g protein
          ],
        },
      ]
    );

    const res = await request(app).get("/api/dashboard").set("Authorization", authHeader);

    const byGroup = Object.fromEntries(
      res.body.muscleRecommendations.map((m) => [m.muscleGroup, m.proteinRemaining])
    );

    expect(byGroup.chest).toBe(12);
    expect(byGroup.arms).toBe(6);
  });
});
