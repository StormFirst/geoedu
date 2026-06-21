import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useAuth } from '../../context/AuthContext'
import {
  Gamepad2, Trophy, Navigation, ArrowLeft, RefreshCcw,
  CheckCircle, Play, ChevronRight, Award, Compass, Star
} from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

// Earth radius in meters
const EARTH_RADIUS = 6378137.0

// Game Coordinates List (historical landmarks & city centers in Uzbekistan)
const GAME_LOCATIONS = [
  {
    id: 'loc-1',
    target: { lat: 39.6542, lng: 66.9597 },
    name: {
      uz: 'Registon maydoni, Samarqand',
      ru: 'Площадь Регистан, Самарканд',
      en: 'Registan Square, Samarkand'
    },
    hint: {
      uz: 'Samarqand shahri markazidagi tarixiy me\'moriy obidalar ansambli.',
      ru: 'Исторический ансамбль в центре Самарканда.',
      en: 'Historical architectural ensemble in the center of Samarkand.'
    }
  },
  {
    id: 'loc-2',
    target: { lat: 41.3111, lng: 69.2406 },
    name: {
      uz: 'Amir Temur xiyoboni, Toshkent',
      ru: 'Сквер Амира Темура, Ташкент',
      en: 'Amir Temur Square, Tashkent'
    },
    hint: {
      uz: 'Toshkent shahri markazidagi bosh xiyobon va aylanma yo\'l.',
      ru: 'Главный сквер и кольцевая развязка в центре Ташкента.',
      en: 'Main square and roundabout in the center of Tashkent.'
    }
  },
  {
    id: 'loc-3',
    target: { lat: 39.7777, lng: 64.4108 },
    name: {
      uz: 'Ark qal\'asi, Buxoro',
      ru: 'Крепость Арк, Бухара',
      en: 'Ark of Bukhara, Bukhara'
    },
    hint: {
      uz: 'Buxoro shahridagi qadimiy shahar-qal\'a (ark).',
      ru: 'Древняя городская цитадель (арк) в Бухаре.',
      en: 'Ancient city citadel (ark) in Bukhara.'
    }
  },
  {
    id: 'loc-4',
    target: { lat: 41.3783, lng: 60.3601 },
    name: {
      uz: 'Ichan Qal\'a, Xiva',
      ru: 'Ичан-Кала, Хива',
      en: 'Itchan Kala, Khiva'
    },
    hint: {
      uz: 'Xiva shahridagi devor bilan o\'ralgan qadimiy ichki shahar.',
      ru: 'Древний внутренний город, окруженный стеной в Хиве.',
      en: 'Ancient walled inner town in the city of Khiva.'
    }
  },
  {
    id: 'loc-5',
    target: { lat: 42.4647, lng: 59.6019 },
    name: {
      uz: 'Savitskiy san\'at muzeyi, Nukus',
      ru: 'Музей искусств им. Савицкого, Нукус',
      en: 'Savitsky Art Museum, Nukus'
    },
    hint: {
      uz: 'Qoraqalpog\'iston poytaxtidagi mashhur rus avangard san\'at muzeyi.',
      ru: 'Знаменитый музей русского авангарда в столице Каракалпакстана.',
      en: 'Famous Russian avant-garde art museum in the capital of Karakalpakstan.'
    }
  },
  {
    id: 'loc-6',
    target: { lat: 40.7833, lng: 72.3500 },
    name: {
      uz: 'Bobur maydoni, Andijon',
      ru: 'Площадь Бабура, Андижан',
      en: 'Babur Square, Andijan'
    },
    hint: {
      uz: 'Andijon shahridagi asosiy tarixiy va ma\'muriy markaz.',
      ru: 'Главный исторический и административный центр Андижана.',
      en: 'Main historical and administrative center of Andijan.'
    }
  },
  {
    id: 'loc-7',
    target: { lat: 41.0011, lng: 71.6683 },
    name: {
      uz: 'Afsonalar vodiysi bog\'i, Namangan',
      ru: 'Парк Долина Легенд, Наманган',
      en: 'Valley of Legends Park, Namangan'
    },
    hint: {
      uz: 'Namangan shahri shimolidagi yirik zamonaviy istirohat bog\'i.',
      ru: 'Крупный современный тематический парк на севере Намангана.',
      en: 'Large modern theme park in the north of Namangan.'
    }
  },
  {
    id: 'loc-8',
    target: { lat: 40.3842, lng: 71.7878 },
    name: {
      uz: 'Al-Fargoniy bog\'i, Farg\'ona',
      ru: 'Парк Аль-Фергани, Фергана',
      en: 'Al-Fergani Park, Fergana'
    },
    hint: {
      uz: 'Farg\'ona shahri markazidagi mashhur tarixiy istirohat maskani.',
      ru: 'Популярный исторический парк в центре Ферганы.',
      en: 'Popular historical park in the center of Fergana.'
    }
  },
  {
    id: 'loc-9',
    target: { lat: 37.2242, lng: 67.2783 },
    name: {
      uz: 'Sulton Saodat majmuasi, Termiz',
      ru: 'Комплекс Султан Саодат, Термез',
      en: 'Sultan Saodat Complex, Termez'
    },
    hint: {
      uz: 'Termiz yaqinidagi qadimiy sayyidlar xonadoni maqbaralari.',
      ru: 'Древние мавзолеи династии сайидов близ Термеза.',
      en: 'Ancient mausoleums of Sayyid dynasty near Termez.'
    }
  },
  {
    id: 'loc-10',
    target: { lat: 38.8617, lng: 65.7892 },
    name: {
      uz: 'Ko\'k Gumbaz masjidi, Qarshi',
      ru: 'Мечеть Кок-Гумбез, Карши',
      en: 'Kok Gumbaz Mosque, Karshi'
    },
    hint: {
      uz: 'Qarshi shahridagi Temuriylar davriga oid ko\'k gumbazli masjid.',
      ru: 'Мечеть с синим куполом эпохи Тимуридов в Карши.',
      en: 'Blue-domed mosque from the Timurid era in Karshi.'
    }
  }
]

