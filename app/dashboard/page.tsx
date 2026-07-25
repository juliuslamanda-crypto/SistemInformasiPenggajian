// app/dashboard/page.tsx
import { supabase } from '@/lib/supabaseClient'
import { formatRupiah, formatPeriod } from '@/lib/payrollHelper'
import Link from 'next/link'

export default async function DashboardPage() {
  const [
    { count: totalKaryawan },
    { data: jabatanData },      // Ambil data jabatan beserta relasi karyawan
    { count: totalDepartemen },
    { data: penggajianBulanIni },
    { data: penggajianBulanLalu },
  ] = await Promise.all([
    supabase.from('karyawan').select('*', { count: 'exact', head: true }),
    // Ambil semua jabatan beserta id karyawan yang punya jabatan tersebut
    supabase.from('jabatan').select('id, karyawan(id)'),
    supabase.from('departemen').select('*', { count: 'exact', head: true }),
    supabase.from('penggajian')
      .select('gaji_kotor, total_potongan, gaji_bersih')
      .eq('bulan', 12)
      .eq('tahun', 2025),
    supabase.from('penggajian')
      .select('gaji_bersih')
      .eq('bulan', 11)
      .eq('tahun', 2025),
  ])

  // Hitung hanya jabatan yang benar-benar dipakai karyawan
  // filter: jabatan yang punya minimal 1 karyawan
  const totalJabatan = jabatanData?.filter((j: any) => j.karyawan?.length > 0).length ?? 0

  // Hitung total penggajian Desember 2025
  const totalGajiKotor  = penggajianBulanIni?.reduce((sum, p) => sum + Number(p.gaji_kotor), 0) ?? 0
  const totalPotongan   = penggajianBulanIni?.reduce((sum, p) => sum + Number(p.total_potongan), 0) ?? 0
  const totalGajiBersih = penggajianBulanIni?.reduce((sum, p) => sum + Number(p.gaji_bersih), 0) ?? 0

  // Perbandingan dengan November 2025
  const totalGajiBersihLalu = penggajianBulanLalu?.reduce((sum, p) => sum + Number(p.gaji_bersih), 0) ?? 0
  const selisih = totalGajiBersih - totalGajiBersihLalu
  const selisihPersen = totalGajiBersihLalu > 0
    ? ((selisih / totalGajiBersihLalu) * 100).toFixed(1) : '0'

  const stats = [
    {
      label: 'Total Karyawan',
      value: totalKaryawan ?? 0,
      sub: 'karyawan aktif',
      color: 'text-blue-400',
      bg: 'border-blue-500/30',
    },
    {
      label: 'Total Jabatan',
      value: totalJabatan,
      sub: 'jenis jabatan',
      color: 'text-purple-400',
      bg: 'border-purple-500/30',
    },
    {
      label: 'Total Departemen',
      value: totalDepartemen ?? 0,
      sub: 'departemen',
      color: 'text-yellow-400',
      bg: 'border-yellow-500/30',
    },
    {
      label: 'Karyawan Digaji',
      value: penggajianBulanIni?.length ?? 0,
      sub: 'bulan Desember 2025',
      color: 'text-green-400',
      bg: 'border-green-500/30',
    },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-900 min-h-screen text-white">

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-blue-400">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">
          Sistem Informasi Penggajian — ABC Company
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className={`bg-gray-800 rounded-xl border ${s.bg} p-5`}>
            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-200">
            Ringkasan Penggajian — {formatPeriod(12, 2025)}
          </h2>
          <Link
            href="/dashboard/payroll?period=12-2025"
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            Lihat detail →
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-900 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Total Gaji Kotor</p>
            <p className="text-xl font-bold text-white">{formatRupiah(totalGajiKotor)}</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Total Potongan</p>
            <p className="text-xl font-bold text-red-400">-{formatRupiah(totalPotongan)}</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Total Gaji Bersih</p>
            <p className="text-xl font-bold text-green-400">{formatRupiah(totalGajiBersih)}</p>
          </div>
        </div>

        <div className="mt-4 p-3 bg-gray-900 rounded-lg">
          <p className="text-xs text-gray-500">
            Dibanding bulan lalu ({formatPeriod(11, 2025)}):
            <span className={`ml-2 font-medium ${selisih >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {selisih >= 0 ? '+' : ''}{formatRupiah(selisih)} ({selisihPersen}%)
            </span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Link href="/dashboard/karyawan" className="bg-gray-800 hover:bg-gray-750 border border-gray-700 rounded-xl p-5 transition-colors">
          <p className="text-blue-400 font-semibold mb-1">Data Karyawan</p>
          <p className="text-xs text-gray-500">Lihat semua karyawan aktif</p>
        </Link>
        <Link href="/dashboard/payroll" className="bg-gray-800 hover:bg-gray-750 border border-gray-700 rounded-xl p-5 transition-colors">
          <p className="text-green-400 font-semibold mb-1">Penggajian</p>
          <p className="text-xs text-gray-500">Kelola penggajian bulanan</p>
        </Link>
        <Link href="/dashboard/jabatan" className="bg-gray-800 hover:bg-gray-750 border border-gray-700 rounded-xl p-5 transition-colors">
          <p className="text-purple-400 font-semibold mb-1">Jabatan</p>
          <p className="text-xs text-gray-500">Lihat daftar jabatan</p>
        </Link>
      </div>

    </div>
  )
}