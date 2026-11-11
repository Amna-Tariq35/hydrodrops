'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Droplet, LogOut, Shield, LayoutDashboard } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import NotificationModal from '@/components/NotificationModal'

function NavbarContent() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [mounted, setMounted] = useState<boolean>(false)

  useEffect(() => {
    setMounted(true)
    const getUserData = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      setUser(currentUser)

      if (currentUser) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .maybeSingle()

        setProfile(prof || { id: currentUser.id, role: 'customer' })

        if (prof?.role === 'admin' && ['/', '/login', '/signup'].includes(pathname || '')) {
          router.replace('/admin')
        }
      }
    }
    getUserData()
  }, [pathname, router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-emerald-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 min-h-16 py-2 flex items-center justify-between gap-1 sm:gap-2">
        
        {/* Brand Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2 group">
          <div className="p-1.5 sm:p-2 bg-gradient-to-br from-hydro to-drops rounded-xl text-white shadow-md group-hover:scale-105 transition">
            <Droplet className="w-5 h-5 fill-white" />
          </div>
          <span className="text-base sm:text-xl font-extrabold bg-gradient-to-r from-hydro to-drops bg-clip-text text-transparent">
            Hydrodrops
          </span>
        </Link>

        {/* Navigation Links & Notification Bell */}
        <nav className="flex shrink-0 items-center gap-1 sm:gap-3">
          {!mounted ? (
            <div className="h-8 w-24 bg-gray-100/50 rounded-xl animate-pulse" />
          ) : user ? (
            <>
              {/* Always mount Notification System for logged-in user */}
              <NotificationModal userId={user.id} role={profile?.role || 'customer'} />

              {profile?.role === 'admin' ? (
                <Link
                  href="/admin"
                  aria-label="Admin Center"
                  className={`px-2 sm:px-3 py-2 sm:py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    pathname?.startsWith('/admin')
                      ? 'bg-hydro text-white shadow-sm'
                      : 'text-gray-700 hover:bg-emerald-50 hover:text-hydro'
                  }`}
                >
                  <Shield className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline">Admin Center</span>
                </Link>
              ) : (
                <Link
                  href="/dashboard"
                  aria-label="Dashboard"
                  className={`px-2 sm:px-3 py-2 sm:py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    pathname === '/dashboard'
                      ? 'bg-gradient-to-r from-hydro to-drops text-white shadow-sm'
                      : 'text-gray-700 hover:bg-sky-50 hover:text-drops'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
              )}

              <button
                onClick={handleLogout}
                aria-label="Log out"
                className="px-2 sm:px-3 py-2 sm:py-1.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition flex items-center gap-1"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-2 sm:px-4 py-2 text-xs font-bold text-gray-700 hover:text-hydro transition"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-2 sm:px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-hydro to-drops rounded-xl shadow hover:opacity-90 transition"
              >
                <span className="sm:hidden">Sign Up</span>
                <span className="hidden sm:inline">Get Started</span>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

export default function Navbar() {
  return (
    <Suspense
      fallback={
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-emerald-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 min-h-16 py-2 flex items-center justify-between gap-1 sm:gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-hydro to-drops rounded-xl text-white">
                <Droplet className="w-5 h-5 fill-white" />
              </div>
              <span className="text-base sm:text-xl font-extrabold bg-gradient-to-r from-hydro to-drops bg-clip-text text-transparent">
                Hydrodrops
              </span>
            </div>
          </div>
        </header>
      }
    >
      <NavbarContent />
    </Suspense>
  )
}