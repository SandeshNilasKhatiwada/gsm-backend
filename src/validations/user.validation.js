import { z } from "zod";

// Get all users validation
export const getAllUsersSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    role: z.string().optional(),
    isVerified: z.enum(["true", "false"]).optional(),
    isBlocked: z.enum(["true", "false"]).optional(),
  }),
});

// Get user by ID validation
export const getUserByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid user ID format"),
  }),
});

// Update user validation
export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid user ID format"),
  }),
  body: z.object({
    firstName: z.string().min(1).max(50).optional(),
    lastName: z.string().min(1).max(50).optional(),
    phoneNumber: z.string().optional(),
    isVerified: z.boolean().optional(),
    isActive: z.boolean().optional(),
  }),
});

// Block user validation
export const blockUserSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid user ID format"),
  }),
  body: z.object({
    reason: z.string().min(10, "Block reason must be at least 10 characters"),
  }),
});

// Unblock user validation
export const unblockUserSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid user ID format"),
  }),
});

// Delete user validation
export const deleteUserSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid user ID format"),
  }),
});

// Warn user validation
export const warnUserSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid user ID format"),
  }),
  body: z.object({
    reason: z.string().min(10, "Warning reason must be at least 10 characters"),
    severity: z.enum(["low", "medium", "high"]),
  }),
});

// Verify user validation
export const verifyUserSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid user ID format"),
  }),
});
