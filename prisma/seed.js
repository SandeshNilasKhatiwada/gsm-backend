import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Create permissions
  console.log("Creating permissions...");
  const permissions = await Promise.all([
    // User permissions
    prisma.permission.upsert({
      where: { name: "user.read" },
      update: {},
      create: {
        name: "user.read",
        resource: "user",
        action: "read",
        description: "Read user information",
      },
    }),
    prisma.permission.upsert({
      where: { name: "user.write" },
      update: {},
      create: {
        name: "user.write",
        resource: "user",
        action: "write",
        description: "Create and update users",
      },
    }),
    prisma.permission.upsert({
      where: { name: "user.delete" },
      update: {},
      create: {
        name: "user.delete",
        resource: "user",
        action: "delete",
        description: "Delete users",
      },
    }),
    // Shop permissions
    prisma.permission.upsert({
      where: { name: "shop.read" },
      update: {},
      create: {
        name: "shop.read",
        resource: "shop",
        action: "read",
        description: "Read shop information",
      },
    }),
    prisma.permission.upsert({
      where: { name: "shop.write" },
      update: {},
      create: {
        name: "shop.write",
        resource: "shop",
        action: "write",
        description: "Create and update shops",
      },
    }),
    prisma.permission.upsert({
      where: { name: "shop.delete" },
      update: {},
      create: {
        name: "shop.delete",
        resource: "shop",
        action: "delete",
        description: "Delete shops",
      },
    }),
    // Product permissions
    prisma.permission.upsert({
      where: { name: "product.read" },
      update: {},
      create: {
        name: "product.read",
        resource: "product",
        action: "read",
        description: "Read product information",
      },
    }),
    prisma.permission.upsert({
      where: { name: "product.write" },
      update: {},
      create: {
        name: "product.write",
        resource: "product",
        action: "write",
        description: "Create and update products",
      },
    }),
    prisma.permission.upsert({
      where: { name: "product.delete" },
      update: {},
      create: {
        name: "product.delete",
        resource: "product",
        action: "delete",
        description: "Delete products",
      },
    }),
    // Order permissions
    prisma.permission.upsert({
      where: { name: "order.read" },
      update: {},
      create: {
        name: "order.read",
        resource: "order",
        action: "read",
        description: "Read order information",
      },
    }),
    prisma.permission.upsert({
      where: { name: "order.write" },
      update: {},
      create: {
        name: "order.write",
        resource: "order",
        action: "write",
        description: "Create and update orders",
      },
    }),
    // Admin permissions
    prisma.permission.upsert({
      where: { name: "admin.all" },
      update: {},
      create: {
        name: "admin.all",
        resource: "admin",
        action: "all",
        description: "Full administrative access",
      },
    }),
  ]);

  console.log(`✅ Created ${permissions.length} permissions`);

  // Create roles
  console.log("Creating roles...");
  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: {
      name: "admin",
      description: "Administrator role with full access",
    },
  });

  const shopOwnerRole = await prisma.role.upsert({
    where: { name: "shop_owner" },
    update: {},
    create: {
      name: "shop_owner",
      description: "Shop owner role",
    },
  });

  const customerRole = await prisma.role.upsert({
    where: { name: "customer" },
    update: {},
    create: {
      name: "customer",
      description: "Regular customer role",
    },
  });

  console.log("✅ Created 3 roles");

  // Assign permissions to admin role
  console.log("Assigning permissions to roles...");
  for (const permission of permissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }

  console.log("✅ Assigned permissions to admin role");

  // Create admin user
  console.log("Creating admin user...");
  const hashedPassword = await bcrypt.hash("admin123", 10);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@gsm.com" },
    update: {},
    create: {
      email: "admin@gsm.com",
      username: "admin",
      passwordHash: hashedPassword,
      firstName: "System",
      lastName: "Administrator",
      phoneNumber: "1234567890",
      isVerified: true,
      isActive: true,
      emailVerifiedAt: new Date(),
    },
  });

  // Assign admin role to admin user
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
      status: "approved",
    },
  });

  console.log("✅ Created admin user");
  console.log("\n📋 Admin credentials:");
  console.log("Email: admin@gsm.com");
  console.log("Password: admin123");
  console.log("\n🌱 Database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
