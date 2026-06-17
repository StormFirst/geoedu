import { useState } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import {
  ArrowLeft, CheckCircle, Video, FileText, ChevronLeft, ChevronRight,
  BookOpen, PresentationIcon, Wrench, FlaskConical, Lock,
  PlayCircle, Presentation,
} from 'lucide-react'
import { SUBJECTS, TOPICS, TESTS } from '../../data/mockData'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const TABS = [
  { id: 'nazariy',    label: 'Nazariy',      icon: BookOpen },
  { id: 'video',      label: 'Video darslik', icon: PlayCircle },
  { id: 'taqdimot',  label: 'Taqdimot',      icon: Presentation },
  { id: 'amaliy',    label: 'Amaliy',        icon: FlaskConical },
  { id: 'test',      label: 'Test',          icon: FileText },
]

export default function TopicDetail() {
  const { subjectId, topicId } = useParams()
  const { t, i18n } = useTranslation()
  const { currentUser, completeTopicDemo } = useAuth()
  const lang = i18n.language?.slice(0, 2) || 'uz'

  const [activeTab, setActiveTab] = useState('nazariy')

  const subject = SUBJECTS.find((s) => s.id === subjectId)
  const topicsList = TOPICS[subjectId] || []
  const topic = topicsList.find((tp) => tp.id === topicId)
  const topicIndex = topicsList.findIndex((tp) => tp.id === topicId)
  const prevTopic = topicsList[topicIndex - 1]
  const nextTopic = topicsList[topicIndex + 1]

  if (!subject || !topic) return <Navigate to={`/subjects/${subjectId}`} replace />

  const testResults = currentUser?.testResults || []
  const completedTopics = currentUser?.completedTopics || []

  // Check if topic is unlocked
  const isTopicUnlocked = (id) => {
    const idx = topicsList.findIndex((t) => t.id === id)
    if (idx <= 0) return true

    const prevTp = topicsList[idx - 1]
    if (!isTopicUnlocked(prevTp.id)) return false

    const prevTest = Object.values(TESTS).find((t) => t.topicId === prevTp.id)
    if (prevTest) {
      return testResults.some((r) => r.testId === prevTest.id && r.passed)
    } else {
      return completedTopics.includes(prevTp.id)
    }
  }

  if (!isTopicUnlocked(topicId)) {
    return <Navigate to={`/subjects/${subjectId}`} replace />
  }

  const isCompleted = completedTopics.includes(topicId)
  const test = Object.values(TESTS).find((t) => t.topicId === topicId)
  const testPassed = test ? testResults.some((r) => r.testId === test.id && r.passed) : false

  const markComplete = () => {
    completeTopicDemo(topicId)
    toast.success('Mavzu tugatildi!')
  }

  const videoId = topic.videoUrl?.includes('watch?v=')
    ? topic.videoUrl.split('watch?v=')[1]
    : null

  const canGoNext = !test ? isCompleted : testPassed

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-4 flex-wrap text-sm">
        <Link to="/subjects" className="text-gray-400 hover:text-gray-600">
          {t('subjects.title')}
        </Link>
        <ChevronRight size={13} className="text-gray-300" />
        <Link to={`/subjects/${subjectId}`} className="text-gray-400 hover:text-gray-600">
          {subject.name[lang] || subject.name.uz}
        </Link>
        <ChevronRight size={13} className="text-gray-300" />
        <span className="text-gray-700 dark:text-gray-300 font-medium truncate max-w-xs">
          {topic.title[lang] || topic.title.uz}
        </span>
      </div>

      {/* Header card */}
      <div className="card overflow-hidden mb-5">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-primary-200 text-xs mb-1 font-medium tracking-wide uppercase">
                {topicIndex + 1} / {topicsList.length} — mavzu
              </p>
              <h1 className="text-lg font-bold text-white leading-snug">
                {topic.title[lang] || topic.title.uz}
              </h1>
              <p className="text-primary-200 text-xs mt-1.5">{topic.duration}</p>
            </div>
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              {isCompleted ? (
                <div className="flex items-center gap-1.5 bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-medium">
                  <CheckCircle size={13} /> Tugatildi
                </div>
              ) : !test ? (
                <button
                  onClick={markComplete}
                  className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-full text-xs font-medium transition-colors border border-white/30"
                >
                  ✓ Tugatildi deb belgilash
                </button>
              ) : (
                <div className="text-white/80 text-xs italic">
                  Tugallash uchun testni o'ting
                </div>
              )}
              {testPassed && (
                <div className="flex items-center gap-1 bg-emerald-500 text-white px-2.5 py-1 rounded-full text-xs font-medium">
                  <CheckCircle size={11} /> Test o'tildi
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex overflow-x-auto scrollbar-none">
            {TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              const isTestTab = tab.id === 'test'
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    'flex items-center gap-2 px-4 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all flex-shrink-0',
                    isActive
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300',
                    isTestTab && testPassed && 'text-emerald-600 dark:text-emerald-400',
                  )}
                >
                  <Icon size={15} />
                  {tab.label}
                  {isTestTab && testPassed && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab content */}
        <div className="p-6">
          {/* NAZARIY */}
          {activeTab === 'nazariy' && (
            <div
              className="prose prose-gray dark:prose-invert max-w-none prose-headings:font-bold prose-h2:text-xl prose-h3:text-base prose-li:text-sm"
              dangerouslySetInnerHTML={{ __html: topic.content?.[lang] || topic.content?.uz || '<p>Nazariy matn mavjud emas.</p>' }}
              style={{ lineHeight: '1.75', color: 'inherit' }}
            />
          )}

          {/* VIDEO DARSLIK */}
          {activeTab === 'video' && (
            <div>
              {videoId ? (
                <div className="rounded-xl overflow-hidden bg-black aspect-video shadow-lg">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title={topic.title[lang] || topic.title.uz}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
                    <PlayCircle size={28} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">Video darslik hozircha mavjud emas</p>
                  <p className="text-gray-400 text-sm mt-1">Tez orada qo'shiladi</p>
                </div>
              )}
              {topic.videoDuration && videoId && (
                <p className="text-sm text-gray-500 mt-3 text-center">
                  ⏱ Davomiyligi: {topic.videoDuration}
                </p>
              )}
            </div>
          )}

          {/* TAQDIMOT */}
          {activeTab === 'taqdimot' && (
            <div>
              {topic.presentation?.[lang] || topic.presentation?.uz ? (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                        <Presentation size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">Taqdimot materiallari</p>
                        <p className="text-xs text-gray-500">{topic.title[lang] || topic.title.uz}</p>
                      </div>
                    </div>
                    <div
                      className="prose prose-sm dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: topic.presentation[lang] || topic.presentation.uz }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
                    <Presentation size={28} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">Taqdimot hozircha mavjud emas</p>
                  <p className="text-gray-400 text-sm mt-1">O'qituvchi tomonidan yuklanadi</p>
                </div>
              )}
            </div>
          )}

          {/* AMALIY */}
          {activeTab === 'amaliy' && (
            <div>
              {topic.practical?.[lang] || topic.practical?.uz ? (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-100 dark:border-purple-800">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center">
                      <FlaskConical size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Amaliy topshiriq</p>
                      <p className="text-xs text-gray-500">{topic.title[lang] || topic.title.uz}</p>
                    </div>
                  </div>
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: topic.practical[lang] || topic.practical.uz }}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-100 dark:border-purple-800">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center">
                        <FlaskConical size={20} className="text-white" />
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-white">Amaliy mashg'ulot</p>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                      Bu mavzu bo'yicha amaliy topshiriqni bajarish uchun avval nazariy qismni o'qing
                      va video darslikni ko'ring. Keyin testni ishlang.
                    </p>
                    <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-purple-100 dark:border-purple-800">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">📋 Topshiriq:</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        "{topic.title[lang] || topic.title.uz}" mavzusidagi asosiy tushunchalarni
                        daftarga yozib chiqing va har birini o'z so'zlaringiz bilan izohlang.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TEST */}
          {activeTab === 'test' && (
            <div>
              {test ? (
                <div className="flex flex-col items-center text-center py-8">
                  <div className={clsx(
                    'w-20 h-20 rounded-2xl flex items-center justify-center mb-5 shadow-lg',
                    testPassed
                      ? 'bg-gradient-to-br from-emerald-400 to-green-600'
                      : 'bg-gradient-to-br from-primary-500 to-primary-700'
                  )}>
                    {testPassed
                      ? <CheckCircle size={36} className="text-white" />
                      : <FileText size={36} className="text-white" />
                    }
                  </div>

                  {testPassed ? (
                    <>
                      <h2 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                        Test muvaffaqiyatli o'tildi! 🎉
                      </h2>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-sm">
                        Siz bu mavzu testini o'tdingiz. Keyingi mavzuga o'tishingiz mumkin.
                      </p>
                      <Link
                        to={`/tests/${test.id}`}
                        className="btn-secondary text-sm"
                      >
                        <FileText size={15} />
                        Qayta ishlash
                      </Link>
                    </>
                  ) : (
                    <>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Mavzu testiga kirish
                      </h2>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mb-2 max-w-sm">
                        Testni ishlash uchun avval nazariy va video darsliklarni ko'rib chiqing.
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mb-6">
                        <span>📝 {test.questions?.length || 10} ta savol</span>
                        <span>⏱ {test.timeLimit || 15} daqiqa</span>
                        <span>✅ 70% — o'tish bali</span>
                      </div>
                      <Link
                        to={`/tests/${test.id}`}
                        className="btn-primary"
                      >
                        <FileText size={16} />
                        Testni boshlash
                      </Link>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
                    <FileText size={28} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">Test hozircha mavjud emas</p>
                  <p className="text-gray-400 text-sm mt-1">Tez orada qo'shiladi</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        {/* Back */}
        {prevTopic ? (
          <Link
            to={`/subjects/${subjectId}/topics/${prevTopic.id}`}
            className="btn-secondary"
          >
            <ChevronLeft size={16} />
            {t('common.back')}
          </Link>
        ) : (
          <Link to={`/subjects/${subjectId}`} className="btn-secondary">
            <ArrowLeft size={16} />
            Fan sahifasi
          </Link>
        )}

        {/* Forward */}
        {nextTopic ? (
          canGoNext ? (
            <Link
              to={`/subjects/${subjectId}/topics/${nextTopic.id}`}
              className="btn-primary"
            >
              Keyingi mavzu
              <ChevronRight size={16} />
            </Link>
          ) : (
            <button
              onClick={() => {
                if (!test) {
                  toast.error("Keyingi mavzuga o'tish uchun avval ushbu mavzuni tugatildi deb belgilang!")
                } else {
                  toast.error("Keyingi mavzuga o'tish uchun avval testni o'ting!")
                  setActiveTab('test')
                }
              }}
              className="btn-primary opacity-60 flex items-center gap-2"
              title={test ? "Testni bajaring" : "Mavzuni tugating"}
            >
              <Lock size={15} />
              {test ? "Testni bajaring" : "Mavzuni tugating"}
              <ChevronRight size={16} />
            </button>
          )
        ) : (
          <Link to={`/subjects/${subjectId}`} className="btn-primary">
            <BookOpen size={16} />
            Barcha mavzular
          </Link>
        )}
      </div>

      {/* Lock notice */}
      {nextTopic && !canGoNext && (
        <div className="mt-4 flex items-center gap-2.5 p-3.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-700 dark:text-amber-400">
          <Lock size={15} className="flex-shrink-0" />
          <span>
            {test ? (
              <>
                Keyingi mavzuga o'tish uchun{' '}
                <button
                  onClick={() => setActiveTab('test')}
                  className="font-semibold underline underline-offset-2 hover:no-underline"
                >
                  testni bajaring
                </button>
                . Test 70% va undan yuqori ball bilan o'tilishi kerak.
              </>
            ) : (
              <>
                Keyingi mavzuga o'tish uchun yuqoridagi{' '}
                <span className="font-semibold">"✓ Tugatildi deb belgilash"</span>{' '}
                tugmasini bosing.
              </>
            )}
          </span>
        </div>
      )}
    </div>
  )
}
