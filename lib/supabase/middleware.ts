import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/orders') ||
    pathname.startsWith('/notifications') ||
    pathname.startsWith('/profile')

  // Unauthenticated user protection
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, profile_completed')
      .eq('id', user.id)
      .single()

    // Redirect to profile completion if details are missing
    if (
      profile &&
      !profile.profile_completed &&
      !pathname.startsWith('/complete-profile') &&
      !pathname.startsWith('/auth')
    ) {
      const url = request.nextUrl.clone()
      url.pathname = '/complete-profile'
      return NextResponse.redirect(url)
    }

    // Restrict Admin routes from standard customers
    if (pathname.startsWith('/admin') && profile?.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }

    // Redirect logged in user away from auth pages
    if (pathname === '/login' || pathname === '/signup') {
      const url = request.nextUrl.clone()
      url.pathname = profile?.role === 'admin' ? '/admin' : '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}