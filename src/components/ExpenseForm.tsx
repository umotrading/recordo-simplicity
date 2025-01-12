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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.date || !formData.amount) {
      toast.error("Sila isi semua maklumat yang diperlukan");
      return;
    }

    setIsSubmitting(true);
    try {
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

        // Upload to Google Drive
        try {
          const response = await supabase.functions.invoke('upload-to-drive', {
            body: { fileUrl: publicUrl },
          });

          if (response.error) {
            console.error('Error uploading to Google Drive:', response.error);
            toast.error("Gagal memuat naik ke Google Drive");
          } else {
            console.log('Successfully uploaded to Google Drive:', response.data);
            toast.success("Resit berjaya dimuat naik ke Google Drive");
          }
        } catch (error) {
          console.error('Error calling upload-to-drive function:', error);
          toast.error("Ralat semasa memuat naik ke Google Drive");
        }
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
    } catch (error) {
      console.error('Error in form submission:', error);
      toast.error("Ralat semasa menyimpan rekod");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSyncAllToGDrive = async () => {
    setIsSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-all-to-drive');
      
      if (error) {
        console.error('Error syncing files:', error);
        toast.error("Ralat semasa memuat naik fail ke Google Drive");
        return;
      }

      if (data.results) {
        const successCount = data.results.filter((r: any) => r.status === 'success').length;
        const errorCount = data.results.filter((r: any) => r.status === 'error').length;
        
        if (successCount > 0) {
          toast.success(`${successCount} fail berjaya dimuat naik ke Google Drive`);
        }
        if (errorCount > 0) {
          toast.error(`${errorCount} fail gagal dimuat naik`);
        }
      }
    } catch (error) {
      console.error('Error calling sync-all-to-drive function:', error);
      toast.error("Ralat semasa memuat naik ke Google Drive");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormFields formData={formData} setFormData={setFormData} />
      <div className="flex justify-between items-center space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleSyncAllToGDrive}
          disabled={isSyncing}
        >
          {isSyncing ? "Sedang memuat naik..." : "Muat Naik Semua Resit ke Google Drive"}
        </Button>
        <Button
          type="submit"
          className="bg-primary hover:bg-primary-hover text-primary-foreground"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Sedang dihantar..." : "Hantar"}
        </Button>
      </div>
    </form>
  );
}