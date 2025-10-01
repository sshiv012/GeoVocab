'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Create modern custom marker icon
const customIcon = L.divIcon({
  className: 'custom-marker',
  html: `
    <div class="relative">
      <div class="absolute -inset-2 bg-blue-500 rounded-full blur-md opacity-50 animate-pulse"></div>
      <div class="relative">
        <svg width="40" height="50" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="markerGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#1D4ED8;stop-opacity:1" />
            </linearGradient>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
              <feOffset dx="0" dy="2" result="offsetblur"/>
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.3"/>
              </feComponentTransfer>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <path d="M20 0C11.716 0 5 6.716 5 15c0 8.284 15 35 15 35s15-26.716 15-35c0-8.284-6.716-15-15-15z"
                fill="url(#markerGradient)"
                filter="url(#shadow)"/>
          <circle cx="20" cy="15" r="6" fill="white" opacity="0.9"/>
        </svg>
      </div>
    </div>
  `,
  iconSize: [40, 50],
  iconAnchor: [20, 50],
  popupAnchor: [0, -50],
})

interface MapProps {
  onMapClick: (lat: number, lon: number) => void
  markerPosition: [number, number] | null
  popupContent?: string
  shouldAnimate?: boolean
  showMarker?: boolean
  onAnimationComplete?: () => void
  onMapReady?: (map: L.Map) => void
}

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lon: number) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function AnimatedView({ position, shouldAnimate, onAnimationComplete, onMapReady }: {
  position: [number, number],
  shouldAnimate: boolean,
  onAnimationComplete?: () => void,
  onMapReady?: (map: L.Map) => void
}) {
  const map = useMap()

  useEffect(() => {
    if (onMapReady) {
      onMapReady(map)
    }
  }, [map, onMapReady])

  useEffect(() => {
    if (position && shouldAnimate) {
      // First zoom out to world view
      map.flyTo([20, 0], 2, {
        duration: 1.2,
        easeLinearity: 0.15
      })

      // Then fly to the target location with cinematic zoom
      setTimeout(() => {
        map.flyTo(position, 14, {
          duration: 3.2,
          easeLinearity: 0.08
        })

        // Call completion callback after animation finishes
        setTimeout(() => {
          if (onAnimationComplete) onAnimationComplete()
        }, 3200)
      }, 1300)
    } else if (position) {
      map.setView(position, 13, { animate: true, duration: 0.8 })
    }
  }, [position, shouldAnimate, map, onAnimationComplete])

  return null
}

export default function Map({
  onMapClick,
  markerPosition,
  popupContent,
  shouldAnimate = false,
  showMarker = true,
  onAnimationComplete,
  onMapReady
}: MapProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className="w-full h-full bg-gray-900 animate-pulse flex items-center justify-center">
        <p className="text-gray-500">Loading map...</p>
      </div>
    )
  }

  return (
    <MapContainer
      center={markerPosition || [20, 0]}
      zoom={markerPosition ? 15 : 2}
      className="w-full h-full z-0"
      scrollWheelZoom={true}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        className="map-tiles"
      />
      <MapClickHandler onMapClick={onMapClick} />
      {markerPosition && (
        <AnimatedView
          position={markerPosition}
          shouldAnimate={shouldAnimate}
          onAnimationComplete={onAnimationComplete}
          onMapReady={onMapReady}
        />
      )}
      {!markerPosition && (
        <AnimatedView
          position={[20, 0]}
          shouldAnimate={false}
          onMapReady={onMapReady}
        />
      )}
      {markerPosition && showMarker && (
        <Marker position={markerPosition} icon={customIcon}>
          {popupContent && (
            <Popup className="custom-popup">
              <div className="font-semibold text-blue-600">{popupContent}</div>
            </Popup>
          )}
        </Marker>
      )}
    </MapContainer>
  )
}
