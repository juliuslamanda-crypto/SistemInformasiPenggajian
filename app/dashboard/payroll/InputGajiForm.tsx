// app/dashboard/payroll/InputGajiForm.tsx
// ============================================
// INPUT GAJI FORM — Modal form untuk input data penggajian
// 
// Client Component karena:
// 1. Menggunakan useState untuk manajemen state form
// 2. Menggunakan event handler (onChange, onSubmit)
// 3. Menampilkan preview kalkulasi secara real-time
// ============================================
'use client'

import { useState } from 'react'
import { inputGaji } from './actions'                          // Server Action untuk simpan ke database
import { formatSalary, getPeriodOptions } from '@/lib/payrollHelper' // Helper format dan daftar periode

// Tipe data karyawan yang diterima dari page.tsx
type Karyawan = {
  id: string          // UUID karyawan di database
  nama: string        // Nama lengkap karyawan
  employee_id: string // ID karyawan (contoh: "22950")
}

/**
 * Komponen modal form untuk input gaji karyawan
 * Admin memilih karyawan, periode, gross, dan deduction
 * Sistem menghitung net pay otomatis
 * 
 * @param karyawanList - Daftar semua karyawan untuk dropdown
 */
export default function InputGajiForm({
  karyawanList,
}: {
  karyawanList: Karyawan[]
}) {
  // ============================================
  // STATE MANAGEMENT
  // useState menyimpan nilai yang bisa berubah dan trigger re-render
  // ============================================
  const [open, setOpen] = useState(false)          // Kontrol buka/tutup modal
  const [loading, setLoading] = useState(false)    // Status loading saat submit
  const [error, setError] = useState('')           // Pesan error dari validasi/database
  const [success, setSuccess] = useState('')       // Pesan sukses setelah simpan
  const [netPayPreview, setNetPayPreview] = useState<number | null>(null) // Preview kalkulasi real-time
  const [gross, setGross] = useState('')           // Nilai input gross salary
  const [deduction, setDeduction] = useState('')   // Nilai input deduction

  // Ambil daftar opsi periode dari helper (12 bulan tahun 2025)
  const periodOptions = getPeriodOptions()

  /**
   * Kalkulasi preview net pay secara real-time
   * Dipanggil setiap kali user mengubah nilai gross atau deduction
   * 
   * @param g - Nilai gross salary (string dari input)
   * @param d - Nilai deduction (string dari input)
   */
  function handleCalc(g: string, d: string) {
    const gNum = parseFloat(g) // Konversi string ke angka
    const dNum = parseFloat(d)

    // Hanya hitung jika kedua nilai valid dan gross lebih dari 0
    if (!isNaN(gNum) && !isNaN(dNum) && gNum > 0) {
      // Rumus: Net Pay = Gross - Deduction
      setNetPayPreview(gNum - dNum)
    } else {
      // Reset preview jika input tidak valid
      setNetPayPreview(null)
    }
  }

  /**
   * Handler submit form
   * Mengumpulkan data form, mengirim ke Server Action, dan menangani response
   */
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault() // Mencegah browser reload halaman saat form submit

    // Set loading dan reset pesan sebelumnya
    setLoading(true)
    setError('')
    setSuccess('')

    // Kumpulkan semua data form ke dalam FormData object
    const formData = new FormData(e.currentTarget)

    // Kirim ke Server Action — fungsi yang berjalan di server
    const result = await inputGaji(formData)

    if (result.error) {
      // Tampilkan pesan error jika gagal
      setError(result.error)
    } else {
      // Tampilkan pesan sukses dan net pay yang tersimpan
      setSuccess(`Gaji berhasil disimpan! Net Pay: ${formatSalary(result.net_pay ?? 0)}`)

      // Reset semua input form
      setNetPayPreview(null)
      setGross('')
      setDeduction('')

      // Tutup modal otomatis setelah 2 detik
      setTimeout(() => {
        setOpen(false)
        setSuccess('')
      }, 2000)
    }

    setLoading(false)
  }

  return (
    <div>
      {/* Tombol trigger — membuka modal saat diklik */}
      <button
        onClick={() => setOpen(true)}
        className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg transition-colors font-medium"
      >
        + Input Gaji
      </button>

      {/* Modal — hanya dirender ke DOM saat open = true */}
      {open && (
        // Overlay gelap di belakang modal
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          {/* Container modal */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 w-full max-w-md mx-4">

            {/* Header modal */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-white">Input Gaji Karyawan</h2>
              {/* Tombol tutup modal */}
              <button
                onClick={() => { setOpen(false); setError(''); setSuccess('') }}
                className="text-gray-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            {/* Form input gaji */}
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Dropdown pilih karyawan */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Karyawan</label>
                <select
                  name="karyawan_id" // Nama field yang diambil di Server Action
                  required
                  className="w-full bg-gray-900 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih karyawan...</option>
                  {/* Render satu option per karyawan */}
                  {karyawanList.map(k => (
                    <option key={k.id} value={k.id}> {/* value adalah UUID untuk disimpan ke DB */}
                      {k.nama} ({k.employee_id})       {/* Label yang ditampilkan ke user */}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dropdown pilih periode */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Periode</label>
                <select
                  name="pay_period"
                  required
                  className="w-full bg-gray-900 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih periode...</option>
                  {periodOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Input gross salary */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Gross Salary</label>
                <input
                  type="number"
                  name="gross"
                  value={gross}
                  onChange={e => {
                    setGross(e.target.value)
                    handleCalc(e.target.value, deduction) // Hitung ulang preview
                  }}
                  placeholder="Contoh: 50000"
                  required
                  min="0"
                  step="0.01" // Izinkan angka desimal
                  className="w-full bg-gray-900 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Input total deduction */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Total Deduction</label>
                <input
                  type="number"
                  name="deduction"
                  value={deduction}
                  onChange={e => {
                    setDeduction(e.target.value)
                    handleCalc(gross, e.target.value) // Hitung ulang preview
                  }}
                  placeholder="Contoh: 5000"
                  required
                  min="0"
                  step="0.01"
                  className="w-full bg-gray-900 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Preview kalkulasi net pay — hanya tampil jika nilai sudah diisi */}
              {netPayPreview !== null && (
                <div className="bg-gray-900 rounded-lg p-3 border border-green-500/30">
                  <p className="text-xs text-gray-400">Preview Net Pay</p>
                  {/* Tampilkan hasil kalkulasi Net Pay = Gross - Deduction */}
                  <p className="text-green-400 font-bold text-lg">{formatSalary(netPayPreview)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {/* Hitung dan tampilkan persentase deduction */}
                    Deduction %: {gross ? ((parseFloat(deduction) / parseFloat(gross)) * 100).toFixed(2) : 0}%
                  </p>
                </div>
              )}

              {/* Pesan error — tampil jika ada error validasi atau database */}
              {error && (
                <p className="text-red-400 text-sm bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>
              )}

              {/* Pesan sukses — tampil setelah data berhasil disimpan */}
              {success && (
                <p className="text-green-400 text-sm bg-green-900/20 px-3 py-2 rounded-lg">{success}</p>
              )}

              {/* Tombol aksi form */}
              <div className="flex gap-3 pt-2">
                {/* Tombol batal — tutup modal tanpa simpan */}
                <button
                  type="button"
                  onClick={() => { setOpen(false); setError(''); setSuccess('') }}
                  className="flex-1 px-4 py-2 border border-gray-600 rounded-lg text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  Batal
                </button>
                {/* Tombol submit — disabled saat loading untuk mencegah double submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
                >
                  {/* Teks berubah saat loading */}
                  {loading ? 'Menyimpan...' : 'Simpan Gaji'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  )
}