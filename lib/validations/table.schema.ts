import { z } from "zod";

// ------------------------------------------------------------------------------
// Table Status Schema
// ------------------------------------------------------------------------------

export const tableStatusSchema = z.enum(["EMPTY", "OCCUPIED"]);

// ------------------------------------------------------------------------------
// Create Table Schema
// ------------------------------------------------------------------------------

export const createTableSchema = z.object({
  code: z
    .string()
    .min(1, "Code is required")
    .transform((val) => val.toUpperCase()),
  name: z.string().optional(),
  capacity: z
    .number()
    .int("Capacity must be an integer")
    .min(0, "Capacity cannot be negative")
    .optional(),
  location: z.string().optional(),
});

export type CreateTableFormData = z.infer<typeof createTableSchema>;

// ------------------------------------------------------------------------------
// Update Table Schema
// ------------------------------------------------------------------------------

export const updateTableSchema = z.object({
  name: z.string().optional(),
  capacity: z
    .number()
    .int("Capacity must be an integer")
    .min(0, "Capacity cannot be negative")
    .optional(),
  location: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type UpdateTableFormData = z.infer<typeof updateTableSchema>;

// ------------------------------------------------------------------------------
// Update Table Status Schema (OCCUPY/CLEAR)
// ------------------------------------------------------------------------------

export const updateTableStatusSchema = z.object({
  status: tableStatusSchema,
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
}).refine(
  (data) => {
    // Customer name is required when status is OCCUPIED
    if (data.status === "OCCUPIED" && !data.customerName) {
      return false;
    }
    return true;
  },
  {
    message: "Customer name is required when occupying table",
    path: ["customerName"],
  }
);

export type UpdateTableStatusFormData = z.infer<typeof updateTableStatusSchema>;

// ------------------------------------------------------------------------------
// Table Query Params Schema
// ------------------------------------------------------------------------------

export const tableQueryParamsSchema = z.object({
  status: tableStatusSchema.optional(),
  active: z.boolean().optional(),
  search: z.string().optional(),
});

export type TableQueryParamsFormData = z.infer<typeof tableQueryParamsSchema>;
