# Dokumentasi Sistem Rekod Ladang GMP

## 📋 Gambaran Keseluruhan

**Nama Sistem:** Sistem Rekod Ladang GMP  
**Fungsi:** Pengurusan petty cash organisasi yang dikongsi oleh semua kakitangan  
**Bahasa UI:** Bahasa Melayu sepenuhnya  
**Tech Stack:**
- Frontend: React 18 + Vite + TypeScript
- Styling: Tailwind CSS + shadcn/ui
- Backend: Supabase (Database, Auth, Storage, Edge Functions)
- Integrations: Google Drive API (untuk backup resit)

---

## 🔐 Sistem Pengesahan (Authentication)

### Method: Email OTP (Tanpa Kata Laluan)

**Flow Pengesahan:**
1. Pengguna masukkan alamat email
2. Sistem hantar kod 6 digit ke email
3. Pengguna masukkan kod OTP
4. Sistem sahkan dan log masuk

**Konfigurasi:**
- Auto-register: `shouldCreateUser: true` (pengguna baru didaftarkan automatik)
- Tempoh sah OTP: 5 minit
- Countdown resend: 60 saat
- Template email: HTML tersuai dengan pembolehubah `{{ .Token }}`

**Implementasi:**
```typescript
// src/hooks/useAuth.tsx
const sendOtp = async (email: string) => {
  await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true }
  });
};

const verifyOtp = async (email: string, token: string) => {
  await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email'
  });
};
```

**Komponen:**
- `src/pages/Auth.tsx` - Halaman login dengan 2-step flow (email → OTP)
- `src/hooks/useAuth.tsx` - Custom hook untuk auth operations
- `src/components/ProtectedRoute.tsx` - Route guard untuk halaman protected

---

## 🗄️ Struktur Database

### Jadual Utama

#### 1. `expenses` (Rekod Perbelanjaan)
**Akses:** Dikongsi semua user - semua boleh lihat/edit/padam

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | No | Primary key |
| user_id | uuid | Yes | ID pengguna yang buat rekod |
| name | text | No | Nama perbelanjaan |
| date | date | No | Tarikh perbelanjaan |
| invoice_no | text | Yes | Nombor invois |
| vendor | text | Yes | Nama vendor/pembekal |
| purpose | text | No | Tujuan perbelanjaan |
| category | text | No | Kategori perbelanjaan |
| amount | numeric | No | Jumlah wang (RM) |
| payment_method | text | No | Kaedah pembayaran |
| receipt_url | text | Yes | URL resit di storage |
| created_at | timestamp | No | Masa dicipta |

#### 2. `top_ups` (Penambahan Baki)
**Akses:** Semua user boleh lihat; edit/padam hanya rekod sendiri

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | No | Primary key |
| user_id | uuid | Yes | ID pengguna |
| amount | numeric | No | Jumlah tambah (RM) |
| date | date | No | Tarikh top-up |
| notes | text | Yes | Nota tambahan |
| created_at | timestamp | No | Masa dicipta |

#### 3. Modul Agensi (User-Specific)
**Jadual:** `agents`, `agent_records`, `agent_items`, `agent_categories`, `item_types`  
**Akses:** Setiap user hanya boleh akses data sendiri

---

## 🔒 Row-Level Security (RLS) Policies

### Jadual `expenses`
```sql
-- SELECT: Semua authenticated user boleh view semua
CREATE POLICY "All authenticated users can view all expenses"
ON expenses FOR SELECT TO authenticated
USING (true);

-- INSERT: User hanya boleh create rekod dengan user_id sendiri
CREATE POLICY "Users can create their own expenses"
ON expenses FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Semua user boleh update semua rekod (shared data)
CREATE POLICY "Users can update all expenses"
ON expenses FOR UPDATE TO authenticated
USING (true);

-- DELETE: Semua user boleh delete semua rekod (shared data)
CREATE POLICY "Users can delete all expenses"
ON expenses FOR DELETE TO authenticated
USING (true);
```

### Jadual `top_ups`
```sql
-- SELECT: Semua user boleh view semua
CREATE POLICY "All authenticated users can view all top_ups"
ON top_ups FOR SELECT TO authenticated
USING (true);

-- INSERT/UPDATE/DELETE: User hanya boleh manage rekod sendiri
CREATE POLICY "Users can create their own top_ups"
ON top_ups FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own top_ups"
ON top_ups FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own top_ups"
ON top_ups FOR DELETE TO authenticated
USING (auth.uid() = user_id);
```

### Modul Agensi
**Semua operasi (SELECT/INSERT/UPDATE/DELETE) hanya untuk `user_id` sendiri**

