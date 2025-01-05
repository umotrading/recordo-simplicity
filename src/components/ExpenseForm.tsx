import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FormFields } from "./expense/FormFields";
import { ExpenseData, ExpenseFormProps } from "./expense/types";
import { supabase } from "@/integrations/supabase/client";

export type { ExpenseData };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.date || !formData.amount) {
      toast.error("Sila isi semua maklumat yang diperlukan");
      return;
    }

    let receipt_url = null;
    if (formData.receipt) {
      const fileExt = formData.receipt.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('receipts')
        .upload(fileName, formData.receipt);

      if (uploadError) {
        toast.error("Gagal memuat naik resit");
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('receipts')
        .getPublicUrl(fileName);

      receipt_url = publicUrl;
    }

    const submissionData = {
      ...formData,
      purpose: formData.purpose === "other" ? formData.customPurpose || "Lain-lain" : formData.purpose,
      category: formData.category === "other" ? formData.customCategory || "Lain-lain" : formData.category,
      receipt_url,
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
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormFields formData={formData} setFormData={setFormData} />
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