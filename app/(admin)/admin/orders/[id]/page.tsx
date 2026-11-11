'use client'

import { useState, useEffect, use, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import TwoWayLedger from '@/components/TwoWayLedger'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, CheckCircle, XCircle, User, Phone, MapPin, Calendar, Tag } from 'lucide-react'

// Internal component consuming dynamic route params safely inside Suspense
function AdminOrderDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const supabase = createClient()

  const [order, setOrder] = useState<any>(null)
  const [adminEntries, setAdminEntries] = useState<any[]>([])
  const [customerEntries, setCustomerEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchOrderDetails = async () => {
    setLoading(true)

    // Fetch order
    const { data: orderData } = await supabase
      .from('orders')
      .select('*, deals(name)')
      .eq('id', id)
      .single()

    if (orderData) {
      setOrder(orderData)

      // Fetch admin entries
      const { data: adminData } = await supabase
        .from('delivery_entries')
        .select('*')
        .eq('order_id', id)
        .order('entry_no', { ascending: true })

      // Fetch customer entries
      const { data: customerData } = await supabase
        .from('customer_entries')
        .select('*')
        .eq('order_id', id)
        .order('entry_no', { ascending: true })

      setAdminEntries(adminData || [])
      setCustomerEntries(customerData || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchOrderDetails()
  }, [id])

  const handleUpdateStatus = async (newStatus: 'accepted' | 'rejected') => {
    setActionLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('orders')
      .update({
        status: newStatus,
        accepted_by: user?.id,
        accepted_at: newStatus === 'accepted' ? new Date().toISOString() : null,
      })
      .eq('id', id)

    if (!error) {
      await fetchOrderDetails()
    } else {
      alert(error.message)
    }
    setActionLoading(false)
  }

  if (loading) {
    return <div className="text-center py-20 text-xs text-gray-400">Loading order details...</div>
  }

  if (!order) {
    return <div className="text-center py-20 text-xs text-gray-400">Order not found.</div>
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-800 mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </button>

      {/* Order Header Summary Card */}
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
              <span className="text-xs bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-full font-bold uppercase">
                {order.source}
              </span>
            </div>
            <p className="text-xs text-gray-500 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" /> Placed on {new Date(order.created_at).toLocaleDateString()}
            </p>
          </div>

          {/* Accept / Reject Action Buttons for Pending Orders */}
          {order.status === 'pending' && (
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                disabled={actionLoading}
                onClick={() => handleUpdateStatus('rejected')}
                className="flex-1 sm:flex-none px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1"
              >
                <XCircle className="w-4 h-4" /> Reject Order
              </button>
              <button
                disabled={actionLoading}
                onClick={() => handleUpdateStatus('accepted')}
                className="flex-1 sm:flex-none px-5 py-2 bg-hydro text-white font-bold text-xs rounded-xl hover:bg-hydro-dark shadow transition flex items-center justify-center gap-1"
              >
                <CheckCircle className="w-4 h-4" /> Accept Order
              </button>
            </div>
          )}
        </div>

        {/* Customer & Package Specs */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-6 text-xs text-gray-600">
          <div>
            <span className="text-gray-400 block mb-0.5 font-semibold">CUSTOMER NAME</span>
            <p className="font-bold text-gray-800 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-gray-400" /> {order.customer_name}
            </p>
          </div>

          <div>
            <span className="text-gray-400 block mb-0.5 font-semibold">PHONE NUMBER</span>
            <p className="font-bold text-gray-800 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-gray-400" /> {order.customer_phone}
            </p>
          </div>

          <div>
            <span className="text-gray-400 block mb-0.5 font-semibold">DELIVERY ADDRESS</span>
            <p className="font-bold text-gray-800 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-gray-400" /> {order.customer_address}, {order.customer_city}
            </p>
          </div>

          <div>
            <span className="text-gray-400 block mb-0.5 font-semibold">SELECTED DEAL</span>
            <p className="font-bold text-hydro flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" /> {order.deals?.name || 'Coupon Deal'}
            </p>
          </div>
        </div>
      </div>

      {/* Two Way Bottle Delivery & Reception Ledger */}
      <TwoWayLedger
        order={order}
        adminEntries={adminEntries}
        customerEntries={customerEntries}
        userRole="admin"
      />
    </main>
  )
}

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <Suspense fallback={<div className="text-center py-20 text-xs text-gray-400">Loading order details...</div>}>
        <AdminOrderDetailContent params={params} />
      </Suspense>
    </div>
  )
}