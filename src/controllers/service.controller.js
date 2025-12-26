import serviceService from "../services/service.service.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";

// @desc    Create service for shop
// @route   POST /api/shops/:shopId/services
// @access  Private
export const createService = asyncHandler(async (req, res) => {
  const service = await serviceService.createService(
    req.params.shopId,
    req.user.id,
    req.body
  );

  res.status(201).json({
    success: true,
    message: "Service created successfully",
    data: service,
  });
});

// @desc    Get shop services
// @route   GET /api/shops/:shopId/services
// @access  Public
export const getShopServices = asyncHandler(async (req, res) => {
  const result = await serviceService.getShopServices(
    req.params.shopId,
    req.query
  );

  res.status(200).json({
    success: true,
    data: result.services,
    pagination: result.pagination,
  });
});

// @desc    Get all services
// @route   GET /api/services
// @access  Public
export const getAllServices = asyncHandler(async (req, res) => {
  const result = await serviceService.getAllServices(req.query);

  res.status(200).json({
    success: true,
    data: result.services,
    pagination: result.pagination,
  });
});

// @desc    Get service by ID
// @route   GET /api/services/:id
// @access  Public
export const getServiceById = asyncHandler(async (req, res) => {
  const service = await serviceService.getServiceById(req.params.id);

  res.status(200).json({
    success: true,
    data: service,
  });
});

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private
export const updateService = asyncHandler(async (req, res) => {
  const service = await serviceService.updateService(
    req.params.id,
    req.user.id,
    req.body
  );

  res.status(200).json({
    success: true,
    message: "Service updated successfully",
    data: service,
  });
});

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private
export const deleteService = asyncHandler(async (req, res) => {
  const result = await serviceService.deleteService(req.params.id, req.user.id);

  res.status(200).json({
    success: true,
    message: result.message,
  });
});

// @desc    Add review to service
// @route   POST /api/services/:id/reviews
// @access  Private
export const addServiceReview = asyncHandler(async (req, res) => {
  const review = await serviceService.addReview(
    req.params.id,
    req.user.id,
    req.body
  );

  res.status(201).json({
    success: true,
    message: "Review added successfully",
    data: review,
  });
});
