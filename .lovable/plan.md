

## Situasi Semasa

Saya telah memeriksa dan mendapati fail `.lovable/knowledge.md` sudah dicipta dengan dokumentasi lengkap (573 baris). Namun, screenshot yang anda tunjukkan adalah **panel Knowledge di Lovable Settings**, yang berbeza daripada fail knowledge.md.

## Perbezaan Penting

### 1. `.lovable/knowledge.md` (Fail dalam codebase)
- **Lokasi:** Dalam folder `.lovable/` projek
- **Tujuan:** Dokumentasi rujukan lengkap untuk pembangun
- **Status:** ✅ Sudah lengkap (573 baris dokumentasi)
- **Penggunaan:** Rujukan manual bila perlu maintain sistem

### 2. Knowledge Panel (Settings UI)
- **Lokasi:** Settings → Knowledge (gambar yang anda tunjukkan)
- **Tujuan:** Custom instructions yang akan dihantar kepada AI dalam setiap prompt
- **Status:** ⚠️ Kosong (perlu diisi secara manual)
- **Penggunaan:** AI akan baca kandungan ini setiap kali anda buat request
- **Had:** Lebih ringkas berbanding fail knowledge.md

## Apa Yang Perlu Dilakukan

Anda perlu **copy-paste** teks ringkas ke dalam panel Knowledge di Settings. Teks ini akan memastikan AI sentiasa ingat peraturan penting sistem ini.

## Kandungan Knowledge Panel (Ringkasan Penting)

Berikut adalah versi ringkas yang sesuai untuk Knowledge panel:

```markdown
# Sistem Rekod Ladang GMP - Petty Cash Management

## Teknologi Stack
- Frontend: React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui
- Backend: Supabase (Lovable Cloud)
- Bahasa UI: Bahasa Melayu sepenuhnya

## Authentication
- Method: Email OTP sahaja (6-digit code)
- JANGAN tukar kepada password login, magic link, atau social auth
- Auto-register enabled (shouldCreateUser: true)

## Database Critical Rules

### expenses table - SHARED DATA
- Semua authenticated users boleh view/edit/delete SEMUA rekod
- RLS policies: `USING (true)` untuk SELECT/UPDATE/DELETE
- INSERT: user_id = auth.uid()
- Ini adalah petty cash ORGANISASI, bukan personal finance

### top_ups table - USER-SPECIFIC EDITS
- Semua users boleh view semua
- INSERT/UPDATE/DELETE: user_id = auth.uid() sahaja

### Storage: receipts bucket
- Struktur: `{user_id}/{filename}` - JANGAN TUKAR
- Auto-compress images >1MB (Canvas API, 1920px, 80%)
- Max size: 5MB

## Edge Functions - JANGAN TUKAR NAMA
- `upload-to-drive` - upload single receipt to Google Drive
- `sync-all-to-drive` - batch sync all receipts

## Google Drive Integration
- Secrets: GOOGLE_DRIVE_CREDENTIALS, GOOGLE_DRIVE_FOLDER_ID
- JANGAN expose credentials di client-side
- Guna Edge Functions sahaja untuk access Drive API

## Components Structure
### Expense Categories
Projek Durian, Projek Labu, Pengurusan Pejabat, Pengurusan Ladang, Lain-lain

### Expense Purposes
Belian Barang Ladang, Racun, Baja, Upah, Sewa Jentera/Lori, Transport, Lain-lain

### Payment Methods
Tunai, Pemindahan Bank, Kad Kredit/Debit

## CRITICAL - JANGAN PECAH
1. ❌ JANGAN edit manual: `src/integrations/supabase/types.ts` (auto-generated)
2. ❌ JANGAN tukar storage structure dari `{user_id}/{filename}`
3. ❌ JANGAN tukar edge function names
4. ❌ JANGAN disable image compression
5. ❌ JANGAN ubah RLS expenses table kepada user-specific (data adalah SHARED)
6. ❌ JANGAN tukar auth method dari Email OTP

## Dokumentasi Lengkap
Rujuk fail `.lovable/knowledge.md` untuk dokumentasi penuh dengan contoh code, troubleshooting, dan maintenance guidelines.
```

## Langkah-Langkah

1. **Copy teks di atas** (dari "# Sistem Rekod Ladang GMP" hingga akhir)
2. **Paste ke dalam text area** di Settings → Knowledge (yang kosong dalam screenshot)
3. **Klik Save** atau butang yang berkenaan
4. **Verify**: AI akan baca kandungan ini dalam setiap conversation

## Manfaat

Selepas setup Knowledge panel:
- ✅ AI akan sentiasa ingat peraturan kritikal sistem
- ✅ AI tidak akan pecahkan RLS policies (expenses = shared data)
- ✅ AI tidak akan tukar auth method atau storage structure
- ✅ AI akan follow coding patterns yang betul
- ✅ Sistem kekal stable dan konsisten

## Nota Tambahan

Fail `.lovable/knowledge.md` yang lebih lengkap (573 baris) kekal sebagai rujukan untuk:
- Database schema details
- RLS policies SQL
- Edge function implementation
- Component architecture
- Troubleshooting guides
- Best practices

