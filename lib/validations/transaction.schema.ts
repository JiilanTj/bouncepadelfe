import { z } from "zod";

// ------------------------------------------------------------------------------
// Transaction Type Schema
// ------------------------------------------------------------------------------

export const transactionTypeSchema = z.enum(["POS", "RENTAL"]);

// ------------------------------------------------------------------------------
// Transaction Status Schema
// ------------------------------------------------------------------------------

export const transactionStatusSchema = z.enum([
  "PENDING",
  "PAID",
  "CANCELLED",
  "COMPLETED",
]);

// ------------------------------------------------------------------------------
// Payment Method Schema
// ------------------------------------------------------------------------------

export const paymentMethodSchema = z.enum([
  "CASH",
  "QRIS",
  "TRANSFER",
  "OTHER",
]);

// ------------------------------------------------------------------------------
// Transaction Item Type Schema
// ------------------------------------------------------------------------------

export const transactionItemTypeSchema = z.enum(["PRODUCT", "MENU"]);

// ------------------------------------------------------------------------------
// Transaction Item Input Schema
// ------------------------------------------------------------------------------

export const transactionItemInputSchema = z.object({
  itemType: transactionItemTypeSchema,
  id: z.string().min(1, "Item ID is required").uuid("Invalid item ID"),
  quantity: z
    .number()
    .int("Quantity must be an integer")
    .positive("Quantity must be positive"),
});

// ------------------------------------------------------------------------------
// Create Transaction Schema
// ------------------------------------------------------------------------------

export const createTransactionSchema = z.object({
  type: transactionTypeSchema,
  tableId: z
    .string()
    .uuid("Invalid table ID")
    .optional(),
  customerName: z
    .string()
    .min(1, "Customer name cannot be empty")
    .optional(),
  paymentMethod: paymentMethodSchema,
  paidAmount: z
    .number()
    .positive("Paid amount must be positive"),
  items: z
    .array(transactionItemInputSchema)
    .min(1, "At least one item is required"),
});

export type CreateTransactionFormData = z.infer<typeof createTransactionSchema>;

// ------------------------------------------------------------------------------
// Create POS Transaction Schema (convenience schema for POS)
// ------------------------------------------------------------------------------

export const createPOSTransactionSchema = createTransactionSchema.extend({
  type: z.literal("POS"),
});

export type CreatePOSTransactionFormData = z.infer<typeof createPOSTransactionSchema>;

// ------------------------------------------------------------------------------
// Create Rental Transaction Schema (convenience schema for Rental)
// ------------------------------------------------------------------------------

export const createRentalTransactionSchema = createTransactionSchema.extend({
  type: z.literal("RENTAL"),
  tableId: z.undefined().optional(),
});

export type CreateRentalTransactionFormData = z.infer<typeof createRentalTransactionSchema>;

// ------------------------------------------------------------------------------
// Transaction Query Params Schema
// ------------------------------------------------------------------------------

export const transactionQueryParamsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().optional(),
  type: transactionTypeSchema.optional(),
  status: transactionStatusSchema.optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .optional(),
});

export type TransactionQueryParamsFormData = z.infer<typeof transactionQueryParamsSchema>;
