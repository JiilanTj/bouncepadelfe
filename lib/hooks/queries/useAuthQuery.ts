"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/services";
import { useAuthStore } from "@/lib/store";
import { LoginInput, RegisterInput, User } from "@/lib/types";

// Query Keys
export const authKeys = {
  all: ["auth"] as const,
  profile: () => [...authKeys.all, "profile"] as const,
};

// -----------------------------------------------------------------------------
// useLogin Mutation
// -----------------------------------------------------------------------------

export function useLogin() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginInput) => {
      const success = await login(credentials);
      if (!success) {
        throw new Error("Login failed");
      }
      return success;
    },
    onSuccess: () => {
      // Invalidate and refetch profile
      queryClient.invalidateQueries({ queryKey: authKeys.profile() });
      router.push("/dashboard");
    },
  });
}

// -----------------------------------------------------------------------------
// useRegister Mutation
// -----------------------------------------------------------------------------

export function useRegister() {
  const register = useAuthStore((state) => state.register);

  return useMutation({
    mutationFn: async (data: RegisterInput) => {
      const success = await register(data);
      if (!success) {
        throw new Error("Registration failed");
      }
      return success;
    },
  });
}

// -----------------------------------------------------------------------------
// useLogout Mutation
// -----------------------------------------------------------------------------

export function useLogout() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await logout();
    },
    onSuccess: () => {
      // Clear all queries
      queryClient.clear();
      router.push("/login");
    },
  });
}

// -----------------------------------------------------------------------------
// useProfile Query
// -----------------------------------------------------------------------------

export function useProfile(enabled = true) {
  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: async (): Promise<User | null> => {
      const response = await authService.getProfile();
      if (response.success) {
        return response.user;
      }
      return null;
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
