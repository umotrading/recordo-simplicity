
# Pelan Tukar Login kepada Email OTP

## Ringkasan Perubahan

Menukar sistem pengesahan dari **email + kata laluan** kepada **Email OTP** di mana pengguna:
1. Masukkan alamat email
2. Terima kod 6 digit melalui email
3. Masukkan kod OTP untuk log masuk

---

## Langkah Pelaksanaan

### Langkah 1: Kemaskini Supabase Dashboard

**Lokasi:** Supabase Dashboard > Authentication > Email Templates

Anda perlu mengemas kini template email OTP dalam Supabase Dashboard dengan HTML template yang anda berikan. Ini dilakukan secara manual dalam dashboard kerana Lovable tidak boleh mengubah setting ini secara automatik.

### Langkah 2: Kemaskini `useAuth.tsx`

**Fail:** `src/hooks/useAuth.tsx`

Perubahan:
- Buang fungsi `signIn` (email + password)
- Buang fungsi `signUp` (tidak perlu pendaftaran berasingan dengan OTP)
- Tambah fungsi `sendOtp(email)` - hantar kod OTP ke email
- Tambah fungsi `verifyOtp(email, token)` - sahkan kod OTP

```text
Fungsi baru:
sendOtp(email: string) 
  -> supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true }})

verifyOtp(email: string, token: string)
  -> supabase.auth.verifyOtp({ email, token, type: 'email' })
```

### Langkah 3: Reka bentuk semula halaman Auth

**Fail:** `src/pages/Auth.tsx`

Perubahan UI:
- Buang tab "Log Masuk" dan "Daftar" 
- Buat flow 2 langkah:
  - **Langkah 1:** Borang email sahaja + butang "Hantar Kod OTP"
  - **Langkah 2:** Input 6 digit OTP menggunakan komponen `InputOTP` + butang "Sahkan"
- Tambah butang "Hantar semula kod" jika perlu
- Tambah countdown timer (optional)

```text
UI Flow:

[Langkah 1: Masukkan Email]
┌─────────────────────────────────┐
│  Sistem Rekod Ladang GMP        │
│  ─────────────────────────────  │
│  E-mel: [________________]      │
│                                 │
│  [  Hantar Kod OTP  ]           │
└─────────────────────────────────┘
           ↓
[Langkah 2: Masukkan OTP]
┌─────────────────────────────────┐
│  Masukkan Kod Pengesahan        │
│  Kod telah dihantar ke email    │
│  ─────────────────────────────  │
│  [ 1 ][ 2 ][ 3 ][ 4 ][ 5 ][ 6 ] │
│                                 │
│  [     Sahkan     ]             │
│  Hantar semula kod (dalam 60s)  │
└─────────────────────────────────┘
```

---

## Butiran Teknikal

### A. Fungsi Supabase yang Digunakan

| Fungsi | Kegunaan |
|--------|----------|
| `signInWithOtp({ email })` | Hantar kod OTP ke email pengguna |
| `verifyOtp({ email, token, type: 'email' })` | Sahkan kod OTP dan log masuk |

### B. State Management dalam Auth.tsx

```text
States yang diperlukan:
- step: 'email' | 'otp' - langkah semasa
- email: string - alamat email pengguna
- isLoading: boolean - status loading
- countdown: number - masa untuk hantar semula (optional)
```

### C. Pengendalian Ralat

- Email tidak sah → "Sila masukkan email yang sah"
- Kod OTP salah → "Kod tidak sah. Sila cuba lagi."
- Kod tamat tempoh → "Kod telah tamat tempoh. Sila minta kod baru."
- Rate limit → "Terlalu banyak percubaan. Sila tunggu beberapa minit."

---

## Fail yang Akan Diubah

| Fail | Jenis Perubahan |
|------|-----------------|
| `src/hooks/useAuth.tsx` | Tukar fungsi auth kepada OTP |
| `src/pages/Auth.tsx` | Reka bentuk semula UI untuk flow OTP |

---

## Tindakan Manual Diperlukan

Selepas pelaksanaan, anda perlu:

1. **Kemaskini Email Template dalam Supabase Dashboard:**
   - Pergi ke Authentication > Email Templates
   - Pilih "Magic Link" atau "OTP" template
   - Gantikan dengan HTML template yang anda berikan
   - Pastikan `{{ .Token }}` ada dalam template untuk paparkan kod OTP

---

## Hasil Jangkaan

Selepas perubahan:
- Pengguna tidak perlu ingat kata laluan
- Login lebih selamat dengan kod 6 digit yang tamat tempoh dalam 5 minit
- Pendaftaran automatik - pengguna baru akan didaftarkan secara automatik
- UI lebih mudah dan mesra pengguna
