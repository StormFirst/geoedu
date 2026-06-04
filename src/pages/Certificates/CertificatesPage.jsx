import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { Award, Download, Lock, CheckCircle, Map, Mountain, Globe } from 'lucide-react'
import { SUBJECTS, TOPICS, TESTS } from '../../data/mockData'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const subjectIcons = { kartografiya: Map, topografiya: Mountain, gis: Globe }
const subjectGradients = {
  kartografiya: 'from-blue-500 to-blue-700',
  topografiya: 'from-emerald-500 to-emerald-700',
  gis: 'from-orange-500 to-orange-700',
}

export default function CertificatesPage() {
  const { t, i18n } = useTranslation()
  const { currentUser } = useAuth()
  const lang = i18n.language

  const completedTopics = currentUser?.completedTopics || []
  const testResults = currentUser?.testResults || []

  const certStatus = SUBJECTS.map((subject) => {
    const subjectTopics = TOPICS[subject.id] || []
    const doneCount = subjectTopics.filter((tp) => completedTopics.includes(tp.id)).length
    const totalCount = subjectTopics.length
    const pct = Math.round((doneCount / totalCount) * 100)

    const subjectTests = testResults.filter((r) => {
      const testId = r.testId
      return Object.values(TESTS).find(
        (t) => t.id === testId && t.subjectId === subject.id
      )
    })
    const avgScore = subjectTests.length
      ? Math.round(subjectTests.reduce((s, r) => s + r.score, 0) / subjectTests.length)
      : 0

    const earned = pct === 100 && avgScore >= 70
    return { subject, pct, avgScore, earned, doneCount, totalCount }
  })

  const handleDownload = (subjectName) => {
    toast.success(`${subjectName} sertifikati yuklab olindi!`)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="section-title">{t('certificates.title')}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {t('certificates.earnInfo')}
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-6">
        {certStatus.map(({ subject, pct, avgScore, earned, doneCount, totalCount }) => {
          const Icon = subjectIcons[subject.id]
          return (
            <div
              key={subject.id}
              className={`card overflow-hidden ${earned ? 'border-yellow-300 dark:border-yellow-700' : ''}`}
            >
              <div className={`bg-gradient-to-br ${subjectGradients[subject.id]} p-6 relative`}>
                {earned && (
                  <div className="absolute top-3 right-3 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                    <Award size={16} className="text-yellow-900" />
                  </div>
                )}
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-3">
                  <Icon size={28} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  {subject.name[lang] || subject.name.uz}
                </h3>
                <p className="text-white/80 text-sm mt-1">Kurs sertifikati</p>
              </div>

              <div className="p-5">
                <div className="space-y-3 mb-4">
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Mavzular</span>
                      <span>{doneCount}/{totalCount}</span>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`bg-gradient-to-r ${subjectGradients[subject.id]} rounded-full h-2 transition-all`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">O'rtacha ball:</span>
                    <span className={`font-semibold ${avgScore >= 70 ? 'text-green-600' : 'text-orange-500'}`}>
                      {avgScore}% {avgScore >= 70 ? '✓' : ''}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Holat:</span>
                    {earned ? (
                      <span className="flex items-center gap-1 text-green-600 font-medium text-xs">
                        <CheckCircle size={13} /> Tayyor
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-gray-400 text-xs">
                        <Lock size={13} /> Yakunlanmagan
                      </span>
                    )}
                  </div>
                </div>

                {earned ? (
                  <button
                    onClick={() => handleDownload(subject.name[lang] || subject.name.uz)}
                    className="btn-primary w-full justify-center"
                  >
                    <Download size={16} />
                    {t('certificates.download')}
                  </button>
                ) : (
                  <Link
                    to={`/subjects/${subject.id}`}
                    className="btn-secondary w-full justify-center text-sm"
                  >
                    Davom etish
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-8 card p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center flex-shrink-0">
            <Award size={24} className="text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              Sertifikat olish shartlari
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Fanning barcha mavzularini tugatish (100%)</li>
              <li>• Test natijalari o'rtacha 70% dan yuqori bo'lishi</li>
              <li>• Amaliy topshiriqlarni topshirish</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
