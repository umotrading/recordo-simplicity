import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpenseData } from "./ExpenseForm";

interface DailySummaryProps {
  transactions: ExpenseData[];
  balance: number;
}

export function DailySummary({ transactions, balance }: DailySummaryProps) {
  const todayExpenses = transactions
    .filter(
      (t) => new Date(t.date).toDateString() === new Date().toDateString()
    )
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ringkasan Hari Ini</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Perbelanjaan Hari Ini</p>
            <p className="text-xl font-bold">
              RM {todayExpenses.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Baki Semasa</p>
            <p className="text-xl font-bold">RM {balance.toFixed(2)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}