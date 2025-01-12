import { TopUpHistory } from "@/components/TopUpHistory";
import { TransactionHistory } from "@/components/TransactionHistory";
import { ExpenseData } from "@/components/expense/types";

interface HistorySectionProps {
  topUps: any[];
  transactions: ExpenseData[];
}

export function HistorySection({ topUps, transactions }: HistorySectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <TopUpHistory topUps={topUps} />
      <TransactionHistory transactions={transactions} />
    </div>
  );
}