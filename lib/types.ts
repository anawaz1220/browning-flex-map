export type UnitStatus = 'available' | 'sale_only' | 'lease_only' | 'sold' | 'leased' | 'pending'

export type ToggleView = 'all' | 'sale' | 'lease'

export interface Unit {
  id: string
  unit_number: string       // 'A1', 'B3', etc.
  building: string          // 'A' or 'B'
  size_sf: number           // 1000
  mezzanine_sf: number      // 250
  total_sf: number          // 1250
  status: UnitStatus
  list_price: number | null
  lease_rate: number | null
  lease_rate_unit: string   // 'per_sf_year' or 'per_month'
  clear_height: string      // "18'"
  door_size: string         // "12' x 14'"
  power: string             // '3-Phase'
  office_pct: number        // 20
  floor_plan_url: string | null
  notes: string | null
  created_at: string
  updated_at: string
}
