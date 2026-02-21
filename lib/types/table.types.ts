// ------------------------------------------------------------------------------
// Table Types (Table Master Data for F&B/POS)
// ------------------------------------------------------------------------------

/**
 * Table status enum
 */
export type TableStatus = "EMPTY" | "OCCUPIED";

/**
 * Table interface
 */
export interface Table {
  id: string;
  code: string;
  name?: string;
  status: TableStatus;
  capacity?: number;
  location?: string;
  currentCustomerName?: string;
  currentCustomerPhone?: string;
  occupiedAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ------------------------------------------------------------------------------
// Input Types
// ------------------------------------------------------------------------------

/**
 * Input for creating a new table
 */
export interface CreateTableInput {
  code: string;
  name?: string;
  capacity?: number;
  location?: string;
}

/**
 * Input for updating a table
 */
export interface UpdateTableInput {
  name?: string;
  capacity?: number;
  location?: string;
  isActive?: boolean;
}

/**
 * Input for updating table status (OCCUPIED/EMPTY)
 */
export interface UpdateTableStatusInput {
  status: TableStatus;
  customerName?: string;
  customerPhone?: string;
}

// ------------------------------------------------------------------------------
// Query Parameters
// ------------------------------------------------------------------------------

/**
 * Query parameters for listing tables
 */
export interface TableQueryParams {
  /** Filter by status: EMPTY or OCCUPIED */
  status?: TableStatus;
  /** Filter by active status: true or false */
  active?: boolean;
  /** Search by code, name, or location */
  search?: string;
}

// ------------------------------------------------------------------------------
// API Response Types
// ------------------------------------------------------------------------------

/**
 * Single table response
 */
export interface TableResponse {
  success: boolean;
  message: string;
  data: Table;
}

/**
 * List of tables response
 */
export interface TablesListResponse {
  success: boolean;
  message: string;
  data: {
    data: Table[];
  };
}

/**
 * Error response with validation errors
 */
export interface TableErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}
