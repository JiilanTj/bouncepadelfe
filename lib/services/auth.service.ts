import { api, setToken, removeToken } from "@/lib/api";
import {
  LoginInput,
  LoginResponse,
  RegisterInput,
  RegisterResponse,
  LogoutResponse,
  User,
} from "@/lib/types";

// -----------------------------------------------------------------------------
// Auth Service
// -----------------------------------------------------------------------------

export const authService = {
  /**
   * Login user and store token
   */
  async login(credentials: LoginInput): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>("/auth/login", credentials);
    
    if (response.success && response.accessToken) {
      setToken(response.accessToken);
    }
    
    return response;
  },

  /**
   * Register new user
   */
  async register(data: RegisterInput): Promise<RegisterResponse> {
    return api.post<RegisterResponse>("/auth/register", data);
  },

  /**
   * Logout user and clear token
   */
  async logout(): Promise<LogoutResponse> {
    try {
      const response = await api.post<LogoutResponse>("/auth/logout", {});
      return response;
    } finally {
      removeToken();
    }
  },

  /**
   * Get current user profile
   */
  async getProfile(): Promise<{ success: boolean; user: User }> {
    return api.get<{ success: boolean; user: User }>("/auth/me");
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("accessToken");
  },

  /**
   * Get stored token
   */
  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("accessToken");
  },
};
