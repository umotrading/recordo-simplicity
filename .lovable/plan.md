
## Tujuan
Cipta fail dokumentasi knowledge yang lengkap di `.lovable/knowledge.md` yang merangkumi semua aspek sistem untuk memastikan kestabilan jangka panjang dan memudahkan penyelenggaraan.

## Apa Yang Akan Didokumentasikan

### 1. Gambaran Keseluruhan Sistem
- Nama: Sistem Rekod Ladang GMP
- Fungsi: Pengurusan petty cash organisasi (dikongsi semua kakitangan)
- Tech Stack: React + Vite + TypeScript + Supabase + Tailwind CSS
- Bahasa UI: Bahasa Melayu sepenuhnya

### 2. Pengesahan (Auth)
- Method: Email OTP (tanpa kata laluan)
- Flow: Email → Kod 6 digit → Masuk
- Auto-register pengguna baru (shouldCreateUser: true)
- OTP sah 5 minit, countdown resend 60 saat
- Supabase Magic Link template dikemaskini dengan HTML tersuai ({{ .Token }})

### 3. Struktur Database
Jadual utama:
- `expenses` - rekod perbelanjaan (dikongsi semua user, boleh lihat/edit/padam semua)
- `top_ups` - penambahan baki (user boleh lihat semua, edit/padam rekod sendiri)
- `agents`, `agent_records`, `agent_items`, `agent_categories`, `item_types` - modul agensi (user-specific)

### 4. RLS Policies Penting
- expenses: semua authenticated user boleh SELECT/UPDATE/DELETE; INSERT hanya user_id sendiri
- top_ups: semua user boleh SELECT; INSERT/UPDATE/DELETE user_id sendiri sahaja
- agents/agent_records/agent_items: semua operasi user_id sendiri sahaja

### 5. Storage
- Bucket: `receipts` (public)
- Struktur: `{user_id}/{uuid}.{ext}`
- Auto-compress gambar >1MB sebelum upload (Canvas API, max 1920px, 80% quality)
- Max file size: 5MB

### 6. Edge Functions
- `upload-to-drive` - upload 1 resit ke Google Drive (retry 3x, timeout 30s)
- `sync-all-to-drive` - sync semua resit dalam batch (5 serentak), skip jika dah ada
- Kedua-dua guna Google Service Account JWT authentication

### 7. Secrets Supabase
- GOOGLE_DRIVE_CREDENTIALS - JSON Service Account credentials
- GOOGLE_DRIVE_FOLDER_ID - ID folder Google Drive
- SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL, SUPABASE_ANON_KEY (auto)

### 8. Struktur Komponen
- Form perbelanjaan: BasicInfoFields, CategoryField, PurposeField, PaymentFields, ReceiptUpload
- Kategori: Projek Durian, Projek Labu, Pengurusan Pejabat, Pengurusan Ladang, Lain-lain
- Tujuan: Belian Barang Ladang, Racun, Baja, Upah, Sewa Jentera/Lori, Transport, Lain-lain
- Kaedah Bayar: Tunai, Pemindahan Bank, Kad Kredit/Debit

### 9. Export CSV
- Muat turun semua transaksi (perbelanjaan + top-up) dalam format CSV
- Susun mengikut tarikh terbaru dulu

### 10. Peraturan Jangan Pecah
- JANGAN tukar nama edge function (`upload-to-drive`, `sync-all-to-drive`)
- JANGAN tukar struktur folder storage (`{user_id}/{filename}`)
- JANGAN buang RLS pada jadual expenses (data dikongsi, bukan peribadi)
- JANGAN tukar auth method - kekal Email OTP sahaja
- JANGAN edit `src/integrations/supabase/types.ts` secara manual

## Fail Yang Akan Dicipta

| Fail | Penerangan |
|------|-----------|
| `.lovable/knowledge.md` | Dokumen knowledge lengkap sistem |

## Nota Teknikal
Fail knowledge ini akan menjadi rujukan untuk semua perubahan masa depan supaya konsistensi sistem terjaga dan tidak berlaku regresi pada ciri-ciri sedia ada.
