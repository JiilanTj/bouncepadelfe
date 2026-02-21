"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { transactionService } from "@/lib/services";
import {
  Transaction,
  TransactionItem,
  CreateTransactionInput,
  TransactionQueryParams,
  TransactionsListResponse,
} from "@/lib/types";

// ------------------------------------------------------------------------------
// Query Keys
// ------------------------------------------------------------------------------

export const transactionKeys = {
  all: ["transactions"] as const,
  lists: () => [...transactionKeys.all, "list"] as const,
  list: (params?: TransactionQueryParams) =>
    [...transactionKeys.lists(), params] as const,
  details: () => [...transactionKeys.all, "detail"] as const,
  detail: (id: string) => [...transactionKeys.details(), id] as const,
};

// ------------------------------------------------------------------------------
// useTransactions Query - Get all transactions with pagination/filtering
// ------------------------------------------------------------------------------

export function useTransactions(params?: TransactionQueryParams, enabled = true) {
  return useQuery({
    queryKey: transactionKeys.list(params),
    queryFn: async (): Promise<TransactionsListResponse["data"]> => {
      const response = await transactionService.getAll(params);
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
// useTransaction Query - Get single transaction with items
// ------------------------------------------------------------------------------

export interface TransactionDetail {
  transaction: Transaction;
  items: TransactionItem[];
}

export function useTransaction(id: string, enabled = true) {
  return useQuery({
    queryKey: transactionKeys.detail(id),
    queryFn: async (): Promise<TransactionDetail> => {
      const response = await transactionService.getById(id);
      if (response.success) {
        return {
          transaction: response.data,
          items: response.data.items || [],
        };
      }
      throw new Error(response.message);
    },
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ------------------------------------------------------------------------------
// useCreateTransaction Mutation
// ------------------------------------------------------------------------------

export interface CreateTransactionResult {
  transaction: Transaction;
  items: TransactionItem[];
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTransactionInput): Promise<CreateTransactionResult> => {
      const response = await transactionService.create(data);
      if (response.success) {
        return {
          transaction: response.data.transaction,
          items: response.data.items,
        };
      }
      throw new Error(response.message);
    },
    onSuccess: () => {
      // Invalidate transactions list cache
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      // Also invalidate tables since transaction affects table status
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    },
  });
}

// ------------------------------------------------------------------------------
// useCancelTransaction Mutation (OWNER/ADMIN only)
// ------------------------------------------------------------------------------

export function useCancelTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<{ id: string }> => {
      const response = await transactionService.cancel(id);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message);
    },
    onSuccess: (_, id) => {
      // Invalidate specific transaction and list
      queryClient.invalidateQueries({ queryKey: transactionKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      // Also invalidate tables since cancel affects table status
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    },
  });
}

// ------------------------------------------------------------------------------
// useCompleteTransaction Mutation (OWNER/ADMIN only, for RENTAL type)
// ------------------------------------------------------------------------------

export function useCompleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<{ id: string }> => {
      const response = await transactionService.complete(id);
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message);
    },
    onSuccess: (_, id) => {
      // Invalidate specific transaction and list
      queryClient.invalidateQueries({ queryKey: transactionKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      // Also invalidate tables since complete affects table status
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    },
  });
}
