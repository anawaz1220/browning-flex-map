-- ============================================================
-- Browning Flex Business Park – Supabase Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Units table
CREATE TABLE IF NOT EXISTS units (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_number VARCHAR(10) UNIQUE NOT NULL,
  building CHAR(1) NOT NULL,
  size_sf INTEGER DEFAULT 1000,
  mezzanine_sf INTEGER DEFAULT 250,
  total_sf INTEGER DEFAULT 1250,
  status VARCHAR(20) DEFAULT 'available'
    CHECK (status IN ('available','sale_only','lease_only','sold','leased','pending')),
  list_price DECIMAL(12,2),
  lease_rate DECIMAL(10,2),
  lease_rate_unit VARCHAR(20) DEFAULT 'per_sf_year',
  clear_height VARCHAR(20) DEFAULT '18''',
  door_size VARCHAR(30) DEFAULT '12'' x 14''',
  power VARCHAR(30) DEFAULT '3-Phase',
  office_pct INTEGER DEFAULT 20,
  floor_plan_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE units ENABLE ROW LEVEL SECURITY;

-- Public can read all units
CREATE POLICY "Public read" ON units FOR SELECT USING (true);

-- Authenticated admin can do everything
CREATE POLICY "Admin full access" ON units FOR ALL USING (auth.role() = 'authenticated');

-- Seed all 13 units with default data
INSERT INTO units (unit_number, building) VALUES
  ('A1', 'A'), ('A2', 'A'), ('A3', 'A'),
  ('A4', 'A'), ('A5', 'A'), ('A6', 'A'),
  ('B1', 'B'), ('B2', 'B'), ('B3', 'B'),
  ('B4', 'B'), ('B5', 'B'), ('B6', 'B'), ('B7', 'B')
ON CONFLICT (unit_number) DO NOTHING;
