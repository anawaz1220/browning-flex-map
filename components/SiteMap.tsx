'use client'

import { Unit, ToggleView } from '@/lib/types'

interface SiteMapProps {
  units: Unit[]
  toggleView: ToggleView
  selectedUnit: Unit | null
  onUnitClick: (unit: Unit) => void
}

// SVG layout constants
const W = 900    // total SVG width
const H = 560    // total SVG height
const PAD = 40   // outer padding

// Building B: 7 units at top
const B_X = PAD + 60
const B_Y = PAD + 60
const UNIT_W = 96
const UNIT_H = 110
const GAP = 2

// Building A: 6 units at bottom
const A_X = PAD + 108
const A_Y = H - PAD - 60 - UNIT_H

// Drive aisle in between (visual only)

const BUILDING_A_UNITS = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6']
const BUILDING_B_UNITS = ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7']

function getUnitColor(unit: Unit, view: ToggleView, isSelected: boolean): string {
  if (isSelected) return '#7a3d35'

  const { status } = unit

  if (status === 'sold' || status === 'leased') return '#9ca3af'
  if (status === 'pending') return '#d97706'

  if (view === 'sale') {
    if (status === 'lease_only') return '#d1d5db' // greyed out
    return '#964d44'
  }
  if (view === 'lease') {
    if (status === 'sale_only') return '#d1d5db' // greyed out
    return '#4a7c99'
  }

  // 'all' view
  if (status === 'sale_only') return '#964d44'
  if (status === 'lease_only') return '#4a7c99'
  return '#964d44' // available for both → brand primary
}

function getTextColor(unit: Unit, view: ToggleView, isSelected: boolean): string {
  if (isSelected) return '#f4efea'
  if (unit.status === 'sold' || unit.status === 'leased') return '#6b7280'
  if (view === 'sale' && unit.status === 'lease_only') return '#9ca3af'
  if (view === 'lease' && unit.status === 'sale_only') return '#9ca3af'
  return '#f4efea'
}

