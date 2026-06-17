import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Navigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { Clock, ChevronLeft, ChevronRight, Send, AlertCircle } from 'lucide-react'
import { TESTS } from '../../data/mockData'
import clsx from 'clsx'
import toast from 'react-hot-toast'

export default function TestTaker() {
  const { testId } = useParams()
  const { t, i18n } = useTranslation()
  const { saveTestResult } = useAuth()
  const navigate = useNavigate()
  const lang = i18n.language?.slice(0, 2) || 'uz'

  // Safe getter: returns the options array for current lang, falling back to 'uz'
  const getOptions = (q) => {
    const opts = q?.options
    if (!opts) return []
    return (Array.isArray(opts) ? opts : (opts[lang] || opts.uz || opts.ru || opts.en || []))
  }

  const test = TESTS[testId] || Object.values(TESTS).find((t) => t.id === testId)
  const [started, setStarted] = useState(false)
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(null)   // null = timer not yet initialized
  const [submitted, setSubmitted] = useState(false)

  // Set the timer once when test starts
  useEffect(() => {
    if (!started || submitted) return
    setTimeLeft(test.timeLimit * 60)
  }, [started])

  // Countdown ticker — only runs when timeLeft is a real number > 0
  useEffect(() => {
    if (!started || submitted || timeLeft === null) return
    if (timeLeft <= 0) {
      handleSubmit()
      return
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearInterval(timer)
  }, [started, submitted, timeLeft])


  if (!test) return <Navigate to="/tests" replace />

  const questions = test.questions || []
  const q = questions[current]

  const formatTime = (secs) => {
    if (secs === null) return '--:--'
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const selectOption = (qId, optIdx, isMultiple) => {
    if (isMultiple) {
      const prev = answers[qId] || []
      const next = prev.includes(optIdx) ? prev.filter((x) => x !== optIdx) : [...prev, optIdx]
      setAnswers({ ...answers, [qId]: next })
    } else {
      setAnswers({ ...answers, [qId]: [optIdx] })
    }
  }

  const handleSubmit = useCallback(() => {
    if (submitted) return
    setSubmitted(true)
    let correct = 0
    questions.forEach((q) => {
      const ans = answers[q.id] || []
      const correct_ans = q.correctAnswers || []
      if (
        ans.length === correct_ans.length &&
        ans.every((a) => correct_ans.includes(a))
      ) correct++
    })
    const score = Math.round((correct / questions.length) * 100)
    const passed = score >= test.passingScore
    const result = {
      testId: test.id,
      score,
      maxScore: 100,
      correct,
      total: questions.length,
      answers,
      date: new Date().toISOString().split('T')[0],
      passed,
    }
    saveTestResult(result)
    navigate(`/tests/${testId}/results`, { state: { result, test } })
  }, [submitted, answers, questions, test, testId, navigate, saveTestResult])

  if (!started) {
    return (
      <div className="max-w-xl mx-auto">
        <Link to="/tests" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ChevronLeft size={16} /> {t('tests.title')}
        </Link>
        <div className="card p-8 text-center">
          <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={28} className="text-primary-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {test.title[lang] || test.title.uz}
          </h1>
          <div className="flex justify-center gap-6 my-6 text-sm text-gray-600 dark:text-gray-400">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{questions.length}</p>
              <p>{t('tests.questions')}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{test.timeLimit}</p>
              <p>{t('tests.minutes')}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{test.passingScore}%</p>
              <p>{t('tests.passingScore')}</p>
            </div>
          </div>
          <ul className="text-sm text-gray-500 text-left space-y-1.5 mb-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
            <li>• Testda {questions.length} ta savol mavjud</li>
            <li>• Vaqt chegarasi: {test.timeLimit} daqiqa</li>
            <li>• O'tish uchun minimal ball: {test.passingScore}%</li>
            <li>• Vaqt tugaganda javoblar avtomatik yuboriladi</li>
          </ul>
          <button onClick={() => setStarted(true)} className="btn-primary w-full justify-center py-3">
            {t('tests.start')}
          </button>
        </div>
      </div>
    )
  }

  const progress = ((current + 1) / questions.length) * 100
  const isMultiple = q.type === 'multiple'
  const selectedForQ = answers[q.id] || []
  const timerWarning = timeLeft < 60

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card mb-4 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{t('tests.question')} {current + 1}/{questions.length}</span>
          <div className="w-32 bg-gray-100 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-primary-500 rounded-full h-2 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className={clsx('flex items-center gap-1.5 font-mono font-semibold text-sm px-3 py-1.5 rounded-lg', timerWarning ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300')}>
          <Clock size={15} />
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="card p-6 mb-4">
        {isMultiple && (
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-3 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg inline-block">
            Bir nechta to'g'ri javobni tanlang
          </p>
        )}
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-5 leading-relaxed">
          {q.question[lang] || q.question.uz}
        </h2>

        <div className="space-y-3">
          {getOptions(q).map((option, idx) => {
            const isSelected = selectedForQ.includes(idx)
            return (
              <button
                key={idx}
                onClick={() => selectOption(q.id, idx, isMultiple)}
                className={clsx(
                  'w-full text-left px-4 py-3 rounded-xl border-2 text-sm transition-all',
                  isSelected
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                )}
              >
                <span className={clsx('inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mr-3 flex-shrink-0', isSelected ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500')}>
                  {String.fromCharCode(65 + idx)}
                </span>
                {option}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={current === 0}
          className="btn-secondary disabled:opacity-40"
        >
          <ChevronLeft size={16} /> {t('tests.prev')}
        </button>
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={clsx('w-7 h-7 rounded text-xs font-medium transition-colors', i === current ? 'bg-primary-600 text-white' : answers[questions[i].id] ? 'bg-green-100 dark:bg-green-900/30 text-green-700' : 'bg-gray-100 dark:bg-gray-700 text-gray-500')}
            >
              {i + 1}
            </button>
          ))}
        </div>
        {current < questions.length - 1 ? (
          <button onClick={() => setCurrent((c) => c + 1)} className="btn-primary">
            {t('tests.next')} <ChevronRight size={16} />
          </button>
        ) : (
          <button onClick={handleSubmit} className="btn-primary bg-green-600 hover:bg-green-700">
            <Send size={16} /> {t('tests.submit')}
          </button>
        )}
      </div>
    </div>
  )
}
