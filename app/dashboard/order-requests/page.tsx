"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle, XCircle, Eye, ChefHat, UtensilsCrossed, DollarSign } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";
import { toast } from "sonner";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

interface OrderRequest {
  id: string;
  orderNumber: string;
  customerName: string;
  totalAmount: string;
  status: "PENDING" | "APPROVED" | "PREPARING" | "SERVED" | "REJECTED" | "CANCELLED";
  createdAt: string;
  transactionId?: string;
  transaction?: {
    id: string;
    status: "PENDING" | "PAID" | "CANCELLED" | "COMPLETED";
    invoiceNumber: string;
  };
  table: {
    code: string;
    name: string | null;
  };
  items: Array<{
    id: string;
    quantity: number;
    unitPrice: string;
    subtotal: string;
    menu: {
      name: string;
    };
  }>;
}

export default function OrderRequestsPage() {
  const [orders, setOrders] = useState<OrderRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentOrder, setPaymentOrder] = useState<OrderRequest | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("accessToken="))
        ?.split("=")[1];

      const url = statusFilter
        ? `${API_BASE}/order-requests?status=${statusFilter}&limit=50`
        : `${API_BASE}/order-requests?limit=50`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const json = await res.json();
        setOrders(json.data?.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      toast.error("Gagal mengambil data pesanan");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, fetchOrders]);

  const updateStatus = async (id: string, status: "APPROVED" | "PREPARING" | "SERVED" | "REJECTED" | "CANCELLED") => {
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("accessToken="))
        ?.split("=")[1];

      const res = await fetch(`${API_BASE}/order-requests/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        const data = await res.json();
        let message = "Status pesanan berhasil diupdate";
        if (status === "APPROVED") message = "Pesanan berhasil disetujui";
        if (status === "REJECTED") message = "Pesanan berhasil ditolak";
        if (status === "PREPARING") message = "Pesanan sedang diproses";
        if (status === "SERVED") {
          message = `Pesanan sudah diantar ke meja. Transaksi ${data.data?.transaction?.invoiceNumber || ""} telah dibuat.`;
        }
        toast.success(message);
        fetchOrders();
        setSelectedOrder(null);
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.message || "Gagal mengupdate status");
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      toast.error("Gagal mengupdate status");
    }
  };

  const handlePay = async (transactionId: string, paymentMethod: string, paidAmount: number) => {
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("accessToken="))
        ?.split("=")[1];

      const res = await fetch(`${API_BASE}/transactions/${transactionId}/pay`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ paymentMethod, paidAmount }),
      });

      if (res.ok) {
        toast.success("Pembayaran berhasil diproses");
        setShowPaymentModal(false);
        setPaymentOrder(null);
        fetchOrders();
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.message || "Gagal memproses pembayaran");
      }
    } catch (err) {
      console.error("Failed to process payment:", err);
      toast.error("Gagal memproses pembayaran");
    }
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(parseFloat(price));
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Order Requests</h2>
            <p className="text-sm text-gray-600">Kelola pesanan dari pelanggan</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter("")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === ""
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            ALL
          </button>
          {["PENDING", "APPROVED", "PREPARING", "SERVED", "REJECTED"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                statusFilter === status
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Order #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Table
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Tidak ada pesanan
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {order.orderNumber}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {order.customerName}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {order.table.code}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-900">
                      {formatPrice(order.totalAmount)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          order.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.status === "APPROVED"
                            ? "bg-blue-100 text-blue-800"
                            : order.status === "PREPARING"
                            ? "bg-orange-100 text-orange-800"
                            : order.status === "SERVED"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        {order.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => updateStatus(order.id, "APPROVED")}
                              className="text-green-600 hover:text-green-800"
                              title="Approve"
                            >
                              <CheckCircle className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => updateStatus(order.id, "REJECTED")}
                              className="text-red-600 hover:text-red-800"
                              title="Reject"
                            >
                              <XCircle className="h-5 w-5" />
                            </button>
                          </>
                        )}
                        {order.status === "APPROVED" && (
                          <button
                            onClick={() => updateStatus(order.id, "PREPARING")}
                            className="text-orange-600 hover:text-orange-800"
                            title="Proses Masak"
                          >
                            <ChefHat className="h-5 w-5" />
                          </button>
                        )}
                        {order.status === "PREPARING" && (
                          <button
                            onClick={() => updateStatus(order.id, "SERVED")}
                            className="text-green-600 hover:text-green-800"
                            title="Antar ke Meja"
                          >
                            <UtensilsCrossed className="h-5 w-5" />
                          </button>
                        )}
                        {order.status === "SERVED" && order.transactionId && order.transaction?.status !== "PAID" && (
                          <button
                            onClick={() => {
                              setPaymentOrder(order);
                              setShowPaymentModal(true);
                            }}
                            className="p-1 text-green-600 hover:text-green-800"
                            title="Bayar Pesanan"
                          >
                            <DollarSign className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Order Number</p>
                    <p className="font-semibold">{selectedOrder.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Customer</p>
                    <p className="font-semibold">{selectedOrder.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Table</p>
                    <p className="font-semibold">{selectedOrder.table.code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        selectedOrder.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : selectedOrder.status === "APPROVED"
                          ? "bg-blue-100 text-blue-800"
                          : selectedOrder.status === "PREPARING"
                          ? "bg-orange-100 text-orange-800"
                          : selectedOrder.status === "SERVED"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedOrder.status}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-semibold text-gray-900">Items</p>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between rounded-lg border border-gray-200 p-3"
                      >
                        <div>
                          <p className="font-medium">{item.menu.name}</p>
                          <p className="text-sm text-gray-600">
                            {item.quantity} x {formatPrice(item.unitPrice)}
                          </p>
                        </div>
                        <p className="font-semibold">{formatPrice(item.subtotal)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatPrice(selectedOrder.totalAmount)}</span>
                  </div>
                </div>

                {selectedOrder.status === "PENDING" && (
                  <div className="flex gap-2 border-t pt-4">
                    <button
                      onClick={() => updateStatus(selectedOrder.id, "APPROVED")}
                      className="flex-1 rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateStatus(selectedOrder.id, "REJECTED")}
                      className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                )}
                {selectedOrder.status === "APPROVED" && (
                  <div className="flex gap-2 border-t pt-4">
                    <button
                      onClick={() => updateStatus(selectedOrder.id, "PREPARING")}
                      className="flex-1 rounded-lg bg-orange-600 px-4 py-2 font-semibold text-white hover:bg-orange-700"
                    >
                      Proses Masak
                    </button>
                  </div>
                )}
                {selectedOrder.status === "PREPARING" && (
                  <div className="flex gap-2 border-t pt-4">
                    <button
                      onClick={() => updateStatus(selectedOrder.id, "SERVED")}
                      className="flex-1 rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
                    >
                      Antar ke Meja
                    </button>
                  </div>
                )}
                {selectedOrder.status === "SERVED" && selectedOrder.transactionId && selectedOrder.transaction?.status !== "PAID" && (
                  <div className="border-t pt-4">
                    <div className="rounded-lg bg-green-50 p-4 text-center">
                      <p className="text-sm text-green-800">
                        Pesanan sudah diantar ke meja
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Transaksi telah dibuat dan siap untuk dibayar
                      </p>
                      <button
                        onClick={() => {
                          setPaymentOrder(selectedOrder);
                          setShowPaymentModal(true);
                        }}
                        className="mt-3 w-full rounded-lg bg-green-600 px-4 py-2 font-bold text-white hover:bg-green-700"
                      >
                        BAYAR SEKARANG
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && paymentOrder && (
          <PaymentModal
            order={paymentOrder}
            onClose={() => {
              setShowPaymentModal(false);
              setPaymentOrder(null);
            }}
            onPay={handlePay}
          />
        )}
      </div>
    </MainLayout>
  );
}

function PaymentModal({ order, onClose, onPay }: { 
  order: OrderRequest; 
  onClose: () => void;
  onPay: (transactionId: string, method: string, amount: number) => Promise<void>;
}) {
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [paidAmount, setPaidAmount] = useState(parseFloat(order.totalAmount));
  const [submitting, setSubmitting] = useState(false);

  const total = parseFloat(order.totalAmount);
  const change = paidAmount - total;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paidAmount < total) {
      alert("Jumlah bayar kurang");
      return;
    }
    if (!order.transactionId) return;

    setSubmitting(true);
    await onPay(order.transactionId, paymentMethod, paidAmount);
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        <h3 className="mb-4 text-xl font-bold text-gray-900 text-center">Pembayaran Pesanan</h3>
        
        <div className="mb-6 rounded-lg bg-gray-50 p-4 text-center">
          <p className="text-sm text-gray-600">Total Tagihan</p>
          <p className="text-3xl font-bold text-green-600">
            {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(total)}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Metode Pembayaran</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 p-2.5 shadow-sm focus:border-green-500 focus:ring-green-500"
            >
              <option value="CASH">CASH</option>
              <option value="QRIS">QRIS</option>
              <option value="TRANSFER">TRANSFER</option>
              <option value="OTHER">OTHER</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Jumlah Bayar</label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-2.5 text-gray-500">Rp</span>
              <input
                type="number"
                value={paidAmount}
                onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                className="block w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 shadow-sm focus:border-green-500 focus:ring-green-500"
                required
              />
            </div>
          </div>

          {paymentMethod === "CASH" && (
            <div className="rounded-lg bg-orange-50 p-3 flex justify-between items-center">
              <span className="text-sm font-medium text-orange-800">Kembalian</span>
              <span className="font-bold text-orange-900">
                {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Math.max(0, change))}
              </span>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting || paidAmount < total}
              className="flex-1 rounded-lg bg-green-600 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-green-700 disabled:opacity-50"
            >
              {submitting ? "Memproses..." : "Konfirmasi Bayar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
