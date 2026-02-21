import { api } from "@/lib/api";
import {
  CreateTransactionInput,
  TransactionQueryParams,
  TransactionResponse,
  TransactionWithItemsResponse,
  TransactionsListResponse,
  TransactionSimpleResponse,
} from "@/lib/types";

// ------------------------------------------------------------------------------
// Transaction Service
// ------------------------------------------------------------------------------

export const transactionService = {
  /**
   * Get all transactions with pagination and filtering
   * @param params - Query parameters (optional)
   */
  async getAll(params?: TransactionQueryParams): Promise<TransactionsListResponse> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", String(params.page));
    if (params?.limit) queryParams.append("limit", String(params.limit));
    if (params?.type) queryParams.append("type", params.type);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.date) queryParams.append("date", params.date);
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

    return api.get<TransactionsListResponse>(`/transactions${queryString}`);
  },

  /**
   * Get single transaction by ID with items
   * @param id - Transaction ID
   */
  async getById(id: string): Promise<TransactionResponse> {
    return api.get<TransactionResponse>(`/transactions/${id}`);
  },

  /**
   * Create new transaction with automatic stock deduction
   * @param data - Transaction data
   */
  async create(data: CreateTransactionInput): Promise<TransactionWithItemsResponse> {
    return api.post<TransactionWithItemsResponse>("/transactions", data);
  },

  /**
   * Cancel a transaction and restore stock (OWNER/ADMIN only)
   * @param id - Transaction ID
   */
  async cancel(id: string): Promise<TransactionSimpleResponse> {
    return api.patch<TransactionSimpleResponse>(`/transactions/${id}/cancel`, {});
  },

  /**
   * Complete a rental transaction and restore stock (OWNER/ADMIN only)
   * Used when rented items are returned
   * @param id - Transaction ID
   */
  async complete(id: string): Promise<TransactionSimpleResponse> {
    return api.patch<TransactionSimpleResponse>(`/transactions/${id}/complete`, {});
  },
};
