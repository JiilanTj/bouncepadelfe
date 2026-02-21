"use client";

import { useState } from "react";

import { toast } from "sonner";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryTable } from "@/components/categories/category-table";
import {
  useMenuCategories,
  useCreateMenuCategory,
  useUpdateMenuCategory,
  useDeleteMenuCategory,
  useActivateMenuCategory,
} from "@/lib/hooks";
import { Utensils } from "lucide-react";

export default function MenuCategoryPage() {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: categoriesData, isLoading } = useMenuCategories({
    page,
    limit,
  });

  // Handle paginated response
  const categories = categoriesData?.data || [];
    
  const totalPages = categoriesData?.meta?.totalPages || 1;
  
  const createMutation = useCreateMenuCategory();
  const updateMutation = useUpdateMenuCategory();
  const deleteMutation = useDeleteMenuCategory();
  const activateMutation = useActivateMenuCategory();

  const handleCreate = async (data: { name: string; description?: string }) => {
    try {
      await createMutation.mutateAsync(data);
      toast.success("Menu category created successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create category");
    }
  };

  const handleUpdate = async (id: string, data: { name?: string; description?: string }) => {
    try {
      await updateMutation.mutateAsync({ id, data });
      toast.success("Menu category updated successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update category");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Menu category deactivated successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to deactivate category");
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await activateMutation.mutateAsync(id);
      toast.success("Menu category activated successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to activate category");
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h2 className="text-2xl font-bold text-[var(--gray-900)]">Menu Category</h2>
          <p className="text-sm text-[var(--gray-500)]">Manage menu categories for POS</p>
        </div>

        {/* Content */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Utensils className="h-5 w-5 text-[var(--brand)]" />
              <CardTitle className="text-lg font-semibold">Menu Categories</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CategoryTable
              type="menu"
              categories={categories}
              isLoading={isLoading}
              onCreate={handleCreate}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onActivate={handleActivate}
              isCreating={createMutation.isPending}
              isUpdating={updateMutation.isPending}
              isDeleting={deleteMutation.isPending}
              isActivating={activateMutation.isPending}
              page={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
