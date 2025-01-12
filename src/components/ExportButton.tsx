import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { ExpenseData } from "./expense/types";

interface ExportButtonProps {
  transactions: ExpenseData[];
}

export function ExportButton({ transactions }: ExportButtonProps) {
  const exportToCSV = () => {
    const headers = [
      "Nama Perekod",
      "Tarikh",
      "No. Invoice",
      "Kedai/Pembekal",
      "Tujuan",
      "Kategori",
      "Jumlah (RM)",
      "Kaedah Pembayaran",
      "Link Resit",
      "Nota",  // Added notes header
    ].join(",");

    const csvRows = transactions.map((t) => {
      // Ensure the receipt_url and notes are included, use empty string if undefined
      const receiptUrl = t.receipt_url || "";
      const notes = t.notes || "";  // Added notes field
      
      return [
        t.name,
        t.date,
        t.invoiceNo,
        t.vendor,
        t.purpose,
        t.category,
        Number(t.amount).toFixed(2),
        t.paymentMethod,
        receiptUrl,
        notes,  // Include the notes in the CSV
      ]
        .map((value) => `"${value}"`)
        .join(",");
    });

    const csvContent = [headers, ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `transaksi_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Fail CSV berjaya dimuat turun");
  };

  return (
    <Button
      onClick={exportToCSV}
      className="flex items-center gap-2 shadow-lg"
      size="sm"
    >
      <Download className="w-4 h-4" />
      <span className="hidden sm:inline">Muat Turun CSV</span>
      <span className="sm:hidden">CSV</span>
    </Button>
  );
}