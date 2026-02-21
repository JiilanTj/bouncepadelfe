/**
 * Currency formatting utilities
 */

/**
 * Format number to Indonesian Rupiah
 * @param amount - Number to format
 * @returns Formatted string (e.g., "Rp 150.000")
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format number without currency symbol
 * @param amount - Number to format
 * @returns Formatted string (e.g., "150.000")
 */
export function formatNumber(amount: number): string {
  return new Intl.NumberFormat("id-ID").format(amount);
}

/**
 * Parse Rupiah string back to number
 * @param rupiahString - String like "Rp 150.000" or "150000"
 * @returns Parsed number
 */
export function parseRupiah(rupiahString: string): number {
  const cleaned = rupiahString.replace(/[^\d]/g, "");
  return parseInt(cleaned, 10) || 0;
}
