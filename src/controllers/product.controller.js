import asyncHandler from "express-async-handler";
import productService from "../services/product.service.js";

// @desc    Create product
// @route   POST /api/products
// @access  Private
export const createProduct = asyncHandler(async (req, res) => {
  const { shopId } = req.body;
  const product = await productService.createProduct(
    req.body,
    shopId,
    req.user.id,
  );

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    data: product,
  });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(
    req.params.id,
    req.body,
    req.user.id,
  );

  res.json({
    success: true,
    message: "Product updated successfully",
    data: product,
  });
});

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getAllProducts = asyncHandler(async (req, res) => {
  const result = await productService.getAllProducts(req.query);

  res.json({
    success: true,
    ...result,
  });
});

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);

  res.json({
    success: true,
    data: product,
  });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
export const deleteProduct = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.id, req.user.id);

  res.json({
    success: true,
    message: "Product deleted successfully",
  });
});

// @desc    Update product stock
// @route   PUT /api/products/:id/stock
// @access  Private
export const updateStock = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const product = await productService.updateStock(req.params.id, quantity);

  res.json({
    success: true,
    message: "Stock updated successfully",
    data: product,
  });
});
