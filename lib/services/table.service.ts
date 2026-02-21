import { api } from "@/lib/api";
import {
  CreateTableInput,
  UpdateTableInput,
  UpdateTableStatusInput,
  TableQueryParams,
  TableResponse,
  TablesListResponse,
} from "@/lib/types";

// ------------------------------------------------------------------------------
// Table Service
// ------------------------------------------------------------------------------

export const tableService = {
  /**
   * Get all tables with filtering
   * @param params - Query parameters (optional)
   */
  async getAll(params?: TableQueryParams): Promise<TablesListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.status) queryParams.append("status", params.status);
    if (params?.active !== undefined) queryParams.append("active", String(params.active));
    if (params?.search) queryParams.append("search", params.search);

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

    return api.get<TablesListResponse>(`/tables${queryString}`);
  },

  /**
   * Get single table by ID
   * @param id - Table ID
   */
  async getById(id: string): Promise<TableResponse> {
    return api.get<TableResponse>(`/tables/${id}`);
  },

  /**
   * Create new table
   * @param data - Table data
   */
  async create(data: CreateTableInput): Promise<TableResponse> {
    return api.post<TableResponse>("/tables", data);
  },

  /**
   * Update existing table
   * @param id - Table ID
   * @param data - Partial table data
   */
  async update(id: string, data: UpdateTableInput): Promise<TableResponse> {
    return api.put<TableResponse>(`/tables/${id}`, data);
  },

  /**
   * Update table status (EMPTY/OCCUPIED)
   * @param id - Table ID
   * @param data - Status update data
   */
  async updateStatus(id: string, data: UpdateTableStatusInput): Promise<TableResponse> {
    return api.patch<TableResponse>(`/tables/${id}/status`, data);
  },

  /**
   * Delete (deactivate) table - sets isActive to false
   * @param id - Table ID
   */
  async delete(id: string): Promise<TableResponse> {
    return api.delete<TableResponse>(`/tables/${id}`);
  },

  /**
   * Activate table - sets isActive to true
   * @param id - Table ID
   */
  async activate(id: string): Promise<TableResponse> {
    return api.patch<TableResponse>(`/tables/${id}/activate`, {});
  },
};
