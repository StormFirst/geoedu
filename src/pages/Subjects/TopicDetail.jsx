import { useState, useEffect } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import {
  ArrowLeft, CheckCircle, Video, FileText, ChevronLeft, ChevronRight,
  BookOpen, PresentationIcon, Wrench, FlaskConical, Lock,
  PlayCircle, Presentation, Sparkles, Copy, Key, RefreshCw
} from 'lucide-react'
import { SUBJECTS, TOPICS, TESTS } from '../../data/mockData'
import { PRESENTATIONS } from '../../data/presentationsData'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import { ref, getDownloadURL } from 'firebase/storage'
import { storage, isDemoMode } from '../../firebase/config'
import InteractivePracticalTask from './components/InteractivePracticalTask'

const TABS = [
  { id: 'nazariy',    label: 'Nazariy',      icon: BookOpen },
  { id: 'video',      label: 'Video darslik', icon: PlayCircle },
  { id: 'taqdimot',  label: 'Taqdimot',      icon: Presentation },
  { id: 'amaliy',    label: 'Amaliy',        icon: FlaskConical },
  { id: 'ai_tahlil',  label: 'AI Tahlil',     icon: Sparkles },
  { id: 'test',      label: 'Test',          icon: FileText },
]

export default function TopicDetail() {
  const { subjectId, topicId } = useParams()
  const { t, i18n } = useTranslation()
  const { currentUser, completeTopicDemo } = useAuth()
  const lang = i18n.language?.slice(0, 2) || 'uz'

  const subject = SUBJECTS.find((s) => s.id === subjectId)
  const topicsList = TOPICS[subjectId] || []
  const topic = topicsList.find((tp) => tp.id === topicId)
  const videoId = topic?.videoUrl?.includes('watch?v=')
    ? topic.videoUrl.split('watch?v=')[1]
    : null

  const [activeTab, setActiveTab] = useState('nazariy')
  const [selectedPresentationUrl, setSelectedPresentationUrl] = useState(null)

  const [storageContent, setStorageContent] = useState(null)
  const [isLoadingContent, setIsLoadingContent] = useState(false)

  // Fetch topic content from Firebase Storage (optimized with Stale-While-Revalidate caching)
  useEffect(() => {
    if (isDemoMode || !storage) {
      setStorageContent(null)
      setIsLoadingContent(false)
      return
    }

    const cacheKey = `cache_topic_content_${topicId}`
    const cached = localStorage.getItem(cacheKey)

    if (cached) {
      setStorageContent(cached)
      setIsLoadingContent(false)
    } else {
      setStorageContent(null)
      setIsLoadingContent(true)
    }

    const fetchContent = async () => {
      try {
        const storageRef = ref(storage, `topics/${topicId}.html`)
        const url = await getDownloadURL(storageRef)
        const res = await fetch(url)
        if (!res.ok) throw new Error('Failed to fetch file from download URL')
        const htmlText = await res.text()

        // Update cache and state if different or not cached
        if (htmlText !== cached) {
          localStorage.setItem(cacheKey, htmlText)
          setStorageContent(htmlText)
        }
      } catch (err) {
        console.warn('Storage content background sync failed:', err)
      } finally {
        setIsLoadingContent(false)
      }
    }

    fetchContent()
  }, [topicId])

  const [theoryCompleted, setTheoryCompleted] = useState(() => {
    return localStorage.getItem(`completed_theory_${topicId}`) === 'true'
  })
  const [videoCompleted, setVideoCompleted] = useState(() => {
    return localStorage.getItem(`completed_video_${topicId}`) === 'true'
  })
  const [presentationCompleted, setPresentationCompleted] = useState(() => {
    return localStorage.getItem(`completed_presentation_${topicId}`) === 'true'
  })
  const [practicalCompleted, setPracticalCompleted] = useState(() => {
    return localStorage.getItem(`completed_practical_${topicId}`) === 'true'
  })

  // Save completion states to localStorage
  useEffect(() => {
    localStorage.setItem(`completed_theory_${topicId}`, theoryCompleted)
  }, [theoryCompleted, topicId])

  useEffect(() => {
    localStorage.setItem(`completed_video_${topicId}`, videoCompleted)
  }, [videoCompleted, topicId])

  useEffect(() => {
    localStorage.setItem(`completed_presentation_${topicId}`, presentationCompleted)
  }, [presentationCompleted, topicId])

  useEffect(() => {
    localStorage.setItem(`completed_practical_${topicId}`, practicalCompleted)
  }, [practicalCompleted, topicId])

  // Reset/sync states when topicId changes
  useEffect(() => {
    setTheoryCompleted(localStorage.getItem(`completed_theory_${topicId}`) === 'true')
    setVideoCompleted(localStorage.getItem(`completed_video_${topicId}`) === 'true')
    setPresentationCompleted(localStorage.getItem(`completed_presentation_${topicId}`) === 'true')
    setPracticalCompleted(localStorage.getItem(`completed_practical_${topicId}`) === 'true')
  }, [topicId])

  const isTabLocked = (tabId) => {
    return false // TEMPORARILY UNLOCKED FOR TESTING
    if (tabId === 'nazariy') return false
    if (tabId === 'taqdimot') return videoId ? !videoCompleted : false
    if (tabId === 'amaliy') {
      const hasPres = PRESENTATIONS[topicId] && PRESENTATIONS[topicId].length > 0
      return hasPres ? !presentationCompleted : false
    }
    if (tabId === 'ai_tahlil') return false
    if (tabId === 'test') {
      const hasPractical = topic ? topic.hasPractical : true
      return hasPractical ? !practicalCompleted : false
    }
    return false
  }

  const handleTabClick = (tabId) => {
    if (isTabLocked(tabId)) {
      if (tabId === 'video') {
        toast.error(
          lang === 'uz' 
            ? "Video darslikni ochish uchun avval nazariy qismni oxirigacha o'qib chiqing (eng pastiga scroll qiling)!" 
            : "To open the video lesson, read the theoretical part to the very bottom first!"
        )
      } else if (tabId === 'taqdimot') {
        toast.error(
          lang === 'uz' 
            ? "Taqdimotni ochish uchun avval video darslikni to'liq ko'rib chiqing!" 
            : "To open the presentation, watch the video lesson first!"
        )
      } else if (tabId === 'amaliy') {
        toast.error(
          lang === 'uz' 
            ? "Amaliy topshiriqni ochish uchun avval taqdimotni ko'rish (Slaydni ko'rish) tugmasini bosing!" 
            : "To open the practical task, click the View Slides button on the presentation first!"
        )
      } else if (tabId === 'test') {
        toast.error(
          lang === 'uz' 
            ? "Testni ochish uchun avval amaliy topshiriqni yakunlang!" 
            : "To open the test, complete the practical task first!"
        )
      }
      return
    }
    setActiveTab(tabId)
  }

  // Scroll to bottom of theory detection
  useEffect(() => {
    if (activeTab !== 'nazariy' || isLoadingContent || theoryCompleted) return

    const timer = setTimeout(() => {
      const marker = document.getElementById('theory-bottom-marker')
      if (!marker) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTheoryCompleted(true)
            toast.success(
              lang === 'uz' 
                ? "Nazariy material o'rganildi! Video darslik bo'limi ochildi." 
                : "Theory material studied! Video lesson tab unlocked."
            )
          }
        },
        { threshold: 0.1 }
      )

      observer.observe(marker)
      return () => observer.disconnect()
    }, 500)

    return () => clearTimeout(timer)
  }, [activeTab, isLoadingContent, topicId, theoryCompleted])

  // YouTube API listener for video ended detection
  useEffect(() => {
    if (activeTab !== 'video' || !videoId || videoCompleted) return

    let player
    let interval

    const createPlayer = () => {
      if (window.YT && window.YT.Player) {
        player = new window.YT.Player('youtube-player', {
          events: {
            'onStateChange': (event) => {
              if (event.data === 0) {
                setVideoCompleted(true)
                toast.success(
                  lang === 'uz' 
                    ? "Video darslik yakunlandi! Taqdimot bo'limi ochildi." 
                    : "Video lesson completed! Presentation tab unlocked."
                )
              }
            }
          }
        })
        clearInterval(interval)
      }
    }

    if (window.YT && window.YT.Player) {
      createPlayer()
    } else {
      if (!document.getElementById('youtube-iframe-api-script')) {
        const tag = document.createElement('script')
        tag.id = 'youtube-iframe-api-script'
        tag.src = 'https://www.youtube.com/iframe_api'
        const firstScriptTag = document.getElementsByTagName('script')[0]
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
      }
      interval = setInterval(createPlayer, 500)
    }

    return () => {
      clearInterval(interval)
      if (player && player.destroy) {
        try {
          player.destroy()
        } catch (e) {
          console.warn('Error destroying YT player:', e)
        }
      }
    }
  }, [activeTab, videoId, videoCompleted, topicId])

  // AI Analysis States
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [aiAnalysisResult, setAiAnalysisResult] = useState('')

  // Reset analysis when topicId changes
  useEffect(() => {
    setAiAnalysisResult('')
    setIsAnalyzing(false)
    setSelectedPresentationUrl(null)
  }, [topicId])


  const generateOfflineAnalysis = (currTopic, currentLang) => {
    const title = currTopic.title[currentLang] || currTopic.title.uz
    const rawHtml = storageContent || currTopic.content?.[currentLang] || currTopic.content?.uz || ''
    
    const doc = new DOMParser().parseFromString(rawHtml, 'text/html')
    const paragraphs = Array.from(doc.querySelectorAll('p')).map(p => p.textContent.trim()).filter(Boolean)
    const listItems = Array.from(doc.querySelectorAll('li')).map(li => li.textContent.trim()).filter(Boolean)
    
    const summary = paragraphs[0] || (currentLang === 'uz' ? "Ushbu mavzu bo'yicha nazariy qism va materiallarni o'rganish tavsiya etiladi." : "It is recommended to study the theoretical parts and materials of this topic.")
    
    let keyTermsMd = ''
    if (listItems.length > 0) {
      keyTermsMd = listItems.map(item => `* ${item}`).join('\n')
    } else {
      keyTermsMd = currentLang === 'uz' 
        ? "* **Tushuncha**: Mavzuda keltirilgan asosiy nazariy elementlar.\n* **Metodologiya**: Mavzudagi tahlil usullari."
        : "* **Concept**: Basic theoretical elements presented in the topic.\n* **Methodology**: Analysis methods within the topic."
    }
    
    if (currentLang === 'uz') {
      return `## 🧠 "${title}" Mavzusi bo'yicha AI Tahlili (Oflayn Namuna)

> [!NOTE]
> Bu oflayn rejimda tayyorlangan tahlil namunasi. OpenAI API kalitini kiritish orqali siz real vaqtda jonli tahlil olishingiz mumkin.

### 📝 Mavzuning qisqacha mazmuni
${summary}

### 🔑 Kalit atamalar va tushunchalar
${keyTermsMd}

### 🚀 Amaliy ahamiyati va qo'llanilishi
Ushbu mavzuning o'rganilishi quyidagi sohalarda amaliy qo'llaniladi:
* **Xaritalash va Fazoviy tahlil**: Joylashuv va geografik munosabatlarni aniqlash.
* **Geodeziya va Loyihalash**: Muhandislik va qurilish hisob-kitoblarida to'g'ri o'lchovlar olib borish.
* **GIS tizimlarida integratsiya**: Turli xil ma'lumotlar qatlamlarini birlashtirish va tahlil qilish.

### 💡 Mavzuni chuqurroq o'rganish uchun tavsiyalar
1. Mavzuning **Nazariy** bo'limidagi matnlarni diqqat bilan o'qib chiqing.
2. Agar mavjud bo'lsa, **Video darslik**ni tomosha qiling, u yerda asboblar va vizual ko'rsatmalar berilgan.
3. Bilimingizni sinash uchun **Test** bo'limidagi savollarga javob bering.`
    } else if (currentLang === 'ru') {
      return `## 🧠 ИИ-Анализ по теме "${title}" (Оффлайн образец)

> [!NOTE]
> Это образец анализа, созданный в оффлайн-режиме. Введя ключ API OpenAI, вы сможете получить живой анализ в реальном времени.

### 📝 Краткое содержание темы
${summary}

### 🔑 Ключевые термины и понятия
${keyTermsMd}

### 🚀 Практическое значение и применение
Иизнучение данной темы имеет важное практическое значение в следующих областях:
* **Картографирование и пространственный анализ**: Определение местоположений и географических взаимосвязей.
* **Геодезия и проектирование**: Проведение точных измерений в инженерных расчетах.
* **Интеграция в ГИС-системах**: Объединение и анализ различных слоев данных.

### 💡 Рекомендации по более глубокому изучению темы
1. Внимательно прочтите текст в разделе **Теория**.
2. Посмотрите **Видеоурок** (при наличии) для визуализации инструментов и процессов.
3. Ответьте на вопросы в разделе **Тест**, чтобы проверить свои знания.`
    } else {
      return `## 🧠 AI Analysis for "${title}" (Offline Sample)

> [!NOTE]
> This is a sample analysis generated offline. By entering an OpenAI API key, you can get a live analysis in real-time.

### 📝 Topic Summary
${summary}

### 🔑 Key Terms and Concepts
${keyTermsMd}

### 🚀 Practical Applications
Studying this topic provides practical value in:
* **Mapping and Spatial Analysis**: Defining locations and geographic relationships.
* **Geodesy and Engineering**: Performing accurate measurements in engineering calculations.
* **GIS Integration**: Combining and analyzing various layers of data.

### 💡 Deeper Learning Tips
1. Carefully read the text in the **Theory** section.
2. Watch the **Video tutorial** (if available) for visualization of tools.
3. Take the **Test** to assess your understanding.`
    }
  }

  const runAiAnalysis = async () => {
    setIsAnalyzing(true)
    setAiAnalysisResult('')
    
    const activeApiKey = import.meta.env.VITE_OPENAI_API_KEY || ''
    
    if (activeApiKey) {
      try {
        const topicHtml = storageContent || topic.content?.[lang] || topic.content?.uz || ''
        const cleanContent = topicHtml.replace(/<[^>]*>/g, '')
        
        const prompt = `You are a professional GIS Academic Assistant.
Please analyze the following topic in detail:
Title: "${topic.title[lang] || topic.title.uz}"
Content: "${cleanContent}"

Provide the analysis structured in these sections:
1. 📝 Mavzuning qisqacha mazmuni (Summary)
2. 🔑 Kalit atamalar va tushunchalar (Key concepts)
3. 🚀 Amaliy ahamiyati va qo'llanilishi (Practical applications)
4. 💡 Mavzuni chuqurroq o'rganish uchun tavsiyalar (Tips for deeper learning)

Language: Answer in ${lang === 'uz' ? 'Uzbek' : lang === 'ru' ? 'Russian' : 'English'}.
Format: Return the output formatted in beautiful, clean markdown with icons. Include bold text and headers.`

        const response = await fetch(
          `https://api.openai.com/v1/chat/completions`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${activeApiKey}`
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [{ role: 'user', content: prompt }]
            }),
          }
        )

        if (!response.ok) {
          throw new Error(`OpenAI API error (Status: ${response.status})`)
        }

        const data = await response.json()
        const reply = data.choices?.[0]?.message?.content
        
        setTimeout(() => {
          setAiAnalysisResult(reply)
          setIsAnalyzing(false)
          toast.success(lang === 'uz' ? 'Tahlil yakunlandi!' : 'Analysis completed!')
        }, 1000)
      } catch (err) {
        toast.error(
          lang === 'uz'
            ? "OpenAI API tahlili amalga oshmadi. Oflayn tahlil yuklanmoqda..."
            : "OpenAI API analysis failed. Loading offline analysis..."
        )
        setTimeout(() => {
          const offlineText = generateOfflineAnalysis(topic, lang)
          setAiAnalysisResult(offlineText)
          setIsAnalyzing(false)
        }, 1200)
      }
    } else {
      setTimeout(() => {
        setIsAnalyzing(false)
        toast.error(lang === 'uz' ? 'OpenAI API kaliti .env faylida topilmadi!' : 'OpenAI API key not found in .env file!')
      }, 1000)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(aiAnalysisResult)
    toast.success(lang === 'uz' ? 'Nusxalandi!' : 'Copied!')
  }

  const getTabLabel = (id) => {
    switch (id) {
      case 'nazariy': return lang === 'uz' ? 'Nazariy' : lang === 'ru' ? 'Теория' : 'Theory'
      case 'video': return lang === 'uz' ? 'Video darslik' : lang === 'ru' ? 'Видеоурок' : 'Video Lesson'
      case 'taqdimot': return lang === 'uz' ? 'Taqdimot' : lang === 'ru' ? 'Презентация' : 'Presentation'
      case 'amaliy': return lang === 'uz' ? 'Amaliy' : lang === 'ru' ? 'Практика' : 'Practice'
      case 'test': return lang === 'uz' ? 'Test' : lang === 'ru' ? 'Тест' : 'Test'
      case 'ai_tahlil': return lang === 'uz' ? 'AI Tahlil' : lang === 'ru' ? 'ИИ-Анализ' : 'AI Analysis'
      default: return ''
    }
  }

  const topicIndex = topicsList.findIndex((tp) => tp.id === topicId)
  const prevTopic = topicsList[topicIndex - 1]
  const nextTopic = topicsList[topicIndex + 1]

  if (!subject || !topic) return <Navigate to={`/subjects/${subjectId}`} replace />

  const testResults = currentUser?.testResults || []
  const completedTopics = currentUser?.completedTopics || []

  // Check if topic is unlocked
  const isTopicUnlocked = (id) => {
    return true // TEMPORARILY UNLOCKED FOR TESTING
    const idx = topicsList.findIndex((t) => t.id === id)
    if (idx <= 0) return true

    const prevTp = topicsList[idx - 1]
    if (!isTopicUnlocked(prevTp.id)) return false

    const prevTest = Object.values(TESTS).find((t) => t.topicId === prevTp.id)
    if (prevTest) {
      return testResults.some((r) => r.testId === prevTest.id && r.passed)
    } else {
      return completedTopics.includes(prevTp.id)
    }
  }

  if (!isTopicUnlocked(topicId)) {
    return <Navigate to={`/subjects/${subjectId}`} replace />
  }

  const isCompleted = completedTopics.includes(topicId)
  const test = Object.values(TESTS).find((t) => t.topicId === topicId)
  const testPassed = test ? testResults.some((r) => r.testId === test.id && r.passed) : false

  const markComplete = () => {
    completeTopicDemo(topicId)
    toast.success('Mavzu tugatildi!')
  }


  const canGoNext = !test ? isCompleted : testPassed

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-4 flex-wrap text-sm">
        <Link to="/subjects" className="text-gray-400 hover:text-gray-600">
          {t('subjects.title')}
        </Link>
        <ChevronRight size={13} className="text-gray-300" />
        <Link to={`/subjects/${subjectId}`} className="text-gray-400 hover:text-gray-600">
          {subject.name[lang] || subject.name.uz}
        </Link>
        <ChevronRight size={13} className="text-gray-300" />
        <span className="text-gray-700 dark:text-gray-300 font-medium truncate max-w-xs">
          {topic.title[lang] || topic.title.uz}
        </span>
      </div>

      {/* Sticky Header and Tabs Container */}
      <div className="sticky top-0 z-20 bg-gray-50 dark:bg-gray-950 pt-1 pb-4">
        {/* Header card */}
        <div className="card overflow-hidden mb-3">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-primary-200 text-xs mb-1 font-medium tracking-wide uppercase">
                  {topicIndex + 1} / {topicsList.length} — mavzu
                </p>
                <h1 className="text-lg font-bold text-white leading-snug">
                  {topic.title[lang] || topic.title.uz}
                </h1>
                <p className="text-primary-200 text-xs mt-1.5">{topic.duration}</p>
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                {isCompleted ? (
                  <div className="flex items-center gap-1.5 bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-medium">
                    <CheckCircle size={13} /> Tugatildi
                  </div>
                ) : !test ? (
                  <button
                    onClick={markComplete}
                    className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-full text-xs font-medium transition-colors border border-white/30"
                  >
                    ✓ Tugatildi deb belgilash
                  </button>
                ) : (
                  <div className="text-white/90 text-xs font-medium bg-white/10 px-3 py-1.5 rounded-full border border-white/20 animate-pulse">
                    ⚠️ Tugallash uchun testni o'ting
                  </div>
                )}
                {testPassed && (
                  <div className="flex items-center gap-1 bg-emerald-500 text-white px-2.5 py-1 rounded-full text-xs font-medium">
                    <CheckCircle size={11} /> Test o'tildi
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="flex overflow-x-auto scrollbar-none">
            {TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              const isTestTab = tab.id === 'test'
              const locked = isTabLocked(tab.id)
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={clsx(
                    'flex items-center gap-2 px-4 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all flex-shrink-0',
                    isActive
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300',
                    isTestTab && testPassed && 'text-emerald-600 dark:text-emerald-400',
                    locked && 'opacity-50 cursor-not-allowed',
                  )}
                >
                  {locked ? <Lock size={14} className="text-gray-450 dark:text-gray-550" /> : <Icon size={15} />}
                  {getTabLabel(tab.id)}
                  {isTestTab && testPassed && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

        {/* Tab content */}
        <div className="p-6">
          {/* NAZARIY */}
          {activeTab === 'nazariy' && (
            isLoadingContent ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {lang === 'uz' ? 'Nazariy material yuklanmoqda...' : lang === 'ru' ? 'Загрузка теоретического материала...' : 'Loading theory material...'}
                </p>
              </div>
            ) : (
              <div>
                <div
                  className="prose prose-gray dark:prose-invert max-w-none prose-headings:font-bold prose-h2:text-xl prose-h3:text-base prose-li:text-sm"
                  dangerouslySetInnerHTML={{ __html: storageContent || topic.content?.[lang] || topic.content?.uz || '<p>Nazariy matn mavjud emas.</p>' }}
                  style={{ lineHeight: '1.75', color: 'inherit' }}
                />
                <div id="theory-bottom-marker" className="h-4 mt-6 bg-transparent" />
              </div>
            )
          )}

          {/* VIDEO DARSLIK */}
          {activeTab === 'video' && (
            <div>
              {videoId ? (
                <div className="rounded-xl overflow-hidden bg-black aspect-video shadow-lg">
                  <iframe
                    id="youtube-player"
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1`}
                    title={topic.title[lang] || topic.title.uz}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
                    <PlayCircle size={28} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">Video darslik hozircha mavjud emas</p>
                  <p className="text-gray-400 text-sm mt-1">Tez orada qo'shiladi</p>
                </div>
              )}
              {topic.videoDuration && videoId && (
                <p className="text-sm text-gray-500 mt-3 text-center">
                  ⏱ Davomiyligi: {topic.videoDuration}
                </p>
              )}
              {videoId && !videoCompleted && (
                <div className="mt-5 flex justify-center">
                  <button
                    onClick={() => {
                      setVideoCompleted(true)
                      toast.success(lang === 'uz' ? "Video yakunlandi! Taqdimot bo'limi ochildi." : "Video completed! Presentation tab unlocked.")
                    }}
                    className="btn-secondary text-xs font-semibold py-2 px-4 rounded-xl border-dashed border-gray-300 dark:border-gray-650 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <CheckCircle size={14} className="text-emerald-500" />
                    {lang === 'uz' ? "Videoni ko'rdim deb belgilash" : "Mark video as watched"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAQDIMOT */}
          {activeTab === 'taqdimot' && (
            <div>
              {PRESENTATIONS[topicId] && PRESENTATIONS[topicId].length > 0 ? (
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-2xl p-6 border border-orange-100 dark:border-orange-900/30">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
                        <Presentation size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {lang === 'uz' ? 'Taqdimot materiallari' : lang === 'ru' ? 'Презентационные материалы' : 'Presentation Materials'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {topic.title[lang] || topic.title.uz}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      {PRESENTATIONS[topicId].map((pres) => (
                        <div key={pres.num} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 flex flex-col justify-between hover:shadow-md transition-all duration-200">
                          <div className="flex items-start gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-950/50 flex items-center justify-center text-orange-600 dark:text-orange-400 flex-shrink-0">
                              <Presentation size={20} />
                            </div>
                            <div className="min-w-0">
                              <h5 className="font-semibold text-gray-900 dark:text-white text-sm leading-snug line-clamp-2" title={pres.title}>
                                {pres.title}
                              </h5>
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                {pres.size}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedPresentationUrl(pres.url)
                                if (!presentationCompleted) {
                                  setPresentationCompleted(true)
                                  toast.success(
                                    lang === 'uz'
                                      ? "Taqdimot o'rganildi! Amaliy topshiriqlar bo'limi ochildi."
                                      : "Presentation studied! Practical tasks tab unlocked."
                                  )
                                }
                              }}
                              className="flex-1 text-center py-2 px-3 rounded-lg text-xs font-semibold bg-orange-50 hover:bg-orange-100 text-orange-600 dark:bg-orange-950/30 dark:hover:bg-orange-950/50 dark:text-orange-400 transition-colors"
                            >
                              {lang === 'uz' ? "Slaydni ko'rish" : lang === 'ru' ? "Смотреть слайды" : "View Slides"}
                            </button>
                            <a
                              href={pres.url}
                              target="_blank"
                              rel="noreferrer"
                              className="py-2 px-3 rounded-lg text-xs font-semibold bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 dark:border-gray-600 transition-colors flex items-center justify-center"
                              onClick={() => toast.success(`"${pres.title}" yuklab olish boshlandi`)}
                            >
                              {lang === 'uz' ? "Yuklab olish" : lang === 'ru' ? "Скачать" : "Download"}
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedPresentationUrl && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden transition-all duration-300">
                      <div className="flex justify-between items-center mb-4 pb-2 border-b border-b-gray-100 dark:border-b-gray-700">
                        <h4 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                          {lang === 'uz' ? "Slaydlar ko'rinishi (Google Docs Viewer)" : lang === 'ru' ? "Просмотр слайдов" : "Slides Preview"}
                        </h4>
                        <div className="flex gap-2">
                          <button
                            onClick={() => window.open(`https://docs.google.com/viewer?url=${encodeURIComponent(selectedPresentationUrl)}`, '_blank')}
                            className="text-xs font-semibold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/30 dark:hover:bg-orange-950/50 dark:text-orange-400 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            {lang === 'uz' ? "To'liq ekranda ochish" : lang === 'ru' ? "Открыть во весь экран" : "Open Full Screen"}
                          </button>
                          <button
                            onClick={() => setSelectedPresentationUrl(null)}
                            className="text-xs font-semibold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/50 dark:text-red-400 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            {lang === 'uz' ? "Yopish" : lang === 'ru' ? "Закрыть" : "Close"}
                          </button>
                        </div>
                      </div>
                      <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                        <iframe
                          src={`https://docs.google.com/viewer?url=${encodeURIComponent(selectedPresentationUrl)}&embedded=true`}
                          width="100%"
                          height="100%"
                          frameBorder="0"
                          title="Google Docs Viewer"
                          className="w-full h-full"
                          allowFullScreen
                          allow="fullscreen"
                        >
                          Taqdimot yuklanmadi.
                        </iframe>
                      </div>
                      <p className="text-xs text-gray-400 mt-2 text-center">
                        {lang === 'uz' ? "Slaydlar yuklanishi uchun bir necha soniya vaqt ketishi mumkin." : "It may take a few seconds to load the slides."}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:gray-700 flex items-center justify-center mb-4">
                    <Presentation size={28} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">
                    {lang === 'uz' ? "Taqdimot hozircha mavjud emas" : lang === 'ru' ? "Презентация пока недоступна" : "Presentation is not available yet"}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    {lang === 'uz' ? "O'qituvchi tomonidan yuklanadi" : lang === 'ru' ? "Будет загружено преподавателем" : "Will be uploaded by the teacher"}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'amaliy' && (
            <div className="space-y-6">
              <InteractivePracticalTask
                topicId={topicId}
                lang={lang}
                onComplete={() => {
                  if (!practicalCompleted) {
                    setPracticalCompleted(true)
                  }
                }}
                isAlreadyCompleted={practicalCompleted}
              />
              
              {(topic.practical?.[lang] || topic.practical?.uz) && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-150 dark:border-gray-700 mt-4 shadow-sm">
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm flex items-center gap-2">
                    <FlaskConical size={16} className="text-purple-500" />
                    Topshiriq qo'shimcha ma'lumotlari
                  </h5>
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none text-xs text-gray-500"
                    dangerouslySetInnerHTML={{ __html: topic.practical[lang] || topic.practical.uz }}
                  />
                </div>
              )}
            </div>
          )}

          {/* TEST */}
          {activeTab === 'test' && (
            <div>
              {test ? (
                <div className="flex flex-col items-center text-center py-8">
                  <div className={clsx(
                    'w-20 h-20 rounded-2xl flex items-center justify-center mb-5 shadow-lg',
                    testPassed
                      ? 'bg-gradient-to-br from-emerald-400 to-green-600'
                      : 'bg-gradient-to-br from-primary-500 to-primary-700'
                  )}>
                    {testPassed
                      ? <CheckCircle size={36} className="text-white" />
                      : <FileText size={36} className="text-white" />
                    }
                  </div>

                  {testPassed ? (
                    <>
                      <h2 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                        Test muvaffaqiyatli o'tildi! 🎉
                      </h2>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-sm">
                        Siz bu mavzu testini o'tdingiz. Keyingi mavzuga o'tishingiz mumkin.
                      </p>
                       <div className="flex flex-wrap gap-3 justify-center">
                        {nextTopic && (
                          <Link
                            to={`/subjects/${subjectId}/topics/${nextTopic.id}`}
                            className="btn-primary flex items-center gap-1.5"
                          >
                            <span>Keyingi mavzuga o'tish</span>
                            <ChevronRight size={16} />
                          </Link>
                        )}
                        <Link
                          to={`/tests/${test.id}`}
                          className="btn-secondary text-sm flex items-center gap-1.5"
                        >
                          <FileText size={15} />
                          Qayta ishlash
                        </Link>
                      </div>
                    </>
                  ) : (
                    <>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Mavzu testiga kirish
                      </h2>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mb-2 max-w-sm">
                        Testni ishlash uchun avval nazariy va video darsliklarni ko'rib chiqing.
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mb-6">
                        <span>📝 {test.questions?.length || 10} ta savol</span>
                        <span>⏱ {test.timeLimit || 15} daqiqa</span>
                        <span>✅ 70% — o'tish bali</span>
                      </div>
                      <Link
                        to={`/tests/${test.id}`}
                        className="btn-primary"
                      >
                        <FileText size={16} />
                        Testni boshlash
                      </Link>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
                    <FileText size={28} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">Test hozircha mavjud emas</p>
                  <p className="text-gray-400 text-sm mt-1">Tez orada qo'shiladi</p>
                </div>
              )}
            </div>
          )}

          {/* AI TAHLIL */}
          {activeTab === 'ai_tahlil' && (
            <div className="space-y-6">
              {/* Introduction Card */}
              {!aiAnalysisResult && !isAnalyzing && (
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                      <Sparkles size={24} className="text-white animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-base">
                        {lang === 'uz' ? 'AI yordamida mavzu tahlili' : lang === 'ru' ? 'ИИ-анализ темы' : 'AI Topic Analysis'}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mt-1.5">
                        {lang === 'uz'
                          ? "Ushbu mavzuni Sun'iy Intellekt (AI) yordamida tahlil qiling. Tizim dars mazmunini o'rganib, uning qisqacha xulosasi, muhim tayanch so'zlari, amaliy tatbiqi va chuqurroq tushunish bo'yicha tavsiyalar beruvchi o'quv hisobotini tayyorlaydi."
                          : lang === 'ru'
                          ? 'Проанализируйте эту тему с помощью искусственного интеллекта (ИИ). Система изучит содержание урока и подготовит учебный отчет, содержащий краткое резюме, ключевые опорные слова, практическое применение и рекомендации по более глубокому пониманию.'
                          : 'Analyze this topic using Artificial Intelligence (AI). The system will study the lesson content and prepare a study report containing a brief summary, key words, practical application, and recommendations for deeper understanding.'}
                      </p>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={runAiAnalysis}
                      className="btn-primary flex-1 justify-center py-2.5 text-xs font-bold gap-1.5 flex items-center shadow-sm"
                    >
                      <Sparkles size={14} />
                      {lang === 'uz' ? 'AI Tahlilini Boshlash' : lang === 'ru' ? 'Запустить ИИ-Анализ' : 'Start AI Analysis'}
                    </button>
                  </div>
                </div>
              )}

              {/* Analyzing / Loading State */}
              {isAnalyzing && (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-100 dark:border-indigo-900/30 border-t-indigo-600 animate-spin"></div>
                    <Sparkles size={24} className="text-indigo-600 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm">
                      {lang === 'uz' ? 'AI mavzuni tahlil qilmoqda...' : 'AI is analyzing the topic...'}
                    </h4>
                    <p className="text-xs text-gray-400 mt-1">
                      {lang === 'uz' ? 'Kuting, o\'quv hisoboti shakllantirilmoqda...' : 'Please wait, generating analysis report...'}
                    </p>
                  </div>
                </div>
              )}

              {/* Analysis Result Display */}
              {aiAnalysisResult && !isAnalyzing && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-900/40 px-4 py-2.5 rounded-xl border border-gray-150 dark:border-gray-850">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                      <Sparkles size={14} className="text-indigo-500 animate-pulse" />
                      <span>{lang === 'uz' ? 'AI Tomonidan Yaratilgan Tahlil' : 'AI-Generated Analysis'}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={copyToClipboard}
                        className="btn-secondary py-1 px-2.5 text-[10px] font-semibold flex items-center gap-1 hover:text-primary-600"
                      >
                        <Copy size={11} />
                        {lang === 'uz' ? 'Nusxalash' : 'Copy'}
                      </button>
                      <button
                        onClick={runAiAnalysis}
                        className="btn-secondary py-1 px-2.5 text-[10px] font-semibold flex items-center gap-1 text-indigo-600 hover:bg-indigo-50"
                      >
                        <RefreshCw size={11} />
                        {lang === 'uz' ? 'Qayta tahlil' : 'Re-analyze'}
                      </button>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800/80 p-6 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm leading-relaxed">
                    <div
                      className="prose prose-indigo dark:prose-invert max-w-none text-xs leading-relaxed space-y-4
                        prose-headings:font-bold prose-h2:text-base prose-h3:text-sm prose-h4:text-xs
                        prose-p:text-gray-650 dark:prose-p:text-gray-300
                        prose-li:text-gray-650 dark:prose-li:text-gray-300
                        prose-strong:text-gray-900 dark:prose-strong:text-white"
                      dangerouslySetInnerHTML={{
                        __html: aiAnalysisResult
                          .replace(/^## (.*$)/gim, '<h2 class="text-base font-bold text-indigo-600 dark:text-indigo-400 mt-4 mb-2">$1</h2>')
                          .replace(/^### (.*$)/gim, '<h3 class="text-sm font-bold text-gray-850 dark:text-gray-200 mt-3 mb-1.5">$1</h3>')
                          .replace(/^\* (.*$)/gim, '<li class="list-disc ml-5 my-1 text-gray-650 dark:text-gray-300">$1</li>')
                          .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900 dark:text-white">$1</strong>')
                          .replace(/> \[\!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\n> (.*$)/gim, '<div class="p-3.5 bg-indigo-50/50 dark:bg-indigo-950/10 border-l-4 border-indigo-500 rounded-r-lg text-[11px] my-3 text-indigo-750 dark:text-indigo-300">$2</div>')
                          .replace(/\n\n/g, '<p class="my-2"></p>')
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        {/* Back */}
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

        {/* Forward */}
        {nextTopic ? (
          canGoNext ? (
            <Link
              to={`/subjects/${subjectId}/topics/${nextTopic.id}`}
              className="btn-primary"
            >
              Keyingi mavzu
              <ChevronRight size={16} />
            </Link>
          ) : (
            <button
              onClick={() => {
                if (!test) {
                  toast.error("Keyingi mavzuga o'tish uchun avval ushbu mavzuni tugatildi deb belgilang!")
                } else {
                  toast.error("Keyingi mavzuga o'tish uchun avval testni o'ting!")
                  setActiveTab('test')
                }
              }}
              className="btn-primary opacity-60 flex items-center gap-2"
              title={test ? "Testni bajaring" : "Mavzuni tugating"}
            >
              <Lock size={15} />
              {test ? "Testni bajaring" : "Mavzuni tugating"}
              <ChevronRight size={16} />
            </button>
          )
        ) : (
          <Link to={`/subjects/${subjectId}`} className="btn-primary">
            <BookOpen size={16} />
            Barcha mavzular
          </Link>
        )}
      </div>

      {/* Lock notice */}
      {nextTopic && !canGoNext && (
        <div className="mt-4 flex items-center gap-2.5 p-3.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-700 dark:text-amber-400">
          <Lock size={15} className="flex-shrink-0" />
          <span>
            {test ? (
              <>
                Keyingi mavzuga o'tish uchun{' '}
                <button
                  onClick={() => setActiveTab('test')}
                  className="font-semibold underline underline-offset-2 hover:no-underline"
                >
                  testni bajaring
                </button>
                . Test 70% va undan yuqori ball bilan o'tilishi kerak.
              </>
            ) : (
              <>
                Keyingi mavzuga o'tish uchun yuqoridagi{' '}
                <span className="font-semibold">"✓ Tugatildi deb belgilash"</span>{' '}
                tugmasini bosing.
              </>
            )}
          </span>
        </div>
      )}
    </div>
  )
}
