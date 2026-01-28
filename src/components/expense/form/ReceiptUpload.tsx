import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ExpenseData } from "../types";
import { compressImage, formatFileSize, isFileTooLarge } from "@/lib/imageCompression";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

interface ReceiptUploadProps {
  formData: ExpenseData;
  setFormData: (data: ExpenseData) => void;
}

const MAX_FILE_SIZE_MB = 5;

export function ReceiptUpload({ formData, setFormData }: ReceiptUploadProps) {
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [fileInfo, setFileInfo] = useState<{
    originalSize: string;
    compressedSize?: string;
    status: 'idle' | 'compressing' | 'ready' | 'error';
  }>({ originalSize: '', status: 'idle' });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) {
      setFileInfo({ originalSize: '', status: 'idle' });
      setFormData({ ...formData, receipt: undefined });
      return;
    }

    const originalSize = formatFileSize(file.size);
    setFileInfo({ originalSize, status: 'idle' });

    // Check if file is too large
    if (isFileTooLarge(file, MAX_FILE_SIZE_MB)) {
      toast.error(`Fail terlalu besar. Maksimum ${MAX_FILE_SIZE_MB}MB`);
      setFileInfo({ originalSize, status: 'error' });
      e.target.value = '';
      return;
    }

    // Only compress images
    if (file.type.startsWith('image/')) {
      // Check if compression is needed (files > 1MB)
      if (file.size > 1 * 1024 * 1024) {
        setIsCompressing(true);
        setFileInfo({ originalSize, status: 'compressing' });
        setCompressionProgress(30);

        try {
          const compressedFile = await compressImage(file, {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            quality: 0.8,
          });

          setCompressionProgress(100);
          
          const compressedSize = formatFileSize(compressedFile.size);
          setFileInfo({ 
            originalSize, 
            compressedSize, 
            status: 'ready' 
          });
          
          setFormData({ ...formData, receipt: compressedFile });
          
          if (compressedFile.size < file.size) {
            toast.success(`Gambar dikecilkan: ${originalSize} → ${compressedSize}`);
          }
        } catch (error) {
          console.error('Compression error:', error);
          toast.error('Gagal memampatkan gambar. Menggunakan fail asal.');
          setFileInfo({ originalSize, status: 'ready' });
          setFormData({ ...formData, receipt: file });
        } finally {
          setIsCompressing(false);
          setCompressionProgress(0);
        }
      } else {
        // Small image, no compression needed
        setFileInfo({ originalSize, status: 'ready' });
        setFormData({ ...formData, receipt: file });
      }
    } else {
      // Non-image files (PDF, etc.)
      setFileInfo({ originalSize, status: 'ready' });
      setFormData({ ...formData, receipt: file });
    }
  };

  return (
    <div className="space-y-2 md:col-span-2">
      <Label htmlFor="receipt">Muat Naik Resit</Label>
      <Input
        id="receipt"
        type="file"
        accept="image/*,.pdf"
        onChange={handleFileChange}
        className="cursor-pointer w-full"
        disabled={isCompressing}
      />
      
      {/* Compression progress */}
      {isCompressing && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Memampatkan gambar...</span>
          </div>
          <Progress value={compressionProgress} className="h-2" />
        </div>
      )}

      {/* File info */}
      {fileInfo.status !== 'idle' && !isCompressing && (
        <div className="flex items-center gap-2 text-sm">
          {fileInfo.status === 'ready' && (
            <>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-muted-foreground">
                {fileInfo.compressedSize 
                  ? `${fileInfo.originalSize} → ${fileInfo.compressedSize}`
                  : fileInfo.originalSize
                }
              </span>
            </>
          )}
          {fileInfo.status === 'error' && (
            <>
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-destructive">
                Fail terlalu besar ({fileInfo.originalSize})
              </span>
            </>
          )}
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        Sila muat naik resit atau bukti pembayaran (Gambar atau PDF). Maks {MAX_FILE_SIZE_MB}MB.
      </p>
    </div>
  );
}
