import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Video, Eye, Clock, ExternalLink, Map, Mountain, Globe } from 'lucide-react'
import { VIDEOS, SUBJECTS } from '../../data/mockData'

const subjectColors = {
  kartografiya: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  topografiya: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  gis: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
}

export default function VideosPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)

  const filtered = filter === 'all' ? VIDEOS : VIDEOS.filter((v) => v.subjectId === filter)
  const subjectName = (id) => SUBJECTS.find((s) => s.id === id)?.name[lang] || id

  return (
    <div>
      <div className="mb-6">
        <h1 className="section-title">{t('videos.title')}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Barcha video darslar
        </p>
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
              title={selected.title[lang] || selected.title.uz}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="p-4 flex items-start justify-between">
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">{selected.title[lang] || selected.title.uz}</h2>
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                <span className="flex items-center gap-1"><Eye size={14} />{selected.views}</span>
                <span className="flex items-center gap-1"><Clock size={14} />{selected.duration}</span>
                <span className={`badge ${subjectColors[selected.subjectId]}`}>{subjectName(selected.subjectId)}</span>
              </div>
            </div>
            <button onClick={() => setSelected(null)} className="text-sm text-gray-400 hover:text-gray-600 ml-4">
              Yopish ✕
            </button>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((video) => (
          <div
            key={video.id}
            className="card overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => setSelected(video)}
          >
            <div className="relative aspect-video bg-gray-900 overflow-hidden">
              <img
                src={video.thumbnail}
                alt={video.title[lang] || video.title.uz}
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
                {video.title[lang] || video.title.uz}
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
        ))}
      </div>
    </div>
  )
}
