'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/client'
import { Bell, Check, ExternalLink, Trash2 } from 'lucide-react'

export default function NotificationsPage() {
  const supabase = createClient()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNotifications = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (data) setNotifications(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const markAllAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)

      fetchNotifications()
    }
  }

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    fetchNotifications()
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              <Bell className="w-6 h-6 text-hydro" /> Notification History
            </h1>
            <p className="text-xs text-gray-500">Updates about your order approvals and bottle deliveries</p>
          </div>

          {notifications.some((n) => !n.is_read) && (
            <button
              onClick={markAllAsRead}
              className="px-3 py-1.5 bg-hydro-light text-hydro text-xs font-bold rounded-xl hover:bg-hydro hover:text-white transition flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" /> Mark All as Read
            </button>
          )}
        </div>

        <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100">
          {loading ? (
            <div className="text-center py-12 text-xs text-gray-400">Loading notifications...</div>
          ) : notifications.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`py-4 flex items-start justify-between gap-4 transition ${
                    !notif.is_read ? 'bg-hydro-light/20 -mx-6 px-6 rounded-xl' : ''
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-900">{notif.title}</span>
                      {!notif.is_read && (
                        <span className="w-2 h-2 bg-hydro rounded-full inline-block"></span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600">{notif.body}</p>
                    <p className="text-[10px] text-gray-400">
                      {new Date(notif.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {notif.order_id && (
                      <Link
                        href={`/orders/${notif.order_id}`}
                        onClick={() => markAsRead(notif.id)}
                        className="p-2 text-gray-500 hover:text-hydro rounded-lg hover:bg-gray-100 transition"
                        title="View Order"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-xs text-gray-400">
              No notifications received yet.
            </div>
          )}
        </div>
      </main>
    </div>
  )
}