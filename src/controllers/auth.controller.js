import asyncHandler from "express-async-handler";
import authService from "../services/auth.service.js";

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);

  // Set token in cookie
  res.cookie("token", result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: result,
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);

  // Set token in cookie
  res.cookie("token", result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.json({
    success: true,
    message: "Login successful",
    data: result,
  });
});

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user.id);

  res.json({
    success: true,
    data: user,
  });
});

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user.id, req.body);

  res.json({
    success: true,
    message: "Profile updated successfully",
    data: user,
  });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const result = await authService.changePassword(
    req.user.id,
    oldPassword,
    newPassword,
  );

  res.json({
    success: true,
    message: result.message,
  });
});

// @desc    Logout
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: "Logout successful",
  });
});
