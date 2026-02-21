// ------------------------------------------------------------------------------
// Inventory Types (Business Assets and Internal Consumables)
// ------------------------------------------------------------------------------

import { User } from "./user.types";

/**
 * Inventory type discriminator
 */
export type InventoryType = "ASSET" | "CONSUMABLE";

/**
 * Inventory condition enum
 */
export type InventoryCondition = "GOOD" | "DAMAGED" | "NEED_REPAIR" | "BROKEN";

/**
 * Inventory status enum
 */
export type InventoryStatus = "ACTIVE" | "INACTIVE" | "DISPOSED";

/**
 * Inventory adjustment change type
 */
export type InventoryChangeType = "ADD" | "REMOVE" | "CORRECTION";

/**
 * Inventory adjustment interface
 */
export interface InventoryAdjustment {
  id: string;
  inventoryId: string;
  changeType: InventoryChangeType;
  quantityBefore: number;
  quantityAfter: number;
  changeAmount: number;
  reason: string;
  createdBy: string;
  createdAt: string;
  creator?: Pick<User, "id" | "name" | "email">;
}

/**
 * Inventory interface
 */
export interface Inventory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  type: InventoryType;
  quantity: number;
  unit?: string;
  condition: InventoryCondition;
  status: InventoryStatus;
  ownerName?: string;
  purchaseDate?: string;
  purchasePrice?: string;
  imageKey?: string;
  imageUrl?: string;
  location?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  adjustments?: InventoryAdjustment[];
}

// ------------------------------------------------------------------------------
// Input Types
// ------------------------------------------------------------------------------

/**
 * Input for creating a new inventory
 */
export interface CreateInventoryInput {
  name: string;
  description?: string;
  type: InventoryType;
  quantity?: number;
  unit?: string;
  condition?: InventoryCondition;
  status?: InventoryStatus;
  owner_name?: string;
  purchase_date?: string;
  purchase_price?: number;
  location?: string;
  notes?: string;
  image?: File;
}

/**
 * Input for updating an inventory
 */
export interface UpdateInventoryInput {
  name?: string;
  description?: string;
  type?: InventoryType;
  unit?: string;
  condition?: InventoryCondition;
  status?: InventoryStatus;
  owner_name?: string;
  purchase_date?: string;
  purchase_price?: number;
  location?: string;
  notes?: string;
  image?: File;
}

/**
 * Input for adjusting inventory stock
 */
export interface AdjustInventoryInput {
  changeType: InventoryChangeType;
  amount: number;
  reason: string;
}

// ------------------------------------------------------------------------------
// Query Parameters
// ------------------------------------------------------------------------------

/**
 * Query parameters for listing inventories
 */
export interface InventoryQueryParams {
  /** Page number (default: 1) */
  page?: number;
  /** Items per page (default: 10) */
  limit?: number;
  /** Filter by type: ASSET or CONSUMABLE */
  type?: InventoryType;
  /** Filter by condition: GOOD, DAMAGED, NEED_REPAIR, BROKEN */
  condition?: InventoryCondition;
  /** Filter by status: ACTIVE, INACTIVE, DISPOSED */
  status?: InventoryStatus;
  /** Search by name or location */
  search?: string;
}

// ------------------------------------------------------------------------------
// API Response Types
// ------------------------------------------------------------------------------

/**
 * Single inventory response
 */
export interface InventoryResponse {
  success: boolean;
  message: string;
  data: Inventory;
}

/**
 * List of inventories response
 */
export interface InventoriesListResponse {
  success: boolean;
  message: string;
  data: {
    data: Inventory[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

/**
 * Inventory adjustment response
 */
export interface InventoryAdjustmentResponse {
  success: boolean;
  message: string;
  data: Inventory;
}

/**
 * Error response with validation errors
 */
export interface InventoryErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}
