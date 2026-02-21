import { api } from "@/lib/api";
import {
  CreateMenuInput,
  UpdateMenuInput,
  MenuQueryParams,
  MenuResponse,
  MenusListResponse,
} from "@/lib/types";

// ------------------------------------------------------------------------------
// Helper: Build FormData from menu input
// ------------------------------------------------------------------------------

function buildMenuFormData(data: CreateMenuInput | UpdateMenuInput): FormData {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (value === null) {
        formData.append(key, "null");
      } else {
        formData.append(key, String(value));
      }
    }
  });

  return formData;
}

// ------------------------------------------------------------------------------
// Menu Service
// ------------------------------------------------------------------------------

export const menuService = {
  /**
   * Get all menus with pagination, filtering, and search
   * @param params - Query parameters (optional)
   */
  async getAll(params?: MenuQueryParams): Promise<MenusListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append("page", String(params.page));
    if (params?.limit) queryParams.append("limit", String(params.limit));
    if (params?.categoryId) queryParams.append("categoryId", params.categoryId);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.available !== undefined) queryParams.append("available", String(params.available));
    if (params?.active !== undefined) queryParams.append("active", String(params.active));

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

    return api.get<MenusListResponse>(`/menus${queryString}`);
  },

  /**
   * Get single menu by ID
   * @param id - Menu ID
   */
  async getById(id: string): Promise<MenuResponse> {
    return api.get<MenuResponse>(`/menus/${id}`);
  },

  /**
   * Create new menu with optional image upload
   * @param data - Menu data
   */
  async create(data: CreateMenuInput): Promise<MenuResponse> {
    const formData = buildMenuFormData(data);
    
    return api.post<MenuResponse>("/menus", formData, {
      headers: {
        // Don't set Content-Type, let browser set it with boundary for FormData
        "Content-Type": undefined,
      },
    });
  },

  /**
   * Update existing menu with optional image replacement
   * @param id - Menu ID
   * @param data - Partial menu data
   */
  async update(id: string, data: UpdateMenuInput): Promise<MenuResponse> {
    const formData = buildMenuFormData(data);
    
    return api.put<MenuResponse>(`/menus/${id}`, formData, {
      headers: {
        // Don't set Content-Type, let browser set it with boundary for FormData
        "Content-Type": undefined,
      },
    });
  },

  /**
   * Delete (deactivate) menu - sets isActive to false
   * @param id - Menu ID
   */
  async delete(id: string): Promise<MenuResponse> {
    return api.delete<MenuResponse>(`/menus/${id}`);
  },

  /**
   * Activate menu - sets isActive to true
   * @param id - Menu ID
   */
  async activate(id: string): Promise<MenuResponse> {
    return api.patch<MenuResponse>(`/menus/${id}/activate`, {});
  },
};
