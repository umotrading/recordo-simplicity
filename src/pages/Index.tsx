import { useState, useEffect } from "react";
import { ExpenseForm, ExpenseData } from "@/components/ExpenseForm";
import { TransactionHistory } from "@/components/TransactionHistory";
import { PettyCashTopUp } from "@/components/PettyCashTopUp";
import { TopUpHistory } from "@/components/TopUpHistory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BalanceDisplay } from "@/components/BalanceDisplay";
import { DailySummary } from "@/components/DailySummary";
import { ExportButton } from "@/components/ExportButton";
import { Leaf } from "lucide-react";

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

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-green-600" />
            <h1 className="text-2xl font-bold text-gray-800">Rekod Ladang GMP</h1>
          </div>
          <BalanceDisplay balance={balance} />
        </div>

        <DailySummary transactions={transactions} balance={balance} />

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

        {/* Export button moved to bottom */}
        <div className="fixed bottom-4 right-4 z-10">
          <ExportButton transactions={transactions} />
        </div>
      </div>
    </div>
  );
};

export default Index;