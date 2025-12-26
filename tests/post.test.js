import request from "supertest";
import app from "../src/app.js";
import { prisma } from "./setup.js";
import {
  testUsers,
  createTestUser,
  createTestShop,
  createTestPost,
  loginAndGetToken,
} from "./helpers.js";

describe("Post API", () => {
  let testRequest;
  let authorToken;
  let adminToken;
  let authorUser;
  let adminUser;
  let testShop;
  let testPost;

  beforeAll(async () => {
    testRequest = request(app);
  });

  beforeEach(async () => {
    authorUser = await createTestUser(testUsers.shopOwner);
    adminUser = await createTestUser(testUsers.admin);

    authorToken = await loginAndGetToken(
      testRequest,
      testUsers.shopOwner.email,
      testUsers.shopOwner.password,
    );
    adminToken = await loginAndGetToken(
      testRequest,
      testUsers.admin.email,
      testUsers.admin.password,
    );

    testShop = await createTestShop(authorUser.id);
    testPost = await createTestPost(testShop.id, authorUser.id);
  });

  describe("POST /api/posts", () => {
    it("should create post successfully", async () => {
      const response = await testRequest
        .post("/api/posts")
        .set("Cookie", `token=${authorToken}`)
        .send({
          shopId: testShop.id,
          title: "New Blog Post",
          content: "This is a new blog post content",
          postType: "blog",
          status: "published",
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe("New Blog Post");
    });
  });

  describe("GET /api/posts", () => {
    it("should get all posts", async () => {
      const response = await testRequest.get("/api/posts");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("should filter by shop", async () => {
      const response = await testRequest.get(
        `/api/posts?shopId=${testShop.id}`,
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("GET /api/posts/:id", () => {
    it("should get post by id", async () => {
      const response = await testRequest.get(`/api/posts/${testPost.id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testPost.id);
    });
  });

  describe("PUT /api/posts/:id", () => {
    it("should update post successfully", async () => {
      const response = await testRequest
        .put(`/api/posts/${testPost.id}`)
        .set("Cookie", `token=${authorToken}`)
        .send({
          title: "Updated Post Title",
          content: "Updated content",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe("Updated Post Title");
    });
  });

  describe("DELETE /api/posts/:id", () => {
    it("should delete post successfully", async () => {
      const response = await testRequest
        .delete(`/api/posts/${testPost.id}`)
        .set("Cookie", `token=${authorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("POST /api/posts/:id/like", () => {
    it("should like post successfully", async () => {
      const response = await testRequest
        .post(`/api/posts/${testPost.id}/like`)
        .set("Cookie", `token=${authorToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("POST /api/posts/:id/disable", () => {
    it("should disable post successfully by admin", async () => {
      const response = await testRequest
        .post(`/api/posts/${testPost.id}/disable`)
        .set("Cookie", `token=${adminToken}`)
        .send({
          reason: "Violates community guidelines",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.isDisabledByAdmin).toBe(true);
    });
  });

  describe("POST /api/posts/:id/enable", () => {
    beforeEach(async () => {
      await prisma.post.update({
        where: { id: testPost.id },
        data: {
          isDisabledByAdmin: true,
          disabledReason: "Test",
        },
      });
    });

    it("should enable post successfully by admin", async () => {
      const response = await testRequest
        .post(`/api/posts/${testPost.id}/enable`)
        .set("Cookie", `token=${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.isDisabledByAdmin).toBe(false);
    });
  });

  describe("POST /api/posts/:id/comments", () => {
    let commenterUser;
    let commenterToken;

    beforeEach(async () => {
      commenterUser = await createTestUser({
        email: "commenter@test.com",
        username: "commenter",
        password: "Commenter123!",
        firstName: "Commenter",
        lastName: "User",
      });
      commenterToken = await loginAndGetToken(
        testRequest,
        "commenter@test.com",
        "Commenter123!",
      );
    });

    it("should create comment successfully", async () => {
      const response = await testRequest
        .post(`/api/posts/${testPost.id}/comments`)
        .set("Cookie", `token=${commenterToken}`)
        .send({
          content: "Great post!",
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });
  });
});
