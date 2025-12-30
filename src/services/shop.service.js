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
    // Check ownership - only owner can update shop
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
    });

    if (!shop) {
      throw new AppError("Shop not found", 404);
    }

    // Only shop owner can update shop information
    if (shop.ownerId !== userId) {
      throw new AppError(
        "Not authorized to update this shop. Only shop owner can modify shop information.",
        403,
      );
    }

    // Filter out fields that don't exist in the schema
    const { website, ...validUpdateData } = updateData;

    const updatedShop = await prisma.shop.update({
      where: { id: shopId },
      data: validUpdateData,
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
    const {
      page,
      limit,
      search,
      category,
      isVerified,
      isBlocked,
      sortBy,
      ownerId,
    } = query;
    const { skip, take } = getPagination(page, limit);

    const where = {
      deletedAt: null, // Exclude soft deleted shops
    };

    if (ownerId) {
      where.ownerId = ownerId;
    }

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
    // Try to find by ID first, then by slug
    const where =
      shopId.includes("-") && shopId.length > 30
        ? { id: shopId }
        : { slug: shopId };

    const shop = await prisma.shop.findFirst({
      where,
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
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        strikes: {
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
        entityType: "SHOP",
        entityId: shopId,
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
        entityType: "SHOP",
        entityId: shopId,
        metadata: { reason },
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
        entityType: "SHOP",
        entityId: shopId,
        metadata: { reason },
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
        entityType: "SHOP",
        entityId: shopId,
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
        entityType: "SHOP",
        entityId: shopId,
        metadata: { reason, severity },
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

  // Delete shop (soft delete with cascading)
  async deleteShop(shopId, userId) {
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
    });

    if (!shop) {
      throw new AppError("Shop not found", 404);
    }

    // Only shop owner can delete shop
    if (shop.ownerId !== userId) {
      throw new AppError(
        "Not authorized to delete this shop. Only shop owner can delete the shop.",
        403,
      );
    }

    const now = new Date();

    // Soft delete shop and all related data
    await prisma.$transaction(async (tx) => {
      // Delete shop
      await tx.shop.update({
        where: { id: shopId },
        data: { deletedAt: now },
      });

      // Soft delete all products
      await tx.product.updateMany({
        where: { shopId },
        data: { deletedAt: now },
      });

      // Soft delete all services
      await tx.service.updateMany({
        where: { shopId },
        data: { deletedAt: now },
      });

      // Soft delete all posts
      await tx.post.updateMany({
        where: { shopId },
        data: { deletedAt: now },
      });

      // Log the deletion
      await tx.activityLog.create({
        data: {
          userId,
          action: "delete_shop",
          entityType: "shop",
          entityId: shopId,
          metadata: { cascadedDelete: true },
        },
      });
    });

    return { message: "Shop and all related data deleted successfully" };
  }

  // Restore shop (admin only)
  async restoreShop(shopId, adminId) {
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
    });

    if (!shop) {
      throw new AppError("Shop not found", 404);
    }

    if (!shop.deletedAt) {
      throw new AppError("Shop is not deleted", 400);
    }

    // Restore shop and all related data
    await prisma.$transaction(async (tx) => {
      // Restore shop
      await tx.shop.update({
        where: { id: shopId },
        data: { deletedAt: null },
      });

      // Restore all products
      await tx.product.updateMany({
        where: { shopId, deletedAt: { not: null } },
        data: { deletedAt: null },
      });

      // Restore all services
      await tx.service.updateMany({
        where: { shopId, deletedAt: { not: null } },
        data: { deletedAt: null },
      });

      // Restore all posts
      await tx.post.updateMany({
        where: { shopId, deletedAt: { not: null } },
        data: { deletedAt: null },
      });

      // Log the restoration
      await tx.activityLog.create({
        data: {
          userId: adminId,
          action: "restore_shop",
          entityType: "shop",
          entityId: shopId,
          metadata: { cascadedRestore: true },
        },
      });
    });

    return { message: "Shop and all related data restored successfully" };
  }
}

export default new ShopService();
