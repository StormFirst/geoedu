import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import {
  User, Edit3, Save, X, Mail,
  CheckCircle, FileText, TrendingUp, Calendar,
} from 'lucide-react'
import { TOPICS, SUBJECTS } from '../../data/mockData'
import toast from 'react-hot-toast'

const allTopics = Object.values(TOPICS).flat()

export default function ProfilePage() {
  const { t, i18n } = useTranslation()
  const { currentUser, updateUser } = useAuth()
  const lang = i18n.language
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    name: currentUser?.name || '',
  })

  const completedTopics = currentUser?.completedTopics || []
  const testResults = currentUser?.testResults || []
  const avgScore = testResults.length
    ? Math.round(testResults.reduce((s, r) => s + r.score, 0) / testResults.length)
    : 0
  const passedTests = testResults.filter((r) => r.passed).length

  const save = () => {
    updateUser(form)
    setEditing(false)
    toast.success(t('common.success'))
  }

  const getSubjectName = (id) => SUBJECTS.find((s) => s.id === id)?.name[lang] || id

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="card p-6">
        <div className="flex items-start justify-between mb-5">
          <h1 className="section-title">{t('profile.title')}</h1>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="btn-secondary text-sm">
              <Edit3 size={15} /> {t('profile.edit')}
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={save} className="btn-primary text-sm py-1.5">
                <Save size={15} /> {t('profile.save')}
              </button>
              <button onClick={() => setEditing(false)} className="btn-secondary text-sm py-1.5">
                <X size={15} /> {t('profile.cancel')}
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-5 mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
            {currentUser?.name?.charAt(0) || 'U'}
          </div>
          <div>
            {editing ? (
              <input
                className="input text-xl font-bold mb-2"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            ) : (
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{currentUser?.name}</h2>
            )}
            <span className={`badge text-xs capitalize mt-1 ${
              currentUser?.role === 'admin' ? 'bg-red-100 text-red-700' :
              currentUser?.role === 'teacher' ? 'bg-purple-100 text-purple-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {currentUser?.role}
            </span>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label text-xs">{t('auth.email')}</label>
            <div className="flex items-center gap-2 input cursor-not-allowed opacity-70">
              <Mail size={15} className="text-gray-400" />
              {currentUser?.email}
            </div>
          </div>
          <div>
            <label className="label text-xs">{t('profile.joinDate')}</label>
            <div className="flex items-center gap-2 input cursor-not-allowed opacity-70">
              <Calendar size={15} className="text-gray-400" />
              {currentUser?.joinDate}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: CheckCircle, val: completedTopics.length, label: t('dashboard.completedTopics'), color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
          { icon: FileText, val: passedTests, label: "O'tilgan testlar", color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
          { icon: TrendingUp, val: `${avgScore}%`, label: t('dashboard.avgScore'), color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
          { icon: User, val: testResults.length, label: 'Jami testlar', color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20' },
        ].map(({ icon: Icon, val, label, color }) => (
          <div key={label} className="card p-4">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon size={18} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{val}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-tight">{label}</p>
          </div>
        ))}
      </div>

      {testResults.length > 0 && (
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Test natijalari tarixi</h2>
          <div className="space-y-2">
            {testResults.slice().reverse().map((result, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/30">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  result.passed ? 'bg-green-100 dark:bg-green-900/30 text-green-700' : 'bg-red-100 dark:bg-red-900/30 text-red-600'
                }`}>
                  {result.score}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    Test ID: {result.testId}
                  </p>
                  <p className="text-xs text-gray-400">{result.date}</p>
                </div>
                <span className={`badge text-xs ${result.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  {result.passed ? "O'tdi" : "O'tmadi"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
