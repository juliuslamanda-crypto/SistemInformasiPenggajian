// app/karyawan-portal/slip/[bulan]/[tahun]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { formatRupiah, formatPeriod } from '@/lib/payrollHelper'
import PrintButton from './PrintButton'
import Link from 'next/link'

export default async function SlipGajiKaryawanPage({
  params,
}: {
  params: Promise<{ bulan: string; tahun: string }>
}) {
  const supabase = await createClient()

  const { bulan, tahun } = await params

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
          Data karyawan tidak ditemukan.
        </div>
      </div>
    )
  }

  // Query ini otomatis dibatasi RLS ke data milik karyawan sendiri,
  // tapi tetap ditambah filter karyawan_id di sini sebagai pertahanan berlapis
  const { data: penggajian } = await supabase
    .from('penggajian')
    .select('*')
    .eq('karyawan_id', karyawan.id)
    .eq('bulan', parseInt(bulan))
    .eq('tahun', parseInt(tahun))
    .single()

  if (!penggajian) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="bg-white border border-deduction/30 p-6 text-deduction text-sm">
          Data gaji untuk periode ini tidak ditemukan.
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="print:hidden p-4 bg-background flex gap-4 items-center border-b border-border-hairline">
        <Link
          href="/karyawan-portal/riwayat"
          className="text-xs text-muted hover:text-accent transition-colors"
        >
          ← Kembali
        </Link>
        <PrintButton />
      </div>

      <div className="p-8 max-w-2xl mx-auto bg-white text-foreground min-h-screen print:p-6">

        <div className="text-center mb-8 pb-6 border-b border-border-strong">
          <div className="w-2 h-2 rounded-full bg-accent mx-auto mb-3" />
          <h1 className="font-display text-2xl text-foreground">ABC Company</h1>
          <p className="text-muted text-sm mt-1">Slip gaji karyawan</p>
          <p className="text-muted text-sm">Periode: {formatPeriod(penggajian.bulan, penggajian.tahun)}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8 pb-6 border-b border-border-hairline">
          <div>
            <p className="text-xs text-muted">Nama karyawan</p>
            <p className="font-medium text-foreground">{karyawan.nama}</p>
          </div>
          <div>
            <p className="text-xs text-muted">ID karyawan</p>
            <p className="font-medium text-foreground">{karyawan.employee_id}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Jabatan</p>
            <p className="font-medium text-foreground">{karyawan.jabatan?.nama ?? '-'}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Departemen</p>
            <p className="font-medium text-foreground">{karyawan.departemen?.nama ?? '-'}</p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-xs text-muted mb-2 uppercase tracking-wide">Pendapatan</p>
          <div className="flex justify-between items-baseline py-2 border-b border-border-hairline text-sm">
            <span className="text-foreground/70">Gaji pokok</span>
            <span className="font-mono text-foreground">{formatRupiah(penggajian.gaji_pokok)}</span>
          </div>
          <div className="flex justify-between items-baseline py-2 border-b border-border-hairline text-sm">
            <span className="text-foreground/70">Tunjangan jabatan</span>
            <span className="font-mono text-foreground">{formatRupiah(penggajian.tunjangan_jabatan)}</span>
          </div>
          <div className="flex justify-between items-baseline py-2 border-b border-border-hairline text-sm">
            <span className="text-foreground/70">Tunjangan makan</span>
            <span className="font-mono text-foreground">{formatRupiah(penggajian.tunjangan_makan)}</span>
          </div>
          <div className="flex justify-between items-baseline py-2 border-b border-border-strong text-sm">
            <span className="text-foreground/70">Tunjangan transport</span>
            <span className="font-mono text-foreground">{formatRupiah(penggajian.tunjangan_transport)}</span>
          </div>
          <div className="flex justify-between items-baseline pt-2 text-sm">
            <span className="font-medium text-foreground">Total gaji kotor</span>
            <span className="font-mono font-medium text-foreground">{formatRupiah(penggajian.gaji_kotor)}</span>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-xs text-muted mb-2 uppercase tracking-wide">Potongan</p>
          <div className="flex justify-between items-baseline py-2 border-b border-border-hairline text-sm">
            <span className="text-foreground/70">BPJS kesehatan (1%)</span>
            <span className="font-mono text-deduction">-{formatRupiah(penggajian.bpjs_kesehatan)}</span>
          </div>
          <div className="flex justify-between items-baseline py-2 border-b border-border-hairline text-sm">
            <span className="text-foreground/70">BPJS ketenagakerjaan (2%)</span>
            <span className="font-mono text-deduction">-{formatRupiah(penggajian.bpjs_ketenagakerjaan)}</span>
          </div>
          <div className="flex justify-between items-baseline py-2 border-b border-border-strong text-sm">
            <span className="text-foreground/70">PPh 21 (5%)</span>
            <span className="font-mono text-deduction">-{formatRupiah(penggajian.pph21)}</span>
          </div>
          <div className="flex justify-between items-baseline pt-2 text-sm">
            <span className="font-medium text-foreground">Total potongan</span>
            <span className="font-mono font-medium text-deduction">-{formatRupiah(penggajian.total_potongan)}</span>
          </div>
        </div>

        <div className="flex justify-between items-baseline py-4 border-t-2 border-b-2 border-border-strong mb-8">
          <span className="font-display text-lg text-foreground">Gaji bersih</span>
          <span className="font-mono text-xl font-medium text-net-pay">{formatRupiah(penggajian.gaji_bersih)}</span>
        </div>

        <p className="text-center text-xs text-muted">
          Slip gaji ini diterbitkan secara elektronik oleh Sistem Informasi Penggajian ABC Company
        </p>

      </div>
    </>
  )
}