'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/client'
import { Droplet, User, Phone, MapPin, CheckCircle, ArrowLeft } from 'lucide-react'

function OrderFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialDealId = searchParams.get('deal')
  const supabase = createClient()

  const [deals, setDeals] = useState<any[]>([])
  const [selectedDealId, setSelectedDealId] = useState<number | null>(
    initialDealId ? Number(initialDealId) : null
  )
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [customerCity, setCustomerCity] = useState('Local City')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const initData = async () => {
      // 1. Fetch available deals
      const { data: dealsData } = await supabase
        .from('deals')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (dealsData) {
        setDeals(dealsData)
        if (!selectedDealId && dealsData.length > 0) {
          setSelectedDealId(dealsData[0].id)
        }
      }

      // 2. Fetch prefilled profile details
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profile) {
          setCustomerName(profile.full_name || '')
          setCustomerPhone(profile.phone || '')
          setCustomerAddress(profile.address || '')
          setCustomerCity(profile.city || 'Local City')
        }
      }
    }

    initData()
  }, [])

  const selectedDeal = deals.find((d) => d.id === selectedDealId)

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDealId || !selectedDeal) {
      setErrorMsg('Please select a deal')
      return
    }

    setLoading(true)
    setErrorMsg('')

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setErrorMsg('User not authenticated')
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('orders')
      .insert({
        deal_id: selectedDeal.id,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_address: customerAddress,
        customer_city: customerCity,
        notes: notes,
      })
      .select()
      .single()

    if (error) {
      setErrorMsg(error.message)
      setLoading(false)
    } else {
      router.push(`/orders/${data.id}`)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-800 mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
          <div className="w-12 h-12 bg-gradient-to-tr from-hydro to-drops rounded-2xl flex items-center justify-center text-white shadow-md">
            <Droplet className="w-6 h-6 fill-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Place Water Coupon Order</h1>
            <p className="text-xs text-gray-500">Confirm deal and delivery location details</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="space-y-6">
          {/* Step 1: Choose Deal */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-3">1. Select Deal Package</label>
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

          {/* Step 2: Customer Delivery Details */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-3">2. Delivery Details</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
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
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-hydro focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Delivery Notes (Optional)</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Gate code, specific timing, etc."
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-hydro focus:outline-none"
              />
            </div>
          </div>

          {/* Step 3: Order Summary */}
          {selectedDeal && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-gray-200 text-sm space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Selected Deal:</span>
                <span className="font-bold text-gray-800">{selectedDeal.name}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Total Refill Bottles:</span>
                <span className="font-bold text-gray-800">{selectedDeal.bottles} Bottles</span>
              </div>
              <div className="flex justify-between text-gray-900 font-extrabold text-base pt-2 border-t border-gray-200">
                <span>Total Package Price:</span>
                <span className="text-hydro">Rs. {selectedDeal.price}</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !selectedDealId}
            className="w-full py-3.5 bg-gradient-to-r from-hydro to-drops text-white font-bold rounded-xl text-sm shadow-md hover:opacity-90 transition"
          >
            {loading ? 'Submitting Order...' : 'Confirm & Place Order'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function NewOrderPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <Suspense fallback={<div className="text-center py-10">Loading order form...</div>}>
        <OrderFormContent />
      </Suspense>
    </div>
  )
}