import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

// Token storage key
const TOKEN_KEY = "accessToken";

// -----------------------------------------------------------------------------
// Axios Instance
// -----------------------------------------------------------------------------

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// -----------------------------------------------------------------------------
// Token Helpers
// -----------------------------------------------------------------------------

export function getToken(): string | null {
  if (typeof window === "undefined") return null;

  // 1. Try standard storage key
  let token = localStorage.getItem(TOKEN_KEY);

  // 2. Fallback: Try Zustand "auth-storage"
  if (!token) {
    try {
      const storage = localStorage.getItem("auth-storage");
      if (storage) {
        const parsed = JSON.parse(storage);
        const storedToken = parsed.state?.token;
        if (storedToken && typeof storedToken === "string") {
          token = storedToken;
          // Sync back to TOKEN_KEY for consistency
          localStorage.setItem(TOKEN_KEY, storedToken);
        }
      }
    } catch (e) {
      // Ignore parsing errors
    }
  }

  // 3. Fallback: Try Cookie
  if (!token) {
    const match = document.cookie.match(new RegExp('(^| )accessToken=([^;]+)'));
    if (match) {
      token = decodeURIComponent(match[2]);
      // Sync back to TOKEN_KEY
      localStorage.setItem(TOKEN_KEY, token);
    }
  }

  // Handle corrupted token (remove "Bearer " prefix if exists)
  if (token && token.startsWith("Bearer ")) {
    const cleanToken = token.replace("Bearer ", "");
    localStorage.setItem(TOKEN_KEY, cleanToken);
    return cleanToken;
  }

  return token;
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

// -----------------------------------------------------------------------------
// Request Interceptor - Add Auth Header
// -----------------------------------------------------------------------------

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();

    // Add token to headers if exists
    if (token && config.headers) {
      // Check if token already has "Bearer " prefix (avoid double Bearer)
      const authHeader = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
      config.headers.Authorization = authHeader;

      // Debug log in development
      if (process.env.NODE_ENV === "development") {
        console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
        console.log(`[API] Authorization: ${authHeader.substring(0, 20)}...`);
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// -----------------------------------------------------------------------------
// Response Interceptor - Handle Errors
// -----------------------------------------------------------------------------

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      const isLoginRequest = error.config?.url?.includes("/auth/login");
      const isLoginPage = typeof window !== "undefined" && window.location.pathname.startsWith("/login");

      // Only redirect if NOT on login page AND NOT a login request
      if (!isLoginRequest && !isLoginPage) {
        removeToken();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      } else {
        // Just remove token if we are on login page but have a stale/bad token
        removeToken();
      }
    }

    return Promise.reject(error);
  }
);

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// -----------------------------------------------------------------------------
// Generic API Methods
// -----------------------------------------------------------------------------

export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    axiosInstance.get<T>(url, config).then((res) => res.data),

  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    axiosInstance.post<T>(url, data, config).then((res) => res.data),

  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    axiosInstance.put<T>(url, data, config).then((res) => res.data),

  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    axiosInstance.patch<T>(url, data, config).then((res) => res.data),

  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    axiosInstance.delete<T>(url, config).then((res) => res.data),
};

export { API_BASE_URL };
