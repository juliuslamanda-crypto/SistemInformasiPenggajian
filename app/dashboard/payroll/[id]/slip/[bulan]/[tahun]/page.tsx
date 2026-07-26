// app/dashboard/payroll/[id]/slip/[bulan]/[tahun]/page.tsx
// Halaman slip gaji yang didesain khusus untuk di-print
// URL: /dashboard/payroll/[id]/slip/[bulan]/[tahun]
import { supabase } from '@/lib/supabaseClient'
import { formatRupiah, formatPeriod } from '@/lib/payrollHelper'
import PrintButton from './PrintButton'
import Link from 'next/link'

export default async function SlipGajiPrintPage({
  params,
}: {
  params: Promise<{ id: string; bulan: string; tahun: string }>
}) {
  const { id, bulan, tahun } = await params

  const { data: karyawan } = await supabase
    .from('karyawan')
    .select(`*, jabatan(nama), departemen(nama)`)
    .eq('id', id)
    .single()

  const { data: penggajian } = await supabase
    .from('penggajian')
    .select('*')
    .eq('karyawan_id', id)
    .eq('bulan', parseInt(bulan))
    .eq('tahun', parseInt(tahun))
    .single()

  if (!karyawan || !penggajian) {
    return <div className="p-6 text-red-400">Data tidak ditemukan.</div>
  }

  return (
    <>
      {/* Tombol aksi — tidak ikut terprint */}
      <div className="print:hidden p-4 bg-gray-900 flex gap-3 items-center border-b border-gray-700">
        <Link
          href={`/dashboard/payroll/${id}`}
          className="text-sm text-gray-400 hover:text-white"
        >
          ← Kembali
        </Link>
        <PrintButton />
      </div>

      {/* Konten slip gaji — yang ini yang terprint */}
      <div className="p-8 max-w-2xl mx-auto bg-white text-gray-900 min-h-screen print:p-6">

        {/* Header perusahaan */}
        <div className="text-center mb-8 pb-6 border-b-2 border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">ABC Company</h1>
          <p className="text-gray-500 text-sm mt-1">Slip Gaji Karyawan</p>
          <p className="text-gray-500 text-sm">Periode: {formatPeriod(penggajian.bulan, penggajian.tahun)}</p>
        </div>

        {/* Info karyawan */}
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Nama Karyawan</p>
              <p className="font-semibold text-gray-900">{karyawan.nama}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">ID Karyawan</p>
              <p className="font-semibold text-gray-900">{karyawan.employee_id}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Jabatan</p>
              <p className="font-semibold text-gray-900">{karyawan.jabatan?.nama ?? '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Departemen</p>
              <p className="font-semibold text-gray-900">{karyawan.departemen?.nama ?? '-'}</p>
            </div>
          </div>
        </div>

        {/* Tabel komponen gaji */}
        <table className="w-full text-sm mb-6">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left p-3 font-semibold text-gray-700">Komponen</th>
              <th className="text-right p-3 font-semibold text-gray-700">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            {/* Pendapatan */}
            <tr className="border-b border-gray-100">
              <td colSpan={2} className="p-3 font-semibold text-gray-600 bg-green-50">
                Pendapatan
              </td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="p-3 text-gray-700 pl-6">Gaji Pokok</td>
              <td className="p-3 text-right text-gray-900">{formatRupiah(penggajian.gaji_pokok)}</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="p-3 text-gray-700 pl-6">Tunjangan Jabatan</td>
              <td className="p-3 text-right text-gray-900">{formatRupiah(penggajian.tunjangan_jabatan)}</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="p-3 text-gray-700 pl-6">Tunjangan Makan</td>
              <td className="p-3 text-right text-gray-900">{formatRupiah(penggajian.tunjangan_makan)}</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="p-3 text-gray-700 pl-6">Tunjangan Transport</td>
              <td className="p-3 text-right text-gray-900">{formatRupiah(penggajian.tunjangan_transport)}</td>
            </tr>
            <tr className="border-b-2 border-gray-300 bg-green-50">
              <td className="p-3 font-bold text-gray-800">Total Gaji Kotor</td>
              <td className="p-3 text-right font-bold text-gray-900">{formatRupiah(penggajian.gaji_kotor)}</td>
            </tr>

            {/* Potongan */}
            <tr className="border-b border-gray-100">
              <td colSpan={2} className="p-3 font-semibold text-gray-600 bg-red-50">
                Potongan
              </td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="p-3 text-gray-700 pl-6">BPJS Kesehatan (1%)</td>
              <td className="p-3 text-right text-red-600">-{formatRupiah(penggajian.bpjs_kesehatan)}</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="p-3 text-gray-700 pl-6">BPJS Ketenagakerjaan (2%)</td>
              <td className="p-3 text-right text-red-600">-{formatRupiah(penggajian.bpjs_ketenagakerjaan)}</td>
            </tr>
            <tr className="border-b-2 border-gray-300 bg-red-50">
              <td className="p-3 text-gray-700 pl-6">PPh 21 (5%)</td>
              <td className="p-3 text-right text-red-600">-{formatRupiah(penggajian.pph21)}</td>
            </tr>
            <tr className="border-b-2 border-gray-300 bg-red-50">
              <td className="p-3 font-bold text-gray-800">Total Potongan</td>
              <td className="p-3 text-right font-bold text-red-600">-{formatRupiah(penggajian.total_potongan)}</td>
            </tr>

            {/* Gaji bersih */}
            <tr className="bg-blue-50">
              <td className="p-4 font-bold text-lg text-gray-900">GAJI BERSIH</td>
              <td className="p-4 text-right font-bold text-lg text-blue-700">
                {formatRupiah(penggajian.gaji_bersih)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-8 text-center">
            <div>
              <p className="text-xs text-gray-500 mb-12">Diterima oleh,</p>
              <p className="text-sm font-medium text-gray-700 border-t border-gray-400 pt-2">
                {karyawan.nama}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-12">Disetujui oleh,</p>
              <p className="text-sm font-medium text-gray-700 border-t border-gray-400 pt-2">
                HRD ABC Company
              </p>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 mt-6">
            Slip gaji ini diterbitkan secara elektronik oleh Sistem Informasi Penggajian ABC Company
          </p>
        </div>

      </div>
    </>
  )
}