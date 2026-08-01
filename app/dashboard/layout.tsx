'use client'

import type { Session } from '@supabase/supabase-js'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const supabase = createClient()

  const pathname = usePathname()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      if (!session) {
        router.push('/Login')
      } else {
        setLoading(false)
      }
    })
  }, [router])

  const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/dashboard/karyawan', label: 'Karyawan' },
    { href: '/dashboard/jabatan', label: 'Jabatan' },
    { href: '/dashboard/payroll', label: 'Penggajian' },
  ]

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/Login'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted text-sm">Memuat...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">

      {/* Sidebar */}
      <aside className="print:hidden w-48 bg-background border-r border-border-hairline flex flex-col fixed h-full">

        <div className="p-5 border-b border-border-hairline flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-accent shrink-0" />
          <div>
            <h1 className="font-display font-semibold text-foreground text-sm leading-tight">Sistem Informasi</h1>
            <p className="text-[11px] text-muted mt-0.5">Penggajian — ABC Company</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive = item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-1.5 text-sm border-l-2 transition-colors ${
                  isActive
                    ? 'border-accent text-accent font-medium'
                    : 'border-transparent text-muted hover:text-foreground'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border-hairline">
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-1.5 text-sm text-muted hover:text-foreground transition-colors"
          >
            Keluar
          </button>
          <p className="text-[10px] text-muted/70 mt-2 px-3">Dataset: Kaggle</p>
          <p className="text-[10px] text-muted/70 px-3">Sample Employee Monthly Salary</p>
        </div>

      </aside>

      <main className="flex-1 ml-48 print:ml-0">
        {children}
      </main>

    </div>
  )
}