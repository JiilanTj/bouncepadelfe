"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useActivateProduct,
  useProductCategories,
} from "@/lib/hooks";
import { CreateProductInput, UpdateProductInput, Product, ProductType } from "@/lib/types";
import { formatDate, formatRupiah } from "@/lib/utils";
import {
  Package,
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  X,
  ShoppingCart,
  Clock,
  CheckCircle,
} from "lucide-react";
import Image from "next/image";

interface FormData {
  name: string;
  description: string;
  price: string;
  cost_price: string;
  stock: string;
  sku: string;
  type: ProductType;
  product_category_id: string;
}

const defaultFormData: FormData = {
  name: "",
  description: "",
  price: "",
  cost_price: "",
  stock: "",
  sku: "",
  type: "SELL",
  product_category_id: "",
};

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<ProductType | undefined>(undefined);
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const { data: productsData, isLoading } = useProducts({
    page,
    limit,
    type: typeFilter,
    categoryId: categoryFilter,
    search: search || undefined,
  });

  const { data: categoriesData } = useProductCategories({ active: true, limit: 100 });

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();
  const activateMutation = useActivateProduct();

  const products = productsData?.data || [];
  const totalPages = productsData?.meta?.totalPages || 1;
  const categories = categoriesData?.data || [];

  const totalProducts = productsData?.meta?.total || 0;
  const activeCount = products.filter((p) => p.isActive).length;
  const inactiveCount = products.filter((p) => !p.isActive).length;

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData(defaultFormData);
    setImageFile(null);
    setImagePreview(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price,
      cost_price: product.costPrice || "",
      stock: String(product.stock),
      sku: product.sku || "",
      type: product.type,
      product_category_id: product.productCategoryId,
    });
    setImageFile(null);
    setImagePreview(product.imageUrl || null);
    setIsFormOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }
      if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
        toast.error("Only JPG, PNG, WebP, and GIF images are allowed");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }
    const priceNum = parseFloat(formData.price);
    const stockNum = parseInt(formData.stock) || 0;
    const costPriceNum = formData.cost_price ? parseFloat(formData.cost_price) : undefined;

    if (!formData.price || priceNum <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }
    if (!formData.product_category_id) {
      toast.error("Category is required");
      return;
    }

    try {
      const submitData: CreateProductInput = {
      ...formData,
      price: priceNum,
      cost_price: costPriceNum,
      stock: stockNum,
      image: imageFile || undefined,
    };

      if (editingProduct) {
        await updateMutation.mutateAsync({ id: editingProduct.id, data: submitData as UpdateProductInput });
        toast.success("Product updated successfully");
      } else {
        await createMutation.mutateAsync(submitData);
        toast.success("Product created successfully");
      }
      setIsFormOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Operation failed");
    }
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await deleteMutation.mutateAsync(productToDelete.id);
      toast.success("Product deactivated successfully");
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to deactivate product");
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await activateMutation.mutateAsync(id);
      toast.success("Product activated successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to activate product");
    }
  };

  const handlePageChange = (newPage: number) => setPage(newPage);

  const getTypeBadge = (type: ProductType) => {
    if (type === "SELL") {
      return <Badge className="bg-[var(--info-bg)] text-[var(--status-info)] border-[var(--info-border)]"><ShoppingCart className="w-3 h-3 mr-1" />Sell</Badge>;
    }
    return <Badge className="bg-[var(--warning-bg)] text-[var(--status-warning)] border-[var(--warning-border)]"><Clock className="w-3 h-3 mr-1" />Rent</Badge>;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-[var(--gray-900)]">Products</h2>
          <p className="text-sm text-[var(--gray-500)]">Manage products for store and rental</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-0 shadow-sm"><CardContent className="p-4"><p className="text-2xl font-bold text-[var(--gray-900)]">{totalProducts}</p><p className="text-sm text-[var(--gray-500)]">Total Products</p></CardContent></Card>
          <Card className="border-0 shadow-sm"><CardContent className="p-4"><p className="text-2xl font-bold text-[var(--status-success)]">{activeCount}</p><p className="text-sm text-[var(--gray-500)]">Active</p></CardContent></Card>
          <Card className="border-0 shadow-sm"><CardContent className="p-4"><p className="text-2xl font-bold text-[var(--gray-900)]">{inactiveCount}</p><p className="text-sm text-[var(--gray-500)]">Inactive</p></CardContent></Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--gray-400)]" />
                  <Input placeholder="Search products..." className="pl-10" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
                </div>
                <Select value={typeFilter || "all"} onValueChange={(v) => { setTypeFilter(v === "all" ? undefined : v as ProductType); setPage(1); }}>
                  <SelectTrigger className="w-full sm:w-36"><SelectValue placeholder="All Types" /></SelectTrigger>
                  <SelectContent><SelectItem value="all">All Types</SelectItem><SelectItem value="SELL">Sell</SelectItem><SelectItem value="RENT">Rent</SelectItem></SelectContent>
                </Select>
                <Select value={categoryFilter || "all"} onValueChange={(v) => { setCategoryFilter(v === "all" ? undefined : v); setPage(1); }}>
                  <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="All Categories" /></SelectTrigger>
                  <SelectContent><SelectItem value="all">All Categories</SelectItem>{categories.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <Button onClick={handleOpenCreate} className="bg-[var(--brand)] hover:bg-[var(--brand-dark)]" disabled={createMutation.isPending}>
                <Plus className="mr-2 h-4 w-4" />Add Product
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-[var(--brand)]" />
              <CardTitle className="text-lg font-semibold">Product List</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4"><div className="h-10 w-full animate-pulse rounded bg-gray-200" /><div className="h-64 w-full animate-pulse rounded bg-gray-200" /></div>
            ) : (
              <>
                <div className="rounded-lg border border-[var(--gray-200)]">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead>Image</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.length === 0 ? (
                        <TableRow><TableCell colSpan={9} className="h-32 text-center text-[var(--gray-500)]">No products found</TableCell></TableRow>
                      ) : (
                        products.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell>
                              {p.imageUrl ? (
                                <div className="relative h-12 w-12 overflow-hidden rounded">
                                  <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />
                                </div>
                              ) : (
                                <div className="flex h-12 w-12 items-center justify-center rounded bg-[var(--gray-100)]">
                                  <ImageIcon className="h-5 w-5 text-[var(--gray-400)]" />
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="font-medium max-w-[150px] truncate">{p.name}</TableCell>
                            <TableCell className="text-[var(--gray-500)]">{p.sku || "-"}</TableCell>
                            <TableCell>{getTypeBadge(p.type)}</TableCell>
                            <TableCell><Badge variant="secondary">{p.category?.name || "-"}</Badge></TableCell>
                            <TableCell className="font-medium">{formatRupiah(parseFloat(p.price))}</TableCell>
                            <TableCell>{p.stock}</TableCell>
                            <TableCell><Badge variant="outline" className={p.isActive ? "border-[var(--success-border)] bg-[var(--success-bg)] text-[var(--status-success)]" : "border-[var(--gray-200)] bg-[var(--gray-100)] text-[var(--gray-500)]"}>{p.isActive ? "Active" : "Inactive"}</Badge></TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleOpenEdit(p)} className="cursor-pointer"><Pencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                                  {p.isActive ? (
                                    <DropdownMenuItem onClick={() => handleDeleteClick(p)} className="cursor-pointer text-[var(--status-danger)]" disabled={deleteMutation.isPending}>
                                      <Trash2 className="mr-2 h-4 w-4" />Deactivate
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem onClick={() => handleActivate(p.id)} className="cursor-pointer text-[var(--status-success)]" disabled={activateMutation.isPending}>
                                      <CheckCircle className="mr-2 h-4 w-4" />Activate
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
                {totalPages > 1 && (
                  <div className="flex items-center justify-end space-x-2 pt-4">
                    <Button variant="outline" size="sm" onClick={() => handlePageChange(page - 1)} disabled={page <= 1}><ChevronLeft className="h-4 w-4" />Previous</Button>
                    <div className="text-sm text-[var(--gray-500)]">Page {page} of {totalPages}</div>
                    <Button variant="outline" size="sm" onClick={() => handlePageChange(page + 1)} disabled={page >= totalPages}>Next<ChevronRight className="h-4 w-4" /></Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Form Dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Name <span className="text-[var(--status-danger)]">*</span></Label>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter product name" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Description</Label>
                  <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Enter product description" />
                </div>
                <div className="space-y-2">
                  <Label>Type <span className="text-[var(--status-danger)]">*</span></Label>
                  <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as ProductType })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="SELL">Sell</SelectItem><SelectItem value="RENT">Rent</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Category <span className="text-[var(--status-danger)]">*</span></Label>
                  <Select value={formData.product_category_id} onValueChange={(v) => setFormData({ ...formData, product_category_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>{categories.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Price (IDR) <span className="text-[var(--status-danger)]">*</span></Label>
                  <Input type="number" min={0} value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label>Cost Price (IDR)</Label>
                  <Input type="number" min={0} value={formData.cost_price} onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })} placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label>Stock <span className="text-[var(--status-danger)]">*</span></Label>
                  <Input type="number" min={0} value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label>SKU</Label>
                  <Input value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} placeholder="Enter SKU" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Product Image</Label>
                  <div className="flex items-start gap-4">
                    {imagePreview ? (
                      <div className="relative h-[120px] w-[120px]">
                        <div className="relative h-full w-full overflow-hidden rounded-lg">
                          <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                        </div>
                        <Button type="button" variant="destructive" size="sm" className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0" onClick={handleRemoveImage}><X className="h-3 w-3" /></Button>
                      </div>
                    ) : <div className="flex h-[120px] w-[120px] items-center justify-center rounded-lg border-2 border-dashed border-[var(--gray-200)] bg-[var(--gray-50)]"><ImageIcon className="h-8 w-8 text-[var(--gray-400)]" /></div>}
                    <div className="flex-1">
                      <Input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImageChange} className="cursor-pointer" />
                      <p className="mt-2 text-xs text-[var(--gray-500)]">Max file size: 5MB. Supported: JPG, PNG, WebP, GIF</p>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} disabled={createMutation.isPending || updateMutation.isPending}>Cancel</Button>
                <Button type="submit" className="bg-[var(--brand)] hover:bg-[var(--brand-dark)]" disabled={createMutation.isPending || updateMutation.isPending}>
                  {createMutation.isPending || updateMutation.isPending ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : editingProduct ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Deactivate Product</DialogTitle></DialogHeader>
            <p className="text-[var(--gray-600)]">Are you sure you want to deactivate <strong>{productToDelete?.name}</strong>?</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setDeleteDialogOpen(false); setProductToDelete(null); }}>Cancel</Button>
              <Button onClick={handleConfirmDelete} className="bg-[var(--status-danger)] hover:bg-red-600" disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : "Deactivate"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
