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

interface PurposeFieldProps {
  formData: ExpenseData;
  setFormData: (data: ExpenseData) => void;
}

export function PurposeField({ formData, setFormData }: PurposeFieldProps) {
  return (
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
  );
}