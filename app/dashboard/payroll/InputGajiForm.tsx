// app/dashboard/payroll/InputGajiForm.tsx
'use client'

import { useState } from 'react'
import { inputGaji } from './actions'
import { formatSalary, getPeriodOptions } from '@/lib/payrollHelper'

type Karyawan = {
  id: string
  nama: string
  employee_id: string
}

export default function InputGajiForm({
  karyawanList,
}: {
  karyawanList: Karyawan[]
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [netPayPreview, setNetPayPreview] = useState<number | null>(null)

  const [gross, setGross] = useState('')
  const [deduction, setDeduction] = useState('')

  const periodOptions = getPeriodOptions()

  // Preview net pay secara real-time
  function handleCalc(g: string, d: string) {
    const gNum = parseFloat(g)
    const dNum = parseFloat(d)
    if (!isNaN(gNum) && !isNaN(dNum) && gNum > 0) {
      setNetPayPreview(gNum - dNum)
    } else {
      setNetPayPreview(null)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const formData = new FormData(e.currentTarget)
    const result = await inputGaji(formData)

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(`Gaji berhasil disimpan! Net Pay: ${formatSalary(result.net_pay ?? 0)}`)
      setNetPayPreview(null)
      setGross('')
      setDeduction('')
      setTimeout(() => {
        setOpen(false)
        setSuccess('')
      }, 2000)
    }

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

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 w-full max-w-md mx-4">
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-white">Input Gaji Karyawan</h2>
              <button
                onClick={() => { setOpen(false); setError(''); setSuccess('') }}
                className="text-gray-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Pilih Karyawan */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Karyawan</label>
                <select
                  name="karyawan_id"
                  required
                  className="w-full bg-gray-900 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih karyawan...</option>
                  {karyawanList.map(k => (
                    <option key={k.id} value={k.id}>
                      {k.nama} ({k.employee_id})
                    </option>
                  ))}
                </select>
              </div>

              {/* Pilih Periode */}
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

              {/* Gross Salary */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Gross Salary</label>
                <input
                  type="number"
                  name="gross"
                  value={gross}
                  onChange={e => { setGross(e.target.value); handleCalc(e.target.value, deduction) }}
                  placeholder="Contoh: 50000"
                  required
                  min="0"
                  step="0.01"
                  className="w-full bg-gray-900 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Deduction */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Total Deduction</label>
                <input
                  type="number"
                  name="deduction"
                  value={deduction}
                  onChange={e => { setDeduction(e.target.value); handleCalc(gross, e.target.value) }}
                  placeholder="Contoh: 5000"
                  required
                  min="0"
                  step="0.01"
                  className="w-full bg-gray-900 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Preview Net Pay */}
              {netPayPreview !== null && (
                <div className="bg-gray-900 rounded-lg p-3 border border-green-500/30">
                  <p className="text-xs text-gray-400">Preview Net Pay</p>
                  <p className="text-green-400 font-bold text-lg">{formatSalary(netPayPreview)}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Deduction %: {gross ? ((parseFloat(deduction) / parseFloat(gross)) * 100).toFixed(2) : 0}%
                  </p>
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