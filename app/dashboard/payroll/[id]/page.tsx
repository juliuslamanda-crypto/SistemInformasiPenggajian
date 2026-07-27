// app/dashboard/payroll/[id]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { formatRupiah, formatPeriod, PayrollRecord } from '@/lib/payrollHelper'
import Link from 'next/link'

export default async function SlipGajiPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()

  const { id } = await params

  const { data: karyawan } = await supabase
    .from('karyawan')
    .select(`*, jabatan(nama), departemen(nama)`)
    .eq('id', id)
    .single()

  const { data: riwayat } = await supabase
    .from('penggajian')
    .select('*')
    .eq('karyawan_id', id)
    .order('tahun', { ascending: false })
    .order('bulan', { ascending: false })
    .returns<PayrollRecord[]>()

  if (!karyawan) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-white border border-deduction/30 p-6 text-deduction text-sm">
          Karyawan tidak ditemukan.
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto min-h-screen">

      <Link href="/dashboard/payroll" className="text-xs text-muted hover:text-accent transition-colors mb-6 inline-block">
        ← Kembali ke penggajian
      </Link>

      <div className="bg-white border border-border-hairline p-8">

        {/* Info karyawan */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-accent" />
            <p className="text-xs text-muted">{karyawan.employee_id}</p>
          </div>
          <h1 className="font-display text-xl text-foreground mb-4">{karyawan.nama}</h1>

          <div className="grid grid-cols-3 border-t border-b border-border-strong py-4">
            <div>
              <p className="text-xs text-muted mb-1">Jabatan</p>
              <p className="text-sm text-foreground">{karyawan.jabatan?.nama ?? '-'}</p>
            </div>
            <div>
              <p className="text-xs text-muted mb-1">Departemen</p>
              <p className="text-sm text-foreground">{karyawan.departemen?.nama ?? '-'}</p>
            </div>
            <div>
              <p className="text-xs text-muted mb-1">Usia</p>
              <p className="text-sm text-foreground">{karyawan.age ?? '-'} tahun</p>
            </div>
          </div>
        </div>

        {/* Riwayat penggajian */}
        <p className="text-xs text-muted mb-4">
          Riwayat penggajian — {riwayat?.length ?? 0} periode
        </p>

        <div className="space-y-6">
          {riwayat?.map((p) => (
            <div key={p.id} className="border-t border-border-hairline pt-4">

              {/* Header periode */}
              <div className="flex justify-between items-center mb-4">
                <p className="font-display text-base text-foreground">{formatPeriod(p.bulan, p.tahun)}</p>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-base font-medium text-net-pay">{formatRupiah(p.gaji_bersih)}</span>
                  <Link
                    href={`/dashboard/payroll/${id}/slip/${p.bulan}/${p.tahun}`}
                    className="text-xs text-accent underline underline-offset-2"
                  >
                    Cetak
                  </Link>
                </div>
              </div>

              {/* Pendapatan */}
              <div className="mb-4">
                <p className="text-xs text-muted mb-2 uppercase tracking-wide">Pendapatan</p>
                <div className="flex justify-between items-baseline py-1.5 border-b border-border-hairline text-sm">
                  <span className="text-foreground/70">Gaji pokok</span>
                  <span className="font-mono text-foreground">{formatRupiah(p.gaji_pokok)}</span>
                </div>
                <div className="flex justify-between items-baseline py-1.5 border-b border-border-hairline text-sm">
                  <span className="text-foreground/70">Tunjangan jabatan</span>
                  <span className="font-mono text-foreground">{formatRupiah(p.tunjangan_jabatan)}</span>
                </div>
                <div className="flex justify-between items-baseline py-1.5 border-b border-border-hairline text-sm">
                  <span className="text-foreground/70">Tunjangan makan</span>
                  <span className="font-mono text-foreground">{formatRupiah(p.tunjangan_makan)}</span>
                </div>
                <div className="flex justify-between items-baseline py-1.5 border-b border-border-hairline text-sm">
                  <span className="text-foreground/70">Tunjangan transport</span>
                  <span className="font-mono text-foreground">{formatRupiah(p.tunjangan_transport)}</span>
                </div>
                <div className="flex justify-between items-baseline pt-2 text-sm">
                  <span className="font-medium text-foreground">Total gaji kotor</span>
                  <span className="font-mono font-medium text-foreground">{formatRupiah(p.gaji_kotor)}</span>
                </div>
              </div>

              {/* Potongan */}
              <div>
                <p className="text-xs text-muted mb-2 uppercase tracking-wide">Potongan</p>
                <div className="flex justify-between items-baseline py-1.5 border-b border-border-hairline text-sm">
                  <span className="text-foreground/70">BPJS kesehatan</span>
                  <span className="font-mono text-deduction">-{formatRupiah(p.bpjs_kesehatan)}</span>
                </div>
                <div className="flex justify-between items-baseline py-1.5 border-b border-border-hairline text-sm">
                  <span className="text-foreground/70">BPJS ketenagakerjaan</span>
                  <span className="font-mono text-deduction">-{formatRupiah(p.bpjs_ketenagakerjaan)}</span>
                </div>
                <div className="flex justify-between items-baseline py-1.5 border-b border-border-hairline text-sm">
                  <span className="text-foreground/70">PPh 21</span>
                  <span className="font-mono text-deduction">-{formatRupiah(p.pph21)}</span>
                </div>
                <div className="flex justify-between items-baseline pt-2 text-sm">
                  <span className="font-medium text-foreground">Total potongan</span>
                  <span className="font-mono font-medium text-deduction">-{formatRupiah(p.total_potongan)}</span>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  )
}