import { useState } from "react";
import { ExpenseForm, ExpenseData } from "@/components/ExpenseForm";
import { TransactionHistory } from "@/components/TransactionHistory";
import { PettyCashTopUp, TopUpData } from "@/components/PettyCashTopUp";
import { TopUpHistory } from "@/components/TopUpHistory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<ExpenseData[]>([]);
  const [topUps, setTopUps] = useState<TopUpData[]>([]);

  const handleExpenseSubmit = (data: ExpenseData) => {
    setTransactions([data, ...transactions]);
    setBalance(balance - data.amount);
  };

  const handleTopUp = (amount: number, date: string) => {
    const topUpData = { amount, date };
    setTopUps([topUpData, ...topUps]);
    setBalance(balance + amount);
  };

  const exportToCSV = () => {
    // Header untuk fail CSV
    const headers = [
      "Nama Perekod",
      "Tarikh",
      "No. Invoice",
      "Kedai/Pembekal",
      "Tujuan",
      "Kategori",
      "Jumlah (RM)",
      "Kaedah Pembayaran",
    ].join(",");

    // Tukar data transaksi kepada format CSV
    const csvRows = transactions.map((t) => {
      return [
        t.name,
        t.date,
        t.invoiceNo,
        t.vendor,
        t.purpose === "other" ? t.customPurpose : t.purpose,
        t.category === "other" ? t.customCategory : t.category,
        t.amount.toFixed(2),
        t.paymentMethod,
      ]
        .map((value) => `"${value}"`)
        .join(",");
    });

    // Gabungkan header dan data
    const csvContent = [headers, ...csvRows].join("\n");

    // Buat fail CSV dan muat turun
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Sistem Rekod Ladang</h1>
          <div className="flex gap-4 items-center">
            <Button
              onClick={exportToCSV}
              className="flex items-center gap-2"
              variant="outline"
            >
              <Download className="w-4 h-4" />
              Muat Turun CSV
            </Button>
            <Card className="w-auto">
              <CardHeader className="py-2">
                <CardTitle className="text-lg">Baki Petty Cash</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary">
                  RM {balance.toFixed(2)}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Hari Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Perbelanjaan Hari Ini</p>
                <p className="text-xl font-bold">
                  RM{" "}
                  {transactions
                    .filter(
                      (t) =>
                        new Date(t.date).toDateString() ===
                        new Date().toDateString()
                    )
                    .reduce((acc, curr) => acc + curr.amount, 0)
                    .toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Baki Semasa</p>
                <p className="text-xl font-bold">RM {balance.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tambah Baki Petty Cash</CardTitle>
          </CardHeader>
          <CardContent>
            <PettyCashTopUp onTopUp={handleTopUp} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tambah Rekod Baru</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseForm currentBalance={balance} onSubmit={handleExpenseSubmit} />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <TopUpHistory topUps={topUps} />
          <TransactionHistory transactions={transactions} />
        </div>
      </div>
    </div>
  );
};

export default Index;