import { UserRole } from "./types";

// ------------------------------------------------------------------------------
// Menu Item Type
// ------------------------------------------------------------------------------

export interface MenuItem {
  name: string;
  href: string;
  icon: string;
  roles: UserRole[];
  children?: MenuItem[];
}

// ------------------------------------------------------------------------------
// Menu Items with Role-Based Access
// ------------------------------------------------------------------------------

export const menuItems: MenuItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: "LayoutDashboard", roles: ["OWNER", "ADMIN", "INPUTER", "KASIR"] },
  { name: "Booking", href: "/booking", icon: "CalendarDays", roles: ["OWNER", "ADMIN", "INPUTER", "KASIR"] },
  { name: "Transactions", href: "/transactions", icon: "Receipt", roles: ["OWNER", "ADMIN", "INPUTER", "KASIR"] },
  { name: "POS", href: "/pos", icon: "ShoppingCart", roles: ["OWNER", "ADMIN", "KASIR"] },
  { name: "Store Product", href: "/store-product", icon: "Package", roles: ["OWNER", "ADMIN", "KASIR"] },
  { name: "Rental", href: "/rental", icon: "Racket", roles: ["OWNER", "ADMIN", "KASIR"] },
  { name: "Tables", href: "/tables", icon: "Armchair", roles: ["OWNER", "ADMIN", "KASIR"] },
  { name: "Order Requests", href: "/dashboard/order-requests", icon: "ClipboardCheck", roles: ["OWNER", "ADMIN", "KASIR"] },

  // Master Data Group (Collapsible)
  {
    name: "Master Data",
    href: "/master-data",
    icon: "Database",
    roles: ["OWNER", "ADMIN", "INPUTER"],
    children: [
      { name: "Product Category", href: "/master-data/product-category", icon: "FolderTree", roles: ["OWNER", "ADMIN", "INPUTER"] },
      { name: "Menu Category", href: "/master-data/menu-category", icon: "Utensils", roles: ["OWNER", "ADMIN", "INPUTER"] },
      { name: "Product Master Data", href: "/master-data/products", icon: "Boxes", roles: ["OWNER", "ADMIN", "INPUTER"] },
      { name: "Menu Master Data", href: "/master-data/menu", icon: "ClipboardList", roles: ["OWNER", "ADMIN", "INPUTER"] },
      { name: "Inventory", href: "/master-data/inventory", icon: "Package", roles: ["OWNER", "ADMIN", "INPUTER"] },
      { name: "Court Master Data", href: "/master-data/courts", icon: "Grid3X3", roles: ["OWNER", "ADMIN", "INPUTER"] },
      { name: "Facilities", href: "/master-data/facilities", icon: "Building2", roles: ["OWNER", "ADMIN", "INPUTER"] },
    ],
  },

  { name: "Users", href: "/users", icon: "Users", roles: ["OWNER"] },
  { name: "Reports", href: "/reports", icon: "BarChart3", roles: ["OWNER"] },
  { name: "Sync History", href: "/sync-history", icon: "History", roles: ["OWNER", "ADMIN", "INPUTER", "KASIR"] },
  { name: "Settings", href: "/settings", icon: "Settings", roles: ["OWNER", "ADMIN"] },
];

// ------------------------------------------------------------------------------
// Role-Based Access Control Functions
// ------------------------------------------------------------------------------

/**
 * Get menu items accessible by the given role
 * Also filters children items by role
 */
export function getAccessibleMenuItems(role: UserRole | null): MenuItem[] {
  if (!role) return [];

  return menuItems
    .filter((item) => item.roles.includes(role))
    .map((item) => {
      if (item.children) {
        // Filter children by role as well
        const accessibleChildren = item.children.filter((child) => child.roles.includes(role));
        return {
          ...item,
          children: accessibleChildren.length > 0 ? accessibleChildren : undefined,
        };
      }
      return item;
    })
    .filter((item) => {
      // If item has children but none are accessible, still show parent (it might have its own page)
      // Or if it has accessible children, show it
      // Or if it's a regular item, show it
      return !item.children || item.children.length > 0 || item.href !== "/master-data";
    });
}

