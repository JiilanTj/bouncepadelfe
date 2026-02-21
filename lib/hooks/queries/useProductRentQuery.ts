"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productRentService } from "@/lib/services";
import {
  ProductRent,
  ProductRentQueryParams,
  ReturnRentalInput,
  ProductRentsListResponse,
  ActiveRentalsResponse,
  ProductRentHistoryResponse,
  ProductRentStatsResponse,
} from "@/lib/types";

// ------------------------------------------------------------------------------
// Query Keys
// ------------------------------------------------------------------------------

export const productRentKeys = {
  all: ["product-rents"] as const,
  lists: () => [...productRentKeys.all, "list"] as const,
  list: (params?: ProductRentQueryParams) =>
    [...productRentKeys.lists(), params] as const,
  active: () => [...productRentKeys.all, "active"] as const,
  activeList: (params?: Pick<ProductRentQueryParams, "page" | "limit">) =>
    [...productRentKeys.active(), params] as const,
  details: () => [...productRentKeys.all, "detail"] as const,
  detail: (id: string) => [...productRentKeys.details(), id] as const,
  productHistory: (productId: string) =>
    [...productRentKeys.all, "product", productId] as const,
  productStats: (productId: string) =>
    [...productRentKeys.all, "stats", productId] as const,
  transaction: (transactionId: string) =>
    [...productRentKeys.all, "transaction", transactionId] as const,
};

// ------------------------------------------------------------------------------
// useProductRents Query - Get all rent records with filtering
// ------------------------------------------------------------------------------

export function useProductRents(params?: ProductRentQueryParams, enabled = true) {
  return useQuery({
    queryKey: productRentKeys.list(params),
    queryFn: async (): Promise<ProductRentsListResponse["data"]> => {
      const response = await productRentService.getAll(params);
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
// useActiveRentals Query - Get active rentals (not yet returned)
// ------------------------------------------------------------------------------

export function useActiveRentals(
  params?: Pick<ProductRentQueryParams, "page" | "limit">,
  enabled = true
) {
  return useQuery({
    queryKey: productRentKeys.activeList(params),
    queryFn: async (): Promise<ActiveRentalsResponse["data"]> => {
      const response = await productRentService.getActive(params);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message);
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

// ------------------------------------------------------------------------------
// useProductRent Query - Get single rent record
// ------------------------------------------------------------------------------

export function useProductRent(id: string, enabled = true) {
  return useQuery({
    queryKey: productRentKeys.detail(id),
    queryFn: async (): Promise<ProductRent> => {
      const response = await productRentService.getById(id);
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
// useProductRentHistory Query - Get rent history by product
// ------------------------------------------------------------------------------

export function useProductRentHistory(
  productId: string,
  params?: Pick<ProductRentQueryParams, "page" | "limit">,
  enabled = true
) {
  return useQuery({
    queryKey: [...productRentKeys.productHistory(productId), params],
    queryFn: async (): Promise<ProductRentHistoryResponse["data"]> => {
      const response = await productRentService.getByProduct(productId, params);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message);
    },
    enabled: enabled && !!productId,
    staleTime: 5 * 60 * 1000,
  });
}

// ------------------------------------------------------------------------------
// useProductRentStats Query - Get rent stats by product
// ------------------------------------------------------------------------------

export function useProductRentStats(productId: string, enabled = true) {
  return useQuery({
    queryKey: productRentKeys.productStats(productId),
    queryFn: async (): Promise<ProductRentStatsResponse["data"]> => {
      const response = await productRentService.getProductStats(productId);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message);
    },
    enabled: enabled && !!productId,
    staleTime: 5 * 60 * 1000,
  });
}

// ------------------------------------------------------------------------------
// useTransactionRentRecords Query - Get rent records by transaction
// ------------------------------------------------------------------------------

export function useTransactionRentRecords(transactionId: string, enabled = true) {
  return useQuery({
    queryKey: productRentKeys.transaction(transactionId),
    queryFn: async (): Promise<ProductRent[]> => {
      const response = await productRentService.getByTransaction(transactionId);
      if (response.success) {
        return response.data.data;
      }
      throw new Error(response.message);
    },
    enabled: enabled && !!transactionId,
    staleTime: 5 * 60 * 1000,
  });
}

// ------------------------------------------------------------------------------
// useReturnRental Mutation - Mark rental as returned (OWNER/ADMIN only)
// ------------------------------------------------------------------------------

export function useReturnRental() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data?: ReturnRentalInput;
    }): Promise<ProductRent> => {
      const response = await productRentService.returnRental(id, data);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message);
    },
    onSuccess: (_, variables) => {
      // Invalidate specific rent and lists
      queryClient.invalidateQueries({
        queryKey: productRentKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: productRentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productRentKeys.active() });
    },
  });
}
