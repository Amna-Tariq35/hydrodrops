'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/client'
import { Shield, UserPlus, Mail, Trash2, CheckCircle2 } from 'lucide-react'

export default function AdminManagementPage() {
  const supabase = createClient()
  const [admins, setAdmins] = useState<any[]>([])
  const [invites, setInvites] = useState<any[]>([])
  const [emailInput, setEmailInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [msg, setMsg] = useState({ text: '', type: '' })

  const loadAdminData = async () => {
    setLoading(true)

    // Fetch active admins from profiles
    const { data: adminProfiles } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'admin')

    // Fetch pending invites
    const { data: pendingInvites } = await supabase
      .from('admin_invites')
      .select('*')
      .order('created_at', { ascending: false })

    setAdmins(adminProfiles || [])
    setInvites(pendingInvites || [])
    setLoading(false)
  }

  useEffect(() => {
    loadAdminData()
  }, [])

  const handleInviteAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMsg({ text: '', type: '' })

    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('admin_invites').insert({
      email: emailInput.trim().toLowerCase(),
      invited_by: user?.id,
    })

    if (error) {
      setMsg({ text: error.message, type: 'error' })
    } else {
      setMsg({ text: `Admin invite added for ${emailInput}! When they sign up, their account will automatically become an Admin.`, type: 'success' })
      setEmailInput('')
      await loadAdminData()
    }
    setIsSubmitting(false)
  }

  const handleRevokeInvite = async (inviteId: string) => {
    await supabase.from('admin_invites').delete().eq('id', inviteId)
    loadAdminData()
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-600" /> Admin Team & Invitations
          </h1>
          <p className="text-xs text-gray-500">Authorize team members to manage orders and bottle entries</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Invite Form */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-fit">
            <h2 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-hydro" /> Invite New Admin
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Enter an email address. When that user logs in or signs up, their account will be assigned Admin privileges automatically.
            </p>

            {msg.text && (
              <div
                className={`mb-4 p-3 rounded-xl text-xs ${
                  msg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'
                }`}
              >
                {msg.text}
              </div>
            )}

            <form onSubmit={handleInviteAdmin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="colleague@hydrodrops.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-hydro"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-hydro to-drops text-white font-bold text-xs rounded-xl shadow hover:opacity-90 transition flex items-center justify-center gap-1"
              >
                Send Admin Invite
              </button>
            </form>
          </div>

          {/* Admins & Invites Lists */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Admins */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-hydro" /> Active Administrator Accounts ({admins.length})
              </h3>
              <div className="divide-y divide-gray-100">
                {admins.map((admin) => (
                  <div key={admin.id} className="py-3 flex justify-between items-center text-sm">
                    <div>
                      <p className="font-bold text-gray-800">{admin.full_name || 'Admin'}</p>
                      <p className="text-xs text-gray-400">{admin.email}</p>
                    </div>
                    <span className="text-[10px] bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full font-bold uppercase">
                      Admin
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Invites */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-500" /> Pending Admin Invitations ({invites.length})
              </h3>
              {invites.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {invites.map((invite) => (
                    <div key={invite.id} className="py-3 flex justify-between items-center text-sm">
                      <div>
                        <p className="font-medium text-gray-800">{invite.email}</p>
                        <p className="text-xs text-gray-400">
                          Invited on {new Date(invite.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRevokeInvite(invite.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition"
                        title="Revoke Invite"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">No pending admin invitations.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}