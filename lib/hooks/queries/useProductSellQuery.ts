"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { productSellService } from "@/lib/services";
import {
  ProductSell,
  ProductSellQueryParams,
  ProductSellsListResponse,
  ProductSellHistoryResponse,
  ProductSellStatsResponse,
} from "@/lib/types";

// ------------------------------------------------------------------------------
// Query Keys
// ------------------------------------------------------------------------------

export const productSellKeys = {
  all: ["product-sells"] as const,
  lists: () => [...productSellKeys.all, "list"] as const,
  list: (params?: ProductSellQueryParams) =>
    [...productSellKeys.lists(), params] as const,
  details: () => [...productSellKeys.all, "detail"] as const,
  detail: (id: string) => [...productSellKeys.details(), id] as const,
  productHistory: (productId: string) =>
    [...productSellKeys.all, "product", productId] as const,
  productStats: (productId: string) =>
    [...productSellKeys.all, "stats", productId] as const,
  transaction: (transactionId: string) =>
    [...productSellKeys.all, "transaction", transactionId] as const,
};

// ------------------------------------------------------------------------------
// useProductSells Query - Get all sell records with filtering
// ------------------------------------------------------------------------------

export function useProductSells(params?: ProductSellQueryParams, enabled = true) {
  return useQuery({
    queryKey: productSellKeys.list(params),
    queryFn: async (): Promise<ProductSellsListResponse["data"]> => {
      const response = await productSellService.getAll(params);
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
// useProductSell Query - Get single sell record
// ------------------------------------------------------------------------------

export function useProductSell(id: string, enabled = true) {
  return useQuery({
    queryKey: productSellKeys.detail(id),
    queryFn: async (): Promise<ProductSell> => {
      const response = await productSellService.getById(id);
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
// useProductSellHistory Query - Get sell history by product
// ------------------------------------------------------------------------------

export function useProductSellHistory(
  productId: string,
  params?: Pick<ProductSellQueryParams, "page" | "limit">,
  enabled = true
) {
  return useQuery({
    queryKey: [...productSellKeys.productHistory(productId), params],
    queryFn: async (): Promise<ProductSellHistoryResponse["data"]> => {
      const response = await productSellService.getByProduct(productId, params);
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
// useProductSellStats Query - Get sell stats by product
// ------------------------------------------------------------------------------

export function useProductSellStats(productId: string, enabled = true) {
  return useQuery({
    queryKey: productSellKeys.productStats(productId),
    queryFn: async (): Promise<ProductSellStatsResponse["data"]> => {
      const response = await productSellService.getProductStats(productId);
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
// useTransactionSellRecords Query - Get sell records by transaction
// ------------------------------------------------------------------------------

export function useTransactionSellRecords(transactionId: string, enabled = true) {
  return useQuery({
    queryKey: productSellKeys.transaction(transactionId),
    queryFn: async (): Promise<ProductSell[]> => {
      const response = await productSellService.getByTransaction(transactionId);
      if (response.success) {
        return response.data.data;
      }
      throw new Error(response.message);
    },
    enabled: enabled && !!transactionId,
    staleTime: 5 * 60 * 1000,
  });
}
