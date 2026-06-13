'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Unit, ToggleView } from '@/lib/types'
import { DEFAULT_UNITS } from '@/lib/units-data'
import SiteMap from '@/components/SiteMap'
import ToggleSwitch from '@/components/ToggleSwitch'
import UnitPopup from '@/components/UnitPopup'

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
        // Fallback to default units with generated IDs
        setUnits(
          DEFAULT_UNITS.map((u, i) => ({ ...u, id: `default-${i}` }))
        )
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
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f4efea' }}>
      {/* Header */}
      <header className="shadow-sm" style={{ backgroundColor: '#353434' }}>
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold tracking-tight" style={{ color: '#f4efea' }}>
              Browning Flex Business Park
            </h1>
            <p className="text-xs mt-0.5" style={{ color: '#b5a99a' }}>
              6650 Browning Dr, North Richland Hills, TX &nbsp;·&nbsp; Shallow Bay Flex
            </p>
          </div>
          <a
            href="https://www.peakflexspace.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: '#964d44' }}
          >
            PeakFLX ↗
          </a>
        </div>
      </header>

      {/* Stats bar */}
      <div className="border-b" style={{ backgroundColor: '#ede6de', borderColor: '#d5ccc4' }}>
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center gap-6 text-sm">
          <div>
            <span className="font-bold" style={{ color: '#353434' }}>{units.length}</span>
            <span className="ml-1" style={{ color: '#6b5f54' }}>Total Units</span>
          </div>
          <div>
            <span className="font-bold" style={{ color: '#964d44' }}>{availableCount}</span>
            <span className="ml-1" style={{ color: '#6b5f54' }}>Available</span>
          </div>
          <div>
            <span className="font-bold" style={{ color: '#353434' }}>1,250 SF</span>
            <span className="ml-1" style={{ color: '#6b5f54' }}>Per Unit</span>
          </div>
          <div>
            <span className="font-bold" style={{ color: '#353434' }}>18&apos;</span>
            <span className="ml-1" style={{ color: '#6b5f54' }}>Clear Height</span>
          </div>
          <div>
            <span className="font-bold" style={{ color: '#353434' }}>3-Phase</span>
            <span className="ml-1" style={{ color: '#6b5f54' }}>Power</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">

        {/* Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h2 className="text-base font-bold" style={{ color: '#353434' }}>
            Interactive Site Map
          </h2>
          <ToggleSwitch view={toggleView} onChange={setToggleView} />
        </div>

        {/* Map */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-sm animate-pulse" style={{ color: '#9ca3af' }}>Loading map…</div>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden shadow-md border" style={{ borderColor: '#d5ccc4' }}>
            <SiteMap
              units={units}
              toggleView={toggleView}
              selectedUnit={selectedUnit}
              onUnitClick={setSelectedUnit}
            />
          </div>
        )}

        {/* Help text */}
        <p className="text-center text-xs mt-3" style={{ color: '#9ca3af' }}>
          Click any unit to view details and submit an inquiry
        </p>

        {/* Property specs */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'Configuration', value: 'Front-Load Shallow Bay' },
            { label: 'Garage Doors', value: "12\u2019 \u00d7 14\u2019 Grade-Level" },
            { label: 'Office Finish', value: '\u00b120% Office / 80% Warehouse' },
            { label: 'Power', value: '3-Phase Available' },
            { label: 'Clear Height', value: "18\u2019" },
            { label: 'Availability', value: 'For Sale & For Lease' },
          ].map(s => (
            <div
              key={s.label}
              className="rounded-xl p-4"
              style={{ backgroundColor: '#ede6de' }}
            >
              <p className="text-xs uppercase tracking-wide font-bold" style={{ color: '#964d44' }}>{s.label}</p>
              <p className="text-sm mt-1 font-bold" style={{ color: '#353434' }}>{s.value}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-8 py-4 text-center text-xs border-t" style={{ borderColor: '#d5ccc4', color: '#9ca3af' }}>
        &copy; {new Date().getFullYear()} PeakFLX &mdash; Browning Flex Business Park
      </footer>

      {/* Unit popup */}
      {selectedUnit && (
        <UnitPopup
          unit={selectedUnit}
          onClose={() => setSelectedUnit(null)}
        />
      )}
    </div>
  )
}
