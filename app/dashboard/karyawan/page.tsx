// app/dashboard/karyawan/page.tsx
// Halaman master data karyawan — menampilkan semua karyawan aktif
// beserta tombol tambah, edit, dan hapus.
import { supabase } from '@/lib/supabaseClient'
import KaryawanTable from './KaryawanTable'
import TambahKaryawanButton from './TambahKaryawanButton'

export default async function KaryawanPage() {
  // Fetch semua data yang dibutuhkan secara paralel
  const [
    { data: karyawanList, error },
    { data: jabatanList },
    { data: departemenList },
  ] = await Promise.all([
    supabase
      .from('karyawan')
      .select(`*, jabatan(nama), departemen(nama)`)
      .order('nama'),
    supabase.from('jabatan').select('id, nama').order('nama'),
    supabase.from('departemen').select('id, nama').order('nama'),
  ])

  if (error || !karyawanList || karyawanList.length === 0) {
    return (
      <div className="p-6 max-w-xl mx-auto my-10 bg-gray-800 border border-red-500/30 rounded-xl text-red-400">
        <h2 className="text-lg font-bold mb-2">Error</h2>
        <p className="text-xs">{error?.message ?? 'Data kosong'}</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-900 min-h-screen text-white">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-blue-400">Data Master Karyawan</h1>
          <p className="text-sm text-gray-400 mt-1">
            Total: {karyawanList.length} karyawan aktif — ABC Company
          </p>
        </div>
        <TambahKaryawanButton
          jabatanList={jabatanList ?? []}
          departemenList={departemenList ?? []}
        />
      </div>

      <KaryawanTable
        karyawanList={karyawanList as any}
        jabatanList={jabatanList ?? []}
        departemenList={departemenList ?? []}
      />
    </div>
  )
}