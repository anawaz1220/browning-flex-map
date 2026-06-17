'use client'

import { useEffect, useRef, useCallback } from 'react'
import type L from 'leaflet'
import { Unit, ToggleView } from '@/lib/types'

interface LeafletMapProps {
  units: Unit[]
  toggleView: ToggleView
  onUnitClick: (unit: Unit) => void
}

const STATUS_COLORS: Record<string, string> = {
  available: '#964d44',
  sale_only: '#964d44',
  lease_only: '#4a7c99',
  sold: '#9ca3af',
  leased: '#9ca3af',
  pending: '#d97706',
}

export default function LeafletMap({ units, toggleView, onUnitClick }: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const unitLayerRef = useRef<L.GeoJSON | null>(null)
  const unitGeoJSONRef = useRef<GeoJSON.FeatureCollection | null>(null)
  const onUnitClickRef = useRef(onUnitClick)
  onUnitClickRef.current = onUnitClick

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    let map: L.Map

    import('leaflet').then((L) => {
      if (!containerRef.current || mapRef.current) return

      map = L.map(containerRef.current, {
        center: [32.8468, -97.2409],
        zoom: 20,
        zoomControl: false,
        attributionControl: true,
      })

      // Basemaps
      const satellite = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { attribution: '© Esri', maxZoom: 22, maxNativeZoom: 19 }
      )
      const streets = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        { attribution: '© OpenStreetMap contributors', maxZoom: 22, maxNativeZoom: 19 }
      )
      satellite.addTo(map)

      // Zoom control (bottom right)
      L.control.zoom({ position: 'bottomright' }).addTo(map)

      // Layer toggle control (top right)
      const baseMaps = { '🛰 Satellite': satellite, '🗺 Street': streets }
      L.control.layers(baseMaps, {}, { position: 'topright', collapsed: false }).addTo(map)

      // Concrete / parking layer
      fetch('/geojson/site-concrete.geojson')
        .then(r => r.json())
        .then(data => {
          L.geoJSON(data, {
            style: {
              fillColor: '#6b7280',
              fillOpacity: 0.35,
              color: '#4b5563',
              weight: 1,
            },
            onEachFeature: (_feat, layer) => {
              layer.bindTooltip('Parking & Drive Aisle', {
                sticky: true,
                className: 'leaflet-site-tooltip',
              })
            },
          }).addTo(map)
        })
        .catch(() => {/* non-critical */})

      // Sidewalk layer
      fetch('/geojson/site-sidewalk.geojson')
        .then(r => r.json())
        .then(data => {
          L.geoJSON(data, {
            style: {
              fillColor: '#d6cfc7',
              fillOpacity: 0.55,
              color: '#b5a99a',
              weight: 1,
            },
            onEachFeature: (_feat, layer) => {
              layer.bindTooltip('Sidewalk', {
                sticky: true,
                className: 'leaflet-site-tooltip',
              })
            },
          }).addTo(map)
        })
        .catch(() => {/* non-critical */})

      // Load unit GeoJSON once, store it
      fetch('/geojson/browning-flex-units.geojson')
        .then(r => r.json())
        .then(data => {
          unitGeoJSONRef.current = data
          renderUnitLayer(L, map)
        })
        .catch(() => {/* non-critical */})

      mapRef.current = map
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        unitLayerRef.current = null
        unitGeoJSONRef.current = null
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Re-render unit layer when units or toggle changes
  useEffect(() => {
    if (!mapRef.current || !unitGeoJSONRef.current) return
    import('leaflet').then((L) => {
      if (!mapRef.current) return
      renderUnitLayer(L, mapRef.current)
    })
  }, [units, toggleView]) // eslint-disable-line react-hooks/exhaustive-deps

  function renderUnitLayer(L: typeof import('leaflet'), map: L.Map) {
    if (!unitGeoJSONRef.current) return

    // Remove old layer
    if (unitLayerRef.current) {
      map.removeLayer(unitLayerRef.current)
      unitLayerRef.current = null
    }

    const currentUnits = units
    const currentToggle = toggleView

    const layer = L.geoJSON(unitGeoJSONRef.current, {
      style: (feature) => {
        const unitNum = feature?.properties?.unit_number
        const unit = currentUnits.find(u => u.unit_number === unitNum)

        // Hide units not matching toggle
        const hidden = unit && (
          (currentToggle === 'sale' && (unit.status === 'lease_only' || unit.status === 'leased')) ||
          (currentToggle === 'lease' && (unit.status === 'sale_only' || unit.status === 'sold'))
        )

        if (!unit || hidden) {
          return { fillColor: '#9ca3af', fillOpacity: 0.15, color: '#d1d5db', weight: 1 }
        }

        return {
          fillColor: STATUS_COLORS[unit.status] ?? '#964d44',
          fillOpacity: 0.72,
          color: '#ffffff',
          weight: 2,
        }
      },

      onEachFeature: (feature, layer) => {
        const unitNum = feature?.properties?.unit_number
        const unit = currentUnits.find(u => u.unit_number === unitNum)
        if (!unit) return

        const isHidden =
          (currentToggle === 'sale' && (unit.status === 'lease_only' || unit.status === 'leased')) ||
          (currentToggle === 'lease' && (unit.status === 'sale_only' || unit.status === 'sold'))

        // Label each unit
        const center = (layer as L.Polygon).getBounds().getCenter()
        L.marker(center, {
          icon: L.divIcon({
            className: 'unit-label-icon',
            html: `<div class="unit-label">${unitNum}</div>`,
            iconSize: [36, 20],
            iconAnchor: [18, 10],
          }),
          interactive: false,
          zIndexOffset: 100,
        }).addTo(map)

        if (isHidden) return

        const statusLabel: Record<string, string> = {
          available: 'Available',
          sale_only: 'For Sale',
          lease_only: 'For Lease',
          sold: 'Sold',
          leased: 'Leased',
          pending: 'Pending',
        }

        layer.bindTooltip(
          `<strong>Unit ${unitNum}</strong><br/>${statusLabel[unit.status] ?? ''}`,
          { sticky: true, className: 'leaflet-unit-tooltip' }
        )

        layer.on('mouseover', function (this: L.Path) {
          this.setStyle({ fillOpacity: 0.95, weight: 3, color: '#f4efea' })
        })
        layer.on('mouseout', function (this: L.Path) {
          this.setStyle({ fillOpacity: 0.72, weight: 2, color: '#ffffff' })
        })
        layer.on('click', () => {
          onUnitClickRef.current(unit)
        })
      },
    })

    layer.addTo(map)
    unitLayerRef.current = layer
  }

  return (
    <>
      <div ref={containerRef} className="w-full h-full" />
      <style>{`
        .leaflet-site-tooltip {
          background: rgba(53,52,52,0.82);
          color: #f4efea;
          border: none;
          border-radius: 6px;
          font-size: 11px;
          font-family: 'Merriweather', Georgia, serif;
          padding: 4px 8px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }
        .leaflet-site-tooltip::before { border-top-color: rgba(53,52,52,0.82); }

        .leaflet-unit-tooltip {
          background: rgba(53,52,52,0.92);
          color: #f4efea;
          border: none;
          border-radius: 8px;
          font-size: 12px;
          font-family: 'Merriweather', Georgia, serif;
          padding: 6px 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
          pointer-events: none;
        }
        .leaflet-unit-tooltip::before { border-top-color: rgba(53,52,52,0.92); }

        .unit-label-icon { background: transparent; border: none; }
        .unit-label {
          background: rgba(255,255,255,0.92);
          color: #353434;
          font-size: 10px;
          font-weight: 700;
          font-family: 'Merriweather', Georgia, serif;
          border-radius: 4px;
          padding: 2px 5px;
          text-align: center;
          box-shadow: 0 1px 4px rgba(0,0,0,0.3);
          white-space: nowrap;
        }

        .leaflet-control-layers {
          border-radius: 10px !important;
          border: none !important;
          box-shadow: 0 2px 10px rgba(0,0,0,0.25) !important;
          font-family: 'Merriweather', Georgia, serif !important;
          font-size: 12px !important;
        }
        .leaflet-control-layers-toggle { display: none !important; }
        .leaflet-control-layers-expanded {
          padding: 8px 12px !important;
          background: rgba(53,52,52,0.9) !important;
          color: #f4efea !important;
        }
        .leaflet-control-layers label { color: #f4efea !important; font-size: 11px !important; }

        .leaflet-control-zoom a {
          background: rgba(53,52,52,0.85) !important;
          color: #f4efea !important;
          border: none !important;
          border-radius: 8px !important;
          margin-bottom: 4px !important;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3) !important;
          font-size: 16px !important;
        }
        .leaflet-control-zoom a:hover {
          background: #964d44 !important;
        }

        .leaflet-bottom.leaflet-right {
          bottom: 24px !important;
          right: 12px !important;
        }
        .leaflet-top.leaflet-right {
          top: 12px !important;
          right: 12px !important;
        }

        .leaflet-attribution-flag { display: none !important; }
        .leaflet-control-attribution {
          font-size: 9px !important;
          background: rgba(0,0,0,0.4) !important;
          color: #ccc !important;
          border-radius: 4px 0 0 0 !important;
        }
      `}</style>
    </>
  )
}
