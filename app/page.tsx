'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/client'
import { Unit, ToggleView } from '@/lib/types'
import { DEFAULT_UNITS } from '@/lib/units-data'
import UnitPopup from '@/components/UnitPopup'
import ToggleSwitch from '@/components/ToggleSwitch'

const LeafletMap = dynamic(() => import('@/components/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#1a1a1a' }}>
      <p className="text-sm animate-pulse" style={{ color: '#9ca3af', fontFamily: 'Merriweather, serif' }}>
        Loading map…
      </p>
    </div>
  ),
})

export default function Home() {
  const [units, setUnits] = useState<Unit[]>([])
  const [toggleView, setToggleView] = useState<ToggleView>('all')
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUnits = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .order('unit_number')

      if (error || !data || data.length === 0) {
        setUnits(DEFAULT_UNITS.map((u, i) => ({ ...u, id: `default-${i}` })))
      } else {
        setUnits(data)
      }
      setLoading(false)
    }
    fetchUnits()
  }, [])

  const availableCount = units.filter(
    u => u.status === 'available' || u.status === 'sale_only' || u.status === 'lease_only'
  ).length

  return (
    <div className="flex flex-col" style={{ height: '100dvh', overflow: 'hidden' }}>

      {/* ── Minimal header ── */}
      <header
        className="flex items-center justify-between px-4 shrink-0"
        style={{ backgroundColor: '#353434', height: '52px', zIndex: 1000 }}
      >
        {/* Left: branding */}
        <div className="flex items-baseline gap-3">
          <h1 className="text-sm font-bold tracking-tight leading-none" style={{ color: '#f4efea' }}>
            Browning Flex Business Park
          </h1>
          <span className="text-xs hidden sm:inline" style={{ color: '#7a6a5e' }}>
            6650 Browning Dr · North Richland Hills, TX
          </span>
        </div>

        {/* Right: stats + link */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-4 text-xs" style={{ color: '#b5a99a' }}>
            <span>
              <strong style={{ color: '#964d44' }}>{availableCount}</strong> / {units.length} Available
            </span>
            <span style={{ color: '#5a4a40' }}>|</span>
            <span>1,250 SF · 18&apos; Clear · 3-Phase</span>
          </div>
          <a
            href="https://www.peakflexspace.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold uppercase tracking-widest shrink-0"
            style={{ color: '#964d44' }}
          >
            PeakFLX ↗
          </a>
        </div>
      </header>

      {/* ── Map area ── */}
      <main className="relative flex-1 overflow-hidden">

        {/* Leaflet map (fills entire remaining height) */}
        {loading ? (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#1a1a1a' }}>
            <p className="text-sm animate-pulse" style={{ color: '#9ca3af', fontFamily: 'Merriweather, serif' }}>
              Loading…
            </p>
          </div>
        ) : (
          <LeafletMap
            units={units}
            toggleView={toggleView}
            onUnitClick={setSelectedUnit}
          />
        )}

        {/* ── Toggle overlay (bottom-center) ── */}
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000]"
          style={{ pointerEvents: 'auto' }}
        >
          <div
            className="rounded-2xl shadow-lg px-3 py-2"
            style={{ backgroundColor: 'rgba(53,52,52,0.88)', backdropFilter: 'blur(6px)' }}
          >
            <ToggleSwitch view={toggleView} onChange={setToggleView} dark />
          </div>
        </div>

        {/* ── Legend overlay (bottom-left) ── */}
        <div
          className="absolute bottom-6 left-3 z-[1000] rounded-xl shadow-lg px-3 py-2 hidden sm:block"
          style={{ backgroundColor: 'rgba(53,52,52,0.82)', backdropFilter: 'blur(6px)' }}
        >
          <p className="text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: '#7a6a5e' }}>Legend</p>
          {[
            { color: '#964d44', label: 'Available' },
            { color: '#4a7c99', label: 'For Lease Only' },
            { color: '#d97706', label: 'Pending' },
            { color: '#9ca3af', label: 'Sold / Leased' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: color }} />
              <span className="text-xs" style={{ color: '#d6cfc7' }}>{label}</span>
            </div>
          ))}
          <div className="border-t mt-1.5 pt-1.5" style={{ borderColor: '#4a3f38' }}>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: '#6b7280', opacity: 0.5 }} />
              <span className="text-xs" style={{ color: '#d6cfc7' }}>Parking / Drive Aisle</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: '#d6cfc7', opacity: 0.7 }} />
              <span className="text-xs" style={{ color: '#d6cfc7' }}>Sidewalk</span>
            </div>
          </div>
        </div>

        {/* ── Help hint (top-left) ── */}
        <div
          className="absolute top-3 left-3 z-[1000] rounded-lg px-3 py-1.5"
          style={{ backgroundColor: 'rgba(53,52,52,0.70)', backdropFilter: 'blur(4px)' }}
        >
          <p className="text-xs" style={{ color: '#b5a99a' }}>
            Click a unit to view details & inquire
          </p>
        </div>

      </main>

      {/* Unit popup (fixed overlay) */}
      {selectedUnit && (
        <UnitPopup unit={selectedUnit} onClose={() => setSelectedUnit(null)} />
      )}
    </div>
  )
}
