// -----------------------------------------------------------------------------
// API Response Types
// -----------------------------------------------------------------------------

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export interface ApiSuccess<T = unknown> {
  success: true;
  message: string;
  data?: T;
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

// -----------------------------------------------------------------------------
// Pagination Types
// -----------------------------------------------------------------------------

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// -----------------------------------------------------------------------------
// Filter Types
// -----------------------------------------------------------------------------

export interface DateRangeFilter {
  startDate?: string;
  endDate?: string;
}

export interface SearchFilter {
  search?: string;
}
