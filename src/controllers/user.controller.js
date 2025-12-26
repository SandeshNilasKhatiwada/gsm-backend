import asyncHandler from "express-async-handler";
import userService from "../services/user.service.js";

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getAllUsers = asyncHandler(async (req, res) => {
  const result = await userService.getAllUsers(req.query);

  res.json({
    success: true,
    ...result,
  });
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
export const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);

  res.json({
    success: true,
    data: user,
  });
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin or Own Profile
export const updateUser = asyncHandler(async (req, res) => {
  // Check if user is updating their own profile or is admin
  const isOwnProfile = req.user.id === req.params.id;
  const isAdmin = req.user.roles.some((ur) => ur.role.name === "admin");

  if (!isOwnProfile && !isAdmin) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to update this user",
    });
  }

  const user = await userService.updateUser(req.params.id, req.body);

  res.json({
    success: true,
    message: "User updated successfully",
    data: user,
  });
});

// @desc    Block user
// @route   PUT /api/users/:id/block
// @access  Private/Admin
export const blockUser = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const user = await userService.blockUser(req.params.id, reason, req.user.id);

  res.json({
    success: true,
    message: "User blocked successfully",
    data: user,
  });
});

// @desc    Unblock user
// @route   PUT /api/users/:id/unblock
// @access  Private/Admin
export const unblockUser = asyncHandler(async (req, res) => {
  const user = await userService.unblockUser(req.params.id, req.user.id);

  res.json({
    success: true,
    message: "User unblocked successfully",
    data: user,
  });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.params.id, req.user.id);

  res.json({
    success: true,
    message: "User deleted successfully",
  });
});

// @desc    Warn user
// @route   POST /api/users/:id/warn
// @access  Private/Admin
export const warnUser = asyncHandler(async (req, res) => {
  const warning = await userService.warnUser(
    req.params.id,
    req.body,
    req.user.id,
  );

  res.status(201).json({
    success: true,
    message: "Warning issued successfully",
    data: warning,
  });
});

// @desc    Verify user
// @route   PUT /api/users/:id/verify
// @access  Private/Admin
export const verifyUser = asyncHandler(async (req, res) => {
  const user = await userService.verifyUser(req.params.id, req.user.id);

  res.json({
    success: true,
    message: "User verified successfully",
    data: user,
  });
});

// @desc    Get user statistics
// @route   GET /api/users/:id/stats
// @access  Private
export const getUserStats = asyncHandler(async (req, res) => {
  const stats = await userService.getUserStats(req.params.id);

  res.json({
    success: true,
    data: stats,
  });
});
