import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "@/lib/services";
import {
  User,
  LoginInput,
  RegisterInput,
  ApiError,
} from "@/lib/types";

// ------------------------------------------------------------------------------
// Cookie Helpers (for middleware)
// ------------------------------------------------------------------------------

function setCookie(name: string, value: string, days = 7): void {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function removeCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

// -----------------------------------------------------------------------------
// Auth State Interface
// -----------------------------------------------------------------------------

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginInput) => Promise<boolean>;
  register: (data: RegisterInput) => Promise<boolean>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  setUser: (user: User | null) => void;
  clearError: () => void;
  reset: () => void;
}

// -----------------------------------------------------------------------------
// Helper to check if response is error
// -----------------------------------------------------------------------------

function isError(response: unknown): response is ApiError {
  return (
    typeof response === "object" &&
    response !== null &&
    "success" in response &&
    !response.success
  );
}

// -----------------------------------------------------------------------------
// Auth Store
// -----------------------------------------------------------------------------

export const useAuthStore = create<AuthState>()(
  persist(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (set, _get) => ({
      // Initial State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Login Action
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authService.login(credentials);
          
          if (isError(response)) {
            set({ 
              isLoading: false, 
              error: response.message,
              isAuthenticated: false,
            });
            return false;
          }

          // Set cookie for middleware
          setCookie("accessToken", response.accessToken);

          set({
            user: response.user,
            token: response.accessToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          
          return true;
        } catch (err) {
          const message = err instanceof Error ? err.message : "Login failed";
          set({ 
            isLoading: false, 
            error: message,
            isAuthenticated: false,
          });
          return false;
        }
      },

      // Register Action
      register: async (data) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authService.register(data);
          
          if (isError(response)) {
            set({ 
              isLoading: false, 
              error: response.message,
            });
            return false;
          }

          set({ isLoading: false, error: null });
          return true;
        } catch (err) {
          const message = err instanceof Error ? err.message : "Registration failed";
          set({ isLoading: false, error: message });
          return false;
        }
      },

      // Logout Action
      logout: async () => {
        set({ isLoading: true });
        
        try {
          await authService.logout();
        } finally {
          // Remove cookie for middleware
          removeCookie("accessToken");

          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      // Fetch Profile Action
      fetchProfile: async () => {
        try {
          const response = await authService.getProfile();
          
          if (!isError(response) && response.success) {
            set({
              user: response.user,
              isAuthenticated: true,
            });
          }
        } catch (err) {
          console.error("Failed to fetch profile:", err);
        }
      },

      // Set User (for manual updates)
      setUser: (user) => set({ user }),

      // Clear Error
      clearError: () => set({ error: null }),

      // Reset State
      reset: () => set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      }),
    }),
    {
      name: "auth-storage", // localStorage key
      partialize: (state) => ({ 
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
