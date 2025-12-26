import prisma from "../config/database.js";
import { AppError } from "../utils/error.util.js";

class RoleService {
  async createRole(data) {
    // Check if role with same name exists
    const existingRole = await prisma.role.findUnique({
      where: { name: data.name },
    });

    if (existingRole) {
      throw new AppError("Role with this name already exists", 400);
    }

    const role = await prisma.role.create({
      data: {
        name: data.name,
        description: data.description,
        isSystemRole: data.isSystemRole || false,
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    return role;
  }

  async getAllRoles(filters = {}) {
    const { page = 1, limit = 20, search, isSystemRole } = filters;
    const skip = (page - 1) * limit;

    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (isSystemRole !== undefined) {
      where.isSystemRole = isSystemRole === "true";
    }

    const [roles, total] = await Promise.all([
      prisma.role.findMany({
        where,
        skip,
        take: limit,
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
          _count: {
            select: {
              userRoles: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.role.count({ where }),
    ]);

    return {
      roles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getRoleById(roleId) {
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        userRoles: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: {
          select: {
            userRoles: true,
          },
        },
      },
    });

    if (!role) {
      throw new AppError("Role not found", 404);
    }

    return role;
  }

  async updateRole(roleId, data) {
    const role = await this.getRoleById(roleId);

    if (role.isSystemRole) {
      throw new AppError("System roles cannot be modified", 403);
    }

    // Check name uniqueness if changing name
    if (data.name && data.name !== role.name) {
      const existingRole = await prisma.role.findUnique({
        where: { name: data.name },
      });

      if (existingRole) {
        throw new AppError("Role with this name already exists", 400);
      }
    }

    const updatedRole = await prisma.role.update({
      where: { id: roleId },
      data: {
        name: data.name,
        description: data.description,
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    return updatedRole;
  }

  async deleteRole(roleId) {
    const role = await this.getRoleById(roleId);

    if (role.isSystemRole) {
      throw new AppError("System roles cannot be deleted", 403);
    }

    // Check if role is assigned to any users
    const userCount = await prisma.userRole.count({
      where: {
        roleId,
        status: "approved",
      },
    });

    if (userCount > 0) {
      throw new AppError(
        `Cannot delete role. ${userCount} users currently have this role`,
        400
      );
    }

    await prisma.role.delete({
      where: { id: roleId },
    });

    return { message: "Role deleted successfully" };
  }

  async addPermissionsToRole(roleId, permissionIds) {
    const role = await this.getRoleById(roleId);

    // Verify all permissions exist
    const permissions = await prisma.permission.findMany({
      where: {
        id: { in: permissionIds },
      },
    });

    if (permissions.length !== permissionIds.length) {
      throw new AppError("One or more permissions not found", 404);
    }

    // Get existing permissions
    const existingPermissions = await prisma.rolePermission.findMany({
      where: {
        roleId,
        permissionId: { in: permissionIds },
      },
    });

    const existingPermissionIds = existingPermissions.map((rp) => rp.permissionId);
    const newPermissionIds = permissionIds.filter(
      (id) => !existingPermissionIds.includes(id)
    );

    // Create new role-permission associations
    if (newPermissionIds.length > 0) {
      await prisma.rolePermission.createMany({
        data: newPermissionIds.map((permissionId) => ({
          roleId,
          permissionId,
        })),
      });
    }

    return this.getRoleById(roleId);
  }

  async removePermissionFromRole(roleId, permissionId) {
    const role = await this.getRoleById(roleId);

    const rolePermission = await prisma.rolePermission.findFirst({
      where: {
        roleId,
        permissionId,
      },
    });

    if (!rolePermission) {
      throw new AppError("Permission not associated with this role", 404);
    }

    await prisma.rolePermission.delete({
      where: { id: rolePermission.id },
    });

    return this.getRoleById(roleId);
  }
}

export default new RoleService();
