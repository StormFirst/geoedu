import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FileText, Edit3, Trash2, Plus, Clock, BarChart2 } from 'lucide-react'
import { TESTS, SUBJECTS } from '../../data/mockData'
import toast from 'react-hot-toast'
import clsx from 'clsx'

export default function ManageTests() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const [tests, setTests] = useState(Object.values(TESTS))
  const [filter, setFilter] = useState('all')

  const getSubjectName = (id) => SUBJECTS.find((s) => s.id === id)?.name[lang] || id

  const filtered = filter === 'all' ? tests : tests.filter((t) => t.subjectId === filter)

  const deleteTest = (id) => {
    setTests((prev) => prev.filter((t) => t.id !== id))
    toast.success("Test o'chirildi")
  }

  const subjectColors = {
    kartografiya: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    topografiya: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    gis: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title">{t('admin.manageTests')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{tests.length} ta test</p>
        </div>
        <button onClick={() => toast('Yangi test yaratish (demo)')} className="btn-primary">
          <Plus size={16} />
          {t('admin.addNew')}
        </button>
      </div>

      <div className="flex gap-2 flex-wrap mb-5">
        {[{ id: 'all', label: t('common.all') }, ...SUBJECTS.map((s) => ({ id: s.id, label: s.name[lang] || s.name.uz }))].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={clsx('px-4 py-1.5 rounded-full text-sm font-medium transition-colors', filter === f.id ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400')}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((test) => (
          <div key={test.id} className="card p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
              <FileText size={18} className="text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                {test.title[lang] || test.title.uz}
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-1">
                <span className={clsx('badge text-xs', subjectColors[test.subjectId])}>
                  {getSubjectName(test.subjectId)}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <FileText size={12} /> {test.questions.length} savol
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock size={12} /> {test.timeLimit} daq
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <BarChart2 size={12} /> {test.passingScore}%
                </span>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => toast('Testni tahrirlash (demo)')}
                className="p-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 text-gray-400 hover:text-primary-600"
              >
                <Edit3 size={16} />
              </button>
              <button
                onClick={() => deleteTest(test.id)}
                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <FileText size={32} className="mx-auto mb-2 opacity-40" />
            <p>{t('common.noData')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
