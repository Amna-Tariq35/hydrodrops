'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/client'
import { ShoppingBag, ArrowRight, Clock, PlusCircle } from 'lucide-react'

function CustomerOrdersContent() {
  const supabase = createClient()
  const [orders, setOrders] = useState<any[]>([])
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCustomerOrders = async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        let query = supabase
          .from('orders')
          .select('*, deals(name)')
          .eq('customer_id', user.id)
          .order('created_at', { ascending: false })

        if (filterStatus !== 'all') {
          query = query.eq('status', filterStatus)
        }

        const { data } = await query
        if (data) setOrders(data)
      }
      setLoading(false)
    }

    fetchCustomerOrders()
  }, [filterStatus])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-hydro" /> My Order History
          </h1>
          <p className="text-xs text-gray-500">Track all your previous and active water coupon packages</p>
        </div>

        <Link
          href="/orders/new"
          className="px-4 py-2.5 bg-gradient-to-r from-hydro to-drops text-white text-xs font-bold rounded-xl shadow hover:opacity-90 transition flex items-center gap-1.5"
        >
          <PlusCircle className="w-4 h-4" /> Order New Deal
        </Link>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6">
        {[
          { id: 'all', label: 'All Orders' },
          { id: 'accepted', label: 'Active (Accepted)' },
          { id: 'pending', label: 'Pending Approval' },
          { id: 'completed', label: 'Completed' },
          { id: 'rejected', label: 'Cancelled / Rejected' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              filterStatus === tab.id
                ? 'bg-hydro text-white shadow'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        {loading ? (
          <div className="text-center py-12 text-xs text-gray-400">Loading orders...</div>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="p-5 rounded-2xl border border-gray-100 bg-slate-50 hover:bg-white hover:shadow-md transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-900">{order.order_no}</span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
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
                  <p className="text-xs text-gray-500">
                    Deal: <strong className="text-gray-700">{order.deals?.name || 'Coupon Deal'}</strong> • Placed on{' '}
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right">
                    <p className="text-sm font-extrabold text-hydro">{order.bottles_remaining} Bottles Left</p>
                    <p className="text-xs text-gray-400">{order.bottles_delivered} / {order.deal_bottles} Delivered</p>
                  </div>

                  <Link
                    href={`/orders/${order.id}`}
                    className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 transition shadow-sm flex items-center gap-1"
                  >
                    Details <ArrowRight className="w-3.5 h-3.5 text-hydro" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-xs text-gray-400">
            No orders found under this status.
          </div>
        )}
      </div>
    </div>
  )
}

export default function CustomerOrdersPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <Suspense fallback={<div className="text-center py-10">Loading orders...</div>}>
        <CustomerOrdersContent />
      </Suspense>
    </div>
  )
}