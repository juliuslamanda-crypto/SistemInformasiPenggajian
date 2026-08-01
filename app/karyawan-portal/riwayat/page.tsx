// app/karyawan-portal/riwayat/page.tsx
import { createClient } from '@/lib/supabase/server'
import { formatRupiah, formatPeriod, PayrollRecord } from '@/lib/payrollHelper'
import Link from 'next/link'

export default async function RiwayatGajiKaryawanPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: karyawan } = await supabase
    .from('karyawan')
    .select('id, nama, employee_id')
    .eq('user_id', user?.id)
    .single()

  if (!karyawan) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="bg-white border border-deduction/30 p-6 text-deduction text-sm">
          Data karyawan tidak ditemukan.
        </div>
      </div>
    )
  }

  const { data: riwayat } = await supabase
    .from('penggajian')
    .select('*')
    .eq('karyawan_id', karyawan.id)
    .order('tahun', { ascending: false })
    .order('bulan', { ascending: false })
    .returns<PayrollRecord[]>()

  return (
    <div className="p-8 max-w-2xl mx-auto min-h-screen">

      <Link href="/karyawan-portal" className="text-xs text-muted hover:text-accent transition-colors mb-6 inline-block">
        ← Kembali
      </Link>

      <div className="bg-white border border-border-hairline p-8">

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-accent" />
            <p className="text-xs text-muted">{karyawan.employee_id}</p>
          </div>
          <h1 className="font-display text-xl text-foreground">{karyawan.nama}</h1>
        </div>

        <p className="text-xs text-muted mb-4">
          Riwayat gaji — {riwayat?.length ?? 0} periode
        </p>

        <div className="space-y-6">
          {riwayat?.map((p) => (
            <div key={p.id} className="border-t border-border-hairline pt-4">
              <div className="flex justify-between items-center mb-2">
                <p className="font-display text-base text-foreground">{formatPeriod(p.bulan, p.tahun)}</p>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-base font-medium text-net-pay">
                    {formatRupiah(p.gaji_bersih)}
                  </span>
                  <Link
                    href={`/karyawan-portal/slip/${p.bulan}/${p.tahun}`}
                    className="text-xs text-accent underline underline-offset-2"
                  >
                    Cetak
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {(!riwayat || riwayat.length === 0) && (
            <p className="text-sm text-muted py-6 text-center">Belum ada data gaji.</p>
          )}
        </div>

      </div>
    </div>
  )
}