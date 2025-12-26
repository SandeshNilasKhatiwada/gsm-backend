import { prisma } from "../config/database.js";
import { getPagination, paginationResponse } from "../utils/pagination.util.js";
import { AppError } from "../utils/error.util.js";

class UserService {
  // Get all users with pagination and filters
  async getAllUsers(query) {
    const { page, limit, search, role, isVerified, isActive, isBlocked } =
      query;
    const { skip, take } = getPagination(page, limit);

    const where = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { username: { contains: search, mode: "insensitive" } },
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role) {
      where.roles = {
        some: {
          role: {
            name: role,
          },
          status: "approved",
        },
      };
    }

    if (isVerified !== undefined) {
      where.isVerified = isVerified === "true";
    }

    if (isActive !== undefined) {
      where.isActive = isActive === "true";
    }

    if (isBlocked !== undefined) {
      where.isBlocked = isBlocked === "true";
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          profilePictureUrl: true,
          isVerified: true,
          isActive: true,
          isBlocked: true,
          blockedReason: true,
          emailVerifiedAt: true,
          createdAt: true,
          roles: {
            where: { status: "approved" },
            include: {
              role: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          _count: {
            select: {
              ownedShops: true,
              posts: true,
              reviews: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    return paginationResponse(users, total, page, limit);
  }

  // Get user by ID
  async getUserById(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          where: { status: "approved" },
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
        ownedShops: {
          where: { deletedAt: null },
          include: {
            _count: {
              select: {
                products: true,
                services: true,
                followers: true,
              },
            },
          },
        },
        warnings: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        _count: {
          select: {
            posts: true,
            reviews: true,
            orders: true,
            warnings: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Update user
  async updateUser(userId, updateData) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        profilePictureUrl: true,
        isVerified: true,
        isActive: true,
        isBlocked: true,
        updatedAt: true,
      },
    });

    return user;
  }

  // Block user
  async blockUser(userId, reason, blockedBy) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        isBlocked: true,
        blockedReason: reason,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: blockedBy,
        action: "BLOCK_USER",
        targetType: "User",
        targetId: userId,
        details: { reason },
      },
    });

    return user;
  }

  // Unblock user
  async unblockUser(userId, unblockedBy) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        isBlocked: false,
        blockedReason: null,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: unblockedBy,
        action: "UNBLOCK_USER",
        targetType: "User",
        targetId: userId,
      },
    });

    return user;
  }

  // Delete user (soft delete)
  async deleteUser(userId, deletedBy) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: deletedBy,
        action: "DELETE_USER",
        targetType: "User",
        targetId: userId,
      },
    });

    return user;
  }

  // Warn user
  async warnUser(userId, warnData, warnedBy) {
    const { reason, severity } = warnData;

    const warning = await prisma.userWarning.create({
      data: {
        userId,
        reason,
        severity,
        warnedBy,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: warnedBy,
        action: "WARN_USER",
        targetType: "User",
        targetId: userId,
        details: { reason, severity },
      },
    });

    return warning;
  }

  // Verify user
  async verifyUser(userId, verifiedBy) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        isVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: verifiedBy,
        action: "VERIFY_USER",
        targetType: "User",
        targetId: userId,
      },
    });

    return user;
  }

  // Get user statistics
  async getUserStats(userId) {
    const stats = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        _count: {
          select: {
            shops: true,
            posts: true,
            reviews: true,
            comments: true,
            orders: true,
            warnings: true,
          },
        },
      },
    });

    return stats;
  }
}

export default new UserService();
