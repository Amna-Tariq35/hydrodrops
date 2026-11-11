'use client'

import { useState, useEffect, use, Suspense } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import TwoWayLedger from '@/components/TwoWayLedger'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, MapPin, Phone, User, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react'

// Internal component safely consuming dynamic route params inside Suspense
function OrderDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const supabase = createClient()

  const [order, setOrder] = useState<any>(null)
  const [adminEntries, setAdminEntries] = useState<any[]>([])
  const [customerEntries, setCustomerEntries] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchOrderData = async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      // Fetch Order details
      const { data: ord } = await supabase
        .from('orders')
        .select('*, deals(name)')
        .eq('id', id)
        .single()

      if (!ord) {
        router.push('/dashboard')
        return
      }

      // Verify ownership
      if (ord.customer_id !== user.id) {
        router.push('/dashboard')
        return
      }

      setOrder(ord)

      // Fetch Admin delivery entries
      const { data: adminLogs } = await supabase
        .from('delivery_entries')
        .select('*')
        .eq('order_id', ord.id)
        .order('entry_no', { ascending: true })

      // Fetch Customer personal entries
      const { data: customerLogs } = await supabase
        .from('customer_entries')
        .select('*')
        .eq('order_id', ord.id)
        .order('entry_no', { ascending: true })

      setAdminEntries(adminLogs || [])
      setCustomerEntries(customerLogs || [])
      setLoading(false)
    }

    fetchOrderData()
  }, [id, router, supabase])

  if (loading) {
    return <div className="text-center py-20 text-xs text-gray-400">Loading order details...</div>
  }

  if (!order) return null

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-800 mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      {/* Header Summary */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-extrabold text-gray-900">{order.order_no}</h1>
              <span
                className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${
                  order.status === 'accepted'
                    ? 'bg-green-100 text-green-700'
                    : order.status === 'pending'
                    ? 'bg-amber-100 text-amber-700'
                    : order.status === 'completed'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {order.status}
              </span>
            </div>
            <p className="text-xs text-gray-500 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" /> Placed on {new Date(order.created_at).toLocaleDateString()}
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-gray-400 block uppercase font-semibold">Package Value</span>
            <span className="text-2xl font-black text-hydro">Rs. {order.deal_price}</span>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            <span>{order.customer_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-400" />
            <span>{order.customer_phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span>{order.customer_address}, {order.customer_city}</span>
          </div>
        </div>
      </div>

      {/* Pending Status Alert Banner */}
      {order.status === 'pending' && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-xs text-amber-800">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <span>
            Your order is currently <strong>Pending Admin Acceptance</strong>. Bottle entries can be added once accepted.
          </span>
        </div>
      )}

      {/* Completed Status Notice */}
      {order.status === 'completed' && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-blue-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <span>
              This order package is <strong>Completed</strong>. You can still log or adjust your personal bottle receipt entries below anytime.
            </span>
          </div>
        </div>
      )}

      {/* Side-By-Side Two Way Bottle Tracking Ledger */}
      <TwoWayLedger
        order={order}
        adminEntries={adminEntries}
        customerEntries={customerEntries}
        userRole="customer"
      />
    </main>
  )
}

export default function CustomerOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <Suspense fallback={<div className="text-center py-20 text-xs text-gray-400">Loading order details...</div>}>
        <OrderDetailContent params={params} />
      </Suspense>
    </div>
  )
}