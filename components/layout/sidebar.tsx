"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { getAccessibleMenuItems, getRoleBadgeColor, MenuItem } from "@/lib/role-utils";
import { UserRole } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  CalendarDays,
  Trophy,
  ShoppingCart,
  Package,
  Armchair,
  Users,
  BarChart3,
  Settings,
  Receipt,
  ChevronDown,
  ChevronRight,
  Database,
  FolderTree,
  Utensils,
  Boxes,
  ClipboardList,
  Grid3X3,
  Building2,
  ClipboardCheck,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  CalendarDays,
  Trophy,
  Receipt,
  ShoppingCart,
  Package,
  Armchair,
  Users,
  BarChart3,
  Settings,
  Database,
  FolderTree,
  Utensils,
  Boxes,
  ClipboardList,
  Grid3X3,
  Building2,
  ClipboardCheck,
};

// Racket icon component
function RacketIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <ellipse cx="12" cy="8" rx="8" ry="5" />
      <path d="M12 13v9" />
      <path d="M9 22h6" />
    </svg>
  );
}

iconMap["Racket"] = RacketIcon;

interface SidebarProps {
  userRole: UserRole | null;
  userName?: string;
}

// Single Menu Item Component
function MenuItemLink({
  item,
  pathname,
  isChild = false,
}: {
  item: MenuItem;
  pathname: string;
  isChild?: boolean;
}) {
  const Icon = iconMap[item.icon];
  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        isChild && "pl-10",
        isActive
          ? "bg-[var(--brand-50)] text-[var(--brand-700)]"
          : "text-[var(--gray-600)] hover:bg-[var(--gray-100)] hover:text-[var(--gray-900)]"
      )}
    >
      {Icon && (
        <Icon className={cn("h-4 w-4 flex-shrink-0", isActive ? "text-[var(--brand)]" : "text-[var(--gray-400)]")} />
      )}
      <span className="truncate">{item.name}</span>
    </Link>
  );
}

// Collapsible Menu Group Component
function MenuGroup({
  item,
  pathname,
  expandedGroups,
  toggleGroup,
}: {
  item: MenuItem;
  pathname: string;
  expandedGroups: Set<string>;
  toggleGroup: (name: string) => void;
}) {
  const Icon = iconMap[item.icon];
  const isExpanded = expandedGroups.has(item.name);
  const hasActiveChild = item.children?.some(
    (child) => pathname === child.href || pathname.startsWith(`${child.href}/`)
  );
  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`) || hasActiveChild;

  return (
    <div className="flex flex-col">
      <button
        onClick={() => toggleGroup(item.name)}
        className={cn(
          "flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
          isActive
            ? "bg-[var(--brand-50)] text-[var(--brand-700)]"
            : "text-[var(--gray-600)] hover:bg-[var(--gray-100)] hover:text-[var(--gray-900)]"
        )}
      >
        <div className="flex items-center gap-3">
          {Icon && (
            <Icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-[var(--brand)]" : "text-[var(--gray-400)]")} />
          )}
          <span>{item.name}</span>
        </div>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-[var(--gray-400)]" />
        ) : (
          <ChevronRight className="h-4 w-4 text-[var(--gray-400)]" />
        )}
      </button>
      {isExpanded && item.children && (
        <div className="mt-1 flex flex-col gap-0.5">
          {item.children.map((child) => (
            <MenuItemLink key={child.href} item={child} pathname={pathname} isChild />
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar({ userRole, userName }: SidebarProps) {
  const pathname = usePathname();
  const menuItems = getAccessibleMenuItems(userRole);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (name: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(name)) {
        newSet.delete(name);
      } else {
        newSet.add(name);
      }
      return newSet;
    });
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-[var(--gray-200)] bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-[var(--gray-200)] bg-white px-6">
        <Link href="/dashboard" className="flex items-center">
          <Image 
            src="/logotypes.png" 
            alt="BouncePadel Logo" 
            width={160} 
            height={40} 
            className="h-auto w-full max-w-[140px] object-contain"
            priority
          />
        </Link>
      </div>

      {/* User Info */}
      <div className="border-b border-[var(--gray-200)] bg-white px-6 py-4">
        <p className="text-sm font-medium text-[var(--gray-900)]">{userName || "User"}</p>
        <Badge
          variant="outline"
          className={cn("mt-1 text-xs font-medium", userRole ? getRoleBadgeColor(userRole) : "")}
        >
          {userRole}
        </Badge>
      </div>

      {/* Navigation - Scrollable */}
      <div className="h-[calc(100vh-180px)] overflow-y-auto px-3 py-4">
        <nav className="flex flex-col gap-1">
          {menuItems.map((item) => {
            if (item.children) {
              return (
                <MenuGroup
                  key={item.name}
                  item={item}
                  pathname={pathname}
                  expandedGroups={expandedGroups}
                  toggleGroup={toggleGroup}
                />
              );
            }
            return <MenuItemLink key={item.href} item={item} pathname={pathname} />;
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 w-64 border-t border-[var(--gray-200)] bg-white p-4">
        <p className="text-xs text-[var(--gray-500)]">© 2026 BouncePadel</p>
        <p className="text-xs text-[var(--gray-400)]">v0.1.0</p>
      </div>
    </aside>
  );
}
