import prisma from "../config/database.js";
import { AppError } from "../utils/error.util.js";

class ServiceService {
  // Helper method to check if user can manage shop (owner or staff with appropriate role)
  async checkShopManagePermission(
    shopId,
    userId,
    requiredRoles = ["manager", "editor"],
  ) {
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      include: {
        staff: {
          where: {
            userId: userId,
            removedAt: null,
          },
        },
      },
    });

    if (!shop) {
      throw new AppError("Shop not found", 404);
    }

    const isOwner = shop.ownerId === userId;
    const staffMember = shop.staff.find((s) => s.userId === userId);
    const hasRequiredRole =
      staffMember && requiredRoles.includes(staffMember.role);

    if (!isOwner && !hasRequiredRole) {
      throw new AppError(
        `Not authorized. Only shop owner or staff with ${requiredRoles.join(
          "/",
        )} role can perform this action.`,
        403,
      );
    }

    return shop;
  }
  async createService(shopId, userId, data) {
    // Verify shop exists and user is owner or staff with manager/editor role
    await this.checkShopManagePermission(shopId, userId, ["manager", "editor"]);

    const service = await prisma.service.create({
      data: {
        shopId,
        title: data.title,
        slug: data.slug || data.title.toLowerCase().replace(/\s+/g, "-"),
        description: data.description,
        price: data.price,
        duration: data.duration,
        availability: data.availability || {},
      },
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
    });

    return service;
  }

  async getShopServices(shopId, filters = {}) {
    const { page = 1, limit = 20, isActive } = filters;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where = { shopId };

    if (isActive !== undefined) {
      where.isActive = isActive === "true";
    }

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          shop: {
            select: {
              id: true,
              name: true,
              slug: true,
              logoUrl: true,
            },
          },
          _count: {
            select: {
              reviews: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.service.count({ where }),
    ]);

    return {
      services,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  async getAllServices(filters = {}) {
    const {
      page = 1,
      limit = 20,
      search,
      isActive,
      minPrice,
      maxPrice,
    } = filters;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive === "true";
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          shop: {
            select: {
              id: true,
              name: true,
              slug: true,
              logoUrl: true,
              verificationStatus: true,
            },
          },
          _count: {
            select: {
              reviews: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.service.count({ where }),
    ]);

    return {
      services,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  async getServiceById(serviceId) {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            verificationStatus: true,
          },
        },
        reviews: {
          where: { deletedAt: null },
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
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    });

    if (!service) {
      throw new AppError("Service not found", 404);
    }

    return service;
  }

  async updateService(serviceId, userId, data) {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw new AppError("Service not found", 404);
    }

    // Verify shop ownership or staff access with manager/editor role
    await this.checkShopManagePermission(service.shopId, userId, [
      "manager",
      "editor",
    ]);

    const updatedService = await prisma.service.update({
      where: { id: serviceId },
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        price: data.price,
        duration: data.duration,
        availability: data.availability,
        isActive: data.isActive,
      },
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
    });

    return updatedService;
  }

  async deleteService(serviceId, userId) {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw new AppError("Service not found", 404);
    }

    // Verify shop ownership or staff access with manager role (deletion is sensitive)
    await this.checkShopManagePermission(service.shopId, userId, ["manager"]);

    await prisma.service.delete({
      where: { id: serviceId },
    });

    return { message: "Service deleted successfully" };
  }

  async addReview(serviceId, userId, data) {
    const service = await this.getServiceById(serviceId);

    // Check if user already reviewed this service
    const existingReview = await prisma.review.findFirst({
      where: {
        reviewableType: "service",
        reviewableId: serviceId,
        userId,
        deletedAt: null,
      },
    });

    if (existingReview) {
      throw new AppError("You have already reviewed this service", 400);
    }

    const review = await prisma.review.create({
      data: {
        reviewableType: "service",
        reviewableId: serviceId,
        userId,
        rating: data.rating,
        comment: data.comment,
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

    // Update service average rating
    const reviews = await prisma.review.findMany({
      where: {
        reviewableType: "service",
        reviewableId: serviceId,
        deletedAt: null,
      },
    });

    const averageRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await prisma.service.update({
      where: { id: serviceId },
      data: { averageRating },
    });

    return review;
  }
}

export default new ServiceService();
