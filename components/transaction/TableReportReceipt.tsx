import { Transaction, TransactionItem } from "@/lib/types";
import { formatRupiah, formatDate } from "@/lib/utils";
import { formatTime } from "@/lib/utils/date";
import Image from "next/image";

interface TableReportReceiptProps {
  tableName: string;
  startDate?: Date;
  endDate?: Date;
  transactions: Transaction[];
  businessAddress?: string;
  businessPhone?: string;
}

function getItemName(item: TransactionItem): string {
  if (item.itemType === "PRODUCT" && item.product) {
    return item.product.name;
  }
  if (item.itemType === "MENU" && item.menu) {
    return item.menu.name;
  }
  if (item.notes) {
    return item.notes;
  }
  return "Unknown Item";
}

export function TableReportReceipt({
  tableName,
  startDate,
  endDate,
  transactions,
  businessAddress = "Jl. Padel No. 123, Jakarta",
  businessPhone = "0812-3456-7890",
}: TableReportReceiptProps) {
  const totalRevenue = transactions.reduce((sum, t) => sum + parseFloat(t.totalAmount), 0);
  
  // Sort transactions by date
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <div className="thermal-receipt">
      {/* Header */}
      <div className="receipt-header">
        <div className="flex justify-center mb-2">
          <Image
            src="/logotypes.png"
            alt="Bounce Padel Logo"
            width={120}
            height={30}
            className="brightness-0 object-contain"
          />
        </div>
        <div className="business-info">{businessAddress}</div>
        <div className="business-info">Telp: {businessPhone}</div>
      </div>

      <div className="receipt-divider">================================</div>

      <div className="receipt-header">
        <div className="font-bold text-[16px]">TAGIHAN MEJA (BILL)</div>
        <div className="font-bold text-[18px] mt-1">{tableName}</div>
      </div>

      {/* Report Info */}
      <div className="receipt-section">
        <div className="receipt-row">
          <span>Dicetak</span>
          <span>{formatDate(new Date())} {formatTime(new Date())}</span>
        </div>
        {/* Only show range if it's not a single day or if specifically requested, 
            but for a "Bill" typically we just show the content. 
            However, keeping it to be safe as it filters by date.
        */}
        <div className="receipt-row">
          <span>Tanggal</span>
          <div className="text-right">
            <div>{startDate ? formatDate(startDate) : "-"}</div>
            {endDate && (
              <div>s/d {formatDate(endDate)}</div>
            )}
          </div>
        </div>
      </div>

      <div className="receipt-divider">================================</div>

      {/* Transactions List with Items */}
      <div className="receipt-section">
        <div className="font-bold mb-2 text-center text-[12px]">RINCIAN PESANAN</div>
        {sortedTransactions.length === 0 ? (
          <div className="text-center italic">Tidak ada transaksi</div>
        ) : (
          sortedTransactions.map((t) => (
            <div key={t.id} className="mb-3">
              {/* Transaction Header (Optional, maybe just helpful to separate orders) */}
              <div className="text-[10px] text-[var(--gray-500)] mb-1">
                {t.invoiceNumber} - {formatTime(t.createdAt)} ({t.customerName || "Guest"})
              </div>
              
              {/* Items in this transaction */}
              {t.items && t.items.map((item, idx) => (
                <div key={item.id || idx} className="receipt-item mb-1">
                  <div className="item-name font-normal">{getItemName(item)}</div>
                  <div className="item-detail">
                    <span>
                      {item.quantity} x {formatRupiah(parseFloat(item.unitPrice))}
                    </span>
                    <span className="item-subtotal">{formatRupiah(parseFloat(item.subtotal))}</span>
                  </div>
                </div>
              ))}
              
              {/* If no items (legacy data?), show total only */}
              {(!t.items || t.items.length === 0) && (
                 <div className="receipt-row">
                    <span>Total Transaksi</span>
                    <span>{formatRupiah(parseFloat(t.totalAmount))}</span>
                 </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="receipt-divider">================================</div>

      {/* Summary Stats */}
      <div className="receipt-section">
        <div className="receipt-row receipt-total text-[16px]">
          <span>TOTAL TAGIHAN</span>
          <span>{formatRupiah(totalRevenue)}</span>
        </div>
      </div>

      <div className="receipt-divider">================================</div>

      {/* Footer */}
      <div className="receipt-footer">
        <div className="footer-text">Terima kasih atas kunjungan Anda</div>
        <div className="footer-text">Silakan bayar di kasir</div>
      </div>
    </div>
  );
}
