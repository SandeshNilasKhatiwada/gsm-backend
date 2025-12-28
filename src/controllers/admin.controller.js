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
  } = req.query;

  const skip = (page - 1) * limit;
  const where = {};

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
    where.userRoles = {
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
      take: limit,
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
        userRoles: {
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
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// @desc    Get all shops (admin)
// @route   GET /api/admin/shops
// @access  Private/Admin
export const getShops = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, verificationStatus, isBlocked } = req.query;
  const skip = (page - 1) * limit;

  const where = {};

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
