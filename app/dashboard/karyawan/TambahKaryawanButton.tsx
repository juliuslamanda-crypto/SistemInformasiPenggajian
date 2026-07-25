// app/dashboard/karyawan/TambahKaryawanButton.tsx
// Tombol yang membuka modal form tambah karyawan baru.
// Dipisah dari page.tsx karena butuh useState untuk buka/tutup modal.
'use client'

import { useState } from 'react'
import KaryawanForm from './KaryawanForm'

type Props = {
  jabatanList: { id: string; nama: string }[]
  departemenList: { id: string; nama: string }[]
}

export default function TambahKaryawanButton({ jabatanList, departemenList }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition-colors font-medium"
      >
        + Tambah Karyawan
      </button>

      {/* Modal form tambah — hanya dirender saat open = true */}
      {open && (
        <KaryawanForm
          mode="tambah"
          jabatanList={jabatanList}
          departemenList={departemenList}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}