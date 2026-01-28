/**
 * Image compression utility using Canvas API
 * Compresses images to reduce file size before upload
 */

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  quality?: number;
}

const defaultOptions: CompressionOptions = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  quality: 0.8,
};

/**
 * Compress an image file using Canvas API
 * @param file - The image file to compress
 * @param options - Compression options
 * @returns Promise<File> - The compressed file
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const opts = { ...defaultOptions, ...options };
  
  // Skip compression for non-image files
  if (!file.type.startsWith('image/')) {
    console.log('Skipping compression for non-image file:', file.type);
    return file;
  }

  // Skip compression for small files (< 1MB by default)
  const maxSizeBytes = (opts.maxSizeMB || 1) * 1024 * 1024;
  if (file.size <= maxSizeBytes) {
    console.log('File already small enough:', formatFileSize(file.size));
    return file;
  }

  console.log('Starting compression. Original size:', formatFileSize(file.size));

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const img = new Image();
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          // Calculate new dimensions while maintaining aspect ratio
          let { width, height } = img;
          const maxDimension = opts.maxWidthOrHeight || 1920;
          
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;

          // Draw image on canvas
          ctx.drawImage(img, 0, 0, width, height);

          // Determine output format
          const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
          const quality = opts.quality || 0.8;

          // Convert to blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }

              // Create new file with same name
              const compressedFile = new File([blob], file.name, {
                type: outputType,
                lastModified: Date.now(),
              });

              console.log('Compression complete. New size:', formatFileSize(compressedFile.size));
              console.log('Compression ratio:', Math.round((1 - compressedFile.size / file.size) * 100) + '%');

              resolve(compressedFile);
            },
            outputType,
            quality
          );
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Check if file size exceeds maximum
 */
export function isFileTooLarge(file: File, maxSizeMB: number = 5): boolean {
  return file.size > maxSizeMB * 1024 * 1024;
}
