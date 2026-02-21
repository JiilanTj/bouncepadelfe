import { Card, CardContent } from "@/components/ui/card";

interface InventoryStatsProps {
  totalItems: number;
  assetCount: number;
  consumableCount: number;
  disposedCount: number;
}

export function InventoryStats({
  totalItems,
  assetCount,
  consumableCount,
  disposedCount,
}: InventoryStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-4">
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <p className="text-2xl font-bold text-[var(--gray-900)]">{totalItems}</p>
          <p className="text-sm text-[var(--gray-500)]">Total Items</p>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <p className="text-2xl font-bold text-[var(--status-info)]">{assetCount}</p>
          <p className="text-sm text-[var(--gray-500)]">Assets</p>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <p className="text-2xl font-bold text-[var(--status-warning)]">
            {consumableCount}
          </p>
          <p className="text-sm text-[var(--gray-500)]">Consumables</p>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <p className="text-2xl font-bold text-[var(--status-danger)]">
            {disposedCount}
          </p>
          <p className="text-sm text-[var(--gray-500)]">Disposed</p>
        </CardContent>
      </Card>
    </div>
  );
}
