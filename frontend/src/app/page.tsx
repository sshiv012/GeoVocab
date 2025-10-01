'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import L from 'leaflet'
import { api, GeoVocabResponse } from '@/lib/api'
import { Search, Copy, Check, AlertCircle, ChevronLeft, ChevronRight, Navigation, Plus, Minus } from 'lucide-react'

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
      <p className="text-gray-500">Loading map...</p>
    </div>
  ),
})

export default function Home() {
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [result, setResult] = useState<GeoVocabResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(true)
  const [shouldAnimate, setShouldAnimate] = useState(false)
  const [showMarker, setShowMarker] = useState(true)
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null)

  const handleMapClick = async (lat: number, lon: number) => {
    setMarkerPosition([lat, lon])
    setError(null)
    setLoading(true)
    setIsPanelOpen(true)
    setShouldAnimate(true)
    setShowMarker(false)

    try {
      const data = await api.getWordsFromCoordinates(lat, lon)
      setResult(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get words for this location'
      setError(errorMessage)
      setShouldAnimate(false)
      setShowMarker(true)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchInput.trim()) return

    setError(null)
    setLoading(true)
    setShouldAnimate(true)
    setShowMarker(false) // Hide marker during animation

    try {
      const data = await api.getLocationFromWords(searchInput.trim())
      setResult(data)
      setMarkerPosition([data.latitude, data.longitude])
      setIsPanelOpen(true)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to find location'
      setError(errorMessage)
      setResult(null)
      setShouldAnimate(false)
      setShowMarker(true)
    } finally {
      setLoading(false)
    }
  }

  const handleAnimationComplete = () => {
    setShowMarker(true)
    setShouldAnimate(false)
  }

  const handleLocateMe = () => {
    if ('geolocation' in navigator) {
      setLoading(true)
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude
          const lon = position.coords.longitude
          setUserLocation([lat, lon])
          await handleMapClick(lat, lon)
          setLoading(false)
        },
        () => {
          setError('Unable to get your location. Please check permissions.')
          setLoading(false)
        }
      )
    } else {
      setError('Geolocation is not supported by your browser')
    }
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleZoomIn = () => {
    if (mapInstance) {
      mapInstance.zoomIn()
    }
  }

  const handleZoomOut = () => {
    if (mapInstance) {
      mapInstance.zoomOut()
    }
  }

  return (
    <div className="h-screen w-screen overflow-hidden relative bg-gray-900">
      {/* Search Bar - Top */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search for words (e.g., word1-word2-word3)"
            className="w-full px-5 py-3.5 pr-12 rounded-xl bg-gray-800/95 backdrop-blur-md border border-gray-700 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm placeholder:text-gray-400 text-white"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <Search className="w-5 h-5 text-gray-300" />
          </button>
        </form>
      </div>

      {/* Locate Me Button - Top Right */}
      <button
        onClick={handleLocateMe}
        disabled={loading}
        className="absolute top-4 right-4 z-50 p-3 bg-gray-800/95 backdrop-blur-md rounded-xl shadow-lg hover:bg-gray-700 transition-all disabled:opacity-50 border border-gray-700"
        title="Locate me"
      >
        <Navigation className="w-5 h-5 text-blue-400" />
      </button>

      {/* Zoom Controls - Below Locate Button */}
      <div className="absolute top-20 right-4 z-50 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="p-3 bg-gray-800/95 backdrop-blur-md rounded-xl shadow-lg hover:bg-gray-700 transition-all border border-gray-700"
          title="Zoom in"
        >
          <Plus className="w-5 h-5 text-gray-300" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-3 bg-gray-800/95 backdrop-blur-md rounded-xl shadow-lg hover:bg-gray-700 transition-all border border-gray-700"
          title="Zoom out"
        >
          <Minus className="w-5 h-5 text-gray-300" />
        </button>
      </div>

      {/* Full Screen Map */}
      <div className="absolute inset-0 w-full h-full">
        <Map
          onMapClick={handleMapClick}
          markerPosition={markerPosition || userLocation}
          popupContent={result?.geoVocab}
          shouldAnimate={shouldAnimate}
          showMarker={showMarker}
          onAnimationComplete={handleAnimationComplete}
          onMapReady={setMapInstance}
        />
      </div>

      {/* Collapsible Side Panel - LEFT */}
      <div className={`absolute top-0 left-0 h-full transition-transform duration-300 ease-in-out z-40 ${isPanelOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full w-96 bg-gray-900/95 backdrop-blur-xl shadow-2xl flex flex-col border-r border-gray-800">
          {/* Panel Header */}
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500 rounded-lg blur-md opacity-50"></div>
                  <div className="relative p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">GeoVocab</h2>
                  <p className="text-xs text-gray-400">Every place has three words</p>
                </div>
              </div>
            </div>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Loading State */}
            {loading && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
                  <p className="text-sm text-blue-300">Processing...</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5 flex items-start space-x-3">
                <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-300 mb-1">Error</p>
                  <p className="text-sm text-red-400 leading-relaxed">{error}</p>
                </div>
              </div>
            )}

            {/* Result Card */}
            {result && (
              <div className="space-y-4">
                {/* Magic Words */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <div className="relative bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-5 shadow-lg">
                    <p className="text-xs text-white/70 mb-2 uppercase tracking-wide">Magic Words</p>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-lg font-bold text-white break-words leading-tight">{result.geoVocab}</p>
                      <button
                        onClick={() => copyToClipboard(result.geoVocab, 'words')}
                        className="p-2.5 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
                        title="Copy magic words"
                      >
                        {copied === 'words' ? (
                          <Check className="w-5 h-5 text-white" />
                        ) : (
                          <Copy className="w-5 h-5 text-white" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* GeoHash */}
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">GeoHash</p>
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-mono text-base text-gray-200 break-all">{result.geoHash}</p>
                    <button
                      onClick={() => copyToClipboard(result.geoHash, 'hash')}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
                      title="Copy geohash"
                    >
                      {copied === 'hash' ? (
                        <Check className="w-4 h-4 text-gray-300" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-300" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Coordinates */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Latitude</p>
                    <p className="text-base font-semibold text-gray-200 font-mono">{result.latitude.toFixed(6)}</p>
                  </div>
                  <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Longitude</p>
                    <p className="text-base font-semibold text-gray-200 font-mono">{result.longitude.toFixed(6)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Instructions - Always visible */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl blur-lg opacity-30"></div>
              <div className="relative bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-5 text-white">
                <h3 className="text-sm font-semibold mb-4 text-blue-300 uppercase tracking-wide">Quick Guide</h3>
                <ul className="space-y-3 text-sm text-gray-300">
                  <li className="flex items-start space-x-2.5">
                    <span className="font-bold text-blue-400 flex-shrink-0 text-base">1.</span>
                    <span className="leading-relaxed">Click anywhere on the map to get 3 magic words</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <span className="font-bold text-blue-400 flex-shrink-0 text-base">2.</span>
                    <span className="leading-relaxed">Search using the top bar (format: word1-word2-word3)</span>
                  </li>
                  <li className="flex items-start space-x-2.5">
                    <span className="font-bold text-blue-400 flex-shrink-0 text-base">3.</span>
                    <span className="leading-relaxed">Click the navigation button to find your location</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Panel Toggle Button */}
      <button
        onClick={() => setIsPanelOpen(!isPanelOpen)}
        className={`absolute top-1/2 -translate-y-1/2 z-50 p-2 bg-gray-800/95 backdrop-blur-md rounded-r-xl shadow-lg hover:bg-gray-700 transition-all border border-l-0 border-gray-700 ${isPanelOpen ? 'left-96' : 'left-0'}`}
      >
        {isPanelOpen ? (
          <ChevronLeft className="w-5 h-5 text-gray-300" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-300" />
        )}
      </button>
    </div>
  )
}
