// ------------------------------------------------------------------------------
// Product Rent Types (RENT Records)
// ------------------------------------------------------------------------------

import { Product } from "./product.types";
import { Transaction } from "./transaction.types";

/**
 * Product Rent status enum
 */
export type ProductRentStatus = "ACTIVE" | "RETURNED" | "CANCELLED";

/**
 * Product Rent record interface
 */
export interface ProductRent {
  id: string;
  transactionId: string;
  productId: string;
  quantity: number;
  unitPrice: string;
  subtotal: string;
  status: ProductRentStatus;
  rentedAt: string;
  returnedAt?: string;
  createdAt: string;
  product?: Product;
  transaction?: Transaction;
}

// ------------------------------------------------------------------------------
// Input Types
// ------------------------------------------------------------------------------

/**
 * Input for returning a rental
 */
export interface ReturnRentalInput {
  returnedAt?: string; // ISO timestamp, default: now
}

// ------------------------------------------------------------------------------
// Query Parameters
// ------------------------------------------------------------------------------

/**
 * Query parameters for listing product rent records
 */
export interface ProductRentQueryParams {
  /** Page number (default: 1) */
  page?: number;
  /** Items per page (default: 10) */
  limit?: number;
  /** Filter by product ID */
  productId?: string;
  /** Filter by transaction ID */
  transactionId?: string;
  /** Filter by status: ACTIVE, RETURNED, or CANCELLED */
  status?: ProductRentStatus;
}

// ------------------------------------------------------------------------------
// API Response Types
// ------------------------------------------------------------------------------

/**
 * Single product rent response
 */
export interface ProductRentResponse {
  success: boolean;
  message: string;
  data: ProductRent;
}

/**
 * List of product rent records response
 */
export interface ProductRentsListResponse {
  success: boolean;
  message: string;
  data: {
    data: ProductRent[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

/**
 * Active rentals list response
 */
export interface ActiveRentalsResponse {
  success: boolean;
  message: string;
  data: {
    data: ProductRent[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

/**
 * Product rent history response (by product)
 */
export interface ProductRentHistoryResponse {
  success: boolean;
  message: string;
  data: {
    product: Pick<Product, "id" | "name" | "slug">;
    data: ProductRent[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

/**
 * Product rent stats response
 */
export interface ProductRentStatsResponse {
  success: boolean;
  message: string;
  data: {
    product: Pick<Product, "id" | "name" | "slug">;
    active: {
      totalQuantity: number;
      totalRevenue: string;
      count: number;
    };
    returned: {
      totalQuantity: number;
      totalRevenue: string;
      count: number;
    };
  };
}

/**
 * Transaction rent records response
 */
export interface TransactionRentRecordsResponse {
  success: boolean;
  message: string;
  data: {
    data: ProductRent[];
  };
}
