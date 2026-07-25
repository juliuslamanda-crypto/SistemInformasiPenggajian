// app/(auth)/Login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

 async function handleLogin(e: React.FormEvent) {
  e.preventDefault()
  setLoading(true)
  setError('')

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    setError('Email atau password salah.')
    setLoading(false)
    return
  }

  // Ganti router.push dengan window.location untuk force full page reload
  window.location.href = '/dashboard'
}

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 w-full max-w-sm">

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">Sistem Informasi</h1>
          <p className="text-blue-400 text-sm mt-1">Penggajian — ABC Company</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@abc.com"
              required
              className="w-full bg-gray-900 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-gray-900 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
          >
            {loading ? 'Memuat...' : 'Masuk'}
          </button>
        </form>

        {/* Akun demo */}
        <div className="mt-6 p-3 bg-gray-900 rounded-lg">
          <p className="text-xs text-gray-500 font-medium mb-1">Akun demo:</p>
          <p className="text-xs text-gray-400">Email: admin@abc.com</p>
          <p className="text-xs text-gray-400">Password: admin123</p>
        </div>

      </div>
    </div>
  )
}