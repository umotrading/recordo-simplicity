import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExpenseData } from "../types";

interface ReceiptUploadProps {
  formData: ExpenseData;
  setFormData: (data: ExpenseData) => void;
}

export function ReceiptUpload({ formData, setFormData }: ReceiptUploadProps) {
  return (
    <div className="space-y-2 md:col-span-2">
      <Label htmlFor="receipt">Muat Naik Resit</Label>
      <Input
        id="receipt"
        type="file"
        accept="image/*,.pdf"
        onChange={(e) =>
          setFormData({ ...formData, receipt: e.target.files?.[0] })
        }
        className="cursor-pointer w-full"
      />
      <p className="text-sm text-gray-500">
        Sila muat naik resit atau bukti pembayaran (Gambar atau PDF)
      </p>
    </div>
  );
}