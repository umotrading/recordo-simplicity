import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BalanceDisplayProps {
  balance: number;
}

export function BalanceDisplay({ balance }: BalanceDisplayProps) {
  return (
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
  );
}