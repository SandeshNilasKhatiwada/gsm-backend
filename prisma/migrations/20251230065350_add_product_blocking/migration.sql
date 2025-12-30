-- AlterTable
ALTER TABLE "products" ADD COLUMN     "blocked_reason" TEXT,
ADD COLUMN     "is_blocked" BOOLEAN NOT NULL DEFAULT false;
