import { createClient } from '@/lib/supabase/server'
import { formatRupiah, formatPeriod } from '@/lib/payrollHelper'
import Link from 'next/link'
import { Users, Wallet, Briefcase } from 'lucide-react'

export default async function DashboardPage() {
  // Server Component: buat instance Supabase per-request (bukan di level module),
  // supaya cookies() bisa diakses dengan benar
  const supabase = await createClient()

  // Ambil semua data yang dibutuhkan dashboard secara PARALEL pakai Promise.all,
  // bukan berurutan — supaya total waktu tunggu = query paling lambat, bukan jumlah semuanya
  const [
    { count: totalKaryawan },
    { data: jabatanData },
    { count: totalDepartemen },
    { data: penggajianBulanIni },
    { data: penggajianBulanLalu },
  ] = await Promise.all([
    // Hitung jumlah karyawan (head: true = tidak perlu data barisnya, cukup count)
    supabase.from('karyawan').select('*', { count: 'exact', head: true }),
    // Ambil jabatan beserta id karyawan yang menempati jabatan itu,
    // dipakai untuk filter jabatan yang benar-benar terpakai
    supabase.from('jabatan').select('id, karyawan(id)'),
    supabase.from('departemen').select('*', { count: 'exact', head: true }),
    // Data penggajian bulan berjalan (Desember 2025)
    supabase.from('penggajian')
      .select('gaji_kotor, total_potongan, gaji_bersih')
      .eq('bulan', 12)
      .eq('tahun', 2025),
    // Data penggajian bulan lalu (November 2025), buat bahan perbandingan
    supabase.from('penggajian')
      .select('gaji_bersih')
      .eq('bulan', 11)
      .eq('tahun', 2025),
  ])

  // Hanya hitung jabatan yang punya minimal 1 karyawan (bukan semua jabatan yang ada di tabel)
  const totalJabatan = jabatanData?.filter((j: any) => j.karyawan?.length > 0).length ?? 0

  // Jumlahkan tiap komponen gaji dari seluruh baris penggajian bulan ini
  const totalGajiKotor  = penggajianBulanIni?.reduce((sum, p) => sum + Number(p.gaji_kotor), 0) ?? 0
  const totalPotongan   = penggajianBulanIni?.reduce((sum, p) => sum + Number(p.total_potongan), 0) ?? 0
  const totalGajiBersih = penggajianBulanIni?.reduce((sum, p) => sum + Number(p.gaji_bersih), 0) ?? 0

  // Hitung selisih dan persentase perubahan dibanding bulan lalu
  const totalGajiBersihLalu = penggajianBulanLalu?.reduce((sum, p) => sum + Number(p.gaji_bersih), 0) ?? 0
  const selisih = totalGajiBersih - totalGajiBersihLalu
  const selisihPersen = totalGajiBersihLalu > 0
    ? ((selisih / totalGajiBersihLalu) * 100).toFixed(1) : '0'

  // Data buat 4 angka ringkasan di bagian atas
  const stats = [
    { label: 'Karyawan', value: totalKaryawan ?? 0 },
    { label: 'Jabatan', value: totalJabatan },
    { label: 'Departemen', value: totalDepartemen ?? 0 },
    { label: 'Digaji', value: penggajianBulanIni?.length ?? 0 },
  ]

  // Data buat 3 kartu navigasi cepat di bagian bawah
  const quickLinks = [
    { href: '/dashboard/karyawan', label: 'Data karyawan', sub: 'Lihat semua karyawan aktif', icon: Users },
    { href: '/dashboard/payroll', label: 'Penggajian', sub: 'Kelola penggajian bulanan', icon: Wallet },
    { href: '/dashboard/jabatan', label: 'Jabatan', sub: 'Lihat daftar jabatan', icon: Briefcase },
  ]

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-screen">
      {/* Card putih membungkus semua konten, kontras dari background cream di belakangnya */}
      <div className="bg-white border border-border-hairline p-8">

        {/* Nama perusahaan + judul ringkasan */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-accent" />
            <p className="text-sm font-medium tracking-wide text-foreground">ABC Company</p>
          </div>
          <h1 className="font-display text-xl text-foreground/80">
            Ringkasan penggajian — {formatPeriod(12, 2025)}
          </h1>
        </div>

        {/* Baris 4 angka ringkasan, dipisah garis atas-bawah (bukan card terpisah) */}
        <div className="grid grid-cols-4 border-t border-b border-border-strong py-4 mb-6">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-xs text-muted mb-1">{s.label}</p>
              <p className="font-display text-2xl text-foreground">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Breakdown gaji kotor → potongan → bersih, mirip struk/invoice */}
        <div className="mb-6">
          <div className="flex justify-between items-baseline py-2 border-b border-border-hairline">
            <span className="text-sm text-foreground/70">Total gaji kotor</span>
            <span className="font-mono text-sm text-foreground">{formatRupiah(totalGajiKotor)}</span>
          </div>
          <div className="flex justify-between items-baseline py-2 border-b border-border-hairline">
            <span className="text-sm text-foreground/70">Total potongan</span>
            <span className="font-mono text-sm text-deduction">-{formatRupiah(totalPotongan)}</span>
          </div>
          <div className="flex justify-between items-baseline pt-3">
            <span className="text-sm font-medium text-foreground">Gaji bersih</span>
            <span className="font-mono text-xl font-medium text-net-pay">{formatRupiah(totalGajiBersih)}</span>
          </div>
        </div>

        {/* Perbandingan dengan bulan lalu + link ke halaman detail penggajian */}
        <div className="flex justify-between items-center mb-8">
          <p className="text-xs text-muted">
            Dibanding {formatPeriod(11, 2025)}:{' '}
            {/* Warna berubah sesuai naik (hijau) atau turun (merah) */}
            <span className={selisih >= 0 ? 'text-net-pay' : 'text-deduction'}>
              {selisih >= 0 ? '+' : ''}{formatRupiah(selisih)} ({selisihPersen}%)
            </span>
          </p>
          <Link href="/dashboard/payroll?period=12-2025" className="text-xs text-accent underline underline-offset-2">
            Lihat detail
          </Link>
        </div>

        {/* 3 kartu navigasi cepat ke halaman lain */}
        <div className="grid grid-cols-3 gap-3">
          {quickLinks.map((link) => {
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className="group border border-border-hairline hover:border-accent p-4 transition-colors"
              >
                <Icon className="w-4 h-4 text-accent mb-2" strokeWidth={1.75} />
                <p className="text-sm font-medium text-foreground mb-0.5">{link.label}</p>
                <p className="text-xs text-muted">{link.sub}</p>
              </Link>
            )
          })}
        </div>

      </div>
    </div>
  )
}