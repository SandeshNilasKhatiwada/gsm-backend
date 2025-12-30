import prisma from "../config/database.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    activeUsers,
    blockedUsers,
    totalShops,
    verifiedShops,
    pendingShops,
    blockedShops,
    totalProducts,
    activeProducts,
    totalOrders,
    completedOrders,
    totalRevenue,
    recentActivities,
  ] = await Promise.all([
    // User stats
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true, deletedAt: null } }),
    prisma.user.count({ where: { isBlocked: true } }),

    // Shop stats
    prisma.shop.count(),
    prisma.shop.count({ where: { verificationStatus: "VERIFIED" } }),
    prisma.shop.count({ where: { verificationStatus: "PENDING" } }),
    prisma.shop.count({ where: { isBlocked: true } }),

    // Product stats
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),

    // Order stats
    prisma.order.count(),
    prisma.order.count({ where: { status: "delivered" } }),
    prisma.order.aggregate({
      where: { status: "delivered" },
      _sum: { totalAmount: true },
    }),

    // Recent activities
    prisma.activityLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      users: {
        total: totalUsers,
        active: activeUsers,
        blocked: blockedUsers,
      },
      shops: {
        total: totalShops,
        verified: verifiedShops,
        pending: pendingShops,
        blocked: blockedShops,
      },
      products: {
        total: totalProducts,
        active: activeProducts,
      },
      orders: {
        total: totalOrders,
        completed: completedOrders,
      },
      revenue: {
        total: totalRevenue._sum.totalAmount || 0,
      },
      recentActivities,
    },
  });
});

// @desc    Get all users with advanced filters
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    search,
    isActive,
    isBlocked,
    isVerified,
    role,
    includeDeleted = false,
  } = req.query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;
  const where = {};

  // Exclude soft deleted users unless explicitly requested
  if (includeDeleted !== "true") {
    where.deletedAt = null;
  }

  if (search) {
    where.OR = [
      { username: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
    ];
  }

  if (isActive !== undefined) where.isActive = isActive === "true";
  if (isBlocked !== undefined) where.isBlocked = isBlocked === "true";
  if (isVerified !== undefined) where.isVerified = isVerified === "true";

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

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limitNum,
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        isBlocked: true,
        isVerified: true,
        warningCount: true,
        createdAt: true,
        roles: {
          where: { status: "approved" },
          include: {
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  res.status(200).json({
    success: true,
    data: users,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
export const getUserById = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: {
      id: true,
      username: true,
      email: true,
      firstName: true,
      lastName: true,
      phoneNumber: true,
      profilePictureUrl: true,
      isActive: true,
      isBlocked: true,
      isVerified: true,
      warningCount: true,
      blockedReason: true,
      lastWarningAt: true,
      emailVerifiedAt: true,
      createdAt: true,
      updatedAt: true,
      roles: {
        where: { status: "approved" },
        include: {
          role: true,
        },
      },
    },
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  res.json({
    success: true,
    data: user,
  });
});

// @desc    Verify user
// @route   PUT /api/admin/users/:id/verify
// @access  Private/Admin
export const verifyUser = asyncHandler(async (req, res) => {
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: {
      isVerified: true,
      emailVerifiedAt: new Date(),
    },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  res.json({
    success: true,
    message: "User verified successfully",
    data: user,
  });
});

// @desc    Block user
// @route   PUT /api/admin/users/:id/block
// @access  Private/Admin
export const blockUser = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: {
      isBlocked: true,
      blockedReason: reason || "Blocked by administrator",
    },
  });

  // Log the action
  await prisma.activityLog.create({
    data: {
      userId: req.user.id,
      action: "block_user",
      entityType: "user",
      entityId: user.id,
      metadata: { reason: reason || "Blocked by administrator" },
    },
  });

  res.json({
    success: true,
    message: "User blocked successfully",
    data: user,
  });
});

