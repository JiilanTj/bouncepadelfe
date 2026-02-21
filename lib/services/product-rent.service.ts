import { api } from "@/lib/api";
import {
  ProductRentQueryParams,
  ReturnRentalInput,
  ProductRentResponse,
  ProductRentsListResponse,
  ActiveRentalsResponse,
  ProductRentHistoryResponse,
  ProductRentStatsResponse,
  TransactionRentRecordsResponse,
} from "@/lib/types";

// ------------------------------------------------------------------------------
// Product Rent Service
// ------------------------------------------------------------------------------

export const productRentService = {
  /**
   * Get all rent records with pagination and filtering
   * @param params - Query parameters (optional)
   */
  async getAll(params?: ProductRentQueryParams): Promise<ProductRentsListResponse> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", String(params.page));
    if (params?.limit) queryParams.append("limit", String(params.limit));
    if (params?.productId) queryParams.append("productId", params.productId);
    if (params?.transactionId) queryParams.append("transactionId", params.transactionId);
    if (params?.status) queryParams.append("status", params.status);

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

    return api.get<ProductRentsListResponse>(`/product-rents${queryString}`);
  },

  /**
   * Get active rentals (not yet returned)
   * @param params - Query parameters (optional)
   */
  async getActive(params?: Pick<ProductRentQueryParams, "page" | "limit">): Promise<ActiveRentalsResponse> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", String(params.page));
    if (params?.limit) queryParams.append("limit", String(params.limit));

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

    return api.get<ActiveRentalsResponse>(`/product-rents/active${queryString}`);
  },

  /**
   * Get single rent record by ID
   * @param id - Rent record ID
   */
  async getById(id: string): Promise<ProductRentResponse> {
    return api.get<ProductRentResponse>(`/product-rents/${id}`);
  },

  /**
   * Get rent history for a specific product
   * @param productId - Product ID
   * @param params - Query parameters (optional)
   */
  async getByProduct(
    productId: string,
    params?: Pick<ProductRentQueryParams, "page" | "limit">
  ): Promise<ProductRentHistoryResponse> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", String(params.page));
    if (params?.limit) queryParams.append("limit", String(params.limit));

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

    return api.get<ProductRentHistoryResponse>(`/product-rents/product/${productId}${queryString}`);
  },

  /**
   * Get rent stats for a specific product
   * @param productId - Product ID
   */
  async getProductStats(productId: string): Promise<ProductRentStatsResponse> {
    return api.get<ProductRentStatsResponse>(`/product-rents/product/${productId}/stats`);
  },

  /**
   * Get rent records for a specific transaction
   * @param transactionId - Transaction ID
   */
  async getByTransaction(transactionId: string): Promise<TransactionRentRecordsResponse> {
    return api.get<TransactionRentRecordsResponse>(`/product-rents/transaction/${transactionId}`);
  },

  /**
   * Mark rent record as returned (OWNER/ADMIN only)
   * @param id - Rent record ID
   * @param data - Optional return data
   */
  async returnRental(id: string, data?: ReturnRentalInput): Promise<ProductRentResponse> {
    return api.patch<ProductRentResponse>(`/product-rents/${id}/return`, data || {});
  },
};
