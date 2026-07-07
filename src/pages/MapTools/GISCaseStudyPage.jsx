import { useEffect, useRef, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  Briefcase, Map as MapIcon, Play, RefreshCw, Layers, Check, X,
  Sliders, Info, Navigation, AlertCircle, Compass, HelpCircle, MapPin, Trash2, History, Save
} from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { useAuth } from '../../context/AuthContext'
import { db, isDemoMode } from '../../firebase/config'
import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore'

// Mock Data for Yo'llar (Road network nodes)
const ROAD_NODES = []

// Mock Data for Residential Blocks (Neighborhoods)
const NEIGHBORHOODS = [
  { id: 'N1', name: 'Sebzor dahasi', lat: 41.332, lng: 69.245, population: 15000 },
  { id: 'N2', name: 'Ganga mavzesi', lat: 41.324, lng: 69.252, population: 12000 },
  { id: 'N3', name: 'Oloy mavzesi', lat: 41.318, lng: 69.278, population: 8000 },
  { id: 'N4', name: 'Chilonzor-2', lat: 41.288, lng: 69.208, population: 22000 },
  { id: 'N5', name: 'Yunusobod-4', lat: 41.352, lng: 69.288, population: 18000 },
  { id: 'N6', name: 'Yunusobod-12', lat: 41.365, lng: 69.272, population: 14000 }
]

const LAND_CLASSES = [
  { name: 'O\'rmon / Yashil maydon', color: '#10b981' },
  { name: 'Urbanizatsiya (Bino/Yo\'l)', color: '#ef4444' },
  { name: 'Suv havzalari', color: '#3b82f6' },
  { name: 'Qishloq xo\'jaligi', color: '#eab308' }
]

