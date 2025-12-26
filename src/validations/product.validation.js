import { z } from "zod";

// Create product validation
export const createProductSchema = z.object({
  body: z.object({
    shopId: z.string().uuid("Invalid shop ID format"),
    name: z
      .string()
      .min(3, "Product name must be at least 3 characters")
      .max(200),
    description: z.string().min(10).max(2000).optional(),
    price: z.number().positive("Price must be positive"),
    compareAtPrice: z.number().positive().optional(),
    costPerItem: z.number().positive().optional(),
    sku: z.string().optional(),
    barcode: z.string().optional(),
    quantity: z.number().int().min(0, "Quantity cannot be negative").optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    images: z.array(z.string().url()).optional(),
  }),
});

// Update product validation
export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid product ID format"),
  }),
  body: z.object({
    name: z.string().min(3).max(200).optional(),
    description: z.string().min(10).max(2000).optional(),
    price: z.number().positive().optional(),
    compareAtPrice: z.number().positive().optional(),
    costPerItem: z.number().positive().optional(),
    sku: z.string().optional(),
    barcode: z.string().optional(),
    quantity: z.number().int().min(0).optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    images: z.array(z.string().url()).optional(),
    isActive: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
  }),
});

// Get product by ID validation
export const getProductByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid product ID format"),
  }),
});

// Delete product validation
export const deleteProductSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid product ID format"),
  }),
});

// Get all products validation
export const getAllProductsSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    shopId: z.string().uuid().optional(),
    category: z.string().optional(),
    minPrice: z.string().optional(),
    maxPrice: z.string().optional(),
    isFeatured: z.enum(["true", "false"]).optional(),
    isActive: z.enum(["true", "false"]).optional(),
    sortBy: z
      .enum(["price", "createdAt", "averageRating", "totalSales"])
      .optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  }),
});
