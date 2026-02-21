"use client";

import { useState } from "react";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  ImageIcon,
} from "lucide-react";
import Image from "next/image";
import { Facility } from "@/lib/types/facilities.types";

interface FacilityTableProps {
  data: Facility[];
  onEdit: (facility: Facility) => void;
  onDelete: (facility: Facility) => void;
}

export function FacilityTable({ data, onEdit, onDelete }: FacilityTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="hidden md:table-cell">Slug</TableHead>
            <TableHead className="text-center">Order</TableHead>
            <TableHead className="text-center">Visibility</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No facilities found.
              </TableCell>
            </TableRow>
          ) : (
            data.map((facility) => (
              <TableRow key={facility.id}>
                <TableCell>
                  <div className="relative h-10 w-16 overflow-hidden rounded bg-secondary">
                    {facility.imageUrl ? (
                      <Image
                        src={facility.imageUrl}
                        alt={facility.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <ImageIcon className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {facility.name}
                  {facility.icon && (
                      <Badge variant="outline" className="ml-2 text-xs text-muted-foreground">
                          {facility.icon}
                      </Badge>
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                  {facility.slug}
                </TableCell>
                <TableCell className="text-center font-mono">
                  {facility.displayOrder}
                </TableCell>
                <TableCell className="text-center">
                  {facility.isVisible ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Visible
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-gray-100 text-gray-700">
                      Hidden
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {facility.isActive ? (
                    <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">
                        Active
                    </Badge>
                  ) : (
                    <Badge variant="destructive">Inactive</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onEdit(facility)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(facility)}
                        className="text-red-600 focus:bg-red-50"
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
  );
}
