process.env.JWT_SECRET = "test-secret";
process.env.CLIENT_URL = "http://localhost:3000";
process.env.GOOGLE_CLIENT_ID = "test-client-id";
process.env.GOOGLE_CLIENT_SECRET = "test-client-secret";
process.env.GOOGLE_CALLBACK_URL = "http://localhost:5001/api/auth/google/callback";

jest.mock("../models/User");
jest.mock("../utils/sendEmail");

const request = require("supertest");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const { sendVerificationEmail } = require("../utils/sendEmail");
const app = require("../server");

const baseUser = {
  _id: "507f1f77bcf86cd799439011",
  firstName: "Jane",
  lastName: "Doe",
  email: "jane@example.com",
};

afterEach(() => {
  jest.clearAllMocks();
});

describe("POST /api/auth/register", () => {
  it("creates an unverified user and sends a verification email", async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({ ...baseUser, isVerified: false });

    const res = await request(app).post("/api/auth/register").send({
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
      password: "password123",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(User.create).toHaveBeenCalledTimes(1);
    expect(sendVerificationEmail).toHaveBeenCalledTimes(1);
  });

  it("rejects a duplicate email", async () => {
    User.findOne.mockResolvedValue(baseUser);

    const res = await request(app).post("/api/auth/register").send({
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
      password: "password123",
    });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it("rejects a request missing required fields", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "jane@example.com",
    });

    expect(res.status).toBe(400);
    expect(User.findOne).not.toHaveBeenCalled();
  });
});

describe("POST /api/auth/login", () => {
  it("logs in a verified user with correct credentials", async () => {
    const hashedPassword = await bcrypt.hash("password123", 10);
    User.findOne.mockResolvedValue({ ...baseUser, password: hashedPassword, isVerified: true });

    const res = await request(app).post("/api/auth/login").send({
      email: "jane@example.com",
      password: "password123",
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.token).toBe("string");
  });

  it("rejects an incorrect password", async () => {
    const hashedPassword = await bcrypt.hash("password123", 10);
    User.findOne.mockResolvedValue({ ...baseUser, password: hashedPassword, isVerified: true });

    const res = await request(app).post("/api/auth/login").send({
      email: "jane@example.com",
      password: "wrong-password",
    });

    expect(res.status).toBe(401);
  });

  it("rejects login for an unverified account", async () => {
    const hashedPassword = await bcrypt.hash("password123", 10);
    User.findOne.mockResolvedValue({ ...baseUser, password: hashedPassword, isVerified: false });

    const res = await request(app).post("/api/auth/login").send({
      email: "jane@example.com",
      password: "password123",
    });

    expect(res.status).toBe(403);
  });
});

describe("GET /api/auth/verify-email/:token", () => {
  it("verifies a user with a valid token", async () => {
    const save = jest.fn().mockResolvedValue(true);
    User.findOne.mockResolvedValue({ ...baseUser, isVerified: false, save });

    const res = await request(app).get("/api/auth/verify-email/some-valid-token");

    expect(res.status).toBe(200);
    expect(save).toHaveBeenCalled();
  });

  it("rejects an invalid token", async () => {
    User.findOne.mockResolvedValue(null);

    const res = await request(app).get("/api/auth/verify-email/bad-token");

    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/resend-verification", () => {
  it("rejects a request with no email", async () => {
    const res = await request(app).post("/api/auth/resend-verification").send({});
    expect(res.status).toBe(400);
  });

  it("sends a new verification email for an unverified account", async () => {
    const save = jest.fn().mockResolvedValue(true);
    User.findOne.mockResolvedValue({ ...baseUser, isVerified: false, save });

    const res = await request(app)
      .post("/api/auth/resend-verification")
      .send({ email: "jane@example.com" });

    expect(res.status).toBe(200);
    expect(save).toHaveBeenCalled();
    expect(sendVerificationEmail).toHaveBeenCalledTimes(1);
  });

  it("does not resend for an already-verified account", async () => {
    User.findOne.mockResolvedValue({ ...baseUser, isVerified: true });

    const res = await request(app)
      .post("/api/auth/resend-verification")
      .send({ email: "jane@example.com" });

    expect(res.status).toBe(200);
    expect(sendVerificationEmail).not.toHaveBeenCalled();
  });

  it("responds successfully without leaking whether the email exists", async () => {
    User.findOne.mockResolvedValue(null);

    const res = await request(app)
      .post("/api/auth/resend-verification")
      .send({ email: "nobody@example.com" });

    expect(res.status).toBe(200);
    expect(sendVerificationEmail).not.toHaveBeenCalled();
  });
});

describe("GET /api/auth/me", () => {
  it("rejects requests with no token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("returns the current user for a valid token", async () => {
    const jwt = require("jsonwebtoken");
    const token = jwt.sign({ id: baseUser._id }, process.env.JWT_SECRET);

    User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(baseUser) });

    const res = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(baseUser.email);
  });
});
