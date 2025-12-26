import prisma from "../config/database.js";
import { AppError } from "../utils/error.util.js";

class ServiceService {
  async createService(shopId, userId, data) {
    // Verify shop exists and user is owner or staff
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      include: {
        staff: {
          where: { userId },
        },
      },
    });

    if (!shop) {
      throw new AppError("Shop not found", 404);
    }

    if (shop.ownerId !== userId && shop.staff.length === 0) {
      throw new AppError("You don't have permission to create services for this shop", 403);
    }

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
    const skip = (page - 1) * limit;

    const where = { shopId };

    if (isActive !== undefined) {
      where.isActive = isActive === "true";
    }

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        skip,
        take: limit,
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
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAllServices(filters = {}) {
    const { page = 1, limit = 20, search, isActive, minPrice, maxPrice } = filters;
    const skip = (page - 1) * limit;

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
        take: limit,
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
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
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
      include: {
        shop: {
          include: {
            staff: {
              where: { userId },
            },
          },
        },
      },
    });

    if (!service) {
      throw new AppError("Service not found", 404);
    }

    if (service.shop.ownerId !== userId && service.shop.staff.length === 0) {
      throw new AppError("You don't have permission to update this service", 403);
    }

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
      include: {
        shop: {
          include: {
            staff: {
              where: { userId },
            },
          },
        },
      },
    });

    if (!service) {
      throw new AppError("Service not found", 404);
    }

    if (service.shop.ownerId !== userId && service.shop.staff.length === 0) {
      throw new AppError("You don't have permission to delete this service", 403);
    }

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
