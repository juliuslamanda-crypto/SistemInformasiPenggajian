// lib/payrollHelper.ts
// PAYROLL HELPER — Logika kalkulasi penggajian
// Dataset: Sample Employee Monthly Salary (Kaggle)
// Perusahaan: ABC 
// ============================================

export type PayrollRecord = {
  id: string
  karyawan_id: string
  pay_period: string
  gross: number
  deduction: number
  deduction_percentage: number
  net_pay: number
  karyawan?: {
    nama: string
    employee_id: string
    age: number
    tenure_months: number
    jabatan?: { nama: string }
    departemen?: { nama: string }
  }
}

/**
 * Format angka ke format mata uang
 * Contoh: 74922 → "74,922.00"
 */
export function formatSalary(amount: number): string {
  return Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Format pay_period dari DATE ke nama bulan
 * Contoh: "2025-07-01" → "Juli 2025"
 */
export function formatPeriod(payPeriod: string): string {
  const date = new Date(payPeriod)
  return date.toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Hitung ringkasan statistik dari daftar penggajian
 * Dipakai untuk summary cards di halaman payroll
 */
export function hitungStatistik(data: PayrollRecord[]) {
  if (data.length === 0) return {
    totalNetPay: 0,
    rataRataNetPay: 0,
    totalGross: 0,
    totalDeduction: 0,
    jumlahKaryawan: 0,
  }

  const totalGross      = data.reduce((sum, p) => sum + Number(p.gross), 0)
  const totalDeduction  = data.reduce((sum, p) => sum + Number(p.deduction), 0)
  const totalNetPay     = data.reduce((sum, p) => sum + Number(p.net_pay), 0)
  const rataRataNetPay  = totalNetPay / data.length

  return {
    totalNetPay,
    rataRataNetPay,
    totalGross,
    totalDeduction,
    jumlahKaryawan: data.length,
  }
}

/**
 * Daftar semua periode (bulan) yang tersedia
 * Dipakai untuk dropdown filter bulan
 */
export function getPeriodOptions(): { value: string; label: string }[] {
  const months = [
    '2025-01-01', '2025-02-01', '2025-03-01', '2025-04-01',
    '2025-05-01', '2025-06-01', '2025-07-01', '2025-08-01',
    '2025-09-01', '2025-10-01', '2025-11-01', '2025-12-01',
  ]
  return months.map(m => ({
    value: m,
    label: formatPeriod(m),
  }))
}