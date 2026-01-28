

# Pelan Pembaikan Upload Resit ke Google Drive

## Ringkasan Masalah

Upload resit kerap gagal kerana beberapa isu teknikal dalam edge functions:

1. **Path structure salah** - Fungsi `sync-all-to-drive` tidak mengendalikan subfolder dengan betul
2. **Tiada timeout handling** - Fail besar boleh menyebabkan timeout
3. **Tiada retry mechanism** - Jika gagal, tiada percubaan semula automatik
4. **Tiada progress feedback** - Pengguna tidak tahu status upload

---

## Langkah Pembaikan

### Langkah 1: Perbaiki fungsi `upload-to-drive`

**Fail:** `supabase/functions/upload-to-drive/index.ts`

Penambahbaikan:
- Tambah logging yang lebih baik untuk debug
- Tambah timeout handling untuk fail besar
- Perbaiki CORS headers yang lengkap
- Tambah retry logic untuk API Google Drive

### Langkah 2: Perbaiki fungsi `sync-all-to-drive`

**Fail:** `supabase/functions/sync-all-to-drive/index.ts`

Penambahbaikan:
- Perbaiki cara list files supaya termasuk subfolder (gunakan recursive listing)
- Gunakan `supabase.storage.from('receipts').list(folderId)` untuk setiap user folder
- Tambah batch processing untuk mengelakkan timeout
- Tambah retry logic

### Langkah 3: Tambah pengesahan saiz fail di frontend

**Fail:** `src/components/expense/form/ReceiptUpload.tsx`

Penambahbaikan:
- Tambah pengesahan saiz fail maksimum (contoh: 5MB)
- Tambah automatic image compression sebelum upload
- Tunjukkan progress upload kepada pengguna

### Langkah 4: Tambah image compression di frontend

**Fail:** `src/components/ExpenseForm.tsx`

Penambahbaikan:
- Compress gambar sebelum upload ke Supabase Storage
- Kurangkan saiz fail secara automatik untuk mengelakkan timeout

---

## Butiran Teknikal

### A. Perbaikan `sync-all-to-drive` (Langkah 2)

```text
Masalah semasa:
- list() hanya dapat fail di root, bukan dalam subfolder
- Setiap user mempunyai folder sendiri: {user_id}/

Penyelesaian:
1. List semua folder di root (ini adalah user_id)
2. Untuk setiap folder, list semua fail di dalamnya
3. Proses setiap fail dengan path yang betul
```

### B. Image Compression (Langkah 3-4)

```text
Implementasi:
- Gunakan Canvas API untuk compress gambar
- Target: < 1MB atau 80% quality
- Hanya compress jika saiz > 1MB
- Kekalkan format asal (JPEG/PNG)
```

### C. Retry Logic

```text
Implementasi:
- Maximum 3 percubaan
- Exponential backoff (1s, 2s, 4s)
- Log setiap percubaan untuk debug
```

---

## Fail yang Akan Diubah

| Fail | Jenis Perubahan |
|------|-----------------|
| `supabase/functions/upload-to-drive/index.ts` | Tambah retry, logging, CORS fix |
| `supabase/functions/sync-all-to-drive/index.ts` | Perbaiki recursive listing, tambah retry |
| `src/components/expense/form/ReceiptUpload.tsx` | Tambah validasi saiz, UI feedback |
| `src/components/ExpenseForm.tsx` | Tambah image compression |
| `src/lib/imageCompression.ts` | **Fail baru** - utility untuk compress gambar |

---

## Hasil Jangkaan

Selepas pembaikan:
- Upload resit akan lebih stabil dan jarang gagal
- Gambar besar akan di-compress secara automatik
- Pengguna akan dapat melihat progress dan status upload
- Jika gagal, sistem akan cuba semula secara automatik

