import { prisma } from "../config/database.js";
import { generateSlug } from "../utils/slug.util.js";
import { getPagination, paginationResponse } from "../utils/pagination.util.js";
import { AppError } from "../utils/error.util.js";

class ProductService {
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

    // Verify shop ownership
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
    });

    if (!shop) {
      throw new AppError("Shop not found", 404);
    }

    if (shop.ownerId !== userId) {
      throw new AppError("Not authorized to add products to this shop", 403);
    }

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

    if (product.shop.ownerId !== userId) {
      throw new AppError("Not authorized to update this product", 403);
    }

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
  async getAllProducts(query) {
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

    const where = { isActive: true };

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
  async getProductById(productId) {
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

    if (product.shop.ownerId !== userId) {
      throw new AppError("Not authorized to delete this product", 403);
    }

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
}

export default new ProductService();