/**
 * Check if a role can access a specific page
 */
export function canAccessPage(role: UserRole | null, path: string): boolean {
  if (!role) return false;

  // Check in main menu items
  const menuItem = menuItems.find((item) => item.href === path);
  if (menuItem) {
    return menuItem.roles.includes(role);
  }

  // Check in children items
  for (const item of menuItems) {
    if (item.children) {
      const childItem = item.children.find((child) => child.href === path);
      if (childItem) {
        return childItem.roles.includes(role);
      }
    }
  }

  // Allow if not in menu (like login)
  return true;
}

// ------------------------------------------------------------------------------
// Role Badge Colors (using CSS custom properties)
// ------------------------------------------------------------------------------

export function getRoleBadgeColor(role: UserRole): string {
  switch (role) {
    case "OWNER":
      return "bg-[var(--role-owner-bg)] text-[var(--role-owner)] border-[var(--role-owner-border)]";
    case "ADMIN":
      return "bg-[var(--role-admin-bg)] text-[var(--role-admin)] border-[var(--role-admin-border)]";
    case "INPUTER":
      return "bg-[var(--role-inputer-bg)] text-[var(--role-inputer)] border-[var(--role-inputer-border)]";
    case "KASIR":
      return "bg-[var(--role-kasir-bg)] text-[var(--role-kasir)] border-[var(--role-kasir-border)]";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

// ------------------------------------------------------------------------------
// Status Badge Colors (using CSS custom properties)
// ------------------------------------------------------------------------------

export function getStatusBadgeColor(status: string): string {
  switch (status) {
    case "ACTIVE":
    case "AVAILABLE":
    case "BOOKED":
      return "bg-[var(--success-bg)] text-[var(--status-success)] border-[var(--success-border)]";
    case "DONE":
      return "bg-[var(--success-bg)] text-[var(--status-success)] border-[var(--success-border)]";
    case "INACTIVE":
    case "MAINTENANCE":
      return "bg-[var(--warning-bg)] text-[var(--status-warning)] border-[var(--warning-border)]";
    case "CANCELLED":
      return "bg-[var(--danger-bg)] text-[var(--status-danger)] border-[var(--danger-border)]";
    case "OCCUPIED":
    case "RENTED":
      return "bg-[var(--info-bg)] text-[var(--status-info)] border-[var(--info-border)]";
    case "EMPTY":
      return "bg-[var(--success-bg)] text-[var(--status-success)] border-[var(--success-border)]";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

// ------------------------------------------------------------------------------
// Role Route Access Configuration
// ------------------------------------------------------------------------------

export const ROLE_ROUTES: Record<UserRole, string[]> = {
  OWNER: [
    "/dashboard",
    "/booking",
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
    "/sync-history",
    "/settings",
  ],
  ADMIN: [
    "/dashboard",
    "/booking",
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
    "/sync-history",
    "/settings",
  ],
  INPUTER: [
    "/dashboard",
    "/booking",
    "/transactions",
    "/master-data",
    "/master-data/product-category",
    "/master-data/menu-category",
    "/master-data/products",
    "/master-data/menu",
    "/master-data/inventory",
    "/master-data/courts",
    "/master-data/facilities",
    "/sync-history",
  ],
  KASIR: [
    "/dashboard",
    "/booking",
    "/transactions",
    "/pos",
    "/store",
    "/store-product",
    "/rental",
    "/tables",
    "/sync-history",
  ],
};

/**
 * Check if a role can access a specific route
 */
export function canAccessRoute(role: UserRole, path: string): boolean {
  const allowedRoutes = ROLE_ROUTES[role];
  if (!allowedRoutes) return false;
  return allowedRoutes.some((route) => path === route || path.startsWith(`${route}/`));
}

export type { UserRole };
