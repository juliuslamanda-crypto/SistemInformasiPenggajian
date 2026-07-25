// app/dashboard/payroll/page.tsx
import { supabase } from '@/lib/supabaseClient'
import {
  formatRupiah,
  formatPeriod,
  hitungStatistik,
  getPeriodOptions,
  PayrollRecord,
} from '@/lib/payrollHelper'
import PeriodFilter from './PeriodFilter'
import Link from 'next/link'
import InputGajiForm from './InputGajiForm'

export default async function PayrollPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>
}) {
  const { period } = await searchParams
  // Default: Januari 2025, format: "bulan-tahun"
  const selectedPeriod = period || '1-2025'
  const [bulan, tahun] = selectedPeriod.split('-').map(Number)

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
    .eq('bulan', bulan)
    .eq('tahun', tahun)
    .order('gaji_bersih', { ascending: false })

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

  const { data: karyawanList } = await supabase
  .from('karyawan')
  .select('id, nama, employee_id')
  .order('nama')

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-900 min-h-screen text-white">

      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-blue-400">Penggajian</h1>
          <p className="text-sm text-gray-400 mt-1">
            Periode {formatPeriod(bulan, tahun)}
          </p>
        </div>
        <div className="flex gap-3 items-center">
  <InputGajiForm karyawanList={karyawanList ?? []} />
  <PeriodFilter options={periodOptions} selected={selectedPeriod} />
</div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
          <p className="text-xs text-gray-400 mb-1">Karyawan digaji</p>
          <p className="text-2xl font-bold text-white">{stats.jumlahKaryawan}</p>
        </div>
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
          <p className="text-xs text-gray-400 mb-1">Total Gaji Kotor</p>
          <p className="text-lg font-bold text-blue-400">{formatRupiah(stats.totalGajiKotor)}</p>
        </div>
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
          <p className="text-xs text-gray-400 mb-1">Total Potongan</p>
          <p className="text-lg font-bold text-red-400">{formatRupiah(stats.totalPotongan)}</p>
        </div>
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
          <p className="text-xs text-gray-400 mb-1">Rata-rata Gaji Bersih</p>
          <p className="text-lg font-bold text-green-400">{formatRupiah(stats.rataRataGajiBersih)}</p>
        </div>
      </div>

      {/* Tabel Penggajian */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-700 text-gray-300">
            <tr>
              <th className="p-4">Karyawan</th>
              <th className="p-4">Jabatan</th>
              <th className="p-4">Gaji Pokok</th>
              <th className="p-4">Tunjangan</th>
              <th className="p-4">Gaji Kotor</th>
              <th className="p-4">Potongan</th>
              <th className="p-4">Gaji Bersih</th>
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
                    <Link
                      href={`/dashboard/payroll/${p.karyawan_id}`}
                      className="font-medium text-blue-400 hover:text-blue-300 hover:underline"
                    >
                      {p.karyawan?.nama}
                    </Link>
                    <p className="text-xs text-gray-400">{p.karyawan?.employee_id}</p>
                  </td>
                  <td className="p-4 text-xs">
                    <p className="text-gray-300">{p.karyawan?.jabatan?.nama ?? '-'}</p>
                    <p className="text-gray-500">{p.karyawan?.departemen?.nama ?? '-'}</p>
                  </td>
                  <td className="p-4 text-gray-300">{formatRupiah(p.gaji_pokok)}</td>
                  <td className="p-4 text-blue-300 text-xs">
                    <p>Jabatan: {formatRupiah(p.tunjangan_jabatan)}</p>
                    <p>Makan: {formatRupiah(p.tunjangan_makan)}</p>
                    <p>Transport: {formatRupiah(p.tunjangan_transport)}</p>
                  </td>
                  <td className="p-4 text-white font-medium">{formatRupiah(p.gaji_kotor)}</td>
                  <td className="p-4 text-xs">
                    <p className="text-red-400">BPJS Kes: -{formatRupiah(p.bpjs_kesehatan)}</p>
                    <p className="text-red-400">BPJS TK: -{formatRupiah(p.bpjs_ketenagakerjaan)}</p>
                    <p className="text-red-400">PPh 21: -{formatRupiah(p.pph21)}</p>
                  </td>
                  <td className="p-4">
                    <span className="text-green-400 font-bold">{formatRupiah(p.gaji_bersih)}</span>
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