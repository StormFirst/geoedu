import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Map, Mountain, Globe, BookOpen, Video, FileText, Award,
  Trophy, Users, CheckCircle, ArrowRight,
} from 'lucide-react'
import { SUBJECTS, STATS } from '../data/mockData'

const subjectIcons = { kartografiya: Map, topografiya: Mountain, gis: Globe }

const features = [
  { icon: BookOpen, title: 'Interaktiv darslar', desc: "Nazariy materiallar, rasmlar va interaktiv kontent bilan boyitilgan mavzular" },
  { icon: Video, title: 'Video darslar', desc: "Professional o'qituvchilar tomonidan tayyorlangan video qo'llanmalar" },
  { icon: FileText, title: 'Test tizimi', desc: "Bilimlarni tekshirish uchun vaqt cheklovli zamonaviy test tizimi" },
  { icon: Trophy, title: 'Reyting', desc: "Eng faol talabalar reytingi va oylik tanlovlar" },
  { icon: Award, title: 'Sertifikatlar', desc: "Kursni muvaffaqiyatli tugatgandan so'ng PDF sertifikat olish" },
  { icon: Users, title: "Ko'p foydalanuvchi", desc: "Talaba, o'qituvchi va administrator rollari bilan to'liq tizim" },
]

const statsData = [
  { value: STATS.totalStudents, label: 'Faol talabalar', icon: Users },
  { value: STATS.totalTopics, label: 'Mavzular', icon: BookOpen },
  { value: STATS.totalVideos, label: 'Video darslar', icon: Video },
  { value: STATS.totalTests, label: 'Testlar', icon: FileText },
]

