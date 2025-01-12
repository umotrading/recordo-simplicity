import { useState, useEffect } from "react";
import { ExpenseData } from "@/components/expense/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DailySummary } from "@/components/DailySummary";
import { ExportButton } from "@/components/ExportButton";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { TopUpSection } from "@/components/dashboard/TopUpSection";
import { ExpenseSection } from "@/components/dashboard/ExpenseSection";
import { HistorySection } from "@/components/dashboard/HistorySection";

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
      
      return (data || []).map(expense => ({
        name: expense.name,
        date: expense.date,
        invoiceNo: expense.invoice_no || "",
        vendor: expense.vendor || "",
        purpose: expense.purpose,
        category: expense.category,
        amount: Number(expense.amount),
        paymentMethod: expense.payment_method,
        receipt_url: expense.receipt_url || "",
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
        receipt_url: data.receipt_url,
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
    mutationFn: async (data: { amount: number; date: string; notes: string }) => {
      const { error } = await supabase.from("top_ups").insert({
        amount: data.amount,
        date: data.date,
        notes: data.notes,
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

  const handleTopUp = (amount: number, date: string, notes: string) => {
    addTopUpMutation.mutate({ amount, date, notes });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <DashboardHeader balance={balance} />
        <DailySummary transactions={transactions} balance={balance} />
        <TopUpSection onTopUp={handleTopUp} />
        <ExpenseSection balance={balance} onSubmit={handleExpenseSubmit} />
        <HistorySection topUps={topUps} transactions={transactions} />
        
        <div className="fixed bottom-4 right-4 z-10">
          <ExportButton transactions={transactions} />
        </div>
      </div>
    </div>
  );
};

export default Index;