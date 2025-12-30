-- AlterTable
ALTER TABLE "products" ADD COLUMN     "appeal_message" TEXT,
ADD COLUMN     "appeal_response" TEXT,
ADD COLUMN     "appeal_reviewed_at" TIMESTAMP(3),
ADD COLUMN     "appeal_reviewed_by" TEXT,
ADD COLUMN     "appeal_status" TEXT,
ADD COLUMN     "appealed_at" TIMESTAMP(3),
ADD COLUMN     "blocked_at" TIMESTAMP(3),
ADD COLUMN     "blocked_by" TEXT;
