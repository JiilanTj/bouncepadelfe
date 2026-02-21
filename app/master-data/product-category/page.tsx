"use client";

import { useState } from "react";

import { toast } from "sonner";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryTable } from "@/components/categories/category-table";
import {
  useProductCategories,
  useCreateProductCategory,
  useUpdateProductCategory,
  useDeleteProductCategory,
  useActivateProductCategory,
} from "@/lib/hooks";
import { FolderTree } from "lucide-react";

export default function ProductCategoryPage() {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: categoriesData, isLoading } = useProductCategories({
    page,
    limit,
  });

  // Handle paginated response
  const categories = categoriesData?.data || [];
    
  const totalPages = categoriesData?.meta?.totalPages || 1;
  
  const createMutation = useCreateProductCategory();
  const updateMutation = useUpdateProductCategory();
  const deleteMutation = useDeleteProductCategory();
  const activateMutation = useActivateProductCategory();

  const handleCreate = async (data: { name: string; description?: string }) => {
    try {
      await createMutation.mutateAsync(data);
      toast.success("Product category created successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create category");
    }
  };

  const handleUpdate = async (id: string, data: { name?: string; description?: string }) => {
    try {
      await updateMutation.mutateAsync({ id, data });
      toast.success("Product category updated successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update category");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Product category deactivated successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to deactivate category");
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await activateMutation.mutateAsync(id);
      toast.success("Product category activated successfully");
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
          <h2 className="text-2xl font-bold text-[var(--gray-900)]">Product Category</h2>
          <p className="text-sm text-[var(--gray-500)]">Manage product categories for store inventory</p>
        </div>

        {/* Content */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <FolderTree className="h-5 w-5 text-[var(--brand)]" />
              <CardTitle className="text-lg font-semibold">Product Categories</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CategoryTable
              type="product"
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
