import { NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, BookOpen, Video, FileText, ClipboardList,
  Download, User, Trophy, Award, Settings, Users, BarChart3,
  Map, X,
} from 'lucide-react'
import clsx from 'clsx'

const studentLinks = [
  { to: '/dashboard', label: 'nav.dashboard', icon: LayoutDashboard },
  { to: '/subjects', label: 'nav.subjects', icon: BookOpen },
  { to: '/videos', label: 'nav.videos', icon: Video },
  { to: '/tests', label: 'nav.tests', icon: FileText },
  { to: '/assignments', label: 'nav.assignments', icon: ClipboardList },
  { to: '/materials', label: 'nav.materials', icon: Download },
  { to: '/rating', label: 'nav.rating', icon: Trophy },
  { to: '/certificates', label: 'nav.certificates', icon: Award },
  { to: '/profile', label: 'nav.profile', icon: User },
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

  const links = isAdminSection ? adminLinks : studentLinks

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
          'fixed top-0 left-0 z-30 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-300',
          'lg:translate-x-0 lg:static lg:z-auto',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Map size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">GeoEdu</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {isAdminSection && (
            <p className="px-3 py-1 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
              Admin
            </p>
          )}
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                clsx('nav-link', isActive && 'nav-link-active')
              }
            >
              <Icon size={18} />
              <span>{t(label)}</span>
            </NavLink>
          ))}

          {isAdmin && !isAdminSection && (
            <>
              <div className="my-3 border-t border-gray-200 dark:border-gray-700" />
              <p className="px-3 py-1 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Admin
              </p>
              <NavLink
                to="/admin"
                onClick={onClose}
                className={({ isActive }) =>
                  clsx('nav-link', isActive && 'nav-link-active')
                }
              >
                <Settings size={18} />
                <span>{t('nav.admin')}</span>
              </NavLink>
            </>
          )}
        </nav>

        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-700 dark:text-primary-400 font-semibold text-sm">
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {currentUser?.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {currentUser?.role}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
