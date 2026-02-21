"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryService, productCategoryService, menuCategoryService } from "@/lib/services";
import {
  Category,
  CategoryType,
  CreateCategoryInput,
  UpdateCategoryInput,
  CategoryQueryParams,
  CategoriesListResponse,
} from "@/lib/types";

// ------------------------------------------------------------------------------
// Query Keys
// ------------------------------------------------------------------------------

export const categoryKeys = {
  all: ["categories"] as const,
  lists: (type: CategoryType) => [...categoryKeys.all, type, "list"] as const,
  list: (type: CategoryType, params?: CategoryQueryParams) =>
    [...categoryKeys.lists(type), params] as const,
  details: (type: CategoryType) => [...categoryKeys.all, type, "detail"] as const,
  detail: (type: CategoryType, id: string) =>
    [...categoryKeys.details(type), id] as const,
};

// ------------------------------------------------------------------------------
// useCategories Query - Get all categories
// ------------------------------------------------------------------------------

export function useCategories(type: CategoryType, params?: CategoryQueryParams, enabled = true) {
  return useQuery({
    queryKey: categoryKeys.list(type, params),
    queryFn: async (): Promise<CategoriesListResponse['data']> => {
      const response = await categoryService.getAll(type, params);
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
// useCategory Query - Get single category
// ------------------------------------------------------------------------------

export function useCategory(type: CategoryType, id: string, enabled = true) {
  return useQuery({
    queryKey: categoryKeys.detail(type, id),
    queryFn: async (): Promise<Category> => {
      const response = await categoryService.getById(type, id);
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
// useCreateCategory Mutation
// ------------------------------------------------------------------------------

export function useCreateCategory(type: CategoryType) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCategoryInput): Promise<Category> => {
      const response = await categoryService.create(type, data);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message);
    },
    onSuccess: () => {
      // Invalidate categories list cache
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists(type) });
    },
  });
}

// ------------------------------------------------------------------------------
// useUpdateCategory Mutation
// ------------------------------------------------------------------------------

export function useUpdateCategory(type: CategoryType) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateCategoryInput;
    }): Promise<Category> => {
      const response = await categoryService.update(type, id, data);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message);
    },
    onSuccess: (_, variables) => {
      // Invalidate specific category and list
      queryClient.invalidateQueries({
        queryKey: categoryKeys.detail(type, variables.id),
      });
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists(type) });
    },
  });
}

// ------------------------------------------------------------------------------
// useDeleteCategory Mutation (Soft delete - deactivate)
// ------------------------------------------------------------------------------

export function useDeleteCategory(type: CategoryType) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<Category> => {
      const response = await categoryService.delete(type, id);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message);
    },
    onSuccess: (_, id) => {
      // Invalidate specific category and list
      queryClient.invalidateQueries({ queryKey: categoryKeys.detail(type, id) });
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists(type) });
    },
  });
}

// ------------------------------------------------------------------------------
// useActivateCategory Mutation (Re-activate)
// ------------------------------------------------------------------------------

export function useActivateCategory(type: CategoryType) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<Category> => {
      const response = await categoryService.activate(type, id);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message);
    },
    onSuccess: (_, id) => {
      // Invalidate specific category and list
      queryClient.invalidateQueries({ queryKey: categoryKeys.detail(type, id) });
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists(type) });
    },
  });
}

// ==============================================================================
// PRODUCT CATEGORY HOOKS (Convenience Exports)
// ==============================================================================

export function useProductCategories(params?: CategoryQueryParams, enabled = true) {
  return useQuery({
    queryKey: categoryKeys.list("product", params),
    queryFn: async (): Promise<CategoriesListResponse['data']> => {
      const response = await productCategoryService.getAll(params);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message);
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
}

export function useProductCategory(id: string, enabled = true) {
  return useQuery({
    queryKey: categoryKeys.detail("product", id),
    queryFn: async (): Promise<Category> => {
      const response = await productCategoryService.getById(id);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message);
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateProductCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCategoryInput): Promise<Category> => {
      const response = await productCategoryService.create(data);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists("product") });
    },
  });
}

export function useUpdateProductCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateCategoryInput;
    }): Promise<Category> => {
      const response = await productCategoryService.update(id, data);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: categoryKeys.detail("product", variables.id),
      });
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists("product") });
    },
  });
}

export function useDeleteProductCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<Category> => {
      const response = await productCategoryService.delete(id);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.detail("product", id) });
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists("product") });
    },
  });
}

export function useActivateProductCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<Category> => {
      const response = await productCategoryService.activate(id);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.detail("product", id) });
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists("product") });
    },
  });
}

// ==============================================================================
// MENU CATEGORY HOOKS (Convenience Exports)
// ==============================================================================

export function useMenuCategories(params?: CategoryQueryParams, enabled = true) {
  return useQuery({
    queryKey: categoryKeys.list("menu", params),
    queryFn: async (): Promise<CategoriesListResponse['data']> => {
      const response = await menuCategoryService.getAll(params);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message);
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });
}

export function useMenuCategory(id: string, enabled = true) {
  return useQuery({
    queryKey: categoryKeys.detail("menu", id),
    queryFn: async (): Promise<Category> => {
      const response = await menuCategoryService.getById(id);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message);
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateMenuCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCategoryInput): Promise<Category> => {
      const response = await menuCategoryService.create(data);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists("menu") });
    },
  });
}

export function useUpdateMenuCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateCategoryInput;
    }): Promise<Category> => {
      const response = await menuCategoryService.update(id, data);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: categoryKeys.detail("menu", variables.id),
      });
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists("menu") });
    },
  });
}

export function useDeleteMenuCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<Category> => {
      const response = await menuCategoryService.delete(id);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.detail("menu", id) });
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists("menu") });
    },
  });
}

export function useActivateMenuCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<Category> => {
      const response = await menuCategoryService.activate(id);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.detail("menu", id) });
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists("menu") });
    },
  });
}
