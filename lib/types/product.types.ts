// ------------------------------------------------------------------------------
// Product Types (Product Master Data)
// ------------------------------------------------------------------------------

/**
 * Product type discriminator
 */
export type ProductType = "SELL" | "RENT";

/**
 * Category data joined to product
 */
export interface ProductCategoryData {
  id: string;
  name: string;
  slug: string;
}

/**
 * Product interface
 */
export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: string;
  costPrice?: string;
  stock: number;
  sku?: string;
  imageKey?: string;
  imageUrl?: string;
  type: ProductType;
  productCategoryId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category?: ProductCategoryData;
}

// ------------------------------------------------------------------------------
// Input Types
// ------------------------------------------------------------------------------

/**
 * Input for creating a new product
 */
export interface CreateProductInput {
  name: string;
  description?: string;
  price: number;
  cost_price?: number;
  stock: number;
  sku?: string;
  type: ProductType;
  product_category_id: string;
  image?: File;
}

/**
 * Input for updating a product
 */
export interface UpdateProductInput {
  name?: string;
  description?: string;
  price?: number;
  cost_price?: number;
  stock?: number;
  sku?: string;
  type?: ProductType;
  product_category_id?: string;
  image?: File;
}

// ------------------------------------------------------------------------------
// Query Parameters
// ------------------------------------------------------------------------------

/**
 * Query parameters for listing products
 */
export interface ProductQueryParams {
  /** Page number (default: 1) */
  page?: number;
  /** Items per page (default: 10) */
  limit?: number;
  /** Filter by type: SELL or RENT */
  type?: ProductType;
  /** Filter by category ID */
  categoryId?: string;
  /** Search by name or SKU */
  search?: string;
  /** Filter by active status: true or false */
  active?: boolean;
}

// ------------------------------------------------------------------------------
// API Response Types
// ------------------------------------------------------------------------------

/**
 * Single product response
 */
export interface ProductResponse {
  success: boolean;
  message: string;
  data: Product;
}

/**
 * List of products response
 */
export interface ProductsListResponse {
  success: boolean;
  message: string;
  data: {
    data: Product[];
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
export interface ProductErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}
