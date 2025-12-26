import permissionService from "../services/permission.service.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";

// @desc    Create new permission
// @route   POST /api/permissions
// @access  Private/Admin
export const createPermission = asyncHandler(async (req, res) => {
  const permission = await permissionService.createPermission(req.body);

  res.status(201).json({
    success: true,
    message: "Permission created successfully",
    data: permission,
  });
});

// @desc    Get all permissions
// @route   GET /api/permissions
// @access  Private/Admin
export const getPermissions = asyncHandler(async (req, res) => {
  const result = await permissionService.getAllPermissions(req.query);

  res.status(200).json({
    success: true,
    data: result.permissions,
    pagination: result.pagination,
  });
});

// @desc    Get permission by ID
// @route   GET /api/permissions/:id
// @access  Private/Admin
export const getPermissionById = asyncHandler(async (req, res) => {
  const permission = await permissionService.getPermissionById(req.params.id);

  res.status(200).json({
    success: true,
    data: permission,
  });
});

// @desc    Update permission
// @route   PUT /api/permissions/:id
// @access  Private/Admin
export const updatePermission = asyncHandler(async (req, res) => {
  const permission = await permissionService.updatePermission(
    req.params.id,
    req.body,
  );

  res.status(200).json({
    success: true,
    message: "Permission updated successfully",
    data: permission,
  });
});

// @desc    Delete permission
// @route   DELETE /api/permissions/:id
// @access  Private/Admin
export const deletePermission = asyncHandler(async (req, res) => {
  const result = await permissionService.deletePermission(req.params.id);

  res.status(200).json({
    success: true,
    message: result.message,
  });
});

// @desc    Get permissions grouped by resource
// @route   GET /api/permissions/by-resource
// @access  Private/Admin
export const getPermissionsByResource = asyncHandler(async (req, res) => {
  const grouped = await permissionService.getPermissionsByResource();

  res.status(200).json({
    success: true,
    data: grouped,
  });
});
