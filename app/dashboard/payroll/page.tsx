// app/dashboard/payroll/page.tsx
import { createClient } from '@/lib/supabase/server'
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
  const supabase = await createClient()

  const { period } = await searchParams
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
      <div className="p-8 max-w-6xl mx-auto">
        <div className="bg-white border border-deduction/30 p-6 text-deduction">
          <p className="font-medium text-sm">Error mengambil data penggajian</p>
          <p className="text-xs mt-1">{error.message}</p>
        </div>
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
    <div className="p-8 max-w-6xl mx-auto min-h-screen">
      <div className="bg-white border border-border-hairline p-8">

        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <p className="text-sm font-medium tracking-wide text-foreground">Penggajian</p>
            </div>
            <h1 className="font-display text-xl text-foreground/80">
              Periode {formatPeriod(bulan, tahun)}
            </h1>
          </div>
          <div className="flex gap-3 items-center">
            <InputGajiForm karyawanList={karyawanList ?? []} />
            <PeriodFilter options={periodOptions} selected={selectedPeriod} />
          </div>
        </div>

        {/* Ringkasan — hairline row, konsisten sama dashboard */}
        <div className="grid grid-cols-4 border-t border-b border-border-strong py-4 mb-8">
          <div>
            <p className="text-xs text-muted mb-1">Karyawan digaji</p>
            <p className="font-display text-2xl text-foreground">{stats.jumlahKaryawan}</p>
          </div>
          <div>
            <p className="text-xs text-muted mb-1">Total gaji kotor</p>
            <p className="font-mono text-lg text-foreground">{formatRupiah(stats.totalGajiKotor)}</p>
          </div>
          <div>
            <p className="text-xs text-muted mb-1">Total potongan</p>
            <p className="font-mono text-lg text-deduction">{formatRupiah(stats.totalPotongan)}</p>
          </div>
          <div>
            <p className="text-xs text-muted mb-1">Rata-rata gaji bersih</p>
            <p className="font-mono text-lg text-net-pay">{formatRupiah(stats.rataRataGajiBersih)}</p>
          </div>
        </div>

        {/* Tabel penggajian — hairline row, bukan card striped abu-abu */}
        <div className="border-t border-border-strong">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border-hairline">
                <th className="py-3 text-xs font-medium text-muted">Karyawan</th>
                <th className="py-3 text-xs font-medium text-muted">Jabatan</th>
                <th className="py-3 text-xs font-medium text-muted">Gaji pokok</th>
                <th className="py-3 text-xs font-medium text-muted">Tunjangan</th>
                <th className="py-3 text-xs font-medium text-muted">Gaji kotor</th>
                <th className="py-3 text-xs font-medium text-muted">Potongan</th>
                <th className="py-3 text-xs font-medium text-muted">Gaji bersih</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-muted text-sm">
                    Tidak ada data penggajian untuk periode ini
                  </td>
                </tr>
              ) : (
                data.map((p) => (
                  <tr key={p.id} className="border-b border-border-hairline hover:bg-background transition-colors">
                    <td className="py-3">
                      <Link
                        href={`/dashboard/payroll/${p.karyawan_id}`}
                        className="font-medium text-foreground hover:text-accent transition-colors"
                      >
                        {p.karyawan?.nama}
                      </Link>
                      <p className="text-xs text-muted">{p.karyawan?.employee_id}</p>
                    </td>
                    <td className="py-3 text-xs">
                      <p className="text-foreground/80">{p.karyawan?.jabatan?.nama ?? '-'}</p>
                      <p className="text-muted">{p.karyawan?.departemen?.nama ?? '-'}</p>
                    </td>
                    <td className="py-3 font-mono text-xs text-foreground/80">{formatRupiah(p.gaji_pokok)}</td>
                    <td className="py-3 text-xs text-foreground/70">
                      <p>Jabatan: {formatRupiah(p.tunjangan_jabatan)}</p>
                      <p>Makan: {formatRupiah(p.tunjangan_makan)}</p>
                      <p>Transport: {formatRupiah(p.tunjangan_transport)}</p>
                    </td>
                    <td className="py-3 font-mono text-xs font-medium text-foreground">{formatRupiah(p.gaji_kotor)}</td>
                    <td className="py-3 text-xs text-deduction">
                      <p>BPJS Kes: -{formatRupiah(p.bpjs_kesehatan)}</p>
                      <p>BPJS TK: -{formatRupiah(p.bpjs_ketenagakerjaan)}</p>
                      <p>PPh 21: -{formatRupiah(p.pph21)}</p>
                    </td>
                    <td className="py-3">
                      <span className="font-mono text-sm font-medium text-net-pay">{formatRupiah(p.gaji_bersih)}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}