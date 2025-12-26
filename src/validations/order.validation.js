import { z } from "zod";

// Create order validation
export const createOrderSchema = z.object({
  body: z.object({
    shopId: z.string().uuid("Invalid shop ID format"),
    items: z
      .array(
        z.object({
          productId: z.string().uuid("Invalid product ID format"),
          quantity: z.number().int().min(1, "Quantity must be at least 1"),
        }),
      )
      .min(1, "Order must have at least one item"),
    shippingAddress: z.object({
      street: z.string().min(1),
      city: z.string().min(1),
      state: z.string().min(1),
      zipCode: z.string().min(1),
      country: z.string().min(1),
    }),
    paymentMethod: z.string().optional(),
    notes: z.string().max(500).optional(),
  }),
});

// Update order status validation
export const updateOrderStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid order ID format"),
  }),
  body: z.object({
    status: z.enum([
      "pending",
      "confirmed",
      "shipped",
      "delivered",
      "cancelled",
    ]),
  }),
});

// Update payment status validation
export const updatePaymentStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid order ID format"),
  }),
  body: z.object({
    paymentStatus: z.enum(["pending", "paid", "failed", "refunded"]),
  }),
});

// Get order by ID validation
export const getOrderByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid order ID format"),
  }),
});

// Get all orders validation
export const getAllOrdersSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    shopId: z.string().uuid().optional(),
    userId: z.string().uuid().optional(),
    status: z
      .enum(["pending", "confirmed", "shipped", "delivered", "cancelled"])
      .optional(),
    paymentStatus: z.enum(["pending", "paid", "failed", "refunded"]).optional(),
  }),
});
