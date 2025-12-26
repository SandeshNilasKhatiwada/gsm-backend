import { z } from "zod";

// Create shop validation
export const createShopSchema = z.object({
  body: z.object({
    name: z.string().min(3, "Shop name must be at least 3 characters").max(100),
    description: z.string().min(10).max(1000).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    documentationUrls: z.array(z.string().url()).optional(),
  }),
});

// Update shop validation
export const updateShopSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid shop ID format"),
  }),
  body: z.object({
    name: z.string().min(3).max(100).optional(),
    description: z.string().min(10).max(1000).optional(),
    logoUrl: z.string().url().optional(),
    bannerUrl: z.string().url().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    documentationUrls: z.array(z.string().url()).optional(),
  }),
});

// Get shop by ID validation
export const getShopByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid shop ID format"),
  }),
});

// Delete shop validation
export const deleteShopSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid shop ID format"),
  }),
});

// Verify shop validation
export const verifyShopSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid shop ID format"),
  }),
  body: z.object({
    status: z.enum(["approved", "rejected"]),
    rejectionReason: z.string().min(10).optional(),
  }),
});

// Block shop validation
export const blockShopSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid shop ID format"),
  }),
  body: z.object({
    reason: z.string().min(10, "Block reason must be at least 10 characters"),
  }),
});

// Issue strike validation
export const issueStrikeSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid shop ID format"),
  }),
  body: z.object({
    reason: z.string().min(10, "Strike reason must be at least 10 characters"),
    severity: z.enum(["warning", "minor", "major", "critical"]),
    actionTaken: z.enum(["warning", "temporary_suspension", "permanent_ban"]),
  }),
});

// Add staff validation
export const addStaffSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid shop ID format"),
  }),
  body: z.object({
    userId: z.string().uuid("Invalid user ID format"),
    role: z.enum(["manager", "editor", "viewer"]),
  }),
});

// Remove staff validation
export const removeStaffSchema = z.object({
  params: z.object({
    shopId: z.string().uuid("Invalid shop ID format"),
    userId: z.string().uuid("Invalid user ID format"),
  }),
});

// Follow/Unfollow shop validation
export const followShopSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid shop ID format"),
  }),
});

// Get all shops validation
export const getAllShopsSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    verificationStatus: z.enum(["pending", "approved", "rejected"]).optional(),
    isBlocked: z.enum(["true", "false"]).optional(),
    sortBy: z.enum(["rankingScore", "totalSales", "createdAt"]).optional(),
  }),
});
