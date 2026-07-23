// app/dashboard/payroll/[id]/page.tsx
// ============================================
// SLIP GAJI — Halaman detail penggajian per karyawan
//
// Dynamic Route: [id] adalah UUID karyawan dari URL
// Contoh URL: /dashboard/payroll/c0a18d81-bd6c-4991-afbd-5e2997f97e89
// Halaman ini menampilkan profil karyawan + riwayat 12 bulan penggajian
// ============================================

import { supabase } from '@/lib/supabaseClient'
import { formatSalary, formatPeriod } from '@/lib/payrollHelper'
import Link from 'next/link'

export default async function SlipGajiPage({
  params,
}: {
  // Di Next.js 15, params adalah Promise yang harus di-await
  params: Promise<{ id: string }>
}) {
  // Await params untuk mendapatkan id karyawan dari URL
  const { id } = await params

  // ============================================
  // FETCH DATA KARYAWAN
  // Ambil satu karyawan berdasarkan UUID dari URL
  // JOIN ke jabatan dan departemen untuk tampilkan nama lengkap
  // .single() → kembalikan satu object, bukan array
  // ============================================
  const { data: karyawan } = await supabase
    .from('karyawan')
    .select(`*, jabatan(nama), departemen(nama)`)
    .eq('id', id)    // Filter berdasarkan UUID karyawan
    .single()        // Ambil satu baris saja

  // ============================================
  // FETCH RIWAYAT PENGGAJIAN
  // Ambil semua record penggajian milik karyawan ini
  // Diurutkan dari bulan terbaru ke terlama
  // ============================================
  const { data: riwayat } = await supabase
    .from('penggajian')
    .select('*')
    .eq('karyawan_id', id)                        // Filter by karyawan_id
    .order('pay_period', { ascending: false })    // Desember 2025 tampil paling atas

  // Tampilkan error jika karyawan tidak ditemukan (UUID salah atau data terhapus)
  if (!karyawan) {
    return (
      <div className="p-6 text-red-400">
        Karyawan tidak ditemukan.
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-900 min-h-screen text-white">

      {/* Link navigasi kembali ke halaman payroll */}
      <Link
        href="/dashboard/payroll"
        className="text-sm text-gray-400 hover:text-white mb-6 inline-block"
      >
        ← Kembali ke Payroll
      </Link>

      {/* Card profil karyawan — nama, ID, jabatan, departemen, usia */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-6">
        <h1 className="text-2xl font-bold text-blue-400 mb-1">{karyawan.nama}</h1>
        <p className="text-gray-400 text-sm">ID: {karyawan.employee_id}</p>

        {/* Grid 3 kolom untuk detail karyawan */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div>
            <p className="text-xs text-gray-500">Jabatan</p>
            {/* Operator ?? '-' : tampilkan '-' jika jabatan null */}
            <p className="text-sm text-gray-200">{karyawan.jabatan?.nama ?? '-'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Departemen</p>
            <p className="text-sm text-gray-200">{karyawan.departemen?.nama ?? '-'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Usia</p>
            <p className="text-sm text-gray-200">{karyawan.age ?? '-'} tahun</p>
          </div>
        </div>
      </div>

      {/* Header riwayat — tampilkan jumlah periode yang tersedia */}
      <h2 className="text-lg font-semibold text-gray-200 mb-4">
        Riwayat Penggajian ({riwayat?.length ?? 0} periode)
      </h2>

      {/* Daftar card per periode penggajian */}
      <div className="space-y-3">
        {riwayat?.map((p) => (
          <div
            key={p.id}
            className="bg-gray-800 rounded-xl border border-gray-700 p-4"
          >
            {/* Baris atas: nama bulan dan net pay */}
            <div className="flex justify-between items-center mb-3">
              {/* Format tanggal "2025-07-01" → "Juli 2025" */}
              <p className="font-medium text-white">{formatPeriod(p.pay_period)}</p>
              {/* Net pay ditampilkan besar dan hijau sebagai highlight utama */}
              <span className="text-green-400 font-bold text-lg">
                {formatSalary(p.net_pay)}
              </span>
            </div>

            {/* Grid 3 kolom: rincian komponen gaji */}
            <div className="grid grid-cols-3 gap-3 text-sm">
              {/* Gross salary — gaji kotor sebelum potongan */}
              <div className="bg-gray-900 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Gross</p>
                <p className="text-white font-medium">{formatSalary(p.gross)}</p>
              </div>
              {/* Deduction — total potongan, ditampilkan merah */}
              <div className="bg-gray-900 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Deduction</p>
                <p className="text-red-400 font-medium">-{formatSalary(p.deduction)}</p>
              </div>
              {/* Persentase potongan dari gross */}
              <div className="bg-gray-900 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Deduction %</p>
                {/* toFixed(2): tampilkan 2 angka desimal */}
                <p className="text-yellow-400 font-medium">
                  {Number(p.deduction_percentage).toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}