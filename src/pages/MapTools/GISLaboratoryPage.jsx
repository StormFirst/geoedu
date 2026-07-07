import { useEffect, useRef, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  MapPin, Ruler, Square, Trash2, Save, History, PlusCircle,
  Map as MapIcon, Layers, ChevronRight, Navigation, Beaker, HelpCircle,
  Database, RefreshCw, Eye, X
} from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import { useAuth } from '../../context/AuthContext'
import { db, isDemoMode } from '../../firebase/config'
import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp, deleteDoc, doc } from 'firebase/firestore'

// Earth radius in meters
const EARTH_RADIUS = 6378137.0

// Helper: Calculate spherical polygon area
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

// Custom DivIcons for drawings
const createPointIcon = (color = '#3b82f6') => {
  return L.divIcon({
    html: `
      <div style="display: flex; align-items: center; justify-content: center; width: 24px; height: 24px;">
        <div style="width: 14px; height: 14px; background-color: ${color}; border: 2px solid white; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3); font-weight: bold; font-size: 8px;"></div>
      </div>
    `,
    className: 'gis-point-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
}

export default function GISLaboratoryPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language || 'uz'
  const { currentUser } = useAuth()

  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)

  // Parse assignment parameter from URL
  const [assignmentId, setAssignmentId] = useState(null)
  const [sessionDrawings, setSessionDrawings] = useState({
    point: false,
    line: false,
    polygon: false
  })

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setAssignmentId(params.get('assignmentId'))
  }, [])

  // Active Tool state: 'point', 'line', 'polygon', 'inspect'
  const [activeTool, setActiveTool] = useState('point')
  const [activeTab, setActiveTab] = useState('new-lab') // 'new-lab', 'history'

  // Geometry coordinates state
  const [drawnPoints, setDrawnPoints] = useState([])
  const [computedMetric, setComputedMetric] = useState({ label: '', value: '' })

  // Lab form metadata
  const [labTitle, setLabTitle] = useState('')
  const [labDescription, setLabDescription] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // History list
  const [historyList, setHistoryList] = useState([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null)

  // Live buffer state for history viewer
  const [bufferDistance, setBufferDistance] = useState(0)

  // Leaflet references
  const currentDrawLayerRef = useRef(null)
  const previewMarkersRef = useRef([])
  const historyRenderLayerRef = useRef(null)
  const historyBufferLayerRef = useRef(null)

  // Fetch History from DB or LocalStorage
  const fetchHistory = useCallback(async () => {
    if (!currentUser) return
    setIsLoadingHistory(true)
    try {
      if (!isDemoMode && db) {
        const q = query(
          collection(db, 'gis_labs'),
          where('uid', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        )
        const snap = await getDocs(q)
        const items = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate()?.toISOString() || new Date().toISOString()
        }))
        setHistoryList(items)
      } else {
        // LocalStorage fallback
        const local = localStorage.getItem(`geoedu_local_labs_${currentUser.uid}`)
        if (local) {
          setHistoryList(JSON.parse(local))
        } else {
          setHistoryList([])
        }
      }
    } catch (err) {
      console.error('Error fetching lab history:', err)
      // Fallback on error
      const local = localStorage.getItem(`geoedu_local_labs_${currentUser.uid}`)
      if (local) {
        setHistoryList(JSON.parse(local))
      }
    } finally {
      setIsLoadingHistory(false)
    }
  }, [currentUser])

  // Load history on mount
  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  // Clean active drawing layers from map
  const clearActiveDrawing = useCallback(() => {
    if (!mapRef.current) return

    // Remove polyline/polygon/marker
    if (currentDrawLayerRef.current) {
      mapRef.current.removeLayer(currentDrawLayerRef.current)
      currentDrawLayerRef.current = null
    }

    // Remove preview vertex markers
    previewMarkersRef.current.forEach((m) => mapRef.current.removeLayer(m))
    previewMarkersRef.current = []

    setDrawnPoints([])
    setComputedMetric({ label: '', value: '' })
  }, [])

  // Clear selected history preview
  const clearHistoryPreview = useCallback(() => {
    if (historyRenderLayerRef.current && mapRef.current) {
      mapRef.current.removeLayer(historyRenderLayerRef.current)
      historyRenderLayerRef.current = null
    }
    if (historyBufferLayerRef.current && mapRef.current) {
      mapRef.current.removeLayer(historyBufferLayerRef.current)
      historyBufferLayerRef.current = null
    }
    setSelectedHistoryItem(null)
    setBufferDistance(0)
  }, [])

  // Initialize Map
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      // Focused on Tashkent center
      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: false,
      }).setView([41.311081, 69.240562], 12)

      L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapRef.current)

      // Map Click Event
      mapRef.current.on('click', (e) => {
        const { lat, lng } = e.latlng

        // We only allow drawing if the student is in 'new-lab' tab and has a tool active
        setActiveTab((currTab) => {
          if (currTab !== 'new-lab') return currTab

          setActiveTool((tool) => {
            if (tool === 'point') {
              setDrawnPoints([{ lat, lng }])
              setComputedMetric({
                label: lang === 'uz' ? 'Koordinata' : 'Coordinate',
                value: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
              })
            } else if (tool === 'line') {
              setDrawnPoints((prev) => {
                const next = [...prev, { lat, lng }]
                // Calculate distance
                let dist = 0
                for (let i = 0; i < next.length - 1; i++) {
                  const l1 = L.latLng(next[i].lat, next[i].lng)
                  const l2 = L.latLng(next[i + 1].lat, next[i + 1].lng)
                  dist += l1.distanceTo(l2)
                }
                setComputedMetric({
                  label: lang === 'uz' ? 'Masofa' : 'Distance',
                  value: dist >= 1000 ? `${(dist / 1000).toFixed(3)} km` : `${dist.toFixed(1)} m`
                })
                return next
              })
            } else if (tool === 'polygon') {
              setDrawnPoints((prev) => {
                const next = [...prev, { lat, lng }]
                // Calculate area
                const area = calculateSphericalArea(next)
                setComputedMetric({
                  label: lang === 'uz' ? 'Maydon' : 'Area',
                  value: area >= 1000000 ? `${(area / 1000000).toFixed(3)} km²` : area >= 10000 ? `${(area / 10000).toFixed(2)} ha` : `${area.toFixed(1)} m²`
                })
                return next
              })
            }
            return tool
          })

          // Clear history item selection if drawing new stuff
          clearHistoryPreview()

          return currTab
        })
      })
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [lang, clearHistoryPreview])

  // Redraw active geometry on state change
  useEffect(() => {
    if (!mapRef.current) return

    // Clean previous layers
    if (currentDrawLayerRef.current) {
      mapRef.current.removeLayer(currentDrawLayerRef.current)
      currentDrawLayerRef.current = null
    }
    previewMarkersRef.current.forEach((m) => mapRef.current.removeLayer(m))
    previewMarkersRef.current = []

    if (drawnPoints.length === 0) return

    const latlngs = drawnPoints.map((p) => [p.lat, p.lng])

    if (activeTool === 'point') {
      const marker = L.marker(latlngs[0], {
        icon: createPointIcon('#3b82f6')
      }).addTo(mapRef.current)

      marker.bindPopup(`
        <div class="text-xs font-semibold p-1">
          📍 ${drawnPoints[0].lat.toFixed(5)}, ${drawnPoints[0].lng.toFixed(5)}
        </div>
      `)

      currentDrawLayerRef.current = marker
    }

    else if (activeTool === 'line') {
      const polyline = L.polyline(latlngs, {
        color: '#10b981',
        weight: 4,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(mapRef.current)

      currentDrawLayerRef.current = polyline

      // Add vertex marker nodes
      drawnPoints.forEach((p, index) => {
        const m = L.circleMarker([p.lat, p.lng], {
          radius: 5,
          fillColor: '#ffffff',
          color: '#10b981',
          weight: 2,
          fillOpacity: 1
        })
          .addTo(mapRef.current)
          .bindTooltip(`#${index + 1}`, { permanent: false, direction: 'top' })

        previewMarkersRef.current.push(m)
      })
    }

    else if (activeTool === 'polygon') {
      const polygon = L.polygon(latlngs, {
        color: '#8b5cf6',
        fillColor: '#8b5cf6',
        fillOpacity: 0.25,
        weight: 3,
        lineJoin: 'round'
      }).addTo(mapRef.current)

      currentDrawLayerRef.current = polygon

      // Add vertex marker nodes
      drawnPoints.forEach((p, index) => {
        const m = L.circleMarker([p.lat, p.lng], {
          radius: 5,
          fillColor: '#ffffff',
          color: '#8b5cf6',
          weight: 2,
          fillOpacity: 1
        })
          .addTo(mapRef.current)
          .bindTooltip(`#${index + 1}`, { permanent: false, direction: 'top' })

        previewMarkersRef.current.push(m)
      })
    }
  }, [drawnPoints, activeTool])

  // Save Lab Submission
  const handleSaveLab = async (e) => {
    e.preventDefault()
    if (!currentUser) return
    if (drawnPoints.length === 0) {
      toast.error(lang === 'uz' ? 'Iltimos, avval xaritada ob\'ekt chizing!' : 'Please draw a feature on the map first!')
      return
    }
    if (!labTitle.trim()) {
      toast.error(lang === 'uz' ? 'Laboratoriya ishiga nom bering!' : 'Please name your laboratory work!')
      return
    }

    setIsSaving(true)
    const newLabDoc = {
      uid: currentUser.uid,
      userName: currentUser.name || 'Anonymous Student',
      title: labTitle.trim(),
      description: labDescription.trim(),
      type: activeTool,
      coordinates: drawnPoints,
      metricLabel: computedMetric.label,
      metricValue: computedMetric.value,
      createdAt: new Date().toISOString() // Fallback string representation
    }

    try {
      if (!isDemoMode && db) {
        await addDoc(collection(db, 'gis_labs'), {
          ...newLabDoc,
          createdAt: serverTimestamp() // Set real server timestamp
        })
        toast.success(lang === 'uz' ? 'Natija bazaga muvaffaqiyatli saqlandi!' : 'Results saved to database!')
      } else {
        // Save locally under users key
        const localKey = `geoedu_local_labs_${currentUser.uid}`
        const localData = localStorage.getItem(localKey)
        const parsed = localData ? JSON.parse(localData) : []
        const updated = [{ id: Date.now().toString(), ...newLabDoc }, ...parsed]
        localStorage.setItem(localKey, JSON.stringify(updated))
        toast.success(lang === 'uz' ? 'Natija mahalliy xotiraga saqlandi (Demo rejim)' : 'Saved to local storage (Demo Mode)')
      }

      // Reset states
      setLabTitle('')
      setLabDescription('')
      clearActiveDrawing()
      fetchHistory()
    } catch (err) {
      console.error('Error saving lab results:', err)
      toast.error(lang === 'uz' ? 'Xatolik yuz berdi' : 'An error occurred while saving')
    } finally {
      setIsSaving(false)
    }
  }

  // Delete History Item
  const handleDeleteHistoryItem = async (id, e) => {
    e.stopPropagation() // Prevent loading/focusing the item when clicking delete button
    if (!currentUser) return

    const confirmMsg = lang === 'uz' 
      ? "Ushbu laboratoriya natijasini o'chirmoqchimisiz?" 
      : "Are you sure you want to delete this laboratory result?"
    
    if (!window.confirm(confirmMsg)) return

    try {
      if (!isDemoMode && db) {
        // Delete from Firestore
        await deleteDoc(doc(db, 'gis_labs', id))
      } else {
        // Delete from LocalStorage
        const localKey = `geoedu_local_labs_${currentUser.uid}`
        const localData = localStorage.getItem(localKey)
        if (localData) {
          const parsed = JSON.parse(localData)
          const filtered = parsed.filter((item) => item.id !== id)
          localStorage.setItem(localKey, JSON.stringify(filtered))
        }
      }
      toast.success(lang === 'uz' ? "Natija muvaffaqiyatli o'chirildi!" : "Result deleted successfully!")
      
      // If the deleted item is currently selected/active on map, clear it
      if (selectedHistoryItem && selectedHistoryItem.id === id) {
        clearHistoryPreview()
      }
      
      fetchHistory()
    } catch (err) {
      console.error('Error deleting lab history item:', err)
      toast.error(lang === 'uz' ? "O'chirishda xatolik yuz berdi" : "Error occurred during deletion")
    }
  }

  // Load a Saved Lab from History list onto the Map (Replay)
  const handleLoadHistoryItem = (item) => {
    if (!mapRef.current) return

    clearActiveDrawing()
    clearHistoryPreview()

    setSelectedHistoryItem(item)

    const latlngs = item.coordinates.map((p) => [p.lat, p.lng])

    if (item.type === 'point') {
      const marker = L.marker(latlngs[0], {
        icon: createPointIcon('#ef4444')
      }).addTo(mapRef.current)

      marker.bindPopup(`
        <div class="text-xs p-1 space-y-1">
          <p class="font-bold text-gray-800">${item.title}</p>
          <p class="text-gray-500">${item.description || 'Izohsiz'}</p>
          <p class="font-mono text-[10px] text-primary-600 mt-1">📍 ${latlngs[0][0].toFixed(6)}, ${latlngs[0][1].toFixed(6)}</p>
        </div>
      `).openPopup()

      historyRenderLayerRef.current = marker
      mapRef.current.flyTo(latlngs[0], 14, { duration: 1.2 })
    }

    else if (item.type === 'line') {
      const polyline = L.polyline(latlngs, {
        color: '#f59e0b',
        weight: 5,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(mapRef.current)

      polyline.bindTooltip(`
        <div class="text-xs p-1 font-semibold">
          🏁 ${item.title}<br/>
          📏 ${item.metricValue}
        </div>
      `, { permanent: true, direction: 'center' })

      historyRenderLayerRef.current = polyline
      const bounds = polyline.getBounds()
      mapRef.current.fitBounds(bounds, { padding: [50, 50], duration: 1.2 })
    }

    else if (item.type === 'polygon') {
      const polygon = L.polygon(latlngs, {
        color: '#ec4899',
        fillColor: '#ec4899',
        fillOpacity: 0.3,
        weight: 4,
        lineJoin: 'round'
      }).addTo(mapRef.current)

      polygon.bindTooltip(`
        <div class="text-xs p-1 font-semibold">
          📐 ${item.title}<br/>
          🌍 ${item.metricValue}
        </div>
      `, { permanent: true, direction: 'center' })

      historyRenderLayerRef.current = polygon
      const bounds = polygon.getBounds()
      mapRef.current.fitBounds(bounds, { padding: [50, 50], duration: 1.2 })
    }
  }

  // Load saved item back into the active drawing editor
  const handleLoadToEditor = () => {
    if (!selectedHistoryItem) return
    clearActiveDrawing()
    setDrawnPoints(selectedHistoryItem.coordinates)
    setActiveTool(selectedHistoryItem.type)
    setComputedMetric({
      label: selectedHistoryItem.metricLabel,
      value: selectedHistoryItem.metricValue
    })
    setLabTitle(selectedHistoryItem.title)
    setLabDescription(selectedHistoryItem.description || '')
    setActiveTab('new-lab')
    toast.success(lang === 'uz' ? 'Ob\'ekt tahrirlash paneliga yuklandi!' : 'Object loaded into editor!')
    clearHistoryPreview()
  }

  // Copy standard GeoJSON structure to clipboard
  const handleCopyGeoJSON = () => {
    if (!selectedHistoryItem) return
    const geomType = selectedHistoryItem.type === 'point' ? 'Point' : selectedHistoryItem.type === 'line' ? 'LineString' : 'Polygon'
    const coords = selectedHistoryItem.type === 'point'
      ? [selectedHistoryItem.coordinates[0].lng, selectedHistoryItem.coordinates[0].lat]
      : selectedHistoryItem.type === 'line'
      ? selectedHistoryItem.coordinates.map(c => [c.lng, c.lat])
      : [ [...selectedHistoryItem.coordinates.map(c => [c.lng, c.lat]), [selectedHistoryItem.coordinates[0].lng, selectedHistoryItem.coordinates[0].lat]] ]

    const geojson = {
      type: 'Feature',
      properties: {
        title: selectedHistoryItem.title,
        description: selectedHistoryItem.description,
        metricLabel: selectedHistoryItem.metricLabel,
        metricValue: selectedHistoryItem.metricValue,
        userName: selectedHistoryItem.userName,
        createdAt: selectedHistoryItem.createdAt
      },
      geometry: {
        type: geomType,
        coordinates: coords
      }
    }

    navigator.clipboard.writeText(JSON.stringify(geojson, null, 2))
    toast.success(lang === 'uz' ? 'GeoJSON ma\'lumoti nusxalandi!' : 'GeoJSON copied to clipboard!')
  }

  // Apply visual buffer circles at vertices
  const handleApplyBuffer = (distance) => {
    setBufferDistance(distance)
    if (!selectedHistoryItem || !mapRef.current) return

    // Remove existing buffer layers
    if (historyBufferLayerRef.current) {
      mapRef.current.removeLayer(historyBufferLayerRef.current)
      historyBufferLayerRef.current = null
    }

    if (distance === 0) return

    const bufferGroup = L.layerGroup()

    selectedHistoryItem.coordinates.forEach((pt) => {
      L.circle([pt.lat, pt.lng], {
        radius: distance,
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.12,
        weight: 1.5,
        dashArray: '3,4'
      }).addTo(bufferGroup)
    })

    bufferGroup.addTo(mapRef.current)
    historyBufferLayerRef.current = bufferGroup
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-80px)] w-full overflow-hidden">
      {/* LEFT SIDEBAR (TOOLS & HISTORY) */}
      <div className="w-full lg:w-[380px] xl:w-[420px] flex flex-col bg-white dark:bg-gray-800 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm overflow-hidden h-full flex-shrink-0">
        
        {/* Title bar */}
        <div className="px-6 py-4 border-b border-gray-150 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 select-none">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Beaker size={20} />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white text-base">GIS Laboratoriya</h2>
              <p className="text-[11px] text-gray-500">{lang === 'uz' ? 'Fazoviy tahlil va xaritalash' : 'Spatial analysis & mapping'}</p>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-gray-150 dark:border-gray-700 bg-gray-50/20 dark:bg-gray-900/10 select-none">
          <button
            onClick={() => { setActiveTab('new-lab'); clearHistoryPreview() }}
            className={clsx(
              'flex-1 py-3 text-xs font-semibold border-b-2 flex items-center justify-center gap-1.5 transition-all',
              activeTab === 'new-lab'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            )}
          >
            <PlusCircle size={14} />
            {lang === 'uz' ? 'Yangi Tajriba' : 'New Experiment'}
          </button>
          <button
            onClick={() => { setActiveTab('history'); clearActiveDrawing() }}
            className={clsx(
              'flex-1 py-3 text-xs font-semibold border-b-2 flex items-center justify-center gap-1.5 transition-all',
              activeTab === 'history'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            )}
          >
            <History size={14} />
            {lang === 'uz' ? 'Natijalar tarixi' : 'Saved Results'}
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-5">
          
          {/* TAB 1: NEW LAB CONFIGURATION */}
          {activeTab === 'new-lab' && (
            <div className="space-y-5">
              
              {/* Tool Selector */}
              <div>
                <label className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-2">
                  {lang === 'uz' ? 'Xaritalash usuli' : 'Mapping Tool'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'point', label: lang === 'uz' ? 'Nuqta' : 'Point', icon: MapPin },
                    { id: 'line', label: lang === 'uz' ? 'Chiziq' : 'Line', icon: Ruler },
                    { id: 'polygon', label: lang === 'uz' ? 'Poligon' : 'Polygon', icon: Square }
                  ].map((tool) => {
                    const Icon = tool.icon
                    const active = activeTool === tool.id
                    return (
                      <button
                        key={tool.id}
                        onClick={() => { setActiveTool(tool.id); clearActiveDrawing() }}
                        className={clsx(
                          'py-3.5 px-2 border rounded-xl flex flex-col items-center justify-center gap-1 text-center transition-all',
                          active
                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/10'
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-750 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700'
                        )}
                      >
                        <Icon size={18} className={active ? 'scale-110' : ''} />
                        <span className="text-[11px] font-bold leading-none mt-1.5">{tool.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Instructions Callout */}
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl text-[11px] text-emerald-800 dark:text-emerald-400 leading-relaxed">
                💡 {activeTool === 'point' && (lang === 'uz' ? "Nuqta joylashtirish: Xarita yuzasidagi istalgan joyga bir marta bosing. Koordinatalar avtomatik aniqlanadi." : "Place a point: Click anywhere on the map. Coordinates are fetched instantly.")}
                {activeTool === 'line' && (lang === 'uz' ? "Chiziq o'lchash: Xaritani ketma-ket bosib yo'nalish chizing. Tizim masofani metr yoki kilometrda hisoblab beradi." : "Measure distance: Click sequentially on the map to draw a path. Total length is computed in real-time.")}
                {activeTool === 'polygon' && (lang === 'uz' ? "Poligon yaratish: Kamida 3 ta nuqtani bosib burchaklar hosil qiling. Maydon o'lchami gektarlarda aniqlanadi." : "Create polygon: Place at least 3 points to outline a polygon. Area is calculated in hectares.")}
              </div>

              {/* Live Metric result dashboard */}
              <div className="p-4 bg-gray-50 dark:bg-gray-900/30 border border-gray-150 dark:border-gray-700 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    {lang === 'uz' ? 'Joriy o\'lchov' : 'Current Measure'}
                  </p>
                  <p className="text-sm font-semibold text-gray-850 dark:text-gray-300 mt-0.5">
                    {computedMetric.label || (lang === 'uz' ? "Hali chizilmadi" : "No geometry drawn")}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    {computedMetric.value || '0.0'}
                  </span>
                </div>
              </div>

              {/* Lab submission metadata form */}
              <form onSubmit={handleSaveLab} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-750 dark:text-gray-300 mb-1.5">
                    {lang === 'uz' ? 'Laboratoriya ishi nomi' : 'Experiment Title'}
                  </label>
                  <input
                    type="text"
                    value={labTitle}
                    onChange={(e) => setLabTitle(e.target.value)}
                    placeholder={lang === 'uz' ? "Masalan: Park konturi" : "e.g., Park boundary"}
                    className="input text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-750 dark:text-gray-300 mb-1.5">
                    {lang === 'uz' ? 'Tavsif / Izoh' : 'Description / Notes'}
                  </label>
                  <textarea
                    value={labDescription}
                    onChange={(e) => setLabDescription(e.target.value)}
                    placeholder={lang === 'uz' ? "Batafsil ma'lumotlar..." : "Write details about this GIS feature..."}
                    className="input text-xs resize-none"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 pt-2 select-none">
                  <button
                    type="button"
                    onClick={clearActiveDrawing}
                    className="flex-1 py-2 px-3 border border-red-200 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Trash2 size={14} />
                    {lang === 'uz' ? 'Tozalash' : 'Clear'}
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving || drawnPoints.length === 0}
                    className="flex-[2] btn-primary py-2 px-4 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                    {lang === 'uz' ? 'Bazaga saqlash' : 'Save to DB'}
                  </button>
                </div>
              </form>

            </div>
          )}

          {/* TAB 2: HISTORY LIST */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              
              {selectedHistoryItem && (
                <div className="p-4 bg-emerald-50/30 dark:bg-emerald-950/10 border border-emerald-500/20 rounded-xl space-y-4 shadow-sm select-none">
                  {/* Title and Close */}
                  <div className="flex justify-between items-start gap-3">
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-0.5">Faol Ob'ekt</span>
                      <h4 className="font-bold text-gray-900 dark:text-white text-xs truncate">{selectedHistoryItem.title}</h4>
                      <p className="text-[10px] text-gray-500 truncate mt-0.5">{selectedHistoryItem.description || 'Izohsiz'}</p>
                    </div>
                    <button
                      onClick={clearHistoryPreview}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {/* Actions Row */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold">
                    <button
                      onClick={handleLoadToEditor}
                      className="py-2 px-2 bg-white dark:bg-gray-850 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 border border-gray-200 dark:border-gray-700 hover:border-emerald-300 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center justify-center gap-1 transition-all"
                    >
                      <PlusCircle size={13} />
                      {lang === 'uz' ? 'Tahrirlashga yuklash' : 'Load to Editor'}
                    </button>
                    <button
                      onClick={handleCopyGeoJSON}
                      className="py-2 px-2 bg-white dark:bg-gray-850 hover:bg-primary-50 dark:hover:bg-primary-950/20 border border-gray-200 dark:border-gray-700 hover:border-primary-300 text-primary-600 dark:text-primary-400 rounded-lg flex items-center justify-center gap-1 transition-all"
                    >
                      <Save size={13} />
                      {lang === 'uz' ? 'GeoJSON nusxalash' : 'Copy GeoJSON'}
                    </button>
                  </div>

                  {/* Buffer analysis slider */}
                  <div className="border-t border-gray-150 dark:border-gray-700/60 pt-3">
                    <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-1">
                      <span>{lang === 'uz' ? 'BUFER TAHLILI' : 'BUFFER ANALYSIS'}</span>
                      <span className="font-mono text-emerald-600">{bufferDistance} m</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1200}
                      step={50}
                      value={bufferDistance}
                      onChange={(e) => handleApplyBuffer(Number(e.target.value))}
                      className="w-full accent-emerald-500"
                    />
                  </div>
                </div>
              )}

              {isLoadingHistory ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <RefreshCw size={24} className="animate-spin text-gray-400" />
                  <span className="text-xs text-gray-400">{lang === 'uz' ? 'Yuklanmoqda...' : 'Loading history...'}</span>
                </div>
              ) : historyList.length === 0 ? (
                <div className="text-center py-10 text-gray-400 space-y-2">
                  <Database size={32} className="mx-auto text-gray-300 dark:text-gray-700" />
                  <p className="text-xs">{lang === 'uz' ? "Hali saqlangan laboratoriya ishlari yo'q" : "No saved laboratory results found"}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {historyList.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleLoadHistoryItem(item)}
                      className={clsx(
                        'p-3.5 border rounded-xl cursor-pointer transition-all flex flex-col gap-1.5',
                        selectedHistoryItem?.id === item.id
                          ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10'
                          : 'bg-white dark:bg-gray-800 border-gray-150 dark:border-gray-750 hover:bg-gray-50 dark:hover:bg-gray-850'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[150px]">{item.title}</span>
                        <div className="flex items-center gap-2">
                          <span className={clsx(
                            'badge text-[9px] uppercase tracking-wider',
                            item.type === 'point' ? 'bg-blue-100 text-blue-700' : item.type === 'line' ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-100 text-purple-700'
                          )}>
                            {item.type === 'point' ? (lang === 'uz' ? 'Nuqta' : 'Point') : item.type === 'line' ? (lang === 'uz' ? 'Chiziq' : 'Line') : (lang === 'uz' ? 'Poligon' : 'Polygon')}
                          </span>
                          <button
                            onClick={(e) => handleDeleteHistoryItem(item.id, e)}
                            className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition-colors"
                            title={lang === 'uz' ? "O'chirish" : "Delete"}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <p className="text-[11px] text-gray-500 truncate">{item.description || (lang === 'uz' ? 'Izoh yozilmagan' : 'No description')}</p>

                      <div className="border-t border-gray-100 dark:border-gray-700 pt-2 flex items-center justify-between text-[10px] text-gray-400 font-mono">
                        <span>{item.createdAt.slice(0, 10)}</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{item.metricValue}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

        </div>

      </div>

      {/* RIGHT SIDE: LEAFLET MAP WORKSPACE */}
      <div className="flex-1 bg-gray-100 dark:bg-gray-950 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm overflow-hidden h-full relative">
        <div ref={mapContainerRef} className="w-full h-full z-0 absolute inset-0" />

        {/* Floating instruction helper on Map */}
        <div className="absolute top-4 left-4 z-[1000] bg-white/95 dark:bg-gray-800/95 backdrop-blur shadow-lg border border-gray-200/50 dark:border-gray-700/50 px-3.5 py-2.5 rounded-2xl flex items-center gap-2 select-none">
          <Layers size={14} className="text-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            {lang === 'uz' ? 'Koordinata tizimi: WGS 84' : 'Coordinate Reference: WGS 84'}
          </span>
        </div>

        {/* Floating assignment overlay for GIS-4 */}
        {assignmentId === 'gis-4' && (
          <div className="absolute top-16 left-4 z-[1000] w-64 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-4 rounded-2xl">
            <h5 className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5 mb-2">
              <Beaker size={14} className="text-primary-500" />
              <span>Amaliy Topshiriq: GIS-4</span>
            </h5>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">
              Xaritaga o'ting va ushbu 3 ta geometriya elementlarini chizib tasdiqlang:
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-gray-50/50 dark:bg-gray-900/10 border border-gray-100 dark:border-gray-750">
                <span className="text-gray-700 dark:text-gray-300">Nuqta (Point)</span>
                {sessionDrawings.point ? (
                  <span className="text-emerald-500 text-[10px] font-bold">Bajarildi</span>
                ) : (
                  <button
                    onClick={() => {
                      if (activeTool === 'point' && drawnPoints.length > 0) {
                        setSessionDrawings(prev => ({ ...prev, point: true }))
                        toast.success("Nuqta (Point) muvaffaqiyatli tekshirildi!")
                      } else {
                        toast.error("Iltimos, avval Point (Nuqta) asbobi bilan nuqta chizing!")
                      }
                    }}
                    className="py-1 px-2 bg-primary-50 hover:bg-primary-100 text-primary-600 dark:bg-primary-950/20 dark:text-primary-400 text-[10px] font-bold rounded"
                  >
                    Tekshirish
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-gray-50/50 dark:bg-gray-900/10 border border-gray-100 dark:border-gray-750">
                <span className="text-gray-700 dark:text-gray-300">Chiziq (Line)</span>
                {sessionDrawings.line ? (
                  <span className="text-emerald-500 text-[10px] font-bold">Bajarildi</span>
                ) : (
                  <button
                    onClick={() => {
                      if (activeTool === 'line' && drawnPoints.length > 0) {
                        setSessionDrawings(prev => ({ ...prev, line: true }))
                        toast.success("Chiziq (Line) muvaffaqiyatli tekshirildi!")
                      } else {
                        toast.error("Iltimos, avval Line (Chiziq) asbobi bilan yo'l chizing!")
                      }
                    }}
                    className="py-1 px-2 bg-primary-50 hover:bg-primary-100 text-primary-600 dark:bg-primary-950/20 dark:text-primary-400 text-[10px] font-bold rounded"
                  >
                    Tekshirish
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-gray-50/50 dark:bg-gray-900/10 border border-gray-100 dark:border-gray-750">
                <span className="text-gray-700 dark:text-gray-300">Poligon (Polygon)</span>
                {sessionDrawings.polygon ? (
                  <span className="text-emerald-500 text-[10px] font-bold">Bajarildi</span>
                ) : (
                  <button
                    onClick={() => {
                      if (activeTool === 'polygon' && drawnPoints.length > 0) {
                        setSessionDrawings(prev => ({ ...prev, polygon: true }))
                        toast.success("Poligon (Polygon) muvaffaqiyatli tekshirildi!")
                      } else {
                        toast.error("Iltimos, avval Polygon (Poligon) asbobi bilan maydon chizing!")
                      }
                    }}
                    className="py-1 px-2 bg-primary-50 hover:bg-primary-100 text-primary-600 dark:bg-primary-950/20 dark:text-primary-400 text-[10px] font-bold rounded"
                  >
                    Tekshirish
                  </button>
                )}
              </div>
            </div>

            {sessionDrawings.point && sessionDrawings.line && sessionDrawings.polygon && (
              <button
                onClick={() => {
                  localStorage.setItem(`completed_practical_gis-4`, 'true')
                  toast.success("Topshiriq muvaffaqiyatli topshirildi (100 ball)! 🎉")
                  window.location.href = "/subjects/gis/topics/gis-4"
                }}
                className="w-full mt-3 btn-primary py-2 text-xs font-bold rounded-xl justify-center"
              >
                Topshirish (Baho olish)
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
