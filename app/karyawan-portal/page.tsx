import { createClient } from '@/lib/supabase/server'
import { formatRupiah, formatPeriod } from '@/lib/payrollHelper'
import Link from 'next/link'

export default async function KaryawanPortalPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: karyawan } = await supabase
    .from('karyawan')
    .select(`*, jabatan(nama), departemen(nama)`)
    .eq('user_id', user?.id)
    .single()

  if (!karyawan) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="bg-white border border-deduction/30 p-6 text-deduction text-sm">
          Data karyawan tidak ditemukan. Hubungi HRD.
        </div>
      </div>
    )
  }

  // Ambil gaji periode terbaru milik karyawan ini saja
  const { data: gajiTerbaru } = await supabase
    .from('penggajian')
    .select('*')
    .eq('karyawan_id', karyawan.id)
    .order('tahun', { ascending: false })
    .order('bulan', { ascending: false })
    .limit(1)
    .maybeSingle()

  return (
    <div className="p-8 max-w-2xl mx-auto min-h-screen">
      <div className="bg-white border border-border-hairline p-8">

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-accent" />
            <p className="text-sm font-medium tracking-wide text-foreground">Portal Karyawan</p>
          </div>
          <h1 className="font-display text-xl text-foreground/80">
            Selamat datang, {karyawan.nama}
          </h1>
        </div>

        <div className="grid grid-cols-3 gap-4 border-t border-b border-border-strong py-4 mb-6">
          <div>
            <p className="text-xs text-muted mb-1">Jabatan</p>
            <p className="text-sm text-foreground">{karyawan.jabatan?.nama ?? '-'}</p>
          </div>
          <div>
            <p className="text-xs text-muted mb-1">Departemen</p>
            <p className="text-sm text-foreground">{karyawan.departemen?.nama ?? '-'}</p>
          </div>
          <div>
            <p className="text-xs text-muted mb-1">ID Karyawan</p>
            <p className="text-sm text-foreground">{karyawan.employee_id}</p>
          </div>
        </div>

        {gajiTerbaru ? (
          <div className="mb-6">
            <p className="text-xs text-muted uppercase tracking-wide mb-2">
              Gaji Terbaru — {formatPeriod(gajiTerbaru.bulan, gajiTerbaru.tahun)}
            </p>
            <div className="flex justify-between items-baseline py-3">
              <span className="text-sm font-medium text-foreground">Gaji bersih</span>
              <span className="font-mono text-xl font-medium text-net-pay">
                {formatRupiah(gajiTerbaru.gaji_bersih)}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted mb-6">Belum ada data gaji.</p>
        )}

        <Link
          href="/karyawan-portal/riwayat"
          className="inline-block text-xs text-accent underline underline-offset-2"
        >
          Lihat riwayat gaji lengkap →
        </Link>

      </div>
    </div>
  )
}