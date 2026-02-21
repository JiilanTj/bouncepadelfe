"use client";

import { useEffect, useState, FormEvent } from "react";
import { Search, ShoppingBag, MessageCircle } from "lucide-react";
import Image from "next/image";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import type { Product, ProductCategoryData } from "@/lib/types/product.types";
import type { Settings } from "@/lib/types/settings.types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

function formatPrice(price: string | number): string {
  const num = typeof price === "string" ? parseFloat(price) : price;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

function generateWhatsAppURL(product: Product, phone: string | null): string {
  if (!phone) return "#";
  const cleaned = phone.replace(/\D/g, "");
  const intl = cleaned.startsWith("0") ? `62${cleaned.slice(1)}` : cleaned;

  const action = product.type === "RENT" ? "menyewa" : "membeli";
  const message = `Halo Bounce Padel!

Saya ingin ${action} produk:

 *Produk:* ${product.name}${product.sku ? `\n *SKU:* ${product.sku}` : ""}
 *Kategori:* ${product.category?.name || "Umum"}
 *Harga:* ${formatPrice(product.price)}${product.type === "RENT" ? "/sesi" : ""}
 *Stok Tersedia:* ${product.stock}${product.description ? `\n *Deskripsi:* ${product.description}` : ""}

Mohon informasi cara ${product.type === "RENT" ? "penyewaan" : "pembelian"} dan pemesanan. Terima kasih!`;

  return `https://wa.me/${intl}?text=${encodeURIComponent(message)}`;
}

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategoryData[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Fetch all data on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const [sellRes, rentRes, catRes, settingsRes] = await Promise.all([
          fetch(`${API_BASE}/products?type=SELL`),
          fetch(`${API_BASE}/products?type=RENT`),
          fetch(`${API_BASE}/product-categories`),
          fetch(`${API_BASE}/settings`),
        ]);

        const sellProducts: Product[] = sellRes.ok
          ? ((await sellRes.json()).data?.data || [])
          : [];
        const rentProducts: Product[] = rentRes.ok
          ? ((await rentRes.json()).data?.data || [])
          : [];
        setProducts([...sellProducts, ...rentProducts]);
        if (catRes.ok) {
          const json = await catRes.json();
          const catData = json.data?.data || json.data || [];
          setCategories(Array.isArray(catData) ? catData : []);
        }
        if (settingsRes.ok) {
          const json = await settingsRes.json();
          setSettings(json.data || null);
        }
      } catch (err) {
        console.error("Failed to fetch store data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Filter products
  const filtered = products.filter((p) => {
    const matchSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory =
      selectedCategory === "all" || p.category?.id === selectedCategory;
    return matchSearch && matchCategory;
  });

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
  };

  return (
    <main style={{ background: "var(--lp-dark)" }}>
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-20">
        {/* Background Pattern */}
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
            🛒 Belanja Peralatan Padel
          </span>
          <h1 className="text-4xl font-bold text-white md:text-5xl lg:text-6xl">
            Padel
            <span className="block" style={{ color: "var(--lp-green-300)" }}>
              Store
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
            Belanja peralatan padel terbaik untuk meningkatkan performa
            permainan Anda. Produk berkualitas dengan harga terjangkau.
          </p>
        </div>
      </section>

      {/* Filters Section */}
      <section
        className="border-b py-6"
        style={{
          background: "var(--lp-green-900)",
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 md:max-w-md">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari produk..."
                  className="block w-full rounded-full border py-3 pl-12 pr-4 text-white placeholder-gray-500 transition-colors focus:outline-none focus:ring-2"
                  style={{
                    background: "var(--lp-dark)",
                    borderColor: "rgba(255,255,255,0.1)",
                  }}
                />
              </div>
            </form>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory("all")}
                className="rounded-full px-5 py-2.5 text-sm font-medium transition-all"
                style={{
                  background:
                    selectedCategory === "all"
                      ? "var(--lp-green-500)"
                      : "rgba(255,255,255,0.05)",
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
                    background:
                      selectedCategory === cat.id
                        ? "var(--lp-green-500)"
                        : "rgba(255,255,255,0.05)",
                    color: selectedCategory === cat.id ? "white" : "#9ca3af",
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16 md:py-20" style={{ background: "var(--lp-dark)" }}>
        <div className="mx-auto max-w-7xl px-6">
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-2xl border p-6"
                  style={{
                    background: "var(--lp-green-900)",
                    borderColor: "rgba(255,255,255,0.05)",
                  }}
                >
                  <div className="mb-4 h-48 rounded-lg bg-gray-800" />
                  <div className="mb-2 h-4 w-2/3 rounded bg-gray-800" />
                  <div className="h-3 w-1/2 rounded bg-gray-800" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="rounded-2xl border p-12 text-center"
              style={{
                background: "var(--lp-green-900)",
                borderColor: "rgba(255,255,255,0.08)",
              }}
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
                <ShoppingBag className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Tidak ada produk ditemukan
              </h3>
              <p className="mt-2 text-gray-400">
                Coba ubah filter pencarian Anda
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  phone={settings?.businessPhone || null}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
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

function ProductCard({
  product,
  phone,
}: {
  product: Product;
  phone: string | null;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const waUrl = generateWhatsAppURL(product, phone);

  return (
    <div
      className="group overflow-hidden rounded-2xl border transition-all hover:border-white/20"
      style={{
        background: "var(--lp-green-900)",
        borderColor: "rgba(255,255,255,0.05)",
      }}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gray-800">
        {product.imageUrl ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 animate-pulse bg-gray-800" />
            )}
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              onLoad={() => setImageLoaded(true)}
              className={`object-contain transition-transform duration-500 group-hover:scale-105 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
            />
          </>
        ) : (
          <div
            className="flex h-full items-center justify-center"
            style={{
              background: "linear-gradient(135deg, rgba(46,125,50,0.2), rgba(46,125,50,0.05))",
            }}
          >
            <ShoppingBag className="h-16 w-16 text-gray-600" />
          </div>
        )}

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to top, var(--lp-green-900) 0%, transparent 50%)",
          }}
        />

        {/* Stock Badge */}
        {/* Type Badge */}
        <div className="absolute left-4 top-4">
          <span
            className="rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white"
            style={{ background: product.type === "RENT" ? "var(--lp-gold)" : "var(--lp-green-500)" }}
          >
            {product.type === "RENT" ? "Sewa" : "Beli"}
          </span>
        </div>

        {/* Stock Badge */}
        <div className="absolute right-4 top-4">
          <span className="rounded-full bg-blue-500/90 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white">
            Stock: {product.stock}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {product.category && (
          <div className="mb-2">
            <span
              className="rounded-lg px-2 py-1 text-xs font-medium"
              style={{
                background: "rgba(46,125,50,0.2)",
                color: "var(--lp-green-300)",
              }}
            >
              {product.category.name}
            </span>
          </div>
        )}

        <h3 className="text-xl font-bold text-white">{product.name}</h3>

        {product.sku && (
          <p className="mt-1 font-mono text-xs text-gray-500">
            SKU: {product.sku}
          </p>
        )}

        {product.description && (
          <p className="mt-2 line-clamp-2 text-sm text-gray-400">
            {product.description}
          </p>
        )}

        {/* Price */}
        <div className="mt-4">
          <span
            className="text-2xl font-bold"
            style={{ color: "var(--lp-green-300)" }}
          >
            {formatPrice(product.price)}{product.type === "RENT" ? "/jam" : ""}
          </span>
        </div>

        {/* Buy Button */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 font-bold text-white transition-all hover:opacity-90"
          style={{
            background: "var(--lp-green-500)",
          }}
        >
          <MessageCircle className="h-5 w-5" />
          <span>{product.type === "RENT" ? "Sewa" : "Beli"} via WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
