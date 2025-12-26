import request from "supertest";
import app from "../src/app.js";
import { prisma } from "./setup.js";
import {
  testUsers,
  createTestUser,
  createTestShop,
  createTestProduct,
  loginAndGetToken,
} from "./helpers.js";

describe("Product API", () => {
  let testRequest;
  let ownerToken;
  let ownerUser;
  let testShop;
  let testProduct;

  beforeAll(async () => {
    testRequest = request(app);
  });

  beforeEach(async () => {
    ownerUser = await createTestUser(testUsers.shopOwner);
    ownerToken = await loginAndGetToken(
      testRequest,
      testUsers.shopOwner.email,
      testUsers.shopOwner.password,
    );

    testShop = await createTestShop(ownerUser.id);
    testProduct = await createTestProduct(testShop.id, ownerUser.id);
  });

  describe("POST /api/products", () => {
    it("should create product successfully", async () => {
      const response = await testRequest
        .post("/api/products")
        .set("Cookie", `token=${ownerToken}`)
        .send({
          shopId: testShop.id,
          name: "New Product",
          description: "A new test product",
          price: 49.99,
          quantity: 20,
          sku: "PROD-001",
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe("New Product");
    });

    it("should fail without required fields", async () => {
      const response = await testRequest
        .post("/api/products")
        .set("Cookie", `token=${ownerToken}`)
        .send({
          shopId: testShop.id,
          name: "Product",
          // Missing price
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/products", () => {
    it("should get all products", async () => {
      const response = await testRequest.get("/api/products");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("should filter by shop", async () => {
      const response = await testRequest.get(
        `/api/products?shopId=${testShop.id}`,
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("GET /api/products/:id", () => {
    it("should get product by id", async () => {
      const response = await testRequest.get(`/api/products/${testProduct.id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testProduct.id);
    });
  });

  describe("PUT /api/products/:id", () => {
    it("should update product successfully", async () => {
      const response = await testRequest
        .put(`/api/products/${testProduct.id}`)
        .set("Cookie", `token=${ownerToken}`)
        .send({
          name: "Updated Product",
          price: 79.99,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe("Updated Product");
    });
  });

  describe("DELETE /api/products/:id", () => {
    it("should delete product successfully", async () => {
      const response = await testRequest
        .delete(`/api/products/${testProduct.id}`)
        .set("Cookie", `token=${ownerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe("PATCH /api/products/:id/stock", () => {
    it("should update stock successfully", async () => {
      const response = await testRequest
        .patch(`/api/products/${testProduct.id}/stock`)
        .set("Cookie", `token=${ownerToken}`)
        .send({
          quantity: 50,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.quantity).toBe(50);
    });
  });
});
