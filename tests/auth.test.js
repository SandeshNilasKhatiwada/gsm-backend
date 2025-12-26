import request from "supertest";
import app from "../src/app.js";
import { prisma } from "./setup.js";
import { testUsers, createTestUser, loginAndGetToken } from "./helpers.js";

describe("Auth API", () => {
  let testRequest;

  beforeAll(() => {
    testRequest = request(app);
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      const response = await testRequest.post("/api/auth/register").send({
        email: "newuser@test.com",
        username: "newuser",
        password: "Password123!",
        confirmPassword: "Password123!",
        firstName: "New",
        lastName: "User",
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe("newuser@test.com");
      expect(response.headers["set-cookie"]).toBeDefined();
    });

    it("should fail with duplicate email", async () => {
      const user = await createTestUser(testUsers.admin);

      const response = await testRequest.post("/api/auth/register").send({
        email: user.email,
        username: "differentuser",
        password: "Password123!",
        confirmPassword: "Password123!",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should fail with password mismatch", async () => {
      const response = await testRequest.post("/api/auth/register").send({
        email: "test@test.com",
        username: "testuser",
        password: "Password123!",
        confirmPassword: "Different123!",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      await createTestUser(testUsers.customer);
    });

    it("should login successfully with correct credentials", async () => {
      const response = await testRequest.post("/api/auth/login").send({
        email: testUsers.customer.email,
        password: testUsers.customer.password,
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(testUsers.customer.email);
      expect(response.headers["set-cookie"]).toBeDefined();
    });

    it("should fail with incorrect password", async () => {
      const response = await testRequest.post("/api/auth/login").send({
        email: testUsers.customer.email,
        password: "wrongpassword",
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should fail with non-existent email", async () => {
      const response = await testRequest.post("/api/auth/login").send({
        email: "nonexistent@test.com",
        password: "Password123!",
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/auth/profile", () => {
    let token;

    beforeEach(async () => {
      await createTestUser(testUsers.customer);
      token = await loginAndGetToken(
        testRequest,
        testUsers.customer.email,
        testUsers.customer.password,
      );
    });

    it("should get user profile with valid token", async () => {
      const response = await testRequest
        .get("/api/auth/profile")
        .set("Cookie", `token=${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(testUsers.customer.email);
    });

    it("should fail without token", async () => {
      const response = await testRequest.get("/api/auth/profile");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe("PUT /api/auth/change-password", () => {
    let token;

    beforeEach(async () => {
      await createTestUser(testUsers.customer);
      token = await loginAndGetToken(
        testRequest,
        testUsers.customer.email,
        testUsers.customer.password,
      );
    });

    it("should change password successfully", async () => {
      const response = await testRequest
        .put("/api/auth/change-password")
        .set("Cookie", `token=${token}`)
        .send({
          currentPassword: testUsers.customer.password,
          newPassword: "NewPassword123!",
          confirmPassword: "NewPassword123!",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it("should fail with wrong current password", async () => {
      const response = await testRequest
        .put("/api/auth/change-password")
        .set("Cookie", `token=${token}`)
        .send({
          currentPassword: "WrongPassword123!",
          newPassword: "NewPassword123!",
          confirmPassword: "NewPassword123!",
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/auth/logout", () => {
    let token;

    beforeEach(async () => {
      await createTestUser(testUsers.customer);
      token = await loginAndGetToken(
        testRequest,
        testUsers.customer.email,
        testUsers.customer.password,
      );
    });

    it("should logout successfully", async () => {
      const response = await testRequest
        .post("/api/auth/logout")
        .set("Cookie", `token=${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
