import request from "supertest";
import app from "../src/app.js";
import { prisma } from "./setup.js";
import {
  testUsers,
  createTestUser,
  createTestShop,
  loginAndGetToken,
} from "./helpers.js";

describe("Shop API", () => {
  let testRequest;
  let ownerToken;
  let adminToken;
  let ownerUser;
  let adminUser;
  let testShop;

  beforeAll(async () => {
    testRequest = request(app);
  });

  beforeEach(async () => {
    ownerUser = await createTestUser(testUsers.shopOwner);
    adminUser = await createTestUser(testUsers.admin);

    ownerToken = await loginAndGetToken(
      testRequest,
      testUsers.shopOwner.email,
      testUsers.shopOwner.password,
    );
    adminToken = await loginAndGetToken(
      testRequest,
      testUsers.admin.email,
      testUsers.admin.password,
    );

    testShop = await createTestShop(ownerUser.id);
  });

  describe("POST /api/shops", () => {
    it("should create shop successfully", async () => {
      const response = await testRequest
        .post("/api/shops")
        .set("Cookie", `token=${ownerToken}`)
        .send({
          name: "New Test Shop",
          description: "A new test shop",
          email: "shop@test.com",
          phone: "+1234567890",
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe("New Test Shop");
    });

    it("should fail with duplicate slug", async () => {
      const response = await testRequest
        .post("/api/shops")
        .set("Cookie", `token=${ownerToken}`)
        .send({
          name: "Test Shop", // Same as existing
          description: "Duplicate shop",
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/shops", () => {
    it("should get all shops", async () => {
      const response = await testRequest.get("/api/shops");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("should support filtering by verification status", async () => {
      const response = await testRequest.get(
        "/api/shops?verificationStatus=pending",
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("GET /api/shops/:id", () => {
    it("should get shop by id", async () => {
      const response = await testRequest.get(`/api/shops/${testShop.id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testShop.id);
    });
  });

  describe("PUT /api/shops/:id", () => {
    it("should update shop successfully", async () => {
      const response = await testRequest
        .put(`/api/shops/${testShop.id}`)
        .set("Cookie", `token=${ownerToken}`)
        .send({
          name: "Updated Shop Name",
          description: "Updated description",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe("Updated Shop Name");
    });
  });

  describe("DELETE /api/shops/:id", () => {
    it("should delete shop successfully", async () => {
      const response = await testRequest
        .delete(`/api/shops/${testShop.id}`)
        .set("Cookie", `token=${ownerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("POST /api/shops/:id/verify", () => {
    it("should verify shop successfully", async () => {
      const response = await testRequest
        .post(`/api/shops/${testShop.id}/verify`)
        .set("Cookie", `token=${adminToken}`)
        .send({
          status: "approved",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.verificationStatus).toBe("approved");
    });

    it("should reject shop with reason", async () => {
      const response = await testRequest
        .post(`/api/shops/${testShop.id}/verify`)
        .set("Cookie", `token=${adminToken}`)
        .send({
          status: "rejected",
          reason: "Incomplete documentation",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.verificationStatus).toBe("rejected");
    });
  });

  describe("POST /api/shops/:id/strike", () => {
    it("should issue strike successfully", async () => {
      const response = await testRequest
        .post(`/api/shops/${testShop.id}/strike`)
        .set("Cookie", `token=${adminToken}`)
        .send({
          reason: "Policy violation",
          severity: "minor",
          actionTaken: "warning",
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });
  });

  describe("POST /api/shops/:id/staff", () => {
    let staffUser;

    beforeEach(async () => {
      staffUser = await createTestUser({
        email: "staff@test.com",
        username: "staffuser",
        password: "Staff123!",
        firstName: "Staff",
        lastName: "User",
      });
    });

    it("should add staff successfully", async () => {
      const response = await testRequest
        .post(`/api/shops/${testShop.id}/staff`)
        .set("Cookie", `token=${ownerToken}`)
        .send({
          userId: staffUser.id,
          role: "editor",
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });
  });

  describe("DELETE /api/shops/:shopId/staff/:staffId", () => {
    let staffUser;
    let staffMember;

    beforeEach(async () => {
      staffUser = await createTestUser({
        email: "staff2@test.com",
        username: "staffuser2",
        password: "Staff123!",
        firstName: "Staff",
        lastName: "User",
      });

      staffMember = await prisma.shopStaff.create({
        data: {
          shopId: testShop.id,
          userId: staffUser.id,
          role: "viewer",
          addedBy: ownerUser.id,
        },
      });
    });

    it("should remove staff successfully", async () => {
      const response = await testRequest
        .delete(`/api/shops/${testShop.id}/staff/${staffMember.id}`)
        .set("Cookie", `token=${ownerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("POST /api/shops/:id/follow", () => {
    let followerUser;
    let followerToken;

    beforeEach(async () => {
      followerUser = await createTestUser({
        email: "follower@test.com",
        username: "follower",
        password: "Follower123!",
        firstName: "Follower",
        lastName: "User",
      });
      followerToken = await loginAndGetToken(
        testRequest,
        "follower@test.com",
        "Follower123!",
      );
    });

    it("should follow shop successfully", async () => {
      const response = await testRequest
        .post(`/api/shops/${testShop.id}/follow`)
        .set("Cookie", `token=${followerToken}`);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });
  });

  describe("DELETE /api/shops/:id/follow", () => {
    let followerUser;
    let followerToken;

    beforeEach(async () => {
      followerUser = await createTestUser({
        email: "follower2@test.com",
        username: "follower2",
        password: "Follower123!",
        firstName: "Follower",
        lastName: "User",
      });
      followerToken = await loginAndGetToken(
        testRequest,
        "follower2@test.com",
        "Follower123!",
      );

      await prisma.shopFollower.create({
        data: {
          shopId: testShop.id,
          userId: followerUser.id,
        },
      });
    });

    it("should unfollow shop successfully", async () => {
      const response = await testRequest
        .delete(`/api/shops/${testShop.id}/follow`)
        .set("Cookie", `token=${followerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
