import { useLocation, Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CheckCircle, XCircle, Trophy, RotateCcw, BookOpen, Star } from 'lucide-react'
import { TESTS } from '../../data/mockData'
import clsx from 'clsx'

export default function TestResults() {
  const { testId } = useParams()
  const { t, i18n } = useTranslation()
  const { state } = useLocation()
  const lang = i18n.language?.slice(0, 2) || 'uz'

  const getOptions = (q) => {
    const opts = q?.options
    if (!opts) return []
    return (Array.isArray(opts) ? opts : (opts[lang] || opts.uz || opts.ru || opts.en || []))
  }

  const result = state?.result
  const test = state?.test || TESTS[testId] || Object.values(TESTS).find((t) => t.id === testId)

  if (!result || !test) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 mb-4">Natija topilmadi</p>
        <Link to="/tests" className="btn-primary">Testlarga qaytish</Link>
      </div>
    )
  }

  const questions = test.questions || []
  const earnedOchko = (result.correct || 0) * 10
  const maxOchko = questions.length * 10

  return (
    <div className="max-w-2xl mx-auto">
      <div className={clsx('card p-8 mb-6 text-center', result.passed ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800')}>
        <div className={clsx('w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4', result.passed ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30')}>
          {result.passed ? (
            <Trophy size={36} className="text-green-600" />
          ) : (
            <XCircle size={36} className="text-red-500" />
          )}
        </div>

        <h1 className={clsx('text-2xl font-bold mb-1', result.passed ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400')}>
          {result.passed ? t('tests.passed') : t('tests.failed')}
        </h1>

        <div className="text-5xl font-extrabold text-gray-900 dark:text-white my-4">
          {result.score}%
        </div>

        {/* Ochko badge */}
        <div className="inline-flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-full px-5 py-2 mb-6">
          <Star size={18} className="text-yellow-500" fill="currentColor" />
          <span className="font-bold text-yellow-700 dark:text-yellow-400 text-lg">
            +{earnedOchko} ochko
          </span>
          <span className="text-yellow-500 text-sm">/ {maxOchko}</span>
        </div>

        <div className="flex justify-center gap-8 text-sm text-gray-600 dark:text-gray-400 mb-6">
          <div className="text-center">
            <p className="font-bold text-green-600 text-lg">{result.correct}</p>
            <p>{t('tests.correctAnswers')}</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-red-500 text-lg">{result.total - result.correct}</p>
            <p>{t('tests.wrongAnswers')}</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-gray-900 dark:text-white text-lg">{test.passingScore}%</p>
            <p>{t('tests.passingScore')}</p>
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <Link to={`/tests/${testId}`} className="btn-secondary">
            <RotateCcw size={16} />
            {t('tests.retake')}
          </Link>
          <Link to="/tests" className="btn-primary">
            <BookOpen size={16} />
            Boshqa testlar
          </Link>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Javoblar sharhi</h2>
        <div className="space-y-4">
          {questions.map((q, idx) => {
            const userAnswers = result.answers?.[q.id] || []
            const correct = q.correctAnswers || []
            const isCorrect =
              userAnswers.length === correct.length &&
              userAnswers.every((a) => correct.includes(a))
            const options = getOptions(q)

            return (
              <div key={q.id} className={clsx('p-4 rounded-xl border', isCorrect ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10' : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10')}>
                <div className="flex items-start gap-2 mb-3">
                  {isCorrect ? (
                    <CheckCircle size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {idx + 1}. {q.question[lang] || q.question.uz}
                    </p>
                    {isCorrect && (
                      <span className="flex items-center gap-0.5 text-xs font-bold text-yellow-600 dark:text-yellow-400 flex-shrink-0">
                        <Star size={11} fill="currentColor" />+10
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-1.5 ml-6">
                  {options.map((opt, i) => {
                    const userChose = userAnswers.includes(i)
                    const isCorrectOpt = correct.includes(i)
                    return (
                      <div
                        key={i}
                        className={clsx(
                          'text-xs px-3 py-1.5 rounded-lg flex items-center gap-2',
                          isCorrectOpt
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium'
                            : userChose
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-600 line-through'
                            : 'text-gray-500'
                        )}
                      >
                        <span className="font-bold">{String.fromCharCode(65 + i)}.</span>
                        {opt}
                        {isCorrectOpt && <CheckCircle size={12} className="ml-auto flex-shrink-0" />}
                        {userChose && !isCorrectOpt && <XCircle size={12} className="ml-auto flex-shrink-0" />}
                      </div>
                    )
                  })}
                </div>
                {q.explanation && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 ml-6 italic">
                    💡 {q.explanation[lang] || q.explanation.uz}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
