import asyncHandler from "express-async-handler";
import shopService from "../services/shop.service.js";

// @desc    Create shop
// @route   POST /api/shops
// @access  Private
export const createShop = asyncHandler(async (req, res) => {
  const shop = await shopService.createShop(req.body, req.user.id);

  res.status(201).json({
    success: true,
    message: "Shop created successfully",
    data: shop,
  });
});

// @desc    Update shop
// @route   PUT /api/shops/:id
// @access  Private
export const updateShop = asyncHandler(async (req, res) => {
  const shop = await shopService.updateShop(
    req.params.id,
    req.body,
    req.user.id,
  );

  res.json({
    success: true,
    message: "Shop updated successfully",
    data: shop,
  });
});

// @desc    Get all shops
// @route   GET /api/shops
// @access  Public
export const getAllShops = asyncHandler(async (req, res) => {
  const result = await shopService.getAllShops(req.query);

  res.json({
    success: true,
    ...result,
  });
});

// @desc    Get shop by ID
// @route   GET /api/shops/:id
// @access  Public
export const getShopById = asyncHandler(async (req, res) => {
  const shop = await shopService.getShopById(req.params.id);

  res.json({
    success: true,
    data: shop,
  });
});

// @desc    Verify shop
// @route   PUT /api/shops/:id/verify
// @access  Private/Admin
export const verifyShop = asyncHandler(async (req, res) => {
  const shop = await shopService.verifyShop(req.params.id, req.user.id);

  res.json({
    success: true,
    message: "Shop verified successfully",
    data: shop,
  });
});

// @desc    Reject shop verification
// @route   PUT /api/shops/:id/reject
// @access  Private/Admin
export const rejectShop = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const shop = await shopService.rejectShop(req.params.id, reason, req.user.id);

  res.json({
    success: true,
    message: "Shop verification rejected",
    data: shop,
  });
});

// @desc    Block shop
// @route   PUT /api/shops/:id/block
// @access  Private/Admin
export const blockShop = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const shop = await shopService.blockShop(req.params.id, reason, req.user.id);

  res.json({
    success: true,
    message: "Shop blocked successfully",
    data: shop,
  });
});

// @desc    Unblock shop
// @route   PUT /api/shops/:id/unblock
// @access  Private/Admin
export const unblockShop = asyncHandler(async (req, res) => {
  const shop = await shopService.unblockShop(req.params.id, req.user.id);

  res.json({
    success: true,
    message: "Shop unblocked successfully",
    data: shop,
  });
});

// @desc    Issue strike
// @route   POST /api/shops/:id/strike
// @access  Private/Admin
export const issueStrike = asyncHandler(async (req, res) => {
  const strike = await shopService.issueStrike(
    req.params.id,
    req.body,
    req.user.id,
  );

  res.status(201).json({
    success: true,
    message: "Strike issued successfully",
    data: strike,
  });
});

// @desc    Add staff
// @route   POST /api/shops/:id/staff
// @access  Private
export const addStaff = asyncHandler(async (req, res) => {
  const staff = await shopService.addStaff(
    req.params.id,
    req.body,
    req.user.id,
  );

  res.status(201).json({
    success: true,
    message: "Staff added successfully",
    data: staff,
  });
});

// @desc    Remove staff
// @route   DELETE /api/shops/:shopId/staff/:staffId
// @access  Private
export const removeStaff = asyncHandler(async (req, res) => {
  await shopService.removeStaff(
    req.params.shopId,
    req.params.staffId,
    req.user.id,
  );

  res.json({
    success: true,
    message: "Staff removed successfully",
  });
});

// @desc    Follow shop
// @route   POST /api/shops/:id/follow
// @access  Private
export const followShop = asyncHandler(async (req, res) => {
  const follower = await shopService.followShop(req.params.id, req.user.id);

  res.status(201).json({
    success: true,
    message: "Shop followed successfully",
    data: follower,
  });
});

// @desc    Unfollow shop
// @route   DELETE /api/shops/:id/follow
// @access  Private
export const unfollowShop = asyncHandler(async (req, res) => {
  await shopService.unfollowShop(req.params.id, req.user.id);

  res.json({
    success: true,
    message: "Shop unfollowed successfully",
  });
});

// @desc    Delete shop
// @route   DELETE /api/shops/:id
// @access  Private
export const deleteShop = asyncHandler(async (req, res) => {
  await shopService.deleteShop(req.params.id, req.user.id);

  res.json({
    success: true,
    message: "Shop deleted successfully",
  });
});
