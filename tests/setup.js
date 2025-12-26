import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Global test setup
beforeAll(async () => {
  // Clean up database before tests
  await cleanDatabase();
});

afterAll(async () => {
  // Clean up after all tests
  await cleanDatabase();
  await prisma.$disconnect();
});

// Clean database before each test
beforeEach(async () => {
  await cleanDatabase();
});

// Clean database
async function cleanDatabase() {
  const tables = [
    "activity_logs",
    "user_warnings",
    "order_items",
    "orders",
    "comments",
    "reviews",
    "shop_strikes",
    "ranking_points",
    "shop_followers",
    "shop_staff",
    "products",
    "services",
    "posts",
    "shops",
    "user_roles",
    "role_permissions",
    "permissions",
    "roles",
    "users",
  ];

  for (const table of tables) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
  }
}

// Export test database instance
export { prisma };
