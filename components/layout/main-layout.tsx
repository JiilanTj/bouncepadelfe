"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { useAuthStore } from "@/lib/store";
import { canAccessPage } from "@/lib/role-utils";
import { UserRole } from "@/lib/types";

// Hook to check if component is mounted (for hydration)
function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isMounted = useIsMounted();
  
  const { user, isAuthenticated, fetchProfile } = useAuthStore();

  // Fetch profile on mount if authenticated
  useEffect(() => {
    if (isAuthenticated && !user) {
      fetchProfile();
    }
  }, [isAuthenticated, user, fetchProfile]);

  // Client-side role check (middleware handles server-side)
  useEffect(() => {
    if (user && !canAccessPage(user.role as UserRole, pathname)) {
      router.push("/dashboard");
    }
  }, [pathname, router, user]);

  // Prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  // If no user, show loading (middleware will redirect if not authenticated)
  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 print-hidden">
      {/* Fixed Sidebar */}
      <Sidebar userRole={user.role} userName={user.name} />

      {/* Main Content - with left margin for sidebar */}
      <div className="ml-64 flex min-h-screen flex-col">
        <Topbar userName={user.name} userRole={user.role} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
