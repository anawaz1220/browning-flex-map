'use client'

import { ToggleView } from '@/lib/types'

interface ToggleSwitchProps {
  view: ToggleView
  onChange: (view: ToggleView) => void
}

export default function ToggleSwitch({ view, onChange }: ToggleSwitchProps) {
  const options: { label: string; value: ToggleView }[] = [
    { label: 'All Units', value: 'all' },
    { label: 'For Sale', value: 'sale' },
    { label: 'For Lease', value: 'lease' },
  ]

  return (
    <div className="flex items-center gap-1 bg-white rounded-full shadow-sm border border-gray-200 p-1">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer"
          style={{
            backgroundColor: view === opt.value
              ? opt.value === 'lease' ? '#4a7c99' : '#964d44'
              : 'transparent',
            color: view === opt.value ? '#f4efea' : '#353434',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
