import { prisma } from "../config/database.js";
import { generateSlug } from "../utils/slug.util.js";
import { getPagination, paginationResponse } from "../utils/pagination.util.js";
import { AppError } from "../utils/error.util.js";

class ProductService {
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

  // Helper method to check if user is admin
  async checkIfUserIsAdmin(userId) {
    const userRole = await prisma.userRole.findFirst({
      where: {
        userId: userId,
        role: {
          name: "admin",
        },
        status: "approved",
      },
    });

    return !!userRole;
  }

  // Helper method to check if user owns or manages a shop
  async checkIfUserCanAccessShopProduct(userId, shopId) {
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
      return false;
    }

    const isOwner = shop.ownerId === userId;
    const isStaff = shop.staff.some((s) => s.userId === userId);

    return isOwner || isStaff;
  }

  // Create product
  async createProduct(productData, shopId, userId) {
    const {
      name,
      description,
      price,
      compareAtPrice,
      quantity,
      sku,
      images,
      category,
      tags,
      isActive,
    } = productData;

    // Verify shop ownership or staff access
    await this.checkShopManagePermission(shopId, userId, ["manager", "editor"]);

    // Generate slug
    const slug = generateSlug(name);

    const product = await prisma.product.create({
      data: {
        shopId,
        name,
        slug,
        description,
        price,
        compareAtPrice,
        quantity,
        sku,
        images,
        category,
        tags,
        isActive,
        createdBy: userId,
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

    return product;
  }

  // Update product
  async updateProduct(productId, updateData, userId) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { shop: true },
    });

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    // Verify shop ownership or staff access
    await this.checkShopManagePermission(product.shopId, userId, [
      "manager",
      "editor",
    ]);

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: updateData,
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

    return updatedProduct;
  }

  // Get all products with pagination and filters
  async getAllProducts(query, user = null) {
    const {
      page,
      limit,
      search,
      category,
      shopId,
      minPrice,
      maxPrice,
      sortBy,
    } = query;
    const { skip, take } = getPagination(page, limit);

    // Check if user is admin or shop owner/staff
    let isAdmin = false;
    let canAccessShop = false;
    
    if (user) {
      isAdmin = await this.checkIfUserIsAdmin(user.id);
      
      // If filtering by shopId, check if user can access that shop
      if (shopId && !isAdmin) {
        canAccessShop = await this.checkIfUserCanAccessShopProduct(user.id, shopId);
      }
    }

    const where = {
      isActive: true,
      deletedAt: null, // Exclude soft deleted products
    };

    // Only exclude blocked products if user is not admin and not shop owner/staff
    if (!isAdmin && !canAccessShop) {
      where.isBlocked = false;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { has: search } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (shopId) {
      where.shopId = shopId;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    const orderBy = {};
    if (sortBy === "price-asc") {
      orderBy.price = "asc";
    } else if (sortBy === "price-desc") {
      orderBy.price = "desc";
    } else if (sortBy === "rating") {
      orderBy.averageRating = "desc";
    } else {
      orderBy.createdAt = "desc";
    }

    const [products, total] = await Promise.all([
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
              verificationStatus: true,
            },
          },
          _count: {
            select: {
              reviews: true,
            },
          },
        },
        orderBy,
      }),
      prisma.product.count({ where }),
    ]);

    return paginationResponse(products, total, page, limit);
  }

  // Get product by ID
  async getProductById(productId, user = null) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
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

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    // Check if product is blocked - allow admins and shop owners to view blocked products
    if (product.isBlocked) {
      if (user) {
        // Check if user is admin
        const isAdmin = await this.checkIfUserIsAdmin(user.id);
        
        // Check if user owns/manages the shop
        const canAccessShop = await this.checkIfUserCanAccessShopProduct(user.id, product.shopId);
        
        if (!isAdmin && !canAccessShop) {
          throw new AppError("This product is currently unavailable", 403);
        }
      } else {
        // No user logged in, block access
        throw new AppError("This product is currently unavailable", 403);
      }
    }

    return product;
  }

  // Delete product
  async deleteProduct(productId, userId) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { shop: true },
    });

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    // Verify shop ownership or staff access (manager only for deletion)
    await this.checkShopManagePermission(product.shopId, userId, ["manager"]);

    await prisma.product.update({
      where: { id: productId },
      data: { deletedAt: new Date() },
    });

    return { message: "Product deleted successfully" };
  }

  // Update stock
  async updateStock(productId, quantity) {
    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        quantity: {
          increment: quantity,
        },
      },
    });

    return product;
  }

  // Submit appeal for blocked product
  async submitAppeal(productId, message, userId) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    if (!product.isBlocked) {
      throw new AppError("This product is not blocked", 400);
    }

    // Verify shop ownership or staff access
    await this.checkShopManagePermission(product.shopId, userId, [
      "manager",
      "editor",
    ]);

    // Check if there's already a pending appeal
    if (product.appealStatus === "pending") {
      throw new AppError("An appeal is already pending for this product", 400);
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        appealStatus: "pending",
        appealMessage: message,
        appealedAt: new Date(),
        appealResponse: null,
        appealReviewedAt: null,
        appealReviewedBy: null,
      },
    });

    return updatedProduct;
  }

  // Get blocked products for shop owner
  async getMyBlockedProducts(userId, query) {
    const { page, limit } = query;
    const { skip, take } = getPagination(page, limit);

    // Find all shops where user is owner or staff
    const shops = await prisma.shop.findMany({
      where: {
        OR: [
          { ownerId: userId },
          {
            staff: {
              some: {
                userId: userId,
                removedAt: null,
              },
            },
          },
        ],
      },
      select: { id: true },
    });

    const shopIds = shops.map((shop) => shop.id);

    if (shopIds.length === 0) {
      return paginationResponse([], 0, page, limit);
    }

    const where = {
      isBlocked: true,
      shopId: { in: shopIds },
      deletedAt: null,
    };

    const [products, total] = await Promise.all([
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
        orderBy: { blockedAt: "desc" },
      }),
      prisma.product.count({ where }),
    ]);

    return paginationResponse(products, total, page, limit);
  }
}

export default new ProductService();
