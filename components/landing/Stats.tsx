interface StatsProps {
  courtsCount: number;
  facilitiesCount: number;
  productsCount: number;
}

export function Stats({ courtsCount, facilitiesCount, productsCount }: StatsProps) {
  const stats = [
    { value: `${courtsCount || 6}`, label: "Lapangan Indoor" },
    { value: `${facilitiesCount || 4}`, label: "Fasilitas" },
    { value: "24/7", label: "Akses" },
    { value: `${productsCount || 30}+`, label: "Produk" },
  ];

  return (
    <div className="w-full border-b" style={{ background: "var(--lp-dark)", borderColor: "rgba(255,255,255,0.08)" }}>
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4 md:divide-x md:divide-white/10">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col gap-1">
              <span className="text-3xl font-bold text-white md:text-4xl">
                {stat.value}
              </span>
              <span className="text-sm uppercase tracking-wide text-gray-400">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
