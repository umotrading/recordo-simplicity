import { Leaf } from "lucide-react";
import { BalanceDisplay } from "@/components/BalanceDisplay";

interface DashboardHeaderProps {
  balance: number;
}

export function DashboardHeader({ balance }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-2">
        <Leaf className="w-6 h-6 text-green-600" />
        <h1 className="text-2xl font-bold text-gray-800">Rekod Ladang GMP</h1>
      </div>
      <BalanceDisplay balance={balance} />
    </div>
  );
}