---

## 📁 Storage Configuration

### Bucket: `receipts`
- **Visibility:** Public
- **Struktur Folder:** `{user_id}/{filename}`
- **Contoh:** `a1b2c3d4-e5f6-7890-abcd-ef1234567890/receipt_20240115_123456.jpg`
- **Max File Size:** 5MB
- **Format Disokong:** Images (jpg, png, webp, gif), PDF

### Auto-Compression Gambar
**Trigger:** Gambar > 1MB  
**Engine:** Canvas API (browser-native)  
**Settings:**
- Max size: 1MB
- Max dimension: 1920px (width/height)
- Quality: 80%
- Output format: Same as original

**Implementasi:**
```typescript
// src/lib/imageCompression.ts
export async function compressImage(file: File, options: {
  maxSizeMB: number;
  maxWidthOrHeight: number;
  quality: number;
}): Promise<File>
```

**Komponen:**
- `src/components/expense/form/ReceiptUpload.tsx` - Upload dengan progress & compression

---

## ⚡ Edge Functions

### 1. `upload-to-drive`
**Fungsi:** Upload 1 resit ke Google Drive  
**Lokasi:** `supabase/functions/upload-to-drive/index.ts`

**Features:**
- Retry mechanism: 3 attempts dengan exponential backoff (1s, 2s, 4s)
- Timeout: 30 saat untuk download dari storage
- File size limit: 10MB
- OAuth2 JWT authentication dengan Google Service Account

**Input:**
```json
{
  "fileUrl": "https://supabase-storage-url/receipts/user_id/filename.jpg"
}
```

**Output:**
```json
{
  "success": true,
  "fileId": "1a2b3c4d5e6f7g8h9i0j",
  "webViewLink": "https://drive.google.com/file/d/1a2b3c4d5e6f7g8h9i0j/view"
}
```

### 2. `sync-all-to-drive`
**Fungsi:** Sync semua resit ke Google Drive dalam batch  
**Lokasi:** `supabase/functions/sync-all-to-drive/index.ts`

**Features:**
- Batch processing: 5 concurrent uploads
- Skip existing files (check by filename)
- Error handling per-file (continue on error)
- Progress tracking & summary report

**Workflow:**
1. Fetch semua expenses dengan receipt_url dari database
2. List existing files di Google Drive folder
3. Filter out files yang dah ada
4. Upload dalam batch (5 serentak)
5. Return summary (success count, failed items)

---

## 🔑 Supabase Secrets

### Required Secrets

| Secret Name | Description | Format |
|-------------|-------------|--------|
| `GOOGLE_DRIVE_CREDENTIALS` | Service Account JSON credentials | JSON string |
| `GOOGLE_DRIVE_FOLDER_ID` | Target folder ID di Google Drive | String (28 chars) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase admin key (auto) | String |
| `SUPABASE_URL` | Supabase project URL (auto) | URL |
| `SUPABASE_ANON_KEY` | Supabase anon key (auto) | String |

### Cara Setup Google Drive Integration

1. **Buat Service Account di Google Cloud Console**
   - Enable Google Drive API
   - Create credentials → Service Account
   - Download JSON key file

2. **Share Google Drive Folder**
   - Buat folder di Google Drive
   - Share dengan service account email (dari JSON)
   - Akses: Editor
   - Copy folder ID dari URL

3. **Set Secrets di Supabase**
   ```bash
   # Edge Function Secrets (via Supabase Dashboard)
   GOOGLE_DRIVE_CREDENTIALS = {paste entire JSON}
   GOOGLE_DRIVE_FOLDER_ID = abc123xyz456def789ghi012
   ```

---

## 🧩 Struktur Komponen

### Borang Perbelanjaan (ExpenseForm)
**Fail Utama:** `src/components/ExpenseForm.tsx`

**Sub-components:**
1. `BasicInfoFields.tsx` - Nama, tarikh, nombor invois, vendor
2. `CategoryField.tsx` - Dropdown kategori dengan custom option
3. `PurposeField.tsx` - Dropdown tujuan dengan custom option
4. `PaymentFields.tsx` - Kaedah bayar + jumlah
5. `ReceiptUpload.tsx` - Upload resit dengan compression

### Kategori Perbelanjaan
1. Projek Durian
2. Projek Labu
3. Pengurusan Pejabat
4. Pengurusan Ladang
5. Lain-lain (custom input)

### Tujuan Perbelanjaan
1. Belian Barang Ladang
2. Racun
3. Baja
4. Upah
5. Sewa Jentera/Lori
6. Transport
7. Lain-lain (custom input)

