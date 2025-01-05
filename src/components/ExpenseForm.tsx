import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface ExpenseFormProps {
  currentBalance: number;
  onSubmit: (data: ExpenseData) => void;
}

export interface ExpenseData {
  name: string;
  date: string;
  invoiceNo: string;
  vendor: string;
  purpose: string;
  customPurpose?: string;
  category: string;
  customCategory?: string;
  amount: number;
  paymentMethod: string;
}

export function ExpenseForm({ currentBalance, onSubmit }: ExpenseFormProps) {
  const [formData, setFormData] = useState<ExpenseData>({
    name: "",
    date: "",
    invoiceNo: "",
    vendor: "",
    purpose: "",
    category: "",
    amount: 0,
    paymentMethod: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.date || !formData.amount) {
      toast.error("Sila isi semua maklumat yang diperlukan");
      return;
    }

    // Gunakan nilai custom jika "other" dipilih
    const submissionData = {
      ...formData,
      purpose: formData.purpose === "other" ? formData.customPurpose || "Lain-lain" : formData.purpose,
      category: formData.category === "other" ? formData.customCategory || "Lain-lain" : formData.category,
    };

    onSubmit(submissionData);
    setFormData({
      name: "",
      date: "",
      invoiceNo: "",
      vendor: "",
      purpose: "",
      category: "",
      amount: 0,
      paymentMethod: "",
    });
    toast.success("Rekod berjaya disimpan");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nama Perekod</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            placeholder="Nama anda"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Tarikh Invoice</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) =>
              setFormData({ ...formData, date: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="invoiceNo">No. Invoice/Resit</Label>
          <Input
            id="invoiceNo"
            value={formData.invoiceNo}
            onChange={(e) =>
              setFormData({ ...formData, invoiceNo: e.target.value })
            }
            placeholder="No. Invoice/Resit"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="vendor">Nama Kedai/Pembekal</Label>
          <Input
            id="vendor"
            value={formData.vendor}
            onChange={(e) =>
              setFormData({ ...formData, vendor: e.target.value })
            }
            placeholder="Nama kedai atau pembekal"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="purpose">Tujuan</Label>
          <Select
            value={formData.purpose}
            onValueChange={(value) =>
              setFormData({ ...formData, purpose: value, customPurpose: "" })
            }
          >
            <SelectTrigger className="w-full bg-white">
              <SelectValue placeholder="Pilih Tujuan" />
            </SelectTrigger>
            <SelectContent className="bg-white z-50">
              <SelectItem value="office">Keperluan Pejabat</SelectItem>
              <SelectItem value="travel">Perjalanan</SelectItem>
              <SelectItem value="meals">Makan Minum</SelectItem>
              <SelectItem value="other">Lain-lain</SelectItem>
            </SelectContent>
          </Select>
          {formData.purpose === "other" && (
            <Input
              className="mt-2"
              placeholder="Nyatakan tujuan lain"
              value={formData.customPurpose || ""}
              onChange={(e) =>
                setFormData({ ...formData, customPurpose: e.target.value })
              }
            />
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Kategori Perbelanjaan</Label>
          <Select
            value={formData.category}
            onValueChange={(value) =>
              setFormData({ ...formData, category: value, customCategory: "" })
            }
          >
            <SelectTrigger className="w-full bg-white">
              <SelectValue placeholder="Pilih Kategori" />
            </SelectTrigger>
            <SelectContent className="bg-white z-50">
              <SelectItem value="supplies">Alat Tulis</SelectItem>
              <SelectItem value="equipment">Peralatan</SelectItem>
              <SelectItem value="transport">Pengangkutan</SelectItem>
              <SelectItem value="food">Makanan</SelectItem>
              <SelectItem value="other">Lain-lain</SelectItem>
            </SelectContent>
          </Select>
          {formData.category === "other" && (
            <Input
              className="mt-2"
              placeholder="Nyatakan kategori lain"
              value={formData.customCategory || ""}
              onChange={(e) =>
                setFormData({ ...formData, customCategory: e.target.value })
              }
            />
          )}
        </div>

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
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="submit"
          className="bg-primary hover:bg-primary-hover text-primary-foreground"
        >
          Hantar
        </Button>
      </div>
    </form>
  );
}