// @desc    Unblock user
// @route   PUT /api/admin/users/:id/unblock
// @access  Private/Admin
export const unblockUser = asyncHandler(async (req, res) => {
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: {
      isBlocked: false,
      blockedReason: null,
      warningCount: 0,
      lastWarningAt: null,
    },
  });

  // Log the action
  await prisma.activityLog.create({
    data: {
      userId: req.user.id,
      action: "unblock_user",
      entityType: "user",
      entityId: user.id,
      metadata: { warningsCleared: true },
    },
  });

  res.json({
    success: true,
    message: "User unblocked successfully and warnings cleared",
    data: user,
  });
});

// @desc    Issue warning to user
// @route   POST /api/admin/users/:id/warning
// @access  Private/Admin
export const issueWarning = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  if (!reason) {
    return res.status(400).json({
      success: false,
      message: "Warning reason is required",
    });
  }

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: {
      warningCount: { increment: 1 },
      lastWarningAt: new Date(),
    },
  });

  // Auto-block user if warning count reaches 3
  let blocked = false;
  if (user.warningCount >= 3) {
    await prisma.user.update({
      where: { id: req.params.id },
      data: {
        isBlocked: true,
        blockedReason: "Automatically blocked after receiving 3 warnings",
      },
    });
    blocked = true;

    // Log the auto-block
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: "auto_block_user",
        entityType: "user",
        entityId: user.id,
        metadata: {
          reason: "3 warnings threshold reached",
          warningCount: user.warningCount,
        },
      },
    });
  }

  // Log the warning
  await prisma.activityLog.create({
    data: {
      userId: req.user.id,
      action: "issue_warning",
      entityType: "user",
      entityId: user.id,
      metadata: {
        reason,
        warningCount: user.warningCount,
        autoBlocked: blocked,
      },
    },
  });

  res.json({
    success: true,
    message: blocked
      ? "Warning issued successfully. User has been automatically blocked after 3 warnings."
      : "Warning issued successfully",
    data: { ...user, isBlocked: blocked },
  });
});

