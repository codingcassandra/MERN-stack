process.env.JWT_SECRET = "test-secret";
process.env.CLIENT_URL = "http://localhost:3000";
process.env.GOOGLE_CLIENT_ID = "test-client-id";
process.env.GOOGLE_CLIENT_SECRET = "test-client-secret";
process.env.GOOGLE_CALLBACK_URL = "http://localhost:5001/api/auth/google/callback";

jest.mock("../models/Workout");
jest.mock("../models/User");
jest.mock("../config/db");

const request = require("supertest");
const jwt = require("jsonwebtoken");
const Workout = require("../models/Workout");
const User = require("../models/User");
const app = require("../server");

const userId = "507f1f77bcf86cd799439011";
const otherUserId = "507f1f77bcf86cd799439099";
const authHeader = `Bearer ${jwt.sign({ id: userId }, process.env.JWT_SECRET)}`;

const baseWorkout = {
  _id: "60d5ec49f1b2c8b1f8e4b1a3",
  user: userId,
  workoutType: "Leg Day",
  exercises: [{ name: "Squat", muscleGroup: "legs", sets: 4, reps: 8, weight: 135 }],
  duration: 45,
  caloriesBurned: 300,
  workoutDate: new Date("2026-01-01T12:00:00Z"),
};

beforeEach(() => {
  User.findById.mockReturnValue({
    select: jest.fn().mockResolvedValue({ _id: userId, email: "jane@example.com" }),
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("GET /api/workouts", () => {
  it("rejects requests with no token", async () => {
    const res = await request(app).get("/api/workouts");
    expect(res.status).toBe(401);
  });

  it("returns only the authenticated user's workouts", async () => {
    Workout.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([baseWorkout]) });

    const res = await request(app).get("/api/workouts").set("Authorization", authHeader);

    expect(res.status).toBe(200);
    expect(Workout.find).toHaveBeenCalledWith({ user: userId });
    expect(res.body[0].workoutType).toBe("Leg Day");
    expect(res.body[0].exercises[0].muscleGroup).toBe("legs");
  });
});

describe("POST /api/workouts", () => {
  it("creates a workout owned by the authenticated user", async () => {
    Workout.create.mockResolvedValue(baseWorkout);

    const res = await request(app)
      .post("/api/workouts")
      .set("Authorization", authHeader)
      .send({
        workoutType: "Leg Day",
        exercises: [{ name: "Squat", muscleGroup: "legs", sets: 4, reps: 8, weight: 135 }],
        duration: 45,
        caloriesBurned: 300,
      });

    expect(res.status).toBe(201);
    expect(Workout.create).toHaveBeenCalledWith(expect.objectContaining({ user: userId }));
    expect(res.body.workoutType).toBe("Leg Day");
  });
});

describe("PUT /api/workouts/:id", () => {
  it("updates a workout the user owns", async () => {
    Workout.findById.mockResolvedValue({ ...baseWorkout, user: { toString: () => userId } });
    Workout.findByIdAndUpdate.mockResolvedValue({ ...baseWorkout, duration: 60 });

    const res = await request(app)
      .put(`/api/workouts/${baseWorkout._id}`)
      .set("Authorization", authHeader)
      .send({ duration: 60 });

    expect(res.status).toBe(200);
    expect(res.body.duration).toBe(60);
  });

  it("rejects updating another user's workout", async () => {
    Workout.findById.mockResolvedValue({ ...baseWorkout, user: { toString: () => otherUserId } });

    const res = await request(app)
      .put(`/api/workouts/${baseWorkout._id}`)
      .set("Authorization", authHeader)
      .send({ duration: 60 });

    expect(res.status).toBe(403);
  });
});

describe("DELETE /api/workouts/:id", () => {
  it("deletes a workout the user owns", async () => {
    const deleteOne = jest.fn().mockResolvedValue(true);
    Workout.findById.mockResolvedValue({ ...baseWorkout, user: { toString: () => userId }, deleteOne });

    const res = await request(app)
      .delete(`/api/workouts/${baseWorkout._id}`)
      .set("Authorization", authHeader);

    expect(res.status).toBe(200);
    expect(deleteOne).toHaveBeenCalled();
  });

  it("rejects deleting another user's workout", async () => {
    Workout.findById.mockResolvedValue({ ...baseWorkout, user: { toString: () => otherUserId } });

    const res = await request(app)
      .delete(`/api/workouts/${baseWorkout._id}`)
      .set("Authorization", authHeader);

    expect(res.status).toBe(403);
  });
});
