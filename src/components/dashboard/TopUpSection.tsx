import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PettyCashTopUp } from "@/components/PettyCashTopUp";

interface TopUpSectionProps {
  onTopUp: (amount: number, date: string, notes: string) => void;
}

export function TopUpSection({ onTopUp }: TopUpSectionProps) {
  return (
    <Card className="bg-[#E5DEFF] border-[#9b87f5]">
      <CardHeader>
        <CardTitle>Tambah Baki Petty Cash</CardTitle>
        <p className="text-sm text-[#222222]">Finance Record</p>
      </CardHeader>
      <CardContent>
        <PettyCashTopUp onTopUp={onTopUp} />
      </CardContent>
    </Card>
  );
}