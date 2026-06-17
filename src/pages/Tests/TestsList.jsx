import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { FileText, Clock, CheckCircle, XCircle, ChevronRight, BarChart2, Star } from 'lucide-react'
import { TESTS, SUBJECTS, TOPICS } from '../../data/mockData'
import clsx from 'clsx'

export default function TestsList() {
  const { t, i18n } = useTranslation()
  const { currentUser } = useAuth()
  const lang = i18n.language?.slice(0, 2) || 'uz'

  const testResults = currentUser?.testResults || []
  const allTests = Object.values(TESTS)

  const getResult = (testId) => testResults.find((r) => r.testId === testId)
  const getSubjectName = (subjectId) => SUBJECTS.find((s) => s.id === subjectId)?.name[lang] || subjectId
  const getTopicName = (topicId) => {
    for (const list of Object.values(TOPICS)) {
      const tp = list.find((t) => t.id === topicId)
      if (tp) return tp.title[lang] || tp.title.uz
    }
    return topicId
  }

  // Max possible ochko for a test = questions.length * 10
  const getMaxOchko = (test) => test.questions.length * 10

  const subjectColors = {
    kartografiya: 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800',
    topografiya: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800',
    gis: 'bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800',
  }
  const subjectText = {
    kartografiya: 'text-blue-700 dark:text-blue-400',
    topografiya: 'text-emerald-700 dark:text-emerald-400',
    gis: 'text-orange-700 dark:text-orange-400',
  }

  const totalEarned = testResults.reduce((sum, r) => sum + (r.correct || 0) * 10, 0)
  const totalPossible = allTests.reduce((sum, t) => sum + getMaxOchko(t), 0)
  const passedCount = testResults.filter((r) => r.passed).length

  return (
    <div>
      <div className="mb-6">
        <h1 className="section-title">{t('tests.title')}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Barcha mavjud testlar
        </p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card p-4 text-center">
          <p className="text-2xl font-extrabold text-primary-600 dark:text-primary-400">
            {testResults.length}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Topshirilgan</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-extrabold text-green-600">
            {passedCount}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">O'tilgan</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-extrabold text-yellow-500 flex items-center justify-center gap-1">
            <Star size={18} fill="currentColor" />
            {currentUser?.totalScore || 0}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Umumiy ochko</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {allTests.map((test) => {
          const result = getResult(test.id)
          const subjectId = test.subjectId
          const earnedOchko = result ? (result.correct || 0) * 10 : 0
          const maxOchko = getMaxOchko(test)

          return (
            <div key={test.id} className={`card border p-5 ${subjectColors[subjectId]}`}>
              <div className="flex items-start justify-between mb-3">
                <div className={`badge text-xs ${subjectText[subjectId]} bg-transparent border border-current px-2 py-0.5`}>
                  {getSubjectName(subjectId)}
                </div>
                {result && (
                  <div className={clsx('flex items-center gap-1 text-xs font-medium', result.passed ? 'text-green-600' : 'text-red-500')}>
                    {result.passed ? <CheckCircle size={13} /> : <XCircle size={13} />}
                    {result.score}%
                  </div>
                )}
              </div>

              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1 leading-snug">
                {test.title[lang] || test.title.uz}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                {getTopicName(test.topicId)}
              </p>

              <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                <span className="flex items-center gap-1">
                  <FileText size={12} />
                  {test.questions.length} savol
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {test.timeLimit} min
                </span>
                <span className="flex items-center gap-1">
                  <BarChart2 size={12} />
                  {test.passingScore}%
                </span>
              </div>

              {/* Ochko section */}
              <div className="flex items-center justify-between mb-4 bg-white/60 dark:bg-gray-800/40 rounded-lg px-3 py-2">
                <span className="text-xs text-gray-500">Ochko:</span>
                <span className="flex items-center gap-1 text-sm font-bold text-yellow-600 dark:text-yellow-400">
                  <Star size={13} fill="currentColor" />
                  {result ? `${earnedOchko} / ${maxOchko}` : `0 / ${maxOchko}`}
                </span>
              </div>

              <Link
                to={`/tests/${test.id}`}
                className="flex items-center justify-center gap-2 w-full py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
              >
                {result ? t('tests.retake') : t('tests.start')}
                <ChevronRight size={15} />
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}
