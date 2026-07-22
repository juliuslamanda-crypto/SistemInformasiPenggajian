// app/dashboard/payroll/[id]/page.tsx
import { supabase } from '@/lib/supabaseClient'
import { formatSalary, formatPeriod } from '@/lib/payrollHelper'
import Link from 'next/link'

export default async function SlipGajiPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // Fetch data karyawan
  const { data: karyawan } = await supabase
    .from('karyawan')
    .select(`*, jabatan(nama), departemen(nama)`)
    .eq('id', id)
    .single()

  // Fetch semua riwayat penggajian karyawan ini
  const { data: riwayat } = await supabase
    .from('penggajian')
    .select('*')
    .eq('karyawan_id', id)
    .order('pay_period', { ascending: false })

  if (!karyawan) {
    return (
      <div className="p-6 text-red-400">
        Karyawan tidak ditemukan.
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-900 min-h-screen text-white">

      {/* Tombol kembali */}
      <Link
        href="/dashboard/payroll"
        className="text-sm text-gray-400 hover:text-white mb-6 inline-block"
      >
        ← Kembali ke Payroll
      </Link>

      {/* Info Karyawan */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-6">
        <h1 className="text-2xl font-bold text-blue-400 mb-1">{karyawan.nama}</h1>
        <p className="text-gray-400 text-sm">ID: {karyawan.employee_id}</p>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div>
            <p className="text-xs text-gray-500">Jabatan</p>
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

      {/* Riwayat Penggajian */}
      <h2 className="text-lg font-semibold text-gray-200 mb-4">
        Riwayat Penggajian ({riwayat?.length ?? 0} periode)
      </h2>

      <div className="space-y-3">
        {riwayat?.map((p) => (
          <div
            key={p.id}
            className="bg-gray-800 rounded-xl border border-gray-700 p-4"
          >
            <div className="flex justify-between items-center mb-3">
              <p className="font-medium text-white">{formatPeriod(p.pay_period)}</p>
              <span className="text-green-400 font-bold text-lg">
                {formatSalary(p.net_pay)}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="bg-gray-900 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Gross</p>
                <p className="text-white font-medium">{formatSalary(p.gross)}</p>
              </div>
              <div className="bg-gray-900 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Deduction</p>
                <p className="text-red-400 font-medium">-{formatSalary(p.deduction)}</p>
              </div>
              <div className="bg-gray-900 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Deduction %</p>
                <p className="text-yellow-400 font-medium">{Number(p.deduction_percentage).toFixed(2)}%</p>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}