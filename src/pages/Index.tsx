import { useState, useEffect } from "react";
import { ExpenseForm, ExpenseData } from "@/components/ExpenseForm";
import { TransactionHistory } from "@/components/TransactionHistory";
import { PettyCashTopUp, TopUpData } from "@/components/PettyCashTopUp";
import { TopUpHistory } from "@/components/TopUpHistory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const Index = () => {
  const queryClient = useQueryClient();
  const [balance, setBalance] = useState(0);

  // Fetch expenses
  const { data: transactions = [] } = useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .order("date", { ascending: false });
      
      if (error) {
        toast.error("Ralat semasa mengambil data perbelanjaan");
        throw error;
      }
      
      // Transform the data to match ExpenseData interface
      return (data || []).map(expense => ({
        name: expense.name,
        date: expense.date,
        invoiceNo: expense.invoice_no || "",
        vendor: expense.vendor || "",
        purpose: expense.purpose,
        category: expense.category,
        amount: Number(expense.amount),
        paymentMethod: expense.payment_method,
        customPurpose: expense.purpose === "other" ? expense.purpose : undefined,
        customCategory: expense.category === "other" ? expense.category : undefined,
      }));
    },
  });

  // Fetch top-ups
  const { data: topUps = [] } = useQuery({
    queryKey: ["topUps"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("top_ups")
        .select("*")
        .order("date", { ascending: false });
      
      if (error) {
        toast.error("Ralat semasa mengambil data tambahan baki");
        throw error;
      }
      
      return data || [];
    },
  });

  // Calculate balance
  useEffect(() => {
    const totalTopUps = topUps.reduce((sum, topUp) => sum + Number(topUp.amount), 0);
    const totalExpenses = transactions.reduce((sum, expense) => sum + Number(expense.amount), 0);
    setBalance(totalTopUps - totalExpenses);
  }, [topUps, transactions]);

  // Add expense mutation
  const addExpenseMutation = useMutation({
    mutationFn: async (data: ExpenseData) => {
      const { error } = await supabase.from("expenses").insert({
        name: data.name,
        date: data.date,
        invoice_no: data.invoiceNo,
        vendor: data.vendor,
        purpose: data.purpose === "other" ? data.customPurpose : data.purpose,
        category: data.category === "other" ? data.customCategory : data.category,
        amount: data.amount,
        payment_method: data.paymentMethod,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Rekod berjaya disimpan");
    },
    onError: () => {
      toast.error("Ralat semasa menyimpan rekod");
    },
  });

  // Add top-up mutation
  const addTopUpMutation = useMutation({
    mutationFn: async (data: { amount: number; date: string }) => {
      const { error } = await supabase.from("top_ups").insert({
        amount: data.amount,
        date: data.date,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topUps"] });
      toast.success("Baki berjaya ditambah");
    },
    onError: () => {
      toast.error("Ralat semasa menambah baki");
    },
  });

  const handleExpenseSubmit = (data: ExpenseData) => {
    addExpenseMutation.mutate(data);
  };

  const handleTopUp = (amount: number, date: string) => {
    addTopUpMutation.mutate({ amount, date });
  };

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
    ].join(",");

    const csvRows = transactions.map((t) => {
      return [
        t.name,
        t.date,
        t.invoiceNo,
        t.vendor,
        t.purpose,
        t.category,
        Number(t.amount).toFixed(2),
        t.paymentMethod,
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
                    .reduce((acc, curr) => acc + Number(curr.amount), 0)
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
