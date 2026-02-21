"use client";

import { useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useTables,
  useCreateTable,
  useUpdateTable,
  useDeleteTable,
  useActivateTable,
  useUpdateTableStatus,
} from "@/lib/hooks";
import { CreateTableInput, UpdateTableInput, Table, TableStatus } from "@/lib/types";
import {
  Armchair,
  Plus,
  Search,
  Trash2,
  CheckCircle,
  User,
  UserX,
  MapPin,
  Users,
  Phone,
  Clock,
  LayoutGrid,
  List,
  Filter,
  QrCode,
  Printer,
} from "lucide-react";
import { formatDistanceToNow } from "@/lib/utils";


interface FormData {
  code: string;
  name: string;
  capacity: string;
  location: string;
}

const defaultFormData: FormData = {
  code: "",
  name: "",
  capacity: "",
  location: "",
};

interface OccupyFormData {
  customerName: string;
  customerPhone: string;
}

const locationColors: Record<string, string> = {
  indoor: "bg-blue-500/10 text-blue-600 border-blue-200",
  outdoor: "bg-green-500/10 text-green-600 border-green-200",
  vip: "bg-purple-500/10 text-purple-600 border-purple-200",
};

export default function TablesPage() {
  const [statusFilter, setStatusFilter] = useState<TableStatus | undefined>(undefined);
  const [locationFilter, setLocationFilter] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [formData, setFormData] = useState<FormData>(defaultFormData);

  const [isOccupyOpen, setIsOccupyOpen] = useState(false);
  const [tableToOccupy, setTableToOccupy] = useState<Table | null>(null);
  const [occupyForm, setOccupyForm] = useState<OccupyFormData>({ customerName: "", customerPhone: "" });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tableToDelete, setTableToDelete] = useState<Table | null>(null);

  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [tableForQr, setTableForQr] = useState<Table | null>(null);



  const { data: tablesData, isLoading } = useTables({
    status: statusFilter,
    search: search || undefined,
  });

  const createMutation = useCreateTable();
  const updateMutation = useUpdateTable();
  const deleteMutation = useDeleteTable();
  const activateMutation = useActivateTable();
  const updateStatusMutation = useUpdateTableStatus();

  const tables = tablesData?.data || [];

  // Filter by location client-side
  const filteredTables = tables.filter((t) => {
    if (locationFilter && t.location !== locationFilter) return false;
    return true;
  });

  const totalTables = tables.length;
  const emptyCount = tables.filter((t) => t.status === "EMPTY" && t.isActive).length;
  const occupiedCount = tables.filter((t) => t.status === "OCCUPIED" && t.isActive).length;

  // Group by location for grid view
  const tablesByLocation = filteredTables.reduce((acc, table) => {
    const loc = table.location || "other";
    if (!acc[loc]) acc[loc] = [];
    acc[loc].push(table);
    return acc;
  }, {} as Record<string, Table[]>);

  const handleOpenCreate = () => {
    setEditingTable(null);
    setFormData(defaultFormData);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (table: Table) => {
    setEditingTable(table);
    setFormData({
      code: table.code,
      name: table.name || "",
      capacity: table.capacity ? String(table.capacity) : "",
      location: table.location || "",
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      toast.error("Code is required");
      return;
    }

    try {
      const submitData: CreateTableInput = {
        code: formData.code.toUpperCase(),
        name: formData.name || undefined,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        location: formData.location || undefined,
      };

      if (editingTable) {
        const updateData: UpdateTableInput = {
          name: submitData.name,
          capacity: submitData.capacity,
          location: submitData.location,
        };
        await updateMutation.mutateAsync({ id: editingTable.id, data: updateData });
        toast.success("Table updated successfully");
      } else {
        await createMutation.mutateAsync(submitData);
        toast.success("Table created successfully");
      }
      setIsFormOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Operation failed");
    }
  };

  const handleOccupyClick = (table: Table, e: React.MouseEvent) => {
    e.stopPropagation();
    setTableToOccupy(table);
    setOccupyForm({ customerName: "", customerPhone: "" });
    setIsOccupyOpen(true);
  };

  const handleOccupySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableToOccupy) return;
    if (!occupyForm.customerName.trim()) {
      toast.error("Customer name is required");
      return;
    }

    try {
      await updateStatusMutation.mutateAsync({
        id: tableToOccupy.id,
        data: {
          status: "OCCUPIED",
          customerName: occupyForm.customerName,
          customerPhone: occupyForm.customerPhone || undefined,
        },
      });
      toast.success("Table occupied successfully");
      setIsOccupyOpen(false);
      setTableToOccupy(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to occupy table");
    }
  };

  const handleClearTable = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updateStatusMutation.mutateAsync({
        id,
        data: { status: "EMPTY" },
      });
      toast.success("Table cleared successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to clear table");
    }
  };

  const handleDeleteClick = (table: Table, e: React.MouseEvent) => {
    e.stopPropagation();
    setTableToDelete(table);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!tableToDelete) return;
    try {
      await deleteMutation.mutateAsync(tableToDelete.id);
      toast.success("Table deactivated successfully");
      setDeleteDialogOpen(false);
      setTableToDelete(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to deactivate table");
    }
  };



  const handleActivate = async (id: string) => {
    try {
      await activateMutation.mutateAsync(id);
      toast.success("Table activated successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to activate table");
    }
  };

  const handleQrClick = (table: Table, e: React.MouseEvent) => {
    e.stopPropagation();
    setTableForQr(table);
    setIsQrModalOpen(true);
  };

  const handlePrintQr = () => {
    const printContent = document.getElementById("qr-print-content");
    if (!printContent) return;

    const win = window.open("", "_blank");
    if (!win) return;

    win.document.write(`
      <html>
        <head>
          <title>Print QR Table ${tableForQr?.code}</title>
          <style>
            body { 
              display: flex; 
              flex-direction: column; 
              align-items: center; 
              justify-content: center; 
              height: 100vh; 
              margin: 0;
              font-family: sans-serif;
            }
            .qr-container { text-align: center; border: 2px solid #eee; padding: 40px; border-radius: 20px; }
            h1 { font-size: 48px; margin-bottom: 10px; }
            p { font-size: 24px; color: #666; margin-top: 10px; }
            img { width: 300px; height: 300px; }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <h1>TABLE ${tableForQr?.code}</h1>
            <img src="${`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(window.location.origin + "/fnb?table=" + tableForQr?.code)}`}" />
            <p>Scan to order menu</p>
          </div>
          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => window.close(), 500);
            };
          </script>
        </body>
      </html>
    `);
    win.document.close();
  };

  const getLocationStyle = (location?: string) => {
    return locationColors[location || "other"] || "bg-gray-500/10 text-gray-600 border-gray-200";
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[var(--gray-900)]">Tables</h2>
            <p className="text-sm text-[var(--gray-500)]">Manage dining tables for F&B POS</p>
          </div>
          <Button onClick={handleOpenCreate} className="bg-[var(--brand)] hover:bg-[var(--brand-dark)]" disabled={createMutation.isPending}>
            <Plus className="mr-2 h-4 w-4" />Add Table
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[var(--gray-100)]">
                  <Armchair className="h-5 w-5 text-[var(--gray-600)]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--gray-900)]">{totalTables}</p>
                  <p className="text-xs text-[var(--gray-500)]">Total Tables</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <UserX className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{emptyCount}</p>
                  <p className="text-xs text-[var(--gray-500)]">Empty</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{occupiedCount}</p>
                  <p className="text-xs text-[var(--gray-500)]">Occupied</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--gray-400)]" />
                  <Input placeholder="Search tables..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <Select value={statusFilter || "all"} onValueChange={(v) => setStatusFilter(v === "all" ? undefined : v as TableStatus)}>
                  <SelectTrigger className="w-full sm:w-36"><Filter className="w-4 h-4 mr-2" /><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="EMPTY">Empty</SelectItem><SelectItem value="OCCUPIED">Occupied</SelectItem></SelectContent>
                </Select>
                <Select value={locationFilter || "all"} onValueChange={(v) => setLocationFilter(v === "all" ? undefined : v)}>
                  <SelectTrigger className="w-full sm:w-36"><MapPin className="w-4 h-4 mr-2" /><SelectValue placeholder="Location" /></SelectTrigger>
                  <SelectContent><SelectItem value="all">All Locations</SelectItem><SelectItem value="indoor">Indoor</SelectItem><SelectItem value="outdoor">Outdoor</SelectItem><SelectItem value="vip">VIP</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 bg-[var(--gray-100)] p-1 rounded-lg">
                <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="sm" onClick={() => setViewMode("grid")} className="gap-2">
                  <LayoutGrid className="h-4 w-4" />Grid
                </Button>
                <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="sm" onClick={() => setViewMode("list")} className="gap-2">
                  <List className="h-4 w-4" />List
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grid View */}
        {viewMode === "grid" && (
          <div className="space-y-6">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i} className="border-0 shadow-sm h-40"><CardContent className="p-4"><div className="h-full animate-pulse bg-gray-200 rounded" /></CardContent></Card>
                ))}
              </div>
            ) : filteredTables.length === 0 ? (
              <Card className="border-0 shadow-sm"><CardContent className="p-12 text-center"><Armchair className="h-12 w-12 mx-auto text-[var(--gray-300)] mb-4" /><p className="text-[var(--gray-500)]">No tables found</p></CardContent></Card>
            ) : (
              Object.entries(tablesByLocation).map(([location, locationTables]) => (
                <div key={location}>
                  <h3 className="text-sm font-semibold text-[var(--gray-600)] uppercase tracking-wider mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {location === "other" ? "Other" : location}
                    <Badge variant="secondary" className="ml-2">{locationTables.length}</Badge>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {locationTables.map((t) => (
                      <Card 
                        key={t.id} 
                        className={`border-0 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer ${!t.isActive ? 'opacity-60' : ''} ${t.status === "OCCUPIED" ? 'ring-2 ring-blue-500/20' : ''}`}
                        onClick={() => t.isActive && handleOpenEdit(t)}
                      >
                        {/* Status Bar */}
                        <div className={`h-1.5 w-full ${t.status === "EMPTY" ? "bg-green-500" : "bg-blue-500"}`} />
                        
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="text-lg font-bold text-[var(--gray-900)]">{t.code}</h4>
                              {t.name && <p className="text-sm text-[var(--gray-500)]">{t.name}</p>}
                            </div>
                            <Badge variant="outline" className={getLocationStyle(t.location)}>
                              {t.location || "Other"}
                            </Badge>
                          </div>

                          {/* Status Badge */}
                          <div className="flex items-center gap-2 mb-3">
                            {t.status === "EMPTY" ? (
                              <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
                                <UserX className="w-3 h-3 mr-1" />Empty
                              </Badge>
                            ) : (
                              <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100">
                                <User className="w-3 h-3 mr-1" />Occupied
                              </Badge>
                            )}
                            {t.capacity && (
                              <Badge variant="secondary" className="text-xs">
                                <Users className="w-3 h-3 mr-1" />{t.capacity} seats
                              </Badge>
                            )}
                          </div>

                          {/* Customer Info (if occupied) */}
                          {t.status === "OCCUPIED" && t.currentCustomerName && (
                            <div className="bg-blue-50 rounded-lg p-3 mb-3">
                              <p className="font-medium text-blue-900 text-sm">{t.currentCustomerName}</p>
                              {t.currentCustomerPhone && (
                                <p className="text-blue-600 text-xs flex items-center gap-1 mt-1">
                                  <Phone className="w-3 h-3" />{t.currentCustomerPhone}
                                </p>
                              )}
                              {t.occupiedAt && (
                                <p className="text-blue-500 text-xs flex items-center gap-1 mt-1">
                                  <Clock className="w-3 h-3" />{formatDistanceToNow(t.occupiedAt)}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex items-center gap-2 pt-2 border-t border-[var(--gray-100)]">
                            {t.isActive ? (
                              <>
                                {t.status === "EMPTY" ? (
                                  <Button 
                                    size="sm" 
                                    className="flex-1 bg-blue-600 hover:bg-blue-700" 
                                    onClick={(e) => handleOccupyClick(t, e)}
                                  >
                                    <User className="w-4 h-4 mr-1" />Occupy
                                  </Button>
                                ) : (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="flex-1 border-green-500 text-green-600 hover:bg-green-50" 
                                    onClick={(e) => handleClearTable(t.id, e)}
                                  >
                                    <CheckCircle className="w-4 h-4 mr-1" />Clear
                                  </Button>
                                )}
                                <Button size="sm" variant="ghost" className="text-blue-600 hover:bg-blue-50" onClick={(e) => handleQrClick(t, e)} title="Print QR Code">
                                  <QrCode className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={(e) => handleDeleteClick(t, e)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>

                              </>
                            ) : (
                              <Button size="sm" variant="outline" className="w-full" onClick={() => handleActivate(t.id)}>
                                <CheckCircle className="w-4 h-4 mr-1" />Activate
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* List View */}
        {viewMode === "list" && (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-16 animate-pulse bg-gray-200 rounded" />
                  ))}
                </div>
              ) : filteredTables.length === 0 ? (
                <div className="p-12 text-center"><Armchair className="h-12 w-12 mx-auto text-[var(--gray-300)] mb-4" /><p className="text-[var(--gray-500)]">No tables found</p></div>
              ) : (
                <div className="divide-y divide-[var(--gray-100)]">
                  {filteredTables.map((t) => (
                    <div 
                      key={t.id} 
                      className={`p-4 flex items-center justify-between hover:bg-[var(--gray-50)] transition-colors cursor-pointer ${!t.isActive ? 'opacity-50' : ''}`}
                      onClick={() => t.isActive && handleOpenEdit(t)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-12 rounded-full ${t.status === "EMPTY" ? "bg-green-500" : "bg-blue-500"}`} />
                        <div>
                          <h4 className="font-bold text-[var(--gray-900)]">{t.code}</h4>
                          {t.name && <p className="text-sm text-[var(--gray-500)]">{t.name}</p>}
                        </div>
                        <Badge variant="outline" className={getLocationStyle(t.location)}>
                          {t.location || "Other"}
                        </Badge>
                        {t.capacity && (
                          <Badge variant="secondary" className="text-xs">
                            <Users className="w-3 h-3 mr-1" />{t.capacity}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {t.status === "OCCUPIED" && t.currentCustomerName && (
                          <div className="text-right">
                            <p className="font-medium text-sm">{t.currentCustomerName}</p>
                            {t.occupiedAt && (
                              <p className="text-xs text-[var(--gray-500)]">{formatDistanceToNow(t.occupiedAt)}</p>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          {t.status === "EMPTY" ? (
                            <Badge className="bg-green-100 text-green-700"><UserX className="w-3 h-3 mr-1" />Empty</Badge>
                          ) : (
                            <Badge className="bg-blue-100 text-blue-700"><User className="w-3 h-3 mr-1" />Occupied</Badge>
                          )}
                          
                          {t.isActive ? (
                            <>
                              {t.status === "EMPTY" ? (
                                <Button size="sm" className="bg-blue-600" onClick={(e) => handleOccupyClick(t, e)}><User className="w-4 h-4 mr-1" />Occupy</Button>
                              ) : (
                                <Button size="sm" variant="outline" className="border-green-500 text-green-600" onClick={(e) => handleClearTable(t.id, e)}><CheckCircle className="w-4 h-4 mr-1" />Clear</Button>
                              )}
                              <Button size="sm" variant="ghost" className="text-blue-600" onClick={(e) => handleQrClick(t, e)} title="Print QR Code"><QrCode className="w-4 h-4" /></Button>
                              <Button size="sm" variant="ghost" className="text-red-500" onClick={(e) => handleDeleteClick(t, e)}><Trash2 className="w-4 h-4" /></Button>

                            </>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => handleActivate(t.id)}><CheckCircle className="w-4 h-4 mr-1" />Activate</Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>{editingTable ? "Edit Table" : "Add New Table"}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Code <span className="text-[var(--status-danger)]">*</span></Label>
                <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} placeholder="T01, VIP-01" disabled={!!editingTable} />
              </div>
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Table 1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Capacity</Label>
                  <Input type="number" min={0} value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: e.target.value })} placeholder="4" />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Select value={formData.location} onValueChange={(v) => setFormData({ ...formData, location: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent><SelectItem value="indoor">Indoor</SelectItem><SelectItem value="outdoor">Outdoor</SelectItem><SelectItem value="vip">VIP</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} disabled={createMutation.isPending || updateMutation.isPending}>Cancel</Button>
                <Button type="submit" className="bg-[var(--brand)] hover:bg-[var(--brand-dark)]" disabled={createMutation.isPending || updateMutation.isPending}>
                  {createMutation.isPending || updateMutation.isPending ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : editingTable ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Occupy Dialog */}
        <Dialog open={isOccupyOpen} onOpenChange={setIsOccupyOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Occupy Table {tableToOccupy?.code}</DialogTitle></DialogHeader>
            <form onSubmit={handleOccupySubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Customer Name <span className="text-[var(--status-danger)]">*</span></Label>
                <Input value={occupyForm.customerName} onChange={(e) => setOccupyForm({ ...occupyForm, customerName: e.target.value })} placeholder="Enter customer name" autoFocus />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input value={occupyForm.customerPhone} onChange={(e) => setOccupyForm({ ...occupyForm, customerPhone: e.target.value })} placeholder="+628123456789" />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsOccupyOpen(false)} disabled={updateStatusMutation.isPending}>Cancel</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={updateStatusMutation.isPending}>
                  {updateStatusMutation.isPending ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : "Occupy Table"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Deactivate Table</DialogTitle></DialogHeader>
            <p className="text-[var(--gray-600)]">Are you sure you want to deactivate table <strong>{tableToDelete?.code}</strong>?</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setDeleteDialogOpen(false); setTableToDelete(null); }}>Cancel</Button>
              <Button onClick={handleConfirmDelete} className="bg-[var(--status-danger)] hover:bg-red-600" disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : "Deactivate"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* QR Code Dialog */}
        <Dialog open={isQrModalOpen} onOpenChange={setIsQrModalOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-center">QR Code Table {tableForQr?.code}</DialogTitle>
            </DialogHeader>
            <div id="qr-print-content" className="flex flex-col items-center justify-center p-6 space-y-4">
              <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-200">
                <Image 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(typeof window !== 'undefined' ? (window.location.origin + "/fnb?table=" + tableForQr?.code) : '')}`} 
                  alt="QR Code" 
                  width={200}
                  height={200}
                  className="w-[200px] h-[200px]"
                />
              </div>
              <p className="text-sm text-gray-500 text-center">Scan QR code ini untuk memesan Menu FnB dari meja ini.</p>
            </div>
            <DialogFooter className="flex-row gap-2 sm:justify-center">
              <DialogClose asChild>
                <Button variant="outline" className="flex-1">Tutup</Button>
              </DialogClose>
              <Button onClick={handlePrintQr} className="bg-blue-600 hover:bg-blue-700 flex-1">
                <Printer className="w-4 h-4 mr-2" /> Print QR
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>


      </div>
    </MainLayout>
  );
}
