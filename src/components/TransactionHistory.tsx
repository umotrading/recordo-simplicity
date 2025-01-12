import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpenseData } from "./ExpenseForm";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormFields } from "./expense/FormFields";

interface TransactionHistoryProps {
  transactions: ExpenseData[];
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<ExpenseData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = (transaction: ExpenseData) => {
    setEditingTransaction(transaction);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (transaction: ExpenseData) => {
    if (!window.confirm("Adakah anda pasti untuk memadam rekod ini?")) {
      return;
    }

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("invoice_no", transaction.invoiceNo);

      if (error) throw error;

      toast.success("Rekod berjaya dipadam");
      // Refresh the page to update the list
      window.location.reload();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error("Ralat semasa memadam rekod");
    } finally {
      setIsDeleting(false);
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
      // Refresh the page to update the list
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
              <div
                key={index}
                className="flex flex-col p-4 bg-secondary rounded-lg space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-lg">{transaction.vendor || "Tiada Vendor"}</p>
                    <p className="text-sm text-gray-500">Direkod oleh: {transaction.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">RM {transaction.amount.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">
                      {transaction.paymentMethod === 'cash' ? 'Tunai' : 
                        transaction.paymentMethod === 'transfer' ? 'Pemindahan Bank' : 'Kad Kredit/Debit'}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500">Tarikh:</p>
                    <p>{transaction.date}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">No. Invoice:</p>
                    <p>{transaction.invoiceNo || "Tiada"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Tujuan:</p>
                    <p>{transaction.purpose === 'farm_goods' ? 'Belian Barang Ladang' :
                        transaction.purpose === 'pesticides' ? 'Belian Racun' :
                        transaction.purpose === 'fertilizer' ? 'Belian Baja' :
                        transaction.purpose === 'wages' ? 'Upah Pekerja' :
                        transaction.purpose === 'machinery' ? 'Sewa Jentera/Lori' :
                        transaction.purpose === 'transport' ? 'Transport' :
                        transaction.customPurpose || 'Lain-lain'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Kategori:</p>
                    <p>{transaction.category === 'durian' ? 'Projek Durian' :
                        transaction.category === 'pumpkin' ? 'Projek Labu' :
                        transaction.category === 'office' ? 'Pengurusan Pejabat' :
                        transaction.category === 'farm' ? 'Pengurusan Ladang' :
                        transaction.customCategory || 'Lain-lain'}</p>
                  </div>
                </div>

                {transaction.receipt_url && (
                  <a 
                    href={transaction.receipt_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 mt-2"
                  >
                    <ExternalLink size={16} />
                    Lihat Resit
                  </a>
                )}

                <div className="flex justify-end gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(transaction)}
                    className="flex items-center gap-1"
                  >
                    <Pencil size={16} />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(transaction)}
                    disabled={isDeleting}
                    className="flex items-center gap-1"
                  >
                    <Trash2 size={16} />
                    Padam
                  </Button>
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <p className="text-center text-gray-500">Tiada transaksi</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Kemaskini Rekod</DialogTitle>
          </DialogHeader>
          {editingTransaction && (
            <FormFields
              formData={editingTransaction}
              setFormData={(data) => setEditingTransaction(data)}
            />
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={() => editingTransaction && handleUpdate(editingTransaction)}>
              Simpan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}