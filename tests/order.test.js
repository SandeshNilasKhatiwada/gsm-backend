import request from "supertest";
import app from "../src/app.js";
import { prisma } from "./setup.js";
import {
  testUsers,
  createTestUser,
  createTestShop,
  createTestProduct,
  createTestOrder,
  loginAndGetToken,
} from "./helpers.js";

describe("Order API", () => {
  let testRequest;
  let customerToken;
  let ownerToken;
  let customerUser;
  let ownerUser;
  let testShop;
  let testProduct;
  let testOrder;

  beforeAll(async () => {
    testRequest = request(app);
  });

  beforeEach(async () => {
    customerUser = await createTestUser(testUsers.customer);
    ownerUser = await createTestUser(testUsers.shopOwner);

    customerToken = await loginAndGetToken(
      testRequest,
      testUsers.customer.email,
      testUsers.customer.password,
    );
    ownerToken = await loginAndGetToken(
      testRequest,
      testUsers.shopOwner.email,
      testUsers.shopOwner.password,
    );

    testShop = await createTestShop(ownerUser.id);
    testProduct = await createTestProduct(testShop.id, ownerUser.id, {
      quantity: 100,
    });
    testOrder = await createTestOrder(customerUser.id, testShop.id);
  });

  describe("POST /api/orders", () => {
    it("should create order successfully", async () => {
      const response = await testRequest
        .post("/api/orders")
        .set("Cookie", `token=${customerToken}`)
        .send({
          shopId: testShop.id,
          items: [
            {
              productId: testProduct.id,
              quantity: 2,
            },
          ],
          shippingAddress: {
            street: "123 Main St",
            city: "Test City",
            country: "Test Country",
            postalCode: "12345",
          },
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.orderNumber).toBeDefined();
    });

    it("should fail with insufficient stock", async () => {
      const response = await testRequest
        .post("/api/orders")
        .set("Cookie", `token=${customerToken}`)
        .send({
          shopId: testShop.id,
          items: [
            {
              productId: testProduct.id,
              quantity: 1000, // More than available
            },
          ],
          shippingAddress: {
            street: "123 Main St",
            city: "Test City",
            country: "Test Country",
            postalCode: "12345",
          },
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/orders", () => {
    it("should get customer orders", async () => {
      const response = await testRequest
        .get("/api/orders")
        .set("Cookie", `token=${customerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe("GET /api/orders/:id", () => {
    it("should get order by id", async () => {
      const response = await testRequest
        .get(`/api/orders/${testOrder.id}`)
        .set("Cookie", `token=${customerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testOrder.id);
    });
  });

  describe("PATCH /api/orders/:id/status", () => {
    it("should update order status successfully", async () => {
      const response = await testRequest
        .patch(`/api/orders/${testOrder.id}/status`)
        .set("Cookie", `token=${ownerToken}`)
        .send({
          status: "confirmed",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe("confirmed");
    });
  });

  describe("POST /api/orders/:id/cancel", () => {
    it("should cancel order successfully", async () => {
      const response = await testRequest
        .post(`/api/orders/${testOrder.id}/cancel`)
        .set("Cookie", `token=${customerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe("cancelled");
    });
  });
});
