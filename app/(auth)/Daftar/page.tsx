'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function DaftarPage() {
  const supabase = createClient()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleDaftar(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // Cek dulu apakah email ini terdaftar sebagai karyawan di sistem
    const { data: karyawan } = await supabase
      .from('karyawan')
      .select('id, nama, user_id')
      .eq('email', email)
      .maybeSingle()

    if (!karyawan) {
      setError('Email ini tidak terdaftar sebagai karyawan. Hubungi HRD untuk memastikan email Anda sudah diinput di sistem.')
      setLoading(false)
      return
    }

    if (karyawan.user_id) {
      setError('Email ini sudah memiliki akun. Silakan login.')
      setLoading(false)
      return
    }

    // Daftarkan akun baru ke Supabase Auth
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password })

    if (signUpError) {
      setError(`Gagal mendaftar: ${signUpError.message}`)
      setLoading(false)
      return
    }

    // Sambungkan akun baru ke data karyawan secara eksplisit dari kode,
    // tidak bergantung pada trigger database
  if (signUpData.user) {
    const { error: linkError } = await supabase
      .from('karyawan')
      .update({ user_id: signUpData.user.id })
      .eq('email', email)
      .is('user_id', null)

    if (linkError) {
      console.error('Gagal menyambungkan akun ke data karyawan:', linkError)
      setError('Akun berhasil dibuat, tetapi gagal menyambungkan ke data karyawan. Hubungi HRD.')
      setLoading(false)
      return
    }
  }

    setSuccess(`Akun berhasil dibuat untuk ${karyawan.nama}. Silakan login.`)
    setTimeout(() => router.push('/Login'), 2000)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm bg-white border border-border-hairline p-8">

        <div className="mb-8 text-center">
          <div className="w-2 h-2 rounded-full bg-accent mx-auto mb-3" />
          <h1 className="font-display text-2xl text-foreground">Daftar Akun Karyawan</h1>
          <p className="text-muted text-sm mt-1">Gunakan email yang terdaftar di sistem</p>
        </div>

        <form onSubmit={handleDaftar}>
          <div className="mb-4">
            <label className="block text-xs text-muted mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email yang terdaftar di data karyawan"
              required
              className="w-full bg-transparent border-b border-border-hairline text-foreground text-sm py-2 focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div className="mb-6">
            <label className="block text-xs text-muted mb-1.5">Buat Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              required
              minLength={6}
              className="w-full bg-transparent border-b border-border-hairline text-foreground text-sm py-2 focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {error && <p className="text-deduction text-xs mb-4">{error}</p>}
          {success && <p className="text-net-pay text-xs mb-4">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-foreground hover:bg-foreground/90 text-background py-2.5 text-sm font-medium disabled:opacity-50 transition-colors"
          >
            {loading ? 'Mendaftar...' : 'Daftar'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted">
          Sudah punya akun?{' '}
          <a href="/Login" className="text-accent underline underline-offset-2">Login di sini</a>
        </p>

      </div>
    </div>
  )
}