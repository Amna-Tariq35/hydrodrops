'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/client'
import { PlusCircle, Search, Filter, Truck, CheckCircle2, Clock, XCircle } from 'lucide-react'

function OrdersTabContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get('tab') || 'all'
  const supabase = createClient()

  const [orders, setOrders] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true)
      let query = supabase
        .from('orders')
        .select('*, deals(name)')
        .order('created_at', { ascending: false })

      if (activeTab === 'pending') query = query.eq('status', 'pending')
      if (activeTab === 'active') query = query.eq('status', 'accepted')
      if (activeTab === 'completed') query = query.eq('status', 'completed')
      if (activeTab === 'rejected') query = query.in('status', ['rejected', 'cancelled'])

      const { data } = await query
      if (data) setOrders(data)
      setLoading(false)
    }

    fetchOrders()
  }, [activeTab])

  const filteredOrders = orders.filter(
    (o) =>
      o.order_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer_phone.includes(searchTerm)
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Orders Management</h1>
          <p className="text-xs text-gray-500">Filter, accept, and log bottle deliveries for customer accounts</p>
        </div>

        <Link
          href="/admin/orders/new"
          className="px-4 py-2.5 bg-gradient-to-r from-hydro to-drops text-white text-xs font-bold rounded-xl shadow hover:opacity-90 transition flex items-center gap-1.5"
        >
          <PlusCircle className="w-4 h-4" /> + Manual Walk-In Order
        </Link>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 border-b border-gray-200">
        {[
          { id: 'all', label: 'All Orders' },
          { id: 'pending', label: 'Pending', count: orders.filter(o => o.status === 'pending').length },
          { id: 'active', label: 'Active (Delivering)' },
          { id: 'completed', label: 'Completed' },
          { id: 'rejected', label: 'Rejected / Cancelled' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => router.push(`/admin/orders?tab=${tab.id}`)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-hydro text-white shadow'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="mb-6 relative max-w-md">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search by Order #, Customer Name or Phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-hydro"
        />
      </div>

      {/* Orders List Table */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        {loading ? (
          <div className="text-center py-12 text-xs text-gray-400">Loading orders...</div>
        ) : filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase">
                  <th className="pb-3 font-semibold">Order #</th>
                  <th className="pb-3 font-semibold">Customer</th>
                  <th className="pb-3 font-semibold">Source</th>
                  <th className="pb-3 font-semibold">Deal</th>
                  <th className="pb-3 font-semibold">Progress</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition">
                    <td className="py-4 font-bold text-gray-900">{order.order_no}</td>
                    <td className="py-4">
                      <p className="font-semibold text-gray-800">{order.customer_name}</p>
                      <p className="text-xs text-gray-400">{order.customer_phone}</p>
                    </td>
                    <td className="py-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        order.source === 'walk_in' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {order.source}
                      </span>
                    </td>
                    <td className="py-4 font-medium text-gray-700">{order.deals?.name || 'Coupon Deal'}</td>
                    <td className="py-4">
                      <p className="text-xs font-bold text-hydro">{order.bottles_remaining} Left</p>
                      <p className="text-[10px] text-gray-400">{order.bottles_delivered} / {order.deal_bottles} Sent</p>
                    </td>
                    <td className="py-4">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
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
                    </td>
                    <td className="py-4 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="px-3.5 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition inline-block"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-xs text-gray-400">
            No orders found matching tab criteria.
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminOrdersPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <Suspense fallback={<div className="text-center py-10">Loading orders manager...</div>}>
        <OrdersTabContent />
      </Suspense>
    </div>
  )
}