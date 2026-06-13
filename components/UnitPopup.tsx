'use client'

import { Unit } from '@/lib/types'
import InquiryForm from './InquiryForm'
import { useState } from 'react'

interface UnitPopupProps {
  unit: Unit
  onClose: () => void
}

function formatPrice(unit: Unit): string {
  if (unit.list_price) return `$${unit.list_price.toLocaleString()}`
  return 'Contact for pricing'
}

function formatLease(unit: Unit): string {
  if (!unit.lease_rate) return 'Contact for pricing'
  if (unit.lease_rate_unit === 'per_sf_year') {
    return `$${unit.lease_rate.toFixed(2)}/SF/yr`
  }
  return `$${unit.lease_rate.toLocaleString()}/mo`
}

function StatusBadge({ status }: { status: Unit['status'] }) {
  const config: Record<Unit['status'], { label: string; bg: string; text: string }> = {
    available: { label: 'Available', bg: '#964d44', text: '#f4efea' },
    sale_only: { label: 'For Sale', bg: '#964d44', text: '#f4efea' },
    lease_only: { label: 'For Lease', bg: '#4a7c99', text: '#f4efea' },
    sold: { label: 'Sold', bg: '#9ca3af', text: '#fff' },
    leased: { label: 'Leased', bg: '#9ca3af', text: '#fff' },
    pending: { label: 'Pending', bg: '#d97706', text: '#fff' },
  }
  const c = config[status]
  return (
    <span
      className="text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide"
      style={{ backgroundColor: c.bg, color: c.text }}
    >
      {c.label}
    </span>
  )
}

export default function UnitPopup({ unit, onClose }: UnitPopupProps) {
  const [showForm, setShowForm] = useState(false)

  const specs = [
    { label: 'Total Size', value: `${unit.total_sf.toLocaleString()} SF` },
    { label: 'Warehouse', value: `${unit.size_sf.toLocaleString()} SF` },
    { label: 'Mezzanine', value: `${unit.mezzanine_sf.toLocaleString()} SF` },
    { label: 'Office Finish', value: `±${unit.office_pct}%` },
    { label: 'Clear Height', value: unit.clear_height },
    { label: 'Garage Door', value: unit.door_size },
    { label: 'Power', value: unit.power },
  ]

  const showSalePrice = unit.status !== 'lease_only' && unit.status !== 'leased'
  const showLeaseRate = unit.status !== 'sale_only' && unit.status !== 'sold'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(53,52,52,0.55)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: '#f4efea' }}
      >
        {/* Header */}
        <div className="px-6 py-5" style={{ backgroundColor: '#964d44' }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest" style={{ color: '#f4efea', opacity: 0.8 }}>
                Building {unit.building}
              </p>
              <h2 className="text-3xl font-bold mt-0.5" style={{ color: '#f4efea' }}>
                Unit {unit.unit_number}
              </h2>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <StatusBadge status={unit.status} />
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold cursor-pointer"
                style={{ backgroundColor: 'rgba(244,239,234,0.2)', color: '#f4efea' }}
              >
                ×
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-3">
            {showSalePrice && (
              <div className="rounded-xl p-3 text-center" style={{ backgroundColor: '#ede6de' }}>
                <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#964d44' }}>Sale Price</p>
                <p className="text-sm font-bold mt-1" style={{ color: '#353434' }}>{formatPrice(unit)}</p>
              </div>
            )}
            {showLeaseRate && (
              <div className="rounded-xl p-3 text-center" style={{ backgroundColor: '#ede6de' }}>
                <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#4a7c99' }}>Lease Rate</p>
                <p className="text-sm font-bold mt-1" style={{ color: '#353434' }}>{formatLease(unit)}</p>
              </div>
            )}
          </div>

          {/* Specs grid */}
          <div className="grid grid-cols-2 gap-2">
            {specs.map(s => (
              <div key={s.label} className="rounded-lg px-3 py-2" style={{ backgroundColor: '#ede6de' }}>
                <p className="text-xs uppercase tracking-wide" style={{ color: '#7a6a5e' }}>{s.label}</p>
                <p className="text-sm font-bold mt-0.5" style={{ color: '#353434' }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Floor plan */}
          {unit.floor_plan_url ? (
            <a
              href={unit.floor_plan_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-semibold underline"
              style={{ color: '#964d44' }}
            >
              📐 View Floor Plan
            </a>
          ) : (
            <p className="text-xs italic" style={{ color: '#9ca3af' }}>Floor plan coming soon</p>
          )}

          {/* Notes */}
          {unit.notes && (
            <p className="text-sm" style={{ color: '#6b5f54' }}>{unit.notes}</p>
          )}

          {/* CTA */}
          {unit.status !== 'sold' && unit.status !== 'leased' && (
            <>
              {!showForm ? (
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full py-3 rounded-xl text-sm font-bold uppercase tracking-widest cursor-pointer transition-opacity hover:opacity-90"
                  style={{ backgroundColor: '#964d44', color: '#f4efea' }}
                >
                  Inquire About This Unit
                </button>
              ) : (
                <InquiryForm unit={unit} onClose={() => setShowForm(false)} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
