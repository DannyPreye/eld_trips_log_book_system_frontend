import { useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import { decodePolyline } from '@/lib/polyline'
import type { Route, Stop } from '@/lib/api'
import { StopTypeEnum } from '@/lib/api'

// Fix for default marker icons in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface MapDisplayProps {
  route?: Route
  stops?: Stop[]
  currentLocation?: { lat: number; lng: number }
  pickupLocation?: { lat: number; lng: number }
  dropoffLocation?: { lat: number; lng: number }
  height?: string
}

function MapBounds({ bounds }: { bounds: L.LatLngBounds | null }) {
  const map = useMap()

  useEffect(() => {
    if (bounds && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [20, 20] })
    }
  }, [map, bounds])

  return null
}

function MapResize() {
  const map = useMap()
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize()
    }, 100)
  }, [map])
  return null
}

function getStopIcon(type: StopTypeEnum): L.Icon {
  const colors: Record<StopTypeEnum, string> = {
    [StopTypeEnum.BREAK]: '#3b82f6',
    [StopTypeEnum.FUEL]: '#ef4444',
    [StopTypeEnum.REST]: '#8b5cf6',
    [StopTypeEnum.PICKUP]: '#10b981',
    [StopTypeEnum.DROPOFF]: '#f59e0b',
  }

  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${colors[type]}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 0 1px rgba(0,0,0,0.2);"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  })
}

export default function MapDisplay({
  route,
  stops = [],
  currentLocation,
  pickupLocation,
  dropoffLocation,
  height = '100%',
}: MapDisplayProps) {
  // Calculate bounds from all points
  const bounds = useMemo(() => {
    const points: [number, number][] = []

    if (currentLocation) {
      points.push([currentLocation.lat, currentLocation.lng])
    }
    if (pickupLocation) {
      points.push([pickupLocation.lat, pickupLocation.lng])
    }
    if (dropoffLocation) {
      points.push([dropoffLocation.lat, dropoffLocation.lng])
    }

    if (route?.polyline) {
      try {
        const decoded = decodePolyline(route.polyline)
        decoded.forEach(([lat, lng]) => {
          points.push([lat, lng])
        })
      } catch (error) {
        console.error('Error decoding polyline:', error)
      }
    }

    stops.forEach((stop) => {
      if (stop.location) {
        // Parse location if it's a string with coordinates
        const match = stop.location.match(/(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/)
        if (match) {
          points.push([parseFloat(match[1]), parseFloat(match[2])])
        }
      }
    })

    if (points.length > 0) {
      return L.latLngBounds(points)
    }
    return null
  }, [route, stops, currentLocation, pickupLocation, dropoffLocation])

  const defaultCenter: [number, number] = [40.7128, -74.006]
  const defaultZoom = bounds ? undefined : 4

  const polylinePositions = useMemo(() => {
    if (route?.polyline) {
      try {
        return decodePolyline(route.polyline)
      } catch (error) {
        console.error('Error decoding polyline:', error)
        return []
      }
    }
    return []
  }, [route?.polyline])

  const mapCenter = bounds && bounds.isValid()
    ? [bounds.getCenter().lat, bounds.getCenter().lng] as [number, number]
    : defaultCenter

  return (
    <div className="w-full border border-map-border bg-white" style={{ height, minHeight: '400px' }}>
      <MapContainer
        center={mapCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        className="map-container"
        scrollWheelZoom={true}
        key={`map-${bounds ? 'with-bounds' : 'default'}`}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapResize />
        {bounds && bounds.isValid() && <MapBounds bounds={bounds} />}

        {currentLocation && (
          <Marker
            position={[currentLocation.lat, currentLocation.lng]}
            icon={L.divIcon({
              className: 'custom-marker',
              html: '<div style="background-color: #111; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 0 1px rgba(0,0,0,0.2);"></div>',
              iconSize: [14, 14],
              iconAnchor: [7, 7],
            })}
          />
        )}

        {pickupLocation && (
          <Marker
            position={[pickupLocation.lat, pickupLocation.lng]}
            icon={getStopIcon(StopTypeEnum.PICKUP)}
          />
        )}

        {dropoffLocation && (
          <Marker
            position={[dropoffLocation.lat, dropoffLocation.lng]}
            icon={getStopIcon(StopTypeEnum.DROPOFF)}
          />
        )}

        {polylinePositions.length > 0 && (
          <Polyline
            positions={polylinePositions}
            pathOptions={{
              color: '#111111',
              weight: 3,
              opacity: 0.8,
            }}
          />
        )}

        {stops.map((stop, index) => {
          if (!stop.location) return null
          const match = stop.location.match(/(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/)
          if (!match) return null
          const [lat, lng] = [parseFloat(match[1]), parseFloat(match[2])]
          return (
            <Marker
              key={`stop-${index}`}
              position={[lat, lng]}
              icon={getStopIcon(stop.stop_type)}
            />
          )
        })}
      </MapContainer>
    </div>
  )
}

