import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpenseData } from "./ExpenseForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TransactionItem } from "./transaction/TransactionItem";
import { EditDialog } from "./transaction/EditDialog";
import { DeleteDialog } from "./transaction/DeleteDialog";

interface TransactionHistoryProps {
  transactions: ExpenseData[];
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<ExpenseData | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<ExpenseData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = (transaction: ExpenseData) => {
    setEditingTransaction(transaction);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (transaction: ExpenseData) => {
    setDeletingTransaction(transaction);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingTransaction) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("invoice_no", deletingTransaction.invoiceNo);

      if (error) throw error;

      toast.success("Rekod berjaya dipadam");
      window.location.reload();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error("Ralat semasa memadam rekod");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setDeletingTransaction(null);
    }
  };

  const handleUpdate = async (updatedData: ExpenseData) => {
    try {
      const { error } = await supabase
        .from("expenses")
        .update({
          name: updatedData.name,
          date: updatedData.date,
          invoice_no: updatedData.invoiceNo,
          vendor: updatedData.vendor,
          purpose: updatedData.purpose === "other" ? updatedData.customPurpose : updatedData.purpose,
          category: updatedData.category === "other" ? updatedData.customCategory : updatedData.category,
          amount: updatedData.amount,
          payment_method: updatedData.paymentMethod,
        })
        .eq("invoice_no", editingTransaction?.invoiceNo);

      if (error) throw error;

      toast.success("Rekod berjaya dikemaskini");
      setIsEditDialogOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("Error updating transaction:", error);
      toast.error("Ralat semasa mengemaskini rekod");
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Transaksi Terkini</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((transaction, index) => (
              <TransactionItem
                key={index}
                transaction={transaction}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
              />
            ))}
            {transactions.length === 0 && (
              <p className="text-center text-gray-500">Tiada transaksi</p>
            )}
          </div>
        </CardContent>
      </Card>

      <EditDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        transaction={editingTransaction}
        onUpdate={handleUpdate}
        setTransaction={setEditingTransaction}
      />

      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDelete={handleDelete}
        isDeleting={isDeleting}
      />
    </>
  );
}