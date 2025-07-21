import { TopUpHistory } from "@/components/TopUpHistory";
import { TransactionHistory } from "@/components/TransactionHistory";
import { ExpenseData } from "@/components/expense/types";

interface HistorySectionProps {
  topUps: any[];
  transactions: ExpenseData[];
  onDeleteTopUp: (topUpId: string) => void;
}

export function HistorySection({ topUps, transactions, onDeleteTopUp }: HistorySectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <TopUpHistory topUps={topUps} onDelete={onDeleteTopUp} />
      <TransactionHistory transactions={transactions} />
    </div>
  );
}