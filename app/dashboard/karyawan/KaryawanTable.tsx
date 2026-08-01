// Komponen tabel karyawan dengan tombol Edit dan Hapus di setiap baris.
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
  email:string
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
  const [editTarget, setEditTarget]     = useState<Karyawan | null>(null)
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

    setDeleteId(null)
    setDeleteNama('')
    setLoadingDelete(false)
  }

  return (
    <>
      <div className="border-t border-border-strong">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border-hairline">
              <th className="py-3 text-xs font-medium text-muted">ID</th>
              <th className="py-3 text-xs font-medium text-muted">Nama</th>
              <th className="py-3 text-xs font-medium text-muted">Gender</th>
              <th className="py-3 text-xs font-medium text-muted">Usia</th>
              <th className="py-3 text-xs font-medium text-muted">Masa kerja</th>
              <th className="py-3 text-xs font-medium text-muted">Jabatan</th>
              <th className="py-3 text-xs font-medium text-muted">Departemen</th>
              <th className="py-3 text-xs font-medium text-muted text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {karyawanList.map((k) => (
              <tr key={k.id} className="border-b border-border-hairline hover:bg-background transition-colors">
                <td className="py-3 font-mono text-xs text-muted">{k.employee_id}</td>
                <td className="py-3 font-medium text-foreground">{k.nama}</td>
                <td className="py-3">
                  <span className="text-xs text-foreground/70">
                    {k.gender === 'Female' ? 'Perempuan' : 'Laki-laki'}
                  </span>
                </td>
                <td className="py-3 text-foreground/70 text-xs">{k.age ?? '-'} thn</td>
                <td className="py-3 text-foreground/70 text-xs">{k.tenure_months ?? '-'} bln</td>
                <td className="py-3 text-foreground/70 text-xs">{k.jabatan?.nama ?? '-'}</td>
                <td className="py-3 text-muted text-xs">{k.departemen?.nama ?? '-'}</td>
                <td className="py-3">
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setEditTarget(k)}
                      className="text-xs text-accent hover:underline underline-offset-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => { setDeleteId(k.id); setDeleteNama(k.nama) }}
                      className="text-xs text-deduction hover:underline underline-offset-2"
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

      {editTarget && (
        <KaryawanForm
          mode="edit"
          karyawan={editTarget}
          jabatanList={jabatanList}
          departemenList={departemenList}
          onClose={() => setEditTarget(null)}
        />
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white border border-border-hairline p-6 w-full max-w-sm mx-4">
            <h2 className="font-display text-lg text-foreground mb-2">Hapus karyawan</h2>
            <p className="text-muted text-sm mb-6">
              Yakin ingin menghapus <span className="text-foreground font-medium">{deleteNama}</span>?
              Data yang sudah dihapus tidak bisa dikembalikan.
            </p>

            {errorDelete && (
              <p className="text-deduction text-xs mb-4">{errorDelete}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setDeleteId(null); setDeleteNama('') }}
                className="flex-1 px-4 py-2 border border-border-hairline text-sm text-foreground/70 hover:border-border-strong transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleHapus}
                disabled={loadingDelete}
                className="flex-1 bg-deduction hover:bg-deduction/90 text-white px-4 py-2 text-sm font-medium disabled:opacity-50 transition-colors"
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