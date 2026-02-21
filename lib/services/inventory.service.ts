import { api } from "@/lib/api";
import {
  CreateInventoryInput,
  UpdateInventoryInput,
  AdjustInventoryInput,
  InventoryQueryParams,
  InventoryResponse,
  InventoriesListResponse,
  InventoryAdjustmentResponse,
} from "@/lib/types";

// ------------------------------------------------------------------------------
// Helper: Build FormData from inventory input
// ------------------------------------------------------------------------------

function buildInventoryFormData(data: CreateInventoryInput | UpdateInventoryInput): FormData {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      if (value instanceof File) {
        formData.append(key, value);
      } else {
        formData.append(key, String(value));
      }
    }
  });

  return formData;
}

// ------------------------------------------------------------------------------
// Inventory Service
// ------------------------------------------------------------------------------

export const inventoryService = {
  /**
   * Get all inventories with pagination, filtering, and search
   * @param params - Query parameters (optional)
   */
  async getAll(params?: InventoryQueryParams): Promise<InventoriesListResponse> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", String(params.page));
    if (params?.limit) queryParams.append("limit", String(params.limit));
    if (params?.type) queryParams.append("type", params.type);
    if (params?.condition) queryParams.append("condition", params.condition);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.search) queryParams.append("search", params.search);

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

    return api.get<InventoriesListResponse>(`/inventories${queryString}`);
  },

  /**
   * Get single inventory by ID with adjustment history
   * @param id - Inventory ID
   */
  async getById(id: string): Promise<InventoryResponse> {
    return api.get<InventoryResponse>(`/inventories/${id}`);
  },

  /**
   * Create new inventory with optional image upload
   * @param data - Inventory data
   */
  async create(data: CreateInventoryInput): Promise<InventoryResponse> {
    const formData = buildInventoryFormData(data);

    return api.post<InventoryResponse>("/inventories", formData, {
      headers: {
        // Don't set Content-Type, let browser set it with boundary for FormData
        "Content-Type": undefined,
      },
    });
  },

  /**
   * Update existing inventory with optional image replacement
   * Note: This does NOT change quantity, use adjust() for that
   * @param id - Inventory ID
   * @param data - Partial inventory data
   */
  async update(id: string, data: UpdateInventoryInput): Promise<InventoryResponse> {
    const formData = buildInventoryFormData(data);

    return api.put<InventoryResponse>(`/inventories/${id}`, formData, {
      headers: {
        // Don't set Content-Type, let browser set it with boundary for FormData
        "Content-Type": undefined,
      },
    });
  },

  /**
   * Adjust inventory stock with audit trail
   * @param id - Inventory ID
   * @param data - Adjustment data
   */
  async adjust(id: string, data: AdjustInventoryInput): Promise<InventoryAdjustmentResponse> {
    return api.patch<InventoryAdjustmentResponse>(`/inventories/${id}/adjust`, data);
  },

  /**
   * Delete (dispose) inventory - marks as DISPOSED
   * @param id - Inventory ID
   */
  async delete(id: string): Promise<InventoryResponse> {
    return api.delete<InventoryResponse>(`/inventories/${id}`);
  },
};
