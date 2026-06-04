import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { BookOpen, ChevronRight, Edit3, Plus, Map, Mountain, Globe } from 'lucide-react'
import { SUBJECTS, TOPICS } from '../../data/mockData'
import toast from 'react-hot-toast'

const subjectIcons = { kartografiya: Map, topografiya: Mountain, gis: Globe }
const subjectColors = {
  kartografiya: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
  topografiya: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
  gis: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
}

export default function ManageSubjects() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title">{t('admin.manageSubjects')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{SUBJECTS.length} fan</p>
        </div>
        <button onClick={() => toast('Yangi fan qo\'shish (demo)')} className="btn-primary">
          <Plus size={16} />
          {t('admin.addNew')}
        </button>
      </div>

      <div className="space-y-4">
        {SUBJECTS.map((subject) => {
          const Icon = subjectIcons[subject.id]
          const topicsList = TOPICS[subject.id] || []

          return (
            <div key={subject.id} className="card overflow-hidden">
              <div className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${subjectColors[subject.id]}`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {subject.name[lang] || subject.name.uz}
                    </h3>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                      <span>{topicsList.length} mavzu</span>
                      <span>•</span>
                      <span>{subject.videosCount} video</span>
                      <span>•</span>
                      <span>{subject.testsCount} test</span>
                      <span>•</span>
                      <span>{subject.studentsCount} talaba</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toast('Fanlarni tahrirlash (demo)')}
                    className="btn-secondary text-sm py-1.5 px-3"
                  >
                    <Edit3 size={14} />
                    {t('admin.edit')}
                  </button>
                  <Link to={`/subjects/${subject.id}`} className="btn-secondary text-sm py-1.5 px-3">
                    Ko'rish
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-700 px-5 py-3 bg-gray-50 dark:bg-gray-800/30">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Mavzular:</p>
                  <button
                    onClick={() => toast('Mavzu qo\'shish (demo)')}
                    className="text-xs text-primary-600 flex items-center gap-1 hover:underline"
                  >
                    <Plus size={12} /> Mavzu qo'shish
                  </button>
                </div>
                <div className="mt-2 space-y-1">
                  {topicsList.slice(0, 3).map((topic, i) => (
                    <div key={topic.id} className="flex items-center justify-between py-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {i + 1}. {topic.title[lang] || topic.title.uz}
                      </span>
                      <button
                        onClick={() => toast('Mavzuni tahrirlash (demo)')}
                        className="text-xs text-gray-400 hover:text-primary-600 p-1"
                      >
                        <Edit3 size={12} />
                      </button>
                    </div>
                  ))}
                  {topicsList.length > 3 && (
                    <Link
                      to={`/subjects/${subject.id}`}
                      className="text-xs text-primary-600 flex items-center gap-1 pt-1"
                    >
                      +{topicsList.length - 3} ta mavzu ko'rish <ChevronRight size={12} />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
