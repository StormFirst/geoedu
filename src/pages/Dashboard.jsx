import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import {
  BookOpen, Video, FileText, Download, Trophy, Award,
  TrendingUp, Clock, ChevronRight, CheckCircle, Map, Mountain, Globe,
} from 'lucide-react'
import { SUBJECTS, TOPICS } from '../data/mockData'

const allTopics = Object.values(TOPICS).flat()

const subjectColors = {
  kartografiya: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
  topografiya: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
  gis: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
}
const subjectIcons = { kartografiya: Map, topografiya: Mountain, gis: Globe }

export default function Dashboard() {
  const { t, i18n } = useTranslation()
  const { currentUser } = useAuth()
  const lang = i18n.language

  const completedTopics = currentUser?.completedTopics || []
  const testResults = currentUser?.testResults || []
  const avgScore = testResults.length
    ? Math.round(testResults.reduce((sum, r) => sum + (r.score || 0), 0) / testResults.length)
    : 0
  const passedTests = testResults.filter((r) => r.passed).length

  const quickLinks = [
    { to: '/subjects', icon: BookOpen, label: t('nav.subjects'), color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
    { to: '/videos', icon: Video, label: t('nav.videos'), color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
    { to: '/tests', icon: FileText, label: t('nav.tests'), color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
    { to: '/materials', icon: Download, label: t('nav.materials'), color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20' },
    { to: '/rating', icon: Trophy, label: t('nav.rating'), color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20' },
    { to: '/certificates', icon: Award, label: t('nav.certificates'), color: 'text-pink-600 bg-pink-50 dark:bg-pink-900/20' },
  ]

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 text-white">
        <p className="text-primary-200 text-sm mb-1">{t('dashboard.welcome')},</p>
        <h1 className="text-2xl font-bold mb-1">{currentUser?.name} 👋</h1>
        <p className="text-primary-200 text-sm">
          {currentUser?.university}
          {currentUser?.group && ` • ${currentUser.group}`}
        </p>
        <div className="mt-4 flex items-center gap-2">
          <div className="flex-1 bg-white/20 rounded-full h-2">
            <div
              className="bg-white rounded-full h-2 transition-all"
              style={{ width: `${Math.round((completedTopics.length / allTopics.length) * 100)}%` }}
            />
          </div>
          <span className="text-sm font-medium">
            {completedTopics.length}/{allTopics.length} mavzu
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: t('dashboard.completedTopics'), value: completedTopics.length, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: t('dashboard.testResults'), value: passedTests, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: t('dashboard.avgScore'), value: `${avgScore}%`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
          { label: t('dashboard.certificates'), value: currentUser?.certificates?.length || 0, icon: Award, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-4">
            <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon size={18} className={color} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('dashboard.quickAccess')}</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {quickLinks.map(({ to, icon: Icon, label, color }) => (
            <Link
              key={to}
              to={to}
              className="card p-4 flex flex-col items-center gap-2 hover:shadow-md transition-all text-center group"
            >
              <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <Icon size={20} />
              </div>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-tight">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">{t('subjects.title')}</h2>
            <Link to="/subjects" className="text-xs text-primary-600 flex items-center gap-1">
              Barchasi <ChevronRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {SUBJECTS.map((subject) => {
              const Icon = subjectIcons[subject.id]
              const topicsList = TOPICS[subject.id] || []
              const done = topicsList.filter((t) => completedTopics.includes(t.id)).length
              const pct = Math.round((done / topicsList.length) * 100)
              return (
                <Link
                  key={subject.id}
                  to={`/subjects/${subject.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${subjectColors[subject.id]}`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {subject.name[lang] || subject.name.uz}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                        <div
                          className="bg-primary-500 rounded-full h-1.5"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400">{pct}%</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
                </Link>
              )
            })}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">{t('dashboard.recentActivity')}</h2>
          </div>
          {testResults.length === 0 ? (
            <div className="text-center py-8">
              <Clock size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
              <p className="text-sm text-gray-400">Hali faoliyat yo'q</p>
              <Link to="/subjects" className="mt-3 inline-block text-xs text-primary-600">
                O'rganishni boshlash →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {testResults.slice(-5).reverse().map((result, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/30">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    result.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {result.score}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Test #{result.testId?.split('-').pop()}
                    </p>
                    <p className="text-xs text-gray-500">{result.date}</p>
                  </div>
                  <div className="ml-auto">
                    <span className={`badge text-xs ${result.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {result.passed ? "O'tdi" : "O'tmadi"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
