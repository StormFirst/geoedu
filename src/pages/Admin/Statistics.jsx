import { useTranslation } from 'react-i18next'
import {
  Users, BookOpen, FileText, TrendingUp, Award, Video,
} from 'lucide-react'
import { STATS, SUBJECTS, TOPICS } from '../../data/mockData'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend,
} from 'recharts'

const COLORS = ['#2563eb', '#16a34a', '#ea580c', '#9333ea']

const monthlyData = [
  { month: 'Yan', tests: 45, students: 12 },
  { month: 'Fev', tests: 78, students: 28 },
  { month: 'Mar', tests: 112, students: 45 },
  { month: 'Apr', tests: 165, students: 67 },
  { month: 'May', tests: 198, students: 89 },
  { month: 'Iyn', tests: 234, students: 112 },
]

export default function Statistics() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language

  const subjectData = SUBJECTS.map((s) => ({
    name: s.name[lang] || s.name.uz,
    talabalar: s.studentsCount,
    mavzular: (TOPICS[s.id] || []).length,
  }))

  const pieData = SUBJECTS.map((s) => ({
    name: s.name[lang] || s.name.uz,
    value: s.studentsCount,
  }))

  const statCards = [
    { label: 'Jami foydalanuvchilar', value: STATS.totalStudents + STATS.totalTeachers, icon: Users, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20', change: '+12%' },
    { label: 'Faol foydalanuvchilar', value: STATS.activeUsers, icon: TrendingUp, color: 'text-green-600 bg-green-50 dark:bg-green-900/20', change: '+8%' },
    { label: "O'rtacha ball", value: `${STATS.avgScore}%`, icon: Award, color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20', change: '+2%' },
    { label: 'Jami testlar', value: STATS.totalTests, icon: FileText, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20', change: '+5' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title">{t('admin.statistics')}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Platform tahlili va statistikalar</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, change }) => (
          <div key={label} className="card p-4">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon size={18} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
            <p className="text-xs text-green-600 font-medium mt-1">{change} bu oy</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Oylik faollik</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
              <Legend />
              <Line type="monotone" dataKey="tests" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} name="Testlar" />
              <Line type="monotone" dataKey="students" stroke="#16a34a" strokeWidth={2} dot={{ r: 3 }} name="Yangi talabalar" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Fan bo'yicha talabalar</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {pieData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Fanlar bo'yicha statistika</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={subjectData} barGap={8}>
            <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
            <Legend />
            <Bar dataKey="talabalar" fill="#2563eb" radius={[4, 4, 0, 0]} name="Talabalar" />
            <Bar dataKey="mavzular" fill="#16a34a" radius={[4, 4, 0, 0]} name="Mavzular" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
