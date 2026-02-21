"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FacilityFormDialog } from "@/components/facilities/FacilityFormDialog";
import { FacilityDeleteDialog } from "@/components/facilities/FacilityDeleteDialog";
import { useFacilitiesQuery } from "@/lib/hooks/useFacilities";
import { Facility } from "@/lib/types/facilities.types";
import {
  Building2,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  ImageIcon,
  Eye,
  EyeOff,
} from "lucide-react";
import Image from "next/image";

export default function FacilitiesPage() {
  const { data: facilities, isLoading } = useFacilitiesQuery();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);

  const handleEdit = (facility: Facility) => {
    setSelectedFacility(facility);
    setIsEditOpen(true);
  };

  const handleDelete = (facility: Facility) => {
    setSelectedFacility(facility);
    setIsDeleteOpen(true);
  };

  const handleCreateOpen = () => {
    setSelectedFacility(null);
    setIsCreateOpen(true);
  };

  const allFacilities = facilities || [];

  const totalCount = allFacilities.length;
  const visibleCount = allFacilities.filter((f) => f.isVisible).length;
  const hiddenCount = allFacilities.filter((f) => !f.isVisible).length;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-[var(--gray-900)]">Facilities</h2>
          <p className="text-sm text-[var(--gray-500)]">
            Manage your facility listings and amenities
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-[var(--gray-900)]">{totalCount}</p>
              <p className="text-sm text-[var(--gray-500)]">Total Facilities</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-[var(--status-success)]">{visibleCount}</p>
              <p className="text-sm text-[var(--gray-500)]">Visible</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-[var(--gray-900)]">{hiddenCount}</p>
              <p className="text-sm text-[var(--gray-500)]">Hidden</p>
            </CardContent>
          </Card>
        </div>

        {/* Add Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleCreateOpen}
            className="bg-[var(--brand)] hover:bg-[var(--brand-dark)]"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Facility
          </Button>
        </div>

        {/* Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[var(--brand)]" />
              <CardTitle className="text-lg font-semibold">Facility List</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <div className="h-10 w-full animate-pulse rounded bg-gray-200" />
                <div className="h-64 w-full animate-pulse rounded bg-gray-200" />
              </div>
            ) : (
              <div className="rounded-lg border border-[var(--gray-200)]">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="hidden md:table-cell">Slug</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead>Visibility</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allFacilities.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="h-32 text-center text-[var(--gray-500)]"
                        >
                          No facilities found
                        </TableCell>
                      </TableRow>
                    ) : (
                      allFacilities.map((facility) => (
                        <TableRow key={facility.id}>
                          <TableCell>
                            {facility.imageUrl ? (
                              <div className="relative h-12 w-12 overflow-hidden rounded">
                                <Image
                                  src={facility.imageUrl}
                                  alt={facility.name}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              </div>
                            ) : (
                              <div className="flex h-12 w-12 items-center justify-center rounded bg-[var(--gray-100)]">
                                <ImageIcon className="h-5 w-5 text-[var(--gray-400)]" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="font-medium max-w-[150px] truncate">
                            {facility.name}
                            {facility.icon && (
                              <Badge
                                variant="secondary"
                                className="ml-2 text-xs"
                              >
                                {facility.icon}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-[var(--gray-500)]">
                            {facility.slug}
                          </TableCell>
                          <TableCell className="font-mono text-[var(--gray-500)]">
                            {facility.displayOrder}
                          </TableCell>
                          <TableCell>
                            {facility.isVisible ? (
                              <Badge
                                variant="outline"
                                className="border-[var(--success-border)] bg-[var(--success-bg)] text-[var(--status-success)]"
                              >
                                <Eye className="mr-1 h-3 w-3" />
                                Visible
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="border-[var(--gray-200)] bg-[var(--gray-100)] text-[var(--gray-500)]"
                              >
                                <EyeOff className="mr-1 h-3 w-3" />
                                Hidden
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                facility.isActive
                                  ? "border-[var(--success-border)] bg-[var(--success-bg)] text-[var(--status-success)]"
                                  : "border-[var(--gray-200)] bg-[var(--gray-100)] text-[var(--gray-500)]"
                              }
                            >
                              {facility.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleEdit(facility)}
                                  className="cursor-pointer"
                                >
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDelete(facility)}
                                  className="cursor-pointer text-[var(--status-danger)]"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialogs */}
        <FacilityFormDialog
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          facility={null}
        />

        <FacilityFormDialog
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          facility={selectedFacility}
        />

        <FacilityDeleteDialog
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          facility={selectedFacility}
        />
      </div>
    </MainLayout>
  );
}
