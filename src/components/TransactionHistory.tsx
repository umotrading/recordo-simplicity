import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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

  // Group transactions by month and year
  const groupedTransactions = useMemo(() => {
    const groups: { [key: string]: ExpenseData[] } = {};
    
    transactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      const monthYear = date.toLocaleDateString('ms-MY', { 
        year: 'numeric', 
        month: 'long' 
      });
      
      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(transaction);
    });

    // Sort groups by date (newest first) and sort transactions within each group
    const sortedGroups: { [key: string]: ExpenseData[] } = {};
    Object.keys(groups)
      .sort((a, b) => {
        const dateA = new Date(groups[a][0].date);
        const dateB = new Date(groups[b][0].date);
        return dateB.getTime() - dateA.getTime();
      })
      .forEach(key => {
        sortedGroups[key] = groups[key].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      });

    return sortedGroups;
  }, [transactions]);

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

  const getTotalForMonth = (monthTransactions: ExpenseData[]) => {
    return monthTransactions.reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Transaksi Terkini</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(groupedTransactions).length === 0 ? (
            <p className="text-center text-gray-500">Tiada transaksi</p>
          ) : (
            <Accordion type="multiple" className="w-full">
              {Object.entries(groupedTransactions).map(([monthYear, monthTransactions]) => (
                <AccordionItem key={monthYear} value={monthYear} className="border rounded-lg mb-2">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <div className="flex justify-between items-center w-full mr-4">
                      <span className="font-medium text-left">{monthYear}</span>
                      <div className="text-right">
                        <span className="text-sm text-gray-600">
                          {monthTransactions.length} transaksi
                        </span>
                        <div className="text-sm font-medium text-red-600">
                          RM {getTotalForMonth(monthTransactions).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-3">
                      {monthTransactions.map((transaction, index) => (
                        <TransactionItem
                          key={`${monthYear}-${index}`}
                          transaction={transaction}
                          onEdit={handleEdit}
                          onDelete={handleDeleteClick}
                        />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
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