### Kaedah Pembayaran
1. Tunai
2. Pemindahan Bank
3. Kad Kredit/Debit

### Dashboard Layout
**Fail:** `src/pages/Index.tsx`

**Sections:**
1. `DashboardHeader.tsx` - Welcome message & date
2. `BalanceDisplay.tsx` - Current balance (Top-ups - Expenses)
3. `ExpenseSection.tsx` - Borang tambah perbelanjaan
4. `TopUpSection.tsx` - Borang tambah baki
5. `HistorySection.tsx` - Sejarah top-up & transaksi
6. `DailySummary.tsx` - Ringkasan hari ini

### Transaction History
**Fail:** `src/components/TransactionHistory.tsx`

**Features:**
- List semua expenses sorted by date (newest first)
- Accordion per transaction
- Edit dialog (inline edit)
- Delete confirmation dialog
- Receipt viewer (modal untuk image/PDF)

**Sub-components:**
- `TransactionItem.tsx` - Single transaction card
- `EditDialog.tsx` - Modal edit transaction
- `DeleteDialog.tsx` - Confirmation dialog

---

## 📊 Export CSV

**Komponen:** `src/components/ExportButton.tsx`

**Functionality:**
- Export semua transaksi (expenses + top_ups) ke CSV
- Format: UTF-8 dengan BOM (support Excel Malaysia)
- Sorting: Tarikh terbaru dulu
- Filename: `transaksi_petty_cash_YYYYMMDD.csv`

**Columns:**
```
Tarikh | Jenis | Nama | Kategori | Tujuan | Kaedah Bayar | Jumlah (RM)
```

**Jenis:**
- "Perbelanjaan" (expense)
- "Tambah Baki" (top-up)

---

## ⚠️ PERATURAN KRITIKAL - JANGAN PECAH!

### 🚫 DO NOT BREAK - READ CAREFULLY

#### 1. Edge Function Names
**JANGAN** tukar nama edge functions:
- `upload-to-drive` ✅
- `sync-all-to-drive` ✅

Nama function mesti kekal sama kerana ia direferens dalam:
- Database triggers (future)
- External webhooks (future)
- Client-side code yang call function

#### 2. Storage Folder Structure
**JANGAN** tukar struktur folder storage:
- Format: `{user_id}/{filename}` ✅
- Contoh: `a1b2c3d4/.../receipt_123.jpg` ✅

Perubahan struktur akan:
- Break existing receipt URLs dalam database
- Mess up RLS policies di storage
- Rosak Google Drive sync (filename matching)

#### 3. RLS Policies - Expenses Table
**JANGAN** buang atau ubah drastik RLS pada `expenses`:
- Data adalah SHARED, bukan peribadi
- Semua user mesti boleh view/edit/delete semua rekod
- Ini adalah requirement bisnes - petty cash organisasi

❌ JANGAN buat: `USING (auth.uid() = user_id)` untuk UPDATE/DELETE  
✅ BETUL: `USING (true)` untuk UPDATE/DELETE

#### 4. Authentication Method
**JANGAN** tukar auth method dari Email OTP:
- Tiada password login ✅
- Tiada magic link standalone ✅
- Tiada social auth (Google, Facebook) ✅
- Kekal: Email OTP 6 digit sahaja ✅

#### 5. Types File
**JANGAN** edit manual `src/integrations/supabase/types.ts`:
- File ini auto-generated dari Supabase schema
- Sebarang perubahan akan overwrite bila schema update
- Gunakan migration tool untuk ubah database schema

#### 6. Shared Data Model
**INGAT**: Sistem ini adalah untuk **petty cash organisasi**, bukan personal finance:
- Expenses: Semua kakitangan boleh lihat & edit semua rekod
- Top-ups: Semua boleh lihat, tapi edit/delete sendiri je
- Agent modules: Personal data (each user isolated)

#### 7. Image Compression
**JANGAN** disable atau skip compression:
- Gambar >1MB akan lambatkan upload & storage cost tinggi
- Compression adalah AUTOMATIC di client-side
- Settings (1MB, 1920px, 80%) adalah optimized untuk balance quality vs size

#### 8. Google Drive Integration
**JANGAN** simpan credentials di client-side:
- Guna Edge Function untuk access Google Drive API
- Secrets disimpan di Supabase (encrypted)
- Client hanya trigger function, tidak expose credentials

---

## 🔧 Maintenance Guidelines

### Menambah Kategori/Tujuan Baru
**Fail:** Cari dropdown options dalam component yang relevant

```typescript
// Contoh: CategoryField.tsx
const categories = [
  "Projek Durian",
  "Projek Labu",
  "Pengurusan Pejabat",
  "Pengurusan Ladang",
  "Lain-lain" // Keep this at bottom
];
```