export default function Home() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language

  return (
    <div className="relative min-h-screen bg-gray-950">
      {/* ── Global grid — butun sahifaga yoyilgan ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(99,179,237,0.35) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* ── Barcha kontent grid ustida ── */}
      <div className="relative z-10">

      <header className="sticky top-0 z-50 bg-gray-950 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Map size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white">GeoEdu</span>
          </div>
          <nav className="hidden sm:flex items-center gap-1">
            {['Fanlar', 'Videolar', 'Testlar'].map((item) => (
              <Link key={item} to="/login" className="px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                {item}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              {t('nav.login')}
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-500 to-primary-600 hover:from-blue-400 hover:to-primary-500 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-blue-500/20"
            >
              {t('nav.register')}
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden pt-16 pb-24">
        {/* Glow blobs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary-600/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-400/20 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left — text */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-400/20 rounded-full px-4 py-1.5 text-blue-300 text-sm mb-6 backdrop-blur-sm">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                <span>O'zbekistondagi birinchi GIS ta'lim platformasi</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-extrabold text-white mb-6 leading-[1.1] tracking-tight">
                Kartografiya,{' '}
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Topografiya
                </span>{' '}
                va{' '}
                <span className="bg-gradient-to-r from-primary-400 to-violet-400 bg-clip-text text-transparent">
                  GIS
                </span>{' '}
                fanlarini o'rganing
              </h1>

              <p className="text-base sm:text-lg text-blue-100/70 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Interaktiv darslar, video qo'llanmalar, testlar va amaliy topshiriqlar orqali
                geografik fanlarni chuqur egallang.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-gradient-to-r from-blue-500 to-primary-600 hover:from-blue-400 hover:to-primary-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/25 text-sm"
                >
                  Bepul boshlash
                  <ArrowRight size={17} />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white/5 border border-white/10 text-white/90 font-medium rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all text-sm"
                >
                  Demo kirish
                </Link>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center gap-4 mt-8 justify-center lg:justify-start">
                {[
                  { val: '700+', label: 'Talabalar' },
                  { val: '36', label: 'Videolar' },
                  { val: '24', label: 'Testlar' },
                ].map(({ val, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className="text-white font-bold text-sm">{val}</span>
                    <span className="text-white/40 text-sm">{label}</span>
                    <span className="w-px h-3 bg-white/20 last:hidden" />
                  </div>
                ))}
              </div>
            </div>

            {/* Right — floating UI preview */}
            <div className="relative hidden lg:flex flex-col gap-3 items-end">
              {/* Main card */}
              <div className="w-full max-w-sm bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                    <Map size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">Kartografiya asoslari</p>
                    <p className="text-blue-300/70 text-xs">Mavzu 1 / 6</p>
                  </div>
                  <span className="ml-auto bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full border border-green-400/20">
                    Faol
                  </span>
                </div>
                <div className="space-y-2">
                  {[['Xaritalar tarixi', 100], ["Proyeksiyalar", 75], ['Masshtab tushunchasi', 40]].map(([name, pct]) => (
                    <div key={name} className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center ${pct === 100 ? 'bg-green-400' : 'border border-white/20'}`}>
                        {pct === 100 && <CheckCircle size={10} className="text-white" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-white/80">{name}</span>
                          <span className="text-white/40">{pct}%</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full">
                          <div className="h-1.5 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Score card */}
              <div className="w-56 bg-gradient-to-br from-blue-500/20 to-primary-500/20 border border-blue-400/20 backdrop-blur-md rounded-xl p-4 self-start ml-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/70 text-xs">Test natijasi</span>
                  <Trophy size={14} className="text-yellow-400" />
                </div>
                <p className="text-3xl font-extrabold text-white">92<span className="text-lg text-white/50">%</span></p>
                <p className="text-green-400 text-xs mt-1 flex items-center gap-1">
                  <CheckCircle size={11} /> O'tdi · Sertifikat olindi
                </p>
              </div>

              {/* Stats row */}
              <div className="w-full max-w-sm grid grid-cols-3 gap-2">
                {[
                  { icon: BookOpen, val: '18', label: 'Mavzu', color: 'text-blue-400' },
                  { icon: Video, val: '36', label: 'Video', color: 'text-purple-400' },
                  { icon: Award, val: '12', label: 'Sertifikat', color: 'text-yellow-400' },
                ].map(({ icon: Icon, val, label, color }) => (
                  <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
                    <Icon size={16} className={`${color} mx-auto mb-1`} />
                    <p className="text-white font-bold text-sm">{val}</p>
                    <p className="text-white/40 text-xs">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-14 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/10">
            {statsData.map(({ value, label, icon: Icon }, i) => (
              <div key={label} className="bg-transparent p-8 text-center relative group hover:bg-white/5 transition-colors">
                <div className="w-11 h-11 bg-gradient-to-br from-blue-500/20 to-primary-500/20 border border-blue-400/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon size={20} className="text-blue-400" />
                </div>
                <p className="text-3xl font-extrabold text-white tracking-tight">{value}<span className="text-blue-400">+</span></p>
                <p className="text-sm text-gray-400 mt-1">{label}</p>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 group-hover:w-3/4 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent transition-all duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-semibold tracking-widest text-blue-400 uppercase mb-3 bg-blue-500/10 border border-blue-400/20 px-4 py-1.5 rounded-full">
              O'quv kurslari
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 tracking-tight">
              {t('subjects.title')}
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
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
              return (
                <div
                  key={subject.id}
                  className={`group relative bg-white/3 border border-white/8 rounded-2xl p-6 transition-all duration-300 hover:border-white/20 hover:bg-white/5 overflow-hidden cursor-pointer`}
                >
                  <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${gradients[subject.id]} opacity-5 group-hover:opacity-10 rounded-bl-full transition-opacity duration-500`} />
                  <div className="relative">
                    <div className={`w-12 h-12 bg-gradient-to-br ${gradients[subject.id]} rounded-2xl flex items-center justify-center mb-5 shadow-lg`}>
                      <Icon size={24} className="text-white" />
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-white">
                        {subject.name[lang] || subject.name.uz}
                      </h3>
                      <span className="text-xs text-gray-500 bg-white/5 border border-white/10 px-2 py-1 rounded-lg font-mono">
                        0{i + 1}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mb-5 leading-relaxed">
                      {subject.description[lang] || subject.description.uz}
                    </p>
                    <div className="grid grid-cols-3 gap-2 mb-5">
                      {[
                        { icon: BookOpen, val: subject.topicsCount, label: 'Mavzu' },
                        { icon: Video, val: subject.videosCount, label: 'Video' },
                        { icon: FileText, val: subject.testsCount, label: 'Test' },
                      ].map(({ icon: I, val, label }) => (
                        <div key={label} className="bg-white/5 border border-white/8 rounded-xl p-2.5 text-center">
                          <p className="font-bold text-white text-sm">{val}</p>
                          <p className="text-xs text-gray-500">{label}</p>
                        </div>
                      ))}
                    </div>
                    <Link
                      to="/register"
                      className={`flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r ${gradients[subject.id]} text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity`}
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

      <section className="relative py-20 overflow-hidden border-t border-white/5">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-semibold tracking-widest text-blue-400 uppercase mb-3 bg-blue-500/10 border border-blue-400/20 px-4 py-1.5 rounded-full">
              Imkoniyatlar
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 tracking-tight">
              Platform bizga nima beradi?
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">Zamonaviy ta'lim texnologiyalari bilan jihozlangan</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={title}
                className="group relative bg-white/3 border border-white/8 hover:border-white/20 rounded-2xl p-6 transition-all duration-300 hover:bg-white/5 backdrop-blur-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-primary-500/20 border border-blue-400/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:border-blue-400/40 transition-colors">
                    <Icon size={18} className="text-blue-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="font-semibold text-white text-sm">{title}</h3>
                      <span className="text-xs text-gray-600 font-mono">0{i + 1}</span>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-24 overflow-hidden border-t border-white/5">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary-600/15 rounded-full blur-3xl" />
        <div className="absolute left-1/4 bottom-0 w-[300px] h-[200px] bg-blue-600/10 rounded-full blur-2xl" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-400/20 text-yellow-400 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Trophy size={14} />
            <span>700+ talaba allaqachon o'rganmoqda</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 tracking-tight leading-tight">
            Bugun boshlang —
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-primary-400 bg-clip-text text-transparent">
              bepul va tez
            </span>
          </h2>
          <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
            Minglab talabalar bilan birga o'rganing va professional darajaga ering.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-primary-600 hover:from-blue-400 hover:to-primary-500 text-white font-bold rounded-xl transition-all shadow-xl shadow-blue-500/20 text-base"
            >
              Bepul ro'yxatdan o'ting
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold rounded-xl transition-colors text-base backdrop-blur-sm"
            >
              Demo kirish
            </Link>
          </div>
          <p className="text-xs text-gray-500 mt-5">Karta talab qilinmaydi · Darhol kirish · Bepul</p>
        </div>
      </section>

      <footer className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid sm:grid-cols-4 gap-8 mb-10">
            <div className="sm:col-span-2">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-primary-600 rounded-xl flex items-center justify-center">
                  <Map size={16} className="text-white" />
                </div>
                <span className="text-xl font-bold text-white">GeoEdu</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
                Kartografiya, Topografiya va GIS fanlarini o'rganish uchun zamonaviy interaktiv platforma.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Platform</p>
              <ul className="space-y-2.5">
                {['Fanlar', 'Video darslar', 'Testlar', 'Materiallar'].map((l) => (
                  <li key={l}>
                    <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-colors">{l}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Akkaunt</p>
              <ul className="space-y-2.5">
                {[{label: 'Kirish', to: '/login'}, {label: "Ro'yxat", to: '/register'}, {label: 'Demo', to: '/login'}].map(({ label, to }) => (
                  <li key={label}>
                    <Link to={to} className="text-sm text-gray-400 hover:text-white transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-500">
              © 2024 GeoEdu. Barcha huquqlar himoyalangan.
            </p>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-gray-500">Barcha tizimlar ishlayapti</span>
            </div>
          </div>
        </div>
      </footer>
      </div>{/* end z-10 wrapper */}
    </div>
  )
}
