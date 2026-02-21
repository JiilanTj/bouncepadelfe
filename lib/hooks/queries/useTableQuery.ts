"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tableService } from "@/lib/services";
import {
  Table,
  CreateTableInput,
  UpdateTableInput,
  UpdateTableStatusInput,
  TableQueryParams,
  TablesListResponse,
} from "@/lib/types";

// ------------------------------------------------------------------------------
// Query Keys
// ------------------------------------------------------------------------------

export const tableKeys = {
  all: ["tables"] as const,
  lists: () => [...tableKeys.all, "list"] as const,
  list: (params?: TableQueryParams) =>
    [...tableKeys.lists(), params] as const,
  details: () => [...tableKeys.all, "detail"] as const,
  detail: (id: string) => [...tableKeys.details(), id] as const,
};

// ------------------------------------------------------------------------------
// useTables Query - Get all tables with filtering
// ------------------------------------------------------------------------------

export function useTables(params?: TableQueryParams, enabled = true) {
  return useQuery({
    queryKey: tableKeys.list(params),
    queryFn: async (): Promise<TablesListResponse["data"]> => {
      const response = await tableService.getAll(params);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message);
    },
    enabled,
    staleTime: 1 * 60 * 1000, // 1 minute (tables change frequently)
    placeholderData: (previousData) => previousData,
  });
}

// ------------------------------------------------------------------------------
// useTable Query - Get single table
// ------------------------------------------------------------------------------

export function useTable(id: string, enabled = true) {
  return useQuery({
    queryKey: tableKeys.detail(id),
    queryFn: async (): Promise<Table> => {
      const response = await tableService.getById(id);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message);
    },
    enabled: enabled && !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// ------------------------------------------------------------------------------
// useCreateTable Mutation
// ------------------------------------------------------------------------------

export function useCreateTable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTableInput): Promise<Table> => {
      const response = await tableService.create(data);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message);
    },
    onSuccess: () => {
      // Invalidate tables list cache
      queryClient.invalidateQueries({ queryKey: tableKeys.lists() });
    },
  });
}

// ------------------------------------------------------------------------------
// useUpdateTable Mutation
// ------------------------------------------------------------------------------

export function useUpdateTable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateTableInput;
    }): Promise<Table> => {
      const response = await tableService.update(id, data);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message);
    },
    onSuccess: (_, variables) => {
      // Invalidate specific table and list
      queryClient.invalidateQueries({
        queryKey: tableKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: tableKeys.lists() });
    },
  });
}

// ------------------------------------------------------------------------------
// useUpdateTableStatus Mutation (OCCUPY/CLEAR - KASIR can use this)
// ------------------------------------------------------------------------------

export function useUpdateTableStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateTableStatusInput;
    }): Promise<Table> => {
      const response = await tableService.updateStatus(id, data);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message);
    },
    onSuccess: (_, variables) => {
      // Invalidate specific table and list
      queryClient.invalidateQueries({
        queryKey: tableKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: tableKeys.lists() });
    },
  });
}

// ------------------------------------------------------------------------------
// useDeleteTable Mutation (Soft delete - deactivate)
// ------------------------------------------------------------------------------

export function useDeleteTable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<Table> => {
      const response = await tableService.delete(id);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message);
    },
    onSuccess: (_, id) => {
      // Invalidate specific table and list
      queryClient.invalidateQueries({ queryKey: tableKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: tableKeys.lists() });
    },
  });
}

// ------------------------------------------------------------------------------
// useActivateTable Mutation (Re-activate)
// ------------------------------------------------------------------------------

export function useActivateTable() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<Table> => {
      const response = await tableService.activate(id);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message);
    },
    onSuccess: (_, id) => {
      // Invalidate specific table and list
      queryClient.invalidateQueries({ queryKey: tableKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: tableKeys.lists() });
    },
  });
}
