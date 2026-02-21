"use client";

import { useState, useEffect } from "react";
import { Menu } from "@/lib/types";
import { Package, Search, X } from "lucide-react";
import { MenuCard } from "./menu-card";
import { MenuGridSkeleton } from "./menu-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


interface MenuGridProps {
  title: string;
  icon: "food" | "drink";
  menus: Menu[];
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAdd: (menu: Menu) => void;
}

export function MenuGrid({ 
  title, 
  icon, 
  menus, 
  isLoading, 
  searchQuery,
  onSearchChange,
  onAdd 
}: MenuGridProps) {
  const Icon = icon === "food" ? Package : Package;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-[var(--brand)]" />
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          </div>
          <div className="relative w-48 sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--gray-400)]" />
            <input
              type="text"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-9 w-full rounded-md border border-[var(--gray-200)] bg-white pl-9 pr-8 text-sm outline-none placeholder:text-[var(--gray-400)] focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)]"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-[var(--gray-400)] hover:bg-[var(--gray-100)] hover:text-[var(--gray-600)]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            <MenuGridSkeleton count={8} />
          </div>
        ) : menus.length === 0 ? (
          <div className="py-8 text-center text-[var(--gray-400)]">
            <Icon className="mx-auto mb-2 h-8 w-8" />
            <p className="text-sm">
              {searchQuery 
                ? `No items found for "${searchQuery}"` 
                : `No ${title.toLowerCase()} items available`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {menus.map((menu) => (
              <MenuCard key={menu.id} menu={menu} onAdd={onAdd} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
