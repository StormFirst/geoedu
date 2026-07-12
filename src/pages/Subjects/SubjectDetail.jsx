import { Link, useParams, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import {
  Map, Mountain, Globe, BookOpen, Video, FileText, ClipboardList,
  ChevronRight, CheckCircle, Clock, BarChart2, ArrowLeft, Lock,
} from 'lucide-react'
import { SUBJECTS, TOPICS, TESTS } from '../../data/mockData'
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
const difficultyLabels = {
  beginner: 'Boshlang\'ich',
  intermediate: 'O\'rta',
  advanced: 'Yuqori',
}

export default function SubjectDetail() {
  const { subjectId } = useParams()
  const { t, i18n } = useTranslation()
  const { currentUser } = useAuth()
  const lang = i18n.language?.slice(0, 2) || 'uz'

  const subject = SUBJECTS.find((s) => s.id === subjectId)
  const topics = TOPICS[subjectId] || []
  if (!subject) return <Navigate to="/subjects" replace />

  const completedTopics = currentUser?.completedTopics || []
  const testResults = currentUser?.testResults || []
  const Icon = subjectIcons[subjectId]

  // A topic is "unlocked" if it's the first one OR (the previous topic is unlocked AND its test/completion is cleared)
  const isTopicUnlocked = (index) => {
    return true // TEMPORARILY UNLOCKED FOR TESTING
    if (index === 0) return true

    const prevTopic = topics[index - 1]
    const prevTest = Object.values(TESTS).find((t) => t.topicId === prevTopic.id)
    if (prevTest) {
      // If there is a test, the user must have passed it
      return testResults.some((r) => r.testId === prevTest.id && r.passed)
    } else {
      // If there is no test, the topic itself must be completed (marked as completed by user)
      return completedTopics.includes(prevTopic.id)
    }
  }

  const completedCount = completedTopics.filter((id) =>
    topics.some((t) => t.id === id)
  ).length

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
            { icon: Video, val: `${topics.filter(t => t.videoUrl || t.video).length} video` },
            { icon: FileText, val: `${Object.values(TESTS).filter(t => t.subjectId === subjectId).length} test` },
          ].map(({ icon: I, val }) => (
            <div key={val} className="flex items-center gap-1.5 text-white/90 text-sm">
              <I size={16} />
              {val}
            </div>
          ))}
        </div>

        {/* Progress bar */}
        {topics.length > 0 && (
          <div className="mt-5">
            <div className="flex items-center justify-between text-white/80 text-xs mb-1.5">
              <span>Jarayon</span>
              <span>{completedCount}/{topics.length} mavzu</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-white rounded-full h-2 transition-all"
                style={{ width: `${(completedCount / topics.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Mavzular ({topics.length})
      </h2>

      <div className="space-y-3">
        {topics.map((topic, index) => {
          const isCompleted = completedTopics.includes(topic.id)
          const unlocked = isTopicUnlocked(index)
          const linkedTest = Object.values(TESTS).find((t) => t.topicId === topic.id)
          const testPassed = linkedTest
            ? testResults.some((r) => r.testId === linkedTest.id && r.passed)
            : false

          if (!unlocked) {
            // Locked topic
            return (
              <div
                key={topic.id}
                className="card p-4 flex items-center gap-4 opacity-60 cursor-not-allowed select-none"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                  <Lock size={16} className="text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-500 dark:text-gray-400 text-sm truncate">
                    {topic.title[lang] || topic.title.uz}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Oldingi mavzu testini o'ting
                  </p>
                </div>
                <Lock size={16} className="text-gray-300 flex-shrink-0" />
              </div>
            )
          }

          return (
            <Link
              key={topic.id}
              to={`/subjects/${subjectId}/topics/${topic.id}`}
              className="card p-4 flex items-center gap-4 hover:shadow-md transition-all group"
            >
              <div className={clsx(
                'w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors',
                isCompleted && testPassed
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : isCompleted
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 group-hover:text-primary-600'
              )}>
                {isCompleted && testPassed ? <CheckCircle size={18} /> : index + 1}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                  {topic.title[lang] || topic.title.uz}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock size={11} /> {topic.duration}
                  </span>
                  <span className={clsx('badge text-xs', difficultyColors[topic.difficulty])}>
                    {difficultyLabels[topic.difficulty] || topic.difficulty}
                  </span>
                  {topic.hasTest && (
                    <span className={clsx('flex items-center gap-1 text-xs', testPassed ? 'text-green-500' : 'text-blue-500')}>
                      <FileText size={11} />
                      {testPassed ? 'Test o\'tildi ✓' : 'Test'}
                    </span>
                  )}
                  {topic.hasPractical && (
                    <span className="flex items-center gap-1 text-xs text-purple-500">
                      <ClipboardList size={11} /> Amaliy
                    </span>
                  )}
                  {topic.videoUrl && (
                    <span className="flex items-center gap-1 text-xs text-green-500">
                      <Video size={11} /> Video
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {testPassed && (
                  <span className="badge bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs">
                    ✓ O'tildi
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
