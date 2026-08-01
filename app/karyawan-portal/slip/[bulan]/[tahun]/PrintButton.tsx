'use client'

import { Printer } from 'lucide-react'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-1.5 bg-foreground hover:bg-foreground/90 text-background text-xs px-4 py-2 transition-colors font-medium"
    >
      <Printer className="w-3.5 h-3.5" strokeWidth={2} />
      Cetak slip gaji
    </button>
  )
}