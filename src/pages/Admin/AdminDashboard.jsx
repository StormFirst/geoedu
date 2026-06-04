import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Users, BookOpen, FileText, Video, BarChart3,
  TrendingUp, ChevronRight, Settings,
} from 'lucide-react'
import { STATS, LEADERBOARD } from '../../data/mockData'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const chartData = [
  { name: 'Yan', users: 45 },
  { name: 'Fev', users: 72 },
  { name: 'Mar', users: 89 },
  { name: 'Apr', users: 134 },
  { name: 'May', users: 198 },
  { name: 'Iyn', users: 244 },
]

export default function AdminDashboard() {
  const { t } = useTranslation()

  const statCards = [
    { label: t('admin.totalStudents'), value: STATS.totalStudents, icon: Users, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20', link: '/admin/users' },
    { label: t('admin.totalTeachers'), value: STATS.totalTeachers, icon: Settings, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20', link: '/admin/users' },
    { label: t('admin.totalTopics'), value: STATS.totalTopics, icon: BookOpen, color: 'text-green-600 bg-green-50 dark:bg-green-900/20', link: '/admin/subjects' },
    { label: 'Jami testlar', value: STATS.totalTests, icon: FileText, color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20', link: '/admin/tests' },
    { label: 'Video darslar', value: STATS.totalVideos, icon: Video, color: 'text-pink-600 bg-pink-50 dark:bg-pink-900/20', link: '/admin/subjects' },
    { label: t('admin.avgScore'), value: `${STATS.avgScore}%`, icon: TrendingUp, color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20', link: '/admin/statistics' },
  ]

  const adminLinks = [
    { to: '/admin/users', icon: Users, label: t('admin.manageUsers'), desc: `${STATS.totalStudents + STATS.totalTeachers} foydalanuvchi` },
    { to: '/admin/subjects', icon: BookOpen, label: t('admin.manageSubjects'), desc: `${STATS.totalTopics} mavzu` },
    { to: '/admin/tests', icon: FileText, label: t('admin.manageTests'), desc: `${STATS.totalTests} test` },
    { to: '/admin/statistics', icon: BarChart3, label: t('admin.statistics'), desc: 'Batafsil tahlil' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title">{t('admin.title')}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Platform boshqaruv markazi</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, link }) => (
          <Link key={label} to={link} className="card p-4 hover:shadow-md transition-all group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Oylik foydalanuvchilar</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="users" radius={[6, 6, 0, 0]} fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">Top talabalar</h2>
            <Link to="/rating" className="text-xs text-primary-600 flex items-center gap-1">
              Barchasi <ChevronRight size={13} />
            </Link>
          </div>
          <div className="space-y-2">
            {LEADERBOARD.slice(0, 5).map((user, i) => (
              <div key={user.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  i === 0 ? 'bg-yellow-100 text-yellow-700' :
                  i === 1 ? 'bg-gray-100 text-gray-600' :
                  i === 2 ? 'bg-orange-100 text-orange-600' :
                  'bg-gray-50 text-gray-400 dark:bg-gray-700'
                }`}>{i + 1}</span>
                <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xs font-semibold text-primary-700 dark:text-primary-400">
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{user.name}</p>
                  <p className="text-xs text-gray-400">{user.group}</p>
                </div>
                <span className="text-sm font-bold text-primary-600 dark:text-primary-400">{user.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Tez havolalar</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {adminLinks.map(({ to, icon: Icon, label, desc }) => (
            <Link key={to} to={to} className="card p-5 hover:shadow-md transition-all flex items-center gap-3 group">
              <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-400 group-hover:bg-primary-100 transition-colors flex-shrink-0">
                <Icon size={20} />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-gray-900 dark:text-white text-sm">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              </div>
              <ChevronRight size={16} className="text-gray-300 ml-auto flex-shrink-0 group-hover:text-primary-500 transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
