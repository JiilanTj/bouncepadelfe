// ------------------------------------------------------------------------------
// Category Types (Product & Menu Categories)
// ------------------------------------------------------------------------------

/**
 * Base Category interface
 * Used for both Product Categories and Menu Categories
 */
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ------------------------------------------------------------------------------
// Input Types
// ------------------------------------------------------------------------------

/**
 * Input for creating a new category
 */
export interface CreateCategoryInput {
  name: string;
  description?: string;
}

/**
 * Input for updating a category
 */
export interface UpdateCategoryInput {
  name?: string;
  description?: string;
}

// ------------------------------------------------------------------------------
// Query Parameters
// ------------------------------------------------------------------------------

/**
 * Query parameters for listing categories
 */
export interface CategoryQueryParams {
  /** Filter by active status */
  active?: boolean;
  page?: number;
  limit?: number;
}

// ------------------------------------------------------------------------------
// API Response Types
// ------------------------------------------------------------------------------

/**
 * Single category response
 */
export interface CategoryResponse {
  success: boolean;
  message: string;
  data: Category;
}

/**
 * List of categories response
 */
export interface CategoriesListResponse {
  success: boolean;
  message: string;
  data: {
    data: Category[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

/**
 * Error response with validation errors
 */
export interface CategoryErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// ------------------------------------------------------------------------------
// Category Type Discriminator
// ------------------------------------------------------------------------------

/**
 * Type for category endpoint selection
 */
export type CategoryType = "product" | "menu";
