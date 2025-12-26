import { z } from "zod";

// Create post validation
export const createPostSchema = z.object({
  body: z.object({
    shopId: z.string().uuid("Invalid shop ID format"),
    title: z.string().min(5, "Title must be at least 5 characters").max(200),
    content: z
      .string()
      .min(20, "Content must be at least 20 characters")
      .optional(),
    excerpt: z.string().max(500).optional(),
    featuredImageUrl: z.string().url().optional(),
    postType: z.enum(["blog", "service", "announcement"]).optional(),
    status: z.enum(["draft", "published"]).optional(),
  }),
});

// Update post validation
export const updatePostSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid post ID format"),
  }),
  body: z.object({
    title: z.string().min(5).max(200).optional(),
    content: z.string().min(20).optional(),
    excerpt: z.string().max(500).optional(),
    featuredImageUrl: z.string().url().optional(),
    postType: z.enum(["blog", "service", "announcement"]).optional(),
    status: z.enum(["draft", "published"]).optional(),
  }),
});

// Get post by ID validation
export const getPostByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid post ID format"),
  }),
});

// Delete post validation
export const deletePostSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid post ID format"),
  }),
});

// Get all posts validation
export const getAllPostsSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    shopId: z.string().uuid().optional(),
    postType: z.enum(["blog", "service", "announcement"]).optional(),
    status: z.enum(["draft", "published", "disabled"]).optional(),
  }),
});

// Disable post validation (admin only)
export const disablePostSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid post ID format"),
  }),
  body: z.object({
    reason: z.string().min(10, "Reason must be at least 10 characters"),
  }),
});
