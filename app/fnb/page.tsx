"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { Search, UtensilsCrossed, ShoppingCart, Plus, Minus, Trash2, X } from "lucide-react";
import Image from "next/image";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { useSearchParams } from "next/navigation";
import type { Settings } from "@/lib/types/settings.types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

/* ---------- Types ---------- */

interface MenuCategory {
  id: string;
  name: string;
  slug: string;
}

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  isAvailable: boolean;
  category: MenuCategory | null;
}

interface CartItem extends MenuItem {
  quantity: number;
}

/* ---------- Helpers ---------- */

function formatPrice(price: string | number): string {
  const num = typeof price === "string" ? parseFloat(price) : price;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

// Removed WhatsApp generation - now using direct order submission

/* ---------- Page Wrapper for Suspense ---------- */

export default function FnBPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <FnBContent />
    </Suspense>
  );
}

function FnBContent() {
  const searchParams = useSearchParams();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [tableCode, setTableCode] = useState("");
  const [tableValid, setTableValid] = useState<boolean | null>(null);
  const [validatingTable, setValidatingTable] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Validate table code
  const handleValidateTable = useCallback(async (showAlert = true) => {
    if (!tableCode.trim()) return;
    setValidatingTable(true);
    try {
      const res = await fetch(`${API_BASE}/order-requests/validate-table`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: tableCode.trim() }),
      });
      const json = await res.json();
      if (res.ok && json.data?.valid) {
        setTableValid(true);
      } else {
        setTableValid(false);
        if (showAlert) {
          alert(json.data?.message || "Kode meja tidak valid");
        }
      }
    } catch (err) {
      console.error("Failed to validate table:", err);
      setTableValid(false);
      if (showAlert) {
        alert("Gagal memvalidasi kode meja");
      }
    } finally {
      setValidatingTable(false);
    }
  }, [tableCode]);

  // Load table from query params
  useEffect(() => {
    const tableParam = searchParams.get("table");
    if (tableParam) {
      const code = tableParam.toUpperCase();
      setTableCode(code);
      // Validasi otomatis kalau dari QR/Link
      const validateFromLink = async () => {
        setValidatingTable(true);
        try {
          const res = await fetch(`${API_BASE}/order-requests/validate-table`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code }),
          });
          const json = await res.json();
          setTableValid(res.ok && json.data?.valid);
        } catch (err) {
          console.error("Link validation failed:", err);
        } finally {
          setValidatingTable(false);
        }
      };
      validateFromLink();
    }
  }, [searchParams]);



  // Load cart from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("fnb_cart");
    if (saved) {
      try { setCart(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem("fnb_cart", JSON.stringify(cart));
  }, [cart]);

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      try {
        const [menuRes, catRes, settingsRes] = await Promise.all([
          fetch(`${API_BASE}/menus?limit=100&available=true&active=true`),
          fetch(`${API_BASE}/menu-categories`),
          fetch(`${API_BASE}/settings`),
        ]);

        if (menuRes.ok) {
          const json = await menuRes.json();
          const items = json.data?.data || json.data || [];
          setMenuItems(Array.isArray(items) ? items : []);
        }
        if (catRes.ok) {
          const catJson = await catRes.json();
          const catData = catJson.data?.data || catJson.data || [];
          setCategories(Array.isArray(catData) ? catData : []);
        }
        if (settingsRes.ok) {
          const json = await settingsRes.json();
          setSettings(json.data || null);
        }
      } catch (err) {
        console.error("Failed to fetch F&B data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Filter
  const filtered = menuItems.filter((item) => {
    const matchSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory =
      selectedCategory === "all" || item.category?.id === selectedCategory;
    return matchSearch && matchCategory;
  });

  // Cart
  const addToCart = useCallback((item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) => (c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const updateQuantity = useCallback((id: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((c) => c.id !== id));
    } else {
      setCart((prev) => prev.map((c) => (c.id === id ? { ...c, quantity: qty } : c)));
    }
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const totalQty = cart.reduce((s, c) => s + c.quantity, 0);
  const totalPrice = cart.reduce((s, c) => s + parseFloat(c.price) * c.quantity, 0);

  // Submit order
  const handleSubmitOrder = async () => {
    if (!tableValid || !customerName.trim() || cart.length === 0) return;
    setSubmittingOrder(true);
    try {
      const items = cart.map((item) => ({
        menuId: item.id,
        quantity: item.quantity,
        unitPrice: item.price,
        subtotal: (parseFloat(item.price) * item.quantity).toFixed(2),
      }));

      const res = await fetch(`${API_BASE}/order-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableCode: tableCode.trim(),
          customerName: customerName.trim(),
          items,
        }),
      });

      const json = await res.json();
      if (res.ok) {
        alert("Pesanan berhasil dibuat! Mohon tunggu konfirmasi dari kasir.");
        setCart([]);
        setCustomerName("");
        setTableCode("");
        setTableValid(null);
        setShowCart(false);
      } else {
        alert(json.message || "Gagal membuat pesanan");
      }
    } catch (err) {
      console.error("Failed to submit order:", err);
      alert("Gagal membuat pesanan");
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <main style={{ background: "var(--lp-dark)" }}>
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-20">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232e7d32' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>
        <div className="relative mx-auto max-w-7xl px-6 text-center">
          <span
            className="mb-4 inline-block rounded-full px-4 py-2 text-sm font-medium"
            style={{ background: "rgba(46,125,50,0.2)", color: "var(--lp-green-300)" }}
          >
            🍽️ Cafe &amp; Restaurant
          </span>
          <h1 className="text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            Food &amp;
            <span className="block" style={{ color: "var(--lp-green-300)" }}>
              Beverages
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
            Nikmati berbagai pilihan makanan dan minuman segar setelah bermain padel.
            Tempat sempurna untuk bersantai bersama teman.
          </p>
        </div>
      </section>

      {/* Filters Section */}
      <section
        className="border-b py-6"
        style={{ background: "var(--lp-green-900)", borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search */}
            <form onSubmit={(e) => e.preventDefault()} className="flex-1 md:max-w-md">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari menu..."
                  className="block w-full rounded-full border py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2"
                  style={{ background: "var(--lp-dark)", borderColor: "rgba(255,255,255,0.1)" }}
                />
              </div>
            </form>

            <div className="flex items-center gap-4">
              {/* Category pills */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className="rounded-full px-5 py-2.5 text-sm font-medium transition-all"
                  style={{
                    background: selectedCategory === "all" ? "var(--lp-green-500)" : "rgba(255,255,255,0.05)",
                    color: selectedCategory === "all" ? "white" : "#9ca3af",
                  }}
                >
                  Semua
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className="rounded-full px-5 py-2.5 text-sm font-medium transition-all"
                    style={{
                      background: selectedCategory === cat.id ? "var(--lp-green-500)" : "rgba(255,255,255,0.05)",
                      color: selectedCategory === cat.id ? "white" : "#9ca3af",
                    }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Cart button */}
              <button
                onClick={() => setShowCart(true)}
                className="relative flex items-center gap-2 rounded-full px-4 py-2.5 font-semibold text-white transition-all"
                style={{ background: "var(--lp-green-500)" }}
              >
                <ShoppingCart className="h-5 w-5" />
                {totalQty > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold" style={{ color: "var(--lp-green-500)" }}>
                    {totalQty}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Grid */}
      <section className="py-16 md:py-20" style={{ background: "var(--lp-dark)" }}>
        <div className="mx-auto max-w-7xl px-6">
          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse rounded-2xl border p-4" style={{ background: "var(--lp-green-900)", borderColor: "rgba(255,255,255,0.05)" }}>
                  <div className="mb-4 aspect-square rounded-lg bg-gray-800" />
                  <div className="mb-2 h-4 w-2/3 rounded bg-gray-800" />
                  <div className="h-3 w-1/2 rounded bg-gray-800" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border p-12 text-center" style={{ background: "var(--lp-green-900)", borderColor: "rgba(255,255,255,0.08)" }}>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
                <UtensilsCrossed className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Tidak ada menu ditemukan</h3>
              <p className="mt-2 text-gray-400">Coba ubah filter pencarian Anda</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((item) => (
                <MenuCard key={item.id} item={item} onAdd={() => addToCart(item)} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 md:items-center md:p-4">
          <div
            className="h-[90vh] w-full overflow-hidden rounded-t-3xl border md:h-auto md:max-w-2xl md:rounded-3xl"
            style={{ background: "var(--lp-green-900)", borderColor: "rgba(255,255,255,0.08)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b p-6" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              <h3 className="text-2xl font-bold text-white">Keranjang Pesanan</h3>
              <button onClick={() => setShowCart(false)} className="text-gray-400 hover:text-white">
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Body */}
            <div className="max-h-[calc(90vh-200px)] overflow-y-auto p-6 md:max-h-[60vh]">
              {cart.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/5">
                    <ShoppingCart className="h-10 w-10 text-gray-400" />
                  </div>
                  <p className="text-gray-400">Keranjang Anda masih kosong</p>
                </div>
              ) : (
                <>
                  {/* Items */}
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-4 rounded-xl border p-4" style={{ background: "var(--lp-dark)", borderColor: "rgba(255,255,255,0.05)" }}>
                        <div className="flex-1">
                          <h4 className="font-semibold text-white">{item.name}</h4>
                          <p className="text-sm text-gray-400">{formatPrice(item.price)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20">
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center text-white">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20">
                            <Plus className="h-4 w-4" />
                          </button>
                          <button onClick={() => removeFromCart(item.id)} className="ml-2 text-red-400 hover:text-red-300">
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="mt-6 rounded-xl border p-4" style={{ background: "rgba(46,125,50,0.1)", borderColor: "rgba(46,125,50,0.3)" }}>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-white">Total</span>
                      <span className="text-2xl font-bold" style={{ color: "var(--lp-green-300)" }}>
                        {formatPrice(totalPrice)}
                      </span>
                    </div>
                  </div>

                  {/* Table Code */}
                  <div className="mt-6">
                    <label htmlFor="table_code" className="block text-sm font-medium text-gray-300">
                      Kode Meja
                    </label>
                    <div className="mt-2 flex gap-2">
                      <input
                        id="table_code"
                        type="text"
                        value={tableCode}
                        onChange={(e) => {
                          setTableCode(e.target.value.toUpperCase());
                          setTableValid(null);
                        }}
                        placeholder="Contoh: T01"
                        className="block flex-1 rounded-lg border px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2"
                        style={{ background: "var(--lp-dark)", borderColor: tableValid === false ? "#ef4444" : tableValid === true ? "var(--lp-green-500)" : "rgba(255,255,255,0.1)" }}
                      />
                      <button
                        onClick={() => handleValidateTable(true)}
                        disabled={validatingTable || !tableCode.trim()}
                        className="rounded-lg px-4 py-3 font-semibold text-white transition-all disabled:opacity-50"
                        style={{ background: "var(--lp-green-500)" }}
                      >
                        {validatingTable ? "..." : "Cek Meja"}
                      </button>
                    </div>
                    {tableValid === true && (
                      <p className="mt-1 text-sm" style={{ color: "var(--lp-green-300)" }}>✓ Kode meja valid</p>
                    )}
                    {tableValid === false && (
                      <p className="mt-1 text-sm text-red-400">✗ Kode meja tidak valid</p>
                    )}
                  </div>

                  {/* Customer name */}
                  <div className="mt-4">
                    <label htmlFor="cust_name" className="block text-sm font-medium text-gray-300">
                      Nama Anda
                    </label>
                    <input
                      id="cust_name"
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Masukkan nama Anda"
                      className="mt-2 block w-full rounded-lg border px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2"
                      style={{ background: "var(--lp-dark)", borderColor: "rgba(255,255,255,0.1)" }}
                    />
                  </div>

                  {/* Submit Order */}
                  <button
                    onClick={handleSubmitOrder}
                    disabled={!tableValid || !customerName.trim() || submittingOrder}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 font-bold text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: "var(--lp-green-500)" }}
                  >
                    {submittingOrder ? "Mengirim..." : "Pesan Sekarang"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer
        businessName={settings?.businessName || null}
        businessPhone={settings?.businessPhone || null}
        businessEmail={settings?.businessEmail || null}
        businessAddress={settings?.businessAddress || null}
        businessMapLink={settings?.businessMapLink || null}
        instagramUrl={settings?.instagramUrl || null}
        facebookUrl={settings?.facebookUrl || null}
        tiktokUrl={settings?.tiktokUrl || null}
        weekdayOpen={settings?.weekdayOpen || null}
        weekdayClose={settings?.weekdayClose || null}
        weekendOpen={settings?.weekendOpen || null}
        weekendClose={settings?.weekendClose || null}
      />
    </main>
  );
}

/* ---------- MenuCard Component ---------- */

function MenuCard({ item, onAdd }: { item: MenuItem; onAdd: () => void }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div
      className="group overflow-hidden rounded-xl border transition-all hover:border-white/20 sm:rounded-2xl"
      style={{ background: "var(--lp-green-900)", borderColor: "rgba(255,255,255,0.05)" }}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-800">
        {item.imageUrl ? (
          <>
            {!imageLoaded && <div className="absolute inset-0 animate-pulse bg-gray-800" />}
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              onLoad={() => setImageLoaded(true)}
              className={`object-cover transition-transform duration-500 group-hover:scale-105 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
            />
          </>
        ) : (
          <div className="flex h-full items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(46,125,50,0.2), rgba(46,125,50,0.05))" }}>
            <UtensilsCrossed className="h-12 w-12 text-gray-600 sm:h-16 sm:w-16" />
          </div>
        )}

        {/* Category badge */}
        {item.category && (
          <span
            className="absolute right-2 top-2 rounded-lg px-1.5 py-0.5 text-[10px] font-medium sm:right-3 sm:top-3 sm:px-2 sm:py-1 sm:text-xs"
            style={{ background: "var(--lp-green-500)", color: "white" }}
          >
            {item.category.name}
          </span>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="p-3 sm:p-6">
        <h3 className="truncate text-sm font-bold text-white sm:text-xl">{item.name}</h3>

        {item.description && (
          <p className="mt-1 line-clamp-2 text-xs text-gray-400 sm:mt-2 sm:text-sm">{item.description}</p>
        )}

        <div className="mt-2 sm:mt-4">
          <span className="text-lg font-bold sm:text-2xl" style={{ color: "var(--lp-green-300)" }}>
            {formatPrice(item.price)}
          </span>
        </div>

        <button
          onClick={onAdd}
          className="mt-3 flex w-full items-center justify-center gap-1 rounded-full px-3 py-2 text-sm font-semibold text-white transition-all hover:opacity-90 sm:mt-5 sm:gap-2 sm:px-4 sm:py-2.5"
          style={{ background: "var(--lp-green-500)" }}
        >
          <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
          Tambah
        </button>
      </div>
    </div>
  );
}
