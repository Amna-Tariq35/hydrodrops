'use client'

import Link from 'next/link'
import { CheckCircle, Droplet } from 'lucide-react'

interface DealCardProps {
  deal: {
    id: number
    name: string
    bottles: number
    price: number
    is_active?: boolean
  }
  onSelect?: (dealId: number) => void
  isSelected?: boolean
}

export default function DealCard({ deal, onSelect, isSelected }: DealCardProps) {
  const perBottleRate = (deal.price / deal.bottles).toFixed(0)

  return (
    <div
      onClick={() => onSelect && onSelect(deal.id)}
      className={`bg-white rounded-3xl p-5 sm:p-6 border transition flex flex-col justify-between relative overflow-hidden shadow-lg hover:shadow-xl ${
        onSelect ? 'cursor-pointer' : ''
      } ${
        isSelected
          ? 'border-hydro bg-hydro-light/20 ring-2 ring-hydro'
          : 'border-gray-100 hover:border-hydro/50'
      }`}
    >
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-hydro to-drops" />

      <div>
        <div className="flex flex-wrap justify-between items-start gap-2 mb-4">
          <h3 className="text-xl font-bold text-gray-800">{deal.name}</h3>
          <span className="px-3 py-1 bg-hydro-light text-hydro text-xs font-bold rounded-full flex items-center gap-1">
            <Droplet className="w-3.5 h-3.5 fill-hydro" /> Coupon Deal
          </span>
        </div>

        <div className="flex flex-wrap items-baseline gap-1 mb-6">
          <span className="text-3xl sm:text-4xl font-extrabold text-gray-900">Rs. {deal.price}</span>
          <span className="text-gray-500 text-sm">/ {deal.bottles} Bottles</span>
        </div>

        <ul className="space-y-3 mb-8 text-sm text-gray-600">
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-hydro" /> {deal.bottles} Refill Bottles Included
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-hydro" /> Rs. {perBottleRate} / bottle effective rate
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-hydro" /> Digital Bottle Tracking Ledger
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-hydro" /> Doorstep Delivery & Realtime Alerts
          </li>
        </ul>
      </div>

      {onSelect ? (
        <button
          type="button"
          className={`w-full py-3.5 rounded-xl font-bold text-center text-sm transition ${
            isSelected
              ? 'bg-hydro text-white shadow-md'
              : 'bg-slate-100 text-gray-700 hover:bg-hydro hover:text-white'
          }`}
        >
          {isSelected ? 'Selected' : 'Select Package'}
        </button>
      ) : (
        <Link
          href={`/orders/new?deal=${deal.id}`}
          className="w-full py-3.5 bg-gradient-to-r from-hydro to-drops text-white font-bold rounded-xl text-center shadow-md hover:opacity-90 transition block text-sm"
        >
          Buy Coupon Package
        </Link>
      )}
    </div>
  )
}