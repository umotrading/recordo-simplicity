import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface PettyCashTopUpProps {
  onTopUp: (amount: number, date: string) => void;
}

export interface TopUpData {
  amount: number;
  date: string;
}

export function PettyCashTopUp({ onTopUp }: PettyCashTopUpProps) {
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !date) {
      toast.error("Sila isi semua maklumat yang diperlukan");
      return;
    }
    onTopUp(amount, date);
    setAmount(0);
    setDate("");
    toast.success("Baki berjaya ditambah");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="topup-amount">Jumlah Tambahan (RM)</Label>
          <Input
            id="topup-amount"
            type="number"
            step="0.01"
            value={amount || ""}
            onChange={(e) => setAmount(parseFloat(e.target.value))}
            placeholder="0.00"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="topup-date">Tarikh</Label>
          <Input
            id="topup-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" className="bg-primary hover:bg-primary-hover">
          Tambah Baki
        </Button>
      </div>
    </form>
  );
}