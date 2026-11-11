'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, User, Phone, MapPin, CheckCircle, Tag, Store } from 'lucide-react'

export default function WalkInOrderPage() {
  const router = useRouter()
  const supabase = createClient()

  const [deals, setDeals] = useState<any[]>([])
  const [selectedDealId, setSelectedDealId] = useState<number | null>(null)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [customerCity, setCustomerCity] = useState('Local City')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const fetchDeals = async () => {
      const { data } = await supabase
        .from('deals')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (data && data.length > 0) {
        setDeals(data)
        setSelectedDealId(data[0].id)
      }
    }
    fetchDeals()
  }, [])

  const selectedDeal = deals.find((d) => d.id === selectedDealId)

  const handleCreateWalkInOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDealId || !selectedDeal) {
      setErrorMsg('Please select a deal')
      return
    }

    setLoading(true)
    setErrorMsg('')

    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from('orders')
      .insert({
        deal_id: selectedDeal.id,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_address: customerAddress,
        customer_city: customerCity,
        notes: notes,
        source: 'walk_in',
        status: 'accepted', // Auto-accepted since Admin is logging it directly
        created_by: user?.id,
        accepted_by: user?.id,
        accepted_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      setErrorMsg(error.message)
      setLoading(false)
    } else {
      router.push(`/admin/orders/${data.id}`)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-8 w-full">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-800 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </button>

        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
            <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center font-bold">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Manual Walk-In Order Entry</h1>
              <p className="text-xs text-gray-500">Record off-website customer coupon orders</p>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-6 p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleCreateWalkInOrder} className="space-y-6">
            {/* Step 1: Select Deal */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-3">1. Select Package Deal</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {deals.map((deal) => {
                  const isSelected = selectedDealId === deal.id
                  return (
                    <div
                      key={deal.id}
                      onClick={() => setSelectedDealId(deal.id)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between ${
                        isSelected
                          ? 'border-hydro bg-hydro-light/30 shadow-md'
                          : 'border-gray-100 bg-gray-50 hover:bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-sm text-gray-800">{deal.name}</h3>
                        {isSelected && <CheckCircle className="w-4 h-4 text-hydro" />}
                      </div>
                      <div className="mt-2">
                        <span className="text-2xl font-black text-gray-900">Rs. {deal.price}</span>
                        <span className="text-xs text-gray-500 ml-1">/ {deal.bottles} Bottles</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Step 2: Customer Contact Info */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-3">2. Customer Information</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Customer Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Usman Tariq"
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-hydro focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="0300 0000000"
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-hydro focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Delivery Address</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="House / Shop address"
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-hydro focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Admin Order Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Payment receipt number or delivery preferences..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-hydro focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !selectedDealId}
              className="w-full py-3.5 bg-gradient-to-r from-hydro to-drops text-white font-bold rounded-xl text-sm shadow-md hover:opacity-90 transition"
            >
              {loading ? 'Logging Walk-In Order...' : 'Create & Accept Walk-In Order'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}