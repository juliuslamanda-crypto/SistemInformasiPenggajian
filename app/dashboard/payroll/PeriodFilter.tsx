// app/dashboard/payroll/PeriodFilter.tsx
// ============================================
// PERIOD FILTER — Dropdown filter periode penggajian
// 
// Kenapa file ini dipisah dari page.tsx?
// Karena menggunakan event handler (onChange) yang hanya bisa
// dipakai di Client Component. page.tsx adalah Server Component
// yang tidak bisa menangani event browser.
// ============================================
'use client' // Directive: komponen ini berjalan di browser, bukan server

// Tipe data untuk setiap opsi dropdown
type Option = {
  value: string // Nilai yang dikirim ke URL (contoh: "2025-07-01")
  label: string // Teks yang ditampilkan ke user (contoh: "Juli 2025")
}

/**
 * Komponen dropdown untuk memilih periode penggajian
 * Saat user memilih bulan, halaman akan refresh dengan periode baru
 * 
 * @param options - Array opsi bulan yang tersedia
 * @param selected - Nilai periode yang sedang aktif
 */
export default function PeriodFilter({
  options,
  selected,
}: {
  options: Option[]
  selected: string
}) {
  /**
   * Handler saat user memilih periode baru
   * Mengubah URL dengan query parameter period yang baru
   * Next.js akan otomatis fetch data baru sesuai periode yang dipilih
   */
  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    // Redirect ke URL yang sama tapi dengan period berbeda
    // Contoh: /dashboard/payroll?period=2025-07-01
    window.location.href = `/dashboard/payroll?period=${e.target.value}`
  }

  return (
    // Dropdown select — value dikontrol dari props (controlled component)
    <select
      value={selected}        // Nilai aktif sesuai URL saat ini
      onChange={handleChange} // Fungsi yang dipanggil saat user pilih opsi berbeda
      className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {/* Render satu <option> untuk setiap bulan yang tersedia */}
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label} {/* Contoh: "Juli 2025" */}
        </option>
      ))}
    </select>
  )
}