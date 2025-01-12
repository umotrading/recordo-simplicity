import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PettyCashTopUp } from "@/components/PettyCashTopUp";

interface TopUpSectionProps {
  onTopUp: (amount: number, date: string) => void;
}

export function TopUpSection({ onTopUp }: TopUpSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tambah Baki Petty Cash</CardTitle>
      </CardHeader>
      <CardContent>
        <PettyCashTopUp onTopUp={onTopUp} />
      </CardContent>
    </Card>
  );
}