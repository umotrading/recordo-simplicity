import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FormFields } from "./expense/FormFields";
import { ExpenseData, ExpenseFormProps } from "./expense/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { compressImage } from "@/lib/imageCompression";

export type { ExpenseData };

export function ExpenseForm({ currentBalance, onSubmit }: ExpenseFormProps) {
  const { user } = useAuth();
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
      let drive_url = null;
      
      if (formData.receipt && user) {
        let fileToUpload = formData.receipt;
        
        // Compress image if it's larger than 1MB
        if (formData.receipt.type.startsWith('image/') && formData.receipt.size > 1024 * 1024) {
          try {
            console.log('Compressing image before upload...');
            fileToUpload = await compressImage(formData.receipt, {
              maxSizeMB: 1,
              maxWidthOrHeight: 1920,
              quality: 0.8,
            });
            console.log('Compression complete:', fileToUpload.size, 'bytes');
          } catch (compressError) {
            console.error('Compression failed, using original:', compressError);
            // Continue with original file if compression fails
          }
        }
        
        const fileExt = fileToUpload.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;
        
        toast.info("Memuat naik resit...");
        
        const { error: uploadError, data } = await supabase.storage
          .from('receipts')
          .upload(filePath, fileToUpload);

        if (uploadError) {
          console.error('Storage upload error:', uploadError);
          toast.error("Gagal memuat naik resit ke storage");
          return;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('receipts')
          .getPublicUrl(filePath);

        receipt_url = publicUrl;

        // Upload to Google Drive with retry
        toast.info("Memuat naik ke Google Drive...");
        
        let retries = 0;
        const maxRetries = 3;
        let uploadSuccess = false;
        
        while (retries < maxRetries && !uploadSuccess) {
          try {
            const response = await supabase.functions.invoke('upload-to-drive', {
              body: { fileUrl: publicUrl },
            });

            if (response.error) {
              console.error(`Google Drive upload attempt ${retries + 1} failed:`, response.error);
              retries++;
              if (retries < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 1000 * retries));
              }
            } else {
              console.log('Successfully uploaded to Google Drive:', response.data);
              drive_url = response.data.webViewLink;
              toast.success("Resit berjaya dimuat naik ke Google Drive");
              uploadSuccess = true;
            }
          } catch (error) {
            console.error(`Google Drive upload attempt ${retries + 1} error:`, error);
            retries++;
            if (retries < maxRetries) {
              await new Promise(resolve => setTimeout(resolve, 1000 * retries));
            }
          }
        }
        
        if (!uploadSuccess) {
          toast.warning("Gagal memuat naik ke Google Drive. Resit disimpan di storage.");
        }
      }

      const submissionData = {
        ...formData,
        purpose: formData.purpose === "other" ? formData.customPurpose || "Lain-lain" : formData.purpose,
        category: formData.category === "other" ? formData.customCategory || "Lain-lain" : formData.category,
        receipt_url: drive_url || receipt_url, // Prioritize Google Drive URL
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
      <div className="flex flex-col space-y-3">
        <Button
          type="submit"
          className="bg-primary hover:bg-primary-hover text-primary-foreground h-12 text-lg font-medium w-full sm:w-auto"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Sedang dihantar..." : "Hantar"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleSyncAllToGDrive}
          disabled={isSyncing}
          className="text-sm"
        >
          {isSyncing ? "Sedang memuat naik..." : "Muat Naik Semua Resit ke Google Drive"}
        </Button>
      </div>
    </form>
  );
}