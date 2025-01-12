import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExpenseData } from "../types";

interface BasicInfoFieldsProps {
  formData: ExpenseData;
  setFormData: (data: ExpenseData) => void;
}

export function BasicInfoFields({ formData, setFormData }: BasicInfoFieldsProps) {
  return (
    <>
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
    </>
  );
}