'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/client'
import { Users, Search, ArrowRight } from 'lucide-react'

export default function AdminCustomersPage() {
  const supabase = createClient()
  const [customers, setCustomers] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('profiles')
        .select('*, orders(id, status, bottles_delivered)')
        .eq('role', 'customer')
        .order('created_at', { ascending: false })

      if (data) setCustomers(data)
      setLoading(false)
    }

    fetchCustomers()
  }, [])

  const filteredCustomers = customers.filter(
    (c) =>
      (c.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone || '').includes(searchTerm) ||
      (c.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-hydro" /> Customer Directory
            </h1>
            <p className="text-xs text-gray-500">View registered customers and their bottle order activity</p>
          </div>
        </div>

        {/* Search Input */}
        <div className="mb-6 relative max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by Customer Name, Phone or Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-hydro"
          />
        </div>

        <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100">
          {loading ? (
            <div className="text-center py-12 text-xs text-gray-400">Loading customers directory...</div>
          ) : filteredCustomers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase">
                    <th className="pb-3 font-semibold">Customer</th>
                    <th className="pb-3 font-semibold">Phone</th>
                    <th className="pb-3 font-semibold">City / Address</th>
                    <th className="pb-3 font-semibold">Total Orders</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredCustomers.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition">
                      <td className="py-4">
                        <p className="font-bold text-gray-900">{c.full_name || 'Customer'}</p>
                        <p className="text-xs text-gray-400">{c.email}</p>
                      </td>
                      <td className="py-4 text-gray-700 font-medium">{c.phone || 'N/A'}</td>
                      <td className="py-4 text-gray-500 text-xs">
                        {c.address ? `${c.address}, ${c.city}` : 'No address saved'}
                      </td>
                      <td className="py-4 font-bold text-hydro">
                        {c.orders?.length || 0} Orders
                      </td>
                      <td className="py-4 text-right">
                        <Link
                          href={`/admin/customers/${c.id}`}
                          className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition inline-flex items-center gap-1"
                        >
                          View History <ArrowRight className="w-3.5 h-3.5 text-hydro" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-xs text-gray-400">
              No customers found matching search criteria.
            </div>
          )}
        </div>
      </main>
    </div>
  )
}