// @desc    Get all shops (admin)
// @route   GET /api/admin/shops
// @access  Private/Admin
export const getShops = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    search,
    verificationStatus,
    isBlocked,
    includeDeleted = false,
  } = req.query;
  const skip = (page - 1) * limit;

  const where = {};

  // Exclude soft deleted shops unless explicitly requested
  if (includeDeleted !== "true") {
    where.deletedAt = null;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  if (verificationStatus) {
    where.verificationStatus = verificationStatus.toUpperCase();
  }

  if (isBlocked !== undefined) {
    where.isBlocked = isBlocked === "true";
  }

  const [shops, total] = await Promise.all([
    prisma.shop.findMany({
      where,
      skip,
      take: parseInt(limit),
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            products: true,
            orders: true,
            followers: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.shop.count({ where }),
  ]);

  res.status(200).json({
    success: true,
    data: shops,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// @desc    Get pending shop verifications
// @route   GET /api/admin/shops/pending
// @access  Private/Admin
export const getPendingShops = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const [shops, total] = await Promise.all([
    prisma.shop.findMany({
      where: {
        verificationStatus: "PENDING",
      },
      skip,
      take: limit,
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.shop.count({
      where: { verificationStatus: "PENDING" },
    }),
  ]);

  res.status(200).json({
    success: true,
    data: shops,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// @desc    Get activity logs
// @route   GET /api/admin/activity-logs
// @access  Private/Admin
export const getActivityLogs = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 50,
    userId,
    entityType,
    action,
    startDate,
    endDate,
  } = req.query;

  const skip = (page - 1) * limit;
  const where = {};

  if (userId) where.userId = userId;
  if (entityType) where.entityType = entityType;
  if (action) where.action = action;

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.activityLog.count({ where }),
  ]);

  res.status(200).json({
    success: true,
    data: logs,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// @desc    Moderate content (disable/enable)
// @route   POST /api/admin/moderate
// @access  Private/Admin
export const moderateContent = asyncHandler(async (req, res) => {
  const { entityType, entityId, action, reason } = req.body;

  let result;

  switch (entityType) {
    case "product":
      result = await prisma.product.update({
        where: { id: entityId },
        data: { isActive: action === "enable" },
      });
      break;

    case "post":
      result = await prisma.post.update({
        where: { id: entityId },
        data: { isActive: action === "enable" },
      });
      break;

    case "service":
      result = await prisma.service.update({
        where: { id: entityId },
        data: { isActive: action === "enable" },
      });
      break;

    case "comment":
      result = await prisma.comment.update({
        where: { id: entityId },
        data: {
          deletedAt: action === "enable" ? null : new Date(),
        },
      });
      break;

    default:
      return res.status(400).json({
        success: false,
        message: "Invalid entity type",
      });
  }

  // Log the moderation action
  await prisma.activityLog.create({
    data: {
      userId: req.user.id,
      action: `${action}_${entityType}`,
      entityType,
      entityId,
      metadata: { reason },
    },
  });

  res.status(200).json({
    success: true,
    message: `${entityType} ${action}d successfully`,
    data: result,
  });
});

// @desc    Get reports/flagged content
// @route   GET /api/admin/reports
// @access  Private/Admin
export const getReports = asyncHandler(async (req, res) => {
  // This would integrate with a reporting system if implemented
  // For now, return placeholder
  res.status(200).json({
    success: true,
    message: "Reports feature not yet implemented",
    data: [],
  });
});

// @desc    Soft delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res) => {
  const now = new Date();

  // Soft delete user and all related data
  await prisma.$transaction(async (tx) => {
    // Soft delete user
    await tx.user.update({
      where: { id: req.params.id },
      data: { deletedAt: now },
    });

    // Soft delete user's shops
    const shops = await tx.shop.findMany({
      where: { ownerId: req.params.id },
      select: { id: true },
    });

    for (const shop of shops) {
      // Soft delete shop
      await tx.shop.update({
        where: { id: shop.id },
        data: { deletedAt: now },
      });

      // Soft delete shop's products
      await tx.product.updateMany({
        where: { shopId: shop.id },
        data: { deletedAt: now },
      });

      // Soft delete shop's services
      await tx.service.updateMany({
        where: { shopId: shop.id },
        data: { deletedAt: now },
      });

      // Soft delete shop's posts
      await tx.post.updateMany({
        where: { shopId: shop.id },
        data: { deletedAt: now },
      });
    }

    // Soft delete user's posts
    await tx.post.updateMany({
      where: { authorId: req.params.id },
      data: { deletedAt: now },
    });

    // Soft delete user's comments
    await tx.comment.updateMany({
      where: { userId: req.params.id },
      data: { deletedAt: now },
    });

    // Log the deletion
    await tx.activityLog.create({
      data: {
        userId: req.user.id,
        action: "delete_user",
        entityType: "user",
        entityId: req.params.id,
        metadata: { cascadedDelete: true, shopsDeleted: shops.length },
      },
    });
  });

  res.json({
    success: true,
    message: "User and all related data deleted successfully",
  });
});

// @desc    Restore deleted user
// @route   PUT /api/admin/users/:id/restore
// @access  Private/Admin
export const restoreUser = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  if (!user.deletedAt) {
    return res.status(400).json({
      success: false,
      message: "User is not deleted",
    });
  }

  // Restore user and all related data
  await prisma.$transaction(async (tx) => {
    // Restore user
    await tx.user.update({
      where: { id: req.params.id },
      data: { deletedAt: null },
    });

    // Restore user's shops
    const shops = await tx.shop.findMany({
      where: { ownerId: req.params.id, deletedAt: { not: null } },
      select: { id: true },
    });

    for (const shop of shops) {
      // Restore shop
      await tx.shop.update({
        where: { id: shop.id },
        data: { deletedAt: null },
      });

      // Restore shop's products
      await tx.product.updateMany({
        where: { shopId: shop.id, deletedAt: { not: null } },
        data: { deletedAt: null },
      });

      // Restore shop's services
      await tx.service.updateMany({
        where: { shopId: shop.id, deletedAt: { not: null } },
        data: { deletedAt: null },
      });

      // Restore shop's posts
      await tx.post.updateMany({
        where: { shopId: shop.id, deletedAt: { not: null } },
        data: { deletedAt: null },
      });
    }

    // Restore user's posts
    await tx.post.updateMany({
      where: { authorId: req.params.id, deletedAt: { not: null } },
      data: { deletedAt: null },
    });

    // Restore user's comments
    await tx.comment.updateMany({
      where: { userId: req.params.id, deletedAt: { not: null } },
      data: { deletedAt: null },
    });

    // Log the restoration
    await tx.activityLog.create({
      data: {
        userId: req.user.id,
        action: "restore_user",
        entityType: "user",
        entityId: req.params.id,
        metadata: { cascadedRestore: true, shopsRestored: shops.length },
      },
    });
  });

  res.json({
    success: true,
    message: "User and all related data restored successfully",
  });
});

// @desc    Restore deleted shop
// @route   PUT /api/admin/shops/:id/restore
// @access  Private/Admin
export const restoreShop = asyncHandler(async (req, res) => {
  const shopService = (await import("../services/shop.service.js")).default;
  const result = await shopService.restoreShop(req.params.id, req.user.id);

  res.json({
    success: true,
    ...result,
  });
});

// @desc    Get deleted users
// @route   GET /api/admin/users/deleted
// @access  Private/Admin
export const getDeletedUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;
  const where = {
    deletedAt: { not: null },
  };

  if (search) {
    where.OR = [
      { username: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limitNum,
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        isBlocked: true,
        isVerified: true,
        warningCount: true,
        deletedAt: true,
        createdAt: true,
        roles: {
          where: { status: "approved" },
          include: {
            role: true,
          },
        },
      },
      orderBy: { deletedAt: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  res.status(200).json({
    success: true,
    data: users,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

// @desc    Get deleted shops
// @route   GET /api/admin/shops/deleted
// @access  Private/Admin
export const getDeletedShops = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;
  const where = {
    deletedAt: { not: null },
  };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const [shops, total] = await Promise.all([
    prisma.shop.findMany({
      where,
      skip,
      take: limitNum,
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            products: true,
            orders: true,
            followers: true,
          },
        },
      },
      orderBy: { deletedAt: "desc" },
    }),
    prisma.shop.count({ where }),
  ]);

  res.status(200).json({
    success: true,
    data: shops,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
});

export const getShopById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [shop, activities] = await Promise.all([
    prisma.shop.findFirst({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
            profilePictureUrl: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            products: true,
            orders: true,
            followers: true,
            reviews: true,
          },
        },
      },
    }),
    prisma.activityLog.findMany({
      where: {
        entityType: "SHOP",
        entityId: id,
        action: {
          in: [
            "SHOP_BLOCKED",
            "SHOP_UNBLOCKED",
            "SHOP_STRIKE_ISSUED",
            "SHOP_VERIFIED",
            "SHOP_REJECTED",
          ],
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        action: true,
        metadata: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    }),
  ]);

  if (!shop) {
    throw new ApiError(404, "Shop not found");
  }

  // Transform activities to include description from metadata
  const transformedActivities = activities.map((activity) => ({
    ...activity,
    description: activity.metadata?.description || activity.action,
    performedBy: activity.user,
  }));

  res.status(200).json({
    success: true,
    data: {
      ...shop,
      activities: transformedActivities,
    },
  });
});

export const issueShopStrike = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!reason) {
    throw new ApiError(400, "Reason is required");
  }

  const shop = await prisma.shop.findFirst({ where: { id } });
  if (!shop) {
    throw new ApiError(404, "Shop not found");
  }

  const newStrikeCount = (shop.strikeCount || 0) + 1;
  const shouldBlock = newStrikeCount >= 3;

  const updatedShop = await prisma.shop.update({
    where: { id },
    data: {
      strikeCount: newStrikeCount,
      isBlocked: shouldBlock ? true : shop.isBlocked,
    },
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      userId: req.user.id,
      action: "SHOP_STRIKE_ISSUED",
      entityType: "SHOP",
      entityId: id,
      metadata: {
        description: `Strike ${newStrikeCount}/3 issued: ${reason}${
          shouldBlock ? " - Shop auto-blocked" : ""
        }`,
        reason,
        strikeCount: newStrikeCount,
      },
    },
  });

  if (shouldBlock && !shop.isBlocked) {
    // Log auto-block
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: "SHOP_BLOCKED",
        entityType: "SHOP",
        entityId: id,
        metadata: {
          description: "Shop automatically blocked after receiving 3 strikes",
          automatic: true,
        },
      },
    });
  }

  res.status(200).json({
    success: true,
    data: updatedShop,
    message: shouldBlock
      ? "Strike issued and shop auto-blocked (3 strikes reached)"
      : `Strike issued (${newStrikeCount}/3)`,
  });
});

