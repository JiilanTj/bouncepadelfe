import { User } from "./user.types";

// -----------------------------------------------------------------------------
// Login
// -----------------------------------------------------------------------------

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user: User;
  accessToken: string;
}

// -----------------------------------------------------------------------------
// Register
// -----------------------------------------------------------------------------

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role?: "OWNER" | "ADMIN" | "INPUTER" | "KASIR";
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user: User;
}

// -----------------------------------------------------------------------------
// Logout
// -----------------------------------------------------------------------------

export interface LogoutResponse {
  success: boolean;
  message: string;
}

// -----------------------------------------------------------------------------
// Auth State (for React Context/Store)
// -----------------------------------------------------------------------------

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
