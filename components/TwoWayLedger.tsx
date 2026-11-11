'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Minus, Truck, CheckCircle2, UserCheck } from 'lucide-react'

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
  const [bottlesCount, setBottlesCount] = useState('1')
  const [notes, setNotes] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [entryError, setEntryError] = useState('')

  // Allow entry logging for both 'accepted' AND 'completed' orders
  const canAddEntry = order.status === 'accepted' || order.status === 'completed'

  const getValidBottlesCount = () => {
    const count = Number(bottlesCount)

    if (!Number.isInteger(count) || count < 1 || count > 50) {
      setEntryError('Enter a whole number between 1 and 50.')
      return null
    }

    setEntryError('')
    return count
  }

  const adjustBottlesCount = (change: number) => {
    const currentCount = Number(bottlesCount)
    const nextCount = Number.isInteger(currentCount) ? currentCount + change : 1

    setBottlesCount(String(Math.min(50, Math.max(1, nextCount))))
    setEntryError('')
  }

  const handleAdminAddEntry = async (e: React.FormEvent) => {
    e.preventDefault()
    const count = getValidBottlesCount()
    if (count === null) return
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
      bottles: count,
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
    const count = getValidBottlesCount()
    if (count === null) return
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      alert('You must be logged in to add an entry.')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('customer_entries').insert({
      order_id: order.id,
      bottles: count,
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
            noValidate
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
          >
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-200">
              <label htmlFor="bottles-count" className="text-xs font-bold text-gray-500 whitespace-nowrap">
                Bottles Count:
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Decrease bottle count"
                  onClick={() => adjustBottlesCount(-1)}
                  disabled={bottlesCount !== '' && Number(bottlesCount) <= 1}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  id="bottles-count"
                  type="number"
                  min="1"
                  max="50"
                  step="1"
                  value={bottlesCount}
                  onChange={(e) => {
                    setBottlesCount(e.target.value)
                    setEntryError('')
                  }}
                  aria-invalid={Boolean(entryError)}
                  aria-describedby={entryError ? 'bottle-count-error' : undefined}
                  className="w-12 text-center font-extrabold text-sm text-gray-800 outline-none"
                  required
                />
                <button
                  type="button"
                  aria-label="Increase bottle count"
                  onClick={() => adjustBottlesCount(1)}
                  disabled={bottlesCount !== '' && Number(bottlesCount) >= 50}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
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
          {entryError && (
            <p id="bottle-count-error" role="alert" className="mt-2 text-xs text-red-600">
              {entryError}
            </p>
          )}
        </div>
      )}

      {/* Side-by-Side Ledger Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Admin Delivery Log Column */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 pb-3 border-b border-gray-100">
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
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-gray-800">Entry #{entry.entry_no}</span>
                    <p className="text-gray-400 text-[10px]">
                      {new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                      {new Date(entry.entry_date || entry.created_at).toLocaleDateString()}
                    </p>
                    {(entry.note || entry.notes) && (
                      <p className="text-gray-500 text-[11px] mt-0.5">{entry.note || entry.notes}</p>
                    )}
                  </div>
                  <span className="shrink-0 font-extrabold text-sm text-hydro bg-emerald-100/60 px-2.5 py-1 rounded-lg">
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
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 pb-3 border-b border-gray-100">
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
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-gray-800">Log #{entry.entry_no}</span>
                    <p className="text-gray-400 text-[10px]">
                      {new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                      {new Date(entry.entry_date || entry.created_at).toLocaleDateString()}
                    </p>
                    {(entry.note || entry.notes) && (
                      <p className="text-gray-500 text-[11px] mt-0.5">{entry.note || entry.notes}</p>
                    )}
                  </div>
                  <span className="shrink-0 font-extrabold text-sm text-drops bg-sky-100/60 px-2.5 py-1 rounded-lg">
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