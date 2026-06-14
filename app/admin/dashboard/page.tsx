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
  available: '#964d44', sale_only: '#964d44', lease_only: '#4a7c99',
  pending: '#d97706', sold: '#9ca3af', leased: '#9ca3af',
}

// ─── Eye Icon ─────────────────────────────────────────────────────────────────
function EyeIcon({ show }: { show: boolean }) {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      {show ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
      ) : (
        <>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </>
      )}
    </svg>
  )
}

// ─── Password Field ───────────────────────────────────────────────────────────
function PwField({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string
}) {
  const [show, setShow] = useState(false)
  const inputClass = "w-full px-3 py-2 pr-10 rounded-lg text-sm border focus:outline-none focus:ring-2"
  const inputStyle = { borderColor: '#d5ccc4', backgroundColor: '#fff', color: '#353434' }
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: '#6b5f54' }}>{label}</label>
      <div className="relative">
        <input type={show ? 'text' : 'password'} value={value}
          onChange={e => onChange(e.target.value)} required
          className={inputClass} style={inputStyle} placeholder={placeholder} />
        <button type="button" onClick={() => setShow(v => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer" style={{ color: '#9ca3af' }}>
          <EyeIcon show={show} />
        </button>
      </div>
    </div>
  )
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
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) { setMsg('Session expired. Please log in again.'); setSaving(false); return }
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: user.email, password: currentPassword })
    if (signInError) { setMsg('Current password is incorrect.'); setSaving(false); return }
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) { setMsg(error.message) } else { setMsg('✓ Password updated successfully!'); setTimeout(onClose, 1500) }
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(53,52,52,0.55)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden" style={{ backgroundColor: '#fff' }}>
        <div className="px-6 py-4 border-b" style={{ borderColor: '#f0ebe5', backgroundColor: '#f9f6f3' }}>
          <h3 className="font-bold" style={{ color: '#353434' }}>Change Password</h3>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <PwField label="Current Password" value={currentPassword} onChange={setCurrentPassword} placeholder="••••••••" />
          <PwField label="New Password" value={newPassword} onChange={setNewPassword} placeholder="Min. 8 characters" />
          <PwField label="Confirm New Password" value={confirm} onChange={setConfirm} placeholder="Repeat new password" />
          {msg && <p className={`text-xs text-center font-semibold ${msg.startsWith('✓') ? 'text-green-600' : 'text-red-500'}`}>{msg}</p>}
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
function ProfileDropdown({ email, onChangePassword, onLogout }: {
  email: string; onChangePassword: () => void; onLogout: () => void
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

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 cursor-pointer rounded-full px-3 py-1.5"
        style={{ backgroundColor: 'rgba(244,239,234,0.12)' }}>
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold"
          style={{ backgroundColor: '#964d44', color: '#f4efea' }}>
          {email.charAt(0).toUpperCase()}
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
          <div className="px-4 py-3 border-b" style={{ borderColor: '#f0ebe5', backgroundColor: '#f9f6f3' }}>
            <p className="text-xs font-bold" style={{ color: '#353434' }}>{email.split('@')[0]}</p>
            <p className="text-xs mt-0.5 truncate" style={{ color: '#9ca3af' }}>{email}</p>
            <span className="inline-block mt-1.5 text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
              style={{ backgroundColor: '#964d4422', color: '#964d44' }}>Admin</span>
          </div>
          <div className="py-1">
            <button onClick={() => { setOpen(false); onChangePassword() }}
              className="w-full text-left px-4 py-2.5 text-sm cursor-pointer hover:bg-gray-50 flex items-center gap-2"
              style={{ color: '#353434' }}>
              🔑 Change Password
            </button>
            <div className="border-t my-1" style={{ borderColor: '#f0ebe5' }} />
            <button onClick={() => { setOpen(false); onLogout() }}
              className="w-full text-left px-4 py-2.5 text-sm cursor-pointer hover:bg-gray-50"
              style={{ color: '#ef4444' }}>
              → Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Edit Unit Modal ──────────────────────────────────────────────────────────
function EditUnitModal({ unit, onSave, onClose }: {
  unit: Unit; onSave: (u: Unit) => Promise<void>; onClose: () => void
}) {
  const [editingUnit, setEditingUnit] = useState<Unit>({ ...unit })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await onSave(editingUnit)
    setSaving(false)
  }

  const inputClass = "w-full px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2"
  const inputStyle = { borderColor: '#d5ccc4', backgroundColor: '#fff', color: '#353434' }
  const labelClass = "block text-xs font-bold uppercase tracking-wide mb-1"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(53,52,52,0.55)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden" style={{ backgroundColor: '#fff' }}>
        <div className="px-6 py-4 border-b" style={{ borderColor: '#f0ebe5', backgroundColor: '#f9f6f3' }}>
          <h3 className="font-bold" style={{ color: '#353434' }}>Edit Unit {editingUnit.unit_number}</h3>
        </div>
        <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
          <div>
            <label className={labelClass} style={{ color: '#6b5f54' }}>Availability Status</label>
            <select value={editingUnit.status}
              onChange={e => setEditingUnit({ ...editingUnit, status: e.target.value as UnitStatus })}
              className={inputClass} style={inputStyle}>
              {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass} style={{ color: '#6b5f54' }}>Sale Price ($)</label>
              <input type="number" value={editingUnit.list_price ?? ''}
                onChange={e => setEditingUnit({ ...editingUnit, list_price: e.target.value ? Number(e.target.value) : null })}
                placeholder="e.g. 285000" className={inputClass} style={inputStyle} />
            </div>
            <div>
              <label className={labelClass} style={{ color: '#6b5f54' }}>Lease Rate</label>
              <input type="number" step="0.01" value={editingUnit.lease_rate ?? ''}
                onChange={e => setEditingUnit({ ...editingUnit, lease_rate: e.target.value ? Number(e.target.value) : null })}
                placeholder="e.g. 14.50" className={inputClass} style={inputStyle} />
            </div>
          </div>
          <div>
            <label className={labelClass} style={{ color: '#6b5f54' }}>Lease Rate Type</label>
            <select value={editingUnit.lease_rate_unit}
              onChange={e => setEditingUnit({ ...editingUnit, lease_rate_unit: e.target.value })}
              className={inputClass} style={inputStyle}>
              <option value="per_sf_year">Per SF / Year (e.g. $14.50/SF/yr)</option>
              <option value="per_month">Per Month (e.g. $1,800/mo)</option>
            </select>
          </div>
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
          <div>
            <label className={labelClass} style={{ color: '#6b5f54' }}>Floor Plan URL</label>
            <input type="url" value={editingUnit.floor_plan_url ?? ''}
              onChange={e => setEditingUnit({ ...editingUnit, floor_plan_url: e.target.value || null })}
              placeholder="https://..." className={inputClass} style={inputStyle} />
          </div>
          <div>
            <label className={labelClass} style={{ color: '#6b5f54' }}>Notes</label>
            <textarea value={editingUnit.notes ?? ''}
              onChange={e => setEditingUnit({ ...editingUnit, notes: e.target.value || null })}
              rows={2} placeholder="Any additional notes..."
              className={`${inputClass} resize-none`} style={inputStyle} />
          </div>
        </div>
        <div className="px-6 py-4 border-t flex gap-3" style={{ borderColor: '#f0ebe5' }}>
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
    const { error } = await supabase.from('units').update({
      status: updated.status, list_price: updated.list_price,
      lease_rate: updated.lease_rate, lease_rate_unit: updated.lease_rate_unit,
      notes: updated.notes, floor_plan_url: updated.floor_plan_url,
      clear_height: updated.clear_height, door_size: updated.door_size,
      power: updated.power, office_pct: updated.office_pct,
      updated_at: new Date().toISOString(),
    }).eq('id', updated.id)
    if (!error) { await loadUnits(); setEditingUnit(null) }
  }

  const stats = {
    total: units.length,
    available: units.filter(u => ['available', 'sale_only', 'lease_only'].includes(u.status)).length,
    sold: units.filter(u => u.status === 'sold').length,
    leased: units.filter(u => u.status === 'leased').length,
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4efea' }}>
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
            <ProfileDropdown email={userEmail} onChangePassword={() => setShowChangePassword(true)} onLogout={handleLogout} />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
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
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide" style={{ color: '#6b5f54' }}>{h}</th>
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
                      <td className="px-4 py-3 text-xs max-w-32 truncate" style={{ color: '#9ca3af' }}>{unit.notes || '—'}</td>
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

      {editingUnit && <EditUnitModal unit={editingUnit} onSave={handleSave} onClose={() => setEditingUnit(null)} />}
      {showChangePassword && <ChangePasswordModal onClose={() => setShowChangePassword(false)} />}
    </div>
  )
}
