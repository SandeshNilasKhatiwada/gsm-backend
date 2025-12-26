import prisma from "../config/database.js";
import { Decimal } from "@prisma/client/runtime/library.js";

class RankingService {
  // Point allocation constants
  static POINTS = {
    SHOP_VERIFICATION: 50,
    COMPLETE_DOCUMENTATION: 30,
    FIRST_SALE: 20,
    VERIFIED_REVIEW_5_STAR: 5,
    VERIFIED_REVIEW_4_STAR: 3,
    VERIFIED_REVIEW_3_STAR: 1,
    VERIFIED_REVIEW_2_STAR: -1,
    VERIFIED_REVIEW_1_STAR: -3,
    SALE_MULTIPLIER: 0.1, // 0.1 point per dollar
    STRIKE_PENALTY: -100,
  };

  async calculateShopRanking(shopId) {
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      include: {
        rankingPoints: true,
        strikes: {
          where: {
            isActive: true,
          },
        },
        reviews: {
          where: {
            deletedAt: null,
          },
        },
      },
    });

    if (!shop) {
      throw new Error("Shop not found");
    }

    let totalPoints = 0;

    // Add points from ranking_points table
    totalPoints += shop.rankingPoints.reduce((sum, rp) => sum + rp.points, 0);

    // Calculate review-based points
    const reviewPoints = shop.reviews.reduce((sum, review) => {
      if (review.rating === 5)
        return sum + RankingService.POINTS.VERIFIED_REVIEW_5_STAR;
      if (review.rating === 4)
        return sum + RankingService.POINTS.VERIFIED_REVIEW_4_STAR;
      if (review.rating === 3)
        return sum + RankingService.POINTS.VERIFIED_REVIEW_3_STAR;
      if (review.rating === 2)
        return sum + RankingService.POINTS.VERIFIED_REVIEW_2_STAR;
      if (review.rating === 1)
        return sum + RankingService.POINTS.VERIFIED_REVIEW_1_STAR;
      return sum;
    }, 0);

    totalPoints += reviewPoints;

    // Calculate sales-based points
    const salesPoints =
      parseFloat(shop.totalSales) * RankingService.POINTS.SALE_MULTIPLIER;
    totalPoints += salesPoints;

    // Apply strike penalties
    const strikePenalty =
      shop.strikes.length * RankingService.POINTS.STRIKE_PENALTY;
    totalPoints += strikePenalty;

    // Ensure minimum 0 points
    totalPoints = Math.max(0, totalPoints);

    // Update shop ranking score
    await prisma.shop.update({
      where: { id: shopId },
      data: {
        rankingScore: new Decimal(totalPoints),
      },
    });

    return {
      shopId,
      totalPoints,
      breakdown: {
        manualPoints: shop.rankingPoints.reduce(
          (sum, rp) => sum + rp.points,
          0,
        ),
        reviewPoints,
        salesPoints,
        strikePenalty,
      },
    };
  }

  async awardPoints(shopId, points, reason) {
    const rankingPoint = await prisma.rankingPoint.create({
      data: {
        shopId,
        points,
        reason,
      },
    });

    // Recalculate ranking
    await this.calculateShopRanking(shopId);

    return rankingPoint;
  }

  async awardVerificationPoints(shopId) {
    return this.awardPoints(
      shopId,
      RankingService.POINTS.SHOP_VERIFICATION,
      "Shop verified by admin",
    );
  }

  async awardDocumentationPoints(shopId) {
    return this.awardPoints(
      shopId,
      RankingService.POINTS.COMPLETE_DOCUMENTATION,
      "Complete shop documentation uploaded",
    );
  }

  async awardFirstSalePoints(shopId) {
    return this.awardPoints(
      shopId,
      RankingService.POINTS.FIRST_SALE,
      "First sale completed",
    );
  }

  async getTopRankedShops(limit = 10) {
    const shops = await prisma.shop.findMany({
      where: {
        isActive: true,
        isBlocked: false,
        verificationStatus: "verified",
      },
      orderBy: {
        rankingScore: "desc",
      },
      take: limit,
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            products: true,
            followers: true,
            reviews: true,
          },
        },
      },
    });

    return shops;
  }

  async getShopRankingDetails(shopId) {
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      include: {
        rankingPoints: {
          orderBy: { createdAt: "desc" },
        },
        strikes: {
          where: { isActive: true },
        },
        reviews: {
          where: { deletedAt: null },
          select: {
            rating: true,
          },
        },
      },
    });

    if (!shop) {
      throw new Error("Shop not found");
    }

    const reviewStats = shop.reviews.reduce((stats, review) => {
      stats[`star${review.rating}`] = (stats[`star${review.rating}`] || 0) + 1;
      return stats;
    }, {});

    return {
      currentRankingScore: parseFloat(shop.rankingScore),
      totalSales: parseFloat(shop.totalSales),
      strikeCount: shop.strikeCount,
      rankingHistory: shop.rankingPoints,
      activeStrikes: shop.strikes,
      reviewStats,
    };
  }
}

export default new RankingService();
