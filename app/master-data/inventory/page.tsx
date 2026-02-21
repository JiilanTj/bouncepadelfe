"use client";

import { useState } from "react";
import { toast } from "sonner";
import { MainLayout } from "@/components/layout/main-layout";
import {
  useInventories,
  useInventory,
  useCreateInventory,
  useUpdateInventory,
  useAdjustInventoryStock,
  useDisposeInventory,
} from "@/lib/hooks";
import {
  CreateInventoryInput,
  UpdateInventoryInput,
  Inventory,
  InventoryType,
  InventoryCondition,
  InventoryStatus,
  AdjustInventoryInput,
} from "@/lib/types";
import {
  InventoryStats,
  InventoryFilters,
  InventoryTable,
  InventoryFormDialog,
  InventoryAdjustDialog,
  InventoryHistoryDialog,
  InventoryDeleteDialog,
} from "@/components/inventory";

export default function InventoryPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<InventoryType | undefined>(undefined);
  const [conditionFilter, setConditionFilter] = useState<InventoryCondition | undefined>(
    undefined
  );
  const [statusFilter, setStatusFilter] = useState<InventoryStatus | undefined>(
    undefined
  );

  // Form dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInventory, setEditingInventory] = useState<Inventory | null>(null);

  // Delete dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [inventoryToDelete, setInventoryToDelete] = useState<Inventory | null>(null);

  // Adjust dialog states
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [inventoryToAdjust, setInventoryToAdjust] = useState<Inventory | null>(null);

  // View history dialog
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [inventoryForHistory, setInventoryForHistory] = useState<Inventory | null>(null);

  const { data: inventoriesData, isLoading } = useInventories({
    page,
    limit,
    type: typeFilter,
    condition: conditionFilter,
    status: statusFilter,
    search: search || undefined,
  });

  const { data: inventoryDetail, isLoading: isHistoryLoading } = useInventory(
    inventoryForHistory?.id || "",
    historyDialogOpen && !!inventoryForHistory?.id
  );

  const createMutation = useCreateInventory();
  const updateMutation = useUpdateInventory();
  const adjustMutation = useAdjustInventoryStock();
  const disposeMutation = useDisposeInventory();

  const inventories = inventoriesData?.data || [];
  const totalPages = inventoriesData?.meta?.totalPages || 1;
  const totalItems = inventoriesData?.meta?.total || 0;

  const assetCount = inventories.filter((i) => i.type === "ASSET").length;
  const consumableCount = inventories.filter((i) => i.type === "CONSUMABLE").length;
  const disposedCount = inventories.filter((i) => i.status === "DISPOSED").length;

  const handleOpenCreate = () => {
    setEditingInventory(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (inventory: Inventory) => {
    setEditingInventory(inventory);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: CreateInventoryInput | UpdateInventoryInput) => {
    try {
      if (editingInventory) {
        await updateMutation.mutateAsync({
          id: editingInventory.id,
          data: data as UpdateInventoryInput,
        });
        toast.success("Inventory updated successfully");
      } else {
        await createMutation.mutateAsync(data as CreateInventoryInput);
        toast.success("Inventory created successfully");
      }
      setIsFormOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Operation failed");
    }
  };

  const handleDeleteClick = (inventory: Inventory) => {
    setInventoryToDelete(inventory);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!inventoryToDelete) return;
    try {
      await disposeMutation.mutateAsync(inventoryToDelete.id);
      toast.success("Inventory marked as disposed");
      setDeleteDialogOpen(false);
      setInventoryToDelete(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to dispose inventory");
    }
  };

  const handleAdjustClick = (inventory: Inventory) => {
    setInventoryToAdjust(inventory);
    setAdjustDialogOpen(true);
  };

  const handleConfirmAdjust = async (data: AdjustInventoryInput) => {
    if (!inventoryToAdjust) return;
    try {
      await adjustMutation.mutateAsync({ id: inventoryToAdjust.id, data });
      toast.success("Stock adjusted successfully");
      setAdjustDialogOpen(false);
      setInventoryToAdjust(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to adjust stock");
    }
  };

  const handleViewHistory = (inventory: Inventory) => {
    setInventoryForHistory(inventory);
    setHistoryDialogOpen(true);
  };

  const handlePageChange = (newPage: number) => setPage(newPage);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-[var(--gray-900)]">Inventory</h2>
          <p className="text-sm text-[var(--gray-500)]">
            Manage business assets and consumables
          </p>
        </div>

        {/* Stats */}
        <InventoryStats
          totalItems={totalItems}
          assetCount={assetCount}
          consumableCount={consumableCount}
          disposedCount={disposedCount}
        />

        {/* Filters */}
        <InventoryFilters
          search={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          typeFilter={typeFilter}
          onTypeFilterChange={(v) => {
            setTypeFilter(v);
            setPage(1);
          }}
          conditionFilter={conditionFilter}
          onConditionFilterChange={(v) => {
            setConditionFilter(v);
            setPage(1);
          }}
          statusFilter={statusFilter}
          onStatusFilterChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
          onAddClick={handleOpenCreate}
          addButtonDisabled={createMutation.isPending}
        />

        {/* Table */}
        <InventoryTable
          data={inventories}
          isLoading={isLoading}
          page={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onEdit={handleOpenEdit}
          onAdjustStock={handleAdjustClick}
          onViewHistory={handleViewHistory}
          onDispose={handleDeleteClick}
          isDisposePending={disposeMutation.isPending}
        />

        {/* Form Dialog */}
        <InventoryFormDialog
          key={isFormOpen ? "form-open" : "form-closed"}
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          editingInventory={editingInventory}
          onSubmit={handleFormSubmit}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />

        {/* Adjust Stock Dialog */}
        <InventoryAdjustDialog
          key={adjustDialogOpen ? "adjust-open" : "adjust-closed"}
          open={adjustDialogOpen}
          onOpenChange={setAdjustDialogOpen}
          inventory={inventoryToAdjust}
          onSubmit={handleConfirmAdjust}
          isSubmitting={adjustMutation.isPending}
        />

        {/* History Dialog */}
        <InventoryHistoryDialog
          open={historyDialogOpen}
          onOpenChange={setHistoryDialogOpen}
          inventory={inventoryForHistory}
          adjustments={inventoryDetail?.adjustments}
          isLoading={isHistoryLoading}
        />

        {/* Delete/Dispose Dialog */}
        <InventoryDeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          inventory={inventoryToDelete}
          onConfirm={handleConfirmDelete}
          isDeleting={disposeMutation.isPending}
        />
      </div>
    </MainLayout>
  );
}
