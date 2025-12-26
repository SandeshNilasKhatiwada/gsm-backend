import prisma from "../config/database.js";
import { AppError } from "../utils/error.util.js";

class PermissionService {
  async createPermission(data) {
    // Check if permission with same resource and action exists
    const existingPermission = await prisma.permission.findFirst({
      where: {
        resource: data.resource,
        action: data.action,
      },
    });

    if (existingPermission) {
      throw new AppError(
        "Permission with this resource and action already exists",
        400,
      );
    }

    const permission = await prisma.permission.create({
      data: {
        resource: data.resource,
        action: data.action,
        description: data.description,
      },
    });

    return permission;
  }

  async getAllPermissions(filters = {}) {
    const { page = 1, limit = 50, search, resource } = filters;
    const skip = (page - 1) * limit;

    const where = {};

    if (search) {
      where.OR = [
        { resource: { contains: search, mode: "insensitive" } },
        { action: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (resource) {
      where.resource = { contains: resource, mode: "insensitive" };
    }

    const [permissions, total] = await Promise.all([
      prisma.permission.findMany({
        where,
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              roles: true,
            },
          },
        },
        orderBy: [{ resource: "asc" }, { action: "asc" }],
      }),
      prisma.permission.count({ where }),
    ]);

    return {
      permissions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPermissionById(permissionId) {
    const permission = await prisma.permission.findUnique({
      where: { id: permissionId },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
        _count: {
          select: {
            roles: true,
          },
        },
      },
    });

    if (!permission) {
      throw new AppError("Permission not found", 404);
    }

    return permission;
  }

  async updatePermission(permissionId, data) {
    await this.getPermissionById(permissionId);

    // Check uniqueness if changing resource or action
    if (data.resource || data.action) {
      const existingPermission = await prisma.permission.findFirst({
        where: {
          resource: data.resource,
          action: data.action,
          id: { not: permissionId },
        },
      });

      if (existingPermission) {
        throw new AppError(
          "Permission with this resource and action already exists",
          400,
        );
      }
    }

    const updatedPermission = await prisma.permission.update({
      where: { id: permissionId },
      data: {
        resource: data.resource,
        action: data.action,
        description: data.description,
      },
    });

    return updatedPermission;
  }

  async deletePermission(permissionId) {
    await this.getPermissionById(permissionId);

    // Check if permission is assigned to any roles
    const roleCount = await prisma.rolePermission.count({
      where: { permissionId },
    });

    if (roleCount > 0) {
      throw new AppError(
        `Cannot delete permission. ${roleCount} roles currently use this permission`,
        400,
      );
    }

    await prisma.permission.delete({
      where: { id: permissionId },
    });

    return { message: "Permission deleted successfully" };
  }

  async getPermissionsByResource() {
    const permissions = await prisma.permission.findMany({
      orderBy: [{ resource: "asc" }, { action: "asc" }],
    });

    // Group by resource
    const grouped = permissions.reduce((acc, permission) => {
      if (!acc[permission.resource]) {
        acc[permission.resource] = [];
      }
      acc[permission.resource].push(permission);
      return acc;
    }, {});

    return grouped;
  }
}

export default new PermissionService();
