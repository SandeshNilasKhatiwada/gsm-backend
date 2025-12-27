import { prisma } from "./src/config/database.js";

console.log("prisma:", prisma);
console.log("prisma.user:", prisma.user);
console.log("typeof prisma:", typeof prisma);
console.log("typeof prisma.user:", typeof prisma.user);
console.log(
  "prisma keys:",
  Object.keys(prisma).filter((k) => !k.startsWith("_") && !k.startsWith("$")),
);

await prisma.$disconnect();
