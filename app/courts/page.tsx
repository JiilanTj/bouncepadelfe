"use client";

import { useState } from "react";
import { toast } from "sonner";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { courts, Court } from "@/lib/dummy-data";
import { getStatusBadgeColor } from "@/lib/role-utils";
import { Edit, Trophy, Search } from "lucide-react";
import { formatRupiah } from "@/lib/utils";

export default function CourtsPage() {
  const [courtList] = useState<Court[]>(courts);
  const [editingCourt, setEditingCourt] = useState<Court | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCourts = courtList.filter(
    (court) => court.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (court: Court) => {
    setEditingCourt(court);
    setIsEditDialogOpen(true);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[var(--gray-900)]">Courts Management</h2>
            <p className="text-sm text-[var(--gray-500)]">Manage your padel courts</p>
          </div>
        </div>

        {/* Courts Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--brand-50)]">
                  <Trophy className="h-6 w-6 text-[var(--brand)]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--gray-900)]">{courtList.length}</p>
                  <p className="text-sm text-[var(--gray-500)]">Total Courts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--success-bg)]">
                  <div className="h-3 w-3 rounded-full bg-[var(--status-success)]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--gray-900)]">
                    {courtList.filter((c) => c.status === "AVAILABLE").length}
                  </p>
                  <p className="text-sm text-[var(--gray-500)]">Available</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--warning-bg)]">
                  <div className="h-3 w-3 rounded-full bg-[var(--status-warning)]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--gray-900)]">
                    {courtList.filter((c) => c.status === "MAINTENANCE").length}
                  </p>
                  <p className="text-sm text-[var(--gray-500)]">In Maintenance</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Courts Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">All Courts</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--gray-400)]" />
                <Input
                  placeholder="Search courts..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Court Name</TableHead>
                  <TableHead>Price per Hour</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourts.map((court) => (
                  <TableRow key={court.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--brand-50)]">
                          <Trophy className="h-5 w-5 text-[var(--brand)]" />
                        </div>
                        {court.name}
                      </div>
                    </TableCell>
                    <TableCell>{formatRupiah(court.pricePerHour)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusBadgeColor(court.status)}>
                        {court.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(court)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Court</DialogTitle>
              <DialogDescription>
                Update court details and pricing.
              </DialogDescription>
            </DialogHeader>
            {editingCourt && (
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Court Name</Label>
                  <Input id="name" defaultValue={editingCourt.name} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="price">Price per Hour (IDR)</Label>
                  <Input
                    id="price"
                    type="number"
                    defaultValue={editingCourt.pricePerHour}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select defaultValue={editingCourt.status}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AVAILABLE">Available</SelectItem>
                      <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-[var(--brand)] hover:bg-[var(--brand-dark)]"
                onClick={() => {
                  toast.success("Court updated successfully!");
                  setIsEditDialogOpen(false);
                }}
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
