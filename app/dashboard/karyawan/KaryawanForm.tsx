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
  karyawan?: Karyawan
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

    if (mode === 'edit' && karyawan) {
      formData.append('id', karyawan.id)
    }

    const result = mode === 'tambah'
      ? await tambahKaryawan(formData)
      : await editKaryawan(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    onClose()
    setLoading(false)
  }

  const inputClass = "w-full bg-transparent border-b border-border-hairline text-foreground text-sm py-2 focus:outline-none focus:border-accent transition-colors"
  const labelClass = "block text-xs text-muted mb-1.5"

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white border border-border-hairline p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">

        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display text-lg text-foreground">
            {mode === 'tambah' ? 'Tambah karyawan baru' : 'Edit data karyawan'}
          </h2>
          <button onClick={onClose} className="text-muted hover:text-foreground text-lg leading-none">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className={labelClass}>Nama lengkap *</label>
            <input
              type="text"
              name="nama"
              defaultValue={karyawan?.nama ?? ''}
              required
              placeholder="Contoh: John Doe"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Gender *</label>
            <select
              name="gender"
              defaultValue={karyawan?.gender ?? ''}
              required
              className={inputClass}
            >
              <option value="">Pilih gender...</option>
              <option value="Male">Laki-laki</option>
              <option value="Female">Perempuan</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Usia</label>
            <input
              type="number"
              name="age"
              defaultValue={karyawan?.age ?? ''}
              min="18"
              max="65"
              placeholder="Contoh: 25"
              className={inputClass}
            />
          </div>

          {mode === 'edit' && (
            <div>
              <label className={labelClass}>Masa kerja (bulan)</label>
              <input
                type="number"
                name="tenure_months"
                defaultValue={karyawan?.tenure_months ?? ''}
                min="0"
                placeholder="Contoh: 12"
                className={inputClass}
              />
            </div>
          )}

          <div>
            <label className={labelClass}>Jabatan *</label>
            <select
              name="jabatan_id"
              defaultValue={karyawan?.jabatan_id ?? ''}
              required
              className={inputClass}
            >
              <option value="">Pilih jabatan...</option>
              {jabatanList.map(j => (
                <option key={j.id} value={j.id}>{j.nama}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Departemen *</label>
            <select
              name="departemen_id"
              defaultValue={karyawan?.departemen_id ?? ''}
              required
              className={inputClass}
            >
              <option value="">Pilih departemen...</option>
              {departemenList.map(d => (
                <option key={d.id} value={d.id}>{d.nama}</option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-deduction text-xs">{error}</p>
          )}

          <div className="flex gap-3 pt-4 border-t border-border-hairline">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border-hairline text-sm text-foreground/70 hover:border-border-strong transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-foreground hover:bg-foreground/90 text-background px-4 py-2 text-sm font-medium disabled:opacity-50 transition-colors"
            >
              {loading ? 'Menyimpan...' : mode === 'tambah' ? 'Tambah' : 'Simpan perubahan'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}