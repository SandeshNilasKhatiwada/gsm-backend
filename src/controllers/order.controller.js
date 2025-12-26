import asyncHandler from "express-async-handler";
import orderService from "../services/order.service.js";

// @desc    Create order
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req, res) => {
  const order = await orderService.createOrder(req.body, req.user.id);

  res.status(201).json({
    success: true,
    message: "Order created successfully",
    data: order,
  });
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await orderService.updateOrderStatus(
    req.params.id,
    status,
    req.user.id,
  );

  res.json({
    success: true,
    message: "Order status updated successfully",
    data: order,
  });
});

// @desc    Update payment status
// @route   PUT /api/orders/:id/payment
// @access  Private/Admin
export const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { paymentStatus, transactionId } = req.body;
  const order = await orderService.updatePaymentStatus(
    req.params.id,
    paymentStatus,
    transactionId,
    req.user.id,
  );

  res.json({
    success: true,
    message: "Payment status updated successfully",
    data: order,
  });
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
export const getAllOrders = asyncHandler(async (req, res) => {
  const result = await orderService.getAllOrders(
    req.query,
    req.user.id,
    req.user.roles,
  );

  res.json({
    success: true,
    ...result,
  });
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(
    req.params.id,
    req.user.id,
    req.user.roles,
  );

  res.json({
    success: true,
    data: order,
  });
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await orderService.cancelOrder(req.params.id, req.user.id);

  res.json({
    success: true,
    message: "Order cancelled successfully",
    data: order,
  });
});
