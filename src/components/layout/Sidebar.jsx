import { NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, BookOpen, Video, FileText, ClipboardList,
  Download, User, Trophy, Award, Settings, Users, BarChart3,
  Map, X, Gamepad2, Sparkles, Beaker, Briefcase,
} from 'lucide-react'
import clsx from 'clsx'

const studentCategories = [
  {
    id: 'main',
    label: 'nav.groupMain',
    defaultLabel: 'Asosiy',
    links: [
      { to: '/dashboard', label: 'nav.dashboard', icon: LayoutDashboard },
      { to: '/profile', label: 'nav.profile', icon: User },
    ]
  },
  {
    id: 'learning',
    label: 'nav.groupLearning',
    defaultLabel: "O'quv xonasi",
    links: [
      { to: '/subjects', label: 'nav.subjects', icon: BookOpen },
      { to: '/videos', label: 'nav.videos', icon: Video },
      { to: '/materials', label: 'nav.materials', icon: Download },
    ]
  },
  {
    id: 'gis',
    label: 'nav.groupGis',
    defaultLabel: 'GIS & Xaritalar',
    links: [
      { to: '/map-tools', label: 'nav.mapTools', icon: Map },
      { to: '/ai-assistant', label: 'nav.aiAssistant', icon: Sparkles },
      { to: '/gis-lab', label: 'nav.gisLab', icon: Beaker },
      { to: '/gis-case-study', label: 'nav.gisCaseStudy', icon: Briefcase },
    ]
  },
  {
    id: 'evaluation',
    label: 'nav.groupEvaluation',
    defaultLabel: 'Baholash va Natijalar',
    links: [
      { to: '/tests', label: 'nav.tests', icon: FileText },
      { to: '/assignments', label: 'nav.assignments', icon: ClipboardList },
      { to: '/certificates', label: 'nav.certificates', icon: Award },
    ]
  },
  {
    id: 'community',
    label: 'nav.groupCommunity',
    defaultLabel: "Reyting & O'yinlar",
    links: [
      { to: '/gamification', label: 'nav.gamification', icon: Gamepad2 },
      { to: '/rating', label: 'nav.rating', icon: Trophy },
    ]
  }
]

const adminLinks = [
  { to: '/admin', label: 'nav.admin', icon: Settings, end: true },
  { to: '/admin/users', label: 'admin.manageUsers', icon: Users },
  { to: '/admin/subjects', label: 'admin.manageSubjects', icon: BookOpen },
  { to: '/admin/tests', label: 'admin.manageTests', icon: FileText },
  { to: '/admin/statistics', label: 'admin.statistics', icon: BarChart3 },
]

export default function Sidebar({ open, onClose }) {
  const { t } = useTranslation()
  const { currentUser } = useAuth()
  const location = useLocation()

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'teacher'
  const isAdminSection = location.pathname.startsWith('/admin')

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={clsx(
          'fixed top-0 left-0 z-30 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-150 dark:border-gray-800 flex flex-col transition-transform duration-300',
          'lg:translate-x-0 lg:static lg:z-auto',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-150 dark:border-gray-880 select-none">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-md shadow-primary-500/20">
              <Map size={18} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black bg-gradient-to-r from-primary-600 to-emerald-500 bg-clip-text text-transparent tracking-tight leading-none">GeoEdu</span>
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1">GIS Academy</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation panel */}
        <nav className="flex-1 px-4 py-6 space-y-5 overflow-y-auto no-scrollbar">
          {isAdminSection ? (
            <div className="space-y-1">
              <p className="px-3 py-1 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1.5 select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500/50"></span>
                Admin Panel
              </p>
              {adminLinks.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    clsx(
                      'nav-link transition-all duration-200 hover:translate-x-1',
                      isActive && 'nav-link-active font-semibold shadow-sm shadow-primary-500/5'
                    )
                  }
                >
                  <Icon size={18} />
                  <span>{t(label)}</span>
                </NavLink>
              ))}
            </div>
          ) : (
            studentCategories.map((cat) => (
              <div key={cat.id} className="space-y-1.5">
                <div
                  className="px-3 py-1 text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest select-none text-left flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/40"></span>
                  {t(cat.label, cat.defaultLabel)}
                </div>

                <div className="pl-1 border-l border-gray-100 dark:border-gray-850 ml-3.5 space-y-0.5">
                  {cat.links.map(({ to, label, icon: Icon }) => (
                    <NavLink
                      key={to}
                      to={to}
                      onClick={onClose}
                      className={({ isActive }) =>
                        clsx(
                          'nav-link py-2 transition-all duration-200 hover:translate-x-1',
                          isActive && 'nav-link-active font-semibold shadow-sm shadow-primary-500/5'
                        )
                      }
                    >
                      <Icon size={16} />
                      <span className="text-[13px]">{t(label)}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            ))
          )}

          {isAdmin && !isAdminSection && (
            <>
              <div className="my-4 border-t border-gray-150 dark:border-gray-800" />
              <p className="px-3 py-1 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1.5 select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500/40"></span>
                Admin
              </p>
              <NavLink
                to="/admin"
                onClick={onClose}
                className={({ isActive }) =>
                  clsx(
                    'nav-link transition-all duration-200 hover:translate-x-1',
                    isActive && 'nav-link-active font-semibold shadow-sm shadow-primary-500/5'
                  )
                }
              >
                <Settings size={18} />
                <span>{t('nav.admin')}</span>
              </NavLink>
            </>
          )}
        </nav>

        {/* User profile footer */}
        <div className="px-4 py-4 border-t border-gray-150 dark:border-gray-800 bg-gray-50/20 dark:bg-gray-950/20 select-none">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white dark:bg-gray-850 border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary-500 to-emerald-400 flex items-center justify-center text-white font-black text-sm shadow-inner relative flex-shrink-0 overflow-hidden border border-gray-150 dark:border-gray-800">
              {currentUser?.avatar ? (
                <img src={currentUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                currentUser?.name?.charAt(0) || 'U'
              )}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-gray-850 rounded-full z-10"></span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                {currentUser?.name}
              </p>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider truncate mt-0.5">
                {currentUser?.role}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
