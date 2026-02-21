"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryService } from "@/lib/services";
import {
  Inventory,
  CreateInventoryInput,
  UpdateInventoryInput,
  AdjustInventoryInput,
  InventoryQueryParams,
  InventoriesListResponse,
} from "@/lib/types";

// ------------------------------------------------------------------------------
// Query Keys
// ------------------------------------------------------------------------------

export const inventoryKeys = {
  all: ["inventories"] as const,
  lists: () => [...inventoryKeys.all, "list"] as const,
  list: (params?: InventoryQueryParams) =>
    [...inventoryKeys.lists(), params] as const,
  details: () => [...inventoryKeys.all, "detail"] as const,
  detail: (id: string) => [...inventoryKeys.details(), id] as const,
};

// ------------------------------------------------------------------------------
// useInventories Query - Get all inventories with filtering
// ------------------------------------------------------------------------------

export function useInventories(params?: InventoryQueryParams, enabled = true) {
  return useQuery({
    queryKey: inventoryKeys.list(params),
    queryFn: async (): Promise<InventoriesListResponse["data"]> => {
      const response = await inventoryService.getAll(params);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message);
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: (previousData) => previousData,
  });
}

// ------------------------------------------------------------------------------
// useInventory Query - Get single inventory with history
// ------------------------------------------------------------------------------

export function useInventory(id: string, enabled = true) {
  return useQuery({
    queryKey: inventoryKeys.detail(id),
    queryFn: async (): Promise<Inventory> => {
      const response = await inventoryService.getById(id);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message);
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// ------------------------------------------------------------------------------
// useCreateInventory Mutation
// ------------------------------------------------------------------------------

export function useCreateInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateInventoryInput): Promise<Inventory> => {
      const response = await inventoryService.create(data);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message);
    },
    onSuccess: () => {
      // Invalidate inventories list cache
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
    },
  });
}

// ------------------------------------------------------------------------------
// useUpdateInventory Mutation
// ------------------------------------------------------------------------------

export function useUpdateInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateInventoryInput;
    }): Promise<Inventory> => {
      const response = await inventoryService.update(id, data);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message);
    },
    onSuccess: (_, variables) => {
      // Invalidate specific inventory and list
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
    },
  });
}

// ------------------------------------------------------------------------------
// useAdjustInventoryStock Mutation
// ------------------------------------------------------------------------------

export function useAdjustInventoryStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: AdjustInventoryInput;
    }): Promise<Inventory> => {
      const response = await inventoryService.adjust(id, data);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message);
    },
    onSuccess: (_, variables) => {
      // Invalidate specific inventory and list
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
    },
  });
}

// ------------------------------------------------------------------------------
// useDisposeInventory Mutation (Soft delete - mark as DISPOSED)
// ------------------------------------------------------------------------------

export function useDisposeInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<Inventory> => {
      const response = await inventoryService.delete(id);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message);
    },
    onSuccess: (_, id) => {
      // Invalidate specific inventory and list
      queryClient.invalidateQueries({ queryKey: inventoryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
    },
  });
}
