"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  LayoutGrid,
  Activity,
  AlertCircle,
} from "lucide-react";

import { CourtTable } from "@/components/courts/CourtTable";
import { CourtFormDialog } from "@/components/courts/CourtFormDialog";
import { CourtDeleteDialog } from "@/components/courts/CourtDeleteDialog";
import { useCourtsQuery } from "@/lib/hooks/useCourts";
import { Court, CourtType, CourtStatus } from "@/lib/types/courts.types";

export default function CourtsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const { data: courts, isLoading } = useCourtsQuery({
    search: search || undefined,
    type: typeFilter === "ALL" ? undefined : typeFilter,
    status: statusFilter === "ALL" ? undefined : statusFilter,
  });

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);

  const handleEdit = (court: Court) => {
    setSelectedCourt(court);
    setIsEditOpen(true);
  };

  const handleDelete = (court: Court) => {
    setSelectedCourt(court);
    setIsDeleteOpen(true);
  };

  const handleCreateOpen = () => {
    setSelectedCourt(null);
    setIsCreateOpen(true);
  };

  const allCourts = courts || [];
  const activeCourts = allCourts.filter(c => c.status === CourtStatus.ACTIVE).length;
  const maintenanceCourts = allCourts.filter(c => c.status === CourtStatus.MAINTENANCE).length;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-[var(--gray-900)]">Courts Management</h2>
            <p className="text-muted-foreground">
              Define and manage your padel courts, surfaces, and pricing details.
            </p>
          </div>
          <Button
            onClick={handleCreateOpen}
            className="bg-[var(--brand)] hover:bg-[var(--brand-dark)] shadow-sm"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add New Court
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-0 shadow-sm transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Courts</CardTitle>
              <LayoutGrid className="h-4 w-4 text-[var(--brand)]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allCourts.length}</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Available (Active)</CardTitle>
              <Activity className="h-4 w-4 text-[var(--status-success)]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[var(--status-success)]">{activeCourts}</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Under Maintenance</CardTitle>
              <AlertCircle className="h-4 w-4 text-[var(--status-warning)]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[var(--status-warning)]">{maintenanceCourts}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search courts by name..."
                  className="pl-9 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-[var(--brand)]"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[140px] bg-muted/50 border-0 focus:ring-1 focus:ring-[var(--brand)]">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Types</SelectItem>
                    <SelectItem value={CourtType.INDOOR}>Indoor</SelectItem>
                    <SelectItem value={CourtType.OUTDOOR}>Outdoor</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[160px] bg-muted/50 border-0 focus:ring-1 focus:ring-[var(--brand)]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value={CourtStatus.ACTIVE}>Active</SelectItem>
                    <SelectItem value={CourtStatus.MAINTENANCE}>Maintenance</SelectItem>
                    <SelectItem value={CourtStatus.INACTIVE}>Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Table */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 space-y-4">
                <div className="h-10 w-full animate-pulse rounded bg-muted" />
                <div className="h-64 w-full animate-pulse rounded bg-muted" />
              </div>
            ) : (
              <CourtTable
                data={allCourts}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </CardContent>
        </Card>

        {/* Dialogs */}
        <CourtFormDialog
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          court={null}
        />

        <CourtFormDialog
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          court={selectedCourt}
        />

        <CourtDeleteDialog
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          court={selectedCourt}
        />
      </div>
    </MainLayout>
  );
}
