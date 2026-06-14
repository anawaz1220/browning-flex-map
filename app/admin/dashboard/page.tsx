'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Unit, UnitStatus } from '@/lib/types'

const STATUS_OPTIONS: { value: UnitStatus; label: string }[] = [
  { value: 'available', label: 'Available (Sale & Lease)' },
  { value: 'sale_only', label: 'For Sale Only' },
  { value: 'lease_only', label: 'For Lease Only' },
  { value: 'pending', label: 'Pending' },
  { value: 'sold', label: 'Sold' },
  { value: 'leased', label: 'Leased' },
]

const STATUS_COLORS: Record<UnitStatus, string> = {
  available: '#964d44',
  sale_only: '#964d44',
  lease_only: '#4a7c99',
  pending: '#d97706',
  sold: '#9ca3af',
  leased: '#9ca3af',
}

// ─── Change Password Modal ────────────────────────────────────────────────────
function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [msg, setMsg] = useState('')
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg('')
    if (newPassword.length < 8) { setMsg('Password must be at least 8 characters.'); return }
    if (newPassword !== confirm) { setMsg('Passwords do not match.'); return }

    setSaving(true)
    // Re-authenticate first to verify current password
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) { setMsg('Session expired. Please log in again.'); setSaving(false); return }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    })
    if (signInError) { setMsg('Current password is incorrect.'); setSaving(false); return }

    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      setMsg(error.message)
    } else {
      setMsg('✓ Password updated successfully!')
      setTimeout(onClose, 1500)
    }
    setSaving(false)
  }

  const inputClass = "w-full px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2"
  const inputStyle = { borderColor: '#d5ccc4', backgroundColor: '#fff', color: '#353434' }
  const labelClass = "block text-xs font-bold uppercase tracking-wide mb-1.5"

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(53,52,52,0.55)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden" style={{ backgroundColor: '#fff' }}>
        <div className="px-6 py-4 border-b" style={{ borderColor: '#f0ebe5', backgroundColor: '#f9f6f3' }}>
          <h3 className="font-bold" style={{ color: '#353434' }}>Change Password</h3>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className={labelClass} style={{ color: '#6b5f54' }}>Current Password</label>
            <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
              required className={inputClass} style={inputStyle} placeholder="••••••••" />
          </div>
          <div>
            <label className={labelClass} style={{ color: '#6b5f54' }}>New Password</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
              required className={inputClass} style={inputStyle} placeholder="Min. 8 characters" />
          </div>
          <div>
            <label className={labelClass} style={{ color: '#6b5f54' }}>Confirm New Password</label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
              required className={inputClass} style={inputStyle} placeholder="Repeat new password" />
          </div>
          {msg && (
            <p className={`text-xs text-center font-semibold ${msg.startsWith('✓') ? 'text-green-600' : 'text-red-500'}`}>{msg}</p>
          )}
          <div className="flex gap-2">
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wide cursor-pointer disabled:opacity-60"
              style={{ backgroundColor: '#964d44', color: '#f4efea' }}>
              {saving ? 'Saving…' : 'Update Password'}
            </button>
            <button type="button" onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-bold cursor-pointer"
              style={{ backgroundColor: '#f4efea', color: '#353434' }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Profile Dropdown ─────────────────────────────────────────────────────────
function ProfileDropdown({
  email,
  onChangePassword,
  onLogout,
}: {
  email: string
  onChangePassword: () => void
  onLogout: () => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const initial = email.charAt(0).toUpperCase()

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 cursor-pointer rounded-full px-3 py-1.5 transition-colors"
        style={{ backgroundColor: 'rgba(244,239,234,0.12)' }}
      >
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold"
          style={{ backgroundColor: '#964d44', color: '#f4efea' }}>
          {initial}
        </div>
        <span className="text-xs font-semibold hidden sm:block" style={{ color: '#f4efea' }}>
          {email.split('@')[0]}
        </span>
        <svg className="w-3 h-3" style={{ color: '#b5a99a' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-lg overflow-hidden z-50 border"
          style={{ backgroundColor: '#fff', borderColor: '#e8e2dc' }}>
          {/* User info */}
          <div className="px-4 py-3 border-b" style={{ borderColor: '#f0ebe5', backgroundColor: '#f9f6f3' }}>
            <p className="text-xs font-bold" style={{ color: '#353434' }}>{email.split('@')[0]}</p>
            <p className="text-xs mt-0.5 truncate" style={{ color: '#9ca3af' }}>{email}</p>
            <span className="inline-block mt-1.5 text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
              style={{ backgroundColor: '#964d4422', color: '#964d44' }}>Admin</span>
          </div>
          {/* Actions */}
          <div className="py-1">
            <button
              onClick={() => { setOpen(false); onChangePassword() }}
              className="w-full text-left px-4 py-2.5 text-sm cursor-pointer hover:bg-gray-50 flex items-center gap-2"
              style={{ color: '#353434' }}
            >
              🔑 Change Password
            </button>
            <div className="border-t my-1" style={{ borderColor: '#f0ebe5' }} />
            <button
              onClick={() => { setOpen(false); onLogout() }}
              className="w-full text-left px-4 py-2.5 text-sm cursor-pointer hover:bg-gray-50 flex items-center gap-2"
              style={{ color: '#ef4444' }}
            >
              → Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Edit Unit Modal ──────────────────────────────────────────────────────────
function EditUnitModal({
  unit,
  onSave,
  onClose,
}: {
  unit: Unit
  onSave: (u: Unit) => Promise<void>
  onClose: () => void
}) {
  const [editingUnit, setEditingUnit] = useState<Unit>({ ...unit })
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  const handleSave = async () => {
    setSaving(true)
    setSaveMsg('')
    await onSave(editingUnit)
    setSaving(false)
  }

  const inputClass = "w-full px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2"
  const inputStyle = { borderColor: '#d5ccc4', backgroundColor: '#fff', color: '#353434' }
  const labelClass = "block text-xs font-bold uppercase tracking-wide mb-1"

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(53,52,52,0.55)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden" style={{ backgroundColor: '#fff' }}>
        <div className="px-6 py-4 border-b" style={{ borderColor: '#f0ebe5', backgroundColor: '#f9f6f3' }}>
          <h3 className="font-bold" style={{ color: '#353434' }}>Edit Unit {editingUnit.unit_number}</h3>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
          {/* Status */}
          <div>
            <label className={labelClass} style={{ color: '#6b5f54' }}>Availability Status</label>
            <select value={editingUnit.status}
              onChange={e => setEditingUnit({ ...editingUnit, status: e.target.value as UnitStatus })}
              className={inputClass} style={inputStyle}>
              {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass} style={{ color: '#6b5f54' }}>Sale Price ($)</label>
              <input type="number"
                value={editingUnit.list_price ?? ''}
                onChange={e => setEditingUnit({ ...editingUnit, list_price: e.target.value ? Number(e.target.value) : null })}
                placeholder="e.g. 285000" className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className={labelClass} style={{ color: '#6b5f54' }}>Lease Rate</label>
              <input type="number" step="0.01"
                value={editingUnit.lease_rate ?? ''}
                onChange={e => setEditingUnit({ ...editingUnit, lease_rate: e.target.value ? Number(e.target.value) : null })}
                placeholder="e.g. 14.50" className={inputClass} style={inputStyle} />
            </div>
          </div>

          {/* Lease rate type */}
          <div>
            <label className={labelClass} style={{ color: '#6b5f54' }}>Lease Rate Type</label>
            <select value={editingUnit.lease_rate_unit}
              onChange={e => setEditingUnit({ ...editingUnit, lease_rate_unit: e.target.value })}
              className={inputClass} style={inputStyle}>
              <option value="per_sf_year">Per SF / Year (e.g. $14.50/SF/yr)</option>
              <option value="per_month">Per Month (e.g. $1,800/mo)</option>
            </select>
          </div>

          {/* Specs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass} style={{ color: '#6b5f54' }}>Clear Height</label>
              <input type="text" value={editingUnit.clear_height}
                onChange={e => setEditingUnit({ ...editingUnit, clear_height: e.target.value })}
                className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className={labelClass} style={{ color: '#6b5f54' }}>Garage Door Size</label>
              <input type="text" value={editingUnit.door_size}
                onChange={e => setEditingUnit({ ...editingUnit, door_size: e.target.value })}
                className={inputClass} style={inputStyle} />
            </div>
          </div>

          {/* Floor plan URL */}
          <div>
            <label className={labelClass} style={{ color: '#6b5f54' }}>Floor Plan URL</label>
            <input type="url"
              value={editingUnit.floor_plan_url ?? ''}
              onChange={e => setEditingUnit({ ...editingUnit, floor_plan_url: e.target.value || null })}
              placeholder="https://..." className={inputClass} style={inputStyle} />
          </div>

          {/* Notes */}
          <div>
            <label className={labelClass} style={{ color: '#6b5f54' }}>Notes</label>
            <textarea
              value={editingUnit.notes ?? ''}
              onChange={e => setEditingUnit({ ...editingUnit, notes: e.target.value || null })}
              rows={2} placeholder="Any additional notes..."
              className={`${inputClass} resize-none`} style={inputStyle} />
          </div>
        </div>

        <div className="px-6 py-4 border-t flex items-center gap-3" style={{ borderColor: '#f0ebe5' }}>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wide cursor-pointer disabled:opacity-60"
            style={{ backgroundColor: '#964d44', color: '#f4efea' }}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          <button onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-bold cursor-pointer"
            style={{ backgroundColor: '#f4efea', color: '#353434' }}>
            Cancel
          </button>
          {saveMsg && (
            <span className="text-xs font-bold" style={{ color: saveMsg === 'Saved!' ? '#964d44' : '#ef4444' }}>
              {saveMsg}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/admin/login'); return }
      setUserEmail(session.user.email ?? '')
      await loadUnits()
    }
    init()
  }, [])

  const loadUnits = async () => {
    setLoading(true)
    const { data } = await supabase.from('units').select('*').order('unit_number')
    if (data) setUnits(data)
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  const handleSave = async (updated: Unit) => {
    const { error } = await supabase
      .from('units')
      .update({
        status: updated.status,
        list_price: updated.list_price,
        lease_rate: updated.lease_rate,
        lease_rate_unit: updated.lease_rate_unit,
        notes: updated.notes,
        floor_plan_url: updated.floor_plan_url,
        clear_height: updated.clear_height,
        door_size: updated.door_size,
        power: updated.power,
        office_pct: updated.office_pct,
        updated_at: new Date().toISOString(),
      })
      .eq('id', updated.id)

    if (!error) {
      await loadUnits()
      setEditingUnit(null)
    }
  }

  const stats = {
    total: units.length,
    available: units.filter(u => ['available', 'sale_only', 'lease_only'].includes(u.status)).length,
    sold: units.filter(u => u.status === 'sold').length,
    leased: units.filter(u => u.status === 'leased').length,
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4efea' }}>
      {/* Header */}
      <header className="shadow-sm" style={{ backgroundColor: '#353434' }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold" style={{ color: '#f4efea' }}>Admin Dashboard</h1>
            <p className="text-xs" style={{ color: '#b5a99a' }}>Browning Flex Business Park</p>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" target="_blank" className="text-xs font-bold underline hidden sm:block" style={{ color: '#964d44' }}>
              View Public Map ↗
            </a>
            <ProfileDropdown
              email={userEmail}
              onChangePassword={() => setShowChangePassword(true)}
              onLogout={handleLogout}
            />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Units', value: stats.total, color: '#353434' },
            { label: 'Available', value: stats.available, color: '#964d44' },
            { label: 'Sold', value: stats.sold, color: '#9ca3af' },
            { label: 'Leased', value: stats.leased, color: '#4a7c99' },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-4 shadow-sm" style={{ backgroundColor: '#fff' }}>
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Units table */}
        <div className="rounded-2xl shadow-sm overflow-hidden" style={{ backgroundColor: '#fff' }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: '#f0ebe5' }}>
            <h2 className="text-sm font-bold" style={{ color: '#353434' }}>Unit Management</h2>
            <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>Click Edit to update a unit&apos;s status and pricing</p>
          </div>

          {loading ? (
            <div className="py-16 text-center text-sm animate-pulse" style={{ color: '#9ca3af' }}>Loading…</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: '#f9f6f3' }}>
                    {['Unit', 'Status', 'Sale Price', 'Lease Rate', 'Notes', ''].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide" style={{ color: '#6b5f54' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {units.map((unit, idx) => (
                    <tr key={unit.id} style={{ borderTop: idx > 0 ? '1px solid #f0ebe5' : 'none' }}>
                      <td className="px-4 py-3 font-bold" style={{ color: '#353434' }}>{unit.unit_number}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full uppercase"
                          style={{ backgroundColor: STATUS_COLORS[unit.status] + '22', color: STATUS_COLORS[unit.status] }}>
                          {STATUS_OPTIONS.find(o => o.value === unit.status)?.label || unit.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: '#6b5f54' }}>
                        {unit.list_price ? `$${unit.list_price.toLocaleString()}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: '#6b5f54' }}>
                        {unit.lease_rate ? `$${unit.lease_rate}/${unit.lease_rate_unit === 'per_sf_year' ? 'SF/yr' : 'mo'}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs max-w-32 truncate" style={{ color: '#9ca3af' }}>
                        {unit.notes || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => setEditingUnit(unit)}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                          style={{ backgroundColor: '#f4efea', color: '#964d44' }}>
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {editingUnit && (
        <EditUnitModal unit={editingUnit} onSave={handleSave} onClose={() => setEditingUnit(null)} />
      )}
      {showChangePassword && (
        <ChangePasswordModal onClose={() => setShowChangePassword(false)} />
      )}
    </div>
  )
}
