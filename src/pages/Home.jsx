import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Map, Mountain, Globe, BookOpen, Video, FileText, Award,
  Trophy, Users, CheckCircle, ArrowRight, ChevronDown, Mail,
} from 'lucide-react'
import { SUBJECTS, TOPICS, TESTS, STATS } from '../data/mockData'
import { db, isDemoMode } from '../firebase/config'
import { collection, getCountFromServer, getDocs } from 'firebase/firestore'

const subjectIcons = { kartografiya: Map, topografiya: Mountain, gis: Globe }

const features = [
  { icon: BookOpen, title: 'Interaktiv darslar', desc: "Nazariy materiallar, rasmlar va interaktiv kontent bilan boyitilgan mavzular" },
  { icon: Video, title: 'Video darslar', desc: "Professional o'qituvchilar tomonidan tayyorlangan video qo'llanmalar" },
  { icon: FileText, title: 'Test tizimi', desc: "Bilimlarni tekshirish uchun vaqt cheklovli zamonaviy test tizimi" },
  { icon: Trophy, title: 'Reyting', desc: "Eng faol talabalar reytingi va oylik tanlovlar" },
  { icon: Award, title: 'Sertifikatlar', desc: "Kursni muvaffaqiyatli tugatgandan so'ng PDF sertifikat olish" },
  { icon: Users, title: "Ko'p foydalanuvchi", desc: "Talaba, o'qituvchi va administrator rollari bilan to'liq tizim" },
]

// features stays here

const fanlarItems = [
  { id: 'topografiya', label: 'Topografiya', icon: Mountain, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 'kartografiya', label: 'Kartografiya', icon: Map, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'gis', label: 'GAT', icon: Globe, color: 'text-orange-600', bg: 'bg-orange-50' },
]

