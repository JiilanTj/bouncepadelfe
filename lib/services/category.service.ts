import { api } from "@/lib/api";
import {
  CategoryType,
  CreateCategoryInput,
  UpdateCategoryInput,
  CategoryQueryParams,
  CategoryResponse,
  CategoriesListResponse,
} from "@/lib/types";

// ------------------------------------------------------------------------------
// Helper: Get endpoint based on category type
// ------------------------------------------------------------------------------

function getEndpoint(type: CategoryType): string {
  return type === "product" ? "/product-categories" : "/menu-categories";
}

// ------------------------------------------------------------------------------
// Category Service
// ------------------------------------------------------------------------------

export const categoryService = {
  /**
   * Get all categories
   * @param type - 'product' or 'menu'
   * @param params - Query parameters (optional)
   */
  async getAll(
    type: CategoryType,
    params?: CategoryQueryParams
  ): Promise<CategoriesListResponse> {
    const endpoint = getEndpoint(type);

    const queryParams = new URLSearchParams();
    if (params?.active !== undefined) queryParams.append("active", String(params.active));
    if (params?.page) queryParams.append("page", String(params.page));
    if (params?.limit) queryParams.append("limit", String(params.limit));

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

    return api.get<CategoriesListResponse>(`${endpoint}${queryString}`);
  },

  /**
   * Get single category by ID
   * @param type - 'product' or 'menu'
   * @param id - Category ID
   */
  async getById(type: CategoryType, id: string): Promise<CategoryResponse> {
    const endpoint = getEndpoint(type);
    return api.get<CategoryResponse>(`${endpoint}/${id}`);
  },

  /**
   * Create new category
   * @param type - 'product' or 'menu'
   * @param data - Category data
   */
  async create(
    type: CategoryType,
    data: CreateCategoryInput
  ): Promise<CategoryResponse> {
    const endpoint = getEndpoint(type);
    return api.post<CategoryResponse>(endpoint, data);
  },

  /**
   * Update existing category
   * @param type - 'product' or 'menu'
   * @param id - Category ID
   * @param data - Partial category data
   */
  async update(
    type: CategoryType,
    id: string,
    data: UpdateCategoryInput
  ): Promise<CategoryResponse> {
    const endpoint = getEndpoint(type);
    return api.put<CategoryResponse>(`${endpoint}/${id}`, data);
  },

  /**
   * Delete (deactivate) category
   * @param type - 'product' or 'menu'
   * @param id - Category ID
   */
  async delete(type: CategoryType, id: string): Promise<CategoryResponse> {
    const endpoint = getEndpoint(type);
    return api.delete<CategoryResponse>(`${endpoint}/${id}`);
  },

  /**
   * Activate category
   * @param type - 'product' or 'menu'
   * @param id - Category ID
   */
  async activate(type: CategoryType, id: string): Promise<CategoryResponse> {
    const endpoint = getEndpoint(type);
    return api.patch<CategoryResponse>(`${endpoint}/${id}/activate`, {});
  },
};

// ------------------------------------------------------------------------------
// Product Category Service (Convenience Methods)
// ------------------------------------------------------------------------------

export const productCategoryService = {
  getAll: (params?: CategoryQueryParams) => categoryService.getAll("product", params),
  getById: (id: string) => categoryService.getById("product", id),
  create: (data: CreateCategoryInput) => categoryService.create("product", data),
  update: (id: string, data: UpdateCategoryInput) => categoryService.update("product", id, data),
  delete: (id: string) => categoryService.delete("product", id),
  activate: (id: string) => categoryService.activate("product", id),
};

// ------------------------------------------------------------------------------
// Menu Category Service (Convenience Methods)
// ------------------------------------------------------------------------------

export const menuCategoryService = {
  getAll: (params?: CategoryQueryParams) => categoryService.getAll("menu", params),
  getById: (id: string) => categoryService.getById("menu", id),
  create: (data: CreateCategoryInput) => categoryService.create("menu", data),
  update: (id: string, data: UpdateCategoryInput) => categoryService.update("menu", id, data),
  delete: (id: string) => categoryService.delete("menu", id),
  activate: (id: string) => categoryService.activate("menu", id),
};
