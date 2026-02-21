// ------------------------------------------------------------------------------
// Product Sell Types (SELL Records)
// ------------------------------------------------------------------------------

import { Product } from "./product.types";
import { Transaction } from "./transaction.types";

/**
 * Product Sell status enum
 */
export type ProductSellStatus = "ACTIVE" | "CANCELLED";

/**
 * Product Sell record interface
 */
export interface ProductSell {
  id: string;
  transactionId: string;
  productId: string;
  quantity: number;
  unitPrice: string;
  subtotal: string;
  status: ProductSellStatus;
  soldAt: string;
  createdAt: string;
  product?: Product;
  transaction?: Transaction;
}

// ------------------------------------------------------------------------------
// Query Parameters
// ------------------------------------------------------------------------------

/**
 * Query parameters for listing product sell records
 */
export interface ProductSellQueryParams {
  /** Page number (default: 1) */
  page?: number;
  /** Items per page (default: 10) */
  limit?: number;
  /** Filter by product ID */
  productId?: string;
  /** Filter by transaction ID */
  transactionId?: string;
  /** Filter by status: ACTIVE or CANCELLED */
  status?: ProductSellStatus;
}

// ------------------------------------------------------------------------------
// API Response Types
// ------------------------------------------------------------------------------

/**
 * Single product sell response
 */
export interface ProductSellResponse {
  success: boolean;
  message: string;
  data: ProductSell;
}

/**
 * List of product sell records response
 */
export interface ProductSellsListResponse {
  success: boolean;
  message: string;
  data: {
    data: ProductSell[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

/**
 * Product sell history response (by product)
 */
export interface ProductSellHistoryResponse {
  success: boolean;
  message: string;
  data: {
    product: Pick<Product, "id" | "name" | "slug">;
    data: ProductSell[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

/**
 * Product sell stats response
 */
export interface ProductSellStatsResponse {
  success: boolean;
  message: string;
  data: {
    product: Pick<Product, "id" | "name" | "slug">;
    stats: {
      totalQuantity: number;
      totalRevenue: string;
      totalTransactions: number;
    };
  };
}

/**
 * Transaction sell records response
 */
export interface TransactionSellRecordsResponse {
  success: boolean;
  message: string;
  data: {
    data: ProductSell[];
  };
}