export const blockShop = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!reason) {
    throw new ApiError(400, "Reason is required");
  }

  const shop = await prisma.shop.findFirst({ where: { id } });
  if (!shop) {
    throw new ApiError(404, "Shop not found");
  }

  if (shop.isBlocked) {
    throw new ApiError(400, "Shop is already blocked");
  }

  const updatedShop = await prisma.shop.update({
    where: { id },
    data: { isBlocked: true },
  });

  await prisma.activityLog.create({
    data: {
      userId: req.user.id,
      action: "SHOP_BLOCKED",
      entityType: "SHOP",
      entityId: id,
      metadata: {
        description: reason,
        reason,
      },
    },
  });

  res.status(200).json({
    success: true,
    data: updatedShop,
    message: "Shop blocked successfully",
  });
});

export const unblockShop = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const shop = await prisma.shop.findFirst({ where: { id } });
  if (!shop) {
    throw new ApiError(404, "Shop not found");
  }

  if (!shop.isBlocked) {
    throw new ApiError(400, "Shop is not blocked");
  }

  const updatedShop = await prisma.shop.update({
    where: { id },
    data: {
      isBlocked: false,
      strikeCount: 0, // Reset strikes when manually unblocking
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: req.user.id,
      action: "SHOP_UNBLOCKED",
      entityType: "SHOP",
      entityId: id,
      metadata: {
        description: "Shop unblocked by admin (strikes reset)",
      },
    },
  });

  res.status(200).json({
    success: true,
    data: updatedShop,
    message: "Shop unblocked successfully (strikes reset)",
  });
});

