import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ------------------------------------------------------------------------------
// Route Configuration
// ------------------------------------------------------------------------------

// Public routes that don't require authentication
const PUBLIC_ROUTES = ["/", "/store", "/fnb", "/login", "/register", "/forgot-password"];

// Role-based route access
const ROLE_ROUTES = {
  OWNER: [
    "/dashboard",
    "/booking",
    "/courts",
    "/transactions",
    "/pos",
    "/store",
    "/store-product",
    "/rental",
    "/tables",
    "/master-data",
    "/master-data/product-category",
    "/master-data/menu-category",
    "/master-data/products",
    "/master-data/menu",
    "/master-data/inventory",
    "/master-data/courts",
    "/master-data/facilities",
    "/users",
    "/reports",
    "/settings",
    "/dashboard/order-requests",
  ],
  ADMIN: [
    "/dashboard",
    "/booking",
    "/courts",
    "/transactions",
    "/pos",
    "/store",
    "/store-product",
    "/rental",
    "/tables",
    "/master-data",
    "/master-data/product-category",
    "/master-data/menu-category",
    "/master-data/products",
    "/master-data/menu",
    "/master-data/inventory",
    "/master-data/courts",
    "/master-data/facilities",
    "/settings",
    "/dashboard/order-requests",
  ],
  KASIR: [
    "/dashboard",
    "/booking",
    "/courts",
    "/transactions",
    "/pos",
    "/store",
    "/store-product",
    "/rental",
    "/tables",
    "/dashboard/order-requests",
  ],
};

type UserRole = "OWNER" | "ADMIN" | "KASIR";

// ------------------------------------------------------------------------------
// Helper Functions
// ------------------------------------------------------------------------------

function isPublicRoute(path: string): boolean {
  return PUBLIC_ROUTES.some((route) => path === route || path.startsWith(`${route}/`));
}

function canAccessRoute(role: UserRole, path: string): boolean {
  const allowedRoutes = ROLE_ROUTES[role];
  if (!allowedRoutes) return false;

  // Check if path starts with any allowed route
  return allowedRoutes.some((route) => path === route || path.startsWith(`${route}/`));
}

function parseToken(token: string): { role?: UserRole; exp?: number } | null {
  try {
    // JWT tokens are in format: header.payload.signature
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // Convert base64url to base64
    // base64url uses '-' instead of '+' and '_' instead of '/'
    let base64 = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    // Add padding if needed
    const padding = base64.length % 4;
    if (padding) {
      base64 += "=".repeat(4 - padding);
    }

    const payload = JSON.parse(Buffer.from(base64, "base64").toString());
    return payload;
  } catch (error) {
    console.error("Failed to parse token:", error);
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const payload = parseToken(token);
  if (!payload?.exp) return true;

  // exp is in seconds, Date.now() is in milliseconds
  return payload.exp * 1000 < Date.now();
}

// Debug flag - set to true for verbose logging
const DEBUG = process.env.NODE_ENV === "development";

// ------------------------------------------------------------------------------
// Proxy (Auth Protection & Role-Based Access)
// ------------------------------------------------------------------------------

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (DEBUG) {
    console.log(`[Proxy] ${request.method} ${pathname}`);
  }

  // Allow public routes
  if (isPublicRoute(pathname)) {
    // If user is already logged in, redirect to dashboard
    const token = request.cookies.get("accessToken")?.value;
    if (token && !isTokenExpired(token) && pathname === "/login") {
      if (DEBUG) console.log("[Proxy] Already logged in, redirecting to dashboard");
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Check for auth token
  const token = request.cookies.get("accessToken")?.value;

  // No token - redirect to login
  if (!token) {
    if (DEBUG) console.log("[Proxy] No token, redirecting to login");
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Token expired - redirect to login
  if (isTokenExpired(token)) {
    if (DEBUG) console.log("[Proxy] Token expired, redirecting to login");
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("accessToken");
    return response;
  }

  // Parse token to get role
  const payload = parseToken(token);
  const role = payload?.role;

  if (DEBUG) {
    console.log("[Proxy] Token payload:", payload);
    console.log("[Proxy] Role:", role);
  }

  // No role in token - redirect to login
  if (!role) {
    console.error("[Proxy] No role in token, redirecting to login");
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("accessToken");
    return response;
  }

  // Check role-based access
  if (!canAccessRoute(role, pathname)) {
    console.warn(`[Proxy] Access denied: ${role} cannot access ${pathname}`);
    // Redirect to dashboard if not authorized
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (DEBUG) {
    console.log(`[Proxy] Access granted: ${role} -> ${pathname}`);
  }

  return NextResponse.next();
}

// ------------------------------------------------------------------------------
// Config
// ------------------------------------------------------------------------------

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public folder)
     * - All root-level static assets (png, jpg, jpeg, gif, svg, ico, webp)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public/|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|mp3)$).*)",
  ],
};
