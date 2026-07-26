// app/dashboard/payroll/InputGajiForm.tsx
// Form modal untuk input gaji karyawan baru atau update gaji existing.
// Komponen gaji mengikuti aturan Indonesia: gaji pokok, tunjangan, BPJS, PPh 21.
'use client'

import { useState } from 'react'
import { formatRupiah, getPeriodOptions } from '@/lib/payrollHelper'
import { supabase } from '@/lib/supabaseClient'

type Karyawan = {
  id: string
  nama: string
  employee_id: string
  jabatan?: { nama: string } | null
}

export default function InputGajiForm({
  karyawanList,
}: {
  karyawanList: Karyawan[]
}) {
  const [open, setOpen]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')

  // State untuk setiap field form
  const [karyawanId, setKaryawanId]   = useState('')
  const [bulan, setBulan]             = useState('')
  const [tahun, setTahun]             = useState('')
  const [gajiPokok, setGajiPokok]     = useState('')
  const [tunjJabatan, setTunjJabatan] = useState('')
  const [tunjMakan, setTunjMakan]     = useState('750000')
  const [tunjTransport, setTunjTransport] = useState('500000')

  const periodOptions = getPeriodOptions()

  // Hitung semua komponen gaji secara real-time
  const gp  = parseFloat(gajiPokok)    || 0
  const tj  = parseFloat(tunjJabatan)  || 0
  const tm  = parseFloat(tunjMakan)    || 0
  const tt  = parseFloat(tunjTransport) || 0

  const gajiKotor          = gp + tj + tm + tt
  const bpjsKesehatan      = Math.round(gp * 0.01)   // 1% dari gaji pokok
  const bpjsKetenagakerjaan = Math.round(gp * 0.02)  // 2% dari gaji pokok
  const pph21              = Math.round(gp * 0.05)   // 5% dari gaji pokok
  const totalPotongan      = bpjsKesehatan + bpjsKetenagakerjaan + pph21
  const gajiBersih         = gajiKotor - totalPotongan

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (!karyawanId || !bulan || !tahun || !gajiPokok) {
      setError('Karyawan, periode, dan gaji pokok wajib diisi.')
      setLoading(false)
      return
    }

    if (gp <= 0) {
      setError('Gaji pokok harus lebih dari 0.')
      setLoading(false)
      return
    }

    // Simpan ke database menggunakan upsert
    // Kalau sudah ada data bulan+tahun yang sama untuk karyawan ini, update
    const { error: dbError } = await supabase
      .from('penggajian')
      .upsert({
        karyawan_id: karyawanId,
        bulan: parseInt(bulan),
        tahun: parseInt(tahun),
        gaji_pokok: gp,
        tunjangan_jabatan: tj,
        tunjangan_makan: tm,
        tunjangan_transport: tt,
        gaji_kotor: gajiKotor,
        bpjs_kesehatan: bpjsKesehatan,
        bpjs_ketenagakerjaan: bpjsKetenagakerjaan,
        pph21,
        total_potongan: totalPotongan,
        gaji_bersih: gajiBersih,
      }, {
        onConflict: 'karyawan_id,bulan,tahun'
      })

    if (dbError) {
      setError(`Gagal menyimpan: ${dbError.message}`)
      setLoading(false)
      return
    }

    setSuccess(`Gaji berhasil disimpan! Gaji bersih: ${formatRupiah(gajiBersih)}`)
    setTimeout(() => {
      setOpen(false)
      setSuccess('')
      setKaryawanId('')
      setBulan('')
      setTahun('')
      setGajiPokok('')
      setTunjJabatan('')
      setTunjMakan('750000')
      setTunjTransport('500000')
    }, 2000)

    setLoading(false)
  }

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg transition-colors font-medium"
      >
        + Input Gaji
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-white">Input Gaji Karyawan</h2>
              <button
                onClick={() => { setOpen(false); setError(''); setSuccess('') }}
                className="text-gray-400 hover:text-white text-xl"
              >✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Pilih karyawan */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Karyawan *</label>
                <input
                  list="karyawan-list"
                  placeholder="Ketik nama atau ID karyawan..."
                  onChange={e => {
                   // Cari karyawan berdasarkan teks yang dipilih
                    const found = karyawanList.find(
                      k => `${k.nama} (${k.employee_id})` === e.target.value
                    )
                    if (found) setKaryawanId(found.id)
                 }}
                 className="w-full bg-gray-900 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
               />
              <datalist id="karyawan-list">
                {karyawanList.map(k => (
                  <option key={k.id} value={`${k.nama} (${k.employee_id})`} />
                ))}
              </datalist>
              </div>

              {/* Pilih periode */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Bulan *</label>
                  <select
                    value={bulan}
                    onChange={e => setBulan(e.target.value)}
                    required
                    className="w-full bg-gray-900 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih bulan...</option>
                    {['Januari','Februari','Maret','April','Mei','Juni',
                      'Juli','Agustus','September','Oktober','November','Desember'
                    ].map((nama, i) => (
                      <option key={i+1} value={i+1}>{nama}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Tahun *</label>
                  <select
                    value={tahun}
                    onChange={e => setTahun(e.target.value)}
                    required
                    className="w-full bg-gray-900 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih tahun...</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                  </select>
                </div>
              </div>

              {/* Komponen pendapatan */}
              <div className="border border-gray-700 rounded-lg p-4 space-y-3">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Komponen Pendapatan</p>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Gaji Pokok *</label>
                  <input
                    type="number"
                    value={gajiPokok}
                    onChange={e => {
                      setGajiPokok(e.target.value)
                      // Auto-isi tunjangan jabatan = 15% dari gaji pokok
                      const gp = parseFloat(e.target.value) || 0
                      setTunjJabatan(String(Math.round(gp * 0.15)))
                    }}
                    placeholder="Contoh: 5000000"
                    required
                    min="0"
                    className="w-full bg-gray-900 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Tunjangan Jabatan
                    <span className="text-gray-600 ml-1">(otomatis 15% dari gaji pokok)</span>
                  </label>
                  <input
                    type="number"
                    value={tunjJabatan}
                    onChange={e => setTunjJabatan(e.target.value)}
                    min="0"
                    className="w-full bg-gray-900 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Tunjangan Makan</label>
                    <input
                      type="number"
                      value={tunjMakan}
                      onChange={e => setTunjMakan(e.target.value)}
                      min="0"
                      className="w-full bg-gray-900 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Tunjangan Transport</label>
                    <input
                      type="number"
                      value={tunjTransport}
                      onChange={e => setTunjTransport(e.target.value)}
                      min="0"
                      className="w-full bg-gray-900 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Preview kalkulasi otomatis */}
              {gp > 0 && (
                <div className="bg-gray-900 rounded-lg p-4 space-y-2 text-sm">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-3">Preview Kalkulasi</p>

                  <div className="flex justify-between">
                    <span className="text-gray-400">Gaji Kotor</span>
                    <span className="text-white font-medium">{formatRupiah(gajiKotor)}</span>
                  </div>

                  <div className="border-t border-gray-700 pt-2 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">BPJS Kesehatan (1%)</span>
                      <span className="text-red-400">-{formatRupiah(bpjsKesehatan)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">BPJS Ketenagakerjaan (2%)</span>
                      <span className="text-red-400">-{formatRupiah(bpjsKetenagakerjaan)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">PPh 21 (5%)</span>
                      <span className="text-red-400">-{formatRupiah(pph21)}</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-700 pt-2 flex justify-between font-bold">
                    <span className="text-gray-300">Gaji Bersih</span>
                    <span className="text-green-400 text-lg">{formatRupiah(gajiBersih)}</span>
                  </div>
                </div>
              )}

              {error && (
                <p className="text-red-400 text-sm bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>
              )}
              {success && (
                <p className="text-green-400 text-sm bg-green-900/20 px-3 py-2 rounded-lg">{success}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setOpen(false); setError(''); setSuccess('') }}
                  className="flex-1 px-4 py-2 border border-gray-600 rounded-lg text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
                >
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