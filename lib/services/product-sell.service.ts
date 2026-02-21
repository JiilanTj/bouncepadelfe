import { api } from "@/lib/api";
import {
  ProductSellQueryParams,
  ProductSellResponse,
  ProductSellsListResponse,
  ProductSellHistoryResponse,
  ProductSellStatsResponse,
  TransactionSellRecordsResponse,
} from "@/lib/types";

// ------------------------------------------------------------------------------
// Product Sell Service
// ------------------------------------------------------------------------------

export const productSellService = {
  /**
   * Get all sell records with pagination and filtering
   * @param params - Query parameters (optional)
   */
  async getAll(params?: ProductSellQueryParams): Promise<ProductSellsListResponse> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", String(params.page));
    if (params?.limit) queryParams.append("limit", String(params.limit));
    if (params?.productId) queryParams.append("productId", params.productId);
    if (params?.transactionId) queryParams.append("transactionId", params.transactionId);
    if (params?.status) queryParams.append("status", params.status);

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

    return api.get<ProductSellsListResponse>(`/product-sells${queryString}`);
  },

  /**
   * Get single sell record by ID
   * @param id - Sell record ID
   */
  async getById(id: string): Promise<ProductSellResponse> {
    return api.get<ProductSellResponse>(`/product-sells/${id}`);
  },

  /**
   * Get sell history for a specific product
   * @param productId - Product ID
   * @param params - Query parameters (optional)
   */
  async getByProduct(
    productId: string,
    params?: Pick<ProductSellQueryParams, "page" | "limit">
  ): Promise<ProductSellHistoryResponse> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", String(params.page));
    if (params?.limit) queryParams.append("limit", String(params.limit));

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

    return api.get<ProductSellHistoryResponse>(`/product-sells/product/${productId}${queryString}`);
  },

  /**
   * Get sell stats for a specific product
   * @param productId - Product ID
   */
  async getProductStats(productId: string): Promise<ProductSellStatsResponse> {
    return api.get<ProductSellStatsResponse>(`/product-sells/product/${productId}/stats`);
  },

  /**
   * Get sell records for a specific transaction
   * @param transactionId - Transaction ID
   */
  async getByTransaction(transactionId: string): Promise<TransactionSellRecordsResponse> {
    return api.get<TransactionSellRecordsResponse>(`/product-sells/transaction/${transactionId}`);
  },
};
