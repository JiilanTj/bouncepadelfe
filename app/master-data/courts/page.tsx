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

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CourtTable } from "@/components/courts/CourtTable";
import { CourtFormDialog } from "@/components/courts/CourtFormDialog";
import { CourtDeleteDialog } from "@/components/courts/CourtDeleteDialog";
import { useCourtsQuery, useAyoFieldsQuery } from "@/lib/hooks/useCourts";
import { Court, CourtType, CourtStatus, AyoField } from "@/lib/types/courts.types";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function CourtsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const { data: courts, isLoading } = useCourtsQuery({
    search: search || undefined,
    type: typeFilter === "ALL" ? undefined : typeFilter,
    status: statusFilter === "ALL" ? undefined : statusFilter,
  });

  const { data: ayoFields, isLoading: isAyoLoading } = useAyoFieldsQuery();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);

  const [selectedAyoField, setSelectedAyoField] = useState<AyoField | null>(null);
  const [isAyoViewOpen, setIsAyoViewOpen] = useState(false);

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

        <Tabs defaultValue="internal" className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="internal" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Internal Courts
            </TabsTrigger>
            <TabsTrigger value="mapping" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Ayo.co.id Mapping
            </TabsTrigger>
          </TabsList>

          <TabsContent value="internal" className="space-y-6 m-0">
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
          </TabsContent>

          <TabsContent value="mapping" className="space-y-6 m-0">
            <Card className="border-0 shadow-sm overflow-hidden">
              <CardContent className="p-0">
                {isAyoLoading ? (
                  <div className="p-8 space-y-4">
                    <div className="h-10 w-full animate-pulse rounded bg-muted" />
                    <div className="h-64 w-full animate-pulse rounded bg-muted" />
                  </div>
                ) : !ayoFields || ayoFields.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                    <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground/50" />
                    <p className="text-lg font-medium">No fields found</p>
                    <p className="text-sm">Unable to retrieve venue fields from Ayo.co.id</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead className="w-[100px]">Ayo ID</TableHead>
                        <TableHead>Field Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ayoFields.map((field) => {
                        const isMapped = allCourts.some(c => c.ayoFieldId === String(field.id));
                        return (
                          <TableRow key={field.id}>
                            <TableCell className="font-medium">#{field.id}</TableCell>
                            <TableCell>{field.name || "Unnamed Field"}</TableCell>
                            <TableCell>
                              {isMapped ? (
                                <span className="inline-flex items-center rounded-full bg-[var(--status-success)]/10 px-2 py-1 text-xs font-medium text-[var(--status-success)] ring-1 ring-inset ring-[var(--status-success)]/20">
                                  Mapped
                                </span>
                              ) : (
                                <span className="inline-flex items-center rounded-full bg-[var(--status-warning)]/10 px-2 py-1 text-xs font-medium text-[var(--status-warning)] ring-1 ring-inset ring-[var(--status-warning)]/20">
                                  Unmapped
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedAyoField(field);
                                  setIsAyoViewOpen(true);
                                }}
                              >
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={isAyoViewOpen} onOpenChange={setIsAyoViewOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Ayo.co.id Field Details</DialogTitle>
            </DialogHeader>
            {selectedAyoField ? (
              <div className="space-y-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{selectedAyoField.name || "Unnamed Field"}</h3>
                    <p className="text-sm text-muted-foreground">ID: #{selectedAyoField.id}</p>
                  </div>
                  <Badge
                    variant={selectedAyoField.status === "ACTIVE" ? "default" : "secondary"}
                    className={selectedAyoField.status === "ACTIVE" ? "bg-[var(--status-success)]" : ""}
                  >
                    {String(selectedAyoField.status)}
                  </Badge>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Sport Name</p>
                    <p className="font-medium">{String(selectedAyoField.sport_name || "-")}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Active Setting</p>
                    <div className="flex items-center gap-2">
                      {selectedAyoField.is_active === 1 ? (
                        <Badge variant="outline" className="text-[var(--status-success)] border-[var(--status-success)]">Active</Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Permanent Active</p>
                    <div className="flex items-center gap-2">
                      {selectedAyoField.is_permanent_active === 1 ? (
                        <Badge variant="outline" className="text-[var(--brand)] border-[var(--brand)]">Yes</Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">No</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Raw Data Toggle (Optional helper for debugging) */}
                <div className="pt-4 mt-4 border-t border-border/50">
                  <details className="text-xs text-muted-foreground cursor-pointer group">
                    <summary className="font-medium hover:text-foreground transition-colors">View Raw JSON Data</summary>
                    <div className="mt-2 p-3 bg-muted/50 rounded-md overflow-auto max-h-[200px] border">
                      <pre className="text-[10px] leading-relaxed">
                        {JSON.stringify(selectedAyoField, null, 2)}
                      </pre>
                    </div>
                  </details>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">No data available</div>
            )}
          </DialogContent>
        </Dialog>

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
