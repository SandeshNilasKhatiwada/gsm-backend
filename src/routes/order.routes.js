import express from "express";
import {
  createOrder,
  updateOrderStatus,
  updatePaymentStatus,
  getAllOrders,
  getOrderById,
  cancelOrder,
} from "../controllers/order.controller.js";
import { auth, requireRole } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createOrderSchema,
  updateOrderStatusSchema,
  updatePaymentStatusSchema,
  getOrderByIdSchema,
  getAllOrdersSchema,
} from "../validations/order.validation.js";

const router = express.Router();

router.use(auth);

router.post("/", validate(createOrderSchema), createOrder);
router.get("/", validate(getAllOrdersSchema, "query"), getAllOrders);
router.get("/:id", validate(getOrderByIdSchema, "params"), getOrderById);
router.put("/:id/status", validate(updateOrderStatusSchema), updateOrderStatus);
router.put(
  "/:id/payment",
  requireRole("admin"),
  validate(updatePaymentStatusSchema),
  updatePaymentStatus,
);
router.put("/:id/cancel", cancelOrder);

export default router;
