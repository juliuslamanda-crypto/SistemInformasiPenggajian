// app/dashboard/page.tsx
import { supabase } from '@/lib/supabaseClient'
import { formatSalary, formatPeriod } from '@/lib/payrollHelper'
import Link from 'next/link'

export default async function DashboardPage() {
  const bulanIni = new Date().toISOString().slice(0, 7) + '-01'

  const [
    { count: totalKaryawan },
    { count: totalJabatan },
    { count: totalDepartemen },
    { data: penggajianBulanIni },
    { data: penggajianBulanLalu },
  ] = await Promise.all([
    supabase.from('karyawan').select('*', { count: 'exact', head: true }),
    supabase.from('jabatan').select('*', { count: 'exact', head: true }),
    supabase.from('departemen').select('*', { count: 'exact', head: true }),
    supabase.from('penggajian').select('gross, deduction, net_pay').eq('pay_period', '2025-12-01'),
    supabase.from('penggajian').select('net_pay').eq('pay_period', '2025-11-01'),
  ])

  const totalGross    = penggajianBulanIni?.reduce((sum, p) => sum + Number(p.gross), 0) ?? 0
  const totalDeduction = penggajianBulanIni?.reduce((sum, p) => sum + Number(p.deduction), 0) ?? 0
  const totalNetPay   = penggajianBulanIni?.reduce((sum, p) => sum + Number(p.net_pay), 0) ?? 0
  const rataRata      = penggajianBulanIni && penggajianBulanIni.length > 0
    ? totalNetPay / penggajianBulanIni.length : 0

  const totalNetPayLalu = penggajianBulanLalu?.reduce((sum, p) => sum + Number(p.net_pay), 0) ?? 0
  const selisih = totalNetPay - totalNetPayLalu
  const selisihPersen = totalNetPayLalu > 0 ? ((selisih / totalNetPayLalu) * 100).toFixed(1) : '0'

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
      value: totalJabatan ?? 0,
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

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-blue-400">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">
          Sistem Informasi Penggajian — ABC Company
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className={`bg-gray-800 rounded-xl border ${s.bg} p-5`}>
            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Ringkasan Gaji Bulan Ini */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-200">
            Ringkasan Penggajian — Desember 2025
          </h2>
          <Link
            href="/dashboard/payroll?period=2025-12-01"
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            Lihat detail →
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-900 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Total Gross</p>
            <p className="text-xl font-bold text-white">{formatSalary(totalGross)}</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Total Deduction</p>
            <p className="text-xl font-bold text-red-400">-{formatSalary(totalDeduction)}</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">Total Net Pay</p>
            <p className="text-xl font-bold text-green-400">{formatSalary(totalNetPay)}</p>
          </div>
        </div>

        {/* Perbandingan bulan lalu */}
        <div className="mt-4 p-3 bg-gray-900 rounded-lg">
          <p className="text-xs text-gray-500">
            Dibanding bulan lalu (November 2025):
            <span className={`ml-2 font-medium ${selisih >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {selisih >= 0 ? '+' : ''}{formatSalary(selisih)} ({selisihPersen}%)
            </span>
          </p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-3 gap-4">
        <Link href="/dashboard/karyawan" className="bg-gray-800 hover:bg-gray-750 border border-gray-700 rounded-xl p-5 transition-colors">
          <p className="text-blue-400 font-semibold mb-1">Data Karyawan</p>
          <p className="text-xs text-gray-500">Lihat semua karyawan aktif</p>
        </Link>
        <Link href="/dashboard/payroll" className="bg-gray-800 hover:bg-gray-750 border border-gray-700 rounded-xl p-5 transition-colors">
          <p className="text-green-400 font-semibold mb-1">Payroll</p>
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