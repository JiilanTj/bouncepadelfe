"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Category, CategoryType, CreateCategoryInput, UpdateCategoryInput } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Search, Plus, MoreHorizontal, Pencil, Trash2, FolderTree, Utensils, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import { DeleteCategoryDialog } from "./delete-category-dialog";

interface CategoryTableProps {
  type: CategoryType;
  categories: Category[];
  isLoading: boolean;
  onCreate: (data: CreateCategoryInput) => void;
  onUpdate: (id: string, data: UpdateCategoryInput) => void;
  onDelete: (id: string) => void;
  onActivate: (id: string) => void;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isActivating: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function CategoryTable({
  type,
  categories,
  isLoading,
  onCreate,
  onUpdate,
  onDelete,
  onActivate,
  isCreating,
  isUpdating,
  isDeleting,
  isActivating,
  page,
  totalPages,
  onPageChange,
}: CategoryTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CreateCategoryInput>({
    name: "",
    description: "",
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const isProduct = type === "product";
  const title = isProduct ? "Product Category" : "Menu Category";
  const Icon = isProduct ? FolderTree : Utensils;

  const filteredCategories = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = categories.filter((c) => c.isActive).length;
  const inactiveCount = categories.filter((c) => !c.isActive).length;

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormData({ name: "", description: "" });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (editingCategory) {
      onUpdate(editingCategory.id, formData);
    } else {
      onCreate(formData);
    }
    setIsFormOpen(false);
  };

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (categoryToDelete) {
      onDelete(categoryToDelete.id);
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-full animate-pulse rounded bg-gray-200"></div>
        <div className="h-64 w-full animate-pulse rounded bg-gray-200"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-[var(--gray-200)] bg-white p-4">
          <p className="text-2xl font-bold text-[var(--gray-900)]">{categories.length}</p>
          <p className="text-sm text-[var(--gray-500)]">Total Categories</p>
        </div>
        <div className="rounded-lg border border-[var(--success-border)] bg-[var(--success-bg)] p-4">
          <p className="text-2xl font-bold text-[var(--status-success)]">{activeCount}</p>
          <p className="text-sm text-[var(--gray-500)]">Active</p>
        </div>
        <div className="rounded-lg border border-[var(--gray-200)] bg-white p-4">
          <p className="text-2xl font-bold text-[var(--gray-900)]">{inactiveCount}</p>
          <p className="text-sm text-[var(--gray-500)]">Inactive</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--gray-400)]" />
          <Input
            placeholder="Search categories..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-[var(--brand)] hover:bg-[var(--brand-dark)]"
          disabled={isCreating}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add {title}
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-[var(--gray-200)] bg-white">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-[var(--gray-500)]">
                  {searchQuery ? "No categories found" : `No ${title.toLowerCase()}s yet`}
                </TableCell>
              </TableRow>
            ) : (
              filteredCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-[var(--brand)]" />
                      {category.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-[var(--gray-500)]">{category.slug}</TableCell>
                  <TableCell className="max-w-xs truncate text-[var(--gray-500)]">
                    {category.description || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        category.isActive
                          ? "border-[var(--success-border)] bg-[var(--success-bg)] text-[var(--status-success)]"
                          : "border-[var(--gray-200)] bg-[var(--gray-100)] text-[var(--gray-500)]"
                      }
                    >
                      {category.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[var(--gray-500)]">
                    {formatDate(category.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleOpenEdit(category)}
                          className="cursor-pointer"
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        
                        {category.isActive ? (
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(category)}
                            className="cursor-pointer text-[var(--status-danger)]"
                            disabled={isDeleting}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Deactivate
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => onActivate(category.id)}
                            className="cursor-pointer text-[var(--status-success)]"
                            disabled={isActivating}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Activate
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <div className="text-sm text-[var(--gray-500)]">
            Page {page} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Form Dialog */},
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-[var(--gray-900)]">
              {editingCategory ? `Edit ${title}` : `Add ${title}`}
            </h3>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--gray-700)]">
                  Name <span className="text-[var(--status-danger)]">*</span>
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={`Enter ${title.toLowerCase()} name`}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--gray-700)]">
                  Description
                </label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter description (optional)"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsFormOpen(false)}
                  disabled={isCreating || isUpdating}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[var(--brand)] hover:bg-[var(--brand-dark)]"
                  disabled={isCreating || isUpdating}
                >
                  {isCreating || isUpdating ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : editingCategory ? (
                    "Update"
                  ) : (
                    "Create"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteCategoryDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        categoryName={categoryToDelete?.name || ""}
        isDeleting={isDeleting}
      />
    </div>
  );
}
