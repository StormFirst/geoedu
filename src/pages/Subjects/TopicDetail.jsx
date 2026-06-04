import { useState } from 'react'
import { Link, useParams, Navigate, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import {
  ArrowLeft, CheckCircle, Video, FileText, ExternalLink,
  ChevronLeft, ChevronRight, BookOpen,
} from 'lucide-react'
import { SUBJECTS, TOPICS, TESTS } from '../../data/mockData'
import toast from 'react-hot-toast'

export default function TopicDetail() {
  const { subjectId, topicId } = useParams()
  const { t, i18n } = useTranslation()
  const { currentUser, completeTopicDemo } = useAuth()
  const navigate = useNavigate()
  const lang = i18n.language

  const subject = SUBJECTS.find((s) => s.id === subjectId)
  const topicsList = TOPICS[subjectId] || []
  const topic = topicsList.find((tp) => tp.id === topicId)
  const topicIndex = topicsList.findIndex((tp) => tp.id === topicId)
  const prevTopic = topicsList[topicIndex - 1]
  const nextTopic = topicsList[topicIndex + 1]

  if (!subject || !topic) return <Navigate to={`/subjects/${subjectId}`} replace />

  const isCompleted = (currentUser?.completedTopics || []).includes(topicId)
  const test = Object.values(TESTS).find((t) => t.topicId === topicId)

  const markComplete = () => {
    completeTopicDemo(topicId)
    toast.success('Mavzu tugatildi!')
  }

  const videoId = topic.videoUrl?.includes('watch?v=')
    ? topic.videoUrl.split('watch?v=')[1]
    : null

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Link to="/subjects" className="text-sm text-gray-400 hover:text-gray-600">{t('subjects.title')}</Link>
        <ChevronRight size={14} className="text-gray-400" />
        <Link to={`/subjects/${subjectId}`} className="text-sm text-gray-400 hover:text-gray-600">
          {subject.name[lang] || subject.name.uz}
        </Link>
        <ChevronRight size={14} className="text-gray-400" />
        <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
          {topic.title[lang] || topic.title.uz}
        </span>
      </div>

      <div className="card overflow-hidden mb-5">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-primary-200 text-xs mb-0.5">
              {topicIndex + 1}/{topicsList.length} mavzu
            </p>
            <h1 className="text-lg font-bold text-white">
              {topic.title[lang] || topic.title.uz}
            </h1>
          </div>
          {isCompleted ? (
            <div className="flex items-center gap-1.5 bg-green-500 text-white px-3 py-1.5 rounded-full text-sm font-medium">
              <CheckCircle size={14} />
              Tugatildi
            </div>
          ) : (
            <button onClick={markComplete} className="bg-white text-primary-700 hover:bg-primary-50 px-3 py-1.5 rounded-full text-sm font-medium transition-colors">
              Tugatildi deb belgilash
            </button>
          )}
        </div>

        <div className="p-6">
          {videoId && (
            <div className="mb-6 rounded-xl overflow-hidden bg-black aspect-video">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${videoId}`}
                title={topic.title[lang] || topic.title.uz}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          <div
            className="prose prose-gray dark:prose-invert max-w-none prose-headings:font-bold prose-h2:text-xl prose-h3:text-base prose-li:text-sm"
            dangerouslySetInnerHTML={{ __html: topic.content[lang] || topic.content.uz }}
            style={{
              lineHeight: '1.7',
              color: 'inherit',
            }}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        {test && (
          <Link
            to={`/tests/${test.id}`}
            className="btn-primary"
          >
            <FileText size={16} />
            {t('tests.start')}
          </Link>
        )}
        {topic.videoUrl && !videoId && (
          <a
            href={topic.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            <Video size={16} />
            Video ko'rish
            <ExternalLink size={14} />
          </a>
        )}
      </div>

      <div className="flex items-center justify-between">
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
        {nextTopic ? (
          <Link
            to={`/subjects/${subjectId}/topics/${nextTopic.id}`}
            className="btn-primary"
          >
            Keyingi mavzu
            <ChevronRight size={16} />
          </Link>
        ) : (
          <Link to={`/subjects/${subjectId}`} className="btn-primary">
            <BookOpen size={16} />
            Barchasi ko'rish
          </Link>
        )}
      </div>
    </div>
  )
}
