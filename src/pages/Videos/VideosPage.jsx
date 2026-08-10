import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { Video, Eye, Clock, Lock, CheckCircle, ChevronRight, BookOpen, ShieldCheck } from 'lucide-react'
import { VIDEOS, SUBJECTS, TOPICS, TESTS } from '../../data/mockData'

const subjectColors = {
  kartografiya: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  topografiya: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  gis: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
}

// Function to check if a given topic is unlocked for the user
const isTopicUnlocked = (topicId, subjectId, user) => {
  if (!topicId || !subjectId) return true
  if (user?.role === 'admin' || user?.role === 'teacher') return true

  const topicsList = TOPICS[subjectId] || []
  const idx = topicsList.findIndex((t) => t.id === topicId)
  if (idx <= 0) return true

  const completedTopics = user?.completedTopics || []
  const testResults = user?.testResults || []

  for (let i = 0; i < idx; i++) {
    const prevTopic = topicsList[i]
    const prevTest = Object.values(TESTS).find((t) => t.topicId === prevTopic.id)
    if (prevTest) {
      const passed = testResults.some((r) => r.testId === prevTest.id && r.passed)
      if (!passed) return false
    } else {
      const completed = completedTopics.includes(prevTopic.id)
      if (!completed) return false
    }
  }

  return true
}

// Function to check if a video lesson is unlocked for the user
const isVideoUnlocked = (topicId, subjectId, user) => {
  if (!topicId || !subjectId) return true
  if (user?.role === 'admin' || user?.role === 'teacher') return true

  // The topic itself must be unlocked
  if (!isTopicUnlocked(topicId, subjectId, user)) return false

  // The video is unlocked if the user has completed the theory tab of this topic,
  // or if they have already completed the whole topic or passed its test.
  const completedTopics = user?.completedTopics || []
  const testResults = user?.testResults || []
  const test = Object.values(TESTS).find((t) => t.topicId === topicId)
  const testPassed = test ? testResults.some((r) => r.testId === test.id && r.passed) : false

  const isCompleted = completedTopics.includes(topicId) || testPassed
  const isTheoryCompleted = localStorage.getItem(`completed_theory_${topicId}`) === 'true'

  return isCompleted || isTheoryCompleted
}

// Combine explicit VIDEOS array and any additional topic videoUrls from TOPICS
const allTopicsList = Object.values(TOPICS).flat()
const allVideosList = [
  ...VIDEOS,
  ...allTopicsList
    .filter((tp) => tp.videoUrl && !VIDEOS.some((v) => v.topicId === tp.id))
    .map((tp) => ({
      id: `v-${tp.id}`,
      subjectId: tp.subjectId,
      topicId: tp.id,
      title: tp.title,
      url: tp.videoUrl,
      thumbnail: tp.videoUrl?.includes('watch?v=')
        ? `https://img.youtube.com/vi/${tp.videoUrl.split('watch?v=')[1]}/hqdefault.jpg`
        : 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80',
      duration: tp.videoDuration || tp.duration || '45:00',
      views: 320,
      date: '2024-02-01',
    })),
]

export default function VideosPage() {
  const { t, i18n } = useTranslation()
  const { currentUser } = useAuth()
  const lang = i18n.language?.slice(0, 2) || 'uz'
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)

  // Filter videos to only show those belonging to unlocked/open topics
  const openVideos = allVideosList.filter((video) =>
    isVideoUnlocked(video.topicId, video.subjectId, currentUser)
  )

  const filtered = filter === 'all' ? openVideos : openVideos.filter((v) => v.subjectId === filter)
  const subjectName = (id) => SUBJECTS.find((s) => s.id === id)?.name[lang] || id

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="section-title">{t('videos.title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            {lang === 'uz'
              ? "O'tgan va ochiq mavzularingiz bo'yicha video darslar"
              : lang === 'ru'
              ? "Видеоуроки по открытым и пройденным темам"
              : "Video lessons for your unlocked topics"}
          </p>
        </div>
        <div className="inline-flex items-center gap-2 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 px-3.5 py-2 rounded-xl text-xs font-medium self-start sm:self-auto">
          <ShieldCheck size={16} />
          <span>
            {lang === 'uz'
              ? `Ochiq video darslar: ${openVideos.length} ta`
              : `Unlocked video lessons: ${openVideos.length}`}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {[{ id: 'all', label: t('common.all') }, ...SUBJECTS.map((s) => ({ id: s.id, label: s.name[lang] || s.name.uz }))].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f.id
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {selected && (
        <div className="card mb-6 overflow-hidden">
          <div className="aspect-video bg-black">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${selected.url?.split('watch?v=')[1]}`}
              title={typeof selected.title === 'string' ? selected.title : selected.title[lang] || selected.title.uz}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="p-4 flex items-start justify-between">
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">
                {typeof selected.title === 'string' ? selected.title : selected.title[lang] || selected.title.uz}
              </h2>
              <div className="flex items-center gap-3 mt-1.5 text-sm text-gray-500 flex-wrap">
                <span className="flex items-center gap-1"><Eye size={14} />{selected.views}</span>
                <span className="flex items-center gap-1"><Clock size={14} />{selected.duration}</span>
                <span className={`badge ${subjectColors[selected.subjectId]}`}>{subjectName(selected.subjectId)}</span>
                {selected.topicId && (
                  <Link
                    to={`/subjects/${selected.subjectId}/topics/${selected.topicId}`}
                    className="inline-flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 font-medium hover:underline ml-2"
                  >
                    <BookOpen size={13} />
                    {lang === 'uz' ? "Mavzuga o'tish" : "Go to topic"}
                  </Link>
                )}
              </div>
            </div>
            <button onClick={() => setSelected(null)} className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 ml-4">
              Yopish ✕
            </button>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4 text-gray-400">
            <Lock size={32} />
          </div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
            {lang === 'uz' ? "Ochiq video darslar mavjud emas" : "No unlocked video lessons"}
          </h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-4">
            {lang === 'uz'
              ? "Ushbu bo'limdagi video darslarni ko'rish uchun fanlardagi o'tgan mavzular testlarini muvaffaqiyatli topshiring."
              : "Complete preceding topics and tests to unlock video lessons in this section."}
          </p>
          <Link to="/subjects" className="btn-primary inline-flex items-center gap-2 text-sm px-4 py-2">
            <BookOpen size={16} />
            {t('subjects.title')}
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((video) => (
            <div
              key={video.id}
              className="card overflow-hidden hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
              onClick={() => setSelected(video)}
            >
              <div>
                <div className="relative aspect-video bg-gray-900 overflow-hidden">
                  <img
                    src={video.thumbnail}
                    alt={typeof video.title === 'string' ? video.title : video.title[lang] || video.title.uz}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-black/60 rounded-full flex items-center justify-center group-hover:bg-primary-600 transition-colors">
                      <Video size={20} className="text-white ml-0.5" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
                    {video.duration}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm leading-snug mb-2 line-clamp-2">
                    {typeof video.title === 'string' ? video.title : video.title[lang] || video.title.uz}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className={`badge text-xs ${subjectColors[video.subjectId]}`}>
                      {subjectName(video.subjectId)}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Eye size={12} /> {video.views}
                    </span>
                  </div>
                </div>
              </div>

              {video.topicId && (
                <div className="px-4 pb-4 pt-0">
                  <Link
                    to={`/subjects/${video.subjectId}/topics/${video.topicId}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
                  >
                    <BookOpen size={12} />
                    {lang === 'uz' ? "Mavzuga o'tish" : "Go to topic"}
                    <ChevronRight size={12} />
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

