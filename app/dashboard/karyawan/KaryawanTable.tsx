// app/dashboard/karyawan/KaryawanTable.tsx
// Komponen tabel karyawan dengan tombol Edit dan Hapus di setiap baris.
// Dipisah dari page.tsx supaya bisa pakai useState untuk handle modal.
'use client'

import { useState } from 'react'
import { hapusKaryawan } from './actions'
import KaryawanForm from './KaryawanForm'

type Jabatan    = { id: string; nama: string }
type Departemen = { id: string; nama: string }
type Karyawan   = {
  id: string
  employee_id: string
  nama: string
  gender: string
  age: number | null
  tenure_months: number | null
  jabatan_id: string | null
  departemen_id: string | null
  jabatan: { nama: string } | null
  departemen: { nama: string } | null
}

type Props = {
  karyawanList: Karyawan[]
  jabatanList: Jabatan[]
  departemenList: Departemen[]
}

export default function KaryawanTable({ karyawanList, jabatanList, departemenList }: Props) {
  // Simpan karyawan yang sedang diedit — null berarti modal edit tertutup
  const [editTarget, setEditTarget]     = useState<Karyawan | null>(null)
  // Simpan id karyawan yang mau dihapus — null berarti modal hapus tertutup
  const [deleteId, setDeleteId]         = useState<string | null>(null)
  const [deleteNama, setDeleteNama]     = useState('')
  const [loadingDelete, setLoadingDelete] = useState(false)
  const [errorDelete, setErrorDelete]   = useState('')

  async function handleHapus() {
    if (!deleteId) return
    setLoadingDelete(true)
    setErrorDelete('')

    const result = await hapusKaryawan(deleteId)

    if (result.error) {
      setErrorDelete(result.error)
      setLoadingDelete(false)
      return
    }

    // Tutup modal setelah berhasil hapus
    setDeleteId(null)
    setDeleteNama('')
    setLoadingDelete(false)
  }

  return (
    <>
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
              <th className="p-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {karyawanList.map((k) => (
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
                <td className="p-4">
                  <div className="flex gap-2 justify-center">
                    {/* Tombol edit — buka modal dengan data karyawan ini */}
                    <button
                      onClick={() => setEditTarget(k)}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs px-3 py-1 rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                    {/* Tombol hapus — minta konfirmasi sebelum delete */}
                    <button
                      onClick={() => { setDeleteId(k.id); setDeleteNama(k.nama) }}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded-lg transition-colors"
                    >
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal edit — muncul saat editTarget tidak null */}
      {editTarget && (
        <KaryawanForm
          mode="edit"
          karyawan={editTarget}
          jabatanList={jabatanList}
          departemenList={departemenList}
          onClose={() => setEditTarget(null)}
        />
      )}

      {/* Modal konfirmasi hapus */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 w-full max-w-sm mx-4">
            <h2 className="text-lg font-semibold text-white mb-2">Hapus Karyawan</h2>
            <p className="text-gray-400 text-sm mb-6">
              Yakin ingin menghapus <span className="text-white font-medium">{deleteNama}</span>?
              Data yang sudah dihapus tidak bisa dikembalikan.
            </p>

            {errorDelete && (
              <p className="text-red-400 text-sm bg-red-900/20 px-3 py-2 rounded-lg mb-4">
                {errorDelete}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setDeleteId(null); setDeleteNama('') }}
                className="flex-1 px-4 py-2 border border-gray-600 rounded-lg text-sm text-gray-300 hover:bg-gray-700 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleHapus}
                disabled={loadingDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
              >
                {loadingDelete ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}