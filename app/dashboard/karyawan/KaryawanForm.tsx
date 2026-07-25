// app/dashboard/karyawan/KaryawanForm.tsx
// Form modal yang dipakai untuk dua keperluan: tambah karyawan baru dan edit karyawan.
// Dipisah jadi Client Component karena butuh useState untuk handle interaksi user.
'use client'

import { useState } from 'react'
import { tambahKaryawan, editKaryawan } from './actions'

type Jabatan    = { id: string; nama: string }
type Departemen = { id: string; nama: string }
type Karyawan   = {
  id: string
  nama: string
  gender: string
  age: number | null
  tenure_months: number | null
  jabatan_id: string | null
  departemen_id: string | null
}

type Props = {
  jabatanList: Jabatan[]
  departemenList: Departemen[]
  mode: 'tambah' | 'edit'
  karyawan?: Karyawan // Hanya diisi kalau mode edit
  onClose: () => void
}

export default function KaryawanForm({ jabatanList, departemenList, mode, karyawan, onClose }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)

    // Kalau mode edit, tambahkan id karyawan ke formData
    if (mode === 'edit' && karyawan) {
      formData.append('id', karyawan.id)
    }

    // Panggil action yang sesuai berdasarkan mode
    const result = mode === 'tambah'
      ? await tambahKaryawan(formData)
      : await editKaryawan(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    // Tutup modal setelah berhasil
    onClose()
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-white">
            {mode === 'tambah' ? 'Tambah Karyawan Baru' : 'Edit Data Karyawan'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Nama lengkap */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Nama Lengkap *</label>
            <input
              type="text"
              name="nama"
              defaultValue={karyawan?.nama ?? ''}
              required
              placeholder="Contoh: John Doe"
              className="w-full bg-gray-900 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Gender *</label>
            <select
              name="gender"
              defaultValue={karyawan?.gender ?? ''}
              required
              className="w-full bg-gray-900 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pilih gender...</option>
              <option value="Male">Laki-laki</option>
              <option value="Female">Perempuan</option>
            </select>
          </div>

          {/* Usia — tidak wajib */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Usia</label>
            <input
              type="number"
              name="age"
              defaultValue={karyawan?.age ?? ''}
              min="18"
              max="65"
              placeholder="Contoh: 25"
              className="w-full bg-gray-900 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Masa kerja dalam bulan */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Masa Kerja (bulan)</label>
            <input
              type="number"
              name="tenure_months"
              defaultValue={karyawan?.tenure_months ?? ''}
              min="0"
              placeholder="Contoh: 12"
              className="w-full bg-gray-900 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Jabatan — diambil dari database */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Jabatan *</label>
            <select
              name="jabatan_id"
              defaultValue={karyawan?.jabatan_id ?? ''}
              required
              className="w-full bg-gray-900 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pilih jabatan...</option>
              {jabatanList.map(j => (
                <option key={j.id} value={j.id}>{j.nama}</option>
              ))}
            </select>
          </div>

          {/* Departemen — diambil dari database */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Departemen *</label>
            <select
              name="departemen_id"
              defaultValue={karyawan?.departemen_id ?? ''}
              required
              className="w-full bg-gray-900 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pilih departemen...</option>
              {departemenList.map(d => (
                <option key={d.id} value={d.id}>{d.nama}</option>
              ))}
            </select>
          </div>

          {/* Pesan error kalau ada */}
          {error && (
            <p className="text-red-400 text-sm bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-600 rounded-lg text-sm text-gray-300 hover:bg-gray-700 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
            >
              {loading ? 'Menyimpan...' : mode === 'tambah' ? 'Tambah' : 'Simpan Perubahan'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}