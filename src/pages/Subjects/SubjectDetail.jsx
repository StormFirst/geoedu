import { Link, useParams, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import {
  Map, Mountain, Globe, BookOpen, Video, FileText, ClipboardList,
  ChevronRight, CheckCircle, Clock, BarChart2, ArrowLeft,
} from 'lucide-react'
import { SUBJECTS, TOPICS } from '../../data/mockData'
import clsx from 'clsx'

const subjectIcons = { kartografiya: Map, topografiya: Mountain, gis: Globe }
const subjectGradients = {
  kartografiya: 'from-blue-500 to-blue-700',
  topografiya: 'from-emerald-500 to-emerald-700',
  gis: 'from-orange-500 to-orange-700',
}
const difficultyColors = {
  beginner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  advanced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export default function SubjectDetail() {
  const { subjectId } = useParams()
  const { t, i18n } = useTranslation()
  const { currentUser } = useAuth()
  const lang = i18n.language

  const subject = SUBJECTS.find((s) => s.id === subjectId)
  const topics = TOPICS[subjectId] || []
  if (!subject) return <Navigate to="/subjects" replace />

  const completedTopics = currentUser?.completedTopics || []
  const Icon = subjectIcons[subjectId]

  return (
    <div>
      <Link to="/subjects" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-4">
        <ArrowLeft size={16} />
        {t('subjects.title')}
      </Link>

      <div className={`bg-gradient-to-br ${subjectGradients[subjectId]} rounded-2xl p-6 sm:p-8 text-white mb-6`}>
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Icon size={28} className="text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-2">{subject.name[lang] || subject.name.uz}</h1>
            <p className="text-white/80 text-sm leading-relaxed max-w-2xl">
              {subject.description[lang] || subject.description.uz}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 mt-6">
          {[
            { icon: BookOpen, val: `${topics.length} mavzu` },
            { icon: Video, val: `${subject.videosCount} video` },
            { icon: FileText, val: `${subject.testsCount} test` },
            { icon: ClipboardList, val: `${subject.materialsCount} material` },
          ].map(({ icon: I, val }) => (
            <div key={val} className="flex items-center gap-1.5 text-white/90 text-sm">
              <I size={16} />
              {val}
            </div>
          ))}
        </div>
      </div>

      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Mavzular ({topics.length})
      </h2>

      <div className="space-y-3">
        {topics.map((topic, index) => {
          const isCompleted = completedTopics.includes(topic.id)
          return (
            <Link
              key={topic.id}
              to={`/subjects/${subjectId}/topics/${topic.id}`}
              className="card p-4 flex items-center gap-4 hover:shadow-md transition-all group"
            >
              <div className={clsx(
                'w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors',
                isCompleted
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 group-hover:text-primary-600'
              )}>
                {isCompleted ? <CheckCircle size={18} /> : index + 1}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate">
                  {topic.title[lang] || topic.title.uz}
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock size={12} /> {topic.duration}
                  </span>
                  <span className={clsx('badge text-xs', difficultyColors[topic.difficulty])}>
                    {t(`subjects.difficulty.${topic.difficulty}`)}
                  </span>
                  {topic.hasTest && (
                    <span className="flex items-center gap-1 text-xs text-blue-500">
                      <FileText size={12} /> Test
                    </span>
                  )}
                  {topic.hasPractical && (
                    <span className="flex items-center gap-1 text-xs text-purple-500">
                      <ClipboardList size={12} /> Amaliy
                    </span>
                  )}
                  {topic.videoUrl && (
                    <span className="flex items-center gap-1 text-xs text-green-500">
                      <Video size={12} /> Video
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {isCompleted && (
                  <span className="badge bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs">
                    Tugatildi
                  </span>
                )}
                <ChevronRight size={18} className="text-gray-400 group-hover:text-primary-500 transition-colors" />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
