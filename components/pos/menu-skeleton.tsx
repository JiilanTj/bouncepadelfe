"use client";

export function MenuSkeleton() {
  return (
    <div className="flex flex-col items-start rounded-lg border border-[var(--gray-200)] bg-white p-4">
      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--gray-100)]">
        <div className="h-5 w-5 animate-pulse rounded bg-[var(--gray-200)]" />
      </div>
      <div className="mb-2 h-4 w-24 animate-pulse rounded bg-[var(--gray-200)]" />
      <div className="mb-1 h-3 w-16 animate-pulse rounded bg-[var(--gray-200)]" />
      <div className="h-3 w-20 animate-pulse rounded bg-[var(--gray-200)]" />
    </div>
  );
}

export function MenuGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <MenuSkeleton key={i} />
      ))}
    </>
  );
}
