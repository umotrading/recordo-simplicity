import { useState } from "react";
import { ExpenseForm, ExpenseData } from "@/components/ExpenseForm";
import { TransactionHistory } from "@/components/TransactionHistory";
import { PettyCashTopUp, TopUpData } from "@/components/PettyCashTopUp";
import { TopUpHistory } from "@/components/TopUpHistory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const [balance, setBalance] = useState(0); // Nilai awal ditukar kepada 0
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Sistem Rekod Ladang</h1>
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