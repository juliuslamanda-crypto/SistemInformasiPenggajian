// app/dashboard/karyawan/TambahKaryawanButton.tsx
'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
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
        className="flex items-center gap-1.5 bg-foreground hover:bg-foreground/90 text-background text-sm px-4 py-2 transition-colors font-medium"
      >
        <Plus className="w-3.5 h-3.5" strokeWidth={2} />
        Tambah karyawan
      </button>

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