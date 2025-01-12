import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

interface DeleteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => Promise<void>;
  isDeleting: boolean;
}

export function DeleteDialog({ 
  isOpen, 
  onOpenChange, 
  onDelete, 
  isDeleting 
}: DeleteDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Padam Rekod</DialogTitle>
          <DialogDescription>
            Adakah anda pasti untuk memadam rekod ini? Tindakan ini tidak boleh dibatalkan.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button variant="destructive" onClick={onDelete} disabled={isDeleting}>
            Padam
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}