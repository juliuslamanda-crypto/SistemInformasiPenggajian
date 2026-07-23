// app/dashboard/karyawan/page.tsx
// ============================================
// HALAMAN MASTER DATA KARYAWAN
// Menampilkan daftar lengkap 120 karyawan ABC Company
// Data bersumber dari dataset Kaggle:
// "Sample Employee Monthly Salary"
//
// Server Component: fetch data langsung di server
// JOIN ke tabel jabatan dan departemen untuk tampilkan nama
// ============================================

import { supabase } from '@/lib/supabaseClient'

export default async function KaryawanPage() {
  // ============================================
  // FETCH DATA KARYAWAN
  // Ambil semua karyawan dengan JOIN ke jabatan dan departemen
  // SELECT * → ambil semua kolom karyawan
  // jabatan(nama) → ambil hanya kolom nama dari tabel jabatan
  // departemen(nama) → ambil hanya kolom nama dari tabel departemen
  // ============================================
  const { data: karyawanList, error } = await supabase
    .from('karyawan')
    .select(`
      *,
      jabatan ( nama ),
      departemen ( nama )
    `)
    .order('nama') // Urutkan alfabetis berdasarkan nama karyawan

  // Tampilkan debugger jika ada error atau data kosong
  // Berguna untuk mendiagnosis masalah koneksi atau RLS policy
  if (error || !karyawanList || karyawanList.length === 0) {
    return (
      <div className="p-6 max-w-xl mx-auto my-10 bg-gray-800 border border-red-500/30 rounded-xl text-red-400">
        <h2 className="text-lg font-bold mb-2">Supabase Connection Debugger</h2>
        <ul className="text-xs space-y-2 font-mono bg-gray-950 p-3 rounded border border-gray-700">
          <li>• Error: {error ? error.message : 'Tidak ada error'}</li>
          <li>• Jumlah data: {karyawanList?.length ?? 0}</li>
        </ul>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-900 min-h-screen text-white">

      {/* Header halaman */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-blue-400">Data Master Karyawan</h1>
          <p className="text-sm text-gray-400 mt-1">
            Total: {karyawanList.length} karyawan aktif — ABC Company
          </p>
        </div>
      </div>

      {/* Tabel data karyawan */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-xl">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-gray-800 text-gray-300 text-sm font-semibold border-b border-gray-700">
              <th className="p-4">ID</th>
              <th className="p-4">Nama</th>
              <th className="p-4">Gender</th>
              <th className="p-4">Usia</th>
              <th className="p-4">Masa Kerja</th>
              <th className="p-4">Jabatan</th>
              <th className="p-4">Departemen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {/* Render satu baris per karyawan */}
            {karyawanList.map((k: any) => (
              <tr key={k.id} className="hover:bg-gray-750 transition-colors">

                {/* Employee ID — ditampilkan dengan font monospace */}
                <td className="p-4 font-mono text-xs text-blue-300">{k.employee_id}</td>

                {/* Nama lengkap karyawan */}
                <td className="p-4 font-medium text-gray-200">{k.nama}</td>

                {/* Badge gender — pink untuk Female, biru untuk Male */}
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    k.gender === 'Female'
                      ? 'bg-pink-900/40 text-pink-300'  // Warna pink untuk perempuan
                      : 'bg-blue-900/40 text-blue-300'  // Warna biru untuk laki-laki
                  }`}>
                    {k.gender === 'Female' ? 'Perempuan' : 'Laki-laki'}
                  </span>
                </td>

                {/* Usia karyawan dalam tahun — ?? '-' jika data null */}
                <td className="p-4 text-gray-300">{k.age ?? '-'} thn</td>

                {/* Masa kerja dalam bulan dari dataset asli */}
                <td className="p-4 text-gray-300">{k.tenure_months ?? '-'} bln</td>

                {/* Nama jabatan dari hasil JOIN ke tabel jabatan */}
                <td className="p-4 text-gray-300 text-xs">{k.jabatan?.nama ?? '-'}</td>

                {/* Nama departemen dari hasil JOIN ke tabel departemen */}
                <td className="p-4 text-gray-400 text-xs">{k.departemen?.nama ?? '-'}</td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}