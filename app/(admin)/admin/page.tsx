'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/client'
import { 
  Shield, 
  Clock, 
  Truck, 
  Droplet, 
  PlusCircle, 
  Tag, 
  UserPlus, 
  ArrowRight,
  TrendingUp
} from 'lucide-react'

export default function AdminDashboardPage() {
  const router = useRouter()
  const supabase = createClient()

  const [profile, setProfile] = useState<any>(null)
  const [pendingOrders, setPendingOrders] = useState<any[]>([])
  const [activeOrders, setActiveOrders] = useState<any[]>([])
  const [completedOrders, setCompletedOrders] = useState<any[]>([])
  const [totalBottlesPending, setTotalBottlesPending] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const loadAdminData = async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      // Verify Admin Role
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (prof?.role !== 'admin') {
        router.push('/dashboard')
        return
      }

      setProfile(prof)

      // Fetch Stats Data
      const { data: allOrders } = await supabase
        .from('orders')
        .select('*, deals(name)')
        .order('created_at', { ascending: false })

      if (allOrders) {
        const pending = allOrders.filter((o) => o.status === 'pending')
        const active = allOrders.filter((o) => o.status === 'accepted')
        const completed = allOrders.filter((o) => o.status === 'completed')

        const totalPendingBottles = active.reduce(
          (sum, order) => sum + (order.bottles_remaining || 0),
          0
        )

        setPendingOrders(pending)
        setActiveOrders(active)
        setCompletedOrders(completed)
        setTotalBottlesPending(totalPendingBottles)
      }

      setLoading(false)
    }

    loadAdminData()
  }, [router, supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="text-center py-20 text-xs text-gray-400">Loading admin control center...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-6 h-6 text-hydro" />
              <h1 className="text-2xl font-extrabold text-gray-900">Admin Control Center</h1>
            </div>
            <p className="text-xs text-gray-500">Manage orders, walk-in entries, deals, and team access</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/orders/new"
              className="px-4 py-2.5 bg-gradient-to-r from-hydro to-drops text-white text-xs font-bold rounded-xl shadow hover:opacity-90 transition flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" /> + Walk-In Order
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-semibold text-gray-500 uppercase">Pending Requests</span>
              <span className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </span>
            </div>
            <h3 className="text-3xl font-extrabold text-gray-900">{pendingOrders.length}</h3>
            <p className="text-xs text-amber-600 mt-1 font-medium">Requires approval</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-semibold text-gray-500 uppercase">Active Deliveries</span>
              <span className="w-10 h-10 bg-green-50 text-hydro rounded-xl flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </span>
            </div>
            <h3 className="text-3xl font-extrabold text-gray-900">{activeOrders.length}</h3>
            <p className="text-xs text-gray-400 mt-1">Ongoing coupon cycles</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-semibold text-gray-500 uppercase">Bottles Due</span>
              <span className="w-10 h-10 bg-blue-50 text-drops rounded-xl flex items-center justify-center">
                <Droplet className="w-5 h-5 fill-drops" />
              </span>
            </div>
            <h3 className="text-3xl font-extrabold text-drops">{totalBottlesPending}</h3>
            <p className="text-xs text-gray-400 mt-1">Pending distribution</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-semibold text-gray-500 uppercase">Completed Orders</span>
              <span className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </span>
            </div>
            <h3 className="text-3xl font-extrabold text-gray-900">{completedOrders.length}</h3>
            <p className="text-xs text-gray-400 mt-1 font-medium">Fully fulfilled</p>
          </div>
        </div>

        {/* Quick Management Navigation Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <Link
            href="/admin/orders"
            className="p-5 bg-white rounded-2xl border border-gray-100 hover:border-hydro hover:shadow-md transition group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-hydro-light text-hydro rounded-xl group-hover:bg-hydro group-hover:text-white transition">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-800">All Orders Hub</h3>
            </div>
            <p className="text-xs text-gray-500">View, accept, filter and add bottle delivery logs for customers.</p>
          </Link>

          <Link
            href="/admin/deals"
            className="p-5 bg-white rounded-2xl border border-gray-100 hover:border-drops hover:shadow-md transition group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-drops-light text-drops rounded-xl group-hover:bg-drops group-hover:text-white transition">
                <Tag className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-800">Deals & Pricing</h3>
            </div>
            <p className="text-xs text-gray-500">Add or edit water coupon deals, bottle quantities, and rates.</p>
          </Link>

          <Link
            href="/admin/admins"
            className="p-5 bg-white rounded-2xl border border-gray-100 hover:border-purple-400 hover:shadow-md transition group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition">
                <UserPlus className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-800">Manage Admins</h3>
            </div>
            <p className="text-xs text-gray-500">Invite new team members and assign administrator privileges.</p>
          </Link>
        </div>

        {/* Pending Orders Table / Action List */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" /> Action Needed: New Pending Orders
            </h2>
            <Link href="/admin/orders?tab=pending" className="text-xs font-semibold text-hydro hover:underline flex items-center gap-1">
              View All Pending <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {pendingOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase">
                    <th className="pb-3 font-semibold">Order #</th>
                    <th className="pb-3 font-semibold">Customer</th>
                    <th className="pb-3 font-semibold">Phone</th>
                    <th className="pb-3 font-semibold">Deal</th>
                    <th className="pb-3 font-semibold">Date</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pendingOrders.slice(0, 5).map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 font-bold text-gray-900">{order.order_no}</td>
                      <td className="py-3 text-gray-700">{order.customer_name}</td>
                      <td className="py-3 text-gray-500">{order.customer_phone}</td>
                      <td className="py-3 text-hydro font-medium">{order.deals?.name || 'Coupon Deal'}</td>
                      <td className="py-3 text-gray-400 text-xs">{new Date(order.created_at).toLocaleDateString()}</td>
                      <td className="py-3 text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="px-3 py-1.5 bg-hydro text-white text-xs font-bold rounded-lg hover:bg-hydro-dark transition inline-block"
                        >
                          Review & Accept
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-gray-400">
              No pending order approvals at this moment.
            </div>
          )}
        </div>
      </main>
    </div>
  )
}