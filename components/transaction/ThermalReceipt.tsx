import { Transaction, TransactionItem, PaymentMethod } from "@/lib/types";
import { formatRupiah, formatDate } from "@/lib/utils";
import { formatTime } from "@/lib/utils/date";
import Image from "next/image";

interface ThermalReceiptProps {
  transaction: Transaction;
  items: TransactionItem[];
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

function getPaymentMethodLabel(method: PaymentMethod): string {
  switch (method) {
    case "CASH":
      return "TUNAI";
    case "QRIS":
      return "QRIS";
    case "TRANSFER":
      return "TRANSFER";
    case "OTHER":
      return "LAINNYA";
    default:
      return method;
  }
}

export function ThermalReceipt({
  transaction,
  items,
  businessAddress = "Jl. Padel No. 123, Jakarta",
  businessPhone = "0812-3456-7890",
}: ThermalReceiptProps) {
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

      {/* Transaction Info */}
      <div className="receipt-section">
        <div className="receipt-row">
          <span>No. Invoice</span>
          <span>{transaction.invoiceNumber}</span>
        </div>
        <div className="receipt-row">
          <span>Tanggal</span>
          <span>{formatDate(transaction.createdAt)}</span>
        </div>
        <div className="receipt-row">
          <span>Waktu</span>
          <span>{formatTime(transaction.createdAt)}</span>
        </div>
        <div className="receipt-row">
          <span>Kasir</span>
          <span>{transaction.creator?.name || "Unknown"}</span>
        </div>
        {transaction.customerName && (
          <div className="receipt-row">
            <span>Pelanggan</span>
            <span>{transaction.customerName}</span>
          </div>
        )}
        {transaction.table && (
          <div className="receipt-row">
            <span>Meja</span>
            <span>{transaction.table.code}</span>
          </div>
        )}
      </div>

      <div className="receipt-divider">================================</div>

      {/* Items */}
      <div className="receipt-section">
        {items.map((item, index) => (
          <div key={item.id || index} className="receipt-item">
            <div className="item-name">{getItemName(item)}</div>
            <div className="item-detail">
              <span>
                {item.quantity} x {formatRupiah(parseFloat(item.unitPrice))}
              </span>
              <span className="item-subtotal">{formatRupiah(parseFloat(item.subtotal))}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="receipt-divider">================================</div>

      {/* Payment Summary */}
      <div className="receipt-section">
        <div className="receipt-row">
          <span>Subtotal</span>
          <span>{formatRupiah(parseFloat(transaction.totalAmount))}</span>
        </div>
        <div className="receipt-row">
          <span>Pajak</span>
          <span>{formatRupiah(0)}</span>
        </div>
        <div className="receipt-row receipt-total">
          <span>TOTAL</span>
          <span>{formatRupiah(parseFloat(transaction.totalAmount))}</span>
        </div>
        <div className="receipt-row">
          <span>Bayar ({getPaymentMethodLabel(transaction.paymentMethod)})</span>
          <span>{formatRupiah(parseFloat(transaction.paidAmount))}</span>
        </div>
        <div className="receipt-row">
          <span>Kembali</span>
          <span>{formatRupiah(parseFloat(transaction.changeAmount))}</span>
        </div>
      </div>

      <div className="receipt-divider">================================</div>

      {/* Footer */}
      <div className="receipt-footer">
        <div className="footer-text">Terima kasih atas kunjungan Anda</div>
        <div className="footer-text">Selamat bermain!</div>
        <div className="footer-text footer-small">
          Dicetak: {new Date().toLocaleString("id-ID")}
        </div>
      </div>
    </div>
  );
}