export default function GISCaseStudyPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language || 'uz'
  const { currentUser } = useAuth()

  // Case Study Saved States & Modes
  const [sidebarMode, setSidebarMode] = useState('editor') // 'editor' or 'saved'
  const [savedCases, setSavedCases] = useState([])
  const [isLoadingSaved, setIsLoadingSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editingCaseId, setEditingCaseId] = useState(null)
  const [caseTitle, setCaseTitle] = useState('')
  const [caseDescription, setCaseDescription] = useState('')
  const [saveFormOpen, setSaveFormOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')

  // Refs for tracking loads
  const isResetAllowedRef = useRef(true)

  // Parse assignment from URL
  const [assignmentId, setAssignmentId] = useState(null)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const aid = params.get('assignmentId')
    setAssignmentId(aid)
    if (aid === 'gis-10') {
      setActiveProject('hospitals')
    } else if (aid === 'gis-12') {
      setActiveProject('schools')
    }
  }, [])

  // Current active project study: 'roads', 'schools', 'hospitals', 'land'
  const [activeProject, setActiveProject] = useState('roads')
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)

  // Sub-features states
  // 1. Road analysis states
  const [routeStart, setRouteStart] = useState('')
  const [routeEnd, setRouteEnd] = useState('')
  const [isRouting, setIsRouting] = useState(false)
  const [routingResult, setRoutingResult] = useState(null)
  const [customRoadNodes, setCustomRoadNodes] = useState([])
  const [customRoadSegments, setCustomRoadSegments] = useState([])
  const [roadTool, setRoadTool] = useState('select') // 'select' or 'addNode'

  // 2. School Placement States
  const [schoolTool, setSchoolTool] = useState('proposed') // 'proposed', 'existing', 'road', 'density'
  const [customSchoolPoint, setCustomSchoolPoint] = useState(null)
  const [existingSchools, setExistingSchools] = useState([])
  const [roadPoints, setRoadPoints] = useState([])
  const [densityCenters, setDensityCenters] = useState([])
  const [schoolChecklist, setSchoolChecklist] = useState({
    popDensity: false,
    schoolBuffer: false,
    roadAccess: false,
    evaluated: false
  })

  // 3. Hospital Coverage States
  const [hospitalTool, setHospitalTool] = useState('hospital') // 'hospital', 'neighborhood'
  const [customNeighborhoods, setCustomNeighborhoods] = useState([])
  const [customHospitals, setCustomHospitals] = useState([])
  const [coverageRadius, setCoverageRadius] = useState(1250) // in meters
  const [coverageStats, setCoverageStats] = useState({ covered: 0, underserved: 100 })

  // 4. Land Resources Grid cells
  const [customLandPlots, setCustomLandPlots] = useState([])
  const [landChartData, setLandChartData] = useState([])

  // Leaflet Layer References
  const layersGroupRef = useRef(null)

  // Calculate Land Cover distribution percentages based on customLandPlots
  useEffect(() => {
    if (customLandPlots.length === 0) {
      setLandChartData([])
      return
    }

    const counts = { '#10b981': 0, '#ef4444': 0, '#3b82f6': 0, '#eab308': 0 }
    customLandPlots.forEach((cell) => {
      counts[cell.cover] = (counts[cell.cover] || 0) + 1
    })

    const total = customLandPlots.length
    const formatted = LAND_CLASSES.map((lc) => {
      const cnt = counts[lc.color] || 0
      return {
        name: lc.name,
        value: total > 0 ? Math.round((cnt / total) * 100) : 0,
        color: lc.color
      }
    })
    setLandChartData(formatted)
  }, [customLandPlots])

  // Click handler when clicking nodes in Road Analysis mode
  const handleNodeClick = (nodeId) => {
    if (roadTool === 'addNode') return

    if (!routeStart) {
      setRouteStart(nodeId)
      toast.success(lang === 'uz' ? `Boshlanish nuqtasi ${nodeId} etib belgilandi!` : `Start node set to ${nodeId}!`)
    } else if (routeStart === nodeId) {
      setRouteStart('')
      toast(lang === 'uz' ? 'Boshlanish nuqtasi bekor qilindi' : 'Start node deselected')
    } else if (!routeEnd) {
      setRouteEnd(nodeId)
      toast.success(lang === 'uz' ? `Yakuniy nuqta ${nodeId} etib belgilandi!` : `Destination node set to ${nodeId}!`)
    } else if (routeEnd === nodeId) {
      setRouteEnd('')
      toast(lang === 'uz' ? 'Yakuniy nuqta bekor qilindi' : 'Destination node deselected')
    } else {
      setRouteEnd(nodeId)
      toast.success(lang === 'uz' ? `Yakuniy nuqta ${nodeId} etib belgilandi!` : `Destination node set to ${nodeId}!`)
    }
    setRoutingResult(null)
  }

  // Click handler to cycle cell cover types in Land cover mode
  const handleCellClick = (idx) => {
    setCustomLandPlots((prev) => {
      const next = [...prev]
      const colors = ['#10b981', '#ef4444', '#3b82f6', '#eab308']
      const currColorIdx = colors.indexOf(next[idx].cover)
      const nextColor = colors[(currColorIdx + 1) % colors.length]
      next[idx] = { ...next[idx], cover: nextColor }
      return next
    })
  }

  const handleClearRoadsAll = () => {
    setCustomRoadNodes([])
    setCustomRoadSegments([])
    setRouteStart('')
    setRouteEnd('')
    setRoutingResult(null)
    toast.success(lang === 'uz' ? 'Qo\'shilgan barcha chorraha va yo\'llar tozalandi!' : 'All custom road nodes and segments cleared!')
  }

  // Clear handlers
  const handleClearSchoolsAll = () => {
    setCustomSchoolPoint(null)
    setExistingSchools([])
    setRoadPoints([])
    setDensityCenters([])
    setSchoolChecklist({
      popDensity: false,
      schoolBuffer: false,
      roadAccess: false,
      evaluated: false
    })
    toast.success(lang === 'uz' ? 'Barcha maktab qatlamlari tozalandi!' : 'All school layers cleared!')
  }

  const handleClearHospitalsAll = () => {
    setCustomHospitals([])
    setCustomNeighborhoods([])
    setCoverageStats({ covered: 0, underserved: 100 })
    toast.success(lang === 'uz' ? 'Shifoxona va aholi punktlari tozalandi!' : 'Hospitals and neighborhoods cleared!')
  }

  const handleClearLandPlots = () => {
    setCustomLandPlots([])
    setLandChartData([])
    toast.success(lang === 'uz' ? 'Yer uchastkalari tozalandi!' : 'Land plots cleared!')
  }

  // Re-draw map layers based on active project and sub-states
  const renderMapLayers = useCallback(() => {
    if (!mapRef.current) return

    // Clean previous layers
    if (layersGroupRef.current) {
      mapRef.current.removeLayer(layersGroupRef.current)
    }
    layersGroupRef.current = L.layerGroup().addTo(mapRef.current)

    const group = layersGroupRef.current

    if (activeProject === 'roads') {
      // 1. Draw roads segments (default + custom)
      const roadSegments = [
        ...customRoadSegments
      ]

      const allNodes = [...ROAD_NODES, ...customRoadNodes]

      roadSegments.forEach(([n1, n2]) => {
        const node1 = allNodes.find(n => n.id === n1)
        const node2 = allNodes.find(n => n.id === n2)
        if (node1 && node2) {
          L.polyline([[node1.lat, node1.lng], [node2.lat, node2.lng]], {
            color: '#9ca3af',
            weight: 3,
            opacity: 0.6
          }).addTo(group)
        }
      })

      // 2. Draw node markers (default + custom)
      allNodes.forEach((node) => {
        L.circleMarker([node.lat, node.lng], {
          radius: 9,
          fillColor: '#ffffff',
          color: node.id === routeStart ? '#ef4444' : node.id === routeEnd ? '#10b981' : '#3b82f6',
          weight: 4,
          fillOpacity: 1
        })
          .addTo(group)
          .bindTooltip(`${node.id}: ${node.name}`, { permanent: false })
          .on('click', (e) => {
            L.DomEvent.stopPropagation(e)
            handleNodeClick(node.id)
          })
      })

      // 3. Draw active routing
      if (routingResult) {
        const pathCoords = routingResult.path.map(id => {
          const nd = allNodes.find(n => n.id === id)
          return [nd.lat, nd.lng]
        })

        L.polyline(pathCoords, {
          color: '#10b981',
          weight: 6,
          opacity: 0.9,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(group)
      }
    }

    else if (activeProject === 'schools') {
      mapRef.current.setView([41.285, 69.215], 13.5)

      // 1. Draw user-placed existing schools with 1km buffer ring
      existingSchools.forEach((sch) => {
        L.circleMarker([sch.lat, sch.lng], {
          radius: 6,
          fillColor: '#ef4444',
          color: '#ffffff',
          weight: 2,
          fillOpacity: 1
        }).addTo(group).bindPopup(sch.name)

        L.circle([sch.lat, sch.lng], {
          radius: 1000,
          color: '#ef4444',
          fillColor: '#ef4444',
          fillOpacity: 0.04,
          weight: 1,
          dashArray: '4,4'
        }).addTo(group)
      })

      // 2. Draw user-placed road points with 300m access buffer ring
      roadPoints.forEach((pt) => {
        L.circleMarker([pt.lat, pt.lng], {
          radius: 5,
          fillColor: '#3b82f6',
          color: '#ffffff',
          weight: 1.5,
          fillOpacity: 1
        }).addTo(group).bindPopup(pt.name)

        L.circle([pt.lat, pt.lng], {
          radius: 300,
          color: '#3b82f6',
          fillColor: '#3b82f6',
          fillOpacity: 0.06,
          weight: 1,
          dashArray: '2,2'
        }).addTo(group)
      })

      // 3. Draw user-placed population density centers with 800m service buffer ring
      densityCenters.forEach((pt) => {
        L.circleMarker([pt.lat, pt.lng], {
          radius: 6,
          fillColor: '#eab308',
          color: '#ffffff',
          weight: 2,
          fillOpacity: 1
        }).addTo(group).bindPopup(pt.name)

        L.circle([pt.lat, pt.lng], {
          radius: 800,
          color: '#eab308',
          fillColor: '#eab308',
          fillOpacity: 0.05,
          weight: 1,
          dashArray: '3,3'
        }).addTo(group)
      })

      // 4. Draw Custom proposed school point if placed
      if (customSchoolPoint) {
        const isSuitable = schoolChecklist.popDensity && schoolChecklist.schoolBuffer && schoolChecklist.roadAccess

        // Exclusion buffer (1000m)
        L.circle([customSchoolPoint.lat, customSchoolPoint.lng], {
          radius: 1000,
          color: schoolChecklist.schoolBuffer ? '#10b981' : '#ef4444',
          fillColor: schoolChecklist.schoolBuffer ? '#10b981' : '#ef4444',
          fillOpacity: 0.04,
          weight: 1.5,
          dashArray: '5,5'
        }).addTo(group)

        // Population service buffer (800m)
        L.circle([customSchoolPoint.lat, customSchoolPoint.lng], {
          radius: 800,
          color: schoolChecklist.popDensity ? '#10b981' : '#eab308',
          fillColor: schoolChecklist.popDensity ? '#10b981' : '#eab308',
          fillOpacity: 0.04,
          weight: 1.5,
          dashArray: '3,3'
        }).addTo(group)

        // Road access buffer (300m)
        L.circle([customSchoolPoint.lat, customSchoolPoint.lng], {
          radius: 300,
          color: schoolChecklist.roadAccess ? '#10b981' : '#3b82f6',
          fillColor: schoolChecklist.roadAccess ? '#10b981' : '#3b82f6',
          fillOpacity: 0.06,
          weight: 1.5,
          dashArray: '2,2'
        }).addTo(group)

        L.marker([customSchoolPoint.lat, customSchoolPoint.lng], {
          icon: L.divIcon({
            html: `
              <div style="display: flex; align-items: center; justify-content: center; width: 30px; height: 30px;">
                <div style="width: 16px; height: 16px; background-color: ${isSuitable ? '#10b981' : '#f97316'}; border: 2.5px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>
              </div>
            `,
            className: 'custom-school-marker',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
          })
        })
          .addTo(group)
          .bindPopup(`
            <div class="text-xs font-sans space-y-1">
              <p class="font-bold">${isSuitable ? 'Tanlangan mos joy!' : 'Mos kelmagan joy'}</p>
              <p class="text-[10px] text-gray-500">${customSchoolPoint.lat.toFixed(5)}, ${customSchoolPoint.lng.toFixed(5)}</p>
            </div>
          `)
          .openPopup()
      }
    }

    else if (activeProject === 'hospitals') {
      mapRef.current.setView([41.328, 69.255], 12.5)

      // 1. Calculate and render neighborhoods with color depending on nearest custom hospital
      customNeighborhoods.forEach((n) => {
        let minDistance = Infinity
        customHospitals.forEach((h) => {
          const d = L.latLng(n.lat, n.lng).distanceTo(L.latLng(h.lat, h.lng))
          if (d < minDistance) minDistance = d
        })

        const isUnderserved = customHospitals.length === 0 || minDistance > coverageRadius

        L.circle([n.lat, n.lng], {
          radius: 1000,
          color: isUnderserved ? '#ef4444' : '#10b981',
          fillColor: isUnderserved ? '#ef4444' : '#10b981',
          fillOpacity: 0.22,
          weight: 2
        }).addTo(group).bindTooltip(`
          <div class="text-xs font-sans">
            <p class="font-bold">${n.name}</p>
            <p class="text-[10px] text-gray-500">Aholi: ${n.population.toLocaleString()}</p>
            <p class="text-[10px] font-bold ${isUnderserved ? 'text-red-500' : 'text-green-500'}">
              ${isUnderserved ? 'Tez yordam yetib bormaydi' : 'Qamrov ostida'}
            </p>
          </div>
        `, { sticky: true })
      })

      // 2. Draw placed custom hospitals
      customHospitals.forEach((h) => {
        L.marker([h.lat, h.lng], {
          icon: L.divIcon({
            html: `
              <div style="display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ef4444" style="width: 26px; height: 26px; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.3));">
                  <path d="M19 10.5h-5.5V5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5.5H5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5.5V19c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5H19c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z"/>
                </svg>
              </div>
            `,
            className: 'custom-hospital-marker',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
          })
        }).addTo(group).bindPopup(`<p class="font-bold text-xs">${h.name}</p>`)

        // Service area ring
        L.circle([h.lat, h.lng], {
          radius: coverageRadius,
          color: '#10b981',
          fillColor: '#10b981',
          fillOpacity: 0.08,
          weight: 1.5,
          dashArray: '3,3'
        }).addTo(group)
      })
    }

    else if (activeProject === 'land') {
      mapRef.current.setView([41.365, 69.230], 12.5)

      // Render customLandPlots
      customLandPlots.forEach((cell, index) => {
        const bounds = [
          [cell.lat - 0.005, cell.lng - 0.007],
          [cell.lat + 0.005, cell.lng + 0.007]
        ]

        L.rectangle(bounds, {
          color: '#ffffff',
          fillColor: cell.cover,
          fillOpacity: 0.65,
          weight: 2
        })
          .addTo(group)
          .bindTooltip('Kliklang: yer toifasini o\'zgartirish', { sticky: true })
          .on('click', (e) => {
            L.DomEvent.stopPropagation(e)
            handleCellClick(index)
          })
      })
    }
  }, [activeProject, routeStart, routeEnd, routingResult, existingSchools, roadPoints, densityCenters, customSchoolPoint, schoolChecklist, customNeighborhoods, customHospitals, coverageRadius, customLandPlots, customRoadNodes, customRoadSegments])

  // Setup Map instance and Click bindings
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: false,
      }).setView([41.285, 69.215], 13)

      L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapRef.current)

      // Global Map Background Click Handler
      mapRef.current.on('click', (e) => {
        const { lat, lng } = e.latlng
        handleMapBackgroundClick(lat, lng)
      })
    }
  }, [])

  // Redraw layers when variables change
  useEffect(() => {
    renderMapLayers()
  }, [renderMapLayers])

  // Fetch Saved Cases from DB or LocalStorage
  const fetchSavedCases = useCallback(async () => {
    if (!currentUser) return
    setIsLoadingSaved(true)
    try {
      if (!isDemoMode && db) {
        const q = query(
          collection(db, 'gis_cases'),
          where('uid', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        )
        const snap = await getDocs(q)
        const items = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate()?.toISOString() || new Date().toISOString()
        }))
        setSavedCases(items)
      } else {
        // LocalStorage fallback
        const localKey = `geoedu_local_cases_${currentUser.uid}`
        const local = localStorage.getItem(localKey)
        if (local) {
          setSavedCases(JSON.parse(local))
        } else {
          setSavedCases([])
        }
      }
    } catch (err) {
      console.error('Error fetching saved cases:', err)
      const localKey = `geoedu_local_cases_${currentUser.uid}`
      const local = localStorage.getItem(localKey)
      if (local) {
        setSavedCases(JSON.parse(local))
      }
    } finally {
      setIsLoadingSaved(false)
    }
  }, [currentUser])

  // Load saved cases on mount or user change
  useEffect(() => {
    if (currentUser) {
      fetchSavedCases()
    }
  }, [currentUser, fetchSavedCases])

  // Clean state when project tab switches (if allowed)
  useEffect(() => {
    if (!isResetAllowedRef.current) {
      isResetAllowedRef.current = true
      return
    }
    setRoutingResult(null)
    setCustomRoadNodes([])
    setCustomRoadSegments([])
    setRouteStart('A')
    setRouteEnd('C')
    setRoadTool('select')
    setCustomSchoolPoint(null)
    setExistingSchools([])
    setRoadPoints([])
    setDensityCenters([])
    setCustomNeighborhoods([])
    setCustomHospitals([])
    setCustomLandPlots([])
    setSchoolChecklist({ popDensity: false, schoolBuffer: false, roadAccess: false, evaluated: false })
    setEditingCaseId(null)
    setCaseTitle('')
    setCaseDescription('')
    setSaveFormOpen(false)
  }, [activeProject])

  // Save or Update Case Study in Firestore or LocalStorage
  const handleSaveCase = async (isNewCopy = false) => {
    if (!currentUser) {
      toast.error(lang === 'uz' ? 'Iltimos, tizimga kiring!' : 'Please log in!')
      return
    }

    if (!caseTitle.trim()) {
      toast.error(lang === 'uz' ? 'Keysga nom bering!' : 'Please provide a title for the case study!')
      return
    }

    let dataPayload = {}
    if (activeProject === 'roads') {
      if (!routeStart || !routeEnd) {
        toast.error(lang === 'uz' ? 'Iltimos, boshlanish va yakuniy nuqtani tanlang!' : 'Please select start and destination nodes!')
        return
      }
      dataPayload = { routeStart, routeEnd, routingResult, customRoadNodes, customRoadSegments }
    } else if (activeProject === 'schools') {
      if (!customSchoolPoint && existingSchools.length === 0 && roadPoints.length === 0 && densityCenters.length === 0) {
        toast.error(lang === 'uz' ? 'Hech qanday maktab obyekti chizilmagan!' : 'No school objects placed on map!')
        return
      }
      dataPayload = { customSchoolPoint, existingSchools, roadPoints, densityCenters, schoolChecklist }
    } else if (activeProject === 'hospitals') {
      if (customHospitals.length === 0 && customNeighborhoods.length === 0) {
        toast.error(lang === 'uz' ? 'Hech qanday shifoxona yoki aholi punkti qo\'yilmagan!' : 'No hospitals or neighborhood markers placed!')
        return
      }
      dataPayload = { customHospitals, customNeighborhoods, coverageRadius, coverageStats }
    } else if (activeProject === 'land') {
      if (customLandPlots.length === 0) {
        toast.error(lang === 'uz' ? 'Hech qanday yer uchastkasi belgilanmagan!' : 'No land plots added!')
        return
      }
      dataPayload = { customLandPlots }
    }

    setIsSaving(true)
    const localKey = `geoedu_local_cases_${currentUser.uid}`

    try {
      const isUpdating = editingCaseId && !isNewCopy

      if (isUpdating) {
        // UPDATE Existing Case
        if (!isDemoMode && db) {
          await updateDoc(doc(db, 'gis_cases', editingCaseId), {
            title: caseTitle.trim(),
            description: caseDescription.trim(),
            data: dataPayload,
            updatedAt: serverTimestamp()
          })
        } else {
          // LocalStorage Update
          const localData = localStorage.getItem(localKey)
          const parsed = localData ? JSON.parse(localData) : []
          const updated = parsed.map((item) => {
            if (item.id === editingCaseId) {
              return {
                ...item,
                title: caseTitle.trim(),
                description: caseDescription.trim(),
                data: dataPayload,
                updatedAt: new Date().toISOString()
              }
            }
            return item
          })
          localStorage.setItem(localKey, JSON.stringify(updated))
        }
        toast.success(lang === 'uz' ? 'Keys muvaffaqiyatli yangilandi!' : 'Case study updated successfully!')
      } else {
        // CREATE New Case
        const newCaseDoc = {
          uid: currentUser.uid,
          userName: currentUser.name || 'Anonymous Student',
          projectType: activeProject,
          title: caseTitle.trim(),
          description: caseDescription.trim(),
          data: dataPayload,
          createdAt: new Date().toISOString()
        }

        if (!isDemoMode && db) {
          const docRef = await addDoc(collection(db, 'gis_cases'), {
            ...newCaseDoc,
            createdAt: serverTimestamp()
          })
          setEditingCaseId(docRef.id)
        } else {
          // LocalStorage Create
          const localData = localStorage.getItem(localKey)
          const parsed = localData ? JSON.parse(localData) : []
          const newId = Date.now().toString()
          const updated = [{ id: newId, ...newCaseDoc }, ...parsed]
          localStorage.setItem(localKey, JSON.stringify(updated))
          setEditingCaseId(newId)
        }
        toast.success(lang === 'uz' ? 'Yangi keys muvaffaqiyatli saqlandi!' : 'New case study saved successfully!')
      }

      setSaveFormOpen(false)
      fetchSavedCases()
    } catch (err) {
      console.error('Error saving case study:', err)
      toast.error(lang === 'uz' ? 'Saqlashda xatolik yuz berdi' : 'An error occurred while saving')
    } finally {
      setIsSaving(false)
    }
  }

  // Load Saved Case into editor workspace
  const handleLoadCase = (caseItem) => {
    if (activeProject !== caseItem.projectType) {
      isResetAllowedRef.current = false
    }

    setEditingCaseId(caseItem.id)
    setCaseTitle(caseItem.title)
    setCaseDescription(caseItem.description || '')
    setActiveProject(caseItem.projectType)

    // Load data based on project type
    const d = caseItem.data || {}
    if (caseItem.projectType === 'roads') {
      setRouteStart(d.routeStart || '')
      setRouteEnd(d.routeEnd || '')
      setRoutingResult(d.routingResult || null)
      setCustomRoadNodes(d.customRoadNodes || [])
      setCustomRoadSegments(d.customRoadSegments || [])
    } else if (caseItem.projectType === 'schools') {
      setCustomSchoolPoint(d.customSchoolPoint || null)
      setExistingSchools(d.existingSchools || [])
      setRoadPoints(d.roadPoints || [])
      setDensityCenters(d.densityCenters || [])
      setSchoolChecklist(d.schoolChecklist || { popDensity: false, schoolBuffer: false, roadAccess: false, evaluated: false })
    } else if (caseItem.projectType === 'hospitals') {
      setCustomNeighborhoods(d.customNeighborhoods || [])
      setCustomHospitals(d.customHospitals || [])
      setCoverageRadius(d.coverageRadius || 1250)
      setCoverageStats(d.coverageStats || { covered: 0, underserved: 100 })
    } else if (caseItem.projectType === 'land') {
      setCustomLandPlots(d.customLandPlots || [])
    }

    setSidebarMode('editor')
    toast.success(
      lang === 'uz' 
        ? `"${caseItem.title}" muvaffaqiyatli yuklandi!` 
        : `"${caseItem.title}" loaded successfully!`
    )
  }

  // Delete Case Study
  const handleDeleteCase = async (id, e) => {
    e.stopPropagation()
    if (!currentUser) return

    const confirmMsg = lang === 'uz'
      ? "Ushbu saqlangan keysni o'chirmoqchimisiz?"
      : "Are you sure you want to delete this saved case study?"
    
    if (!window.confirm(confirmMsg)) return

    try {
      if (!isDemoMode && db) {
        await deleteDoc(doc(db, 'gis_cases', id))
      } else {
        const localKey = `geoedu_local_cases_${currentUser.uid}`
        const localData = localStorage.getItem(localKey)
        if (localData) {
          const parsed = JSON.parse(localData)
          const filtered = parsed.filter((item) => item.id !== id)
          localStorage.setItem(localKey, JSON.stringify(filtered))
        }
      }

      toast.success(lang === 'uz' ? "Keys muvaffaqiyatli o'chirildi!" : "Case study deleted successfully!")

      if (editingCaseId === id) {
        setEditingCaseId(null)
        setCaseTitle('')
        setCaseDescription('')
      }
      fetchSavedCases()
    } catch (err) {
      console.error('Error deleting case:', err)
      toast.error(lang === 'uz' ? 'O\'chirishda xatolik yuz berdi' : 'An error occurred while deleting')
    }
  }

  // Cancel editing mode
  const handleCancelEdit = () => {
    setEditingCaseId(null)
    setCaseTitle('')
    setCaseDescription('')
    setSaveFormOpen(false)
    toast(lang === 'uz' ? 'Tahrirlash rejimi bekor qilindi' : 'Editing mode cancelled')
  }

  // Client-side filtering of saved cases
  const filteredCases = savedCases.filter((item) => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesFilter = filterType === 'all' || item.projectType === filterType
    return matchesSearch && matchesFilter
  })

  // Map background click redirector
  const handleMapBackgroundClick = (lat, lng) => {
    setActiveProject((proj) => {
      if (proj === 'roads') {
        setRoadTool((tool) => {
          if (tool === 'addNode') {
            setCustomRoadNodes((prev) => {
              const allNodes = [...ROAD_NODES, ...prev]
              let nearestNode = null
              let minDist = Infinity

              allNodes.forEach(node => {
                const d = L.latLng(lat, lng).distanceTo(L.latLng(node.lat, node.lng))
                if (d < minDist) {
                  minDist = d
                  nearestNode = node
                }
              })

              const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
              const nextLetter = alphabet[(allNodes.length) % alphabet.length] || `N${allNodes.length + 1}`
              const nodeId = `${nextLetter}`

              const newNode = {
                id: nodeId,
                name: lang === 'uz' ? `${nodeId} nuqta (Yangi)` : `${nodeId} point (New)`,
                lat,
                lng
              }

              if (nearestNode) {
                setCustomRoadSegments(segPrev => [...segPrev, [nodeId, nearestNode.id]])
                toast.success(
                  lang === 'uz' 
                    ? `Chorrahaga yangi ${nodeId} nuqta qo'shildi va ${nearestNode.id} nuqtaga ulandi!` 
                    : `New node ${nodeId} added and connected to ${nearestNode.id}!`
                )
              } else {
                toast.success(
                  lang === 'uz' 
                    ? `Chorrahaga birinchi yangi ${nodeId} nuqta qo'shildi!` 
                    : `First node ${nodeId} added!`
                )
              }
              return [...prev, newNode]
            })
          }
          return tool
        })
      } else if (proj === 'hospitals') {
        setHospitalTool((tool) => {
          if (tool === 'hospital') {
            setCustomHospitals((prev) => {
              if (prev.length >= 5) {
                toast.error(lang === 'uz' ? 'Maksimal 5 ta shifoxona joylashtirish mumkin!' : 'Maximum 5 hospitals allowed!')
                return prev
              }
              const next = [...prev, { lat, lng, name: lang === 'uz' ? `Shifoxona #${prev.length + 1}` : `Hospital #${prev.length + 1}` }]
              toast.success(lang === 'uz' ? 'Yangi shifoxona o\'rnatildi!' : 'New hospital placed!')
              return next
            })
          } else {
            setCustomNeighborhoods((prev) => {
              const pop = Math.floor(Math.random() * 15000) + 5000 // 5k to 20k
              const next = [...prev, {
                lat,
                lng,
                name: lang === 'uz' ? `Aholi punkti #${prev.length + 1}` : `Settlement #${prev.length + 1}`,
                population: pop
              }]
              toast.success(lang === 'uz' ? 'Yangi aholi punkti qo\'shildi!' : 'New settlement added!')
              return next
            })
          }
          return tool
        })
      } else if (proj === 'schools') {
        setSchoolTool((tool) => {
          if (tool === 'proposed') {
            setCustomSchoolPoint({ lat, lng })
          } else if (tool === 'existing') {
            setExistingSchools(prev => [...prev, { lat, lng, name: lang === 'uz' ? `Mavjud maktab #${prev.length + 1}` : `Existing school #${prev.length + 1}` }])
            toast.success(lang === 'uz' ? 'Mavjud maktab joylashtirildi!' : 'Existing school placed!')
          } else if (tool === 'road') {
            setRoadPoints(prev => [...prev, { lat, lng, name: lang === 'uz' ? `Yo'l nuqtasi #${prev.length + 1}` : `Road point #${prev.length + 1}` }])
            toast.success(lang === 'uz' ? 'Yo\'l nuqtasi o\'rnatildi!' : 'Road point placed!')
          } else if (tool === 'density') {
            setDensityCenters(prev => [...prev, { lat, lng, name: lang === 'uz' ? `Aholi markazi #${prev.length + 1}` : `Population center #${prev.length + 1}` }])
            toast.success(lang === 'uz' ? 'Aholi zichligi markazi joylashtirildi!' : 'Population center placed!')
          }
          return tool
        })
      } else if (proj === 'land') {
        setCustomLandPlots((prev) => {
          if (prev.length >= 20) {
            toast.error(lang === 'uz' ? 'Maksimal 20 ta yer uchastkasi qo\'shish mumkin!' : 'Maximum 20 land plots allowed!')
            return prev
          }
          const next = [...prev, {
            id: Date.now(),
            lat,
            lng,
            cover: '#10b981'
          }]
          toast.success(lang === 'uz' ? 'Yangi yer uchastkasi qo\'shildi!' : 'New land plot added!')
          return next
        })
      }
      return proj
    })
  }

  // Live checklist recalculation when related variables change
  useEffect(() => {
    if (activeProject !== 'schools' || !customSchoolPoint) return

    const { lat, lng } = customSchoolPoint

    let schoolBuffer = true
    if (existingSchools.length > 0) {
      let minExistingDist = Infinity
      existingSchools.forEach(sch => {
        const d = L.latLng(lat, lng).distanceTo(L.latLng(sch.lat, sch.lng))
        if (d < minExistingDist) minExistingDist = d
      })
      schoolBuffer = minExistingDist > 1000
    }

    let roadAccess = false
    if (roadPoints.length > 0) {
      let minRoadDist = Infinity
      roadPoints.forEach(rd => {
        const d = L.latLng(lat, lng).distanceTo(L.latLng(rd.lat, rd.lng))
        if (d < minRoadDist) minRoadDist = d
      })
      roadAccess = minRoadDist <= 300
    }

    let popDensity = false
    if (densityCenters.length > 0) {
      let minDensityDist = Infinity
      densityCenters.forEach(dc => {
        const d = L.latLng(lat, lng).distanceTo(L.latLng(dc.lat, dc.lng))
        if (d < minDensityDist) minDensityDist = d
      })
      popDensity = minDensityDist <= 800
    }

    setSchoolChecklist({
      popDensity,
      schoolBuffer,
      roadAccess,
      evaluated: true
    })
  }, [customSchoolPoint, existingSchools, roadPoints, densityCenters, activeProject])

  // Calculate live coverage statistics for custom hospitals list
  useEffect(() => {
    if (activeProject !== 'hospitals') return

    if (customNeighborhoods.length === 0 || customHospitals.length === 0) {
      setCoverageStats({ covered: 0, underserved: 100 })
      return
    }

    let totalPop = 0
    let coveredPop = 0

    customNeighborhoods.forEach((n) => {
      totalPop += n.population

      // find closest custom hospital
      let minDist = Infinity
      customHospitals.forEach((h) => {
        const d = L.latLng(n.lat, n.lng).distanceTo(L.latLng(h.lat, h.lng))
        if (d < minDist) minDist = d
      })

      if (minDist <= coverageRadius) {
        coveredPop += n.population
      }
    })

    const pctCovered = totalPop > 0 ? Math.round((coveredPop / totalPop) * 100) : 0
    setCoverageStats({ covered: pctCovered, underserved: 100 - pctCovered })
  }, [customHospitals, customNeighborhoods, coverageRadius, activeProject])

  // Real Dijkstra Shortest Path Solver
  const solveShortestPath = (startId, endId) => {
    const adj = {}
    const allNodes = [...ROAD_NODES, ...customRoadNodes]

    allNodes.forEach(n => {
      adj[n.id] = []
    })

    const roadSegments = [
      ...customRoadSegments
    ]

    roadSegments.forEach(([u, v]) => {
      const nodeU = allNodes.find(n => n.id === u)
      const nodeV = allNodes.find(n => n.id === v)
      if (nodeU && nodeV) {
        // Calculate real distance using Leaflet's latLng distance in km
        const d = L.latLng(nodeU.lat, nodeU.lng).distanceTo(L.latLng(nodeV.lat, nodeV.lng)) / 1000
        adj[u].push({ to: v, weight: d })
        adj[v].push({ to: u, weight: d })
      }
    })

    const dist = {}
    const prev = {}
    const pq = []

    allNodes.forEach(n => {
      dist[n.id] = Infinity
      prev[n.id] = null
    })

    dist[startId] = 0
    pq.push({ id: startId, d: 0 })

    while (pq.length > 0) {
      pq.sort((x, y) => x.d - y.d)
      const curr = pq.shift()
      const u = curr.id

      if (u === endId) break
      if (curr.d > dist[u]) continue

      adj[u].forEach(edge => {
        const v = edge.to
        const alt = dist[u] + edge.weight
        if (alt < dist[v]) {
          dist[v] = alt
          prev[v] = u
          pq.push({ id: v, d: alt })
        }
      })
    }

    if (dist[endId] === Infinity) return null

    const path = []
    let curr = endId
    while (curr !== null) {
      path.unshift(curr)
      curr = prev[curr]
    }

    const finalDist = dist[endId]
    const finalTime = (finalDist / 40) * 60 // 40 km/h average speed in city

    return {
      path,
      dist: Number(finalDist.toFixed(2)),
      time: Number(finalTime.toFixed(1))
    }
  }

  // Preset Scenario Loaders
  const loadSchoolsPreset = () => {
    setExistingSchools([
      { lat: 41.285, lng: 69.201, name: lang === 'uz' ? '12-maktab (Mavjud)' : 'School #12 (Existing)' },
      { lat: 41.291, lng: 69.231, name: lang === 'uz' ? '88-maktab (Mavjud)' : 'School #88 (Existing)' }
    ])
    setRoadPoints([
      { lat: 41.283, lng: 69.215, name: lang === 'uz' ? 'Bunyodkor shox ko\'chasi' : 'Bunyodkor Ave' },
      { lat: 41.287, lng: 69.217, name: lang === 'uz' ? 'Muqimiy ko\'chasi' : 'Muqimiy St' },
      { lat: 41.278, lng: 69.208, name: lang === 'uz' ? 'Chilonzor ko\'chasi' : 'Chilonzor St' }
    ])
    setDensityCenters([
      { lat: 41.282, lng: 69.218, name: lang === 'uz' ? 'Chilonzor-5 dahasi (Aholi)' : 'Chilonzor-5 block (Pop)' },
      { lat: 41.289, lng: 69.212, name: lang === 'uz' ? 'Chilonzor-2 dahasi (Aholi)' : 'Chilonzor-2 block (Pop)' }
    ])
    setCustomSchoolPoint(null)
    setSchoolChecklist({ popDensity: false, schoolBuffer: false, roadAccess: false, evaluated: false })
    toast.success(lang === 'uz' ? 'Chilonzor maktab joylashuvi shabloni yuklandi!' : 'Chilonzor school planning preset loaded!')
  }

  const loadHospitalsPreset = () => {
    setCustomNeighborhoods([
      { name: lang === 'uz' ? 'Sebzor dahasi' : 'Sebzor district', lat: 41.332, lng: 69.245, population: 15000 },
      { name: lang === 'uz' ? 'Ganga mavzesi' : 'Ganga district', lat: 41.324, lng: 69.252, population: 12000 },
      { name: lang === 'uz' ? 'Oloy mavzesi' : 'Oloy district', lat: 41.318, lng: 69.278, population: 8000 },
      { name: lang === 'uz' ? 'Chilonzor-2' : 'Chilonzor-2 block', lat: 41.288, lng: 69.208, population: 22000 },
      { name: lang === 'uz' ? 'Yunusobod-4' : 'Yunusobod-4 block', lat: 41.352, lng: 69.288, population: 18000 },
      { name: lang === 'uz' ? 'Yunusobod-12' : 'Yunusobod-12 block', lat: 41.365, lng: 69.272, population: 14000 }
    ])
    setCustomHospitals([
      { lat: 41.330, lng: 69.260, name: lang === 'uz' ? '1-sonli shahar shifoxonasi' : 'City Hospital #1' }
    ])
    toast.success(lang === 'uz' ? 'Toshkent shifoxona qamrovi shabloni yuklandi!' : 'Tashkent hospital coverage preset loaded!')
  }

  const generateLandGrid = () => {
    const centerLat = 41.365
    const centerLng = 69.230
    const stepLat = 0.008
    const stepLng = 0.011
    const grid = []

    for (let r = -2; r <= 2; r++) {
      for (let c = -2; c <= 2; c++) {
        let cover = '#10b981' // green
        if (c === 0) cover = '#3b82f6' // water stream
        else if (r === 0 && c !== 0) cover = '#ef4444' // urban
        else if (r === -2 && c !== 0) cover = '#eab308' // agricultural
        else if (Math.random() > 0.7) cover = '#ef4444'

        grid.push({
          id: `${r}_${c}_${Date.now()}`,
          lat: centerLat + r * stepLat,
          lng: centerLng + c * stepLng,
          cover
        })
      }
    }
    setCustomLandPlots(grid)
    toast.success(lang === 'uz' ? 'Yashnobod yer qoplami to\'ri generatsiya qilindi!' : 'Yashnobod land cover grid generated!')
  }

  // Dijkstra Solver Simulation (Real Computation)
  const handleRunRouting = () => {
    if (routeStart === routeEnd) {
      toast.error(lang === 'uz' ? 'Boshlanish va oxirgi nuqta har xil bo\'lishi lozim!' : 'Start and destination must be different!')
      return
    }
    setIsRouting(true)
    setRoutingResult(null)

    setTimeout(() => {
      setIsRouting(false)
      const res = solveShortestPath(routeStart, routeEnd)
      if (res) {
        setRoutingResult(res)
        toast.success(lang === 'uz' ? 'Eng qisqa yo\'nalish muvaffaqiyatli topildi!' : 'Shortest path computed successfully!')
      } else {
        toast.error(lang === 'uz' ? 'Marshrut topilmadi!' : 'No path found!')
      }
    }, 1200)
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-80px)] w-full overflow-hidden">
      
      {/* LEFT CONTROL SIDEBAR */}
      <div className="w-full lg:w-[380px] xl:w-[420px] flex flex-col bg-white dark:bg-gray-800 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm overflow-hidden h-full flex-shrink-0">
        
        {/* Title bar */}
        <div className="px-6 py-4 border-b border-gray-150 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 select-none flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-primary-50 dark:bg-primary-950/40 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-400 shadow-sm">
              <Briefcase size={20} />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white text-base">GIS Case Studies</h2>
              <p className="text-[11px] text-gray-500">{lang === 'uz' ? 'Talaba tomonidan boshqariladigan keyslar' : 'Student-controlled case studies'}</p>
            </div>
          </div>
        </div>

        {/* Top sub-tabs to switch sidebar mode */}
        <div className="flex border-b border-gray-150 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-900/20 text-xs font-bold select-none flex-shrink-0">
          <button
            onClick={() => setSidebarMode('editor')}
            className={clsx(
              'flex-1 py-3 text-center border-b-2 transition-all flex items-center justify-center gap-1.5',
              sidebarMode === 'editor'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400 font-extrabold'
                : 'border-transparent text-gray-500 hover:text-gray-750'
            )}
          >
            <Sliders size={14} />
            {lang === 'uz' ? 'Keys Muharriri' : 'Case Editor'}
          </button>
          <button
            onClick={() => {
              setSidebarMode('saved')
              fetchSavedCases()
            }}
            className={clsx(
              'flex-1 py-3 text-center border-b-2 transition-all flex items-center justify-center gap-1.5',
              sidebarMode === 'saved'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400 font-extrabold'
                : 'border-transparent text-gray-500 hover:text-gray-755'
            )}
          >
            <History size={14} />
            {lang === 'uz' ? 'Saqlangan Keyslar' : 'Saved Cases'}
          </button>
        </div>

        {/* EDITOR MODE */}
        {sidebarMode === 'editor' && (
          <>
            {/* Tabs */}
            <div className="flex border-b border-gray-150 dark:border-gray-700 bg-gray-50/10 dark:bg-gray-900/10 text-[11px] font-bold select-none overflow-x-auto no-scrollbar flex-shrink-0">
              {[
                { id: 'roads', label: lang === 'uz' ? 'Yo\'llar' : 'Roads' },
                { id: 'schools', label: lang === 'uz' ? 'Maktablar' : 'Schools' },
                { id: 'hospitals', label: lang === 'uz' ? 'Shifoxona' : 'Hospitals' },
                { id: 'land', label: lang === 'uz' ? 'Yer' : 'Land Cover' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveProject(tab.id)}
                  className={clsx(
                    'flex-1 py-3 px-2 border-b-2 text-center transition-all whitespace-nowrap',
                    activeProject === tab.id
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400 font-extrabold'
                      : 'border-transparent text-gray-500 hover:text-gray-705'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Sidebar panels */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              
              {/* CASE A: ROADS */}
              {activeProject === 'roads' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">🛣️ Yo'llarni tahlil qilish</h3>
                    <p className="text-xs text-gray-500 leading-relaxed mt-1">
                      Xaritadagi ko'k rangli chorrahalarni (Node) ustiga bosib, Boshlanish (Start) va Yakuniy (Destination) nuqtalarni o'zingiz belgilang. Yangi chorrahalarni xaritaga kliklab qo'shishingiz ham mumkin.
                    </p>
                  </div>

                  {/* Tool Selection for Roads */}
                  <div className="p-3 bg-gray-50 dark:bg-gray-900/40 border border-gray-150 dark:border-gray-700 rounded-xl space-y-1.5 text-xs select-none">
                    <p className="font-bold text-gray-700 dark:text-gray-350 font-semibold">📍 Ish rejimi:</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setRoadTool('select')}
                        className={clsx(
                          'flex-1 py-1.5 px-2 rounded-lg border font-semibold transition-all text-center text-[11px]',
                          roadTool === 'select'
                            ? 'bg-primary-500 border-primary-500 text-white font-bold'
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                        )}
                      >
                        Chorrahani tanlash
                      </button>
                      <button
                        onClick={() => setRoadTool('addNode')}
                        className={clsx(
                          'flex-1 py-1.5 px-2 rounded-lg border font-semibold transition-all text-center text-[11px]',
                          roadTool === 'addNode'
                            ? 'bg-emerald-500 border-emerald-500 text-white font-bold'
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                        )}
                      >
                        Chorraha qo'shish (+)
                      </button>
                    </div>
                  </div>

                  {customRoadNodes.length > 0 && (
                    <button
                      onClick={handleClearRoadsAll}
                      className="w-full py-1.5 border border-red-200 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <Trash2 size={12} /> Barcha qo'shilgan yo'llarni tozalash
                    </button>
                  )}

                  <div className="p-3.5 bg-gray-50 dark:bg-gray-900/40 border border-gray-150 dark:border-gray-700 rounded-xl space-y-3 text-xs select-none">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-400 font-bold">START:</span>
                        <select
                          value={routeStart}
                          onChange={(e) => {
                            setRouteStart(e.target.value)
                            setRoutingResult(null)
                          }}
                          className="text-xs px-2 py-1 border border-gray-200 dark:border-gray-750 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold focus:outline-none focus:ring-1 focus:ring-primary-500"
                        >
                          <option value="">{lang === 'uz' ? 'Tanlang' : 'Select'}</option>
                          {[...ROAD_NODES, ...customRoadNodes].map(n => (
                            <option key={n.id} value={n.id}>Node {n.id} ({n.name.split(' (')[0]})</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-2">
                        <span className="text-[10px] text-gray-400 font-bold">DESTINATION:</span>
                        <select
                          value={routeEnd}
                          onChange={(e) => {
                            setRouteEnd(e.target.value)
                            setRoutingResult(null)
                          }}
                          className="text-xs px-2 py-1 border border-gray-200 dark:border-gray-750 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold focus:outline-none focus:ring-1 focus:ring-primary-500"
                        >
                          <option value="">{lang === 'uz' ? 'Tanlang' : 'Select'}</option>
                          {[...ROAD_NODES, ...customRoadNodes].map(n => (
                            <option key={n.id} value={n.id}>Node {n.id} ({n.name.split(' (')[0]})</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={handleRunRouting}
                      disabled={isRouting || !routeStart || !routeEnd}
                      className="w-full mt-2 btn-primary py-2 text-xs font-semibold rounded-lg justify-center flex items-center gap-1.5"
                    >
                      {isRouting ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
                      Marshrutni hisoblash
                    </button>
                  </div>

                  {routingResult && (
                    <div className="p-4 bg-emerald-50/20 dark:bg-emerald-950/10 border border-emerald-500/20 rounded-xl space-y-2 text-xs">
                      <h4 className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                        <Check size={14} />
                        Hisoblangan Natija:
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                        <div>
                          <span className="text-gray-400 block">Masofa:</span>
                          <span className="font-bold text-gray-800 dark:text-gray-200 font-mono text-sm">{routingResult.dist} km</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block">Vaqt:</span>
                          <span className="font-bold text-gray-800 dark:text-gray-200 font-mono text-sm">{routingResult.time} daqiqa</span>
                        </div>
                      </div>
                      <div className="border-t border-emerald-500/10 pt-2 mt-2">
                        <span className="text-gray-400 block text-[10px]">Yo'nalish xronologiyasi:</span>
                        <span className="font-bold text-gray-800 dark:text-gray-200 text-xs font-mono">
                          {routingResult.path.join(' ➔ ')}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-xl text-[11px] text-blue-700 dark:text-blue-400 leading-relaxed flex gap-2">
                    <Info size={16} className="flex-shrink-0" />
                    <span>
                      <strong>Yo'riqnoma:</strong> Xaritadagi istalgan ko'k chorrahani bosing. Birinchi klik boshlang'ichni, ikkinchi klik yakuniy nuqtani o'rnatadi.
                    </span>
                  </div>
                </div>
              )}

              {/* CASE B: SCHOOLS */}
              {activeProject === 'schools' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">🏫 Yangi maktab joylashuvi</h3>
                    <p className="text-xs text-gray-500 leading-relaxed mt-1">
                      Xaritadagi joylarni o'zingiz belgilang! Avval mavjud maktablar, transport o'qi va aholi zichligi nuqtalarini qo'ying, so'ngra optimal yangi maktab joyini tanlang.
                    </p>
                  </div>

                  <button
                    onClick={loadSchoolsPreset}
                    className="w-full py-2 bg-primary-50 hover:bg-primary-100 dark:bg-primary-950/20 dark:hover:bg-primary-900/30 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <RefreshCw size={13} />
                    {lang === 'uz' ? 'Chilonzor shablonini yuklash' : 'Load Chilonzor Preset'}
                  </button>

                  {/* Tool Selection */}
                  <div className="p-3.5 bg-gray-50 dark:bg-gray-900/40 border border-gray-150 dark:border-gray-700 rounded-xl space-y-2 text-xs select-none">
                    <p className="font-bold text-gray-700 dark:text-gray-350 mb-2">📍 Xaritada belgilash rejimi:</p>
                    <div className="space-y-1.5">
                      {[
                        { id: 'proposed', label: lang === 'uz' ? 'Yangi maktab (loyiha)' : 'Proposed school (project)', color: 'text-emerald-500 font-bold' },
                        { id: 'existing', label: lang === 'uz' ? 'Mavjud maktab (+)' : 'Existing school (+)', color: 'text-red-500 font-semibold' },
                        { id: 'road', label: lang === 'uz' ? 'Transport/Yo\'l nuqtasi (+)' : 'Road point (+)', color: 'text-blue-500 font-semibold' },
                        { id: 'density', label: lang === 'uz' ? 'Aholi zichligi markazi (+)' : 'Population density center (+)', color: 'text-yellow-500 font-semibold' }
                      ].map((tool) => (
                        <label key={tool.id} className="flex items-center gap-2.5 p-1.5 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-lg cursor-pointer">
                          <input
                            type="radio"
                            name="school_tool"
                            checked={schoolTool === tool.id}
                            onChange={() => setSchoolTool(tool.id)}
                            className="accent-primary-600"
                          />
                          <span className={tool.color}>{tool.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Suitability Checklist Report Card */}
                  {schoolChecklist.evaluated && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/40 border border-gray-150 dark:border-gray-700 rounded-xl space-y-2.5 text-xs select-none">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-gray-700 dark:text-gray-300">Suitability Checklist</h4>
                        <button onClick={handleClearSchoolsAll} className="text-[10px] text-red-500 hover:underline flex items-center gap-0.5">
                          <Trash2 size={11} /> Tozalash
                        </button>
                      </div>

                      <div className="space-y-1.5 text-[11px] pt-1.5 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">1. Aholi zich yashash hududi (&lt;800m):</span>
                          <span className={clsx('font-bold px-1.5 py-0.5 rounded text-[9px]', schoolChecklist.popDensity ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                            {schoolChecklist.popDensity ? 'Mos ✅' : 'Kuchsiz ❌'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">2. Boshqa maktablardan uzoqlik (&gt;1km):</span>
                          <span className={clsx('font-bold px-1.5 py-0.5 rounded text-[9px]', schoolChecklist.schoolBuffer ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                            {schoolChecklist.schoolBuffer ? 'Mos ✅' : 'Yaqin ❌'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">3. Yo'lga yaqinlik (&lt;300m):</span>
                          <span className={clsx('font-bold px-1.5 py-0.5 rounded text-[9px]', schoolChecklist.roadAccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                            {schoolChecklist.roadAccess ? 'Mos ✅' : 'Uzoq ❌'}
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-gray-150 dark:border-gray-800 pt-2.5 text-center">
                        {schoolChecklist.popDensity && schoolChecklist.schoolBuffer && schoolChecklist.roadAccess ? (
                          <div className="p-2 bg-green-500/10 text-green-600 font-bold rounded-lg text-xs">
                            🎉 Tanlangan hudud ideal darajada mos keladi!
                          </div>
                        ) : (
                          <div className="p-2 bg-orange-500/10 text-orange-600 font-bold rounded-lg text-xs">
                            ⚠️ Tanlangan joy mos emas. Boshqa nuqtani bosing.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Stats / Counts card */}
                  <div className="p-3 bg-gray-50 dark:bg-gray-900/30 border border-gray-150 dark:border-gray-700 rounded-xl space-y-1.5 text-[11px] text-gray-600 dark:text-gray-300 select-none">
                    <div className="flex justify-between">
                      <span>Mavjud maktablar:</span>
                      <span className="font-bold text-red-500">{existingSchools.length} ta</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Transport nuqtalari:</span>
                      <span className="font-bold text-blue-500">{roadPoints.length} ta</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Aholi zichligi nuqtalari:</span>
                      <span className="font-bold text-yellow-500">{densityCenters.length} ta</span>
                    </div>
                    {existingSchools.length > 0 || roadPoints.length > 0 || densityCenters.length > 0 ? (
                      <button
                        onClick={handleClearSchoolsAll}
                        className="w-full mt-2 py-1 bg-white dark:bg-gray-800 hover:bg-gray-100 border border-gray-200 dark:border-gray-700 rounded text-red-500 font-semibold"
                      >
                        Barchasini tozalash
                      </button>
                    ) : null}
                  </div>
                </div>
              )}

              {/* CASE C: HOSPITALS */}
              {activeProject === 'hospitals' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">🏥 Kasalxonalar xizmat qamrovi</h3>
                    <p className="text-xs text-gray-500 leading-relaxed mt-1">
                      Xaritada aholi yashash punktlari (Settlements) va shifoxonalarni o'zingiz belgilang va ular orasidagi qamrov tahlilini o'tkazing!
                    </p>
                  </div>

                  <button
                    onClick={loadHospitalsPreset}
                    className="w-full py-2 bg-primary-50 hover:bg-primary-100 dark:bg-primary-950/20 dark:hover:bg-primary-900/30 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <RefreshCw size={13} />
                    {lang === 'uz' ? 'Toshkent shablonini yuklash' : 'Load Tashkent Preset'}
                  </button>

                  {/* Tool Selector */}
                  <div className="p-3 bg-gray-50 dark:bg-gray-900/40 border border-gray-150 dark:border-gray-700 rounded-xl space-y-1.5 text-xs select-none">
                    <p className="font-bold text-gray-700 dark:text-gray-300">📍 Belgilash rejimi:</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setHospitalTool('neighborhood')}
                        className={clsx(
                          'flex-1 py-1.5 px-2 rounded-lg border font-semibold transition-all text-center',
                          hospitalTool === 'neighborhood'
                            ? 'bg-primary-500 border-primary-500 text-white'
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                        )}
                      >
                        Aholi punkti (+)
                      </button>
                      <button
                        onClick={() => setHospitalTool('hospital')}
                        className={clsx(
                          'flex-1 py-1.5 px-2 rounded-lg border font-semibold transition-all text-center',
                          hospitalTool === 'hospital'
                            ? 'bg-red-500 border-red-500 text-white'
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                        )}
                      >
                        Shifoxona (+)
                      </button>
                    </div>
                  </div>

                  {/* Hospital controls */}
                  <div className="p-3.5 bg-gray-50 dark:bg-gray-900/40 border border-gray-150 dark:border-gray-700 rounded-xl space-y-3 text-xs select-none">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-700 dark:text-gray-350">O'rnatilgan shifoxonalar:</span>
                      <span className="font-bold text-red-500">{customHospitals.length} / 5 ta</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-gray-150 dark:border-gray-800 pt-2">
                      <span className="font-bold text-gray-700 dark:text-gray-350">Aholi punktlari (Mahalla):</span>
                      <span className="font-bold text-primary-600">{customNeighborhoods.length} ta</span>
                    </div>

                    <div className="flex justify-between font-bold text-gray-700 dark:text-gray-350 border-t border-gray-100 dark:border-gray-800 pt-3">
                      <span>Qamrov radiusi (Masofa)</span>
                      <span className="font-mono text-primary-600">{coverageRadius} m</span>
                    </div>
                    <input
                      type="range"
                      min={500}
                      max={2500}
                      step={250}
                      value={coverageRadius}
                      onChange={(e) => setCoverageRadius(Number(e.target.value))}
                      className="w-full accent-primary-600"
                    />

                    {(customHospitals.length > 0 || customNeighborhoods.length > 0) && (
                      <button
                        onClick={handleClearHospitalsAll}
                        className="w-full mt-2 py-1.5 border border-red-200 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 text-[11px] font-semibold rounded-lg transition-colors flex items-center justify-center gap-1"
                      >
                        <X size={12} />
                        Barchasini tozalash
                      </button>
                    )}
                  </div>

                  {/* Live Statistics dashboard */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/30 border border-gray-150 dark:border-gray-700 rounded-xl grid grid-cols-2 gap-4 text-center select-none">
                    <div className="p-2 bg-green-50 dark:bg-green-950/10 border border-green-100 dark:border-green-900/20 rounded-lg">
                      <span className="text-gray-400 block text-[9px] uppercase">Qamrab olindi</span>
                      <span className="text-sm font-bold text-green-600">{coverageStats.covered}% aholi</span>
                    </div>
                    <div className="p-2 bg-red-50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/20 rounded-lg">
                      <span className="text-gray-400 block text-[9px] uppercase">Qamrovsiz hududlar</span>
                      <span className="text-sm font-bold text-red-500">{coverageStats.underserved}% aholi</span>
                    </div>
                  </div>

                  {customNeighborhoods.length > 0 && (
                    <div className="p-3.5 bg-gray-50 dark:bg-gray-900/40 border border-gray-150 dark:border-gray-700 rounded-xl space-y-2 text-xs">
                      <p className="font-bold text-gray-700 dark:text-gray-300 mb-1">Aholi punktlari holati:</p>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                        {customNeighborhoods.map((n, i) => {
                          let minDistance = Infinity
                          customHospitals.forEach((h) => {
                            const d = L.latLng(n.lat, n.lng).distanceTo(L.latLng(h.lat, h.lng))
                            if (d < minDistance) minDistance = d
                          })
                          const isCovered = customHospitals.length > 0 && minDistance <= coverageRadius
                          return (
                            <div key={i} className="flex justify-between items-center text-[11px] border-b border-gray-100 dark:border-gray-800/40 pb-1 last:border-b-0">
                              <span className="text-gray-600 dark:text-gray-400 font-medium truncate max-w-[170px]">{n.name}</span>
                              <span className={clsx("font-bold text-[9px] px-1.5 py-0.5 rounded", isCovered ? "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400")}>
                                {isCovered ? (lang === 'uz' ? 'Qamrovda' : 'Covered') : (lang === 'uz' ? 'Uzoqda' : 'Far')}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* CASE D: LAND COVER */}
              {activeProject === 'land' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">🌍 Yer resurslari tasnifi</h3>
                    <p className="text-xs text-gray-500 leading-relaxed mt-1">
                      Xaritada istalgan joylarni bosing va yangi yer uchastkalari qo'shing. Qo'shilgan kataklar ustiga bosib yer toifasini o'zgartiring va statistikani o'rganing!
                    </p>
                  </div>

                  <button
                    onClick={generateLandGrid}
                    className="w-full py-2 bg-primary-50 hover:bg-primary-100 dark:bg-primary-950/20 dark:hover:bg-primary-900/30 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <MapIcon size={13} />
                    {lang === 'uz' ? 'Yashnobod to\'rini generatsiya qilish' : 'Generate Yashnobod Grid'}
                  </button>

                  {customLandPlots.length > 0 && (
                    <button
                      onClick={handleClearLandPlots}
                      className="w-full py-1.5 border border-red-200 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <Trash2 size={12} /> Yer uchastkalarini tozalash
                    </button>
                  )}

                  {/* Donut Chart container */}
                  {customLandPlots.length > 0 ? (
                    <div className="card p-3 border border-gray-105 dark:border-gray-750">
                      <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center mb-2">
                        Yer toifalari nisbati (%)
                      </p>
                      <div className="w-full h-40">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={landChartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={65}
                              paddingAngle={2}
                              dataKey="value"
                            >
                              {landChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => `${value}%`} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Legends and Hectare area details */}
                      <div className="grid grid-cols-2 gap-2 text-[9px] pt-1.5 border-t border-gray-50 dark:border-gray-800 mt-2 font-semibold">
                        {landChartData.map((item, index) => {
                          const count = customLandPlots.filter(c => {
                            const lc = LAND_CLASSES.find(l => l.name === item.name);
                            return lc && c.cover === lc.color;
                          }).length;
                          const areaHectares = count * 100;
                          return (
                            <div key={index} className="flex flex-col gap-0.5 bg-gray-50/50 dark:bg-gray-900/30 p-1.5 rounded-md border border-gray-100 dark:border-gray-800/40">
                              <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }}></span>
                                <span className="text-gray-650 dark:text-gray-400 truncate font-bold">{item.name}</span>
                              </div>
                              <span className="text-gray-550 pl-3.5 text-[8.5px] font-mono">{item.value}% ({areaHectares} ha)</span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex justify-between items-center text-[10px] bg-primary-550/10 text-primary-600 dark:text-primary-400 px-3 py-1.5 rounded-lg font-bold border border-primary-500/20 mt-3 select-none">
                        <span>{lang === 'uz' ? 'Umumiy o\'rganilgan maydon:' : 'Total Study Area:'}</span>
                        <span className="font-mono">{customLandPlots.length * 100} gektar (ha)</span>
                      </div>

                      {(() => {
                        const total = customLandPlots.length;
                        const forestColor = '#10b981';
                        const urbanColor = '#ef4444';
                        const waterColor = '#3b82f6';
                        const forestPct = Math.round((customLandPlots.filter(c => c.cover === forestColor).length / total) * 100) || 0;
                        const urbanPct = Math.round((customLandPlots.filter(c => c.cover === urbanColor).length / total) * 100) || 0;
                        const waterPct = Math.round((customLandPlots.filter(c => c.cover === waterColor).length / total) * 100) || 0;

                        return (
                          <div className="p-3 bg-blue-50/30 dark:bg-blue-950/15 border border-blue-200/40 rounded-xl space-y-2 mt-4 text-xs select-none">
                            <h4 className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                              <Info size={14} className="text-primary-500" />
                              Ekologik Tahlil va Maslahat:
                            </h4>
                            <p className="text-[11px] text-gray-550 dark:text-gray-400 leading-relaxed font-medium">
                              {urbanPct > 45 ? (
                                <span className="text-red-500 font-bold">⚠️ Urbanizatsiya darajasi juda yuqori ({urbanPct}%). Tabiiy muhitni saqlash va yashil hududlarni ko'paytirish tavsiya etiladi.</span>
                              ) : forestPct < 25 ? (
                                <span className="text-amber-500 font-bold">🌲 Yashil qoplama etishmovchiligi ({forestPct}%). Havo sifatini yaxshilash uchun yashil yo'laklar tashkil eting.</span>
                              ) : waterPct === 0 ? (
                                <span className="text-blue-550 font-bold">💧 Hududda suv resurslari aniqlanmadi. Sug'orish va mikroiqlim barqarorligi uchun suv havzalarini loyihalashtirish lozim.</span>
                              ) : (
                                <span className="text-green-600 dark:text-green-400 font-bold">✅ Ekologik muvozanat yaxshi darajada. Yashil maydonlar, urbanizatsiya va suv havzalari nisbati maqbul.</span>
                              )}
                            </p>
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="p-6 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-center text-xs text-gray-400">
                      Xaritani bosib yer uchastkalarini joylashtiring yoki to'rni generatsiya qiling.
                    </div>
                  )}
                </div>
              )}

              {/* SAVE / UPDATE CASE CONFIGURATION CARD */}
              <div className="border-t border-gray-150 dark:border-gray-700 pt-5 mt-5">
                {editingCaseId && (
                  <div className="mb-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl flex items-center justify-between text-xs text-amber-800 dark:text-amber-300 select-none">
                    <span className="font-semibold truncate">
                      {lang === 'uz' ? `Tahrirlash: ${caseTitle}` : `Editing: ${caseTitle}`}
                    </span>
                    <button
                      onClick={handleCancelEdit}
                      className="text-red-500 hover:text-red-650 font-bold underline flex-shrink-0"
                    >
                      {lang === 'uz' ? 'Tahrirdan chiqish' : 'Cancel Edit'}
                    </button>
                  </div>
                )}

                {!saveFormOpen ? (
                  <button
                    onClick={() => {
                      if (!editingCaseId) {
                        setCaseTitle('')
                        setCaseDescription('')
                      }
                      setSaveFormOpen(true)
                    }}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors"
                  >
                    <Save size={16} />
                    {editingCaseId 
                      ? (lang === 'uz' ? "Keysni Yangilash / Tahrirlash" : "Update / Edit Case")
                      : (lang === 'uz' ? "Keysni Saqlash" : "Save Case Study")}
                  </button>
                ) : (
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/40 border border-gray-150 dark:border-gray-700 rounded-2xl space-y-3.5">
                    <h4 className="font-bold text-gray-800 dark:text-gray-200 text-xs">
                      {editingCaseId 
                        ? (lang === 'uz' ? "Keys ma'lumotlarini tahrirlash" : "Edit Case Study details") 
                        : (lang === 'uz' ? "Yangi keysni saqlash" : "Save New Case Study")}
                    </h4>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
                        {lang === 'uz' ? "Keys nomi (Sarlavha)" : "Case Study Title"}
                      </label>
                      <input
                        type="text"
                        value={caseTitle}
                        onChange={(e) => setCaseTitle(e.target.value)}
                        placeholder={lang === 'uz' ? "Masalan: Maktab joylashuvi 1" : "e.g., School Study 1"}
                        className="w-full text-xs px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
                        {lang === 'uz' ? "Tavsifi (Izoh)" : "Description (optional)"}
                      </label>
                      <textarea
                        value={caseDescription}
                        onChange={(e) => setCaseDescription(e.target.value)}
                        placeholder={lang === 'uz' ? "Tahlil va reja haqida batafsil..." : "Write details about this case..."}
                        rows={2}
                        className="w-full text-xs px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 resize-none font-sans"
                      />
                    </div>

                    <div className="flex gap-2 pt-1">
                      {editingCaseId ? (
                        <>
                          <button
                            onClick={() => handleSaveCase(false)}
                            disabled={isSaving}
                            className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                          >
                            {isSaving && <RefreshCw size={12} className="animate-spin" />}
                            {lang === 'uz' ? "Yangilash" : "Update"}
                          </button>
                          <button
                            onClick={() => handleSaveCase(true)}
                            disabled={isSaving}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                          >
                            {isSaving && <RefreshCw size={12} className="animate-spin" />}
                            {lang === 'uz' ? "Nusxa" : "Copy"}
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleSaveCase(false)}
                          disabled={isSaving}
                          className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                        >
                          {isSaving && <RefreshCw size={12} className="animate-spin" />}
                          {lang === 'uz' ? "Saqlash" : "Save"}
                        </button>
                      )}
                      <button
                        onClick={() => setSaveFormOpen(false)}
                        disabled={isSaving}
                        className="px-3 bg-gray-150 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50 text-gray-700 dark:text-gray-300 py-2 text-xs font-semibold rounded-lg transition-colors"
                      >
                        {lang === 'uz' ? "Bekor qilish" : "Cancel"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </>
        )}

        {/* SAVED CASES HISTORY LIST PANEL */}
        {sidebarMode === 'saved' && (
          <div className="flex-1 overflow-y-auto p-5 flex flex-col h-full min-h-0">
            
            {/* Search and Filters */}
            <div className="mb-4 space-y-2 select-none flex-shrink-0">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'uz' ? "Keyslarni qidirish..." : "Search saved cases..."}
                className="w-full text-xs px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 shadow-sm"
              />
              <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1 text-[10px]">
                {[
                  { id: 'all', label: lang === 'uz' ? 'Barchasi' : 'All' },
                  { id: 'roads', label: lang === 'uz' ? 'Yo\'llar' : 'Roads' },
                  { id: 'schools', label: lang === 'uz' ? 'Maktablar' : 'Schools' },
                  { id: 'hospitals', label: lang === 'uz' ? 'Shifoxonalar' : 'Hospitals' },
                  { id: 'land', label: lang === 'uz' ? 'Yer' : 'Land Cover' }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilterType(f.id)}
                    className={clsx(
                      'px-2.5 py-1 rounded-full border transition-all whitespace-nowrap font-bold',
                      filterType === f.id
                        ? 'bg-primary-50 border-primary-300 text-primary-600 dark:bg-primary-950/40 dark:border-primary-800 dark:text-primary-400'
                        : 'bg-white border-gray-200 text-gray-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-50'
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto min-h-0 space-y-3 pr-1">
              {isLoadingSaved ? (
                <div className="h-40 flex flex-col items-center justify-center gap-2 text-gray-400">
                  <RefreshCw size={24} className="animate-spin text-primary-500" />
                  <span className="text-xs">{lang === 'uz' ? 'Yuklanmoqda...' : 'Loading...'}</span>
                </div>
              ) : filteredCases.length === 0 ? (
                <div className="h-40 flex flex-col items-center justify-center text-center p-4 border border-dashed border-gray-250 dark:border-gray-700 rounded-2xl text-gray-400 text-xs gap-2">
                  <History size={28} className="text-gray-300 dark:text-gray-600" />
                  <div>
                    <p className="font-bold text-gray-500 dark:text-gray-450">
                      {lang === 'uz' ? 'Hech qanday keys topilmadi' : 'No saved cases found'}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1 max-w-[220px] leading-relaxed">
                      {lang === 'uz' 
                        ? "Keys muharriridan foydalanib xaritadagi loyihalarni saqlashingiz mumkin." 
                        : "Use the editor to setup and save your custom map configurations."}
                    </p>
                  </div>
                </div>
              ) : (
                filteredCases.map((caseItem) => {
                  const typeLabel = 
                    caseItem.projectType === 'roads' ? (lang === 'uz' ? 'Yo\'llar' : 'Roads') :
                    caseItem.projectType === 'schools' ? (lang === 'uz' ? 'Maktablar' : 'Schools') :
                    caseItem.projectType === 'hospitals' ? (lang === 'uz' ? 'Shifoxona' : 'Hospitals') :
                    caseItem.projectType === 'land' ? (lang === 'uz' ? 'Yer' : 'Land Cover') : 'Study'

                  const typeColor = 
                    caseItem.projectType === 'roads' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30' :
                    caseItem.projectType === 'schools' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30' :
                    caseItem.projectType === 'hospitals' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30' :
                    caseItem.projectType === 'land' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30' : 'bg-gray-50 text-gray-700'

                  return (
                    <div 
                      key={caseItem.id} 
                      onClick={() => handleLoadCase(caseItem)}
                      className={clsx(
                        "group p-3.5 border rounded-xl bg-white dark:bg-gray-800/40 hover:bg-gray-50/50 dark:hover:bg-gray-800 transition-all shadow-xs cursor-pointer flex flex-col gap-2 relative",
                        editingCaseId === caseItem.id
                          ? "border-primary-500 shadow-md ring-1 ring-primary-500"
                          : "border-gray-150 dark:border-gray-750"
                      )}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className={clsx("text-[9px] px-2 py-0.5 rounded-full font-bold border", typeColor)}>
                          {typeLabel}
                        </span>
                        
                        <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleLoadCase(caseItem)
                            }}
                            className="p-1 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/30 rounded transition-colors"
                            title={lang === 'uz' ? 'Yuklash' : 'Load case'}
                          >
                            <Play size={13} fill="currentColor" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteCase(caseItem.id, e)}
                            className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition-colors"
                            title={lang === 'uz' ? "O'chirish" : 'Delete case'}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-gray-805 dark:text-white leading-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {caseItem.title}
                        </h4>
                        {caseItem.description && (
                          <p className="text-[11px] text-gray-450 dark:text-gray-400 line-clamp-2 leading-relaxed">
                            {caseItem.description}
                          </p>
                        )}
                      </div>

                      <div className="text-[9px] text-gray-400 font-mono mt-1 border-t border-gray-50 dark:border-gray-800/60 pt-2 flex justify-between">
                        <span>{caseItem.userName || 'Student'}</span>
                        <span>{new Date(caseItem.createdAt).toLocaleString(lang === 'uz' ? 'uz-UZ' : 'en-US', { dateStyle: 'short', timeStyle: 'short' })}</span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT WORKSPACE MAP PANEL */}
      <div className="flex-1 bg-gray-100 dark:bg-gray-950 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm overflow-hidden h-full relative">
        <div ref={mapContainerRef} className="w-full h-full z-0 absolute inset-0" />

        {/* Legend float overlay */}
        <div className="absolute top-4 left-4 z-[1000] bg-white/95 dark:bg-gray-800/95 backdrop-blur shadow-lg border border-gray-200/50 dark:border-gray-700/50 px-4 py-3 rounded-2xl select-none max-w-[200px] space-y-2">
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
            <Layers size={12} />
            Xarita afsonasi
          </p>

          <div className="space-y-1.5 text-[10px] font-semibold text-gray-650 dark:text-gray-300">
            {activeProject === 'roads' && (
              <>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-white border-2 border-primary-500"></span>
                  <span>Yo'l chorrahasi</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-white border-2 border-red-500"></span>
                  <span>Boshlanish</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-white border-2 border-green-500"></span>
                  <span>Yakuniy nuqta</span>
                </div>
              </>
            )}

            {activeProject === 'schools' && (
              <>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 border border-white"></span>
                  <span>Mavjud maktab</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border border-dashed border-red-500 bg-red-500/10 rounded-full"></span>
                  <span>Maktab buferi (1km)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-1 bg-blue-500"></span>
                  <span>Yo'l o'qi</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
                  <span>Belgilangan taxmin</span>
                </div>
              </>
            )}

            {activeProject === 'hospitals' && (
              <>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 border border-white"></span>
                  <span>Siz qo'ygan shifoxona</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="w-3.5 h-3.5 border border-emerald-500 bg-emerald-500/10 rounded-full"></span>
                  <span>Tez yordam radiusi</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="w-3 h-3 bg-red-500/20 border border-red-500 rounded"></span>
                  <span>Tibbiy qamrovsiz</span>
                </div>
              </>
            )}

            {activeProject === 'land' && (
              <>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-green-500 rounded-sm"></span>
                  <span>O'rmon / Yashil</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-red-500 rounded-sm"></span>
                  <span>Urban / Bino</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-yellow-500 rounded-sm"></span>
                  <span>Ekin maydoni</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-blue-500 rounded-sm"></span>
                  <span>Suv havzasi</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Floating assignment overlay for gis-10 and gis-12 */}
        {assignmentId && (assignmentId === 'gis-10' || assignmentId === 'gis-12') && (
          <div className="absolute top-4 right-4 z-[1000] w-64 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-4 rounded-2xl">
            <h5 className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5 mb-2">
              <Briefcase size={14} className="text-primary-500" />
              <span>Amaliy Topshiriq: {assignmentId.toUpperCase()}</span>
            </h5>

            {assignmentId === 'gis-10' && (
              <div className="space-y-3">
                <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed">
                  Tez yordam qamrovi radiusini <b>1250 metr</b> qilib o'rnating.
                </p>
                <div className="p-2 rounded bg-gray-50 dark:bg-gray-900/40 text-xs border border-gray-150 dark:border-gray-750 flex items-center justify-between">
                  <span className="text-gray-650 dark:text-gray-300">Hozirgi radius:</span>
                  <span className={`font-mono font-bold ${coverageRadius === 1250 ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {coverageRadius} m
                  </span>
                </div>
                {coverageRadius === 1250 ? (
                  <button
                    onClick={() => {
                      localStorage.setItem('completed_practical_gis-10', 'true')
                      toast.success("Topshiriq 100 ball bilan muvaffaqiyatli topshirildi! 🎉")
                      window.location.href = "/subjects/gis/topics/gis-10"
                    }}
                    className="w-full btn-primary py-2 text-xs font-bold rounded-xl justify-center"
                  >
                    Topshirish
                  </button>
                ) : (
                  <p className="text-[9px] text-amber-500 font-medium">Iltimos, chap panelda radius slayderini 1250 m ga keltiring.</p>
                )}
              </div>
            )}

            {assignmentId === 'gis-12' && (
              <div className="space-y-3">
                <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed">
                  Chap panelda maktab muvofiqligi tahlil mezonlarining barchasini yoqing:
                </p>
                <div className="space-y-1.5 text-[10px]">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">1. Aholi zichligi:</span>
                    <span className={schoolChecklist.popDensity ? 'text-emerald-500 font-bold' : 'text-gray-400'}>
                      {schoolChecklist.popDensity ? '✓ Yoqilgan' : '✗ O\'chirilgan'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">2. Maktab buferi:</span>
                    <span className={schoolChecklist.schoolBuffer ? 'text-emerald-500 font-bold' : 'text-gray-400'}>
                      {schoolChecklist.schoolBuffer ? '✓ Yoqilgan' : '✗ O\'chirilgan'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">3. Yo'lga yaqinlik:</span>
                    <span className={schoolChecklist.roadAccess ? 'text-emerald-500 font-bold' : 'text-gray-400'}>
                      {schoolChecklist.roadAccess ? '✓ Yoqilgan' : '✗ O\'chirilgan'}
                    </span>
                  </div>
                </div>

                {schoolChecklist.popDensity && schoolChecklist.schoolBuffer && schoolChecklist.roadAccess ? (
                  <button
                    onClick={() => {
                      localStorage.setItem('completed_practical_gis-12', 'true')
                      toast.success("Topshiriq 100 ball bilan muvaffaqiyatli topshirildi! 🎉")
                      window.location.href = "/subjects/gis/topics/gis-12"
                    }}
                    className="w-full btn-primary py-2 text-xs font-bold rounded-xl justify-center"
                  >
                    Topshirish
                  </button>
                ) : (
                  <p className="text-[9px] text-amber-500 font-medium">Iltimos, chap panelda barcha 3 ta mezonni belgilang.</p>
                )}
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  )
}
