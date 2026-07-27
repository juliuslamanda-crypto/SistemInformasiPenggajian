'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'


export default function LoginPage() {
  // Buat instance Supabase client khusus browser (session disimpan di cookies)
  const supabase = createClient()

  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Dipanggil saat form login di-submit
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Coba login pakai email + password ke Supabase Auth
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      // Jangan tampilkan pesan error asli dari Supabase (bisa bocorin info sensitif),
      // cukup pesan generik biar aman
      setError('Email atau password salah.')
      setLoading(false)
      return
    }

    // Pakai window.location (bukan router.push) supaya terjadi full page reload —
    // ini memastikan middleware langsung baca cookie session yang baru di-set
    window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      {/* Card login — bg putih beda dari page background (cream) supaya ada definisi visual */}
      <div className="w-full max-w-sm bg-white border border-border-hairline p-8">

        {/* Header / branding */}
        <div className="mb-8 text-center">
          <div className="w-2 h-2 rounded-full bg-accent mx-auto mb-3" />
          <h1 className="font-display text-2xl text-foreground">Sistem Informasi</h1>
          <p className="text-muted text-sm mt-1">Penggajian — ABC Company</p>
        </div>

        <form onSubmit={handleLogin}>
          {/* Input email */}
          <div className="mb-4">
            <label className="block text-xs text-muted mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Masukan email"
              required
              className="w-full bg-transparent border-b border-border-hairline text-foreground text-sm py-2 focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Input password */}
          <div className="mb-6">
            <label className="block text-xs text-muted mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-transparent border-b border-border-hairline text-foreground text-sm py-2 focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Pesan error, cuma muncul kalau ada error */}
          {error && (
            <p className="text-deduction text-xs mb-4">{error}</p>
          )}

          {/* Tombol submit — disabled + teks berubah pas loading, mencegah double-submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-foreground hover:bg-foreground/90 text-background py-2.5 text-sm font-medium disabled:opacity-50 transition-colors"
          >
            {loading ? 'Memuat...' : 'Masuk'}
          </button>
        </form>

        {/* Info akun demo, buat memudahkan testing/demo */}
        <div className="mt-6 pt-4 border-t border-border-hairline text-center">
          <p className="text-xs text-muted mb-1">Akun demo</p>
          <p className="text-xs text-muted font-mono">admin@abc.com · admin123</p>
        </div>

      </div>
    </div>
  )
}