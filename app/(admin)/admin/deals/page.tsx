'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/client'
import { Tag, Plus, Edit2, Check, X, ToggleLeft, ToggleRight } from 'lucide-react'

export default function AdminDealsPage() {
  const supabase = createClient()
  const [deals, setDeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Form states for creating/editing deals
  const [editingId, setEditingId] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [bottles, setBottles] = useState<number>(25)
  const [price, setPrice] = useState<number>(3000)
  const [sortOrder, setSortOrder] = useState<number>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchDeals = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('deals')
      .select('*')
      .order('sort_order', { ascending: true })

    if (data) setDeals(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchDeals()
  }, [])

  const resetForm = () => {
    setEditingId(null)
    setName('')
    setBottles(25)
    setPrice(3000)
    setSortOrder(1)
  }

  const handleStartEdit = (deal: any) => {
    setEditingId(deal.id)
    setName(deal.name)
    setBottles(deal.bottles)
    setPrice(deal.price)
    setSortOrder(deal.sort_order || 1)
  }

  const handleSaveDeal = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (editingId) {
      // Update existing deal
      await supabase
        .from('deals')
        .update({
          name,
          bottles,
          price,
          sort_order: sortOrder,
        })
        .eq('id', editingId)
    } else {
      // Create new deal
      await supabase.from('deals').insert({
        name,
        bottles,
        price,
        sort_order: sortOrder,
        is_active: true,
      })
    }

    resetForm()
    await fetchDeals()
    setIsSubmitting(false)
  }

  const toggleDealStatus = async (dealId: number, currentStatus: boolean) => {
    await supabase
      .from('deals')
      .update({ is_active: !currentStatus })
      .eq('id', dealId)
    fetchDeals()
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              <Tag className="w-6 h-6 text-hydro" /> Deals & Pricing Management
            </h1>
            <p className="text-xs text-gray-500">Add, edit, or pause water coupon deals shown on landing page</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Side: Add / Edit Deal */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-fit">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              {editingId ? 'Edit Deal Package' : 'Create New Coupon Deal'}
            </h2>

            <form onSubmit={handleSaveDeal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Deal Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Standard Coupon Deal"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-hydro"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Bottles Count</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={bottles}
                    onChange={(e) => setBottles(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-hydro"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Price (Rs.)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-hydro"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Display Sort Order</label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-hydro"
                />
              </div>

              <div className="flex gap-2 pt-2">
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="w-1/3 py-2.5 bg-gray-100 text-gray-600 font-bold text-xs rounded-xl hover:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-gradient-to-r from-hydro to-drops text-white font-bold text-xs rounded-xl shadow hover:opacity-90 transition flex items-center justify-center gap-1"
                >
                  {editingId ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {editingId ? 'Save Changes' : 'Publish Deal'}
                </button>
              </div>
            </form>
          </div>

          {/* List Side: Active & Inactive Deals */}
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="text-center py-12 text-xs text-gray-400">Loading deal packages...</div>
            ) : deals.length > 0 ? (
              deals.map((deal) => (
                <div
                  key={deal.id}
                  className={`bg-white p-5 rounded-2xl border transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                    deal.is_active ? 'border-gray-100 shadow-sm' : 'border-gray-200 opacity-60 bg-gray-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900">{deal.name}</h3>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          deal.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {deal.is_active ? 'Active' : 'Paused'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      <strong className="text-gray-800">{deal.bottles} Bottles</strong> for{' '}
                      <strong className="text-hydro">Rs. {deal.price}</strong> (Rs.{' '}
                      {(deal.price / deal.bottles).toFixed(0)}/bottle)
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => toggleDealStatus(deal.id, deal.is_active)}
                      className="p-2 text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition"
                      title={deal.is_active ? 'Pause Deal' : 'Activate Deal'}
                    >
                      {deal.is_active ? (
                        <ToggleRight className="w-6 h-6 text-hydro" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-gray-400" />
                      )}
                    </button>

                    <button
                      onClick={() => handleStartEdit(deal)}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-xs text-gray-400 bg-white rounded-3xl border">
                No deals created yet. Use the form on the left to add one.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}