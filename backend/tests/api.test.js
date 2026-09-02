import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../server.js";

describe("Health check", () => {
  test("GET /api/health returns 200 and status ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});

describe("Security headers (helmet)", () => {
  test("responses include hardened security headers", async () => {
    const res = await request(app).get("/api/health");
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["x-powered-by"]).toBeUndefined();
  });
});

describe("404 handling", () => {
  test("unknown route returns 404 with a helpful message", async () => {
    const res = await request(app).get("/api/this-route-does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/Route not found/);
  });
});

describe("POST /api/auth/register — input validation (FR1)", () => {
  test("rejects a request missing required fields", async () => {
    const res = await request(app).post("/api/auth/register").send({ name: "Ada" });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/required/i);
  });

  test("rejects an invalid role", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Ada",
      phone: "08030000000",
      password: "secret123",
      role: "admin",
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/role/i);
  });

  test("rejects an invalid Nigerian phone number", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Ada",
      phone: "12345",
      password: "secret123",
      role: "homeowner",
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/phone/i);
  });

  test("rejects a weak password", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Ada",
      phone: "08031234567",
      password: "short",
      role: "homeowner",
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/password/i);
  });

  test("rejects a NoSQL-injection-style phone field", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Ada", phone: { $gt: "" }, password: "secret123", role: "homeowner" });
    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/login — input validation (FR2)", () => {
  test("rejects a request missing credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({});
    expect(res.status).toBe(400);
  });
});

describe("Auth middleware (Section 3.18)", () => {
  test("protected route rejects a request with no token", async () => {
    const res = await request(app).get("/api/users/me");
    expect(res.status).toBe(401);
  });

  test("protected route rejects a malformed/invalid token", async () => {
    const res = await request(app)
      .get("/api/users/me")
      .set("Authorization", "Bearer not-a-real-token");
    expect(res.status).toBe(401);
  });

  test("protected route rejects a token signed with the wrong secret", async () => {
    const forged = jwt.sign({ id: "507f1f77bcf86cd799439011", role: "homeowner" }, "wrong-secret");
    const res = await request(app).get("/api/users/me").set("Authorization", `Bearer ${forged}`);
    expect(res.status).toBe(401);
  });

  test("protected route rejects a token signed with alg 'none'", async () => {
    const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
    const payload = Buffer.from(JSON.stringify({ id: "x", role: "homeowner" })).toString("base64url");
    const noneToken = `${header}.${payload}.`;
    const res = await request(app).get("/api/users/me").set("Authorization", `Bearer ${noneToken}`);
    expect(res.status).toBe(401);
  });

  test("role-restricted route rejects a request with no token before checking role", async () => {
    const res = await request(app).post("/api/jobs").send({ description: "test" });
    expect(res.status).toBe(401);
  });
});

describe("Role enforcement (Section 3.18, requireRole)", () => {
  function tokenFor(role) {
    return jwt.sign({ id: "507f1f77bcf86cd799439011", role }, process.env.JWT_SECRET, {
      algorithm: "HS256",
      issuer: "local-services-api",
      expiresIn: "1h",
    });
  }

  test("a homeowner token is rejected on a provider-only route", async () => {
    const res = await request(app)
      .put("/api/providers/me")
      .set("Authorization", `Bearer ${tokenFor("homeowner")}`)
      .send({ bio: "test" });
    expect(res.status).toBe(403);
  });

  test("a provider token is rejected on a homeowner-only route (create job)", async () => {
    const res = await request(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${tokenFor("provider")}`)
      .send({ categoryId: "x", areaId: "y", description: "leak" });
    expect(res.status).toBe(403);
  });
});

describe("ObjectId route param validation", () => {
  function tokenFor(role) {
    return jwt.sign({ id: "507f1f77bcf86cd799439011", role }, process.env.JWT_SECRET, {
      algorithm: "HS256",
      issuer: "local-services-api",
      expiresIn: "1h",
    });
  }

  test("a malformed job id is rejected with 400 rather than reaching the database", async () => {
    const res = await request(app)
      .get("/api/jobs/not-a-valid-id")
      .set("Authorization", `Bearer ${tokenFor("provider")}`);
    expect(res.status).toBe(400);
  });
});
