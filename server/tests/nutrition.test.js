process.env.JWT_SECRET = "test-secret";
process.env.CLIENT_URL = "http://localhost:3000";
process.env.GOOGLE_CLIENT_ID = "test-client-id";
process.env.GOOGLE_CLIENT_SECRET = "test-client-secret";
process.env.GOOGLE_CALLBACK_URL = "http://localhost:5001/api/auth/google/callback";
process.env.SPOONACULAR_API_KEY = "test-spoonacular-key";

jest.mock("../config/db");

const request = require("supertest");
const app = require("../server");

const jsonResponse = (body, ok = true) => ({
  ok,
  json: () => Promise.resolve(body),
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("GET /api/nutrition", () => {
  it("rejects a request with no query", async () => {
    const res = await request(app).get("/api/nutrition");
    expect(res.status).toBe(400);
  });

  it("returns macros for every matching ingredient", async () => {
    global.fetch = jest.fn((url) => {
      if (url.includes("/food/ingredients/search")) {
        return Promise.resolve(
          jsonResponse({
            results: [
              { id: 1, name: "chicken breast" },
              { id: 2, name: "chicken thigh" },
            ],
          })
        );
      }

      const id = url.match(/ingredients\/(\d+)\/information/)[1];
      const byId = {
        1: {
          name: "chicken breast",
          nutrition: {
            nutrients: [
              { name: "Calories", amount: 165 },
              { name: "Protein", amount: 31 },
              { name: "Carbohydrates", amount: 0 },
              { name: "Fat", amount: 3.6 },
            ],
          },
        },
        2: {
          name: "chicken thigh",
          nutrition: {
            nutrients: [
              { name: "Calories", amount: 209 },
              { name: "Protein", amount: 26 },
              { name: "Carbohydrates", amount: 0 },
              { name: "Fat", amount: 10.9 },
            ],
          },
        },
      };
      return Promise.resolve(jsonResponse(byId[id]));
    });

    const res = await request(app).get("/api/nutrition?query=chicken");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toMatchObject({ id: "1", name: "Chicken breast", calories: 165, protein: 31 });
    expect(res.body[1]).toMatchObject({ id: "2", name: "Chicken thigh", calories: 209, protein: 26 });
  });

  it("surfaces a clear error when Spoonacular rejects the request", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve(jsonResponse({ message: "You are not authorized." }, false))
    );

    const res = await request(app).get("/api/nutrition?query=chicken");

    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/not authorized/i);
  });

  it("fails clearly when the API key isn't configured", async () => {
    const original = process.env.SPOONACULAR_API_KEY;
    delete process.env.SPOONACULAR_API_KEY;

    const res = await request(app).get("/api/nutrition?query=chicken");

    expect(res.status).toBe(500);
    expect(res.body.message).toMatch(/not configured/i);

    process.env.SPOONACULAR_API_KEY = original;
  });
});
