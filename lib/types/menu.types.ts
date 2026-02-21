// ------------------------------------------------------------------------------
// Menu Types (Menu Master Data - Food & Beverage)
// ------------------------------------------------------------------------------

/**
 * Category data joined to menu
 */
export interface MenuCategoryData {
  id: string;
  name: string;
  slug: string;
}

/**
 * Menu interface
 */
export interface Menu {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: string;
  costPrice?: string;
  stock: number | null;
  sku?: string;
  imageKey?: string;
  imageUrl?: string;
  menuCategoryId: string;
  isAvailable: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category?: MenuCategoryData;
}

// ------------------------------------------------------------------------------
// Input Types
// ------------------------------------------------------------------------------

/**
 * Input for creating a new menu
 */
export interface CreateMenuInput {
  name: string;
  description?: string;
  price: number;
  cost_price?: number;
  stock?: number | null;
  sku?: string;
  menu_category_id: string;
  image?: File;
}

/**
 * Input for updating a menu
 */
export interface UpdateMenuInput {
  name?: string;
  description?: string;
  price?: number;
  cost_price?: number;
  stock?: number | null;
  sku?: string;
  menu_category_id?: string;
  is_available?: boolean;
  image?: File;
}

// ------------------------------------------------------------------------------
// Query Parameters
// ------------------------------------------------------------------------------

/**
 * Query parameters for listing menus
 */
export interface MenuQueryParams {
  /** Page number (default: 1) */
  page?: number;
  /** Items per page (default: 10) */
  limit?: number;
  /** Filter by category ID */
  categoryId?: string;
  /** Search by name or SKU */
  search?: string;
  /** Filter by availability: true or false */
  available?: boolean;
  /** Filter by active status: true or false */
  active?: boolean;
}

// ------------------------------------------------------------------------------
// API Response Types
// ------------------------------------------------------------------------------

/**
 * Single menu response
 */
export interface MenuResponse {
  success: boolean;
  message: string;
  data: Menu;
}

/**
 * List of menus response
 */
export interface MenusListResponse {
  success: boolean;
  message: string;
  data: {
    data: Menu[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

/**
 * Error response with validation errors
 */
export interface MenuErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}
