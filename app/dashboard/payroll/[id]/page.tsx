// app/dashboard/payroll/[id]/page.tsx
import { supabase } from '@/lib/supabaseClient'
import { formatRupiah, formatPeriod } from '@/lib/payrollHelper'
import Link from 'next/link'

export default async function SlipGajiPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
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

  if (!karyawan) {
    return <div className="p-6 text-red-400">Karyawan tidak ditemukan.</div>
  }

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-900 min-h-screen text-white">

      <Link href="/dashboard/payroll" className="text-sm text-gray-400 hover:text-white mb-6 inline-block">
        ← Kembali ke Penggajian
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
          <div key={p.id} className="bg-gray-800 rounded-xl border border-gray-700 p-4">

            {/* Header periode (Sudah ditambahkan tombol cetak) */}
            <div className="flex justify-between items-center mb-4">
              <p className="font-medium text-white">{formatPeriod(p.bulan, p.tahun)}</p>
              <div className="flex items-center gap-3">
                <span className="text-green-400 font-bold text-lg">{formatRupiah(p.gaji_bersih)}</span>
                {/* Tombol cetak slip gaji */}
                <Link
                  href={`/dashboard/payroll/${id}/slip/${p.bulan}/${p.tahun}`}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded-lg transition-colors"
                >
                  Cetak
                </Link>
              </div>
            </div>

            {/* Komponen pendapatan */}
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Pendapatan</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-gray-900 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Gaji Pokok</p>
                  <p className="text-white font-medium">{formatRupiah(p.gaji_pokok)}</p>
                </div>
                <div className="bg-gray-900 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Tunjangan Jabatan</p>
                  <p className="text-blue-300">{formatRupiah(p.tunjangan_jabatan)}</p>
                </div>
                <div className="bg-gray-900 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Tunjangan Makan</p>
                  <p className="text-blue-300">{formatRupiah(p.tunjangan_makan)}</p>
                </div>
                <div className="bg-gray-900 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Tunjangan Transport</p>
                  <p className="text-blue-300">{formatRupiah(p.tunjangan_transport)}</p>
                </div>
              </div>
              <div className="bg-gray-900 rounded-lg p-3 mt-2">
                <p className="text-xs text-gray-500 mb-1">Total Gaji Kotor</p>
                <p className="text-white font-bold">{formatRupiah(p.gaji_kotor)}</p>
              </div>
            </div>

            {/* Komponen potongan */}
            <div>
              <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Potongan</p>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="bg-gray-900 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">BPJS Kesehatan</p>
                  <p className="text-red-400">-{formatRupiah(p.bpjs_kesehatan)}</p>
                </div>
                <div className="bg-gray-900 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">BPJS Ketenagakerjaan</p>
                  <p className="text-red-400">-{formatRupiah(p.bpjs_ketenagakerjaan)}</p>
                </div>
                <div className="bg-gray-900 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">PPh 21</p>
                  <p className="text-red-400">-{formatRupiah(p.pph21)}</p>
                </div>
              </div>
              <div className="bg-gray-900 rounded-lg p-3 mt-2">
                <p className="text-xs text-gray-500 mb-1">Total Potongan</p>
                <p className="text-red-400 font-bold">-{formatRupiah(p.total_potongan)}</p>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  )
}