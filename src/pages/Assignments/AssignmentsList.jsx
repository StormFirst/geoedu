import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ClipboardList, Calendar, Upload, CheckCircle } from 'lucide-react'
import { ASSIGNMENTS, SUBJECTS } from '../../data/mockData'
import toast from 'react-hot-toast'

export default function AssignmentsList() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const [submitted, setSubmitted] = useState({})

  const getSubjectName = (id) => SUBJECTS.find((s) => s.id === id)?.name[lang] || id

  const handleSubmit = (id) => {
    setSubmitted((prev) => ({ ...prev, [id]: true }))
    toast.success('Topshiriq muvaffaqiyatli yuborildi!')
  }

  const subjectColors = {
    kartografiya: 'border-blue-200 dark:border-blue-800',
    topografiya: 'border-emerald-200 dark:border-emerald-800',
    gis: 'border-orange-200 dark:border-orange-800',
  }
  const subjectBadge = {
    kartografiya: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    topografiya: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    gis: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="section-title">{t('assignments.title')}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Amaliy topshiriqlar va vazifalar
        </p>
      </div>

      <div className="space-y-4">
        {ASSIGNMENTS.map((assignment) => {
          const isDone = submitted[assignment.id]
          return (
            <div key={assignment.id} className={`card border p-6 ${subjectColors[assignment.subjectId]}`}>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ClipboardList size={20} className="text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {assignment.title[lang] || assignment.title.uz}
                    </h3>
                    <span className={`badge text-xs mt-1 ${subjectBadge[assignment.subjectId]}`}>
                      {getSubjectName(assignment.subjectId)}
                    </span>
                  </div>
                </div>
                {isDone ? (
                  <div className="flex items-center gap-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium px-3 py-1.5 rounded-full flex-shrink-0">
                    <CheckCircle size={13} />
                    {t('assignments.submitted')}
                  </div>
                ) : (
                  <span className="badge bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs flex-shrink-0">
                    {t('assignments.pending')}
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                {assignment.description[lang] || assignment.description.uz}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar size={13} />
                    {t('assignments.dueDate')}: {assignment.dueDate}
                  </span>
                  <span>{t('assignments.maxScore')}: {assignment.maxScore}</span>
                </div>

                {!isDone && (
                  <button
                    onClick={() => handleSubmit(assignment.id)}
                    className="btn-primary text-sm py-2"
                  >
                    <Upload size={15} />
                    {t('assignments.submit')}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
