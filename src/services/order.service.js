import { prisma } from "../config/database.js";
import { getPagination, paginationResponse } from "../utils/pagination.util.js";
import { AppError } from "../utils/error.util.js";

class OrderService {
  // Create order
  async createOrder(orderData, userId) {
    const { items, shippingAddress, paymentMethod, notes } = orderData;

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new AppError(`Product ${item.productId} not found`, 404);
      }

      if (product.quantity < item.quantity) {
        throw new AppError(`Insufficient stock for ${product.name}`, 400);
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
        total: itemTotal,
      });

      // Reduce stock
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          quantity: {
            decrement: item.quantity,
          },
        },
      });
    }

    const shippingCost = 100; // Fixed shipping cost
    const tax = subtotal * 0.13; // 13% tax
    const total = subtotal + shippingCost + tax;

    // Create order
    const order = await prisma.order.create({
      data: {
        userId,
        orderNumber: `ORD-${Date.now()}`,
        subtotal,
        shippingCost,
        tax,
        total,
        shippingAddress,
        paymentMethod,
        notes,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
          },
        },
      },
    });

    return order;
  }

  // Update order status
  async updateOrderStatus(orderId, status, userId) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              include: {
                shop: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    // Check if user is order owner or shop owner
    const isOwner = order.userId === userId;
    const isShopOwner = order.items.some(
      (item) => item.product.shop.ownerId === userId,
    );

    if (!isOwner && !isShopOwner) {
      throw new AppError("Not authorized to update this order", 403);
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: true,
              },
            },
          },
        },
      },
    });

    return updatedOrder;
  }

  // Update payment status
  async updatePaymentStatus(orderId, paymentStatus, transactionId, userId) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus,
        transactionId,
        paidAt: paymentStatus === "paid" ? new Date() : null,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: true,
              },
            },
          },
        },
      },
    });

    return updatedOrder;
  }

  // Get all orders with pagination and filters
  async getAllOrders(query, userId, userRoles) {
    const { page, limit, status, paymentStatus, search } = query;
    const { skip, take } = getPagination(page, limit);

    const where = {};

    // If not admin, only show user's orders
    const isAdmin = userRoles.some((role) => role.role.name === "admin");
    if (!isAdmin) {
      where.userId = userId;
    }

    if (status) {
      where.status = status;
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    if (search) {
      where.orderNumber = { contains: search, mode: "insensitive" };
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
            lastName: true,
              email: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  images: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.count({ where }),
    ]);

    return paginationResponse(orders, total, page, limit);
  }

  // Get order by ID
  async getOrderById(orderId, userId, userRoles) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            address: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: true,
                shop: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    logoUrl: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    // Check authorization
    const isAdmin = userRoles.some((role) => role.role.name === "admin");
    const isOwner = order.userId === userId;
    const isShopOwner = order.items.some(
      (item) => item.product.shop?.ownerId === userId,
    );

    if (!isAdmin && !isOwner && !isShopOwner) {
      throw new AppError("Not authorized to view this order", 403);
    }

    return order;
  }

  // Cancel order
  async cancelOrder(orderId, userId) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    if (order.userId !== userId) {
      throw new AppError("Not authorized to cancel this order", 403);
    }

    if (order.status !== "pending") {
      throw new AppError("Can only cancel pending orders", 400);
    }

    // Restore stock
    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          quantity: {
            increment: item.quantity,
          },
        },
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "cancelled",
        cancelledAt: new Date(),
      },
    });

    return updatedOrder;
  }
}

export default new OrderService();
