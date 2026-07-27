# Sistem Informasi Penggajian

Sistem Informasi Penggajian adalah aplikasi web berbasis **Next.js** dan **Supabase** yang digunakan untuk mengelola data karyawan, jabatan, serta proses penggajian secara digital.

Aplikasi ini dikembangkan sebagai proyek **Sertifikasi Kompetensi BNSP Skema Analis Program** pada Program Studi Sistem Informasi Universitas Bina Sarana Informatika.

## Tech Stack

| Teknologi | Keterangan |
|------------|------------|
| Next.js (App Router) | Frontend & Backend |
| TypeScript | Bahasa Pemrograman |
| Supabase PostgreSQL | Database |
| Supabase Auth (SSR) | Autentikasi |
| Tailwind CSS | Styling |
| React | User Interface |
| Vitest | Unit Testing |

## Fitur

### Login
- Login menggunakan email dan password
- Autentikasi menggunakan Supabase Auth
- Route dashboard diproteksi menggunakan Middleware

### Dashboard
- Ringkasan data penggajian
- Statistik data karyawan
- Navigasi seluruh menu aplikasi

### Data Karyawan
- Menampilkan daftar karyawan
- Menambah data karyawan
- Mengubah data karyawan
- Menghapus data karyawan
- Pencarian data

### Data Jabatan
- Menampilkan daftar jabatan
- Menambah jabatan
- Mengubah jabatan
- Menghapus jabatan

### Penggajian
- Input data penggajian
- Perhitungan otomatis komponen gaji
- Riwayat penggajian
- Detail penggajian

### Slip Gaji
- Menampilkan slip gaji
- Format siap cetak (Print)

---

# Struktur Folder

```text
sistem-informasi-penggajian
│
├── app
│   ├── (auth)
│   │   └── Login
│   ├── dashboard
│   │   ├── jabatan
│   │   ├── karyawan
│   │   ├── payroll
│   │   └── layout.tsx
│   ├── layout.tsx
│   └── page.tsx
│
├── lib
│   ├── supabase
│   ├── payrollHelper.ts
│   └── ...
│
├── public
├── supabase
├── middleware.ts
├── package.json
└── README.md
```

---

# Instalasi

Clone repository

```bash
git clone https://github.com/USERNAME/sistem-informasi-penggajian.git
```

Masuk ke folder project

```bash
cd sistem-informasi-penggajian
```

Install dependency

```bash
npm install
```

Jalankan project

```bash
npm run dev
```

Akses

```
http://localhost:3000
```

---

# Environment Variables

Buat file

```
.env.local
```

Isi dengan

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

# Database

Database menggunakan **Supabase PostgreSQL**.

Beberapa tabel utama:

- karyawan
- jabatan
- penggajian
- departemen

Relasi database menggunakan foreign key sehingga data penggajian terhubung dengan data karyawan dan jabatan.

---

# Authentication

Autentikasi menggunakan:

- Supabase Auth
- Middleware
- Server Side Rendering (SSR)

Halaman dashboard hanya dapat diakses oleh pengguna yang telah login.

---

# Pengujian

Project menyediakan pengujian menggunakan **Vitest**.

Menjalankan test

```bash
npm test
```

---

# Screenshot

## Login

Tambahkan screenshot halaman login.

---

## Dashboard

Tambahkan screenshot dashboard.

---

## Data Karyawan

Tambahkan screenshot halaman karyawan.

---

## Data Jabatan

Tambahkan screenshot halaman jabatan.

---

## Penggajian

Tambahkan screenshot halaman penggajian.

---

## Slip Gaji

Tambahkan screenshot slip gaji.

---

# Pengembang

**Julius Lamanda**

Mahasiswa Program Studi Informatika

Universitas Bina Sarana Informatika

2026
