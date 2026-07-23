// app/dashboard/payroll/page.tsx
// ============================================
// HALAMAN PAYROLL — Menampilkan data penggajian per periode
// Server Component: fetch data langsung dari database di server
// Menerima query parameter "period" dari URL untuk filter bulan
// Contoh URL: /dashboard/payroll?period=2025-07-01
// ============================================

import { supabase } from '@/lib/supabaseClient'
import {
  formatSalary,    // Format angka ke mata uang
  formatPeriod,    // Format DATE ke nama bulan
  hitungStatistik, // Hitung total dan rata-rata gaji
  getPeriodOptions, // Daftar opsi bulan untuk dropdown
  PayrollRecord,   // Type definition data penggajian
} from '@/lib/payrollHelper'
import PeriodFilter from './PeriodFilter'   // Dropdown filter bulan (Client Component)
import Link from 'next/link'                // Navigasi antar halaman
import InputGajiForm from './InputGajiForm' // Form input gaji (Client Component)

export default async function PayrollPage({
  searchParams,
}: {
  // Di Next.js 15, searchParams adalah Promise yang harus di-await
  searchParams: Promise<{ period?: string }>
}) {
  // Await searchParams sebelum mengakses propertinya
  const { period } = await searchParams

  // Gunakan period dari URL, atau default ke Januari 2025 jika tidak ada
  const selectedPeriod = period || '2025-01-01'

  // ============================================
  // FETCH DATA PENGGAJIAN
  // Ambil semua penggajian di periode yang dipilih
  // JOIN ke tabel karyawan, jabatan, dan departemen untuk data lengkap
  // ============================================
  const { data: payrollData, error } = await supabase
    .from('penggajian')
    .select(`
      *,
      karyawan (
        nama,
        employee_id,
        age,
        tenure_months,
        jabatan ( nama ),
        departemen ( nama )
      )
    `)
    .eq('pay_period', selectedPeriod)       // Filter berdasarkan periode yang dipilih
    .order('net_pay', { ascending: false }) // Urutkan dari net pay tertinggi ke terendah

  // Tampilkan error jika fetch gagal
  if (error) {
    return (
      <div className="p-6 bg-red-900/20 border border-red-500/30 rounded-xl text-red-400">
        <p className="font-bold">Error mengambil data penggajian</p>
        <p className="text-sm mt-1">{error.message}</p>
      </div>
    )
  }

  // ============================================
  // FETCH DAFTAR KARYAWAN
  // Dipakai untuk dropdown di form InputGajiForm
  // Hanya ambil kolom yang dibutuhkan (id, nama, employee_id)
  // ============================================
  const { data: karyawanList } = await supabase
    .from('karyawan')
    .select('id, nama, employee_id')
    .order('nama') // Urutkan alfabetis untuk kemudahan pencarian

  // Cast data ke type PayrollRecord, atau array kosong jika null
  const data = (payrollData as PayrollRecord[]) || []

  // Hitung statistik ringkasan dari data yang sudah difetch
  const stats = hitungStatistik(data)

  // Dapatkan daftar opsi periode untuk dropdown filter
  const periodOptions = getPeriodOptions()

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-900 min-h-screen text-white">

      {/* Header — Judul halaman dan kontrol filter */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-blue-400">Payroll</h1>
          <p className="text-sm text-gray-400 mt-1">
            Data penggajian periode {formatPeriod(selectedPeriod)}
          </p>
        </div>
        <div className="flex gap-3 items-center">
          {/* Form input gaji baru — membuka modal saat diklik */}
          <InputGajiForm karyawanList={karyawanList ?? []} />
          {/* Dropdown filter periode — mengubah URL query param saat dipilih */}
          <PeriodFilter options={periodOptions} selected={selectedPeriod} />
        </div>
      </div>

      {/* Summary Cards — Ringkasan statistik penggajian periode ini */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
          <p className="text-xs text-gray-400 mb-1">Karyawan digaji</p>
          <p className="text-2xl font-bold text-white">{stats.jumlahKaryawan}</p>
        </div>
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
          <p className="text-xs text-gray-400 mb-1">Total Gross</p>
          <p className="text-lg font-bold text-blue-400">{formatSalary(stats.totalGross)}</p>
        </div>
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
          <p className="text-xs text-gray-400 mb-1">Total Deductions</p>
          <p className="text-lg font-bold text-red-400">{formatSalary(stats.totalDeduction)}</p>
        </div>
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
          <p className="text-xs text-gray-400 mb-1">Rata-rata Net Pay</p>
          <p className="text-lg font-bold text-green-400">{formatSalary(stats.rataRataNetPay)}</p>
        </div>
      </div>

      {/* Tabel Penggajian — Daftar semua karyawan dan komponen gajinya */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-700 text-gray-300">
            <tr>
              <th className="p-4">Karyawan</th>
              <th className="p-4">Jabatan</th>
              <th className="p-4">Departemen</th>
              <th className="p-4">Gross</th>
              <th className="p-4">Deduction</th>
              <th className="p-4">Deduction %</th>
              <th className="p-4">Net Pay</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {/* Tampilkan pesan jika tidak ada data di periode ini */}
            {data.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">
                  Tidak ada data penggajian untuk periode ini
                </td>
              </tr>
            ) : (
              // Render satu baris per karyawan
              data.map((p) => (
                <tr key={p.id} className="hover:bg-gray-750 transition-colors">
                  <td className="p-4">
                    {/* Nama karyawan sebagai link ke halaman slip gaji */}
                    <Link
                      href={`/dashboard/payroll/${p.karyawan_id}`}
                      className="font-medium text-blue-400 hover:text-blue-300 hover:underline"
                    >
                      {p.karyawan?.nama}
                    </Link>
                    <p className="text-xs text-gray-400">{p.karyawan?.employee_id}</p>
                  </td>
                  <td className="p-4 text-gray-300 text-xs">
                    {p.karyawan?.jabatan?.nama ?? '-'}
                  </td>
                  <td className="p-4 text-gray-400 text-xs">
                    {p.karyawan?.departemen?.nama ?? '-'}
                  </td>
                  {/* Gross salary — gaji kotor sebelum potongan */}
                  <td className="p-4 text-white font-medium">
                    {formatSalary(p.gross)}
                  </td>
                  {/* Deduction — total potongan, ditampilkan merah dengan tanda minus */}
                  <td className="p-4 text-red-400">
                    -{formatSalary(p.deduction)}
                  </td>
                  {/* Persentase potongan, dibulatkan 2 angka desimal */}
                  <td className="p-4 text-yellow-400">
                    {Number(p.deduction_percentage).toFixed(2)}%
                  </td>
                  {/* Net pay — gaji bersih setelah potongan */}
                  <td className="p-4">
                    <span className="text-green-400 font-bold">
                      {formatSalary(p.net_pay)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  )
}