// Helper: Custom SVG Icon for click & target markers
const createMarkerIcon = (type = 'click') => {
  const color = type === 'target' ? '#10b981' : '#ef4444'
  const svg = type === 'target'
    ? `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" style="width: 32px; height: 32px; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.3));">
        <path fill-rule="evenodd" d="M3 2.25a.75.75 0 01.75.75v.54l1.838-.46a9.75 9.75 0 016.725.738l.108.054a8.25 8.25 0 005.18.893l3.087-.617a.75.75 0 01.898.721v10.182a.75.75 0 01-.601.737l-3.086.618a9.75 9.75 0 01-6.725-.738l-.108-.054a8.25 8.25 0 00-5.18-.893l-1.837.368v6.182a.75.75 0 01-1.5 0V3z" clip-rule="evenodd" />
      </svg>
    `
    : `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" style="width: 32px; height: 32px; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.3));">
        <path fill-rule="evenodd" d="M12 2.25a.75.75 0 01.75.75v1.616a8.25 8.25 0 005.38 5.38h1.62a.75.75 0 010 1.5h-1.62a8.25 8.25 0 00-5.38 5.38v1.62a.75.75 0 01-1.5 0v-1.62a8.25 8.25 0 00-5.38-5.38H3.75a.75.75 0 010-1.5h1.62a8.25 8.25 0 005.38-5.38V3a.75.75 0 01.75-.75zM12 15a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
      </svg>
    `

  return L.divIcon({
    html: `<div style="display: flex; align-items: center; justify-content: center;">${svg}</div>`,
    className: 'custom-game-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  })
}

export default function GamificationPage() {
  const { t, i18n } = useTranslation()
  const { currentUser, updateUser } = useAuth()
  const navigate = useNavigate()
  const lang = i18n.language?.slice(0, 2) || 'uz'

  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)

  // Overlay references
  const clickMarkerRef = useRef(null)
  const targetMarkerRef = useRef(null)
  const lineRef = useRef(null)

  // Game States
  const [screen, setScreen] = useState('start') // 'start', 'playing', 'summary'
  const [roundsList, setRoundsList] = useState([])
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [isRoundFinished, setIsRoundFinished] = useState(false)
  
  // Hover & Accuracy data
  const [hoverCoords, setHoverCoords] = useState(null)
  const [roundDistance, setRoundDistance] = useState(null)
  const [roundPoints, setRoundPoints] = useState(0)

  // Start the Game
  const handleStartGame = () => {
    // Shuffle and pick 5 locations
    const shuffled = [...GAME_LOCATIONS].sort(() => 0.5 - Math.random())
    const selected = shuffled.slice(0, 5)

    setRoundsList(selected)
    setCurrentRoundIdx(0)
    setScore(0)
    setIsRoundFinished(false)
    setRoundDistance(null)
    setRoundPoints(0)
    setScreen('playing')
  }

  // Clear overlays between rounds
  const clearOverlays = useCallback(() => {
    if (mapRef.current) {
      if (clickMarkerRef.current) mapRef.current.removeLayer(clickMarkerRef.current)
      if (targetMarkerRef.current) mapRef.current.removeLayer(targetMarkerRef.current)
      if (lineRef.current) mapRef.current.removeLayer(lineRef.current)
    }
    clickMarkerRef.current = null
    targetMarkerRef.current = null
    lineRef.current = null
  }, [])

  // Finish game session and sync Firestore score
  const handleFinishGame = useCallback(async () => {
    clearOverlays()
    setScreen('summary')

    // Add points to user's totalScore
    if (currentUser) {
      const currentScore = currentUser.totalScore || 0
      const newScore = currentScore + score
      try {
        await updateUser({ totalScore: newScore })
        toast.success(`Hisobingizga +${score} ball qo'shildi!`)
      } catch (err) {
        toast.error('Ballni saqlashda xatolik yuz berdi.')
        console.error(err)
      }
    }
  }, [clearOverlays, currentUser, score, updateUser])

  // Initialize Map for gameplay
  useEffect(() => {
    if (screen !== 'playing') return

    if (mapContainerRef.current && !mapRef.current) {
      // Create map focused on central Uzbekistan
      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([40.0, 66.0], 6.5)

      // Add zoom control at bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current)

      // Add Satellite/Hybrid tiles for a clean visual experience
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(mapRef.current)

      // Track coordinates under hover
      mapRef.current.on('mousemove', (e) => {
        setHoverCoords({ lat: e.latlng.lat, lng: e.latlng.lng })
      })
    }

    // Attach click events depending on active round finish state
    const handleMapClick = (e) => {
      // Prevent clicking if round is already finished
      if (isRoundFinished) return

      const { lat, lng } = e.latlng
      const activeLoc = roundsList[currentRoundIdx]
      const targetCoords = activeLoc.target

      // Compute geodetic distance in meters
      const clickLatLng = L.latLng(lat, lng)
      const targetLatLng = L.latLng(targetCoords.lat, targetCoords.lng)
      const distance = clickLatLng.distanceTo(targetLatLng)

      // Place target marker
      targetMarkerRef.current = L.marker([targetCoords.lat, targetCoords.lng], {
        icon: createMarkerIcon('target')
      }).addTo(mapRef.current)
        .bindTooltip(activeLoc.name[lang] || activeLoc.name.uz, { permanent: true, direction: 'top' })

      // Place click marker
      clickMarkerRef.current = L.marker([lat, lng], {
        icon: createMarkerIcon('click')
      }).addTo(mapRef.current)

      // Draw dotted connection line
      lineRef.current = L.polyline([[lat, lng], [targetCoords.lat, targetCoords.lng]], {
        color: '#ef4444',
        weight: 3,
        dashArray: '5, 8'
      }).addTo(mapRef.current)

      // Fit map bounds to show both points
      const group = L.featureGroup([clickMarkerRef.current, targetMarkerRef.current])
      mapRef.current.fitBounds(group.getBounds().pad(0.3), { animate: true })

      // Calculate round points
      let pts = 0
      if (distance < 150) pts = 100
      else if (distance < 1000) pts = 85
      else if (distance < 4000) pts = 65
      else if (distance < 15000) pts = 45
      else if (distance < 50000) pts = 25
      else if (distance < 150000) pts = 10
      else pts = 0

      setRoundDistance(distance)
      setRoundPoints(pts)
      setScore((s) => s + pts)
      setIsRoundFinished(true)
    }

    if (mapRef.current) {
      mapRef.current.on('click', handleMapClick)
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.off('click', handleMapClick)
      }
    }
  }, [screen, roundsList, currentRoundIdx, isRoundFinished, lang])

  // Move to next round
  const handleNextRound = () => {
    clearOverlays()
    setIsRoundFinished(false)
    setRoundDistance(null)
    setRoundPoints(0)

    if (mapRef.current) {
      mapRef.current.setView([40.0, 66.0], 6.5)
    }

    if (currentRoundIdx + 1 < roundsList.length) {
      setCurrentRoundIdx((idx) => idx + 1)
    } else {
      handleFinishGame()
    }
  }

  // Cleanup map completely when page unmounts
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  return (
    <div className="relative w-full h-full bg-gray-100 dark:bg-gray-950 flex flex-col justify-center items-center">
      
      {/* SCREEN 1: START/WELCOME PAGE */}
      {screen === 'start' && (
        <div className="max-w-md w-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-2xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-primary-500/20 text-white">
            <Gamepad2 size={32} />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Berilgan koordinatani toping</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Tizim tomonidan berilgan geografik koordinatalarni (Lat, Lng) kursor ko'rsatkichlaridan foydalanib xaritadan qidirib toping.
            </p>
          </div>

          {/* Point rules grid */}
          <div className="bg-gray-50 dark:bg-gray-900/40 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50 text-left text-xs space-y-2.5">
            <div className="flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-300">
              <Trophy size={14} className="text-yellow-500" />
              <span>Ball berish qoidalari (Raund: 5 ta)</span>
            </div>
            <ul className="space-y-1 text-gray-500 dark:text-gray-400">
              <li className="flex justify-between">
                <span>🎯 150 metrgacha xato:</span>
                <span className="font-semibold text-green-600">+100 ball</span>
              </li>
              <li className="flex justify-between">
                <span>🚗 1 kmgacha xato:</span>
                <span className="font-semibold text-green-500">+85 ball</span>
              </li>
              <li className="flex justify-between">
                <span>🚲 4 kmgacha xato:</span>
                <span className="font-semibold text-blue-500">+65 ball</span>
              </li>
              <li className="flex justify-between">
                <span>🏃 15 kmgacha xato:</span>
                <span className="font-semibold text-yellow-600">+45 ball</span>
              </li>
              <li className="flex justify-between">
                <span>✈️ 150 kmgacha xato:</span>
                <span className="font-semibold text-orange-500">+10 ball</span>
              </li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 btn-secondary py-2.5 text-xs font-semibold rounded-xl"
            >
              Orqaga
            </button>
            <button
              onClick={handleStartGame}
              className="flex-1 btn-primary py-2.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-primary-500/20"
            >
              <Play size={14} />
              O'yinni boshlash
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 2: ACTIVE PLAYING MAP HUD */}
      {screen === 'playing' && roundsList.length > 0 && (
        <div className="w-full h-full relative">
          
          {/* Base Backdrop Leaflet Layer */}
          <div ref={mapContainerRef} className="w-full h-full absolute inset-0 z-0" />

          {/* TELEMETRY COORDINATES overlay at top center */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/95 dark:bg-gray-800/95 backdrop-blur shadow-xl border border-gray-200/50 dark:border-gray-700/50 px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-mono select-none">
            <Compass size={14} className="text-primary-500 animate-spin" style={{ animationDuration: '6s' }} />
            {hoverCoords ? (
              <span className="text-gray-700 dark:text-gray-300">
                {hoverCoords.lat.toFixed(5)}° N, {hoverCoords.lng.toFixed(5)}° E
              </span>
            ) : (
              <span className="text-gray-400">Kursor xarita ustida emas</span>
            )}
          </div>

          {/* GAME TARGET PANEL floating on left */}
          <div className="absolute top-4 left-4 z-[1000] w-[340px] sm:w-[360px] bg-white/95 dark:bg-gray-800/95 backdrop-blur shadow-2xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-4 space-y-4">
            
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
              <div className="flex items-center gap-1.5">
                <Gamepad2 size={18} className="text-primary-500" />
                <span className="font-bold text-sm text-gray-900 dark:text-white">Geoo'yin</span>
              </div>
              <span className="bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-2.5 py-1 rounded-lg text-xs font-bold">
                Raund {currentRoundIdx + 1} / 5
              </span>
            </div>

            {/* Target Coordinate display */}
            <div className="bg-gray-50 dark:bg-gray-900/40 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50 text-center space-y-2">
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">QIDIRILAYOTGAN KOORDINATA</p>
              <div className="font-mono text-xl font-extrabold text-primary-600 dark:text-primary-400 select-all leading-tight">
                {roundsList[currentRoundIdx].target.lat.toFixed(4)}<br />
                {roundsList[currentRoundIdx].target.lng.toFixed(4)}
              </div>
            </div>

            {/* Target hint description */}
            <div className="space-y-1 bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100/30 dark:border-blue-900/30 text-xs">
              <p className="font-bold text-gray-850 dark:text-gray-200">
                📍 {roundsList[currentRoundIdx].name[lang] || roundsList[currentRoundIdx].name.uz}
              </p>
              <p className="text-gray-500 dark:text-gray-400 mt-1 leading-snug">
                {roundsList[currentRoundIdx].hint[lang] || roundsList[currentRoundIdx].hint.uz}
              </p>
            </div>

            {/* Score and current progress */}
            <div className="flex justify-between items-center text-xs px-1.5">
              <span className="text-gray-500">Joriy ballar:</span>
              <span className="font-extrabold text-yellow-600 dark:text-yellow-400 flex items-center gap-1 text-sm">
                <Star size={14} fill="currentColor" />
                {score} ball
              </span>
            </div>

            {/* Cancel Button */}
            {!isRoundFinished && (
              <button
                onClick={() => setScreen('start')}
                className="w-full py-2 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs font-semibold rounded-lg transition-all"
              >
                O'yinni tark etish
              </button>
            )}
          </div>

          {/* ACTIVE ROUND RESULTS feedback floating modal */}
          {isRoundFinished && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000] w-[320px] sm:w-[350px] bg-white/95 dark:bg-gray-800/95 shadow-2xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-gray-900 dark:text-white">Raund yakunlandi!</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug">
                  Siz tanlagan nuqta haqiqiy koordinatadan 
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    {' '}{roundDistance >= 1000 ? `${(roundDistance / 1000).toFixed(2)} km` : `${roundDistance.toFixed(0)} metr`}
                  </span>
                  {' '}uzoqda joylashgan ekan.
                </p>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200/50 dark:border-yellow-800/50 rounded-xl p-3.5 flex justify-between items-center text-xs">
                <span className="text-yellow-800 dark:text-yellow-400 font-medium">Ushbu raund uchun:</span>
                <span className="font-extrabold text-yellow-600 dark:text-yellow-400 text-lg">
                  +{roundPoints} ball
                </span>
              </div>

              <button
                onClick={handleNextRound}
                className="w-full btn-primary py-2.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5"
              >
                <span>{currentRoundIdx + 1 === roundsList.length ? "O'yinni yakunlash" : "Keyingi raund"}</span>
                <ChevronRight size={14} />
              </button>
            </div>
          )}

        </div>
      )}

      {/* SCREEN 3: SUMMARY GAME RESULTS PAGE */}
      {screen === 'summary' && (
        <div className="max-w-md w-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-2xl p-6 sm:p-8 shadow-2xl text-center space-y-6 animate-fade-in">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-yellow-500/20 text-white">
            <Award size={36} />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">O'yin yakunlandi!</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {score >= 400
                ? "A'lo daraja! Siz professional kartografsiz! 🏆"
                : score >= 250
                ? "Yaxshi natija! Ko'proq mashq qiling. 👍"
                : "Qoniqarsiz. Koordinata o'qish mavzusini qayta o'qing. 📚"
              }
            </p>
          </div>

          {/* Final Score indicators */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 dark:bg-gray-900/40 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50 text-center">
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">TO'PLANGAN BALLAR</p>
              <p className="text-2xl font-extrabold text-amber-500">+{score}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/40 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50 text-center">
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">UMUMIY SCORE</p>
              <p className="text-2xl font-extrabold text-primary-500">{currentUser?.totalScore || score}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 btn-secondary py-2.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-1"
            >
              <ArrowLeft size={13} />
              Dashboard
            </button>
            <button
              onClick={handleStartGame}
              className="flex-1 btn-primary py-2.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-1"
            >
              <RefreshCcw size={13} />
              Qayta o'ynash
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
