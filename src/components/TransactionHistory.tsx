import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpenseData } from "./ExpenseForm";

interface TransactionHistoryProps {
  transactions: ExpenseData[];
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaksi Terkini</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-4 bg-secondary rounded-lg"
            >
              <div>
                <p className="font-medium">{transaction.vendor}</p>
                <p className="text-sm text-gray-500">{transaction.date}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">RM {transaction.amount.toFixed(2)}</p>
                <p className="text-sm text-gray-500">{transaction.category}</p>
              </div>
            </div>
          ))}
          {transactions.length === 0 && (
            <p className="text-center text-gray-500">Tiada transaksi</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}