import { api } from "@/lib/api";
import {
  CreateProductInput,
  UpdateProductInput,
  ProductQueryParams,
  ProductResponse,
  ProductsListResponse,
} from "@/lib/types";

// ------------------------------------------------------------------------------
// Helper: Build FormData from product input
// ------------------------------------------------------------------------------

function buildProductFormData(data: CreateProductInput | UpdateProductInput): FormData {
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
// Product Service
// ------------------------------------------------------------------------------

export const productService = {
  /**
   * Get all products with pagination, filtering, and search
   * @param params - Query parameters (optional)
   */
  async getAll(params?: ProductQueryParams): Promise<ProductsListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append("page", String(params.page));
    if (params?.limit) queryParams.append("limit", String(params.limit));
    if (params?.type) queryParams.append("type", params.type);
    if (params?.categoryId) queryParams.append("categoryId", params.categoryId);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.active !== undefined) queryParams.append("active", String(params.active));

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

    return api.get<ProductsListResponse>(`/products${queryString}`);
  },

  /**
   * Get single product by ID
   * @param id - Product ID
   */
  async getById(id: string): Promise<ProductResponse> {
    return api.get<ProductResponse>(`/products/${id}`);
  },

  /**
   * Create new product with optional image upload
   * @param data - Product data
   */
  async create(data: CreateProductInput): Promise<ProductResponse> {
    const formData = buildProductFormData(data);
    
    return api.post<ProductResponse>("/products", formData, {
      headers: {
        // Don't set Content-Type, let browser set it with boundary for FormData
        "Content-Type": undefined,
      },
    });
  },

  /**
   * Update existing product with optional image replacement
   * @param id - Product ID
   * @param data - Partial product data
   */
  async update(id: string, data: UpdateProductInput): Promise<ProductResponse> {
    const formData = buildProductFormData(data);
    
    return api.put<ProductResponse>(`/products/${id}`, formData, {
      headers: {
        // Don't set Content-Type, let browser set it with boundary for FormData
        "Content-Type": undefined,
      },
    });
  },

  /**
   * Delete (deactivate) product - sets isActive to false
   * @param id - Product ID
   */
  async delete(id: string): Promise<ProductResponse> {
    return api.delete<ProductResponse>(`/products/${id}`);
  },

  /**
   * Activate product - sets isActive to true
   * @param id - Product ID
   */
  async activate(id: string): Promise<ProductResponse> {
    return api.patch<ProductResponse>(`/products/${id}/activate`, {});
  },
};
