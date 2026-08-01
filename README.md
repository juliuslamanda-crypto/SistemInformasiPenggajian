# Sistem Informasi Penggajian

Sistem informasi penggajian berbasis web untuk mengelola data karyawan, jabatan, departemen, dan transaksi penggajian bulanan — dilengkapi portal self-service bagi karyawan untuk melihat dan mencetak slip gaji mereka sendiri.

Dikembangkan sebagai studi kasus untuk sertifikasi BNSP skema **Analis Program** (SKM-2019-62010-02), sekaligus proyek portofolio untuk persiapan internship.

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | Next.js 15 (App Router) |
| Bahasa | TypeScript |
| Basis Data & Auth | Supabase (PostgreSQL + `@supabase/ssr`) |
| Styling | Tailwind CSS v4 |
| Icon | lucide-react |
| Testing | Vitest |
| Font | Fraunces (display), Inter (body), JetBrains Mono (angka/uang) |

---

## Fitur

### Admin
- Login admin dengan proteksi route berbasis middleware
- Dashboard ringkasan: total karyawan, jabatan, departemen, dan gaji bulan berjalan
- CRUD data karyawan (tambah, edit, hapus)
- Daftar jabatan beserta jumlah karyawan per jabatan
- Input gaji bulanan dengan kalkulasi otomatis (gaji kotor, BPJS, PPh 21, denda absensi, gaji bersih)
- Riwayat penggajian per karyawan
- Cetak slip gaji (siap print)

### Karyawan (Self-Service Portal)
- Registrasi akun mandiri menggunakan email yang telah terdaftar di data karyawan
- Portal ringkas: profil, jabatan, departemen, dan gaji terbaru
- Riwayat gaji pribadi (tidak dapat melihat data karyawan lain)
- Cetak slip gaji sendiri

### Keamanan
- Autentikasi berbasis cookie (`@supabase/ssr`), bukan `localStorage`, agar dapat divalidasi di middleware (server-side)
- Middleware memvalidasi session pada setiap request dan mengarahkan pengguna berdasarkan peran (admin → `/dashboard`, karyawan → `/karyawan-portal`)
- Row Level Security (RLS) di level database memastikan karyawan hanya dapat mengakses data penggajian miliknya sendiri, sebagai lapisan proteksi independen dari logika aplikasi

---

## Struktur Proyek

```
sistem-informasi-penggajian/
├── app/
│   ├── (auth)/
│   │   ├── Login/
│   │   │   └── page.tsx                  # Login admin & karyawan
│   │   └── Daftar/
│   │       └── page.tsx                  # Registrasi akun karyawan
│   ├── dashboard/                        # Area admin
│   │   ├── jabatan/
│   │   │   └── page.tsx
│   │   ├── karyawan/
│   │   │   ├── actions.ts                # Server Actions CRUD karyawan
│   │   │   ├── KaryawanForm.tsx
│   │   │   ├── KaryawanTable.tsx
│   │   │   └── TambahKaryawanButton.tsx
│   │   ├── payroll/
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx              # Riwayat gaji per karyawan
│   │   │   │   └── slip/[bulan]/[tahun]/
│   │   │   │       ├── page.tsx          # Cetak slip (admin)
│   │   │   │       └── PrintButton.tsx
│   │   │   ├── InputGajiForm.tsx
│   │   │   └── PeriodFilter.tsx
│   │   ├── layout.tsx                    # Sidebar admin + proteksi client-side
│   │   └── page.tsx                      # Dashboard admin
│   ├── karyawan-portal/                  # Area self-service karyawan
│   │   ├── riwayat/
│   │   │   └── page.tsx
│   │   ├── slip/[bulan]/[tahun]/
│   │   │   ├── page.tsx                  # Cetak slip (karyawan)
│   │   │   └── PrintButton.tsx
│   │   ├── layout.tsx                    # Header ringkas + tombol keluar
│   │   └── page.tsx                      # Dashboard ringkas karyawan
│   ├── layout.tsx                        # Root layout, setup font
│   └── globals.css                       # Design token (warna, font)
├── lib/
│   ├── supabase/
│   │   ├── client.ts                     # Koneksi untuk Client Component (singleton)
│   │   ├── server.ts                     # Koneksi untuk Server Component/Action
│   │   └── middleware.ts                 # Logic proteksi route & redirect role
│   ├── payrollHelper.ts                  # Fungsi format & kalkulasi penggajian
│   └── payrollHelper.test.ts             # Unit test (Vitest)
├── supabase/
│   └── migrations/                       # Riwayat perubahan skema database
├── middleware.ts                         # Entry point middleware Next.js
└── .env.local                            # Kredensial Supabase (tidak di-push)
```

---

## Skema Basis Data

**Tabel utama:** `karyawan`, `jabatan`, `departemen`, `penggajian`

- `karyawan.jabatan_id` → `jabatan.id`
- `karyawan.departemen_id` → `departemen.id`
- `penggajian.karyawan_id` → `karyawan.id` (relasi one-to-many, dengan `UNIQUE(karyawan_id, bulan, tahun)`)
- `karyawan.user_id` → `auth.users.id` (menghubungkan data karyawan ke akun login self-service)

**Formula penggajian:**
```
Gaji Kotor  = Gaji Pokok + Tunjangan Jabatan (15%) + Tunjangan Makan + Tunjangan Transport
Potongan    = BPJS Kesehatan (1%) + BPJS Ketenagakerjaan (2%) + PPh 21 (5%) + Denda Absensi
Denda       = (Hari Alpa × Rp50.000) + (Hari Telat × Rp30.000)
Gaji Bersih = Gaji Kotor − Potongan
```

---

## Autentikasi & Peran

| Peran | Cara Masuk | Redirect Setelah Login |
|---|---|---|
| Admin | Akun tunggal (`admin@abc.com`) | `/dashboard` |
| Karyawan | Registrasi mandiri via `/Daftar`, email harus cocok dengan data karyawan yang sudah diinput admin | `/karyawan-portal` |

Proses penyambungan akun baru ke data karyawan dilakukan **secara eksplisit di kode aplikasi** (bukan mengandalkan database trigger), agar proses lebih transparan dan mudah ditangani jika terjadi kegagalan.

---

## Menjalankan Proyek

```bash
npm install
npm run dev
```

Buat file `.env.local` berisi:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Testing

```bash
npx vitest run
```

Unit test mencakup fungsi format Rupiah, format periode, kalkulasi statistik penggajian (termasuk edge case data kosong), dan generator opsi periode — seluruhnya pada `lib/payrollHelper.ts`.

## Build Production

```bash
npm run build
```

---

## Status Pengembangan

**Sudah selesai:** autentikasi dua peran (admin & karyawan), CRUD karyawan/jabatan/penggajian, kalkulasi gaji otomatis termasuk denda absensi, cetak slip gaji (admin & karyawan), unit testing, RLS untuk isolasi data karyawan.

**Rencana pengembangan lanjutan:**
- Pagination pada tabel karyawan dan penggajian untuk skala data besar
- Agregasi statistik penggajian dipindahkan ke level SQL (SUM/AVG)
- Export laporan ke Excel/PDF
- Modul absensi terintegrasi (menggantikan input manual hari alpa/telat)
- Automated end-to-end testing (Playwright/Cypress)
- Deploy ke Vercel

---

## Dataset

Data karyawan menggunakan dataset publik Kaggle — *kaggle.com/datasets/jb1433/sample-employees-monthly-salary*.