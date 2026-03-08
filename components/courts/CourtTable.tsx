"use client";

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
import { Court, CourtType, CourtStatus } from "@/lib/types/courts.types";
import { useAuth } from "@/lib/hooks/useAuth";

interface CourtTableProps {
  data: Court[];
  onEdit: (court: Court) => void;
  onDelete: (court: Court) => void;
}

export function CourtTable({ data, onEdit, onDelete }: CourtTableProps) {
  const { user } = useAuth();
  const canManageStatus = user?.role === "OWNER" || user?.role === "ADMIN";

  const getStatusBadge = (status: CourtStatus) => {
    switch (status) {
      case CourtStatus.ACTIVE:
        return (
          <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 whitespace-nowrap">
            Active
          </Badge>
        );
      case CourtStatus.MAINTENANCE:
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 whitespace-nowrap">
            Maintenance
          </Badge>
        );
      case CourtStatus.INACTIVE:
        return <Badge variant="destructive" className="whitespace-nowrap">Inactive</Badge>;
      default:
        return <Badge variant="secondary" className="whitespace-nowrap">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: CourtType) => {
    return (
      <Badge variant="outline" className="capitalize whitespace-nowrap">
        {type.toLowerCase()}
      </Badge>
    );
  };

  return (
    <div className="rounded-md border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[80px]">Image</TableHead>
            <TableHead className="min-w-[150px]">Court Name</TableHead>
            <TableHead className="hidden md:table-cell min-w-[150px]">Type / Surface</TableHead>
            <TableHead className="text-right w-[120px]">Price/Hour</TableHead>
            <TableHead className="text-center w-[100px]">Visibility</TableHead>
            <TableHead className="text-center w-[120px]">Status</TableHead>
            <TableHead className="text-right w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                No courts found.
              </TableCell>
            </TableRow>
          ) : (
            data.map((court) => (
              <TableRow key={court.id} className="hover:bg-muted/30 transition-colors">
                <TableCell>
                  <div className="relative h-10 w-16 overflow-hidden rounded bg-secondary border shadow-sm">
                    {court.imageUrl ? (
                      <Image
                        src={court.imageUrl}
                        alt={court.name}
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
                  <div className="flex flex-col gap-0.5">
                    <span className="truncate max-w-[200px]" title={court.name}>{court.name}</span>
                    <span className="text-[10px] text-muted-foreground md:hidden capitalize">
                      {court.type.toLowerCase()} • {court.surface}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div className="flex items-center gap-2">
                    {getTypeBadge(court.type)}
                    <span className="text-xs text-muted-foreground truncate max-w-[100px]" title={court.surface}>
                      {court.surface}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono text-sm whitespace-nowrap">
                  Rp {parseInt(court.pricePerHour).toLocaleString()}
                </TableCell>
                <TableCell className="text-center">
                  {court.isVisible ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 whitespace-nowrap">
                      Visible
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-gray-100 text-gray-700 whitespace-nowrap">
                      Hidden
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {getStatusBadge(court.status)}
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
                      <DropdownMenuItem onClick={() => onEdit(court)} className="cursor-pointer">
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Court
                      </DropdownMenuItem>
                      {canManageStatus && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDelete(court)}
                            className="text-red-600 focus:bg-red-50 focus:text-red-600 cursor-pointer"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Court
                          </DropdownMenuItem>
                        </>
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
  );
}
