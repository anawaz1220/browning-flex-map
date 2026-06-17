'use client'

import { ToggleView } from '@/lib/types'

interface ToggleSwitchProps {
  view: ToggleView
  onChange: (view: ToggleView) => void
  dark?: boolean
}

export default function ToggleSwitch({ view, onChange, dark = false }: ToggleSwitchProps) {
  const options: { label: string; value: ToggleView }[] = [
    { label: 'All Units', value: 'all' },
    { label: 'For Sale', value: 'sale' },
    { label: 'For Lease', value: 'lease' },
  ]

  return (
    <div
      className="flex items-center gap-1 rounded-full p-1"
      style={{
        backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'white',
        border: dark ? '1px solid rgba(255,255,255,0.12)' : '1px solid #e5e7eb',
      }}
    >
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer"
          style={{
            backgroundColor: view === opt.value
              ? opt.value === 'lease' ? '#4a7c99' : '#964d44'
              : 'transparent',
            color: view === opt.value ? '#f4efea' : dark ? '#d6cfc7' : '#353434',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
