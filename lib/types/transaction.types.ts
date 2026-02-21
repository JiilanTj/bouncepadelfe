// ------------------------------------------------------------------------------
// Transaction Types (Unified Transaction System for POS and Rental)
// ------------------------------------------------------------------------------

import { Product } from "./product.types";
import { Menu } from "./menu.types";
import { Table } from "./table.types";
import { User } from "./user.types";

/**
 * Transaction type discriminator
 */
export type TransactionType = "POS" | "RENTAL" | "BOOKING";

/**
 * Transaction status enum
 */
export type TransactionStatus = "PENDING" | "PAID" | "CANCELLED" | "COMPLETED";

/**
 * Payment method enum
 */
export type PaymentMethod = "CASH" | "QRIS" | "TRANSFER" | "OTHER";

/**
 * Transaction item type discriminator
 */
export type TransactionItemType = "PRODUCT" | "MENU" | "BOOKING";

/**
 * Transaction item interface
 */
export interface TransactionItem {
  id: string;
  transactionId: string;
  itemType: TransactionItemType;
  productId?: string;
  menuId?: string;
  quantity: number;
  unitPrice: string;
  subtotal: string;
  createdAt: string;
  expectedReturnAt?: string;
  notes?: string;
  product?: Product;
  menu?: Menu;
}

/**
 * Transaction interface
 */
export interface Transaction {
  id: string;
  invoiceNumber: string;
  type: TransactionType;
  tableId?: string;
  customerName?: string;
  totalAmount: string;
  paidAmount: string;
  changeAmount: string;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  depositAmount: string;
  fineAmount: string;
  items?: TransactionItem[];
  table?: Table;
  creator?: User;
}

// ------------------------------------------------------------------------------
// Input Types
// ------------------------------------------------------------------------------

export interface TransactionItemInput {
  itemType: TransactionItemType;
  id: string;
  quantity: number;
  expectedReturnAt?: string;
  notes?: string;
}

/**
 * Input for creating a new transaction
 */
export interface CreateTransactionInput {
  type: TransactionType;
  tableId?: string;
  customerName?: string;
  paymentMethod: PaymentMethod;
  paidAmount: number;
  depositAmount?: number;
  items: TransactionItemInput[];
}

// ------------------------------------------------------------------------------
// Query Parameters
// ------------------------------------------------------------------------------

/**
 * Query parameters for listing transactions
 */
export interface TransactionQueryParams {
  /** Page number (default: 1) */
  page?: number;
  /** Items per page (default: 10) */
  limit?: number;
  /** Filter by type: POS or RENTAL */
  type?: TransactionType;
  /** Filter by status: PENDING, PAID, CANCELLED, COMPLETED */
  status?: TransactionStatus;
  /** Filter by date (YYYY-MM-DD) */
  date?: string;
  /** Filter by table ID */
  tableId?: string;
  /** Start date for range filter (ISO) */
  startDate?: string;
  /** End date for range filter (ISO) */
  endDate?: string;
}

// ------------------------------------------------------------------------------
// API Response Types
// ------------------------------------------------------------------------------

/**
 * Single transaction response
 */
export interface TransactionResponse {
  success: boolean;
  message: string;
  data: Transaction;
}

/**
 * Transaction with items response (for create and detail)
 */
export interface TransactionWithItemsResponse {
  success: boolean;
  message: string;
  data: {
    transaction: Transaction;
    items: TransactionItem[];
  };
}

/**
 * List of transactions response
 */
export interface TransactionsListResponse {
  success: boolean;
  message: string;
  data: {
    data: Transaction[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

/**
 * Simple transaction response (for cancel/complete)
 */
export interface TransactionSimpleResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
  };
}

/**
 * Error response with validation errors
 */
export interface TransactionErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// ------------------------------------------------------------------------------
// Legacy Types (for backward compatibility)
// ------------------------------------------------------------------------------

/** @deprecated Use TransactionType instead */
export type LegacyTransactionType = "BOOKING" | "POS" | "RENTAL" | "STORE";

/** @deprecated Use TransactionStatus instead */
export type LegacyTransactionStatus = "COMPLETED" | "PENDING" | "REFUNDED";

/** @deprecated Use PaymentMethod instead */
export type LegacyPaymentMethod = "CASH" | "CARD" | "QRIS" | "TRANSFER";

/** @deprecated Use TransactionItem instead */
export interface LegacyTransactionItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

/** @deprecated Use Transaction instead */
export interface LegacyTransaction {
  id: string;
  date: string;
  time: string;
  customerName: string;
  type: LegacyTransactionType;
  description: string;
  amount: number;
  status: LegacyTransactionStatus;
  paymentMethod: LegacyPaymentMethod;
  items?: LegacyTransactionItem[];
  createdAt?: string;
  updatedAt?: string;
}

/** @deprecated Use CreateTransactionInput instead */
export interface LegacyTransactionCreateInput {
  customerName: string;
  type: LegacyTransactionType;
  description: string;
  amount: number;
  paymentMethod: LegacyPaymentMethod;
  items?: LegacyTransactionItem[];
}

/** @deprecated Use TransactionQueryParams instead */
export interface LegacyTransactionFilter {
  startDate?: string;
  endDate?: string;
  type?: LegacyTransactionType;
  status?: LegacyTransactionStatus;
  search?: string;
}
