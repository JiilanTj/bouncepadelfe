import { z } from "zod";

// ------------------------------------------------------------------------------
// Create Menu Schema
// ------------------------------------------------------------------------------

export const createMenuSchema = z.object({
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
    .min(0, "Stock cannot be negative")
    .optional(),
  sku: z
    .string()
    .min(1, "SKU cannot be empty")
    .optional(),
  menu_category_id: z
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

export type CreateMenuFormData = z.infer<typeof createMenuSchema>;

// ------------------------------------------------------------------------------
// Update Menu Schema
// ------------------------------------------------------------------------------

export const updateMenuSchema = z.object({
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
  menu_category_id: z
    .string()
    .uuid("Invalid category ID")
    .optional(),
  is_available: z.boolean().optional(),
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

export type UpdateMenuFormData = z.infer<typeof updateMenuSchema>;

// ------------------------------------------------------------------------------
// Menu Query Params Schema
// ------------------------------------------------------------------------------

export const menuQueryParamsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
  categoryId: z.string().uuid().optional(),
  search: z.string().optional(),
  available: z.boolean().optional(),
  active: z.boolean().optional(),
});

export type MenuQueryParamsFormData = z.infer<typeof menuQueryParamsSchema>;
