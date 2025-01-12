import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExpenseData } from "./types";

interface FormFieldsProps {
  formData: ExpenseData;
  setFormData: (data: ExpenseData) => void;
}

export function FormFields({ formData, setFormData }: FormFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl mx-auto">
      <div className="space-y-2">
        <Label htmlFor="name">Nama Perekod</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) =>
            setFormData({ ...formData, name: e.target.value })
          }
          placeholder="Nama anda"
          className="w-full"
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
          className="w-full"
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
          className="w-full"
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
          className="w-full"
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
            <SelectItem value="farm_goods">Belian Barang Ladang</SelectItem>
            <SelectItem value="pesticides">Belian Racun</SelectItem>
            <SelectItem value="fertilizer">Belian Baja</SelectItem>
            <SelectItem value="wages">Upah Pekerja</SelectItem>
            <SelectItem value="machinery">Sewa Jentera/Lori</SelectItem>
            <SelectItem value="transport">Transport</SelectItem>
            <SelectItem value="other">Lain-lain</SelectItem>
          </SelectContent>
        </Select>
        {formData.purpose === "other" && (
          <Input
            className="mt-2 w-full"
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
            <SelectItem value="durian">Projek Durian</SelectItem>
            <SelectItem value="pumpkin">Projek Labu</SelectItem>
            <SelectItem value="office">Pengurusan Pejabat</SelectItem>
            <SelectItem value="farm">Pengurusan Ladang</SelectItem>
            <SelectItem value="other">Lain-lain</SelectItem>
          </SelectContent>
        </Select>
        {formData.category === "other" && (
          <Input
            className="mt-2 w-full"
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
    </div>
  );
}