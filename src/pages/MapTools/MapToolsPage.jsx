import { useEffect, useRef, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  MapPin, Ruler, Square, Palette, Trash2, Navigation,
  InfoIcon, X, Menu, BookOpen, Clock, Settings
} from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import { useAuth } from '../../context/AuthContext'

// Earth radius in meters
const EARTH_RADIUS = 6378137.0

// Helper: Calculate spherical polygon area (Turf.js style)
const calculateSphericalArea = (latlngs) => {
  const len = latlngs.length
  if (len < 3) return 0

  let area = 0.0
  for (let i = 0; i < len; i++) {
    const p1 = latlngs[i]
    const p2 = latlngs[(i + 1) % len]

    const lambda1 = (p1.lng * Math.PI) / 180
    const lambda2 = (p2.lng * Math.PI) / 180
    const phi1 = (p1.lat * Math.PI) / 180
    const phi2 = (p2.lat * Math.PI) / 180

    area += (lambda2 - lambda1) * (2 + Math.sin(phi1) + Math.sin(phi2))
  }

  area = (area * EARTH_RADIUS * EARTH_RADIUS) / 2.0
  return Math.abs(area)
}

// Helper: Create custom SVG icons
const createCustomIcon = (color = '#3b82f6') => {
  return L.divIcon({
    html: `
      <div style="display: flex; align-items: center; justify-content: center;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" style="width: 32px; height: 32px; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.3));">
          <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
        </svg>
      </div>
    `,
    className: 'custom-marker-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  })
}

export default function MapToolsPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language?.slice(0, 2) || 'uz'
  const { currentUser, updateUser } = useAuth()

  const userKey = currentUser?.uid || currentUser?.id || currentUser?.email || 'guest'
  const [mapReady, setMapReady] = useState(false)

  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)

  // Floating panels show/hide state
  const [showControls, setShowControls] = useState(true)
  const [showGuide, setShowGuide] = useState(false)

  // Leaflet map overlays
  const tempMarkerRef = useRef(null)
  const distancePolylineRef = useRef(null)
  const distanceMarkersRef = useRef([])
  const areaPolygonRef = useRef(null)
  const areaMarkersRef = useRef([])
  const shapesGroupRef = useRef(null)
  const markersGroupRef = useRef(null)

  // React state variables
  const [activeTool, setActiveTool] = useState('marker') // 'marker', 'distance', 'area', 'coord', 'shape'
  const [hoverCoords, setHoverCoords] = useState(null)
  const [copied, setCopied] = useState(false)

  // 1. Markers data
  const [markersList, setMarkersList] = useState([])
  const [markerName, setMarkerName] = useState('')
  const [markerNotes, setMarkerNotes] = useState('')
  const [pendingCoords, setPendingCoords] = useState(null)

  // 2. Distance data
  const [distancePoints, setDistancePoints] = useState([])
  const [totalDistance, setTotalDistance] = useState(0)

  // 3. Area data
  const [areaPoints, setAreaPoints] = useState([])
  const [totalArea, setTotalArea] = useState(0)

  // 4. Shape Drawing config
  const [drawType, setDrawType] = useState('circle') // 'circle', 'rectangle'
  const [circleRadius, setCircleRadius] = useState(500) // in meters
  const [strokeColor, setStrokeColor] = useState('#ef4444')
  const [fillColor, setFillColor] = useState('#f87171')
  const [fillOpacity, setFillOpacity] = useState(0.4)
  const [drawnShapes, setDrawnShapes] = useState([])

  // State for active tab in info guide panel
  const [activeGuideTab, setActiveGuideTab] = useState('dist')

  // Clean distance overlays
  const clearDistance = useCallback(() => {
    if (distancePolylineRef.current && mapRef.current) {
      mapRef.current.removeLayer(distancePolylineRef.current)
      distancePolylineRef.current = null
    }
    if (mapRef.current) {
      distanceMarkersRef.current.forEach((m) => mapRef.current.removeLayer(m))
    }
    distanceMarkersRef.current = []
    setDistancePoints([])
    setTotalDistance(0)
  }, [])

  // Clean area overlays
  const clearArea = useCallback(() => {
    if (areaPolygonRef.current && mapRef.current) {
      mapRef.current.removeLayer(areaPolygonRef.current)
      areaPolygonRef.current = null
    }
    if (mapRef.current) {
      areaMarkersRef.current.forEach((m) => mapRef.current.removeLayer(m))
    }
    areaMarkersRef.current = []
    setAreaPoints([])
    setTotalArea(0)
  }, [])

  // Switch tool cleanups
  useEffect(() => {
    if (tempMarkerRef.current && mapRef.current) {
      mapRef.current.removeLayer(tempMarkerRef.current)
      tempMarkerRef.current = null
    }
    setPendingCoords(null)
  }, [activeTool])

  // Initialize Map
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      // Create map focused on Tashkent
      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: false,
      }).setView([41.311081, 69.240562], 12)

      // Add zoom control to bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current)

      // Add standard OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapRef.current)

      // Initialize groups
      markersGroupRef.current = L.layerGroup().addTo(mapRef.current)
      shapesGroupRef.current = L.layerGroup().addTo(mapRef.current)
      setMapReady(true)

      // Track mousemove for real-time coordinate display
      mapRef.current.on('mousemove', (e) => {
        setHoverCoords({ lat: e.latlng.lat, lng: e.latlng.lng })
      })

      // Click event
      mapRef.current.on('click', (e) => {
        const { lat, lng } = e.latlng

        // Handle tools depending on state
        setActiveTool((tool) => {
          if (tool === 'marker') {
            setPendingCoords({ lat, lng })
            // Drop a temporary orange helper marker
            if (tempMarkerRef.current && mapRef.current) {
              mapRef.current.removeLayer(tempMarkerRef.current)
            }
            tempMarkerRef.current = L.marker([lat, lng], {
              icon: createCustomIcon('#f97316'),
            }).addTo(mapRef.current)
          }

          else if (tool === 'coord') {
            const coordStr = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
            navigator.clipboard.writeText(coordStr)
            toast.success(`Koordinata nusxalandi: ${coordStr}`)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
          }

          else if (tool === 'distance') {
            setDistancePoints((prev) => {
              const newPoints = [...prev, { lat, lng }]

              // Update Polyline
              if (distancePolylineRef.current) {
                distancePolylineRef.current.setLatLngs(newPoints)
              } else {
                distancePolylineRef.current = L.polyline(newPoints, {
                  color: '#10b981',
                  weight: 4,
                }).addTo(mapRef.current)
              }

              // Calculate distance segments
              let total = 0
              for (let i = 0; i < newPoints.length - 1; i++) {
                const loc1 = L.latLng(newPoints[i].lat, newPoints[i].lng)
                const loc2 = L.latLng(newPoints[i + 1].lat, newPoints[i + 1].lng)
                total += loc1.distanceTo(loc2)
              }
              setTotalDistance(total)

              // Draw point marker
              const pointMarker = L.circleMarker([lat, lng], {
                radius: 6,
                fillColor: '#ffffff',
                color: '#10b981',
                weight: 3,
                fillOpacity: 1,
              })
                .addTo(mapRef.current)
                .bindTooltip(
                  newPoints.length === 1
                    ? 'Boshlanish'
                    : `${(total / 1000).toFixed(2)} km`,
                  { permanent: true, direction: 'top', className: 'bg-emerald-600 text-white rounded px-1 text-xs border-0 font-semibold shadow' }
                )

              distanceMarkersRef.current.push(pointMarker)
              return newPoints
            })
          }

          else if (tool === 'area') {
            setAreaPoints((prev) => {
              const newPoints = [...prev, { lat, lng }]

              // Update Polygon
              if (areaPolygonRef.current) {
                areaPolygonRef.current.setLatLngs(newPoints)
              } else {
                areaPolygonRef.current = L.polygon(newPoints, {
                  color: '#8b5cf6',
                  fillColor: '#8b5cf6',
                  fillOpacity: 0.2,
                  weight: 3,
                }).addTo(mapRef.current)
              }

              // Calculate area
              const computed = calculateSphericalArea(newPoints)
              setTotalArea(computed)

              // Draw point marker
              const ptMarker = L.circleMarker([lat, lng], {
                radius: 6,
                fillColor: '#ffffff',
                color: '#8b5cf6',
                weight: 3,
                fillOpacity: 1,
              }).addTo(mapRef.current)

              if (newPoints.length >= 3) {
                ptMarker.bindTooltip(
                  `${(computed >= 1000000 ? computed / 1000000 : computed).toFixed(1)} ${computed >= 1000000 ? 'km²' : 'm²'}`,
                  { permanent: true, direction: 'top', className: 'bg-purple-600 text-white rounded px-1 text-xs border-0 font-semibold shadow' }
                )
              } else {
                ptMarker.bindTooltip(`Nuqta ${newPoints.length}`, { permanent: true, direction: 'top' })
              }

              areaMarkersRef.current.push(ptMarker)
              return newPoints
            })
          }

          return tool
        })
      })
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [clearDistance, clearArea])

  // Load user-specific markers when map is ready or user switches
  useEffect(() => {
    if (!mapReady || !mapRef.current || !markersGroupRef.current) return

    markersGroupRef.current.clearLayers()

    let initialSaved = []
    if (currentUser?.savedMarkers && Array.isArray(currentUser.savedMarkers)) {
      initialSaved = currentUser.savedMarkers
    } else {
      const local = localStorage.getItem(`geogat_user_markers_${userKey}`)
      if (local) {
        try {
          initialSaved = JSON.parse(local)
        } catch (e) {
          console.error('Error parsing stored user markers:', e)
        }
      }
    }

    const loadedState = initialSaved.map((m) => {
      const leafletMarker = L.marker([m.lat, m.lng], {
        icon: createCustomIcon('#3b82f6'),
      }).addTo(markersGroupRef.current)

      leafletMarker.bindPopup(`
        <div class="text-sm font-sans min-w-[150px]">
          <h4 class="font-bold text-gray-900 mb-1">${m.name}</h4>
          <p class="text-xs text-gray-600 leading-snug mb-2">${m.notes || ''}</p>
          <div class="border-t border-gray-100 pt-1 text-[10px] text-gray-400">
            📍 ${Number(m.lat).toFixed(6)}, ${Number(m.lng).toFixed(6)}
          </div>
        </div>
      `)

      return {
        id: m.id || Date.now().toString(),
        name: m.name,
        notes: m.notes || '',
        lat: m.lat,
        lng: m.lng,
        layer: leafletMarker,
      }
    })

    setMarkersList(loadedState)
  }, [mapReady, userKey, currentUser?.savedMarkers])

  // Click handler for drawing shapes
  useEffect(() => {
    if (!mapRef.current) return

    const handleDrawClick = (e) => {
      if (activeTool !== 'shape') return
      const { lat, lng } = e.latlng

      if (drawType === 'circle') {
        const circle = L.circle([lat, lng], {
          radius: circleRadius,
          color: strokeColor,
          fillColor: fillColor,
          fillOpacity: fillOpacity,
          weight: 3,
        }).addTo(shapesGroupRef.current)

        const shapeObj = {
          id: Date.now().toString(),
          type: 'Circle',
          center: [lat, lng],
          radius: circleRadius,
          layer: circle,
          color: strokeColor,
        }

        circle.bindPopup(`
          <div class="text-sm font-sans">
            <p class="font-bold text-gray-900">Doira (Circle)</p>
            <p class="text-xs text-gray-600 mt-1">Markaz: ${lat.toFixed(5)}, ${lng.toFixed(5)}</p>
            <p class="text-xs text-gray-600">Radius: ${circleRadius} m</p>
            <p class="text-xs text-gray-600">Maydon: ${(Math.PI * circleRadius * circleRadius / 10000).toFixed(2)} gektar</p>
          </div>
        `)

        setDrawnShapes((prev) => [...prev, shapeObj])
        toast.success('Doira chizildi!')
      }

      else if (drawType === 'rectangle') {
        // Draw a rectangle with latlng as center or offset
        const latOffset = 0.005
        const lngOffset = 0.007
        const bounds = [
          [lat - latOffset, lng - lngOffset],
          [lat + latOffset, lng + lngOffset],
        ]

        const rect = L.rectangle(bounds, {
          color: strokeColor,
          fillColor: fillColor,
          fillOpacity: fillOpacity,
          weight: 3,
        }).addTo(shapesGroupRef.current)

        // Calculate planar bounding box area approx
        const p1 = L.latLng(bounds[0][0], bounds[0][1])
        const p2 = L.latLng(bounds[1][0], bounds[0][1])
        const p3 = L.latLng(bounds[0][0], bounds[1][1])
        const width = p1.distanceTo(p3)
        const height = p1.distanceTo(p2)
        const rectArea = width * height

        const shapeObj = {
          id: Date.now().toString(),
          type: 'Rectangle',
          bounds: bounds,
          dimensions: `${width.toFixed(0)}m x ${height.toFixed(0)}m`,
          area: rectArea,
          layer: rect,
          color: strokeColor,
        }

        rect.bindPopup(`
          <div class="text-sm font-sans">
            <p class="font-bold text-gray-900">To'rtburchak (Rectangle)</p>
            <p class="text-xs text-gray-600 mt-1">O'lchamlari: ${shapeObj.dimensions}</p>
            <p class="text-xs text-gray-600">Maydon: ${(rectArea / 10000).toFixed(2)} gektar</p>
          </div>
        `)

        setDrawnShapes((prev) => [...prev, shapeObj])
        toast.success("To'rtburchak chizildi!")
      }
    }

    mapRef.current.on('click', handleDrawClick)
    return () => {
      if (mapRef.current) {
        mapRef.current.off('click', handleDrawClick)
      }
    }
  }, [activeTool, drawType, circleRadius, strokeColor, fillColor, fillOpacity])

  // Save Marker per User
  const handleSaveMarker = async () => {
    if (!pendingCoords) return
    const name = markerName.trim() || `Marker #${markersList.length + 1}`
    const notes = markerNotes.trim() || 'Izoh yozilmagan'
    const markerId = Date.now().toString()

    const marker = L.marker([pendingCoords.lat, pendingCoords.lng], {
      icon: createCustomIcon('#3b82f6'),
    }).addTo(markersGroupRef.current)

    marker.bindPopup(`
      <div class="text-sm font-sans min-w-[150px]">
        <h4 class="font-bold text-gray-900 mb-1">${name}</h4>
        <p class="text-xs text-gray-600 leading-snug mb-2">${notes}</p>
        <div class="border-t border-gray-100 pt-1 text-[10px] text-gray-400">
          📍 ${pendingCoords.lat.toFixed(6)}, ${pendingCoords.lng.toFixed(6)}
        </div>
      </div>
    `)

    const newMarkerObj = {
      id: markerId,
      name,
      notes,
      lat: pendingCoords.lat,
      lng: pendingCoords.lng,
      layer: marker,
    }

    const updatedList = [...markersList, newMarkerObj]
    setMarkersList(updatedList)

    const serializableList = updatedList.map(({ id, name, notes, lat, lng }) => ({
      id, name, notes, lat, lng
    }))

    localStorage.setItem(`geogat_user_markers_${userKey}`, JSON.stringify(serializableList))

    if (currentUser) {
      try {
        await updateUser({ savedMarkers: serializableList })
      } catch (err) {
        console.warn('Could not sync user markers to profile:', err)
      }
    }

    toast.success(lang === 'uz' ? 'Marker foydalanuvchi hisobiga saqlandi!' : 'Marker saved to user profile!')

    // Clean temp helper
    if (tempMarkerRef.current && mapRef.current) {
      mapRef.current.removeLayer(tempMarkerRef.current)
      tempMarkerRef.current = null
    }
    setPendingCoords(null)
    setMarkerName('')
    setMarkerNotes('')
  }

  // Delete Marker per User
  const handleDeleteMarker = async (id, e) => {
    e.stopPropagation()
    const item = markersList.find((m) => m.id === id)
    if (item) {
      if (markersGroupRef.current && item.layer) {
        markersGroupRef.current.removeLayer(item.layer)
      }

      const updatedList = markersList.filter((m) => m.id !== id)
      setMarkersList(updatedList)

      const serializableList = updatedList.map(({ id, name, notes, lat, lng }) => ({
        id, name, notes, lat, lng
      }))

      localStorage.setItem(`geogat_user_markers_${userKey}`, JSON.stringify(serializableList))

      if (currentUser) {
        try {
          await updateUser({ savedMarkers: serializableList })
        } catch (err) {
          console.warn('Could not sync deleted marker to profile:', err)
        }
      }

      toast.success(lang === 'uz' ? "Marker o'chirildi" : "Marker deleted")
    }
  }

  // Clear All Markers per User
  const handleClearAllMarkers = async () => {
    if (markersList.length === 0) return

    if (markersGroupRef.current) {
      markersGroupRef.current.clearLayers()
    }

    setMarkersList([])
    localStorage.removeItem(`geogat_user_markers_${userKey}`)

    if (currentUser) {
      try {
        await updateUser({ savedMarkers: [] })
      } catch (err) {
        console.warn('Could not clear markers in profile:', err)
      }
    }

    toast.success(lang === 'uz' ? "Barcha markerlar o'chirildi" : "All markers cleared")
  }

  // Focus Marker
  const handleFocusMarker = (marker) => {
    if (mapRef.current) {
      mapRef.current.flyTo([marker.lat, marker.lng], 15, { duration: 1.5 })
      marker.layer.openPopup()
    }
  }

  // Delete Shape
  const handleDeleteShape = (id) => {
    const item = drawnShapes.find((s) => s.id === id)
    if (item) {
      shapesGroupRef.current.removeLayer(item.layer)
      setDrawnShapes((prev) => prev.filter((s) => s.id !== id))
      toast.success('Shakl o\'chirildi')
    }
  }

  // Clear all shapes
  const handleClearAllShapes = () => {
    shapesGroupRef.current.clearLayers()
    setDrawnShapes([])
    toast.success('Barcha shakllar tozalandi')
  }

  return (
    <div className="relative w-full h-full bg-gray-100 dark:bg-gray-950">
      
      {/* 1. Leaflet Map Div (Base Backdrop Layer) */}
      <div ref={mapContainerRef} className="w-full h-full absolute inset-0 z-0" />

      {/* 2. Floating Coordinates telemetry block at Top Center */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/95 dark:bg-gray-800/95 backdrop-blur shadow-xl border border-gray-200/50 dark:border-gray-700/50 px-4 py-2.5 rounded-2xl flex items-center gap-2.5 text-xs font-mono select-none">
        <Navigation size={14} className="text-primary-500 animate-spin" style={{ animationDuration: '4s' }} />
        <div className="flex gap-3">
          {hoverCoords ? (
            <>
              <span className="text-gray-700 dark:text-gray-300">
                <span className="text-gray-400">LAT:</span> {hoverCoords.lat.toFixed(6)}°
              </span>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <span className="text-gray-700 dark:text-gray-300">
                <span className="text-gray-400">LNG:</span> {hoverCoords.lng.toFixed(6)}°
              </span>
            </>
          ) : (
            <span className="text-gray-400 dark:text-gray-500">Kursor xarita ustida emas</span>
          )}
        </div>
      </div>

      {/* 3. Floating Left Controls Panel */}
      <div
        className={clsx(
          "absolute top-4 left-4 z-[1000] w-[340px] sm:w-[380px] flex flex-col bg-white/95 dark:bg-gray-800/95 backdrop-blur shadow-2xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl overflow-hidden transition-all duration-300 max-h-[calc(100%-32px)]",
          showControls ? "translate-x-0 opacity-100" : "-translate-x-[420px] opacity-0 pointer-events-none"
        )}
      >
        {/* Title bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50/70 dark:bg-gray-900/40 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-primary-600 rounded flex items-center justify-center">
              <Settings size={12} className="text-white" />
            </div>
            <span className="font-bold text-sm text-gray-900 dark:text-white">{lang === 'uz' ? 'Interaktiv GAT asboblari' : 'Interactive GIS Tools'}</span>
          </div>
          <button
            onClick={() => setShowControls(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Tools Selector Icon grid */}
        <div className="p-3.5 grid grid-cols-5 gap-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50/20 dark:bg-gray-900/10">
          {[
            { id: 'marker', icon: MapPin, label: 'Marker' },
            { id: 'coord', icon: Navigation, label: 'Nusxa' },
            { id: 'distance', icon: Ruler, label: 'Masofa' },
            { id: 'area', icon: Square, label: 'Maydon' },
            { id: 'shape', icon: Palette, label: 'Shakl' },
          ].map((tool) => {
            const Icon = tool.icon
            const active = activeTool === tool.id
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-center transition-all ${
                  active
                    ? 'bg-primary-500 border-primary-500 text-white shadow-md shadow-primary-500/20'
                    : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-200 dark:hover:border-gray-600 hover:text-gray-700'
                }`}
                title={tool.label}
              >
                <Icon size={16} className={active ? 'scale-110' : ''} />
                <span className="text-[9px] mt-1 font-medium leading-none">{tool.label}</span>
              </button>
            )
          })}
        </div>

        {/* Scrollable Tool controls body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* A. MARKER TOOL PANEL */}
          {activeTool === 'marker' && (
            <div className="space-y-4">
              {currentUser ? (
                <div className="p-2.5 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                    <span className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                      {currentUser.name || currentUser.email}
                    </span>
                  </div>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold bg-white dark:bg-gray-800 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-900/40 flex-shrink-0">
                    {lang === 'uz' ? 'Profilga saqlanadi' : 'User Storage'}
                  </span>
                </div>
              ) : (
                <div className="p-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-xl text-[11px] text-amber-700 dark:text-amber-400">
                  ⚠️ {lang === 'uz' ? "Mehmon rejimi (Markerlar brauzer xotirasiga saqlanadi)" : "Guest mode (Saved in browser storage)"}
                </div>
              )}

              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-900/30 text-[11px] leading-relaxed text-blue-700 dark:text-blue-400">
                💡 <strong>Marker qo'yish:</strong> Xarita yuzasiga bosing, so'ngra quyida marker ma'lumotlarini to'ldirib <em>"Marker Saqlash"</em> tugmasini bosing.
              </div>

              {pendingCoords ? (
                <div className="p-3.5 bg-gray-50 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-700 rounded-xl space-y-3">
                  <div className="text-[11px] text-gray-500 flex justify-between">
                    <span>Tanlangan koordinata:</span>
                    <span className="font-mono font-semibold text-gray-700 dark:text-gray-300">
                      {pendingCoords.lat.toFixed(5)}, {pendingCoords.lng.toFixed(5)}
                    </span>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 block mb-1">Nomi</label>
                    <input
                      type="text"
                      value={markerName}
                      onChange={(e) => setMarkerName(e.target.value)}
                      placeholder="Masalan: 1-o'lchov nuqtasi"
                      className="w-full text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 focus:ring-1 focus:ring-primary-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 block mb-1">Izoh / Qaydlar</label>
                    <textarea
                      value={markerNotes}
                      onChange={(e) => setMarkerNotes(e.target.value)}
                      placeholder="Mavze tavsifi..."
                      rows={2}
                      className="w-full text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 focus:ring-1 focus:ring-primary-500 focus:outline-none resize-none"
                    />
                  </div>
                  <button
                    onClick={handleSaveMarker}
                    className="w-full btn-primary py-2 text-xs font-semibold rounded-lg"
                  >
                    Marker Saqlash
                  </button>
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-gray-400">
                  📍 Xaritani bosing va nuqta tanlang
                </div>
              )}

              {/* Placed Markers List */}
              {markersList.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      Saqlangan markerlar ({markersList.length})
                    </h4>
                    <button
                      onClick={handleClearAllMarkers}
                      className="text-[10px] text-red-500 hover:underline font-semibold"
                    >
                      {lang === 'uz' ? "Barchasini o'chirish" : "Clear all"}
                    </button>
                  </div>
                  <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-40 overflow-y-auto border border-gray-100 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-850">
                    {markersList.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => handleFocusMarker(m)}
                        className="p-2.5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-905/20 cursor-pointer text-xs transition-colors"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">{m.name}</p>
                          <p className="text-[10px] text-gray-400 truncate">{m.notes}</p>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className="font-mono text-[9px] text-gray-400 bg-gray-100 dark:bg-gray-900 px-1 py-0.5 rounded">
                            {m.lat.toFixed(4)},{m.lng.toFixed(4)}
                          </span>
                          <button
                            onClick={(e) => handleDeleteMarker(m.id, e)}
                            className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition-colors"
                            title="O'chirish"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* B. COORDINATES COPY PANEL */}
          {activeTool === 'coord' && (
            <div className="space-y-4">
              <div className="bg-primary-50 dark:bg-primary-900/20 p-3 rounded-xl border border-primary-100 dark:border-primary-900/30 text-[11px] leading-relaxed text-primary-700 dark:text-primary-400">
                🧭 <strong>Koordinata olish:</strong> Kursorni xarita ustida harakatlantiring. Istalgan nuqtani bossangiz, koordinata nusxalanadi.
              </div>

              {/* Real-time Hover coordinates */}
              <div className="p-4 bg-gray-50 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-700 rounded-xl space-y-3">
                <p className="text-xs font-semibold text-gray-500">Kursordagi joriy koordinata:</p>
                {hoverCoords ? (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">Kenglik (Latitude):</span>
                      <span className="font-mono font-bold text-gray-800 dark:text-gray-200">{hoverCoords.lat.toFixed(7)}° N</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">Uzunlik (Longitude):</span>
                      <span className="font-mono font-bold text-gray-800 dark:text-gray-200">{hoverCoords.lng.toFixed(7)}° E</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-gray-400 italic">Kursor xaritadan tashqarida</div>
                )}
              </div>

              <div className="p-4 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-center text-xs text-gray-400 space-y-2">
                <Navigation size={18} className="mx-auto text-primary-500 animate-pulse" />
                <p>Nusxalash uchun istalgan nuqtani bosing</p>
              </div>
            </div>
          )}

          {/* C. DISTANCE MEASUREMENT PANEL */}
          {activeTool === 'distance' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/30 text-[11px] leading-relaxed text-emerald-700 dark:text-emerald-400">
                📏 <strong>Masofa o'lchash:</strong> Xaritada ketma-ket nuqtalarni belgilang. Tizim nuqtalar orasidagi geodezik masofani hisoblab beradi.
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-700 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Jami nuqtalar:</span>
                  <span className="text-sm font-bold text-gray-800 dark:text-white">{distancePoints.length} ta</span>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-700 pt-3 flex justify-between items-end">
                  <span className="text-xs text-gray-500">Jami masofa:</span>
                  <div className="text-right">
                    <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 leading-none">
                      {(totalDistance / 1000).toFixed(3)} km
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {totalDistance.toFixed(1)} metr
                    </p>
                  </div>
                </div>
              </div>

              {distancePoints.length > 0 && (
                <button
                  onClick={clearDistance}
                  className="w-full flex items-center justify-center gap-1.5 py-2 border border-red-200 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs font-semibold rounded-lg transition-colors"
                >
                  <Trash2 size={13} />
                  O'lchovlarni o'chirish
                </button>
              )}
            </div>
          )}

          {/* D. AREA CALCULATION PANEL */}
          {activeTool === 'area' && (
            <div className="space-y-4">
              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-xl border border-purple-100 dark:border-purple-900/30 text-[11px] leading-relaxed text-purple-700 dark:text-purple-400">
                📐 <strong>Maydon hisoblash:</strong> Xaritada kamida 3 ta nuqtani belgilab ko'pburchak hosil qiling. Tizim uning maydonini hisoblaydi.
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-700 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Burchaklar soni:</span>
                  <span className="text-sm font-bold text-gray-800 dark:text-white">{areaPoints.length} ta</span>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-700 pt-3 flex justify-between items-end">
                  <span className="text-xs text-gray-500">Hisoblangan maydon:</span>
                  <div className="text-right">
                    <p className="text-xl font-extrabold text-purple-600 dark:text-purple-400 leading-none">
                      {(totalArea / 10000).toFixed(3)} ha
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {totalArea >= 1000000 ? `${(totalArea / 1000000).toFixed(3)} km²` : `${totalArea.toFixed(1)} m²`}
                    </p>
                  </div>
                </div>
              </div>

              {areaPoints.length > 0 && (
                <button
                  onClick={clearArea}
                  className="w-full flex items-center justify-center gap-1.5 py-2 border border-red-200 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs font-semibold rounded-lg transition-colors"
                >
                  <Trash2 size={13} />
                  Ko'pburchakni tozalash
                </button>
              )}
            </div>
          )}

          {/* E. SHAPE DRAWING PANEL */}
          {activeTool === 'shape' && (
            <div className="space-y-4">
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900/30 text-[11px] leading-relaxed text-red-700 dark:text-red-400">
                🎨 <strong>Shakl chizish:</strong> Quyida shakl turini va ranglarini tanlang. Keyin xaritaga bosib shaklni yarating.
              </div>

              <div className="space-y-3 p-3.5 bg-gray-50 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-700 rounded-xl">
                {/* Shape Type Selector */}
                <div>
                  <label className="text-[10px] font-bold text-gray-500 block mb-1">SHAKL TURI</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDrawType('circle')}
                      className={`flex-1 py-1 text-xs rounded-lg border font-semibold transition-all ${
                        drawType === 'circle'
                          ? 'bg-red-500 border-red-500 text-white shadow-sm'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      Doira
                    </button>
                    <button
                      onClick={() => setDrawType('rectangle')}
                      className={`flex-1 py-1 text-xs rounded-lg border font-semibold transition-all ${
                        drawType === 'rectangle'
                          ? 'bg-red-500 border-red-500 text-white shadow-sm'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      To'rtburchak
                    </button>
                  </div>
                </div>

                {/* Radius Input (Circle only) */}
                {drawType === 'circle' && (
                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-1">
                      <span>DOIRA RADIUSI:</span>
                      <span className="font-mono text-gray-800 dark:text-gray-300">{circleRadius} m</span>
                    </div>
                    <input
                      type="range"
                      min={100}
                      max={5000}
                      step={100}
                      value={circleRadius}
                      onChange={(e) => setCircleRadius(Number(e.target.value))}
                      className="w-full accent-red-500"
                    />
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        placeholder="Radius (m)"
                        value={circleRadius || ''}
                        onChange={(e) => setCircleRadius(Math.max(1, Number(e.target.value)))}
                        className="w-full px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-semibold bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none"
                      />
                      <span className="text-xs font-semibold text-gray-400">m</span>
                    </div>
                  </div>
                )}

                {/* Color pickers */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] text-gray-500 font-bold mb-1">CHIZIQ RANGI</label>
                    <input
                      type="color"
                      value={strokeColor}
                      onChange={(e) => setStrokeColor(e.target.value)}
                      className="w-full h-8 rounded border border-gray-200 dark:border-gray-700 p-0.5 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 font-bold mb-1">TO'LDIRISH RANGI</label>
                    <input
                      type="color"
                      value={fillColor}
                      onChange={(e) => setFillColor(e.target.value)}
                      className="w-full h-8 rounded border border-gray-200 dark:border-gray-700 p-0.5 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Drawn Shapes list */}
              {drawnShapes.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      Chizilgan shakllar ({drawnShapes.length})
                    </h4>
                    <button
                      onClick={handleClearAllShapes}
                      className="text-[10px] text-red-500 hover:underline"
                    >
                      Tozalash
                    </button>
                  </div>
                  <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-40 overflow-y-auto border border-gray-100 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800">
                    {drawnShapes.map((s) => (
                      <div
                        key={s.id}
                        className="p-2.5 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: s.color }}
                          />
                          <div>
                            <p className="font-semibold text-gray-800 dark:text-gray-200">{s.type}</p>
                            <p className="text-[10px] text-gray-400">
                              {s.type === 'Circle' ? `R = ${s.radius}m` : s.dimensions}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteShape(s.id)}
                          className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Real-time status / zoom helper */}
        <div className="p-3 bg-gray-50 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-700 text-[10px] text-gray-400 flex justify-between select-none">
          <span>Leaflet GIS Engine</span>
          <span className="font-mono">WGS 84</span>
        </div>
      </div>

      {/* 4. Left Panel Collapsed Floating Trigger (shows when controls is hidden) */}
      {!showControls && (
        <button
          onClick={() => setShowControls(true)}
          className="absolute top-4 left-4 z-[1000] p-3 rounded-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-2xl border border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-95"
          title="Asboblarni ko'rsatish"
        >
          <Menu size={18} />
        </button>
      )}

      {/* 5. Floating Right Info Panel */}
      <div
        className={clsx(
          "absolute top-4 right-4 z-[1000] w-[280px] sm:w-[320px] flex flex-col bg-white/95 dark:bg-gray-800/95 backdrop-blur shadow-2xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-4 overflow-hidden transition-all duration-300 max-h-[calc(100%-32px)]",
          showGuide ? "translate-x-0 opacity-100" : "translate-x-[360px] opacity-0 pointer-events-none"
        )}
      >
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3 mb-4 select-none">
          <div className="flex items-center gap-2">
            <InfoIcon size={18} className="text-primary-500" />
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">{lang === 'uz' ? "GAT O'quv qo'llanmasi" : 'GIS Tutorial'}</h3>
          </div>
          <button
            onClick={() => setShowGuide(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Selector tabs inside guide */}
        <div className="flex border-b border-gray-100 dark:border-gray-700 mb-3 text-xs select-none">
          <button
            onClick={() => setActiveGuideTab('dist')}
            className={`flex-1 pb-2 font-medium border-b-2 transition-all ${
              activeGuideTab === 'dist' ? 'border-primary-500 text-primary-500 font-bold' : 'border-transparent text-gray-400'
            }`}
          >
            Masofa
          </button>
          <button
            onClick={() => setActiveGuideTab('area')}
            className={`flex-1 pb-2 font-medium border-b-2 transition-all ${
              activeGuideTab === 'area' ? 'border-primary-500 text-primary-500 font-bold' : 'border-transparent text-gray-400'
            }`}
          >
            Maydon
          </button>
          <button
            onClick={() => setActiveGuideTab('proj')}
            className={`flex-1 pb-2 font-medium border-b-2 transition-all ${
              activeGuideTab === 'proj' ? 'border-primary-500 text-primary-500 font-bold' : 'border-transparent text-gray-400'
            }`}
          >
            WGS84
          </button>
        </div>

        {/* Scrollable instructions text */}
        <div className="flex-1 overflow-y-auto text-xs text-gray-600 dark:text-gray-400 leading-relaxed space-y-3 pr-1">
          {activeGuideTab === 'dist' && (
            <>
              <p className="font-bold text-gray-800 dark:text-gray-200">Masofani qanday o'lchaymiz?</p>
              <p>Yer yuzi egri bo'lganligi sababli, ikki nuqta orasidagi masofa oddiy tekislikdagi Evklid formulasi orqali topilmaydi.</p>
              <div className="bg-gray-50 dark:bg-gray-900/60 p-2.5 rounded-xl font-mono text-[9px] border border-gray-100 dark:border-gray-700 text-center select-all">
                d = 2R · arcsin(√(sin²(Δφ/2) + cos(φ₁)·cos(φ₂)·sin²(Δλ/2)))
              </div>
              <p>Bu <strong>Haversine formulasi</strong> deb atalib, sferik koordinatalar yordamida ortodromiya (katta doira yoyi) masofasini hisoblab beradi. Leaflet bu hisoblashlarni avtomatik bajaradi.</p>
            </>
          )}

          {activeGuideTab === 'area' && (
            <>
              <p className="font-bold text-gray-800 dark:text-gray-200">Sferik maydonni hisoblash</p>
              <p>Tekislikdagi oddiy <strong>Shoelace (Ip bog'ich)</strong> algoritmi yirik hududlar uchun sezilarli xatolar beradi. Biz sferik ko'pburchak maydoni formulasidan foydalanamiz:</p>
              <p>Ushbu algoritm har bir segmentning meridian burchagi integralini hisoblash orqali Yer egriligini inobatga oladi va maydonni gektarlarda ko'rsatadi.</p>
              <div className="bg-emerald-50 dark:bg-emerald-900/10 p-2.5 text-emerald-700 dark:text-emerald-400 rounded-xl text-[10px] leading-tight">
                <strong>O'lchov birliklari:</strong><br />
                • 1 gektar (ha) = 10,000 m²<br />
                • 1 km² = 100 gektar
              </div>
            </>
          )}

          {activeGuideTab === 'proj' && (
            <>
              <p className="font-bold text-gray-800 dark:text-gray-200">WGS 84 va Geodeziya</p>
              <p>Xaritadagi barcha koordinatalar <strong>WGS 84 (World Geodetic System 1984)</strong> standarti bo'yicha berilgan.</p>
              <p>Kenglik (Latitude) ekvatordan shimol/janubga gradusda (-90° dan +90°), uzunlik (Longitude) esa Grinvich meridianidan sharq/g'arbga (-180° dan +180°) o'lchanadi.</p>
              <p className="italic text-gray-400">Masalan: Toshkent shahar markazi 41.311° N kenglik va 69.240° E uzunlikda joylashgan.</p>
            </>
          )}
        </div>
      </div>

      {/* 6. Floating Right Info Panel Trigger (shows when guide is hidden) */}
      {!showGuide && (
        <button
          onClick={() => setShowGuide(true)}
          className="absolute top-4 right-4 z-[1000] p-3 rounded-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-2xl border border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-95 flex items-center gap-1.5 font-semibold text-xs"
          title="Qo'llanmani ko'rsatish"
        >
          <BookOpen size={15} />
          <span>Qo'llanma</span>
        </button>
      )}

    </div>
  )
}
