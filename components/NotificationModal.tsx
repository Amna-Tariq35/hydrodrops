'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { createClient } from '@/lib/supabase/client'
import { Bell, X, ExternalLink, Droplet } from 'lucide-react'
import Link from 'next/link'

export default function NotificationModal({ userId, role }: { userId: string; role: string }) {
  const supabase = createClient()
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const [notifications, setNotifications] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [activeToast, setActiveToast] = useState<any>(null)
  const [mounted, setMounted] = useState<boolean>(false)

  useEffect(() => {
    setMounted(true)
    if (!userId) return

    const fetchNotifications = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(15)

      if (data) {
        setNotifications(data)
        const unread = data.filter((item: any) => !item.is_read).length
        setUnreadCount(unread)
      }
    }

    fetchNotifications()

    // Realtime listener for live notifications
    const channel = supabase
      .channel(`realtime_notif_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setActiveToast(payload.new)
          setUnreadCount((prev) => prev + 1)
          setNotifications((prev) => [payload.new, ...prev])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase])

  const dismissToast = async () => {
    if (activeToast) {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', activeToast.id)

      setActiveToast(null)
      setUnreadCount((prev) => Math.max(0, prev - 1))
      setNotifications((prev) =>
        prev.map((n) => (n.id === activeToast.id ? { ...n, is_read: true } : n))
      )
    }
  }

  const handleToggleMenu = async () => {
    const nextState = !isOpen
    setIsOpen(nextState)

    if (nextState && unreadCount > 0) {
      setUnreadCount(0)
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))

      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false)
    }
  }

  return (
    <>
      <div className="relative">
        {/* Bell Icon with Red Counter Badge */}
        <button
          onClick={handleToggleMenu}
          className="relative p-2 text-gray-600 hover:text-hydro hover:bg-emerald-50 rounded-xl transition flex items-center justify-center"
        >
          <Bell className="w-5 h-5 text-gray-700" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-black leading-none text-white bg-red-500 rounded-full animate-pulse shadow-md">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Bell Click Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-slate-50 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-extrabold text-xs text-gray-800 uppercase tracking-wider">
                Notifications
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-4 transition text-xs ${
                      n.is_read ? 'bg-white opacity-80' : 'bg-emerald-50/40 font-semibold'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-gray-900">{n.title}</span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(n.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-gray-600 text-[11px] mb-2">{n.body}</p>
                    {n.order_id && (
                      <Link
                        href={
                          role === 'admin' ? `/admin/orders/${n.order_id}` : `/orders/${n.order_id}`
                        }
                        onClick={() => setIsOpen(false)}
                        className="text-hydro font-bold hover:underline inline-flex items-center gap-1 text-[11px]"
                      >
                        View Order Details
                      </Link>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-gray-400">No notifications.</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Radiant High-Contrast Toast Notification Portal */}
      {mounted &&
        activeToast &&
        createPortal(
          <div className="fixed bottom-6 right-6 z-[9999] bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-5 shadow-[0_20px_50px_rgba(16,185,129,0.3)] border border-emerald-500/30 max-w-sm w-full backdrop-blur-xl animate-in slide-in-from-bottom-6 duration-300">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <span className="absolute -inset-1 rounded-xl bg-gradient-to-r from-emerald-400 to-sky-400 opacity-75 blur animate-pulse" />
                  <span className="relative p-2 bg-slate-900 text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-500/40">
                    <Droplet className="w-4 h-4 fill-emerald-400" />
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">
                    Live Update
                  </span>
                  <h4 className="font-extrabold text-xs text-white leading-tight">
                    {activeToast.title}
                  </h4>
                </div>
              </div>

              <button
                onClick={dismissToast}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-slate-200 text-xs mb-4 pl-9 leading-relaxed font-medium">
              {activeToast.body}
            </p>

            <div className="flex gap-2 justify-end pt-2 border-t border-white/10">
              <button
                onClick={dismissToast}
                className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition"
              >
                Dismiss
              </button>
              {activeToast.order_id && (
                <Link
                  href={
                    role === 'admin'
                      ? `/admin/orders/${activeToast.order_id}`
                      : `/orders/${activeToast.order_id}`
                  }
                  onClick={dismissToast}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-extrabold text-slate-950 bg-gradient-to-r from-emerald-400 to-sky-400 hover:from-emerald-300 hover:to-sky-300 rounded-xl shadow-lg transition transform active:scale-95"
                >
                  View Order <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  )
}