export const deleteShopByAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const shop = await prisma.shop.findFirst({ where: { id } });
  if (!shop) {
    throw new ApiError(404, "Shop not found");
  }

  if (shop.deletedAt) {
    throw new ApiError(400, "Shop is already deleted");
  }

  const updatedShop = await prisma.shop.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await prisma.activityLog.create({
    data: {
      userId: req.user.id,
      action: "SHOP_DELETED",
      entityType: "SHOP",
      entityId: id,
      metadata: {
        description: "Shop deleted by admin",
      },
    },
  });

  res.status(200).json({
    success: true,
    data: updatedShop,
    message: "Shop deleted successfully",
  });
});
// @desc    Get all products for admin
// @route   GET /api/admin/products
// @access  Private/Admin
export const getProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    search,
    category,
    shopId,
    isBlocked,
    isActive,
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const where = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  if (category && category !== "all") {
    where.category = category;
  }

  if (shopId) {
    where.shopId = shopId;
  }

  if (isBlocked !== undefined) {
    where.isBlocked = isBlocked === "true";
  }

  if (isActive !== undefined) {
    where.isActive = isActive === "true";
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: "desc" },
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
          },
        },
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    }),
    prisma.product.count({ where }),
  ]);

  res.status(200).json({
    success: true,
    data: products,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    },
  });
});

// @desc    Block a product
// @route   PUT /api/admin/products/:id/block
// @access  Private/Admin
export const blockProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!reason) {
    res.status(400);
    throw new Error("Reason for blocking is required");
  }

  const product = await prisma.product.findUnique({
    where: { id },
    include: { shop: true },
  });

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (product.isBlocked) {
    res.status(400);
    throw new Error("Product is already blocked");
  }

  const updatedProduct = await prisma.product.update({
    where: { id },
    data: {
      isBlocked: true,
      blockedReason: reason,
      blockedAt: new Date(),
      blockedBy: req.user.id,
      isActive: false,
      appealStatus: null,
      appealMessage: null,
      appealedAt: null,
      appealResponse: null,
      appealReviewedAt: null,
      appealReviewedBy: null,
    },
  });

  // Log the activity
  await prisma.activityLog.create({
    data: {
      userId: req.user.id,
      action: "PRODUCT_BLOCKED",
      entityType: "PRODUCT",
      entityId: id,
      metadata: {
        reason,
        productName: product.name,
        shopName: product.shop.name,
      },
    },
  });

  res.status(200).json({
    success: true,
    data: updatedProduct,
    message: "Product blocked successfully",
  });
});

