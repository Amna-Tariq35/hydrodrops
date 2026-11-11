'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/client'
import { User, Phone, MapPin, Mail, Save, CheckCircle2 } from 'lucide-react'

export default function ProfilePage() {
  const supabase = createClient()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('Local City')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        setEmail(user.email || '')
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profile) {
          setFullName(profile.full_name || '')
          setPhone(profile.phone || '')
          setAddress(profile.address || '')
          setCity(profile.city || 'Local City')
        }
      }
      setLoading(false)
    }

    fetchProfile()
  }, [])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSuccessMsg('')

    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone: phone,
          address: address,
          city: city,
          profile_completed: true,
        })
        .eq('id', user.id)

      if (!error) {
        setSuccessMsg('Profile updated successfully!')
      }
    }
    setSaving(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-8 w-full">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
            <div className="w-12 h-12 bg-hydro-light text-hydro rounded-2xl flex items-center justify-center font-bold">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Account Profile</h1>
              <p className="text-xs text-gray-500">Manage your contact and delivery address details</p>
            </div>
          </div>

          {successMsg && (
            <div className="mb-6 p-3 bg-green-50 text-green-700 text-xs rounded-xl border border-green-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" /> {successMsg}
            </div>
          )}

          {loading ? (
            <div className="text-center py-10 text-xs text-gray-400">Loading profile...</div>
          ) : (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Email (Account)</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-100 text-gray-500 border border-gray-200 rounded-xl text-sm cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
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
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-hydro focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Delivery Address</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-hydro focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">City</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-hydro focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-gradient-to-r from-hydro to-drops text-white font-bold rounded-xl text-sm shadow hover:opacity-90 transition flex items-center justify-center gap-1.5 mt-4"
              >
                <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}