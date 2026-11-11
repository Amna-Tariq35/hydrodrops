'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Phone, MapPin, Mail, Calendar, ShoppingBag } from 'lucide-react'

export default function AdminCustomerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()

  const id = params?.id as string

  const [customer, setCustomer] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    const fetchCustomerDetails = async () => {
      setLoading(true)

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()

      if (profile) {
        setCustomer(profile)

        const { data: customerOrders } = await supabase
          .from('orders')
          .select('*, deals(name)')
          .eq('customer_id', id)
          .order('created_at', { ascending: false })

        setOrders(customerOrders || [])
      }

      setLoading(false)
    }

    fetchCustomerDetails()
  }, [id, supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="text-center py-20 text-xs text-gray-400">Loading customer record...</div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="text-center py-20 text-xs text-gray-400">Customer profile not found.</div>
      </div>
    )
  }

  const totalBottlesDelivered = orders.reduce((sum, o) => sum + (o.bottles_delivered || 0), 0)

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-800 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Customers Directory
        </button>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-tr from-hydro to-drops rounded-2xl flex items-center justify-center text-white font-extrabold text-xl shadow-md">
                {customer.full_name?.charAt(0) || 'C'}
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-gray-900">{customer.full_name || 'Customer'}</h1>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <Mail className="w-3.5 h-3.5" /> {customer.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-right">
              <div>
                <span className="text-xs text-gray-400 uppercase font-semibold block">Total Orders</span>
                <span className="text-xl font-bold text-gray-800">{orders.length}</span>
              </div>
              <div className="pl-4 border-l border-gray-200">
                <span className="text-xs text-gray-400 uppercase font-semibold block">Total Delivered</span>
                <span className="text-xl font-bold text-hydro">{totalBottlesDelivered} Bottles</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <span>{customer.phone || 'No phone number'}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>{customer.address || 'No address'}, {customer.city}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>Joined {new Date(customer.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Customer Orders Table */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-hydro" /> Customer Order History
          </h2>

          {orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase">
                    <th className="pb-3 font-semibold">Order #</th>
                    <th className="pb-3 font-semibold">Deal</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Progress</th>
                    <th className="pb-3 font-semibold">Date</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50 transition">
                      <td className="py-4 font-bold text-gray-900">{order.order_no}</td>
                      <td className="py-4 font-medium text-gray-700">{order.deals?.name || 'Coupon Deal'}</td>
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
                      <td className="py-4 text-xs">
                        <span className="font-bold text-hydro">{order.bottles_remaining} Left</span>
                        <span className="text-gray-400 ml-1">({order.bottles_delivered}/{order.deal_bottles})</span>
                      </td>
                      <td className="py-4 text-xs text-gray-400">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="px-3.5 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition inline-block"
                        >
                          Manage Order
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-xs text-gray-400">
              This customer has not placed any orders yet.
            </div>
          )}
        </div>
      </main>
    </div>
  )
}