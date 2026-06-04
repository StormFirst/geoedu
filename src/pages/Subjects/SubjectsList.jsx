import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { Map, Mountain, Globe, BookOpen, Video, FileText, Users, ChevronRight } from 'lucide-react'
import { SUBJECTS, TOPICS } from '../../data/mockData'

const subjectIcons = { kartografiya: Map, topografiya: Mountain, gis: Globe }
const subjectGradients = {
  kartografiya: 'from-blue-500 to-blue-700',
  topografiya: 'from-emerald-500 to-emerald-700',
  gis: 'from-orange-500 to-orange-700',
}
const subjectBorders = {
  kartografiya: 'border-blue-100 dark:border-blue-800 hover:border-blue-300',
  topografiya: 'border-emerald-100 dark:border-emerald-800 hover:border-emerald-300',
  gis: 'border-orange-100 dark:border-orange-800 hover:border-orange-300',
}

export default function SubjectsList() {
  const { t, i18n } = useTranslation()
  const { currentUser } = useAuth()
  const lang = i18n.language
  const completedTopics = currentUser?.completedTopics || []

  return (
    <div>
      <div className="mb-6">
        <h1 className="section-title">{t('subjects.title')}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Uchta asosiy fan bo'yicha to'liq o'quv kurslari
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {SUBJECTS.map((subject) => {
          const Icon = subjectIcons[subject.id]
          const topicsList = TOPICS[subject.id] || []
          const done = topicsList.filter((t) => completedTopics.includes(t.id)).length
          const pct = Math.round((done / topicsList.length) * 100)

          return (
            <Link
              key={subject.id}
              to={`/subjects/${subject.id}`}
              className={`card border p-6 hover:shadow-lg transition-all ${subjectBorders[subject.id]}`}
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${subjectGradients[subject.id]} rounded-2xl flex items-center justify-center mb-4`}>
                <Icon size={26} className="text-white" />
              </div>

              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {subject.name[lang] || subject.name.uz}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                {subject.description[lang] || subject.description.uz}
              </p>

              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  { icon: BookOpen, val: subject.topicsCount, label: 'mavzu' },
                  { icon: Video, val: subject.videosCount, label: 'video' },
                  { icon: FileText, val: subject.testsCount, label: 'test' },
                  { icon: Users, val: subject.studentsCount, label: 'talaba' },
                ].map(({ icon: I, val, label }) => (
                  <div key={label} className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                    <I size={14} />
                    <span className="font-medium text-gray-700 dark:text-gray-300">{val}</span>
                    <span>{label}</span>
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Taraqqiyot</span>
                  <span>{done}/{topicsList.length} mavzu</span>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`bg-gradient-to-r ${subjectGradients[subject.id]} rounded-full h-2 transition-all`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">
                  {pct > 0 ? `${pct}% tugatildi` : "Boshlash"}
                </span>
                <ChevronRight size={18} className="text-gray-400" />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