export default function SiteMap({ units, toggleView, selectedUnit, onUnitClick }: SiteMapProps) {
  const unitMap = Object.fromEntries(units.map(u => [u.unit_number, u]))

  const renderUnit = (
    unitNumber: string,
    x: number,
    y: number,
    doorSide: 'bottom' | 'top'
  ) => {
    const unit = unitMap[unitNumber]
    if (!unit) return null

    const isSelected = selectedUnit?.unit_number === unitNumber
    const fill = getUnitColor(unit, toggleView, isSelected)
    const textFill = getTextColor(unit, toggleView, isSelected)
    const doorY = doorSide === 'bottom' ? y + UNIT_H - 8 : y + 2

    const statusLabel = () => {
      if (unit.status === 'sold') return 'SOLD'
      if (unit.status === 'leased') return 'LEASED'
      if (unit.status === 'pending') return 'PENDING'
      if (unit.status === 'sale_only') return 'FOR SALE'
      if (unit.status === 'lease_only') return 'FOR LEASE'
      return 'AVAILABLE'
    }

    const isGreyed =
      (toggleView === 'sale' && unit.status === 'lease_only') ||
      (toggleView === 'lease' && unit.status === 'sale_only')

    return (
      <g
        key={unitNumber}
        className="cursor-pointer"
        onClick={() => onUnitClick(unit)}
        style={{ transition: 'all 0.15s' }}
      >
        {/* Unit rectangle */}
        <rect
          x={x}
          y={y}
          width={UNIT_W}
          height={UNIT_H}
          fill={fill}
          stroke={isSelected ? '#f4efea' : '#fff'}
          strokeWidth={isSelected ? 2.5 : 1}
          rx={3}
          opacity={isGreyed ? 0.45 : 1}
        />

        {/* Garage door indicator */}
        <rect
          x={x + 10}
          y={doorY}
          width={UNIT_W - 20}
          height={6}
          fill={isGreyed ? '#ccc' : '#fff'}
          opacity={0.5}
          rx={1}
        />

        {/* Unit number */}
        <text
          x={x + UNIT_W / 2}
          y={y + 38}
          textAnchor="middle"
          fontSize={20}
          fontWeight="bold"
          fontFamily="Merriweather, Georgia, serif"
          fill={isGreyed ? '#aaa' : textFill}
        >
          {unitNumber}
        </text>

        {/* SF */}
        <text
          x={x + UNIT_W / 2}
          y={y + 58}
          textAnchor="middle"
          fontSize={9.5}
          fontFamily="Merriweather, Georgia, serif"
          fill={isGreyed ? '#bbb' : textFill}
          opacity={0.9}
        >
          1,250 SF
        </text>

        {/* Status */}
        <text
          x={x + UNIT_W / 2}
          y={y + 76}
          textAnchor="middle"
          fontSize={7.5}
          fontFamily="Merriweather, Georgia, serif"
          fill={isGreyed ? '#bbb' : textFill}
          opacity={0.85}
          letterSpacing={0.5}
        >
          {statusLabel()}
        </text>
      </g>
    )
  }

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full max-w-4xl mx-auto"
        style={{ minWidth: 600 }}
      >
        {/* Background */}
        <rect width={W} height={H} fill="#e8e0d8" rx={8} />

        {/* Site boundary */}
        <rect
          x={PAD}
          y={PAD}
          width={W - PAD * 2}
          height={H - PAD * 2}
          fill="#ddd5c8"
          stroke="#b5a99a"
          strokeWidth={1.5}
          strokeDasharray="6 3"
          rx={4}
        />

        {/* Parking / drive aisle */}
        <rect
          x={PAD + 10}
          y={B_Y + UNIT_H + 10}
          width={W - PAD * 2 - 20}
          height={A_Y - B_Y - UNIT_H - 20}
          fill="#ccc5bb"
          rx={3}
        />
        <text
          x={W / 2}
          y={(B_Y + UNIT_H + A_Y) / 2 + 5}
          textAnchor="middle"
          fontSize={11}
          fill="#8a7f74"
          fontFamily="Merriweather, Georgia, serif"
          letterSpacing={3}
        >
          PARKING / DRIVE AISLE
        </text>

        {/* Building B label */}
        <text
          x={B_X + (UNIT_W * 7 + GAP * 6) / 2}
          y={B_Y - 12}
          textAnchor="middle"
          fontSize={13}
          fontWeight="bold"
          fill="#353434"
          fontFamily="Merriweather, Georgia, serif"
          letterSpacing={1}
        >
          BUILDING B
        </text>

        {/* Building B units (garage doors face DOWN toward drive) */}
        {BUILDING_B_UNITS.map((num, i) =>
          renderUnit(num, B_X + i * (UNIT_W + GAP), B_Y, 'bottom')
        )}

        {/* Building A label */}
        <text
          x={A_X + (UNIT_W * 6 + GAP * 5) / 2}
          y={A_Y + UNIT_H + 22}
          textAnchor="middle"
          fontSize={13}
          fontWeight="bold"
          fill="#353434"
          fontFamily="Merriweather, Georgia, serif"
          letterSpacing={1}
        >
          BUILDING A
        </text>

        {/* Building A units (garage doors face UP toward drive) */}
        {BUILDING_A_UNITS.map((num, i) =>
          renderUnit(num, A_X + i * (UNIT_W + GAP), A_Y, 'top')
        )}

        {/* Address label */}
        <text
          x={W / 2}
          y={H - 10}
          textAnchor="middle"
          fontSize={10}
          fill="#6b5f54"
          fontFamily="Merriweather, Georgia, serif"
        >
          6650 Browning Dr, North Richland Hills, TX
        </text>

        {/* North arrow */}
        <g transform={`translate(${W - PAD - 30}, ${PAD + 30})`}>
          <polygon points="0,-18 6,4 0,0 -6,4" fill="#353434" />
          <text x={0} y={16} textAnchor="middle" fontSize={11} fontWeight="bold" fill="#353434" fontFamily="Merriweather, serif">N</text>
        </g>

        {/* Legend */}
        <g transform={`translate(${PAD + 14}, ${H - PAD - 44})`}>
          <rect width={10} height={10} fill="#964d44" rx={2} />
          <text x={14} y={9} fontSize={9} fill="#353434" fontFamily="Merriweather, serif">For Sale / Available</text>

          <rect y={14} width={10} height={10} fill="#4a7c99" rx={2} />
          <text x={14} y={23} fontSize={9} fill="#353434" fontFamily="Merriweather, serif">For Lease</text>

          <rect y={28} width={10} height={10} fill="#9ca3af" rx={2} />
          <text x={14} y={37} fontSize={9} fill="#353434" fontFamily="Merriweather, serif">Sold / Leased</text>
        </g>
      </svg>
    </div>
  )
}
