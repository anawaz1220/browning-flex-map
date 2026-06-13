'use client'

import { useEffect, useState } from 'react'
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

export default function AdminDashboard() {
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/admin/login')
        return
      }
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

  const handleEdit = (unit: Unit) => {
    setEditingUnit({ ...unit })
    setSaveMsg('')
  }

  const handleSave = async () => {
    if (!editingUnit) return
    setSaving(true)
    setSaveMsg('')

    const { error } = await supabase
      .from('units')
      .update({
        status: editingUnit.status,
        list_price: editingUnit.list_price,
        lease_rate: editingUnit.lease_rate,
        lease_rate_unit: editingUnit.lease_rate_unit,
        notes: editingUnit.notes,
        floor_plan_url: editingUnit.floor_plan_url,
        clear_height: editingUnit.clear_height,
        door_size: editingUnit.door_size,
        power: editingUnit.power,
        office_pct: editingUnit.office_pct,
        updated_at: new Date().toISOString(),
      })
      .eq('id', editingUnit.id)

    if (error) {
      setSaveMsg('Error saving. Please try again.')
    } else {
      setSaveMsg('Saved!')
      await loadUnits()
      setTimeout(() => {
        setEditingUnit(null)
        setSaveMsg('')
      }, 800)
    }
    setSaving(false)
  }

  const stats = {
    total: units.length,
    available: units.filter(u => ['available', 'sale_only', 'lease_only'].includes(u.status)).length,
    sold: units.filter(u => u.status === 'sold').length,
    leased: units.filter(u => u.status === 'leased').length,
  }

  const inputClass = "w-full px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2"
  const inputStyle = { borderColor: '#d5ccc4', backgroundColor: '#fff', color: '#353434' }
  const labelClass = "block text-xs font-bold uppercase tracking-wide mb-1"

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
            <a
              href="/"
              className="text-xs font-bold underline"
              style={{ color: '#964d44' }}
            >
              View Public Map ↗
            </a>
            <button
              onClick={handleLogout}
              className="text-xs px-3 py-1.5 rounded-lg cursor-pointer"
              style={{ backgroundColor: 'rgba(244,239,234,0.15)', color: '#f4efea' }}
            >
              Sign Out
            </button>
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
                    <tr
                      key={unit.id}
                      style={{ borderTop: idx > 0 ? '1px solid #f0ebe5' : 'none' }}
                    >
                      <td className="px-4 py-3 font-bold" style={{ color: '#353434' }}>
                        {unit.unit_number}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full uppercase"
                          style={{
                            backgroundColor: STATUS_COLORS[unit.status] + '22',
                            color: STATUS_COLORS[unit.status],
                          }}
                        >
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
                        <button
                          onClick={() => handleEdit(unit)}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                          style={{ backgroundColor: '#f4efea', color: '#964d44' }}
                        >
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

      {/* Edit modal */}
      {editingUnit && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(53,52,52,0.55)' }}
          onClick={e => { if (e.target === e.currentTarget) setEditingUnit(null) }}
        >
          <div className="w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden" style={{ backgroundColor: '#fff' }}>
            <div className="px-6 py-4 border-b" style={{ borderColor: '#f0ebe5', backgroundColor: '#f9f6f3' }}>
              <h3 className="font-bold" style={{ color: '#353434' }}>Edit Unit {editingUnit.unit_number}</h3>
            </div>

            <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">

              {/* Status */}
              <div>
                <label className={labelClass} style={{ color: '#6b5f54' }}>Availability Status</label>
                <select
                  value={editingUnit.status}
                  onChange={e => setEditingUnit({ ...editingUnit, status: e.target.value as UnitStatus })}
                  className={inputClass}
                  style={inputStyle}
                >
                  {STATUS_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass} style={{ color: '#6b5f54' }}>Sale Price ($)</label>
                  <input
                    type="number"
                    value={editingUnit.list_price ?? ''}
                    onChange={e => setEditingUnit({ ...editingUnit, list_price: e.target.value ? Number(e.target.value) : null })}
                    placeholder="e.g. 285000"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className={labelClass} style={{ color: '#6b5f54' }}>Lease Rate</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingUnit.lease_rate ?? ''}
                    onChange={e => setEditingUnit({ ...editingUnit, lease_rate: e.target.value ? Number(e.target.value) : null })}
                    placeholder="e.g. 14.50"
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Lease rate unit */}
              <div>
                <label className={labelClass} style={{ color: '#6b5f54' }}>Lease Rate Type</label>
                <select
                  value={editingUnit.lease_rate_unit}
                  onChange={e => setEditingUnit({ ...editingUnit, lease_rate_unit: e.target.value })}
                  className={inputClass}
                  style={inputStyle}
                >
                  <option value="per_sf_year">Per SF / Year (e.g. $14.50/SF/yr)</option>
                  <option value="per_month">Per Month (e.g. $1,800/mo)</option>
                </select>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass} style={{ color: '#6b5f54' }}>Clear Height</label>
                  <input
                    type="text"
                    value={editingUnit.clear_height}
                    onChange={e => setEditingUnit({ ...editingUnit, clear_height: e.target.value })}
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className={labelClass} style={{ color: '#6b5f54' }}>Garage Door Size</label>
                  <input
                    type="text"
                    value={editingUnit.door_size}
                    onChange={e => setEditingUnit({ ...editingUnit, door_size: e.target.value })}
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Floor plan URL */}
              <div>
                <label className={labelClass} style={{ color: '#6b5f54' }}>Floor Plan URL</label>
                <input
                  type="url"
                  value={editingUnit.floor_plan_url ?? ''}
                  onChange={e => setEditingUnit({ ...editingUnit, floor_plan_url: e.target.value || null })}
                  placeholder="https://..."
                  className={inputClass}
                  style={inputStyle}
                />
              </div>

              {/* Notes */}
              <div>
                <label className={labelClass} style={{ color: '#6b5f54' }}>Notes</label>
                <textarea
                  value={editingUnit.notes ?? ''}
                  onChange={e => setEditingUnit({ ...editingUnit, notes: e.target.value || null })}
                  rows={2}
                  placeholder="Any additional notes..."
                  className={`${inputClass} resize-none`}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t flex items-center gap-3" style={{ borderColor: '#f0ebe5' }}>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wide cursor-pointer disabled:opacity-60"
                style={{ backgroundColor: '#964d44', color: '#f4efea' }}
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
              <button
                onClick={() => setEditingUnit(null)}
                className="px-4 py-2.5 rounded-xl text-sm font-bold cursor-pointer"
                style={{ backgroundColor: '#f4efea', color: '#353434' }}
              >
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
      )}
    </div>
  )
}
