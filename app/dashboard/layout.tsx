// app/dashboard/layout.tsx
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Cek session saat halaman dashboard dibuka
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // Belum login → redirect ke login
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

  // Tampilkan loading sementara cek session
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Memuat...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-900">

      {/* Sidebar */}
      <aside className="w-56 bg-gray-800 border-r border-gray-700 flex flex-col fixed h-full">

        <div className="p-6 border-b border-gray-700">
          <h1 className="font-bold text-white text-sm">Sistem Informasi</h1>
          <p className="text-xs text-blue-400 mt-0.5">Penggajian — ABC Company</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Tombol logout */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
          >
            Keluar
          </button>
          <p className="text-xs text-gray-600 mt-2">Dataset: Kaggle</p>
          <p className="text-xs text-gray-600">Sample Employee Monthly Salary</p>
        </div>

      </aside>

      <main className="flex-1 ml-56">
        {children}
      </main>

    </div>
  )
}