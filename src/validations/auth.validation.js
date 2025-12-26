import { z } from "zod";

// Register validation schema
export const registerSchema = z.object({
  body: z
    .object({
      email: z.string().email("Invalid email format"),
      username: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(30),
      password: z.string().min(8, "Password must be at least 8 characters"),
      confirmPassword: z.string().min(1, "Confirm password is required"),
      firstName: z.string().min(1).max(50).optional(),
      lastName: z.string().min(1).max(50).optional(),
      phoneNumber: z.string().optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),
});

// Login validation schema
export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
  }),
});

// Update profile validation schema
export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).max(50).optional(),
    lastName: z.string().min(1).max(50).optional(),
    phoneNumber: z.string().optional(),
    profilePictureUrl: z.string().url().optional(),
  }),
});

// Change password validation schema
export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
  }),
});
