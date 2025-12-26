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
        description: "Read user information",
        category: "user",
      },
    }),
    prisma.permission.upsert({
      where: { name: "user.write" },
      update: {},
      create: {
        name: "user.write",
        description: "Create and update users",
        category: "user",
      },
    }),
    prisma.permission.upsert({
      where: { name: "user.delete" },
      update: {},
      create: {
        name: "user.delete",
        description: "Delete users",
        category: "user",
      },
    }),
    // Shop permissions
    prisma.permission.upsert({
      where: { name: "shop.read" },
      update: {},
      create: {
        name: "shop.read",
        description: "Read shop information",
        category: "shop",
      },
    }),
    prisma.permission.upsert({
      where: { name: "shop.write" },
      update: {},
      create: {
        name: "shop.write",
        description: "Create and update shops",
        category: "shop",
      },
    }),
    prisma.permission.upsert({
      where: { name: "shop.delete" },
      update: {},
      create: {
        name: "shop.delete",
        description: "Delete shops",
        category: "shop",
      },
    }),
    // Product permissions
    prisma.permission.upsert({
      where: { name: "product.read" },
      update: {},
      create: {
        name: "product.read",
        description: "Read product information",
        category: "product",
      },
    }),
    prisma.permission.upsert({
      where: { name: "product.write" },
      update: {},
      create: {
        name: "product.write",
        description: "Create and update products",
        category: "product",
      },
    }),
    prisma.permission.upsert({
      where: { name: "product.delete" },
      update: {},
      create: {
        name: "product.delete",
        description: "Delete products",
        category: "product",
      },
    }),
    // Order permissions
    prisma.permission.upsert({
      where: { name: "order.read" },
      update: {},
      create: {
        name: "order.read",
        description: "Read order information",
        category: "order",
      },
    }),
    prisma.permission.upsert({
      where: { name: "order.write" },
      update: {},
      create: {
        name: "order.write",
        description: "Create and update orders",
        category: "order",
      },
    }),
    // Admin permissions
    prisma.permission.upsert({
      where: { name: "admin.all" },
      update: {},
      create: {
        name: "admin.all",
        description: "Full administrative access",
        category: "admin",
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
      password: hashedPassword,
      fullName: "System Administrator",
      phoneNumber: "1234567890",
      isVerified: true,
      isActive: true,
      verifiedAt: new Date(),
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
