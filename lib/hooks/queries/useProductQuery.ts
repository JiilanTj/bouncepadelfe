"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "@/lib/services";
import {
  Product,
  CreateProductInput,
  UpdateProductInput,
  ProductQueryParams,
  ProductsListResponse,
} from "@/lib/types";

// ------------------------------------------------------------------------------
// Query Keys
// ------------------------------------------------------------------------------

export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (params?: ProductQueryParams) =>
    [...productKeys.lists(), params] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};

// ------------------------------------------------------------------------------
// useProducts Query - Get all products with pagination/filtering
// ------------------------------------------------------------------------------

export function useProducts(params?: ProductQueryParams, enabled = true) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: async (): Promise<ProductsListResponse["data"]> => {
      const response = await productService.getAll(params);
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
// useProduct Query - Get single product
// ------------------------------------------------------------------------------

export function useProduct(id: string, enabled = true) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: async (): Promise<Product> => {
      const response = await productService.getById(id);
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
// useCreateProduct Mutation
// ------------------------------------------------------------------------------

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProductInput): Promise<Product> => {
      const response = await productService.create(data);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message);
    },
    onSuccess: () => {
      // Invalidate products list cache
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

// ------------------------------------------------------------------------------
// useUpdateProduct Mutation
// ------------------------------------------------------------------------------

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateProductInput;
    }): Promise<Product> => {
      const response = await productService.update(id, data);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message);
    },
    onSuccess: (_, variables) => {
      // Invalidate specific product and list
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

// ------------------------------------------------------------------------------
// useDeleteProduct Mutation (Soft delete - deactivate)
// ------------------------------------------------------------------------------

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<Product> => {
      const response = await productService.delete(id);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message);
    },
    onSuccess: (_, id) => {
      // Invalidate specific product and list
      queryClient.invalidateQueries({ queryKey: productKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

// ------------------------------------------------------------------------------
// useActivateProduct Mutation (Re-activate)
// ------------------------------------------------------------------------------

export function useActivateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<Product> => {
      const response = await productService.activate(id);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message);
    },
    onSuccess: (_, id) => {
      // Invalidate specific product and list
      queryClient.invalidateQueries({ queryKey: productKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}