// @desc    Unblock a product
// @route   PUT /api/admin/products/:id/unblock
// @access  Private/Admin
export const unblockProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { shop: true },
  });

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (!product.isBlocked) {
    res.status(400);
    throw new Error("Product is not blocked");
  }

  const updatedProduct = await prisma.product.update({
    where: { id },
    data: {
      isBlocked: false,
      blockedReason: null,
      blockedAt: null,
      blockedBy: null,
      isActive: true,
      appealStatus: null,
      appealMessage: null,
      appealedAt: null,
      appealResponse: null,
      appealReviewedAt: null,
      appealReviewedBy: null,
    },
  });

  // Log the activity
  await prisma.activityLog.create({
    data: {
      userId: req.user.id,
      action: "PRODUCT_UNBLOCKED",
      entityType: "PRODUCT",
      entityId: id,
      metadata: {
        productName: product.name,
        shopName: product.shop.name,
      },
    },
  });

  res.status(200).json({
    success: true,
    data: updatedProduct,
    message: "Product unblocked successfully",
  });
});

// @desc    Get product appeals
// @route   GET /api/admin/products/appeals
// @access  Private/Admin
export const getProductAppeals = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const where = {
    isBlocked: true,
    appealStatus: status || { not: null },
  };

  const [appeals, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take,
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
          },
        },
      },
      orderBy: { appealedAt: "desc" },
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.ceil(total / take);

  res.status(200).json({
    success: true,
    data: appeals,
    pagination: {
      total,
      page: parseInt(page),
      limit: take,
      totalPages,
    },
  });
});

// @desc    Review product appeal
// @route   PUT /api/admin/products/:id/appeal/review
// @access  Private/Admin
export const reviewProductAppeal = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { decision, response } = req.body;

  if (!decision || !["approved", "rejected"].includes(decision)) {
    res.status(400);
    throw new Error("Decision must be 'approved' or 'rejected'");
  }

  const product = await prisma.product.findUnique({
    where: { id },
    include: { shop: true },
  });

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (!product.isBlocked || product.appealStatus !== "pending") {
    res.status(400);
    throw new Error("No pending appeal found for this product");
  }

  const updateData = {
    appealStatus: decision,
    appealResponse: response || null,
    appealReviewedAt: new Date(),
    appealReviewedBy: req.user.id,
  };

  // If appeal is approved, unblock the product
  if (decision === "approved") {
    updateData.isBlocked = false;
    updateData.blockedReason = null;
    updateData.blockedAt = null;
    updateData.blockedBy = null;
    updateData.isActive = true;
  }

  const updatedProduct = await prisma.product.update({
    where: { id },
    data: updateData,
  });

  // Log the activity
  await prisma.activityLog.create({
    data: {
      userId: req.user.id,
      action: decision === "approved" ? "APPEAL_APPROVED" : "APPEAL_REJECTED",
      entityType: "PRODUCT",
      entityId: id,
      metadata: {
        productName: product.name,
        shopName: product.shop.name,
        response: response || null,
      },
    },
  });

  res.status(200).json({
    success: true,
    data: updatedProduct,
    message: `Appeal ${decision} successfully`,
  });
});

// @desc    Delete a product (soft delete)
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
export const deleteProductByAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { shop: true },
  });

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (product.deletedAt) {
    res.status(400);
    throw new Error("Product is already deleted");
  }

  const updatedProduct = await prisma.product.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      isActive: false,
    },
  });

  // Log the activity
  await prisma.activityLog.create({
    data: {
      userId: req.user.id,
      action: "PRODUCT_DELETED",
      entityType: "PRODUCT",
      entityId: id,
      metadata: {
        productName: product.name,
        shopName: product.shop.name,
      },
    },
  });

  res.status(200).json({
    success: true,
    data: updatedProduct,
    message: "Product deleted successfully",
  });
});
