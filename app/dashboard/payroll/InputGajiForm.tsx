// Form modal untuk input gaji karyawan baru atau update gaji karyawan yg sudah ada.
// Komponen gaji mengikuti terdiri dari : gaji pokok, tunjangan, BPJS, PPh 21.
'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { formatRupiah, getPeriodOptions } from '@/lib/payrollHelper'
import { createClient } from '@/lib/supabase/client'

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
  const supabase = createClient()

  const [open, setOpen]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')

  const [karyawanId, setKaryawanId]   = useState('')
  const [bulan, setBulan]             = useState('')
  const [tahun, setTahun]             = useState('')
  const [gajiPokok, setGajiPokok]     = useState('')
  const [tunjJabatan, setTunjJabatan] = useState('')
  const [tunjMakan, setTunjMakan]     = useState('750000')
  const [tunjTransport, setTunjTransport] = useState('500000')

  const gp  = parseFloat(gajiPokok)    || 0
  const tj  = parseFloat(tunjJabatan)  || 0
  const tm  = parseFloat(tunjMakan)    || 0
  const tt  = parseFloat(tunjTransport) || 0

  const gajiKotor          = gp + tj + tm + tt
  const bpjsKesehatan      = Math.round(gp * 0.01)
  const bpjsKetenagakerjaan = Math.round(gp * 0.02)
  const pph21              = Math.round(gp * 0.05)
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

  const inputClass = "w-full bg-transparent border-b border-border-hairline text-foreground text-sm py-2 focus:outline-none focus:border-accent transition-colors"
  const labelClass = "block text-xs text-muted mb-1.5"

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 bg-foreground hover:bg-foreground/90 text-background text-sm px-4 py-2 transition-colors font-medium"
      >
        <Plus className="w-3.5 h-3.5" strokeWidth={2} />
        Input gaji
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white border border-border-hairline p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">

            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-lg text-foreground">Input gaji karyawan</h2>
              <button
                onClick={() => { setOpen(false); setError(''); setSuccess('') }}
                className="text-muted hover:text-foreground text-lg leading-none"
              >✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Pilih karyawan */}
              <div>
                <label className={labelClass}>Karyawan *</label>
                <input
                  list="karyawan-list"
                  placeholder="Ketik nama atau ID karyawan..."
                  onChange={e => {
                    const found = karyawanList.find(
                      k => `${k.nama} (${k.employee_id})` === e.target.value
                    )
                    if (found) setKaryawanId(found.id)
                  }}
                  className={inputClass}
                />
                <datalist id="karyawan-list">
                  {karyawanList.map(k => (
                    <option key={k.id} value={`${k.nama} (${k.employee_id})`} />
                  ))}
                </datalist>
              </div>

              {/* Pilih periode */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Bulan *</label>
                  <select
                    value={bulan}
                    onChange={e => setBulan(e.target.value)}
                    required
                    className={inputClass}
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
                  <label className={labelClass}>Tahun *</label>
                  <select
                    value={tahun}
                    onChange={e => setTahun(e.target.value)}
                    required
                    className={inputClass}
                  >
                    <option value="">Pilih tahun...</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                  </select>
                </div>
              </div>

              {/* Komponen pendapatan */}
              <div className="border-t border-b border-border-strong py-4 space-y-4">
                <p className="text-xs text-muted uppercase tracking-wide">Komponen pendapatan</p>

                <div>
                  <label className={labelClass}>Gaji pokok *</label>
                  <input
                    type="number"
                    value={gajiPokok}
                    onChange={e => {
                      setGajiPokok(e.target.value)
                      const gp = parseFloat(e.target.value) || 0
                      setTunjJabatan(String(Math.round(gp * 0.15)))
                    }}
                    placeholder="Contoh: 5000000"
                    required
                    min="0"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Tunjangan jabatan
                    <span className="text-muted/70 ml-1">(otomatis 15% dari gaji pokok)</span>
                  </label>
                  <input
                    type="number"
                    value={tunjJabatan}
                    onChange={e => setTunjJabatan(e.target.value)}
                    min="0"
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Tunjangan makan</label>
                    <input
                      type="number"
                      value={tunjMakan}
                      onChange={e => setTunjMakan(e.target.value)}
                      min="0"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Tunjangan transport</label>
                    <input
                      type="number"
                      value={tunjTransport}
                      onChange={e => setTunjTransport(e.target.value)}
                      min="0"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* Preview kalkulasi otomatis */}
              {gp > 0 && (
                <div className="text-sm">
                  <p className="text-xs text-muted uppercase tracking-wide mb-3">Preview kalkulasi</p>

                  <div className="flex justify-between items-baseline py-1.5">
                    <span className="text-foreground/70">Gaji kotor</span>
                    <span className="font-mono text-foreground">{formatRupiah(gajiKotor)}</span>
                  </div>

                  <div className="border-t border-border-hairline pt-2 mt-1 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted">BPJS kesehatan (1%)</span>
                      <span className="font-mono text-deduction">-{formatRupiah(bpjsKesehatan)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted">BPJS ketenagakerjaan (2%)</span>
                      <span className="font-mono text-deduction">-{formatRupiah(bpjsKetenagakerjaan)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted">PPh 21 (5%)</span>
                      <span className="font-mono text-deduction">-{formatRupiah(pph21)}</span>
                    </div>
                  </div>

                  <div className="border-t border-border-strong pt-2 mt-2 flex justify-between items-baseline">
                    <span className="font-medium text-foreground">Gaji bersih</span>
                    <span className="font-mono text-lg font-medium text-net-pay">{formatRupiah(gajiBersih)}</span>
                  </div>
                </div>
              )}

              {error && (
                <p className="text-deduction text-xs">{error}</p>
              )}
              {success && (
                <p className="text-net-pay text-xs">{success}</p>
              )}

              <div className="flex gap-3 pt-4 border-t border-border-hairline">
                <button
                  type="button"
                  onClick={() => { setOpen(false); setError(''); setSuccess('') }}
                  className="flex-1 px-4 py-2 border border-border-hairline text-sm text-foreground/70 hover:border-border-strong transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-foreground hover:bg-foreground/90 text-background px-4 py-2 text-sm font-medium disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Menyimpan...' : 'Simpan gaji'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  )
}