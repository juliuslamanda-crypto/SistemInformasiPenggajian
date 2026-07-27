// Halaman master data karyawan — menampilkan semua karyawan aktif
// beserta tombol tambah, edit, dan hapus.
import { createClient } from '@/lib/supabase/server'
import KaryawanTable from './KaryawanTable'
import TambahKaryawanButton from './TambahKaryawanButton'

export default async function KaryawanPage() {
  const supabase = await createClient()

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
      <div className="p-8 max-w-xl mx-auto my-10">
        <div className="bg-white border border-deduction/30 p-6 text-deduction text-sm">
          <h2 className="font-medium mb-2">Error</h2>
          <p className="text-xs">{error?.message ?? 'Data kosong'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen">
      <div className="bg-white border border-border-hairline p-8">

        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <p className="text-sm font-medium tracking-wide text-foreground">Karyawan</p>
            </div>
            <h1 className="font-display text-xl text-foreground/80">
              {karyawanList.length} karyawan aktif — ABC Company
            </h1>
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
    </div>
  )
}