// app/dashboard/payroll/page.tsx
import { supabase } from '@/lib/supabaseClient'
import {
  formatSalary,
  formatPeriod,
  hitungStatistik,
  getPeriodOptions,
  PayrollRecord,
} from '@/lib/payrollHelper'
import PeriodFilter from './PeriodFilter'

export default async function PayrollPage({
  searchParams,
}: {
  searchParams: { period?: string }
}) {
  const selectedPeriod = searchParams.period || '2025-01-01'

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
    .eq('pay_period', selectedPeriod)
    .order('net_pay', { ascending: false })

  if (error) {
    return (
      <div className="p-6 bg-red-900/20 border border-red-500/30 rounded-xl text-red-400">
        <p className="font-bold">Error mengambil data penggajian</p>
        <p className="text-sm mt-1">{error.message}</p>
      </div>
    )
  }

  const data = (payrollData as PayrollRecord[]) || []
  const stats = hitungStatistik(data)
  const periodOptions = getPeriodOptions()

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-900 min-h-screen text-white">

      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-blue-400">Payroll</h1>
          <p className="text-sm text-gray-400 mt-1">
            Data penggajian periode {formatPeriod(selectedPeriod)}
          </p>
        </div>
        <PeriodFilter options={periodOptions} selected={selectedPeriod} />
      </div>

      {/* Summary Cards */}
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

      {/* Tabel Penggajian */}
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
            {data.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">
                  Tidak ada data penggajian untuk periode ini
                </td>
              </tr>
            ) : (
              data.map((p) => (
                <tr key={p.id} className="hover:bg-gray-750 transition-colors">
                  <td className="p-4">
                    <p className="font-medium text-white">{p.karyawan?.nama}</p>
                    <p className="text-xs text-gray-400">{p.karyawan?.employee_id}</p>
                  </td>
                  <td className="p-4 text-gray-300 text-xs">
                    {p.karyawan?.jabatan?.nama ?? '-'}
                  </td>
                  <td className="p-4 text-gray-400 text-xs">
                    {p.karyawan?.departemen?.nama ?? '-'}
                  </td>
                  <td className="p-4 text-white font-medium">
                    {formatSalary(p.gross)}
                  </td>
                  <td className="p-4 text-red-400">
                    -{formatSalary(p.deduction)}
                  </td>
                  <td className="p-4 text-yellow-400">
                    {Number(p.deduction_percentage).toFixed(2)}%
                  </td>
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