### Menambah Field Baru di Expense
**Steps:**
1. Update database schema (migration)
2. Update `src/integrations/supabase/types.ts` (auto)
3. Update `src/components/expense/types.ts` (ExpenseData interface)
4. Update form components (add input field)
5. Update display components (show new field)

### Debugging Edge Functions
**Logs:** Supabase Dashboard → Edge Functions → [function-name] → Logs

**Common Issues:**
- "Invalid credentials" → Check GOOGLE_DRIVE_CREDENTIALS secret
- "File not found" → Check receipt_url masih valid di storage
- "Timeout" → File terlalu besar atau network issue

### Testing Checklist
**Sebelum deploy:**
- [ ] Login dengan email OTP berjaya
- [ ] Tambah perbelanjaan dengan resit upload
- [ ] Edit & delete transaksi
- [ ] Top-up baki
- [ ] Export CSV
- [ ] Resit compress automatically (check file size)
- [ ] Google Drive sync berjaya (jika enabled)

---

## 📚 Rujukan Fail Penting

### Core Files
```
src/
├── pages/
│   ├── Auth.tsx                    # Login page (Email OTP)
│   └── Index.tsx                   # Main dashboard
├── hooks/
│   └── useAuth.tsx                 # Authentication logic
├── components/
│   ├── ExpenseForm.tsx             # Main expense form
│   ├── TransactionHistory.tsx      # Transaction list
│   ├── BalanceDisplay.tsx          # Current balance
│   ├── ExportButton.tsx            # CSV export
│   └── expense/
│       ├── types.ts                # TypeScript interfaces
│       └── form/
│           ├── BasicInfoFields.tsx
│           ├── CategoryField.tsx
│           ├── PurposeField.tsx
│           ├── PaymentFields.tsx
│           └── ReceiptUpload.tsx
├── lib/
│   └── imageCompression.ts         # Image compression logic
└── integrations/
    └── supabase/
        ├── client.ts               # Supabase client
        └── types.ts                # Auto-generated DB types

supabase/
├── functions/
│   ├── upload-to-drive/
│   │   └── index.ts                # Single file upload
│   └── sync-all-to-drive/
│       └── index.ts                # Batch sync
└── migrations/                     # Database migrations

.lovable/
├── plan.md                         # Pelan OTP implementation
└── knowledge.md                    # This file! 📖
```

---

## 🎯 Best Practices

### 1. Form Validation
- Client-side: React Hook Form + Zod schema
- Server-side: Database constraints + RLS
- User feedback: Toast notifications (sonner)

### 2. Error Handling
- Try-catch semua async operations
- User-friendly error messages (Bahasa Melayu)
- Log errors to console untuk debugging

### 3. Loading States
- Show loading spinner/skeleton untuk async operations
- Disable buttons during submission
- Optimistic updates untuk better UX

### 4. Security
- Semua data access melalui RLS policies
- No direct database access from client
- Secrets stored di Supabase Edge Function environment
- File upload validated (size, type)

### 5. Performance
- Lazy load images dalam transaction history
- Paginate kalau data > 100 items
- Compress images before upload
- Use React.memo untuk heavy components

---

## 📞 Troubleshooting

### User Tidak Dapat Login
1. Check email masuk (termasuk spam/junk)
2. Verify Supabase Auth settings enabled
3. Check email template ada `{{ .Token }}`
4. Pastikan OTP belum expire (5 minit)

### Resit Tidak Upload
1. Check file size < 5MB
2. Check format (image atau PDF sahaja)
3. Check storage bucket RLS policies
4. Check network connection

### Balance Tidak Kena
1. Verify semua transactions included dalam calculation
2. Check deleted records (soft delete?)
3. Check timezone issues (UTC vs local)

### Google Drive Sync Failed
1. Check GOOGLE_DRIVE_CREDENTIALS valid
2. Check folder ID betul
3. Check service account ada access ke folder
4. Check edge function logs untuk specific error

---

## 📝 Nota Akhir

Sistem ini dibangunkan dengan fokus kepada:
- **Simplicity:** Mudah digunakan oleh semua kakitangan
- **Reliability:** Stable, tested, production-ready
- **Maintainability:** Clean code, well-documented
- **Security:** RLS policies, encrypted secrets
- **Performance:** Optimized images, efficient queries

Jika ada perubahan major, **UPDATE FAIL INI** supaya dokumentasi kekal up-to-date! 🚀

---

**Last Updated:** 2026-03-09  
**Version:** 1.0.0  
**Maintained by:** Lovable AI
