import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import {
  Menu, Sun, Moon, Globe, LogOut, User, ChevronDown, Bell,
} from 'lucide-react'
import clsx from 'clsx'
import toast from 'react-hot-toast'

const LANGUAGES = [
  { code: 'uz', label: "O'zbekcha" },
  { code: 'ru', label: 'Русский' },
  { code: 'en', label: 'English' },
]

export default function Header({ onMenuClick }) {
  const { t, i18n } = useTranslation()
  const { currentUser, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [langOpen, setLangOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)

  const handleLangChange = (code) => {
    i18n.changeLanguage(code)
    localStorage.setItem('geoedu-lang', code)
    setLangOpen(false)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
    toast.success("Tizimdan chiqildi")
    setUserOpen(false)
  }

  const currentLang = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0]

  return (
    <header className="sticky top-0 z-10 h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 gap-3">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
      >
        <Menu size={20} />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-1">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
          title={theme === 'dark' ? t('common.lightMode') : t('common.darkMode')}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="relative">
          <button
            onClick={() => { setLangOpen(!langOpen); setUserOpen(false) }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm font-medium transition-colors"
          >
            <Globe size={16} />
            <span className="hidden sm:inline">{currentLang.label}</span>
            <ChevronDown size={14} />
          </button>
          {langOpen && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-1 z-50">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLangChange(lang.code)}
                  className={clsx(
                    'w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors',
                    i18n.language === lang.code
                      ? 'text-primary-600 dark:text-primary-400 font-medium'
                      : 'text-gray-700 dark:text-gray-300'
                  )}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 relative">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <div className="relative">
          <button
            onClick={() => { setUserOpen(!userOpen); setLangOpen(false) }}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-700 dark:text-primary-400 font-semibold text-xs">
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
            <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[100px] truncate">
              {currentUser?.name}
            </span>
            <ChevronDown size={14} className="text-gray-400" />
          </button>

          {userOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-1 z-50">
              <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{currentUser?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{currentUser?.role}</p>
              </div>
              <button
                onClick={() => { navigate('/profile'); setUserOpen(false) }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <User size={15} />
                {t('nav.profile')}
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut size={15} />
                {t('nav.logout')}
              </button>
            </div>
          )}
        </div>
      </div>

      {(langOpen || userOpen) && (
        <div className="fixed inset-0 z-40" onClick={() => { setLangOpen(false); setUserOpen(false) }} />
      )}
    </header>
  )
}
