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

interface CategoryFieldProps {
  formData: ExpenseData;
  setFormData: (data: ExpenseData) => void;
}

export function CategoryField({ formData, setFormData }: CategoryFieldProps) {
  return (
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
  );
}