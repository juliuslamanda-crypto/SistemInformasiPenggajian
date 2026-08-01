// app/karyawan-portal/layout.tsx
'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function KaryawanPortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const router = useRouter()

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/Login'
  }

  return (
    <div className="min-h-screen bg-background">

      <header className="print:hidden border-b border-border-hairline">
        <div className="max-w-2xl mx-auto px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent" />
            <span className="text-sm font-medium text-foreground">Portal Karyawan — ABC Company</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-muted hover:text-foreground transition-colors"
          >
            Keluar
          </button>
        </div>
      </header>

      <main>{children}</main>

    </div>
  )
}