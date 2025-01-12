import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { ExpenseData } from "./expense/types";
import { TopUpData } from "./PettyCashTopUp";

interface ExportButtonProps {
  transactions: ExpenseData[];
  topUps: TopUpData[];
}

export function ExportButton({ transactions, topUps }: ExportButtonProps) {
  const exportToCSV = () => {
    const headers = [
      "Jenis",
      "Nama Perekod",
      "Tarikh",
      "No. Invoice",
      "Kedai/Pembekal",
      "Tujuan",
      "Kategori",
      "Jumlah (RM)",
      "Kaedah Pembayaran",
      "Link Resit",
      "Nota",
    ].join(",");

    // Format expense transactions
    const expenseRows = transactions.map((t) => {
      const receiptUrl = t.receipt_url || "";
      const notes = t.notes || "";
      
      return [
        "Perbelanjaan",
        t.name,
        t.date,
        t.invoiceNo,
        t.vendor,
        t.purpose,
        t.category,
        Number(t.amount).toFixed(2),
        t.paymentMethod,
        receiptUrl,
        notes,
      ]
        .map((value) => `"${value}"`)
        .join(",");
    });

    // Format top-up transactions
    const topUpRows = topUps.map((t) => {
      return [
        "Tambah Baki",
        "-",
        t.date,
        "-",
        "-",
        "Tambah Baki Petty Cash",
        "-",
        Number(t.amount).toFixed(2),
        "-",
        "-",
        t.notes || "",
      ]
        .map((value) => `"${value}"`)
        .join(",");
    });

    // Combine all rows and create CSV content
    const allRows = [...expenseRows, ...topUpRows];
    // Sort rows by date in descending order (newest first)
    allRows.sort((a, b) => {
      const dateA = a.split(",")[2].replace(/"/g, "");
      const dateB = b.split(",")[2].replace(/"/g, "");
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

    const csvContent = [headers, ...allRows].join("\n");
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