import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExpenseData } from "../types";

interface PaymentFieldsProps {
  formData: ExpenseData;
  setFormData: (data: ExpenseData) => void;
}

export function PaymentFields({ formData, setFormData }: PaymentFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="amount">Jumlah (RM)</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          value={formData.amount || ""}
          onChange={(e) =>
            setFormData({ ...formData, amount: parseFloat(e.target.value) })
          }
          placeholder="0.00"
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="paymentMethod">Kaedah Pembayaran</Label>
        <Select
          value={formData.paymentMethod}
          onValueChange={(value) =>
            setFormData({ ...formData, paymentMethod: value })
          }
        >
          <SelectTrigger className="w-full bg-white">
            <SelectValue placeholder="Pilih Kaedah" />
          </SelectTrigger>
          <SelectContent className="bg-white z-50">
            <SelectItem value="cash">Tunai</SelectItem>
            <SelectItem value="transfer">Pemindahan Bank</SelectItem>
            <SelectItem value="card">Kad Kredit/Debit</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}