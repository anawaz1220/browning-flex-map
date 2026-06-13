// Default unit data used as seed / fallback
// Admin panel can override via Supabase

import { Unit } from './types'

const DEFAULTS = {
  size_sf: 1000,
  mezzanine_sf: 250,
  total_sf: 1250,
  status: 'available' as const,
  list_price: null,
  lease_rate: null,
  lease_rate_unit: 'per_sf_year',
  clear_height: "18'",
  door_size: "12' x 14'",
  power: '3-Phase',
  office_pct: 20,
  floor_plan_url: null,
  notes: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

export const DEFAULT_UNITS: Omit<Unit, 'id'>[] = [
  // Building A
  { ...DEFAULTS, unit_number: 'A1', building: 'A' },
  { ...DEFAULTS, unit_number: 'A2', building: 'A' },
  { ...DEFAULTS, unit_number: 'A3', building: 'A' },
  { ...DEFAULTS, unit_number: 'A4', building: 'A' },
  { ...DEFAULTS, unit_number: 'A5', building: 'A' },
  { ...DEFAULTS, unit_number: 'A6', building: 'A' },
  // Building B
  { ...DEFAULTS, unit_number: 'B1', building: 'B' },
  { ...DEFAULTS, unit_number: 'B2', building: 'B' },
  { ...DEFAULTS, unit_number: 'B3', building: 'B' },
  { ...DEFAULTS, unit_number: 'B4', building: 'B' },
  { ...DEFAULTS, unit_number: 'B5', building: 'B' },
  { ...DEFAULTS, unit_number: 'B6', building: 'B' },
  { ...DEFAULTS, unit_number: 'B7', building: 'B' },
]
