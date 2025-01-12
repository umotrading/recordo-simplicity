import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { FormFields } from "../expense/FormFields";
import { ExpenseData } from "../ExpenseForm";

interface EditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: ExpenseData | null;
  onUpdate: (data: ExpenseData) => void;
  setTransaction: (data: ExpenseData | null) => void;
}

export function EditDialog({ 
  isOpen, 
  onOpenChange, 
  transaction, 
  onUpdate, 
  setTransaction 
}: EditDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Kemaskini Rekod</DialogTitle>
        </DialogHeader>
        {transaction && (
          <FormFields
            formData={transaction}
            setFormData={(data) => setTransaction(data)}
          />
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={() => transaction && onUpdate(transaction)}>
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}