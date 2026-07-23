// app/dashboard/payroll/actions.ts
// ============================================
// SERVER ACTIONS — Fungsi yang berjalan di server
// Dipakai untuk operasi database yang membutuhkan keamanan
// 'use server' memastikan kode ini HANYA berjalan di server,
// tidak pernah terekspos ke browser user
// ============================================
'use server'

import { supabase } from '@/lib/supabaseClient'
import { revalidatePath } from 'next/cache' // Untuk refresh cache halaman setelah data berubah

/**
 * Server Action untuk menyimpan data penggajian karyawan
 * Dipanggil dari InputGajiForm.tsx saat admin submit form input gaji
 * 
 * @param formData - Data dari form HTML (karyawan_id, pay_period, gross, deduction)
 * @returns Object {error} jika gagal, atau {success, net_pay} jika berhasil
 */
export async function inputGaji(formData: FormData) {
  // ============================================
  // 1. AMBIL DATA DARI FORM
  // ============================================

  // Ambil ID karyawan yang dipilih di dropdown
  const karyawan_id = formData.get('karyawan_id') as string

  // Ambil periode penggajian yang dipilih (format: "2025-01-01")
  const pay_period = formData.get('pay_period') as string

  // Ambil dan konversi gross salary dari string ke angka desimal
  const gross = parseFloat(formData.get('gross') as string)

  // Ambil dan konversi total deduction dari string ke angka desimal
  const deduction = parseFloat(formData.get('deduction') as string)

  // ============================================
  // 2. KALKULASI OTOMATIS
  // ============================================

  // Hitung persentase deduction dari gross salary
  // Rumus: (deduction / gross) * 100
  // Jika gross = 0, set persentase ke 0 untuk menghindari pembagian dengan 0
  const deduction_percentage = gross > 0 ? (deduction / gross) * 100 : 0

  // Hitung net pay (gaji bersih)
  // Rumus: Net Pay = Gross Salary - Total Deduction
  const net_pay = gross - deduction

  // ============================================
  // 3. VALIDASI INPUT
  // Pastikan semua data valid sebelum menyimpan ke database
  // ============================================

  // Cek apakah semua field sudah terisi dan gross/deduction adalah angka valid
  if (!karyawan_id || !pay_period || isNaN(gross) || isNaN(deduction)) {
    return { error: 'Semua field harus diisi dengan benar.' }
  }

  // Gross salary tidak boleh 0 atau negatif
  if (gross <= 0) {
    return { error: 'Gross salary harus lebih dari 0.' }
  }

  // Deduction tidak boleh negatif
  if (deduction < 0) {
    return { error: 'Deduction tidak boleh negatif.' }
  }

  // Deduction tidak boleh melebihi gross (net pay tidak boleh negatif)
  if (deduction > gross) {
    return { error: 'Deduction tidak boleh melebihi gross salary.' }
  }

  // ============================================
  // 4. SIMPAN KE DATABASE
  // ============================================

  // Gunakan UPSERT — gabungan INSERT dan UPDATE:
  // - Jika data karyawan di periode ini BELUM ada → INSERT (tambah baru)
  // - Jika data karyawan di periode ini SUDAH ada → UPDATE (timpa)
  // onConflict: tentukan kolom yang dijadikan acuan pengecekan duplikat
  const { error } = await supabase
    .from('penggajian')
    .upsert({
      karyawan_id,
      pay_period,
      gross,
      deduction,
      // Bulatkan persentase ke 2 angka desimal
      // Math.round(x * 100) / 100 lebih akurat daripada toFixed()
      deduction_percentage: Math.round(deduction_percentage * 100) / 100,
      net_pay,
    }, {
      onConflict: 'karyawan_id,pay_period' // Jika kombinasi ini sudah ada, update
    })

  // Jika ada error dari Supabase, kembalikan pesan error
  if (error) {
    return { error: `Gagal menyimpan: ${error.message}` }
  }

  // Invalidasi cache halaman payroll agar data terbaru langsung tampil
  // tanpa perlu refresh manual dari user
  revalidatePath('/dashboard/payroll')

  // Kembalikan hasil sukses beserta net_pay untuk ditampilkan di form
  return { success: true, net_pay }
}