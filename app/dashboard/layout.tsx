// app/dashboard/layout.tsx
'use client'
import Link from 'next/link'
import {usePathname} from 'next/navigation'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-gray-900">

      {/* Sidebar */}
      <aside className="w-56 bg-gray-800 border-r border-gray-700 flex flex-col fixed h-full">
        
        {/* Logo */}
        <div className="p-6 border-b border-gray-700">
          <h1 className="font-bold text-white text-sm">Sistem Informasi</h1>
          <p className="text-xs text-blue-400 mt-0.5">Penggajian — ABC Company</p>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-4 space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/dashboard/karyawan"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
          >
            Karyawan
          </Link>
          <Link
            href="/dashboard/jabatan"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
          >
            Jabatan
          </Link>
          <Link
            href="/dashboard/payroll"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
          >
            Payroll
          </Link>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <p className="text-xs text-gray-500">Dataset: Kaggle</p>
          <p className="text-xs text-gray-500">Sample Employee Monthly Salary</p>
        </div>

      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-56">
        {children}
      </main>

    </div>
  )
}