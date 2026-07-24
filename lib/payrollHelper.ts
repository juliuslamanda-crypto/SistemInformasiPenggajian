// lib/payrollHelper.ts
// ============================================
// PAYROLL HELPER — Logika kalkulasi penggajian
// Dataset: Sample Employee Monthly Salary (Kaggle)
// Perusahaan: ABC Company (data sintetis/dummy)
// 
// File ini dipisah dari UI agar:
// 1. Logika bisa diuji secara independen (unit testing)
// 2. Mudah dimodifikasi tanpa menyentuh komponen UI
// 3. Bisa dipakai ulang di banyak halaman
// ============================================

// Tipe data untuk satu record penggajian
// Dipakai sebagai type annotation di seluruh aplikasi
export type PayrollRecord = {
  id: string                  // UUID unik setiap record penggajian
  karyawan_id: string         // UUID referensi ke tabel karyawan
  pay_period: string          // Periode gaji dalam format DATE (contoh: "2025-01-01")
  gross: number               // Gaji kotor sebelum potongan
  deduction: number           // Total potongan
  deduction_percentage: number // Persentase potongan dari gross (deduction/gross * 100)
  net_pay: number             // Gaji bersih = gross - deduction
  karyawan?: {                // Data karyawan (opsional, diisi saat JOIN)
    nama: string
    employee_id: string
    age: number
    tenure_months: number
    jabatan?: { nama: string }    // Nama jabatan dari tabel jabatan
    departemen?: { nama: string } // Nama departemen dari tabel departemen
  }
}

/**
 * Memformat angka ke format mata uang internasional
 * 
 * @param amount - Angka yang akan diformat
 * @returns String dalam format "74,922.00"
 * 
 * Contoh: formatSalary(74922) → "74,922.00"
 */
export function formatSalary(amount: number): string {
  return Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2, // Minimal 2 angka di belakang koma
    maximumFractionDigits: 2, // Maksimal 2 angka di belakang koma
  })
}

/**
 * Memformat tanggal pay_period dari format DATE ke nama bulan bahasa Indonesia
 * 
 * @param payPeriod - String tanggal dalam format "YYYY-MM-DD"
 * @returns String nama bulan dan tahun dalam bahasa Indonesia
 * 
 * Contoh: formatPeriod("2025-07-01") → "Juli 2025"
 */
export function formatPeriod(payPeriod: string): string {
  // Konversi string tanggal ke objek Date JavaScript
  const date = new Date(payPeriod)
  
  // Format ke bahasa Indonesia, tampilkan bulan panjang dan tahun
  return date.toLocaleDateString('id-ID', {
    month: 'long',  // Nama bulan panjang (Januari, Februari, dst)
    year: 'numeric', // Tahun 4 digit (2025)
  })
}

/**
 * Menghitung ringkasan statistik dari array data penggajian
 * Dipakai untuk mengisi summary cards di halaman payroll dan dashboard
 * 
 * @param data - Array PayrollRecord yang akan dihitung statistiknya
 * @returns Object berisi total dan rata-rata komponen gaji
 */
export function hitungStatistik(data: PayrollRecord[]) {
  // Jika data kosong, kembalikan semua nilai 0
  // Mencegah pembagian dengan 0 saat hitung rata-rata
  if (data.length === 0) return {
    totalNetPay: 0,
    rataRataNetPay: 0,
    totalGross: 0,
    totalDeduction: 0,
    jumlahKaryawan: 0,
  }

  // Jumlahkan semua gross salary menggunakan reduce
  // reduce: iterasi array dan akumulasi nilainya ke satu nilai
  const totalGross = data.reduce((sum, p) => sum + Number(p.gross), 0)

  // Jumlahkan semua deduction
  const totalDeduction = data.reduce((sum, p) => sum + Number(p.deduction), 0)

  // Jumlahkan semua net pay
  const totalNetPay = data.reduce((sum, p) => sum + Number(p.net_pay), 0)

  // Hitung rata-rata net pay = total net pay dibagi jumlah karyawan
  const rataRataNetPay = totalNetPay / data.length

  return {
    totalNetPay,
    rataRataNetPay,
    totalGross,
    totalDeduction,
    jumlahKaryawan: data.length, // Jumlah karyawan yang digaji periode ini
  }
}

/**
 * Menghasilkan daftar opsi periode (bulan) untuk dropdown filter
 * Mencakup 12 bulan tahun 2025 sesuai dataset yang digunakan
 * 
 * @returns Array object {value, label} untuk dirender sebagai <option>
 */
export function getPeriodOptions(): { value: string; label: string }[] {
  // Daftar 12 bulan dalam format DATE (tanggal 1 setiap bulan)
  const months = [
    // 2025
    '2025-01-01', '2025-02-01', '2025-03-01', '2025-04-01',
    '2025-05-01', '2025-06-01', '2025-07-01', '2025-08-01',
    '2025-09-01', '2025-10-01', '2025-11-01', '2025-12-01',
    // 2026
    '2026-01-01', '2026-02-01', '2026-03-01', '2026-04-01',
    '2026-05-01', '2026-06-01',
  ]

  // Konversi setiap tanggal ke format {value, label}
  // value: string DATE untuk query database
  // label: nama bulan bahasa Indonesia untuk ditampilkan ke user
  return months.map(m => ({
    value: m,           // Contoh: "2025-07-01"
    label: formatPeriod(m), // Contoh: "Juli 2025"
  }))
}