export default function Home() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const [fanlarOpen, setFanlarOpen] = useState(false)
  const fanlarRef = useRef(null)
  
  const [studentCount, setStudentCount] = useState(STATS.totalStudents)

  const realTopicsCount = Object.values(TOPICS).reduce((acc, list) => acc + list.length, 0)
  const realVideosCount = Object.values(TOPICS).flat().filter(t => t.videoUrl).length
  const realTestsCount = 360

  const statsData = [
    { value: studentCount, label: 'Faol talabalar', icon: Users },
    { value: realTopicsCount, label: 'Mavzular', icon: BookOpen },
    { value: realVideosCount, label: 'Video darslar', icon: Video },
    { value: realTestsCount, label: 'Testlar', icon: FileText },
  ]

  // Scroll reveal observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-active')
          }
        })
      },
      { threshold: 0.1 }
    )
    const elements = document.querySelectorAll('.reveal')
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    function handleClick(e) {
      if (fanlarRef.current && !fanlarRef.current.contains(e.target)) {
        setFanlarOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (isDemoMode || !db) return
    const getStudentsCount = async () => {
      try {
        const coll = collection(db, 'users')
        const snapshot = await getCountFromServer(coll)
        if (snapshot && snapshot.data()) {
          setStudentCount(snapshot.data().count)
        }
      } catch (err) {
        try {
          const snap = await getDocs(collection(db, 'users'))
          if (snap && snap.size > 0) {
            setStudentCount(snap.size)
          }
        } catch (e) {
          console.warn("Failed to fetch registered users:", e)
        }
      }
    }
    getStudentsCount()
  }, [])

  return (
    <div className="relative min-h-screen bg-white">
      {/* ── Global grid — oq fonda ko'k chiziqlar ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(59,130,246,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.07) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(59,130,246,0.18) 1.5px, transparent 1.5px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* ── Barcha kontent grid ustida ── */}
      <div className="relative z-10">

      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/25">
              <Map size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Geo Gat Akademiya</span>
          </div>
          <nav className="hidden sm:flex items-center gap-1">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault()
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Bosh sahifa
            </a>
            <a
              href="#fanlar"
              onClick={(e) => {
                e.preventDefault()
                document.getElementById('fanlar')?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Fanlar
            </a>
            <a
              href="#imkoniyatlar"
              onClick={(e) => {
                e.preventDefault()
                document.getElementById('imkoniyatlar')?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Imkoniyatlar
            </a>
            <a
              href="#muallif"
              onClick={(e) => {
                e.preventDefault()
                document.getElementById('muallif')?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              G'oya Muallifi
            </a>
            <Link
              to="/login"
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
              Geoo'yin
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {t('nav.login')}
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-sm font-semibold rounded-lg transition-all shadow-md shadow-blue-500/30"
            >
              {t('nav.register')}
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-16 pb-24">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-violet-400/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-1.5 text-blue-700 text-sm mb-6 animate-fade-in-up">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span>O'zbekistondagi birinchi GAT ta'lim platformasi</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-extrabold text-gray-900 mb-6 leading-[1.1] tracking-tight animate-fade-in-up-delay-1">
                <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                  Topografiya
                </span>
                {', '}
                <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                  Kartografiya
                </span>{' '}
                va{' '}
                <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
                  GAT
                </span>{" "}
                fanlarini o'rganing
              </h1>

              <p className="text-base sm:text-lg text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed animate-fade-in-up-delay-2">
                Interaktiv darslar, video qo'llanmalar, testlar va amaliy topshiriqlar orqali
                geografik fanlarni chuqur egallang.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start animate-fade-in-up-delay-3">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/30 text-sm"
                >
                  Bepul boshlash
                  <ArrowRight size={17} />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-gray-100 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all text-sm"
                >
                  Demo kirish
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-8 justify-center lg:justify-start animate-fade-in-up-delay-3">
                {[
                  { val: `${studentCount}+`, label: 'Talabalar' },
                  { val: realVideosCount, label: 'Videolar' },
                  { val: realTestsCount, label: 'Testlar' },
                ].map(({ val, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className="text-gray-900 font-bold text-sm">{val}</span>
                    <span className="text-gray-400 text-sm">{label}</span>
                    <span className="w-px h-3 bg-gray-300 last:hidden" />
                  </div>
                ))}
              </div>
            </div>

            {/* Right — floating UI preview */}
            <div className="relative hidden lg:flex flex-col gap-3 items-end">
              <div className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl p-5 shadow-xl animate-float-slow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <Map size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-gray-900 text-sm font-semibold">Kartografiya asoslari</p>
                    <p className="text-blue-500 text-xs">Mavzu 1 / 6</p>
                  </div>
                  <span className="ml-auto bg-green-50 text-green-600 text-xs px-2 py-0.5 rounded-full border border-green-200">
                    Faol
                  </span>
                </div>
                <div className="space-y-2">
                  {[['Xaritalar tarixi', 100], ["Proyeksiyalar", 75], ['Masshtab tushunchasi', 40]].map(([name, pct]) => (
                    <div key={name} className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center ${pct === 100 ? 'bg-green-500' : 'border-2 border-gray-300'}`}>
                        {pct === 100 && <CheckCircle size={10} className="text-white" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-700">{name}</span>
                          <span className="text-gray-400">{pct}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full">
                          <div className="h-1.5 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-56 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl p-4 self-start ml-4 shadow-lg shadow-blue-500/25 animate-float-medium">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/80 text-xs">Test natijasi</span>
                  <Trophy size={14} className="text-yellow-300" />
                </div>
                <p className="text-3xl font-extrabold text-white">92<span className="text-lg text-white/60">%</span></p>
                <p className="text-green-300 text-xs mt-1 flex items-center gap-1">
                  <CheckCircle size={11} /> O'tdi · Sertifikat olindi
                </p>
              </div>

              <div className="w-full max-w-sm grid grid-cols-2 gap-2 animate-float-fast">
                {[
                  { icon: BookOpen, val: realTopicsCount, label: 'Mavzu', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
                  { icon: Video, val: realVideosCount, label: 'Video', color: 'text-violet-600', bg: 'bg-violet-50 border-violet-200' },
                ].map(({ icon: Icon, val, label, color, bg }) => (
                  <div key={label} className={`${bg} border rounded-xl p-3 text-center`}>
                    <Icon size={16} className={`${color} mx-auto mb-1`} />
                    <p className="text-gray-900 font-bold text-sm">{val}</p>
                    <p className="text-gray-500 text-xs">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="relative py-14 border-y border-gray-200/80 reveal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-gray-200 rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
            {statsData.map(({ value, label, icon: Icon }) => (
              <div key={label} className="bg-white p-8 text-center relative group hover:bg-blue-50/50 transition-colors">
                <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md shadow-blue-500/20">
                  <Icon size={20} className="text-white" />
                </div>
                <p className="text-3xl font-extrabold text-gray-900 tracking-tight">{value}<span className="text-blue-500">+</span></p>
                <p className="text-sm text-gray-500 mt-1">{label}</p>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 group-hover:w-3/4 h-0.5 bg-gradient-to-r from-transparent via-blue-500/60 to-transparent transition-all duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Subjects ── */}
      <section id="fanlar" className="py-20 border-t border-gray-150 reveal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-semibold tracking-widest text-blue-600 uppercase mb-3 bg-blue-50 border border-blue-200 px-4 py-1.5 rounded-full">
              O'quv kurslari
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
              {t('subjects.title')}
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Uch asosiy fan bo'yicha to'liq o'quv kurslari
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {SUBJECTS.map((subject, i) => {
              const Icon = subjectIcons[subject.id]
              const gradients = {
                kartografiya: 'from-blue-500 to-cyan-500',
                topografiya: 'from-emerald-500 to-teal-500',
                gis: 'from-orange-500 to-amber-500',
              }
              const hoverBorder = {
                kartografiya: 'hover:border-blue-300 hover:shadow-blue-100',
                topografiya: 'hover:border-emerald-300 hover:shadow-emerald-100',
                gis: 'hover:border-orange-300 hover:shadow-orange-100',
              }
              return (
                <div
                  key={subject.id}
                  id={subject.id}
                  className={`group relative bg-white border border-gray-200 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${hoverBorder[subject.id]} overflow-hidden cursor-pointer`}
                >
                  <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${gradients[subject.id]} opacity-5 group-hover:opacity-10 rounded-bl-full transition-opacity duration-500`} />
                  <div className="relative">
                    <div className={`w-12 h-12 bg-gradient-to-br ${gradients[subject.id]} rounded-2xl flex items-center justify-center mb-5 shadow-lg`}>
                      <Icon size={24} className="text-white" />
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {subject.name[lang] || subject.name.uz}
                      </h3>
                      <span className="text-xs text-gray-400 bg-gray-100 border border-gray-200 px-2 py-1 rounded-lg font-mono">
                        0{i + 1}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                      {subject.description[lang] || subject.description.uz}
                    </p>
                    <div className="grid grid-cols-3 gap-2 mb-5">
                      {[
                        { val: subject.topicsCount, label: 'Mavzu' },
                        { val: subject.videosCount, label: 'Video' },
                        { val: subject.testsCount, label: 'Test' },
                      ].map(({ val, label }) => (
                        <div key={label} className="bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-center">
                          <p className="font-bold text-gray-900 text-sm">{val}</p>
                          <p className="text-xs text-gray-400">{label}</p>
                        </div>
                      ))}
                    </div>
                    <Link
                      to="/register"
                      className={`flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r ${gradients[subject.id]} text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-md`}
                    >
                      Kursni boshlash <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="imkoniyatlar" className="relative py-20 overflow-hidden border-t border-gray-100 bg-gray-50/70 reveal">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-semibold tracking-widest text-violet-600 uppercase mb-3 bg-violet-50 border border-violet-200 px-4 py-1.5 rounded-full">
              Imkoniyatlar
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
              Platform bizga nima beradi?
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">Zamonaviy ta'lim texnologiyalari bilan jihozlangan</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={title}
                className="group bg-white border border-gray-200 hover:border-violet-300 hover:shadow-xl hover:-translate-y-1.5 rounded-2xl p-6 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md shadow-violet-500/20">
                    <Icon size={18} className="text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
                      <span className="text-xs text-violet-400 font-mono">0{i + 1}</span>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── G'oya Muallifi (Author of the Idea) ── */}
      <section id="muallif" className="py-20 border-t border-gray-150 bg-white reveal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-semibold tracking-widest text-emerald-600 uppercase mb-3 bg-emerald-50 border border-emerald-200 px-4 py-1.5 rounded-full">
              Loyiha Tashabbuskori
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
              G'oya va loyiha muallifi
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Ushbu platforma Topografiya, kartografiya va GAT fanlarini inovatsion pedagogik yondashuv hamda gefazoviy texnologiyalar integratsiyasi asosida o'qitishni takomillashtirishga xizmat qiladi.
            </p>
          </div>

          <div className="max-w-3xl mx-auto bg-gray-50 hover:bg-gray-50/80 border border-gray-200 rounded-3xl p-8 sm:p-10 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
            
            {/* Author Avatar/Image */}
            <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-3xl overflow-hidden shadow-md border-2 border-emerald-500/20 flex-shrink-0 bg-gray-100 flex items-center justify-center">
              <img
                src="/Mahfuza.jpg"
                alt="Sangirova Mahfuza Hasanovna"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Author Details */}
            <div className="flex-1 text-center md:text-left">
              <span className="text-xs font-bold text-emerald-600 tracking-wider uppercase bg-emerald-100/50 px-2.5 py-1 rounded-md">
                G'oya Muallifi
              </span>
              <h3 className="text-2xl font-bold text-gray-900 mt-3">
                Sangirova Mahfuza Hasanovna
              </h3>
              <p className="text-sm text-emerald-600 font-medium mt-1 leading-relaxed">
                Nizomiy nomidagi Oʻzbekiston milliy pedagogika universiteti tayanch doktoranti
              </p>
              <p className="text-sm text-gray-500 mt-4 leading-relaxed">
                Ushbu interaktiv platforma Topografiya, kartografiya va GAT fanlarini o'qitish metodikasini takomillashtirish hamda talabalarning amaliy ko'nikmalarini oshirish maqsadida yaratilgan loyihadir. Barcha darsliklar, interaktiv topshiriqlar va geoo'yinlar muallif tomonidan ishlab chiqilgan va amalga oshirilgan.
              </p>
              
              <div className="flex flex-wrap gap-4 mt-6 justify-center md:justify-start">
                <a
                  href="mailto:m.sangirova@pedagog.uz"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-gray-950 transition-colors"
                >
                  <Mail size={14} /> mahfuzasangirova1985@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-violet-700 reveal">
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.6) 1.5px, transparent 1.5px)',
            backgroundSize: '60px 60px',
          }}
        />
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[600px] h-[300px] bg-white/10 rounded-full blur-3xl" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/30 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Trophy size={14} className="text-yellow-300" />
            <span>{studentCount}+ talaba allaqachon o'rganmoqda</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 tracking-tight leading-tight">
            Bugun boshlang —
            <br />
            <span className="text-cyan-300">bepul va tez</span>
          </h2>
          <p className="text-blue-100 text-lg mb-10 max-w-xl mx-auto">
            Minglab talabalar bilan birga o'rganing va professional darajaga ering.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-blue-700 font-bold rounded-xl transition-all shadow-xl text-base"
            >
              Bepul ro'yxatdan o'ting
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 border border-white/30 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors text-base"
            >
              Demo kirish
            </Link>
          </div>
          <p className="text-blue-200/70 text-xs mt-5">Karta talab qilinmaydi · Darhol kirish · Bepul</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid sm:grid-cols-4 gap-8 mb-10">
            <div className="sm:col-span-2">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
                  <Map size={16} className="text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">Geo Gat Akademiya</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                Kartografiya, Topografiya va GAT fanlarini o'rganish uchun zamonaviy interaktiv platforma.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Platform</p>
              <ul className="space-y-2.5">
                {['Fanlar', 'Video darslar', 'Testlar', 'Materiallar'].map((l) => (
                  <li key={l}>
                    <Link to="/login" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">{l}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Akkaunt</p>
              <ul className="space-y-2.5">
                {[{label: 'Kirish', to: '/login'}, {label: "Ro'yxat", to: '/register'}, {label: 'Demo', to: '/login'}].map(({ label, to }) => (
                  <li key={label}>
                    <Link to={to} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-400">
              © 2024 Geo Gat Akademiya. Barcha huquqlar himoyalangan.
            </p>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-gray-400">Barcha tizimlar ishlayapti</span>
            </div>
          </div>
        </div>
      </footer>
      </div>{/* end z-10 wrapper */}
    </div>
  )
}
