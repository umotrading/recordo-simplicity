import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpenseForm } from "@/components/ExpenseForm";
import { ExpenseData } from "@/components/expense/types";

interface ExpenseSectionProps {
  balance: number;
  onSubmit: (data: ExpenseData) => void;
}

export function ExpenseSection({ balance, onSubmit }: ExpenseSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>TAMBAH PERBELANJAAN/TUNTUTAN BARU</CardTitle>
      </CardHeader>
      <CardContent>
        <ExpenseForm currentBalance={balance} onSubmit={onSubmit} />
      </CardContent>
    </Card>
  );
}