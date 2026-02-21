"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { menuService } from "@/lib/services";
import {
  Menu,
  CreateMenuInput,
  UpdateMenuInput,
  MenuQueryParams,
  MenusListResponse,
} from "@/lib/types";

// ------------------------------------------------------------------------------
// Query Keys
// ------------------------------------------------------------------------------

export const menuKeys = {
  all: ["menus"] as const,
  lists: () => [...menuKeys.all, "list"] as const,
  list: (params?: MenuQueryParams) =>
    [...menuKeys.lists(), params] as const,
  details: () => [...menuKeys.all, "detail"] as const,
  detail: (id: string) => [...menuKeys.details(), id] as const,
};

// ------------------------------------------------------------------------------
// useMenus Query - Get all menus with pagination/filtering
// ------------------------------------------------------------------------------

export function useMenus(params?: MenuQueryParams, enabled = true) {
  return useQuery({
    queryKey: menuKeys.list(params),
    queryFn: async (): Promise<MenusListResponse["data"]> => {
      const response = await menuService.getAll(params);
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
// useMenu Query - Get single menu
// ------------------------------------------------------------------------------

export function useMenu(id: string, enabled = true) {
  return useQuery({
    queryKey: menuKeys.detail(id),
    queryFn: async (): Promise<Menu> => {
      const response = await menuService.getById(id);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message);
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ------------------------------------------------------------------------------
// useCreateMenu Mutation
// ------------------------------------------------------------------------------

export function useCreateMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateMenuInput): Promise<Menu> => {
      const response = await menuService.create(data);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message);
    },
    onSuccess: () => {
      // Invalidate menus list cache
      queryClient.invalidateQueries({ queryKey: menuKeys.lists() });
    },
  });
}

// ------------------------------------------------------------------------------
// useUpdateMenu Mutation
// ------------------------------------------------------------------------------

export function useUpdateMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateMenuInput;
    }): Promise<Menu> => {
      const response = await menuService.update(id, data);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message);
    },
    onSuccess: (_, variables) => {
      // Invalidate specific menu and list
      queryClient.invalidateQueries({
        queryKey: menuKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: menuKeys.lists() });
    },
  });
}

// ------------------------------------------------------------------------------
// useDeleteMenu Mutation (Soft delete - deactivate)
// ------------------------------------------------------------------------------

export function useDeleteMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<Menu> => {
      const response = await menuService.delete(id);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message);
    },
    onSuccess: (_, id) => {
      // Invalidate specific menu and list
      queryClient.invalidateQueries({ queryKey: menuKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: menuKeys.lists() });
    },
  });
}

// ------------------------------------------------------------------------------
// useActivateMenu Mutation (Re-activate)
// ------------------------------------------------------------------------------

export function useActivateMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<Menu> => {
      const response = await menuService.activate(id);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message);
    },
    onSuccess: (_, id) => {
      // Invalidate specific menu and list
      queryClient.invalidateQueries({ queryKey: menuKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: menuKeys.lists() });
    },
  });
}
