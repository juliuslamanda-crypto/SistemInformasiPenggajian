import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard')
  const isKaryawanRoute = request.nextUrl.pathname.startsWith('/karyawan-portal')

  // Belum login, tapi coba akses halaman terproteksi -> lempar ke Login
  if (!user && (isDashboardRoute || isKaryawanRoute)) {
    const url = request.nextUrl.clone()
    url.pathname = '/Login'
    return NextResponse.redirect(url)
  }

  // Sudah login -> cek dia admin atau karyawan
  if (user) {
    const { data: karyawan } = await supabase
      .from('karyawan')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    const isKaryawan = !!karyawan

    // Karyawan mencoba akses area admin -> tolak, lempar ke portal karyawan
    if (isKaryawan && isDashboardRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/karyawan-portal'
      return NextResponse.redirect(url)
    }

    // Admin mencoba akses area karyawan -> tolak, lempar ke dashboard admin
    if (!isKaryawan && isKaryawanRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}