import { Suspense } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/server'
import { Droplet, CheckCircle, ArrowRight, Sparkles } from 'lucide-react'

// Async Component for fetching deals inside Suspense
async function DealsList() {
  const supabase = await createClient()
  const { data: deals } = await supabase
    .from('deals')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (!deals || deals.length === 0) {
    return (
      <div className="col-span-2 text-center text-gray-400 py-10">
        No deals available at the moment.
      </div>
    )
  }

  return (
    <>
      {deals.map((deal) => (
        <div
          key={deal.id}
          className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl hover:shadow-2xl transition flex flex-col justify-between relative overflow-hidden group"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-hydro to-drops" />
          <div>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-800">{deal.name}</h3>
              <span className="px-3 py-1 bg-hydro-light text-hydro text-xs font-bold rounded-full">
                Coupon Deal
              </span>
            </div>

            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-extrabold text-gray-900">Rs. {deal.price}</span>
              <span className="text-gray-500 text-sm">/ {deal.bottles} Bottles</span>
            </div>

            <ul className="space-y-3 mb-8 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-hydro" /> {deal.bottles} Refill Bottles Included
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-hydro" /> Rs. {(deal.price / deal.bottles).toFixed(0)} / bottle effective rate
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-hydro" /> Two-Way Digital Ledger Tracking
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-hydro" /> Instant Delivery Notifications
              </li>
            </ul>
          </div>

          <Link
            href={`/orders/new?deal=${deal.id}`}
            className="w-full py-3.5 bg-gradient-to-r from-hydro to-drops text-white font-bold rounded-xl text-center shadow-md hover:opacity-90 transition block"
          >
            Buy Coupon Package
          </Link>
        </div>
      ))}
    </>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-hydro-light/40 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-hydro-light text-hydro font-semibold text-xs mb-6 shadow-sm">
            <Sparkles className="w-4 h-4" /> Fresh & Pure Hydration Delivered
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight max-w-4xl mx-auto">
            Clean Mineral Water Deals for Your{' '}
            <span className="bg-gradient-to-r from-hydro to-drops bg-clip-text text-transparent">
              Home & Business
            </span>
          </h1>

          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
            Hydrodrops delivers premium mineral water with complete digital bottle tracking.
            Order pre-paid bottle coupon deals and track every delivery transparently.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-3.5 text-base font-bold text-white bg-gradient-to-r from-hydro to-drops rounded-2xl shadow-lg hover:shadow-xl hover:opacity-90 transition flex items-center justify-center gap-2"
            >
              Order Water Now <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#deals"
              className="w-full sm:w-auto px-8 py-3.5 text-base font-bold text-gray-700 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition shadow-sm"
            >
              View Special Deals
            </a>
          </div>
        </div>
      </section>

      {/* Dynamic Deals Cards Section */}
      <section id="deals" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900">Featured Water Coupon Deals</h2>
          <p className="text-gray-500 mt-2">Choose a coupon package that fits your monthly consumption</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Suspense fallback={<div className="col-span-2 text-center text-gray-400 py-10">Loading available deals...</div>}>
            <DealsList />
          </Suspense>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900">How Hydrodrops Works</h2>
            <p className="text-gray-500 mt-2">Transparent, simple water delivery management</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-slate-50 rounded-2xl text-center">
              <div className="w-12 h-12 bg-hydro-light text-hydro rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                1
              </div>
              <h3 className="font-bold text-lg text-gray-800 mb-2">Choose a Deal</h3>
              <p className="text-sm text-gray-600">Select either 25 or 30 bottle coupon packages with upfront pricing.</p>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl text-center">
              <div className="w-12 h-12 bg-drops-light text-drops rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                2
              </div>
              <h3 className="font-bold text-lg text-gray-800 mb-2">Doorstep Delivery</h3>
              <p className="text-sm text-gray-600">Admin accepts your order and delivers bottles on your request schedule.</p>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl text-center">
              <div className="w-12 h-12 bg-hydro-light text-hydro rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                3
              </div>
              <h3 className="font-bold text-lg text-gray-800 mb-2">Two-Way Tracking</h3>
              <p className="text-sm text-gray-600">Admin logs bottles sent while you log bottles received on your dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Droplet className="w-5 h-5 text-hydro fill-hydro" />
            <span className="font-bold text-white text-base">Hydrodrops</span>
          </div>
          <p>© 2026 Hydrodrops Water Services. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}