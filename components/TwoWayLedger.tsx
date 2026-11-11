'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Truck, CheckCircle2, UserCheck } from 'lucide-react'

export default function TwoWayLedger({
  order,
  adminEntries,
  customerEntries,
  userRole,
}: {
  order: any
  adminEntries: any[]
  customerEntries: any[]
  userRole: 'admin' | 'customer'
}) {
  const supabase = createClient()
  const [bottlesCount, setBottlesCount] = useState<number>(1)
  const [notes, setNotes] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  // Allow entry logging for both 'accepted' AND 'completed' orders
  const canAddEntry = order.status === 'accepted' || order.status === 'completed'

  const handleAdminAddEntry = async (e: React.FormEvent) => {
    e.preventDefault()
    if (bottlesCount <= 0) return
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      alert('You must be logged in to add an entry.')
      setLoading(false)
      return
    }

    // Matching exact database schema: 'note' & 'created_by'
    const { error } = await supabase.from('delivery_entries').insert({
      order_id: order.id,
      bottles: bottlesCount,
      note: notes || null,
      created_by: user.id,
    })

    if (!error) {
      window.location.reload()
    } else {
      alert(error.message)
    }
    setLoading(false)
  }

  const handleCustomerAddEntry = async (e: React.FormEvent) => {
    e.preventDefault()
    if (bottlesCount <= 0) return
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      alert('You must be logged in to add an entry.')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('customer_entries').insert({
      order_id: order.id,
      bottles: bottlesCount,
      note: notes || null,
      created_by: user.id,
    })

    if (!error) {
      window.location.reload()
    } else {
      alert(error.message)
    }
    setLoading(false)
  }

  const totalAdminDelivered = adminEntries.reduce(
    (sum, item) => sum + (item.bottles || 0),
    0
  )
  const totalCustomerReceived = customerEntries.reduce(
    (sum, item) => sum + (item.bottles || 0),
    0
  )

  return (
    <div className="space-y-6">
      {/* Entry Addition Form */}
      {canAddEntry && (
        <div className="bg-gradient-to-br from-emerald-50/50 to-sky-50/50 rounded-2xl p-5 border border-emerald-100/60 shadow-sm">
          <h3 className="font-bold text-sm text-gray-800 mb-3 flex items-center gap-2">
            <Plus className="w-4 h-4 text-hydro" />
            {userRole === 'admin' ? 'Log Bottle Delivery (Admin Dispatch)' : 'Log Received Bottles (Customer Entry)'}
          </h3>

          <form
            onSubmit={userRole === 'admin' ? handleAdminAddEntry : handleCustomerAddEntry}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
          >
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-200">
              <label className="text-xs font-bold text-gray-500 whitespace-nowrap">Bottles Count:</label>
              <input
                type="number"
                min="1"
                max="50"
                value={bottlesCount}
                onChange={(e) => setBottlesCount(parseInt(e.target.value) || 1)}
                className="w-16 text-center font-extrabold text-sm text-gray-800 outline-none"
                required
              />
            </div>

            <input
              type="text"
              placeholder="Optional Notes (e.g. Received 5 refill bottles)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="flex-1 px-4 py-2 bg-white text-xs rounded-xl border border-gray-200 outline-none focus:border-hydro transition"
            />

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-gradient-to-r from-hydro to-drops text-white font-bold text-xs rounded-xl shadow hover:opacity-90 transition flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              {loading ? 'Saving...' : 'Add Ledger Entry'}
            </button>
          </form>
        </div>
      )}

      {/* Side-by-Side Ledger Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Admin Delivery Log Column */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-hydro" />
              <h4 className="font-bold text-sm text-gray-800">Admin Dispatch Log</h4>
            </div>
            <span className="text-xs font-extrabold px-2.5 py-1 bg-emerald-50 text-hydro rounded-full">
              Total Sent: {totalAdminDelivered}
            </span>
          </div>

          {adminEntries.length > 0 ? (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {adminEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex justify-between items-center p-3 bg-slate-50 rounded-xl text-xs border border-gray-100"
                >
                  <div>
                    <span className="font-bold text-gray-800">Entry #{entry.entry_no}</span>
                    <p className="text-gray-400 text-[10px]">
                      {new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                      {new Date(entry.entry_date || entry.created_at).toLocaleDateString()}
                    </p>
                    {(entry.note || entry.notes) && (
                      <p className="text-gray-500 text-[11px] mt-0.5">{entry.note || entry.notes}</p>
                    )}
                  </div>
                  <span className="font-extrabold text-sm text-hydro bg-emerald-100/60 px-2.5 py-1 rounded-lg">
                    +{entry.bottles} Bottles
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 text-center py-6">No admin dispatch entries logged yet.</p>
          )}
        </div>

        {/* Customer Receipt Log Column */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-drops" />
              <h4 className="font-bold text-sm text-gray-800">Customer Personal Log</h4>
            </div>
            <span className="text-xs font-extrabold px-2.5 py-1 bg-sky-50 text-drops rounded-full">
              Total Logged: {totalCustomerReceived}
            </span>
          </div>

          {customerEntries.length > 0 ? (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {customerEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex justify-between items-center p-3 bg-slate-50 rounded-xl text-xs border border-gray-100"
                >
                  <div>
                    <span className="font-bold text-gray-800">Log #{entry.entry_no}</span>
                    <p className="text-gray-400 text-[10px]">
                      {new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                      {new Date(entry.entry_date || entry.created_at).toLocaleDateString()}
                    </p>
                    {(entry.note || entry.notes) && (
                      <p className="text-gray-500 text-[11px] mt-0.5">{entry.note || entry.notes}</p>
                    )}
                  </div>
                  <span className="font-extrabold text-sm text-drops bg-sky-100/60 px-2.5 py-1 rounded-lg">
                    +{entry.bottles} Received
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 text-center py-6">No personal entries added by customer yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}