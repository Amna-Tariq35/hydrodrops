'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import TwoWayLedger from '@/components/TwoWayLedger'
import { createClient } from '@/lib/supabase/client'
import { PlusCircle, ShoppingBag, Droplet, ArrowRight, History } from 'lucide-react'

export default function CustomerDashboardPage() {
  const supabase = createClient()
  const [profile, setProfile] = useState<any>(null)
  const [allOrders, setAllOrders] = useState<any[]>([])
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [adminEntries, setAdminEntries] = useState<any[]>([])
  const [customerEntries, setCustomerEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [greeting, setGreeting] = useState('Welcome back')

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good Morning')
    else if (hour < 18) setGreeting('Good Afternoon')
    else setGreeting('Good Evening')

    const fetchDashboardData = async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        setProfile(prof || { id: user.id, email: user.email, role: 'customer' })

        // Fetch ALL orders placed by this customer (Recent first)
        const { data: orders } = await supabase
          .from('orders')
          .select('*, deals(name)')
          .eq('customer_id', user.id)
          .order('created_at', { ascending: false })

        if (orders && orders.length > 0) {
          setAllOrders(orders)
          // Default selection: Most recent active or accepted order, or latest order
          const active = orders.find(o => o.status === 'accepted') || orders[0]
          setSelectedOrder(active)

          await fetchEntriesForOrder(active.id)
        }
      }
      setLoading(false)
    }

    fetchDashboardData()
  }, [])

  const fetchEntriesForOrder = async (orderId: string) => {
    const { data: adminLogs } = await supabase
      .from('delivery_entries')
      .select('*')
      .eq('order_id', orderId)
      .order('entry_no', { ascending: true })

    const { data: customerLogs } = await supabase
      .from('customer_entries')
      .select('*')
      .eq('order_id', orderId)
      .order('entry_no', { ascending: true })

    setAdminEntries(adminLogs || [])
    setCustomerEntries(customerLogs || [])
  }

  const handleSelectOrder = async (order: any) => {
    setSelectedOrder(order)
    await fetchEntriesForOrder(order.id)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Banner */}
        <div className="bg-gradient-to-r from-hydro to-drops rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-hydro-light">
              Customer Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">
              {greeting}, {profile?.full_name || 'Valued Customer'}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-100 mt-1">
              Track your active water coupon balance and view complete order history
            </p>
          </div>

          <Link
            href="/orders/new"
            className="px-5 py-3 bg-white text-hydro font-bold rounded-2xl text-xs sm:text-sm shadow-md hover:bg-slate-100 transition flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" /> Order New Deal
          </Link>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl p-12 text-center text-xs text-gray-400 border border-gray-100 shadow-sm">
            Loading your packages & delivery ledger...
          </div>
        ) : selectedOrder ? (
          <div className="space-y-8">
            {/* Active Selected Order Details */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold bg-hydro-light text-hydro px-2.5 py-0.5 rounded-full uppercase">
                      Selected Package
                    </span>
                    <span className="text-xs font-bold text-gray-500">#{selectedOrder.order_no}</span>
                  </div>
                  <h2 className="text-xl font-extrabold text-gray-900">
                    {selectedOrder.deals?.name || 'Water Coupon Deal'}
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${
                      selectedOrder.status === 'accepted'
                        ? 'bg-green-100 text-green-700'
                        : selectedOrder.status === 'completed'
                        ? 'bg-blue-100 text-blue-700'
                        : selectedOrder.status === 'pending'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    Status: {selectedOrder.status}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-between text-xs font-bold text-gray-700 mb-2">
                  <span>Bottles Delivered</span>
                  <span>
                    {selectedOrder.bottles_delivered || 0} / {selectedOrder.deal_bottles} Bottles
                  </span>
                </div>
                <div className="w-full bg-gray-100 h-3.5 rounded-full overflow-hidden p-0.5 border border-gray-100">
                  <div
                    className="bg-gradient-to-r from-hydro to-drops h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        ((selectedOrder.bottles_delivered || 0) / selectedOrder.deal_bottles) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Two Way Ledger Component for Selected Order */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Droplet className="w-5 h-5 text-hydro" /> Delivery Verification Ledger (#{selectedOrder.order_no})
              </h2>
              <TwoWayLedger
                order={selectedOrder}
                adminEntries={adminEntries}
                customerEntries={customerEntries}
                userRole="customer"
              />
            </div>

            {/* All Orders History Section */}
            {allOrders.length > 0 && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <History className="w-5 h-5 text-drops" /> My Orders History ({allOrders.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allOrders.map((ord) => (
                    <div
                      key={ord.id}
                      onClick={() => handleSelectOrder(ord)}
                      className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                        selectedOrder.id === ord.id
                          ? 'border-hydro bg-emerald-50/40 shadow-sm ring-2 ring-hydro/20'
                          : 'border-gray-100 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="text-xs font-bold text-gray-800">#{ord.order_no}</span>
                          <h4 className="text-sm font-extrabold text-gray-900">{ord.deals?.name}</h4>
                        </div>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            ord.status === 'accepted'
                              ? 'bg-green-100 text-green-700'
                              : ord.status === 'completed'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-2 flex justify-between items-center pt-2 border-t border-gray-100">
                        <span>
                          {ord.bottles_delivered || 0}/{ord.deal_bottles} Bottles
                        </span>
                        <Link
                          href={`/orders/${ord.id}`}
                          className="text-hydro font-bold hover:underline flex items-center gap-1 text-[11px]"
                        >
                          View Full Details <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-sm max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-hydro-light text-hydro rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-extrabold text-gray-900">No Orders Found</h2>
            <p className="text-xs text-gray-500 mt-2 mb-6 max-w-md mx-auto">
              You haven't placed any water coupon package orders yet.
            </p>
            <Link
              href="/orders/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-hydro to-drops text-white font-bold text-xs rounded-xl shadow-md hover:opacity-90 transition"
            >
              <PlusCircle className="w-4 h-4" /> Browse Coupon Deals
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}