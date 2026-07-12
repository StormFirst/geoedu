import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Globe, Compass, Eye, Map as MapIcon, Layers, 
  Search as SearchIcon, Navigation, RotateCw, Loader2, Sparkles,
  UploadCloud, EyeOff, Trash2
} from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function ArcGIS3DPage() {
  const { i18n } = useTranslation()
  const lang = i18n.language?.slice(0, 2) || 'uz'

  const mapDivRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const viewInstanceRef = useRef(null)
  const tileLayersRef = useRef({})
  const graphicsLayersRef = useRef({})

  const [apiLoaded, setApiLoaded] = useState(false)
  const [mapMode, setMapMode] = useState('3D') // '2D' | '3D'
  const [activeBasemap, setActiveBasemap] = useState('satellite') // 'satellite' | 'streets' | 'topo-vector' | 'dark-gray'
  const [showTourPanel, setShowTourPanel] = useState(true)
  const [isFlying, setIsFlying] = useState(false)

  // Uploader & Layers tab states
  const [activeTab, setActiveTab] = useState('tour') // 'tour' | 'layers' | 'sandbox'
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedLayers, setUploadedLayers] = useState([])

  // Sandbox tab states
  const [sandboxTool, setSandboxTool] = useState(null) // 'skyscraper' | 'house' | 'tree' | 'turbine' | 'car' | 'delete' | 'edit'
  const [placedCounts, setPlacedCounts] = useState({
    skyscraper: 0,
    house: 0,
    tree: 0,
    turbine: 0,
    car: 0
  })
  const [placedGraphics, setPlacedGraphics] = useState([])

  // Selected object editing states
  const [selectedGraphic, setSelectedGraphic] = useState(null) // { id, type, height, width, color }
  const [editHeight, setEditHeight] = useState(100)
  const [editWidth, setEditWidth] = useState(30)
  const [editColor, setEditColor] = useState([100, 116, 139])
  
  const sandboxLayerRef = useRef(null)
  const selectedGraphicRef = useRef(null)
  const activeTabRef = useRef(activeTab)
  const sandboxToolRef = useRef(sandboxTool)

  const uploadedLayersRef = useRef([])
  const placedGraphicsRef = useRef([])

  useEffect(() => {
    uploadedLayersRef.current = uploadedLayers
  }, [uploadedLayers])

  useEffect(() => {
    placedGraphicsRef.current = placedGraphics
  }, [placedGraphics])

  useEffect(() => {
    activeTabRef.current = activeTab
    // Clean up selected tool and selection when switching tabs
    if (activeTab !== 'sandbox') {
      setSandboxTool(null)
      setSelectedGraphic(null)
      selectedGraphicRef.current = null
    }
  }, [activeTab])

  // Environmental & Saved Projects states
  const [timeOfDay, setTimeOfDay] = useState(12) // 12 PM default
  const [savedProjects, setSavedProjects] = useState([])
  const [projectName, setProjectName] = useState("")

  useEffect(() => {
    // Read saved projects from localStorage
    const keys = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith("sandbox-proj-")) {
        keys.push(key.replace("sandbox-proj-", ""))
      }
    }
    setSavedProjects(keys)
  }, [])

  useEffect(() => {
    sandboxToolRef.current = sandboxTool
  }, [sandboxTool])

  // 1. Load ArcGIS JS SDK from official Esri CDN dynamically
  useEffect(() => {
    if (window.require) {
      setApiLoaded(true)
      return
    }

    // Add ArcGIS CSS Theme
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://js.arcgis.com/4.29/esri/themes/light/main.css'
    link.id = 'arcgis-css'
    document.head.appendChild(link)

    // Add ArcGIS JS Core
    const script = document.createElement('script')
    script.src = 'https://js.arcgis.com/4.29/'
    script.async = true
    script.onload = () => setApiLoaded(true)
    document.body.appendChild(script)

    return () => {
      // Clean up script if desired, but typically we keep it cached
    }
  }, [])

  // 2. Initialize ArcGIS Map & Views when API is loaded
  useEffect(() => {
    if (!apiLoaded || !mapDivRef.current) return

    let view = null
    let map = null

    window.require([
      "esri/Map",
      "esri/views/MapView",
      "esri/views/SceneView",
      "esri/widgets/Search",
      "esri/widgets/Measurement",
      "esri/layers/FeatureLayer",
      "esri/layers/TileLayer"
    ], function(ArcGISMap, MapView, SceneView, Search, Measurement, FeatureLayer, TileLayer) {
      
      // Initialize free public Esri basemap service layers (No API Key Required!)
      const layers = {
        satellite: new TileLayer({
          url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer",
          id: "satellite"
        }),
        streets: new TileLayer({
          url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer",
          id: "streets"
        }),
        'topo-vector': new TileLayer({
          url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer",
          id: "topo-vector"
        }),
        'dark-gray': new TileLayer({
          url: "https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer",
          id: "dark-gray"
        })
      }
      tileLayersRef.current = layers

      // Create Map with the initial active layer
      map = new ArcGISMap({
        layers: [layers[activeBasemap] || layers.satellite],
        ground: 'world-elevation' // Enables 3D terrain elevation!
      })
      mapInstanceRef.current = map

      const initialCenter = [69.2401, 41.2995] // Tashkent [lng, lat] (Esri uses [x,y] order!)
      const initialZoom = 11

      if (mapMode === '3D') {
        // Render 3D SceneView
        view = new SceneView({
          container: mapDivRef.current,
          map: map,
          camera: {
            position: {
              x: 69.2401,
              y: 41.2995,
              z: 5000 // elevation in meters
            },
            tilt: 45, // tilt angle
            heading: 0
          },
          environment: {
            lighting: {
              directShadowsEnabled: true,
              date: new Date("March 15, 2026 12:00:00 UTC")
            }
          }
        })
      } else {
        // Render 2D MapView
        view = new MapView({
          container: mapDivRef.current,
          map: map,
          center: initialCenter,
          zoom: initialZoom
        })
      }

      // Add default ArcGIS widgets
      const searchWidget = new Search({
        view: view
      })
      view.ui.add(searchWidget, {
        position: "top-right",
        index: 2
      })

      // 1. Restore previously uploaded GeoJSON/KML custom layers (from ref to prevent closure recreation)
      if (uploadedLayersRef.current && uploadedLayersRef.current.length > 0) {
        window.require(["esri/layers/GraphicsLayer"], function(GraphicsLayer) {
          uploadedLayersRef.current.forEach((layerData) => {
            const gLayer = new GraphicsLayer({
              title: layerData.name,
              visible: layerData.visible
            })
            gLayer.addMany(layerData.graphics)
            map.add(gLayer)
            graphicsLayersRef.current[layerData.id] = gLayer
          })
        })
      }

      // 2. Initialize and restore Sandbox GraphicsLayer (For 3D City Builder)
      window.require(["esri/layers/GraphicsLayer"], function(GraphicsLayer) {
        const sLayer = new GraphicsLayer({
          title: "Sandbox Layer"
        })
        if (placedGraphicsRef.current && placedGraphicsRef.current.length > 0) {
          sLayer.addMany(placedGraphicsRef.current)
        }
        map.add(sLayer)
        sandboxLayerRef.current = sLayer
      })

      // Add Click Listener to place or erase 3D Objects in Sandbox mode
      view.on("click", (event) => {
        if (activeTabRef.current !== 'sandbox') return

        // 1. Eraser / delete mode
        if (sandboxToolRef.current === 'delete') {
          view.hitTest(event).then((response) => {
            const hit = response.results.find(r => r.graphic && r.graphic.layer === sandboxLayerRef.current)
            if (hit && sandboxLayerRef.current) {
              const deletedType = hit.graphic.attributes?.objectType
              const placedAt = hit.graphic.attributes?.placedAt
              sandboxLayerRef.current.remove(hit.graphic)
              setPlacedGraphics(prev => prev.filter(g => g.attributes?.placedAt !== placedAt))
              
              setPlacedCounts(prev => {
                const count = prev[deletedType] || 0
                return {
                  ...prev,
                  [deletedType]: Math.max(0, count - 1)
                }
              })
              toast.success(lang === 'uz' ? "Ob'ekt o'chirildi" : "Object removed")
            }
          })
          return
        }

        // 1.5. Edit / select mode
        if (sandboxToolRef.current === 'edit') {
          view.hitTest(event).then((response) => {
            const hit = response.results.find(r => r.graphic && r.graphic.layer === sandboxLayerRef.current)
            if (hit) {
              selectedGraphicRef.current = hit.graphic
              const symLayer = hit.graphic.symbol.symbolLayers.getItem(0)
              const h = symLayer.height
              const w = symLayer.width
              const c = symLayer.material.color
              
              // Normalize Esri color format to simple RGB arrays
              const rgbColor = c ? [c.r, c.g, c.b] : [100, 116, 139]
              
              setSelectedGraphic({
                id: hit.graphic.attributes.placedAt,
                type: hit.graphic.attributes.objectType,
                height: h,
                width: w,
                color: rgbColor
              })
              setEditHeight(h)
              setEditWidth(w)
              setEditColor(rgbColor)
              toast.success(lang === 'uz' ? "Ob'ekt tanlandi. Quyida tahrirlashingiz mumkin." : "Object selected. Modify properties below.")
            } else {
              setSelectedGraphic(null)
              selectedGraphicRef.current = null
            }
          })
          return
        }

        // 2. Placing mode
        const tool = sandboxToolRef.current
        if (!tool) return

        const mapPoint = event.mapPoint
        if (mapPoint) {
          window.require(["esri/Graphic"], function(Graphic) {
            let symbol = null
            
            if (tool === 'skyscraper') {
              symbol = {
                type: "point-3d",
                symbolLayers: [{
                  type: "object",
                  resource: { primitive: "cube" },
                  width: 35,
                  depth: 35,
                  height: 140,
                  material: { color: [100, 116, 139] } // slate gray
                }]
              }
            } else if (tool === 'house') {
              symbol = {
                type: "point-3d",
                symbolLayers: [{
                  type: "object",
                  resource: { primitive: "cube" },
                  width: 18,
                  depth: 18,
                  height: 18,
                  material: { color: [239, 68, 68] } // red
                }]
              }
            } else if (tool === 'tree') {
              symbol = {
                type: "point-3d",
                symbolLayers: [{
                  type: "object",
                  resource: { primitive: "cone" },
                  width: 12,
                  depth: 12,
                  height: 35,
                  material: { color: [16, 185, 129] } // emerald green
                }]
              }
            } else if (tool === 'turbine') {
              symbol = {
                type: "point-3d",
                symbolLayers: [{
                  type: "object",
                  resource: { primitive: "cylinder" },
                  width: 4,
                  depth: 4,
                  height: 90,
                  material: { color: [243, 244, 246] } // light white/gray
                }]
              }
            } else if (tool === 'car') {
              symbol = {
                type: "point-3d",
                symbolLayers: [{
                  type: "object",
                  resource: { primitive: "sphere" },
                  width: 8,
                  depth: 14,
                  height: 6,
                  material: { color: [59, 130, 246] } // blue
                }]
              }
            }

            if (symbol && sandboxLayerRef.current) {
              const graphic = new Graphic({
                geometry: mapPoint,
                symbol: symbol,
                attributes: {
                  objectType: tool,
                  placedAt: Date.now()
                }
              })
              sandboxLayerRef.current.add(graphic)
              setPlacedGraphics(prev => [...prev, graphic])

              setPlacedCounts(prev => ({
                ...prev,
                [tool]: (prev[tool] || 0) + 1
              }))
            }
          })
        }
      })

      viewInstanceRef.current = view

      // Invalidate layout after load
      view.when(() => {
        console.log("ArcGIS Map initialized successfully!")
      })
    })

    return () => {
      if (view) {
        view.destroy()
      }
    }
  }, [apiLoaded, mapMode])

  // 3. Handle Basemap Change
  const handleBasemapChange = (basemapType) => {
    setActiveBasemap(basemapType)
    if (mapInstanceRef.current && tileLayersRef.current) {
      // Remove all base tile layers from the map
      Object.values(tileLayersRef.current).forEach(layer => {
        mapInstanceRef.current.remove(layer)
      })
      // Add the chosen public layer at the base (index 0)
      const selectedLayer = tileLayersRef.current[basemapType]
      if (selectedLayer) {
        mapInstanceRef.current.add(selectedLayer, 0)
      }
      toast.success(lang === 'uz' ? "Asos-xarita muvaffaqiyatli o'zgartirildi" : "Basemap changed successfully")
    }
  }

  // 4. Scenic camera fly tour points in Uzbekistan
  const UZ_SCENIC_SPOTS = [
    {
      name: { uz: "Katta Chimyon cho'qqisi (3D)", ru: "Пик Большой Чимган (3D)", en: "Greater Chimgan Peak" },
      coords: { x: 70.0160, y: 41.6201, z: 4200 }, // elevation 4.2km to look down at 3.3km peak
      tilt: 60,
      heading: 180,
      desc: { uz: "Toshkent viloyatining eng yirik tog'lik manzarasi va 3D relyef qatlami.", ru: "Крупнейший горный хребет Ташкентской области с 3D рельефом.", en: "The largest mountain range in Tashkent region featuring real 3D terrain elevation." }
    },
    {
      name: { uz: "Chorvoq suv ombori", ru: "Чарвакское водохранилище", en: "Charvak Reservoir" },
      coords: { x: 70.0298, y: 41.6253, z: 2800 },
      tilt: 50,
      heading: 45,
      desc: { uz: "Tog'lar bag'ridagi ulkan turkuaz suv omborining panoramik ko'rinishi.", ru: "Панорамный вид на бирюзовое водохранилище среди величественных гор.", en: "A panoramic view of the massive turquoise reservoir nestled between mountain ranges." }
    },
    {
      name: { uz: "Registon maydoni, Samarqand", ru: "Площадь Регистан, Самарканд", en: "Registan Square, Samarkand" },
      coords: { x: 66.9757, y: 39.6548, z: 1200 },
      tilt: 40,
      heading: 0,
      desc: { uz: "Qadimiy Registon maydonidagi ulug'vor madrasalar majmuasi.", ru: "Архитектурный ансамбль величественных медресе в Самарканде.", en: "Stunning overview of the ancient Registon Square madrasah complex." }
    },
    {
      name: { uz: "Taxtaqoracha tog' dovoni", ru: "Горный перевал Тахтакарача", en: "Takhtakaracha Pass" },
      coords: { x: 66.9038, y: 39.3528, z: 3100 },
      tilt: 62,
      heading: 135,
      desc: { uz: "Samarqand va Qashqadaryoni bog'lovchi Zaravshan tog' tizmasining 3D qiyaliklari.", ru: "3D рельеф Зарафшанского хребта, соединяющего две области.", en: "3D slopes of the Zarafshan mountain range connecting Samarkand and Kashkadarya." }
    },
    {
      name: { uz: "Toshkent teleminorasi", ru: "Ташкентская телебашня", en: "Tashkent TV Tower" },
      coords: { x: 69.2842, y: 41.3456, z: 1000 },
      tilt: 45,
      heading: 270,
      desc: { uz: "O'rta Osiyodagi eng baland teleminorani tepalikdan 3D vizuallashtirish.", ru: "3D визуализация высочайшей телебашни в Средней Азии.", en: "3D elevation visualization of the tallest television tower in Central Asia." }
    }
  ]

  // 5. Fly-to scenic point using SceneView camera transition
  const flyToSpot = (spot) => {
    if (!viewInstanceRef.current || mapMode !== '3D') {
      toast.error(lang === 'uz' ? "Kamera parvozi faqat 3D rejimda ishlaydi!" : "Camera fly-to is only supported in 3D mode!")
      return
    }

    setIsFlying(true)
    const view = viewInstanceRef.current

    view.goTo({
      position: {
        x: spot.coords.x,
        y: spot.coords.y,
        z: spot.coords.z
      },
      tilt: spot.tilt,
      heading: spot.heading
    }, {
      duration: 3500, // 3.5 seconds smooth transition
      easing: "ease-in-out"
    }).then(() => {
      setIsFlying(false)
      toast.success(lang === 'uz' ? `Siz ${spot.name.uz} dadasiz` : `Arrived at ${spot.name.en}`)
    }).catch((err) => {
      setIsFlying(false)
      console.error(err)
    })
  }

  // 5. Parse KML text to GeoJSON FeatureCollection locally
  const parseKMLtoGeoJSON = (xmlText) => {
    const parser = new DOMParser()
    const xml = parser.parseFromString(xmlText, "text/xml")
    const features = []

    const parseCoords = (coordStr) => {
      return coordStr.trim().split(/\s+/).map(pair => {
        const parts = pair.split(',').map(Number)
        return [parts[0], parts[1]] // [lng, lat]
      })
    }

    const placemarks = xml.getElementsByTagName("Placemark")
    for (let i = 0; i < placemarks.length; i++) {
      const pm = placemarks[i]
      const name = pm.getElementsByTagName("name")[0]?.textContent || `Placemark ${i + 1}`
      let geometry = null

      // Point
      const pt = pm.getElementsByTagName("Point")[0]
      if (pt) {
        const coordStr = pt.getElementsByTagName("coordinates")[0]?.textContent || ""
        const coords = parseCoords(coordStr)[0]
        if (coords) {
          geometry = { type: 'Point', coordinates: coords }
        }
      }

      // LineString
      const ls = pm.getElementsByTagName("LineString")[0]
      if (ls) {
        const coordStr = ls.getElementsByTagName("coordinates")[0]?.textContent || ""
        const coords = parseCoords(coordStr)
        if (coords.length > 0) {
          geometry = { type: 'LineString', coordinates: coords }
        }
      }

      // Polygon
      const poly = pm.getElementsByTagName("Polygon")[0]
      if (poly) {
        const coordStr = poly.getElementsByTagName("coordinates")[0]?.textContent || ""
        const coords = parseCoords(coordStr)
        if (coords.length > 0) {
          geometry = { type: 'Polygon', coordinates: [coords] }
        }
      }

      if (geometry) {
        features.push({
          type: 'Feature',
          geometry,
          properties: { name }
        })
      }
    }

    return { type: 'FeatureCollection', features }
  }

  // 6. Draw GeoJSON features as ArcGIS Graphics onto a new GraphicsLayer
  const renderGeoJSONOnMap = (geojson, fileName) => {
    if (!window.require || !mapInstanceRef.current || !viewInstanceRef.current) {
      toast.error(lang === 'uz' ? "Xarita moduli hali yuklanmadi!" : "Map module not loaded yet!")
      return
    }

    window.require([
      "esri/layers/GraphicsLayer",
      "esri/Graphic",
      "esri/geometry/Point",
      "esri/geometry/Polyline",
      "esri/geometry/Polygon"
    ], function(GraphicsLayer, Graphic, Point, Polyline, Polygon) {
      
      const gLayer = new GraphicsLayer({
        title: fileName
      })

      let graphicsCount = 0
      const graphicsToAdd = []
      const features = geojson.features || (geojson.type === 'Feature' ? [geojson] : [])

      features.forEach((feature) => {
        if (!feature.geometry) return

        const geomType = feature.geometry.type
        const coords = feature.geometry.coordinates

        let arcgisGeometry = null
        let symbol = null

        if (geomType === 'Point') {
          arcgisGeometry = new Point({
            longitude: coords[0],
            latitude: coords[1]
          })
          symbol = {
            type: "simple-marker",
            color: [239, 68, 68], // Red
            size: 10,
            outline: {
              color: [255, 255, 255],
              width: 2
            }
          }
        } else if (geomType === 'MultiPoint') {
          coords.forEach(ptCoords => {
            const pGeom = new Point({
              longitude: ptCoords[0],
              latitude: ptCoords[1]
            })
            const graphic = new Graphic({
              geometry: pGeom,
              symbol: {
                type: "simple-marker",
                color: [239, 68, 68],
                size: 10,
                outline: {
                  color: [255, 255, 255],
                  width: 2
                }
              },
              popupTemplate: {
                title: feature.properties?.name || "GIS Object",
                content: `<table class="esri-widget__table text-xs font-mono">
                  ${Object.entries(feature.properties || {}).map(([key, val]) => `
                    <tr>
                      <td class="esri-widget__table-header" style="padding: 4px; font-weight:bold;">${key}</td>
                      <td class="esri-widget__table-value" style="padding: 4px;">${val}</td>
                    </tr>
                  `).join('')}
                </table>`
              },
              attributes: feature.properties || {}
            })
            graphicsToAdd.push(graphic)
            graphicsCount++
          })
          return
        } else if (geomType === 'LineString') {
          arcgisGeometry = new Polyline({
            paths: [coords]
          })
          symbol = {
            type: "simple-line",
            color: [59, 130, 246], // Blue
            width: 3
          }
        } else if (geomType === 'MultiLineString') {
          arcgisGeometry = new Polyline({
            paths: coords
          })
          symbol = {
            type: "simple-line",
            color: [59, 130, 246], // Blue
            width: 3
          }
        } else if (geomType === 'Polygon') {
          arcgisGeometry = new Polygon({
            rings: coords
          })
          symbol = {
            type: "simple-fill",
            color: [245, 158, 11, 0.4], // Orange
            outline: {
              color: [245, 158, 11],
              width: 2
            }
          }
        } else if (geomType === 'MultiPolygon') {
          arcgisGeometry = new Polygon({
            rings: coords.flat(1)
          })
          symbol = {
            type: "simple-fill",
            color: [245, 158, 11, 0.4],
            outline: {
              color: [245, 158, 11],
              width: 2
            }
          }
        }

        if (arcgisGeometry && symbol) {
          const graphic = new Graphic({
            geometry: arcgisGeometry,
            symbol: symbol,
            popupTemplate: {
              title: feature.properties?.name || "GIS Object",
              content: `<table class="esri-widget__table text-xs font-mono">
                ${Object.entries(feature.properties || {}).map(([key, val]) => `
                  <tr>
                    <td class="esri-widget__table-header" style="padding: 4px; font-weight:bold;">${key}</td>
                    <td class="esri-widget__table-value" style="padding: 4px;">${val}</td>
                  </tr>
                `).join('')}
              </table>`
            },
            attributes: feature.properties || {}
          })
          graphicsToAdd.push(graphic)
          graphicsCount++
        }
      })

      if (graphicsToAdd.length === 0) {
        toast.error(lang === 'uz' ? "Fayl ichidan mos keladigan geografik ob'ektlar topilmadi!" : "No renderable geometries found in the file!")
        return
      }

      gLayer.addMany(graphicsToAdd)
      mapInstanceRef.current.add(gLayer)

      const layerId = `layer-${Date.now()}`
      graphicsLayersRef.current[layerId] = gLayer

      setUploadedLayers(prev => [
        ...prev,
        {
          id: layerId,
          name: fileName,
          graphicsCount: graphicsCount,
          visible: true,
          graphics: graphicsToAdd
        }
      ])

      toast.success(lang === 'uz' ? `${fileName} muvaffaqiyatli yuklandi!` : `${fileName} successfully loaded!`)

      // Zoom view to the newly added graphics
      const view = viewInstanceRef.current
      view.goTo(graphicsToAdd).catch(err => console.error(err))
    })
  }

  // 7. Parse KML file
  const handleKMLFile = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const geojson = parseKMLtoGeoJSON(e.target.result)
        renderGeoJSONOnMap(geojson, file.name)
      } catch (err) {
        toast.error(lang === 'uz' ? "KML faylni o'qishda xatolik!" : "Error parsing KML!")
        console.error(err)
      }
    }
    reader.readAsText(file)
  }

  // 8. Parse GeoJSON file
  const handleGeoJSONFile = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const geojson = JSON.parse(e.target.result)
        renderGeoJSONOnMap(geojson, file.name)
      } catch (err) {
        toast.error(lang === 'uz' ? "GeoJSON fayl xato formatda!" : "Error parsing GeoJSON!")
        console.error(err)
      }
    }
    reader.readAsText(file)
  }

  // 9. Dispatch upload file by type
  const handleUploadFile = (file) => {
    const ext = file.name.split('.').pop().toLowerCase()
    if (ext === 'geojson' || ext === 'json') {
      handleGeoJSONFile(file)
    } else if (ext === 'kml') {
      handleKMLFile(file)
    } else {
      toast.error(lang === 'uz' ? "Faqat GeoJSON va KML fayllar qo'llab-quvvatlanadi!" : "Only GeoJSON and KML files are supported!")
    }
  }

  // 10. Toggle layer visible state
  const handleToggleLayerVisibility = (layerId) => {
    const layer = graphicsLayersRef.current[layerId]
    if (layer) {
      layer.visible = !layer.visible
      setUploadedLayers(prev => prev.map(l => l.id === layerId ? { ...l, visible: layer.visible } : l))
    }
  }

  // 11. Delete layer
  const handleDeleteLayer = (layerId) => {
    const layer = graphicsLayersRef.current[layerId]
    if (layer && mapInstanceRef.current) {
      mapInstanceRef.current.remove(layer)
      delete graphicsLayersRef.current[layerId]
      setUploadedLayers(prev => prev.filter(l => l.id !== layerId))
      toast.success(lang === 'uz' ? "Qatlam o'chirildi" : "Layer removed")
    }
  }

  // 12. Zoom to layer graphics
  const handleZoomToLayer = (layerId) => {
    const layerData = uploadedLayers.find(l => l.id === layerId)
    const view = viewInstanceRef.current
    if (layerData?.graphics && view) {
      view.goTo(layerData.graphics).catch(err => console.error(err))
    }
  }

  // 13. Clear all objects in Sandbox
  const handleClearSandbox = () => {
    if (sandboxLayerRef.current) {
      sandboxLayerRef.current.removeAll()
      setPlacedGraphics([])
      setPlacedCounts({
        skyscraper: 0,
        house: 0,
        tree: 0,
        turbine: 0,
        car: 0
      })
      toast.success(lang === 'uz' ? "Barcha ob'ektlar o'chirildi" : "All sandbox objects cleared")
    }
  }

  // 14. Analyze the placed 3D objects and provide scoring feedback
  const handleAnalyzeProject = () => {
    const total = Object.values(placedCounts).reduce((a, b) => a + b, 0)
    if (total === 0) {
      toast.error(lang === 'uz' ? "Hali hech qanday ob'ekt joylashtirmadingiz!" : "You haven't placed any objects yet!")
      return
    }

    let score = 70
    let feedbackUz = ""
    let feedbackEn = ""

    const { skyscraper, house, tree, turbine, car } = placedCounts

    // Rule 1: Skyscraper vs Tree ratio
    if (skyscraper > 0 && tree === 0) {
      score -= 20
      feedbackUz += "❌ Betonli shahar: Osmono'par binolar ko'p, lekin birorta ham daraxt yo'q! Ekologiya juda yomon.\n"
      feedbackEn += "❌ Concrete Jungle: Skyscrapers placed with zero trees! Very poor ecology.\n"
    } else if (skyscraper > 0 && tree / skyscraper < 1) {
      score -= 10
      feedbackUz += "⚠️ Yashillik kam: Shaharni kislorod bilan ta'minlash uchun ko'proq daraxt eking.\n"
      feedbackEn += "⚠️ Low Greenery: Try planting more trees to offset skyscrapers.\n"
    } else if (tree / (skyscraper + house + 1) >= 2) {
      score += 15
      feedbackUz += "🌳 A'lo darajada yashillik! Tabiat va shahar binolari uyg'unligi ta'minlangan.\n"
      feedbackEn += "🌳 Beautiful Greenery! Excellent balance of nature and urban layout.\n"
    }

    // Rule 2: Green Energy
    if (turbine > 0) {
      score += 10
      feedbackUz += "⚡ Yashil energiya: Shamol generatorlaridan foydalanish ekologik reytingni oshiradi.\n"
      feedbackEn += "⚡ Clean Power: Wind turbines increase the sustainability rating.\n"
    } else if (skyscraper > 2 || house > 5) {
      score -= 5
      feedbackUz += "⚠️ Energiya taqchilligi: Shaharning energiya ehtiyojlarini qoplash uchun shamol turbinalari qo'shing.\n"
      feedbackEn += "⚠️ Power Deficit: Consider placing wind turbines to power the buildings.\n"
    }

    // Rule 3: Vehicles
    if (car > 0 && (skyscraper + house) === 0) {
      score -= 15
      feedbackUz += "❌ Uysiz mashinalar: Binolar yo'q joyda avtomobillar shunchaki tashlab ketilgan.\n"
      feedbackEn += "❌ Unplanned Vehicles: Placed cars in the wild with no buildings.\n"
    }

    score = Math.min(100, Math.max(10, score))

    let titleUz = ""
    let titleEn = ""
    if (score >= 90) {
      titleUz = "🏆 Ekologik Mukammal Shahar"
      titleEn = "🏆 Ecologically Perfect City"
    } else if (score >= 70) {
      titleUz = "🏡 Rivojlanayotgan Muvozanatli Shahar"
      titleEn = "🏡 Balanced Developing Area"
    } else {
      titleUz = "🏗️ Rejasiz Zich Qurilgan Hudud"
      titleEn = "🏗️ Unplanned High-Density Zone"
    }

    toast(
      (t) => (
        <div className="text-xs space-y-2 p-1">
          <div className="font-extrabold text-sm text-primary-600 dark:text-primary-400">{lang === 'uz' ? titleUz : titleEn}</div>
          <div className="font-bold text-gray-500 font-mono">Score: {score} / 100</div>
          <p className="text-[11px] whitespace-pre-line text-gray-700 dark:text-gray-300 leading-relaxed mt-1">
            {lang === 'uz' ? feedbackUz || "Tuzilma ajoyib, barcha resurslar muvozanatda!" : feedbackEn || "Great structure, resources are in balance!"}
          </p>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full mt-2 py-1 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-bold text-[10px]"
          >
            Ok
          </button>
        </div>
      ),
      { duration: 7500 }
    )
  }

  // 15. Update selected 3D object properties dynamically
  const handleUpdateSelectedProperties = (height, width, color) => {
    if (!selectedGraphicRef.current || !sandboxLayerRef.current) return

    const graphic = selectedGraphicRef.current
    const type = graphic.attributes.objectType

    const updatedSymbol = {
      type: "point-3d",
      symbolLayers: [{
        type: "object",
        resource: { 
          primitive: type === 'tree' ? 'cone' : (type === 'car' ? 'sphere' : (type === 'turbine' ? 'cylinder' : 'cube')) 
        },
        width: width,
        depth: width,
        height: height,
        material: { color: color }
      }]
    }

    const clone = graphic.clone()
    clone.symbol = updatedSymbol
    
    sandboxLayerRef.current.remove(graphic)
    sandboxLayerRef.current.add(clone)
    selectedGraphicRef.current = clone

    setPlacedGraphics(prev => prev.map(g => g.attributes?.placedAt === graphic.attributes?.placedAt ? clone : g))

    setEditHeight(height)
    setEditWidth(width)
    setEditColor(color)
    setSelectedGraphic(prev => ({
      ...prev,
      height,
      width,
      color
    }))
  }

  // 16. Change Time of Day to cast dynamic shadows
  const handleTimeOfDayChange = (hour) => {
    setTimeOfDay(hour)
    if (viewInstanceRef.current && mapMode === '3D') {
      const date = new Date("March 15, 2026 12:00:00 UTC")
      date.setHours(hour)
      date.setMinutes(0)
      viewInstanceRef.current.environment.lighting.date = date
    }
  }

  // 17. Save current sandbox layout to localStorage
  const handleSaveProject = () => {
    if (!projectName.trim()) {
      toast.error(lang === 'uz' ? "Loyiha nomini kiriting!" : "Enter project name!")
      return
    }

    if (!sandboxLayerRef.current || sandboxLayerRef.current.graphics.length === 0) {
      toast.error(lang === 'uz' ? "Saqlash uchun hech qanday ob'ekt yo'q!" : "No objects to save!")
      return
    }

    // Serialize graphics
    const serialized = sandboxLayerRef.current.graphics.map(g => ({
      x: g.geometry.x,
      y: g.geometry.y,
      z: g.geometry.z,
      spatialReference: g.geometry.spatialReference.toJSON(),
      type: g.attributes.objectType,
      height: g.symbol.symbolLayers.getItem(0).height,
      width: g.symbol.symbolLayers.getItem(0).width,
      color: g.symbol.symbolLayers.getItem(0).material.color
    })).toArray()

    localStorage.setItem(`sandbox-proj-${projectName.trim()}`, JSON.stringify(serialized))
    
    setSavedProjects(prev => {
      if (!prev.includes(projectName.trim())) {
        return [...prev, projectName.trim()]
      }
      return prev
    })
    
    setProjectName("")
    toast.success(lang === 'uz' ? "Loyiha muvaffaqiyatli saqlandi!" : "Project saved successfully!")
  }

  // 18. Load sandbox layout from localStorage
  const handleLoadProject = (name) => {
    const dataStr = localStorage.getItem(`sandbox-proj-${name}`)
    if (!dataStr || !window.require || !sandboxLayerRef.current) return

    const data = JSON.parse(dataStr)
    sandboxLayerRef.current.removeAll()

    window.require(["esri/Graphic", "esri/geometry/Point"], function(Graphic, Point) {
      const counts = { skyscraper: 0, house: 0, tree: 0, turbine: 0, car: 0 }
      const graphicsToAdd = []

      data.forEach(item => {
        const point = new Point({
          x: item.x,
          y: item.y,
          z: item.z,
          spatialReference: item.spatialReference
        })

        const symbol = {
          type: "point-3d",
          symbolLayers: [{
            type: "object",
            resource: { 
              primitive: item.type === 'tree' ? 'cone' : (item.type === 'car' ? 'sphere' : (item.type === 'turbine' ? 'cylinder' : 'cube')) 
            },
            width: item.width,
            depth: item.width,
            height: item.height,
            material: { color: item.color }
          }]
        }

        const graphic = new Graphic({
          geometry: point,
          symbol: symbol,
          attributes: {
            objectType: item.type,
            placedAt: Date.now() + Math.random()
          }
        })
        graphicsToAdd.push(graphic)
        counts[item.type] = (counts[item.type] || 0) + 1
      })

      sandboxLayerRef.current.addMany(graphicsToAdd)
      setPlacedGraphics(graphicsToAdd)
      setPlacedCounts(counts)
      toast.success(lang === 'uz' ? `${name} loyihasi yuklandi!` : `${name} project loaded!`)

      // Zoom view to loaded graphics bounds
      if (viewInstanceRef.current && graphicsToAdd.length > 0) {
        viewInstanceRef.current.goTo(graphicsToAdd).catch(err => console.error(err))
      }
    })
  }

  // 19. Delete saved project from localStorage
  const handleDeleteProject = (name) => {
    localStorage.removeItem(`sandbox-proj-${name}`)
    setSavedProjects(prev => prev.filter(p => p !== name))
    toast.success(lang === 'uz' ? "Loyiha o'chirib tashlandi" : "Project deleted")
  }

  // 20. Camera presets (Top, Side, Rotate)
  const handleCameraPreset = (presetType) => {
    const view = viewInstanceRef.current
    if (!view || mapMode !== '3D') {
      toast.error(lang === 'uz' ? "Kamera burchaklari faqat 3D rejimda ishlaydi!" : "Camera presets only work in 3D mode!")
      return
    }

    if (presetType === 'top') {
      view.goTo({
        tilt: 0,
        heading: 0
      }, { duration: 1500 })
    } else if (presetType === 'landscape') {
      view.goTo({
        tilt: 72,
        heading: 35
      }, { duration: 1500 })
    } else if (presetType === 'rotate') {
      const nextHeading = (view.camera.heading + 90) % 360
      view.goTo({
        heading: nextHeading
      }, { duration: 1500 })
    }
  }


  return (
    <div className="relative w-full h-[calc(100vh-64px)] flex flex-col md:flex-row overflow-hidden bg-gray-50 dark:bg-gray-950">
      
      {/* Sidebar Controls (Tour Panel & Configuration) */}
      <div className="w-full md:w-[360px] bg-white dark:bg-gray-900 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800 flex flex-col z-20">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-150 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="text-primary-500 animate-spin-slow" size={20} />
            <h1 className="font-extrabold text-base text-gray-900 dark:text-white">ArcGIS 3D Analyst</h1>
          </div>
          <span className="flex items-center gap-1 bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 px-2 py-0.5 rounded text-[10px] font-bold">
            <Sparkles size={10} /> Esri SDK
          </span>
        </div>

        {/* View Mode & Basemaps Configuration */}
        <div className="p-4 space-y-4 border-b border-gray-150 dark:border-gray-800">
          
          {/* 2D / 3D Toggle */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{lang === 'uz' ? 'Xarita o\'lchami' : 'Map Dimension'}</p>
            <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl flex gap-1">
              <button
                onClick={() => setMapMode('2D')}
                className={clsx(
                  "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5",
                  mapMode === '2D' ? "bg-white dark:bg-gray-700 text-gray-950 dark:text-white shadow" : "text-gray-500 dark:text-gray-400"
                )}
              >
                <MapIcon size={14} /> 2D Map
              </button>
              <button
                onClick={() => setMapMode('3D')}
                className={clsx(
                  "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5",
                  mapMode === '3D' ? "bg-white dark:bg-gray-700 text-gray-950 dark:text-white shadow" : "text-gray-500 dark:text-gray-400"
                )}
              >
                <Globe size={14} /> 3D Scene
              </button>
            </div>
          </div>

          {/* Basemaps Gallery */}
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{lang === 'uz' ? 'Asos-xarita' : 'Basemap Layer'}</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'satellite', name: 'Sun\'iy yo\'ldosh', icon: '🛰️' },
                { id: 'streets', name: 'Ko\'chalar', icon: '🛣️' },
                { id: 'topo-vector', name: 'Topografik', icon: '🏔️' },
                { id: 'dark-gray', name: 'Tungi rejim', icon: '🌃' }
              ].map((bm) => (
                <button
                  key={bm.id}
                  onClick={() => handleBasemapChange(bm.id)}
                  className={clsx(
                    "p-2 text-left text-xs rounded-xl border transition-all flex items-center gap-1.5",
                    activeBasemap === bm.id
                      ? "bg-primary-50 dark:bg-primary-950/40 border-primary-500 dark:border-primary-400 text-primary-950 dark:text-primary-400 font-bold"
                      : "bg-white dark:bg-gray-900 border-gray-150 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  )}
                >
                  <span>{bm.icon}</span>
                  <span className="truncate">{bm.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-4 flex gap-4 border-b border-gray-150 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/10">
          <button
            onClick={() => setActiveTab('tour')}
            className={clsx(
              "pb-2.5 pt-1 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5",
              activeTab === 'tour'
                ? "border-primary-500 text-primary-600 dark:text-primary-400 font-extrabold"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
            )}
          >
            🧭 3D Sayohat
          </button>
          <button
            onClick={() => setActiveTab('layers')}
            className={clsx(
              "pb-2.5 pt-1 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5",
              activeTab === 'layers'
                ? "border-primary-500 text-primary-600 dark:text-primary-400 font-extrabold"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
            )}
          >
            📂 GIS Yuklash
          </button>
          <button
            onClick={() => setActiveTab('sandbox')}
            className={clsx(
              "pb-2.5 pt-1 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5",
              activeTab === 'sandbox'
                ? "border-primary-500 text-primary-600 dark:text-primary-400 font-extrabold"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white"
            )}
          >
            🏗️ 3D Sandbox
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* TOUR TAB */}
          {activeTab === 'tour' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  {lang === 'uz' ? '3D Kamera Sayohatlari' : '3D Camera Fly Tour'}
                </p>
                {isFlying && <Loader2 size={12} className="animate-spin text-primary-500" />}
              </div>

              <div className="space-y-2.5">
                {UZ_SCENIC_SPOTS.map((spot, idx) => (
                  <button
                    key={idx}
                    onClick={() => flyToSpot(spot)}
                    disabled={isFlying}
                    className="w-full text-left bg-gray-50 dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-3 rounded-2xl hover:border-primary-400 dark:hover:border-primary-500 hover:shadow-md transition-all flex flex-col space-y-1 group disabled:opacity-50"
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="font-extrabold text-xs text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {spot.name[lang] || spot.name.uz}
                      </span>
                      <Navigation size={12} className="text-gray-400 group-hover:text-primary-500 rotate-45 group-hover:rotate-[90deg] transition-all" />
                    </div>
                    <p className="text-[10px] text-gray-450 dark:text-gray-500 leading-snug">
                      {spot.desc[lang] || spot.desc.uz}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* LAYERS TAB */}
          {activeTab === 'layers' && (
            <div className="space-y-4 animate-fade-in">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                {lang === 'uz' ? 'Fazoviy fayllarni yuklash' : 'Upload Spatial Data'}
              </p>

              {/* Drag & Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const file = e.dataTransfer.files[0];
                  if (file) handleUploadFile(file);
                }}
                className={clsx(
                  "border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all space-y-2 relative",
                  isDragging
                    ? "border-primary-500 bg-primary-50/20 dark:bg-primary-950/10"
                    : "border-gray-200 dark:border-gray-800 hover:border-primary-400 bg-gray-50 dark:bg-gray-900/40"
                )}
              >
                <UploadCloud size={28} className="mx-auto text-gray-400 dark:text-gray-500" />
                <div>
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {lang === 'uz' ? 'GeoJSON yoki KML faylni tashlang' : 'Drop GeoJSON or KML here'}
                  </p>
                  <p className="text-[9px] text-gray-450 dark:text-gray-500 mt-1">
                    {lang === 'uz' ? 'yoki bosib kompyuterdan tanlang' : 'or click to choose file'}
                  </p>
                </div>
                <input
                  type="file"
                  accept=".geojson,.json,.kml"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUploadFile(file);
                  }}
                  className="hidden"
                  id="gis-file-input"
                />
                <label htmlFor="gis-file-input" className="absolute inset-0 cursor-pointer" />
              </div>

              {/* Uploaded Layers List */}
              <div className="space-y-2">
                <div className="flex justify-between items-center pr-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-0.5">
                    {lang === 'uz' ? 'Yuklangan Qatlamlar' : 'Loaded Layers'} ({uploadedLayers.length})
                  </p>
                </div>

                {uploadedLayers.length === 0 ? (
                  <div className="text-center p-6 bg-gray-50 dark:bg-gray-900/40 border border-gray-150 dark:border-gray-800 rounded-2xl">
                    <p className="text-[11px] text-gray-400 italic">
                      {lang === 'uz' ? 'Hech qanday qatlam yuklanmadi' : 'No custom layers loaded yet'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {uploadedLayers.map((layer) => (
                      <div
                        key={layer.id}
                        className="bg-gray-50 dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-3 rounded-2xl flex items-center justify-between gap-2"
                      >
                        <div className="text-left min-w-0 flex-1">
                          <p className="font-extrabold text-xs text-gray-800 dark:text-gray-250 truncate" title={layer.name}>
                            {layer.name}
                          </p>
                          <p className="text-[9px] text-gray-450 dark:text-gray-500 font-mono mt-0.5">
                            {layer.graphicsCount} features
                          </p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleZoomToLayer(layer.id)}
                            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-lg transition-all"
                            title="Xaritada ko'rsatish"
                          >
                            <Navigation size={12} className="rotate-45" />
                          </button>
                          <button
                            onClick={() => handleToggleLayerVisibility(layer.id)}
                            className={clsx(
                              "p-1.5 rounded-lg transition-all",
                              layer.visible 
                                ? "hover:bg-gray-200 dark:hover:bg-gray-800 text-emerald-500" 
                                : "hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-400"
                            )}
                            title={layer.visible ? "Yashirish" : "Ko'rsatish"}
                          >
                            {layer.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                          </button>
                          <button
                            onClick={() => handleDeleteLayer(layer.id)}
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-500 rounded-lg transition-all"
                            title="O'chirish"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SANDBOX TAB */}
          {activeTab === 'sandbox' && (
            <div className="space-y-4 animate-fade-in">
              
              {/* OBJECT EDIT PANEL IF SELECTED */}
              {selectedGraphic ? (
                <div className="bg-primary-50/30 dark:bg-gray-900 border border-primary-200 dark:border-gray-800 p-4 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-150 dark:border-gray-850">
                    <span className="font-extrabold text-xs text-primary-950 dark:text-primary-400 flex items-center gap-1.5">
                      ✏️ {lang === 'uz' ? 'Ob\'ektni Tahrirlash' : 'Edit Object'} ({selectedGraphic.type})
                    </span>
                    <button
                      onClick={() => {
                        setSelectedGraphic(null)
                        selectedGraphicRef.current = null
                      }}
                      className="text-[10px] text-gray-500 font-bold bg-white dark:bg-gray-800 px-2.5 py-1 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100"
                    >
                      {lang === 'uz' ? 'Yopish' : 'Close'}
                    </button>
                  </div>

                  {/* Height Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-gray-500">{lang === 'uz' ? 'Balandlik:' : 'Height:'}</span>
                      <span className="text-primary-700 dark:text-primary-400 font-mono">{editHeight} m</span>
                    </div>
                    <input
                      type="range"
                      min={selectedGraphic.type === 'tree' ? 5 : (selectedGraphic.type === 'car' ? 2 : 10)}
                      max={selectedGraphic.type === 'tree' ? 80 : (selectedGraphic.type === 'car' ? 25 : 400)}
                      value={editHeight}
                      onChange={(e) => {
                        const h = Number(e.target.value)
                        handleUpdateSelectedProperties(h, editWidth, editColor)
                      }}
                      className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
                    />
                  </div>

                  {/* Width Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-gray-500">{lang === 'uz' ? 'Kenglik:' : 'Width:'}</span>
                      <span className="text-primary-700 dark:text-primary-400 font-mono">{editWidth} m</span>
                    </div>
                    <input
                      type="range"
                      min={selectedGraphic.type === 'tree' ? 3 : (selectedGraphic.type === 'car' ? 2 : 5)}
                      max={selectedGraphic.type === 'tree' ? 40 : (selectedGraphic.type === 'car' ? 15 : 120)}
                      value={editWidth}
                      onChange={(e) => {
                        const w = Number(e.target.value)
                        handleUpdateSelectedProperties(editHeight, w, editColor)
                      }}
                      className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
                    />
                  </div>

                  {/* Theme Colors */}
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{lang === 'uz' ? 'Rang tanlash' : 'Select Color'}</p>
                    <div className="flex gap-2">
                      {[
                        { rgb: [100, 116, 139], hex: '#64748b', name: 'Gray' },
                        { rgb: [239, 68, 68], hex: '#ef4444', name: 'Red' },
                        { rgb: [16, 185, 129], hex: '#10b981', name: 'Green' },
                        { rgb: [59, 130, 246], hex: '#3b82f6', name: 'Blue' },
                        { rgb: [245, 158, 11], hex: '#f59e0b', name: 'Orange' },
                        { rgb: [139, 92, 246], hex: '#8b5cf6', name: 'Purple' }
                      ].map((col, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleUpdateSelectedProperties(editHeight, editWidth, col.rgb)}
                          className={clsx(
                            "w-6 h-6 rounded-full border-2 transition-all hover:scale-110",
                            JSON.stringify(editColor) === JSON.stringify(col.rgb)
                              ? "border-primary-600 scale-105 shadow-sm"
                              : "border-transparent"
                          )}
                          style={{ backgroundColor: col.hex }}
                          title={col.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* SECTION 1: placement tools */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-0.5">
                      {lang === 'uz' ? '🏗️ 3D Asboblar' : '🏗️ 3D Tools'}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'skyscraper', name: 'Osmono\'par bino', icon: '🏢', count: placedCounts.skyscraper },
                        { id: 'house', name: 'Turar-joy', icon: '🏠', count: placedCounts.house },
                        { id: 'tree', name: 'Daraxt', icon: '🌳', count: placedCounts.tree },
                        { id: 'turbine', name: 'Turbina', icon: '🌬️', count: placedCounts.turbine },
                        { id: 'car', name: 'Avtomobil', icon: '🚗', count: placedCounts.car }
                      ].map((tool) => (
                        <button
                          key={tool.id}
                          onClick={() => setSandboxTool(sandboxTool === tool.id ? null : tool.id)}
                          className={clsx(
                            "p-3 rounded-2xl border text-left transition-all flex flex-col justify-between h-20 relative overflow-hidden group",
                            sandboxTool === tool.id
                              ? "bg-primary-50 dark:bg-primary-950/40 border-primary-500 text-primary-950 dark:text-primary-400 font-extrabold shadow-sm"
                              : "bg-white dark:bg-gray-900 border-gray-150 dark:border-gray-800 text-gray-750 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                          )}
                        >
                          <div className="flex justify-between items-start w-full">
                            <span className="text-xl">{tool.icon}</span>
                            <span className="text-[10px] font-mono bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded-md font-bold">
                              {tool.count}
                            </span>
                          </div>
                          <span className="text-[11px] font-extrabold truncate">{tool.name}</span>
                        </button>
                      ))}

                      {/* Edit Tool Toggle */}
                      <button
                        onClick={() => setSandboxTool(sandboxTool === 'edit' ? null : 'edit')}
                        className={clsx(
                          "p-3 rounded-2xl border text-left transition-all flex flex-col justify-between h-20",
                          sandboxTool === 'edit'
                            ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-extrabold"
                            : "bg-white dark:bg-gray-900 border-gray-150 dark:border-gray-800 text-gray-750 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                        )}
                      >
                        <span className="text-xl">✏️</span>
                        <div>
                          <span className="text-[11px] font-extrabold block">{lang === 'uz' ? 'Tahrirlash' : 'Edit Mode'}</span>
                          <span className="text-[9px] text-gray-450">{lang === 'uz' ? 'Ob\'ektni tanlash' : 'Resize shapes'}</span>
                        </div>
                      </button>

                      {/* Eraser Tool */}
                      <button
                        onClick={() => setSandboxTool(sandboxTool === 'delete' ? null : 'delete')}
                        className={clsx(
                          "p-3 rounded-2xl border text-left transition-all flex flex-col justify-between h-20 col-span-2",
                          sandboxTool === 'delete'
                            ? "bg-red-50 dark:bg-red-950/20 border-red-500 text-red-700 dark:text-red-400 font-extrabold"
                            : "bg-white dark:bg-gray-900 border-gray-150 dark:border-gray-800 text-gray-755 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                        )}
                      >
                        <div className="flex justify-between items-center w-full">
                          <span className="text-sm font-bold">{lang === 'uz' ? '🧹 O\'chirish rejimi' : '🧹 Eraser Mode'}</span>
                          <span className="text-[9px] text-gray-455">{lang === 'uz' ? 'Ob\'ektni bosing' : 'Click to erase'}</span>
                        </div>
                        <span className="text-[10px] text-gray-500 leading-snug">
                          {lang === 'uz' ? 'Xaridadagi ob\'ektlarni bosib olib tashlang.' : 'Remove placed objects from terrain.'}
                        </span>
                      </button>
                    </div>

                    {/* Action controls */}
                    <div className="pt-2 flex gap-2">
                      <button
                        onClick={handleAnalyzeProject}
                        className="flex-1 py-2 px-3 bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5"
                      >
                        📊 {lang === 'uz' ? 'Loyihani baholash' : 'Evaluate Project'}
                      </button>
                      <button
                        onClick={handleClearSandbox}
                        className="py-2 px-3 bg-gray-150 dark:bg-gray-850 hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-750 dark:text-gray-300 font-bold text-xs rounded-xl transition-all"
                        title={lang === 'uz' ? 'Barchasini tozalash' : 'Clear All'}
                      >
                        {lang === 'uz' ? 'Tozalash' : 'Clear'}
                      </button>
                    </div>
                  </div>

                  <hr className="border-gray-150 dark:border-gray-850" />

                  {/* SECTION 2: Lighting, shadows and camera presets */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-0.5">
                      {lang === 'uz' ? '⚙️ Atrof-muhit va Soya' : '⚙️ Lighting & Shadows'}
                    </p>

                    {/* Solar daylight slider */}
                    <div className="space-y-1 bg-gray-50 dark:bg-gray-900/30 border border-gray-150 dark:border-gray-850 p-3 rounded-2xl">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-gray-500">{lang === 'uz' ? 'Kun vaqti:' : 'Time of Day:'}</span>
                        <span className="text-primary-600 dark:text-primary-400 font-mono">
                          {timeOfDay >= 18 ? '🌙' : '☀️'} {timeOfDay}:00 {timeOfDay >= 12 ? 'PM' : 'AM'}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="6"
                        max="21"
                        value={timeOfDay}
                        onChange={(e) => handleTimeOfDayChange(Number(e.target.value))}
                        className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
                      />
                      <p className="text-[9px] text-gray-450 leading-relaxed mt-1">
                        {lang === 'uz' ? 'Slayderni surib, binolar soyasini o\'zgarishini kuzating.' : 'Move slider to cast realistic shadows based on sun angle.'}
                      </p>
                    </div>

                    {/* Camera Presets */}
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-400 font-semibold">{lang === 'uz' ? 'Kamera burchaklari:' : 'Camera Presets:'}</p>
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          onClick={() => handleCameraPreset('top')}
                          className="py-1 px-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-[10px] font-bold text-gray-700 dark:text-gray-300 rounded-lg transition-all"
                        >
                          📐 {lang === 'uz' ? 'Tepadan' : 'Top'}
                        </button>
                        <button
                          onClick={() => handleCameraPreset('landscape')}
                          className="py-1 px-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-[10px] font-bold text-gray-700 dark:text-gray-300 rounded-lg transition-all"
                        >
                          🔭 {lang === 'uz' ? 'Yonbosh' : 'Landscape'}
                        </button>
                        <button
                          onClick={() => handleCameraPreset('rotate')}
                          className="py-1 px-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-[10px] font-bold text-gray-700 dark:text-gray-300 rounded-lg transition-all"
                        >
                          🔄 {lang === 'uz' ? 'Burish' : 'Orbit'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <hr className="border-gray-150 dark:border-gray-850" />

                  {/* SECTION 3: Save and Load Layout */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-0.5">
                      {lang === 'uz' ? '💾 Loyihani Saqlash / Yuklash' : '💾 Project Manager'}
                    </p>

                    {/* Save layout form */}
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder={lang === 'uz' ? 'Loyiha nomi...' : 'Project name...'}
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="flex-1 py-1.5 px-3 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs rounded-xl focus:border-primary-500 focus:outline-none dark:text-white"
                      />
                      <button
                        onClick={handleSaveProject}
                        className="py-1.5 px-3 bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-xs rounded-xl transition-all"
                      >
                        {lang === 'uz' ? 'Saqlash' : 'Save'}
                      </button>
                    </div>

                    {/* Saved list */}
                    <div className="space-y-1.5">
                      {savedProjects.length > 0 && (
                        <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                          {savedProjects.map((name, idx) => (
                            <div
                              key={idx}
                              className="bg-gray-50 dark:bg-gray-900 border border-gray-150 dark:border-gray-850 p-2 rounded-xl flex items-center justify-between gap-2"
                            >
                              <span className="font-extrabold text-[11px] text-gray-800 dark:text-gray-200 truncate flex-1 font-sans">
                                🏙️ {name}
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleLoadProject(name)}
                                  className="py-0.5 px-2 bg-primary-50 hover:bg-primary-100 dark:bg-primary-950/40 text-[9px] font-extrabold text-primary-600 rounded-md transition-all font-sans"
                                >
                                  {lang === 'uz' ? 'Yuklash' : 'Load'}
                                </button>
                                <button
                                  onClick={() => handleDeleteProject(name)}
                                  className="p-1 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-500 rounded-md transition-all"
                                  title="O'chirish"
                                >
                                  <Trash2 size={10} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Sandbox Tip Card */}
              {sandboxTool && sandboxTool !== 'delete' && !selectedGraphic && (
                <div className="p-3 bg-primary-50/40 dark:bg-primary-950/10 border border-primary-100/50 dark:border-primary-950/50 rounded-2xl animate-pulse">
                  <p className="text-[10px] text-primary-750 dark:text-primary-400 font-semibold leading-relaxed">
                    💡 <strong>{lang === 'uz' ? 'Faol Rejim' : 'Active Mode'}</strong>: {
                      sandboxTool === 'edit'
                        ? (lang === 'uz' ? 'Xaridadagi joylashtirilgan 3D ob\'ektni ustiga bosib uni tanlang.' : 'Click on any placed 3D shape on the map to edit its details.')
                        : (lang === 'uz' ? 'Endi xaritada istalgan tog\', tekislik yoki ko\'cha ustiga bosib 3D ob\'ekt joylashtirishingiz mumkin.' : 'Click anywhere on the map terrain, valleys, or streets to build in 3D.')
                    }
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Map Viewport Container */}
      <div className="flex-1 relative z-10 bg-gray-900 h-full min-h-[400px] md:min-h-0">
        
        {/* SDK Loading overlay */}
        {!apiLoaded && (
          <div className="absolute inset-0 z-30 bg-gray-900 flex flex-col items-center justify-center text-white space-y-3">
            <Loader2 className="animate-spin text-primary-500" size={36} />
            <div className="text-center space-y-1">
              <p className="text-sm font-extrabold">ArcGIS SDK yuklanmoqda...</p>
              <p className="text-[11px] text-gray-400">Esri CDN orqali resurslar yuklanmoqda</p>
            </div>
          </div>
        )}

        {/* Map Div */}
        <div ref={mapDivRef} className="absolute inset-0 w-full h-full" style={{ width: '100%', height: '100%' }} />

        {/* Floating Help Badge */}
        {apiLoaded && (
          <div className="absolute bottom-4 left-4 z-20 bg-black/70 backdrop-blur text-white text-[10px] font-mono p-2.5 rounded-xl border border-white/10 flex items-center gap-1.5 shadow-lg select-none pointer-events-none">
            <Compass size={12} className="text-emerald-400" />
            <span>
              {mapMode === '3D' 
                ? '3D rejimda: Sichqoncha chap tugmasi + CTRL orqali burchakni o\'zgartiring' 
                : '2D rejim faollashtirildi'}
            </span>
          </div>
        )}
      </div>

    </div>
  )
}
