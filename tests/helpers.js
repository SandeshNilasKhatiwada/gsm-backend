import bcrypt from "bcryptjs";
import { prisma } from "./setup.js";

export const testUsers = {
  admin: {
    email: "admin@test.com",
    username: "adminuser",
    password: "Admin123!",
    firstName: "Admin",
    lastName: "User",
  },
  shopOwner: {
    email: "shopowner@test.com",
    username: "shopowner",
    password: "Shop123!",
    firstName: "Shop",
    lastName: "Owner",
  },
  customer: {
    email: "customer@test.com",
    username: "customer",
    password: "Customer123!",
    firstName: "Test",
    lastName: "Customer",
  },
};

export async function createTestUser(userData, isAdmin = false) {
  const passwordHash = await bcrypt.hash(userData.password, 10);
  const user = await prisma.user.create({
    data: {
      email: userData.email,
      username: userData.username,
      passwordHash,
      firstName: userData.firstName,
      lastName: userData.lastName,
      isVerified: true,
      isActive: true,
    },
  });

  // If admin, create admin role and assign it
  if (isAdmin) {
    // Check if admin role exists, create if not
    let adminRole = await prisma.role.findFirst({
      where: { name: "admin" },
    });

    if (!adminRole) {
      adminRole = await prisma.role.create({
        data: {
          name: "admin",
          description: "Administrator role",
          isSystemRole: true,
        },
      });

      // Create manage_users permission
      const manageUsersPermission = await prisma.permission.create({
        data: {
          name: "manage_users",
          resource: "users",
          action: "manage",
          description: "Can manage users",
        },
      });

      // Assign permission to admin role
      await prisma.rolePermission.create({
        data: {
          roleId: adminRole.id,
          permissionId: manageUsersPermission.id,
        },
      });
    }

    // Assign role to user
    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: adminRole.id,
        status: "approved",
      },
    });
  }

  return user;
}

export async function createTestShop(ownerId, data = {}) {
  return await prisma.shop.create({
    data: {
      ownerId,
      name: data.name || "Test Shop",
      slug: data.slug || "test-shop",
      description: data.description || "Test shop description",
      verificationStatus: data.verificationStatus || "pending",
      isActive: data.isActive !== undefined ? data.isActive : true,
      ...data,
    },
  });
}

export async function createTestProduct(shopId, createdBy, data = {}) {
  return await prisma.product.create({
    data: {
      shopId,
      createdBy,
      name: data.name || "Test Product",
      slug: data.slug || "test-product",
      description: data.description || "Test product description",
      price: data.price || 99.99,
      quantity: data.quantity !== undefined ? data.quantity : 10,
      isActive: data.isActive !== undefined ? data.isActive : true,
      ...data,
    },
  });
}

export async function createTestPost(shopId, authorId, data = {}) {
  return await prisma.post.create({
    data: {
      shopId,
      authorId,
      title: data.title || "Test Post",
      slug: data.slug || "test-post",
      content: data.content || "Test post content",
      postType: data.postType || "blog",
      status: data.status || "published",
      ...data,
    },
  });
}

export async function createTestOrder(userId, shopId, data = {}) {
  const orderNumber = `ORD-${Date.now()}`;
  return await prisma.order.create({
    data: {
      userId,
      shopId,
      orderNumber,
      totalAmount: data.totalAmount || 99.99,
      status: data.status || "pending",
      paymentStatus: data.paymentStatus || "pending",
      shippingAddress: data.shippingAddress || {
        street: "123 Test St",
        city: "Test City",
        country: "Test Country",
        postalCode: "12345",
      },
      ...data,
    },
  });
}

export function extractToken(setCookieHeader) {
  if (!setCookieHeader) return null;
  const cookies = Array.isArray(setCookieHeader)
    ? setCookieHeader
    : [setCookieHeader];
  const tokenCookie = cookies.find((cookie) => cookie.startsWith("token="));
  if (!tokenCookie) return null;
  const match = tokenCookie.match(/token=([^;]+)/);
  return match ? match[1] : null;
}

export async function loginAndGetToken(request, email, password) {
  const response = await request
    .post("/api/auth/login")
    .send({ email, password });

  return extractToken(response.headers["set-cookie"]);
}
