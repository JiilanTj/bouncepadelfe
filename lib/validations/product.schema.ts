import { z } from "zod";

// ------------------------------------------------------------------------------
// Product Type Schema
// ------------------------------------------------------------------------------

export const productTypeSchema = z.enum(["SELL", "RENT"]);

// ------------------------------------------------------------------------------
// Create Product Schema
// ------------------------------------------------------------------------------

export const createProductSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  price: z
    .number()
    .positive("Price must be positive"),
  cost_price: z
    .number()
    .positive("Cost price must be positive")
    .optional(),
  stock: z
    .number()
    .int("Stock must be an integer")
    .min(0, "Stock cannot be negative"),
  sku: z
    .string()
    .min(1, "SKU cannot be empty")
    .optional(),
  type: productTypeSchema,
  product_category_id: z
    .string()
    .min(1, "Category is required")
    .uuid("Invalid category ID"),
  image: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => !file || file.size <= 5 * 1024 * 1024,
      "Image must be less than 5MB"
    )
    .refine(
      (file) =>
        !file ||
        ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
          file.type
        ),
      "Only JPG, PNG, WebP, and GIF images are allowed"
    ),
});

export type CreateProductFormData = z.infer<typeof createProductSchema>;

// ------------------------------------------------------------------------------
// Update Product Schema
// ------------------------------------------------------------------------------

export const updateProductSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .optional(),
  description: z.string().optional(),
  price: z
    .number()
    .positive("Price must be positive")
    .optional(),
  cost_price: z
    .number()
    .positive("Cost price must be positive")
    .optional(),
  stock: z
    .number()
    .int("Stock must be an integer")
    .min(0, "Stock cannot be negative")
    .optional(),
  sku: z
    .string()
    .min(1, "SKU cannot be empty")
    .optional(),
  type: productTypeSchema.optional(),
  product_category_id: z
    .string()
    .uuid("Invalid category ID")
    .optional(),
  image: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => !file || file.size <= 5 * 1024 * 1024,
      "Image must be less than 5MB"
    )
    .refine(
      (file) =>
        !file ||
        ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
          file.type
        ),
      "Only JPG, PNG, WebP, and GIF images are allowed"
    ),
});

export type UpdateProductFormData = z.infer<typeof updateProductSchema>;

// ------------------------------------------------------------------------------
// Product Query Params Schema
// ------------------------------------------------------------------------------

export const productQueryParamsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
  type: productTypeSchema.optional(),
  categoryId: z.string().uuid().optional(),
  search: z.string().optional(),
  active: z.boolean().optional(),
});

export type ProductQueryParamsFormData = z.infer<typeof productQueryParamsSchema>;
