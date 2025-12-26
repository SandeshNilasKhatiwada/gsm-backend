import roleService from "../services/role.service.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";

// @desc    Create new role
// @route   POST /api/roles
// @access  Private/Admin
export const createRole = asyncHandler(async (req, res) => {
  const role = await roleService.createRole(req.body);

  res.status(201).json({
    success: true,
    message: "Role created successfully",
    data: role,
  });
});

// @desc    Get all roles
// @route   GET /api/roles
// @access  Private/Admin
export const getRoles = asyncHandler(async (req, res) => {
  const result = await roleService.getAllRoles(req.query);

  res.status(200).json({
    success: true,
    data: result.roles,
    pagination: result.pagination,
  });
});

// @desc    Get role by ID
// @route   GET /api/roles/:id
// @access  Private/Admin
export const getRoleById = asyncHandler(async (req, res) => {
  const role = await roleService.getRoleById(req.params.id);

  res.status(200).json({
    success: true,
    data: role,
  });
});

// @desc    Update role
// @route   PUT /api/roles/:id
// @access  Private/Admin
export const updateRole = asyncHandler(async (req, res) => {
  const role = await roleService.updateRole(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: "Role updated successfully",
    data: role,
  });
});

// @desc    Delete role
// @route   DELETE /api/roles/:id
// @access  Private/Admin
export const deleteRole = asyncHandler(async (req, res) => {
  const result = await roleService.deleteRole(req.params.id);

  res.status(200).json({
    success: true,
    message: result.message,
  });
});

// @desc    Add permissions to role
// @route   POST /api/roles/:id/permissions
// @access  Private/Admin
export const addPermissionsToRole = asyncHandler(async (req, res) => {
  const role = await roleService.addPermissionsToRole(
    req.params.id,
    req.body.permissionIds
  );

  res.status(200).json({
    success: true,
    message: "Permissions added to role successfully",
    data: role,
  });
});

// @desc    Remove permission from role
// @route   DELETE /api/roles/:id/permissions/:permissionId
// @access  Private/Admin
export const removePermissionFromRole = asyncHandler(async (req, res) => {
  const role = await roleService.removePermissionFromRole(
    req.params.id,
    req.params.permissionId
  );

  res.status(200).json({
    success: true,
    message: "Permission removed from role successfully",
    data: role,
  });
});
