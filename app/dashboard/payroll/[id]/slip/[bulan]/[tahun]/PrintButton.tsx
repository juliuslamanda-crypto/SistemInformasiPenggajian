// PrintButton.tsx — tombol print, harus Client Component karena pakai window.print()
'use client'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors font-medium"
    >
      🖨️ Cetak Slip Gaji
    </button>
  )
}