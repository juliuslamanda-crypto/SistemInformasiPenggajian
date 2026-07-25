// lib/payrollHelper.ts
// ============================================
// PAYROLL HELPER — Logika kalkulasi penggajian
// Sistem Informasi Penggajian — Lokalisasi Indonesia
// ============================================

// Tipe data untuk satu record penggajian
export type PayrollRecord = {
  id: string
  karyawan_id: string
  bulan: number
  tahun: number

  // Komponen pendapatan
  gaji_pokok: number
  tunjangan_jabatan: number
  tunjangan_makan: number
  tunjangan_transport: number
  gaji_kotor: number

  // Komponen potongan
  bpjs_kesehatan: number
  bpjs_ketenagakerjaan: number
  pph21: number
  total_potongan: number

  // Hasil akhir
  gaji_bersih: number

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
 * Format angka ke format Rupiah
 * Contoh: 5000000 → "Rp 5.000.000"
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format bulan dan tahun ke nama bulan Indonesia
 * Contoh: bulan=7, tahun=2025 → "Juli 2025"
 */
export function formatPeriod(bulan: number, tahun: number): string {
  const date = new Date(tahun, bulan - 1, 1)
  return date.toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Hitung ringkasan statistik dari array data penggajian
 */
export function hitungStatistik(data: PayrollRecord[]) {
  if (data.length === 0) return {
    totalGajiKotor: 0,
    totalPotongan: 0,
    totalGajiBersih: 0,
    rataRataGajiBersih: 0,
    jumlahKaryawan: 0,
  }

  const totalGajiKotor    = data.reduce((sum, p) => sum + Number(p.gaji_kotor), 0)
  const totalPotongan     = data.reduce((sum, p) => sum + Number(p.total_potongan), 0)
  const totalGajiBersih   = data.reduce((sum, p) => sum + Number(p.gaji_bersih), 0)
  const rataRataGajiBersih = totalGajiBersih / data.length

  return {
    totalGajiKotor,
    totalPotongan,
    totalGajiBersih,
    rataRataGajiBersih,
    jumlahKaryawan: data.length,
  }
}

/**
 * Daftar semua periode yang tersedia (Januari 2025 - Juni 2026)
 */
export function getPeriodOptions(): { bulan: number; tahun: number; label: string; value: string }[] {
  const periods = [
    { bulan: 1, tahun: 2025 }, { bulan: 2, tahun: 2025 }, { bulan: 3, tahun: 2025 },
    { bulan: 4, tahun: 2025 }, { bulan: 5, tahun: 2025 }, { bulan: 6, tahun: 2025 },
    { bulan: 7, tahun: 2025 }, { bulan: 8, tahun: 2025 }, { bulan: 9, tahun: 2025 },
    { bulan: 10, tahun: 2025 }, { bulan: 11, tahun: 2025 }, { bulan: 12, tahun: 2025 },
    { bulan: 1, tahun: 2026 }, { bulan: 2, tahun: 2026 }, { bulan: 3, tahun: 2026 },
    { bulan: 4, tahun: 2026 }, { bulan: 5, tahun: 2026 }, { bulan: 6, tahun: 2026 },
  ]

  return periods.map(p => ({
    ...p,
    label: formatPeriod(p.bulan, p.tahun),
    value: `${p.bulan}-${p.tahun}`, // Contoh: "7-2025"
  }))
}