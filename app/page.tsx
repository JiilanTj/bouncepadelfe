import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Stats } from "@/components/landing/Stats";
import { Facilities } from "@/components/landing/Facilities";
import { Shop } from "@/components/landing/Shop";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";
import type { Facility } from "@/lib/types/facilities.types";
import type { Product } from "@/lib/types/product.types";
import type { Settings } from "@/lib/types/settings.types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

async function getSettings(): Promise<Settings | null> {
  try {
    const res = await fetch(`${API_BASE}/settings`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

async function getFacilities(): Promise<Facility[]> {
  try {
    const res = await fetch(`${API_BASE}/facilities`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

async function getProducts(type: "SELL" | "RENT"): Promise<Product[]> {
  try {
    const res = await fetch(`${API_BASE}/products?type=${type}&limit=6`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data?.data || [];
  } catch {
    return [];
  }
}

export default async function Home() {
  const [settings, facilities, productsSell, productsRent] = await Promise.all([
    getSettings(),
    getFacilities(),
    getProducts("SELL"),
    getProducts("RENT"),
  ]);

  const courtsCount = 6;
  const facilitiesCount = facilities.length;
  const productsCount = productsSell.length + productsRent.length;

  return (
    <main className="bg-white">
      <Navbar />
      <Hero
        heroImageUrl={settings?.heroImageUrl || null}
        businessName={settings?.businessName || "Bounce Padel"}
      />
      <Stats
        courtsCount={courtsCount}
        facilitiesCount={facilitiesCount}
        productsCount={productsCount}
      />
      <Facilities facilities={facilities} />
      <Shop productsSell={productsSell} productsRent={productsRent} />
      <CTA businessPhone={settings?.businessPhone || null} heroImageUrl={settings?.heroImageUrl || null} />
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
