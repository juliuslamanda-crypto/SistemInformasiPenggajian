// app/dashboard/jabatan/page.tsx
import { supabase } from '@/lib/supabaseClient'

export default async function JabatanPage() {
  const { data: jabatanList, error } = await supabase
    .from('jabatan')
    .select(`
      *,
      karyawan (id)
    `)
    .order('nama')

  if (error) {
    return (
      <div className="p-6 text-red-400">
        Error: {error.message}
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto bg-gray-900 min-h-screen text-white">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-blue-400">Jabatan</h1>
        <p className="text-sm text-gray-400 mt-1">
          Total: {jabatanList?.length ?? 0} jabatan terdaftar
        </p>
      </div>

      {/* Tabel */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-700 text-gray-300">
            <tr>
              <th className="p-4">Nama Jabatan</th>
              <th className="p-4 text-center">Jumlah Karyawan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {jabatanList?.map((j) => (
              <tr key={j.id} className="hover:bg-gray-750 transition-colors">
                <td className="p-4 text-gray-200">{j.nama}</td>
                <td className="p-4 text-center">
                  <span className="bg-blue-900/40 text-blue-300 px-2 py-1 rounded text-xs font-medium">
                    {j.karyawan?.length ?? 0} karyawan
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}