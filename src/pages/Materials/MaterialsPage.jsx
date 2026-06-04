import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Download, FileText, File, Presentation, Table, Archive, Search } from 'lucide-react'
import { MATERIALS, SUBJECTS } from '../../data/mockData'
import toast from 'react-hot-toast'

const typeIcons = {
  PDF: FileText,
  DOCX: File,
  PPTX: Presentation,
  XLSX: Table,
  ZIP: Archive,
}
const typeColors = {
  PDF: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  DOCX: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  PPTX: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  XLSX: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  ZIP: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
}

export default function MaterialsPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = MATERIALS.filter((m) => {
    const matchSubject = filter === 'all' || m.subjectId === filter
    const title = m.title[lang] || m.title.uz
    const matchSearch = title.toLowerCase().includes(search.toLowerCase())
    return matchSubject && matchSearch
  })

  const getSubjectName = (id) => SUBJECTS.find((s) => s.id === id)?.name[lang] || id

  const handleDownload = (material) => {
    toast.success(`"${material.title[lang] || material.title.uz}" yuklab olindi`)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="section-title">{t('materials.title')}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          PDF, DOCX, PPTX va boshqa formatdagi materiallar
        </p>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            className="input pl-9 py-2"
            placeholder={t('common.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {[{ id: 'all', label: t('common.all') }, ...SUBJECTS.map((s) => ({ id: s.id, label: s.name[lang] || s.name.uz }))].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FileText size={40} className="mx-auto mb-3 opacity-40" />
          <p>{t('common.noData')}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map((material) => {
            const TypeIcon = typeIcons[material.type] || FileText
            return (
              <div key={material.id} className="card p-4 flex items-center gap-4 hover:shadow-md transition-all">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${typeColors[material.type] || typeColors.PDF}`}>
                  <TypeIcon size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white text-sm leading-snug mb-1 line-clamp-2">
                    {material.title[lang] || material.title.uz}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>{getSubjectName(material.subjectId)}</span>
                    <span>•</span>
                    <span>{material.size}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Download size={11} /> {material.downloads}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDownload(material)}
                  className="flex-shrink-0 w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400 transition-colors"
                >
                  <Download size={16} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
