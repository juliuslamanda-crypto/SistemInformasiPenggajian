// app/dashboard/karyawan/page.tsx
import { supabase } from '@/lib/supabaseClient'

export default async function KaryawanPage() {
  const { data: karyawanList, error } = await supabase
    .from('karyawan')
    .select(`
      *,
      jabatan ( nama ),
      departemen ( nama )
    `)
    .order('nama')

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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-blue-400">Data Master Karyawan</h1>
          <p className="text-sm text-gray-400 mt-1">
            Total: {karyawanList.length} karyawan aktif — ABC Company
          </p>
        </div>
      </div>

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
            {karyawanList.map((k: any) => (
              <tr key={k.id} className="hover:bg-gray-750 transition-colors">
                <td className="p-4 font-mono text-xs text-blue-300">{k.employee_id}</td>
                <td className="p-4 font-medium text-gray-200">{k.nama}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    k.gender === 'Female'
                      ? 'bg-pink-900/40 text-pink-300'
                      : 'bg-blue-900/40 text-blue-300'
                  }`}>
                    {k.gender === 'Female' ? 'Perempuan' : 'Laki-laki'}
                  </span>
                </td>
                <td className="p-4 text-gray-300">{k.age ?? '-'} thn</td>
                <td className="p-4 text-gray-300">{k.tenure_months ?? '-'} bln</td>
                <td className="p-4 text-gray-300 text-xs">{k.jabatan?.nama ?? '-'}</td>
                <td className="p-4 text-gray-400 text-xs">{k.departemen?.nama ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}