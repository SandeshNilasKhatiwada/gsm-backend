import request from "supertest";
import app from "../src/app.js";
import { prisma } from "./setup.js";
import { testUsers, createTestUser, loginAndGetToken } from "./helpers.js";

describe("User API", () => {
  let testRequest;
  let adminToken;
  let userToken;
  let adminUser;
  let regularUser;

  beforeAll(async () => {
    testRequest = request(app);
  });

  beforeEach(async () => {
    adminUser = await createTestUser(testUsers.admin, true);
    regularUser = await createTestUser(testUsers.customer);

    adminToken = await loginAndGetToken(
      testRequest,
      testUsers.admin.email,
      testUsers.admin.password,
    );
    userToken = await loginAndGetToken(
      testRequest,
      testUsers.customer.email,
      testUsers.customer.password,
    );
  });

  describe("GET /api/users", () => {
    it("should get all users with admin token", async () => {
      const response = await testRequest
        .get("/api/users")
        .set("Cookie", `token=${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("should support pagination", async () => {
      const response = await testRequest
        .get("/api/users?page=1&limit=10")
        .set("Cookie", `token=${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    });
  });

  describe("GET /api/users/:id", () => {
    it("should get user by id", async () => {
      const response = await testRequest
        .get(`/api/users/${regularUser.id}`)
        .set("Cookie", `token=${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(regularUser.id);
    });

    it("should return 404 for non-existent user", async () => {
      const response = await testRequest
        .get("/api/users/00000000-0000-0000-0000-000000000000")
        .set("Cookie", `token=${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe("PUT /api/users/:id", () => {
    it("should update user successfully", async () => {
      const response = await testRequest
        .put(`/api/users/${regularUser.id}`)
        .set("Cookie", `token=${userToken}`)
        .send({
          firstName: "Updated",
          lastName: "Name",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.firstName).toBe("Updated");
    });
  });

  describe("DELETE /api/users/:id", () => {
    it("should delete user successfully", async () => {
      const response = await testRequest
        .delete(`/api/users/${regularUser.id}`)
        .set("Cookie", `token=${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("POST /api/users/:id/verify", () => {
    it("should verify user successfully", async () => {
      const response = await testRequest
        .post(`/api/users/${regularUser.id}/verify`)
        .set("Cookie", `token=${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("POST /api/users/:id/block", () => {
    it("should block user successfully", async () => {
      const response = await testRequest
        .post(`/api/users/${regularUser.id}/block`)
        .set("Cookie", `token=${adminToken}`)
        .send({
          reason: "Violation of terms",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.isBlocked).toBe(true);
    });
  });

  describe("POST /api/users/:id/unblock", () => {
    it("should unblock user successfully", async () => {
      await testRequest
        .post(`/api/users/${regularUser.id}/block`)
        .set("Cookie", `token=${adminToken}`)
        .send({ reason: "Test" });

      const response = await testRequest
        .post(`/api/users/${regularUser.id}/unblock`)
        .set("Cookie", `token=${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.isBlocked).toBe(false);
    });
  });

  describe("POST /api/users/:id/warn", () => {
    it("should warn user successfully", async () => {
      const response = await testRequest
        .post(`/api/users/${regularUser.id}/warn`)
        .set("Cookie", `token=${adminToken}`)
        .send({
          reason: "Inappropriate behavior",
          severity: "medium",
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });
  });
});
