import { prisma } from "../config/database.js";
import { generateSlug } from "../utils/slug.util.js";
import { getPagination, paginationResponse } from "../utils/pagination.util.js";
import { AppError } from "../utils/error.util.js";

class ShopService {
  // Create shop
  async createShop(shopData, ownerId) {
    const { name, description, address, phone, email, logo, banner } = shopData;

    // Generate slug
    const slug = generateSlug(name);

    const shop = await prisma.shop.create({
      data: {
        name,
        slug,
        description,
        address,
        phone,
        email,
        logoUrl: logo,
        bannerUrl: banner,
        ownerId,
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profilePictureUrl: true,
          },
        },
      },
    });

    return shop;
  }

  // Update shop
  async updateShop(shopId, updateData, userId) {
    // Check ownership or admin
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
    });

    if (!shop) {
      throw new AppError("Shop not found", 404);
    }

    if (shop.ownerId !== userId) {
      throw new AppError("Not authorized to update this shop", 403);
    }

    const updatedShop = await prisma.shop.update({
      where: { id: shopId },
      data: updateData,
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profilePictureUrl: true,
          },
        },
      },
    });

    return updatedShop;
  }

  // Get all shops with pagination and filters
  async getAllShops(query) {
    const { page, limit, search, category, isVerified, isBlocked, sortBy } =
      query;
    const { skip, take } = getPagination(page, limit);

    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (isVerified !== undefined) {
      where.isVerified = isVerified === "true";
    }

    if (isBlocked !== undefined) {
      where.isBlocked = isBlocked === "true";
    }

    const orderBy = {};
    if (sortBy === "rating") {
      orderBy.averageRating = "desc";
    } else if (sortBy === "followers") {
      orderBy.followersCount = "desc";
    } else {
      orderBy.createdAt = "desc";
    }

    const [shops, total] = await Promise.all([
      prisma.shop.findMany({
        where,
        skip,
        take,
        include: {
          owner: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              profilePictureUrl: true,
            },
          },
          _count: {
            select: {
              products: true,
              services: true,
              followers: true,
              reviews: true,
            },
          },
        },
        orderBy,
      }),
      prisma.shop.count({ where }),
    ]);

    return paginationResponse(shops, total, page, limit);
  }

  // Get shop by ID
  async getShopById(shopId) {
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profilePictureUrl: true,
            isVerified: true,
          },
        },
        staff: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                profilePictureUrl: true,
              },
            },
          },
        },
        rankingPoints: {
          orderBy: { date: "desc" },
          take: 1,
        },
        strikes: {
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            products: true,
            services: true,
            followers: true,
            reviews: true,
            posts: true,
          },
        },
      },
    });

    if (!shop) {
      throw new AppError("Shop not found", 404);
    }

    return shop;
  }

  // Verify shop
  async verifyShop(shopId, verifiedBy) {
    const shop = await prisma.shop.update({
      where: { id: shopId },
      data: {
        verificationStatus: "VERIFIED",
        verifiedAt: new Date(),
        verifiedBy: verifiedBy,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: verifiedBy,
        action: "VERIFY_SHOP",
        targetType: "Shop",
        targetId: shopId,
      },
    });

    return shop;
  }

  // Reject shop
  async rejectShop(shopId, reason, rejectedBy) {
    const shop = await prisma.shop.update({
      where: { id: shopId },
      data: {
        verificationStatus: "REJECTED",
        rejectionReason: reason || "Shop verification rejected",
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: rejectedBy,
        action: "REJECT_SHOP",
        targetType: "Shop",
        targetId: shopId,
        details: { reason },
      },
    });

    return shop;
  }

  // Block shop
  async blockShop(shopId, reason, blockedBy) {
    const shop = await prisma.shop.update({
      where: { id: shopId },
      data: {
        isBlocked: true,
        blockedReason: reason,
        blockedAt: new Date(),
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: blockedBy,
        action: "BLOCK_SHOP",
        targetType: "Shop",
        targetId: shopId,
        details: { reason },
      },
    });

    return shop;
  }

  // Unblock shop
  async unblockShop(shopId, unblockedBy) {
    const shop = await prisma.shop.update({
      where: { id: shopId },
      data: {
        isBlocked: false,
        blockedReason: null,
        blockedAt: null,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: unblockedBy,
        action: "UNBLOCK_SHOP",
        targetType: "Shop",
        targetId: shopId,
      },
    });

    return shop;
  }

  // Issue strike
  async issueStrike(shopId, strikeData, issuedBy) {
    const { reason, severity, expiresInDays } = strikeData;

    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    const strike = await prisma.shopStrike.create({
      data: {
        shopId,
        reason,
        severity,
        issuedBy,
        expiresAt,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: issuedBy,
        action: "ISSUE_STRIKE",
        targetType: "Shop",
        targetId: shopId,
        details: { reason, severity },
      },
    });

    return strike;
  }

  // Add staff
  async addStaff(shopId, staffData, addedBy) {
    const { userId, role, permissions } = staffData;

    // Check ownership
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
    });

    if (shop.ownerId !== addedBy) {
      throw new AppError("Not authorized to add staff", 403);
    }

    const staff = await prisma.shopStaff.create({
      data: {
        shopId,
        userId,
        role,
        permissions,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profilePictureUrl: true,
          },
        },
      },
    });

    return staff;
  }

  // Remove staff
  async removeStaff(shopId, staffId, removedBy) {
    // Check ownership
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
    });

    if (shop.ownerId !== removedBy) {
      throw new AppError("Not authorized to remove staff", 403);
    }

    await prisma.shopStaff.delete({
      where: { id: staffId },
    });

    return { message: "Staff removed successfully" };
  }

  // Follow shop
  async followShop(shopId, userId) {
    const existing = await prisma.shopFollower.findUnique({
      where: {
        shopId_userId: {
          shopId,
          userId,
        },
      },
    });

    if (existing) {
      throw new AppError("Already following this shop", 400);
    }

    const follower = await prisma.shopFollower.create({
      data: {
        shopId,
        userId,
      },
    });

    // Update followers count
    await prisma.shop.update({
      where: { id: shopId },
      data: {
        followersCount: {
          increment: 1,
        },
      },
    });

    return follower;
  }

  // Unfollow shop
  async unfollowShop(shopId, userId) {
    await prisma.shopFollower.delete({
      where: {
        shopId_userId: {
          shopId,
          userId,
        },
      },
    });

    // Update followers count
    await prisma.shop.update({
      where: { id: shopId },
      data: {
        followersCount: {
          decrement: 1,
        },
      },
    });

    return { message: "Unfollowed successfully" };
  }

  // Delete shop
  async deleteShop(shopId, userId) {
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
    });

    if (!shop) {
      throw new AppError("Shop not found", 404);
    }

    if (shop.ownerId !== userId) {
      throw new AppError("Not authorized to delete this shop", 403);
    }

    await prisma.shop.update({
      where: { id: shopId },
      data: {
        deletedAt: new Date(),
      },
    });

    return { message: "Shop deleted successfully" };
  }
}

export default new ShopService();
