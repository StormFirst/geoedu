import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Sparkles, Send, Trash2, Key, HelpCircle, ArrowRight,
  RefreshCw, Bot, User, Check, Play, Settings, AlertCircle, Info
} from 'lucide-react'
import toast from 'react-hot-toast'

// --- LOCAL DATA FOR GIS ASSISTANT ---
const PRESET_TOPICS = {
  buffer: {
    id: 'buffer',
    question: {
      uz: 'Buffer nima?',
      ru: 'Что такое буфер?',
      en: 'What is a Buffer?'
    },
    title: {
      uz: 'Bufer zonalari (Buffering)',
      ru: 'Буферные зоны (Buffering)',
      en: 'Buffer Zones (Buffering)'
    },
    answer: {
      uz: `**Bufer zonasi** — bu berilgan geografik ob'ekt (nuqta, chiziq yoki poligon) atrofida ma'lum masofada hosil qilingan hududdir.

### Asosiy maqsadi:
Fazoviy tahlilda yaqinlik (proximity) munosabatlarini tahlil qilish uchun ishlatiladi. Masalan:
* **Muhofaza zonalari**: Daryo yoki ko'l atrofidagi 100 metrli taqiqlangan hudud.
* **Xizmat ko'rsatish**: Metro bekati atrofida 500 metrlik piyoda yurish radiusi.
* **Ta'sir zonalari**: Shovqin yoki ifloslanish manbai atrofidagi xavfli hudud.

### Matematik asosi:
Har bir nuqta $P$ uchun bufer zonasi quyidagi to'plam sifatida aniqlanadi:
$$B(P, r) = \{Q \in \mathbb{R}^2 \mid d(P, Q) \le r\}$$
Bu yerda $r$ — bufer radiusi, $d$ — ikki nuqta orasidagi Evklid yoki geodezik masofa.`,
      ru: `**Буферная зона** — это область, созданная на заданном расстоянии вокруг географического объекта (точки, линии или полигона).

### Основное назначение:
Используется в пространственном анализе для оценки близости (proximity). Например:
* **Охранные зоны**: 100-метровая водоохранная зона вокруг рек.
* **Доступность**: 500-метровая зона пешей доступности вокруг станций метро.
* **Зоны воздействия**: Зона распространения шума или загрязнения вокруг завода.

### Математическая основа:
Для каждой точки $P$ буферная зона определяется как множество:
$$B(P, r) = \{Q \in \mathbb{R}^2 \mid d(P, Q) \le r\}$$
Где $r$ — радиус буфера, а $d$ — евклидово или геодезическое расстояние.`,
      en: `**A Buffer Zone** is an area created at a specified distance around a geographic feature (point, line, or polygon).

### Main Purpose:
It is used in spatial analysis to analyze proximity relationships. For example:
* **Conservation zones**: A 100-meter buffer around a river or lake.
* **Accessibility**: A 500-meter walking radius around metro stations.
* **Impact zones**: A hazardous area around a source of noise or air pollution.

### Mathematical basis:
For any point $P$, the buffer zone is defined as the set:
$$B(P, r) = \{Q \in \mathbb{R}^2 \mid d(P, Q) \le r\}$$
Where $r$ is the buffer radius, and $d$ is the Euclidean or geodesic distance.`
    }
  },
  georeference: {
    id: 'georeference',
    question: {
      uz: 'Georeferencing nima?',
      ru: 'Что такое геопривязка?',
      en: 'What is Georeferencing?'
    },
    title: {
      uz: 'Geobog\'lash (Georeferencing)',
      ru: 'Геопривязка (Georeferencing)',
      en: 'Georeferencing'
    },
    answer: {
      uz: `**Geobog'lash (Georeferencing)** — bu geografik koordinatalarga ega bo'lmagan raster tasvirni (masalan, qog'oz xarita skaneri yoki aerofotosurat) Yer yuzasidagi haqiqiy koordinatalar tizimiga moslashtirish jarayonidir.

### Qanday ishlaydi:
1. **Nazorat nuqtalari (GCP - Ground Control Points)**: Tasvirdagi oson tanib olinadigan ob'ektlar (yo'l kesishmalari, bino burchaklari) tanlanib, ularning haqiqiy geografik koordinatalari kiritiladi.
2. **Matematik transformatsiya**: Afina, proyektiv yoki splayn tenglamalari yordamida tasvir cho'ziladi, buriladi va masshtablashtiriladi.
3. **Resampling**: Tasvir piksellari yangi koordinata setkasiga moslab qayta hisoblanadi.

### Transformatsiya xatosi (RMS Error):
Geobog'lash sifatini tekshirish uchun o'rtacha kvadratik xatolik (Root Mean Square Error - RMSE) hisoblanadi:
$$RMSE = \sqrt{\frac{1}{n}\sum_{i=1}^{n} (e_{xi}^2 + e_{yi}^2)}$$
Bu yerda $e_{xi}$ va $e_{yi}$ — nazorat nuqtalarining haqiqiy va hisoblangan koordinatalari orasidagi tafovutlar.`,
      ru: `**Геопривязка (Georeferencing)** — это процесс сопоставления растрового изображения (отсканированной карты или аэрофотоснимка), не имеющего географической привязки, с реальной системой координат на Земле.

### Процесс работы:
1. **Опорные точки (GCP)**: На изображении выбираются четкие ориентиры (перекрестки, углы зданий), и им сопоставляются известные географические координаты.
2. **Математическая трансформация**: Изображение сдвигается, масштабируется, поворачивается с помощью аффинного или проективного преобразования.
3. **Пересчет пикселей (Resampling)**: Пиксели растра интерполируются на новую сетку.

### Оценка погрешности (RMS Error):
Для оценки точности привязки рассчитывается среднеквадратическая ошибка (RMSE):
$$RMSE = \sqrt{\frac{1}{n}\sum_{i=1}^{n} (e_{xi}^2 + e_{yi}^2)}$$
Где $e_{xi}$ и $e_{yi}$ — отклонения фактических координат от расчетных.`
      ,
      en: `**Georeferencing** is the process of aligning a raster image (such as a scanned paper map or aerial photograph) that lacks a coordinate system to a real-world geographic coordinate system.

### How it works:
1. **Ground Control Points (GCPs)**: Easily identifiable features on the image (e.g., road intersections, building corners) are selected and linked to their real-world coordinates.
2. **Mathematical Transformation**: The image is stretched, rotated, and scaled using affine, projective, or spline equations.
3. **Resampling**: Pixels are recalculated to match the new grid.

### Residual Error (RMS Error):
To evaluate accuracy, the Root Mean Square Error (RMSE) is calculated:
$$RMSE = \sqrt{\frac{1}{n}\sum_{i=1}^{n} (e_{xi}^2 + e_{yi}^2)}$$
Where $e_{xi}$ and $e_{yi}$ represent the coordinate deviations for control points.`
    }
  },
  utm: {
    id: 'utm',
    question: {
      uz: 'UTM koordinata tizimi nima?',
      ru: 'Что такое координатная система UTM?',
      en: 'What is the UTM Coordinate System?'
    },
    title: {
      uz: 'UTM (Universal Transverse Mercator)',
      ru: 'UTM (Универсальная Поперечная Меркатора)',
      en: 'UTM (Universal Transverse Mercator)'
    },
    answer: {
      uz: `**UTM (Universal Transverse Mercator)** — bu Yer yuzasini tekislikda tasvirlovchi eng ommabop koordinatalar tizimidan biridir. U konform (burchaklarni saqlovchi) ko'ndalang silindrik proyeksiya hisoblanadi.

### Zonalarga bo'linishi:
* Yer yuzasi **60 ta bo'ylama zonaga** (har biri $6^\circ$ uzunlik) bo'lingan.
* Zonalar 1 dan 60 gacha raqamlanadi (G'arbdan Sharqqa qarab, $180^\circ$ meridiandan boshlab).
* **O'zbekiston** asosan **42N** (Toshkent va vodiy) hamda **41N** (Markaziy va G'arbiy hududlar) zonalarida joylashgan.

### Koordinatalar tuzilishi:
* **False Easting**: Har bir zonaning markaziy meridianiga $500\,000$ metr qiymati beriladi (manfiy koordinatalar hosil bo'lmasligi uchun).
* **False Northing**: Shimoliy yarim sharda ekvator $0$ m deb olinadi. Janubiy yarim sharda esa ekvatorga $10\,000\,000$ m veriladi.
* **O'lchov birligi**: Metr. Bu masofa va maydonlarni tahlil qilishni juda osonlashtiradi.`,
      ru: `**UTM (Universal Transverse Mercator)** — одна из самых популярных систем координат, представляющая земную поверхность на плоскости с использованием поперечно-цилиндрической проекции Меркатора.

### Деление на зоны:
* Земной шар разделен на **60 зон** по долготе (каждая шириной $6^\circ$).
* Нумерация зон идет от 1 до 60 с запада на восток, начиная от $180^\circ$ меридиана.
* **Узбекистан** преимущественно находится в зонах **42N** (Ташкент) и **41N** (центральные и западные регионы).

### Формат координат:
* **False Easting (условный восток)**: Центральному меридиану зоны присваивается значение $500\,000$ метров, чтобы избежать отрицательных координат.
* **False Northing (условный север)**: В северном полушарии экватор равен $0$ м, в южном полушарии — $10\,000\,000$ м.
* **Единица измерения**: Метр, что облегчает пространственные расчеты.`,
      en: `**UTM (Universal Transverse Mercator)** is a plane coordinate system that projects the spherical Earth surface onto a flat plane using a conformal transverse cylindrical Mercator projection.

### Zoning:
* The Earth is divided into **60 longitudinal zones**, each spanning $6^\circ$ of longitude.
* Zones are numbered 1 to 60 starting from the $180^\circ$ meridian, moving West to East.
* **Uzbekistan** lies mainly within zones **42N** (Tashkent and eastern regions) and **41N** (Central and Western regions).

### Coordinates structure:
* **False Easting**: The central meridian of each zone is assigned $500,000$ meters to avoid negative values.
* **False Northing**: In the Northern hemisphere, the equator is $0$ m. In the Southern hemisphere, the equator is set to $10,000,000$ m.
* **Unit**: Meters, making distance and area analysis extremely straightforward.`
    }
  }
}

const GENERAL_GIS_QA = {
  gis: {
    uz: "GIS (Geografik Axborot Tizimi) — fazoviy yoki geografik ma'lumotlarni to'plash, saqlash, tahlil qilish va vizuallashtirish (xaritalash) imkonini beruvchi kompyuter tizimidir. U dasturiy ta'minot, ma'lumotlar, apparat vositalari va foydalanuvchilardan tashkil topadi.",
    ru: "ГИС (Географическая Информационная Система) — это компьютерная система для сбора, хранения, анализа и визуализации (картографирования) пространственных данных. Она состоит из ПО, данных, оборудования и пользователей.",
    en: "GIS (Geographic Information System) is a computer system designed to capture, store, manipulate, analyze, manage, and present all types of geographical or spatial data."
  },
  vector_raster: {
    uz: "Vektor ma'lumotlar geografik ob'ektlarni nuqtalar, chiziqlar va poligonlar (koordinatalar majmuasi) ko'rinishida tasvirlaydi. Rastr ma'lumotlar esa hududni piksellar setkasi (matritsa) ko'rinishida ifodalaydi. Masalan, aerofoto yoki sun'iy yo'ldosh tasvirlari rastr ma'lumotlardir.",
    ru: "Векторные данные представляют географические объекты в виде точек, линий и полигонов (координат). Растровые данные представляют местность в виде сетки пикселей (матрицы). Например, аэрофотоснимки и спутниковые снимки — это растр.",
    en: "Vector data represents geographic features as points, lines, and polygons (using coordinates). Raster data represents the landscape as a grid of pixels (cells), such as satellite imagery or digital elevation models."
  },
  interpolation: {
    uz: "Fazoviy interpolatsiya — ma'lum nuqtadagi o'lchov natijalariga tayanib, o'lchov o'tkazilmagan nuqtalardagi qiymatlarni hisoblash usulidir. Bu harorat xaritalari, relyef modellari yoki ifloslanish darajasini tasvirlashda keng qo'llaniladi.",
    ru: "Пространственная интерполяция — метод оценки значений в точках, где измерения не проводились, на основе соседних измеренных точек. Используется для построения карт температур, рельефа или загрязнений.",
    en: "Spatial interpolation is the process of using points with known values to estimate values at other unknown points, widely used to create elevation models, temperature maps, or pollution surfaces."
  }
}

export default function AIAssistantPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language || 'uz'

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: lang === 'uz'
        ? "Salom! Men sizning AI GIS Assistentingizman. Men sizga geografik axborot tizimlari, kartografiya va topografiyaga oid savollaringizni tushuntirib bera olaman. Quyidagi tayyor mavzulardan birini tanlang yoki o'z savolingizni yozing."
        : lang === 'ru'
        ? "Привет! Я ваш AI ГИС Ассистент. Я могу объяснить вам вопросы, связанные с географическими информационными системами, картографией и топографией. Выберите готовую тему ниже или напишите свой вопрос."
        : "Hello! I am your AI GIS Assistant. I can help you understand geographic information systems, cartography, and topography. Choose a preset topic below or type your own question.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [activeDemo, setActiveDemo] = useState('none') // 'none', 'buffer', 'georeference', 'utm'
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_OPENAI_API_KEY || '')
  const [showApiModal, setShowApiModal] = useState(false)

  // Load API Key from env or localStorage on mount
  useEffect(() => {
    const envKey = import.meta.env.VITE_OPENAI_API_KEY || ''
    if (envKey) {
      setApiKey(envKey)
    } else {
      const savedKey = localStorage.getItem('geoedu_openai_key')
      if (savedKey) {
        setApiKey(savedKey)
      }
    }
  }, [])

  // Ref for auto-scroll
  const messagesEndRef = useRef(null)
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  // --- HANDLERS ---
  const queryChatGPT = async (queryText, topicId = null) => {
    try {
      const prompt = `You are a professional GIS Academic Assistant in an educational web platform called GeoEdu.
Answer the user's question clearly, academically, and comprehensively.
Format your answer nicely using markdown (bullet points, bold text).
Language constraints: The user is asking in ${lang === 'uz' ? 'Uzbek' : lang === 'ru' ? 'Russian' : 'English'}. Answer in the same language.
User question: "${queryText}"`

      const response = await fetch(
        `https://api.openai.com/v1/chat/completions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }]
          }),
        }
      )

      if (!response.ok) {
        throw new Error('OpenAI API call failed')
      }

      const data = await response.json()
      const reply = data.choices?.[0]?.message?.content

      setIsTyping(false)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'assistant',
          text: reply || (lang === 'uz' ? "Kechirasiz, javob olishda xatolik yuz berdi." : "Sorry, could not generate a response."),
          topicId: topicId || undefined,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ])
    } catch (err) {
      setIsTyping(false)
      toast.error('API Error: ' + err.message)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'assistant',
          text: lang === 'uz'
            ? "OpenAI API orqali javob olishda muammo yuz berdi. Iltimos API kalit sozlamalarini tekshiring yoki savolni boshqacha shakllantiring."
            : "Problem communicating with OpenAI API. Please check your API key settings.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ])
    }
  }

  const handlePresetClick = (topicId) => {
    const topic = PRESET_TOPICS[topicId]
    if (!topic) return

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: topic.question[lang] || topic.question.uz,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages((prev) => [...prev, userMsg])
    setIsTyping(true)
    setActiveDemo(topicId)

    if (apiKey) {
      queryChatGPT(topic.question[lang] || topic.question.uz, topicId)
    } else {
      setTimeout(() => {
        setIsTyping(false)
        const assistantMsg = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: topic.answer[lang] || topic.answer.uz,
          topicId: topicId,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
        setMessages((prev) => [...prev, assistantMsg])
      }, 1000)
    }
  }

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault()
    if (!inputText.trim()) return

    const query = inputText.trim()
    setInputText('')

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages((prev) => [...prev, userMsg])
    setIsTyping(true)

    // Check if query matches preset topics or keywords for simulator mapping
    const lowerQuery = query.toLowerCase()
    let matchedTopicId = null

    if (lowerQuery.includes('buffer') || lowerQuery.includes('bufer')) {
      matchedTopicId = 'buffer'
    } else if (lowerQuery.includes('georef') || lowerQuery.includes('geobog') || lowerQuery.includes('геоприв')) {
      matchedTopicId = 'georeference'
    } else if (lowerQuery.includes('utm')) {
      matchedTopicId = 'utm'
    }

    if (matchedTopicId) {
      setActiveDemo(matchedTopicId)
    }

    // Live OpenAI API Call if Key is present
    if (apiKey) {
      queryChatGPT(query, matchedTopicId)
      return
    }

    // Offline Fallback Mode
    if (matchedTopicId) {
      setTimeout(() => {
        setIsTyping(false)
        const topic = PRESET_TOPICS[matchedTopicId]
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            sender: 'assistant',
            text: topic.answer[lang] || topic.answer.uz,
            topicId: matchedTopicId,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ])
      }, 1000)
      return
    }

    // Check other general offline QA
    let offlineAnswer = ''
    if (lowerQuery.includes('gis') || lowerQuery.includes('гис') || lowerQuery.includes('geografik axborot')) {
      offlineAnswer = GENERAL_GIS_QA.gis[lang] || GENERAL_GIS_QA.gis.uz
    } else if (lowerQuery.includes('vektor') || lowerQuery.includes('rastr') || lowerQuery.includes('вектор') || lowerQuery.includes('растр')) {
      offlineAnswer = GENERAL_GIS_QA.vector_raster[lang] || GENERAL_GIS_QA.vector_raster.uz
    } else if (lowerQuery.includes('interpol') || lowerQuery.includes('интерпол')) {
      offlineAnswer = GENERAL_GIS_QA.interpolation[lang] || GENERAL_GIS_QA.interpolation.uz
    }

    if (offlineAnswer) {
      setTimeout(() => {
        setIsTyping(false)
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            sender: 'assistant',
            text: offlineAnswer,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ])
      }, 1000)
      return
    }

    // General fallback response when offline and no keywords match
    setTimeout(() => {
      setIsTyping(false)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'assistant',
          text: lang === 'uz'
            ? `Ushbu savol uchun offline lug'atimizda javob topilmadi.
Erkin savollarga javob berishim uchun yuqoridagi **OpenAI API Sozlamalari** orqali OpenAI API kalitini kiritishingiz kerak.

*Maslahat: "Buffer", "Georeferencing" yoki "UTM" so'zlarini kiritib offline simulyatsiyalarni sinab ko'ring.*`
            : lang === 'ru'
            ? `В нашей оффлайн-базе нет ответа на этот вопрос.
Для получения ответов на любые вопросы введите ключ OpenAI API в панели настроек вверху.

*Совет: Введите "Буфер", "Геопривязка" или "UTM", чтобы запустить оффлайн-симуляторы.*`
            : `I couldn't find an offline response for this question.
To enable open-ended questions, please configure an OpenAI API Key in the settings panel above.

*Tip: Type "Buffer", "Georeferencing", or "UTM" to trigger the local interactive sandboxes.*`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ])
    }, 1000)
  }

  const handleSaveApiKey = (e) => {
    e.preventDefault()
    const trimmed = apiKey.trim()
    if (trimmed) {
      localStorage.setItem('geoedu_openai_key', trimmed)
      setApiKey(trimmed)
      toast.success(lang === 'uz' ? 'API kalit muvaffaqiyatli saqlandi!' : 'API key saved successfully!')
      setShowApiModal(false)
    } else {
      localStorage.removeItem('geoedu_openai_key')
      setApiKey('')
      toast.success(lang === 'uz' ? 'API kalit o\'chirildi' : 'API key removed')
      setShowApiModal(false)
    }
  }

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'assistant',
        text: lang === 'uz'
          ? "Chat tozalandi. Savolingizni bering!"
          : "Чат очищен. Задайте свой вопрос!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ])
    setActiveDemo('none')
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-80px)] w-full">
      {/* LEFT CHAT CONTAINER */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm overflow-hidden h-full">
        {/* Header bar */}
        <div className="px-6 py-4 border-b border-gray-150 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/30 select-none">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/40 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-400">
              <Bot size={22} className="animate-pulse" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white text-base">AI GIS Assistent</h2>
              <p className="text-[11px] text-gray-500 flex items-center gap-1.5 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${apiKey ? 'bg-green-500' : 'bg-orange-400'}`}></span>
                {apiKey ? (lang === 'uz' ? 'Generativ rejim faol' : 'Generative mode active') : (lang === 'uz' ? 'Offline o\'quv rejimi' : 'Offline learning mode')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowApiModal(true)}
              className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all"
              title="API settings"
            >
              <Settings size={18} />
            </button>
            <button
              onClick={clearChat}
              className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all"
              title="Clear chat"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {/* Message history */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                msg.sender === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}>
                {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>

              <div className="space-y-1.5">
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-primary-600 text-white rounded-tr-none'
                    : 'bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none'
                }`}>
                  {/* Basic markdown renderer */}
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {msg.text.split('\n').map((line, idx) => {
                      if (line.startsWith('###')) {
                        return <h4 key={idx} className="font-bold text-gray-900 dark:text-white mt-3 mb-1 text-sm">{line.replace('###', '').trim()}</h4>
                      }
                      if (line.startsWith('*') || line.startsWith('-')) {
                        return <li key={idx} className="ml-4 list-disc mt-0.5">{line.substring(1).trim()}</li>
                      }
                      // bold bold matches
                      const parts = line.split('**')
                      if (parts.length > 2) {
                        return (
                          <p key={idx} className="mt-1">
                            {parts.map((p, i) => i % 2 === 1 ? <strong key={i} className="text-gray-900 dark:text-white font-bold">{p}</strong> : p)}
                          </p>
                        )
                      }
                      return <p key={idx} className="mt-1 min-h-[1em]">{line}</p>
                    })}
                  </div>

                  {/* Attachment indicator linking to the visual simulation */}
                  {msg.topicId && (
                    <button
                      onClick={() => setActiveDemo(msg.topicId)}
                      className={`mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        activeDemo === msg.topicId
                          ? 'bg-primary-500 border-primary-500 text-white shadow-sm'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-primary-600 dark:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Play size={12} />
                      {lang === 'uz' ? 'Simulyatsiyani ochish' : 'Open Simulation'}
                    </button>
                  )}
                </div>
                <p className={`text-[10px] text-gray-400 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp}
                </p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center">
                <Bot size={14} />
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 p-4 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Preset suggestion chips */}
        <div className="px-6 py-2 border-t border-gray-100 dark:border-gray-700 flex gap-2 overflow-x-auto select-none no-scrollbar">
          {Object.values(PRESET_TOPICS).map((top) => (
            <button
              key={top.id}
              onClick={() => handlePresetClick(top.id)}
              className="flex-shrink-0 px-3.5 py-1.5 bg-gray-50 dark:bg-gray-900/40 hover:bg-primary-50 dark:hover:bg-primary-950/20 border border-gray-150 dark:border-gray-700 hover:border-primary-200 text-xs font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 rounded-xl transition-all flex items-center gap-1"
            >
              <HelpCircle size={12} className="text-gray-400" />
              {top.question[lang] || top.question.uz}
            </button>
          ))}
        </div>

        {/* Input box */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-150 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20 flex gap-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={lang === 'uz' ? "GISga oid savolingizni yozing..." : "Type your GIS question..."}
            className="flex-1 input px-4 py-2.5 text-sm"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="btn-primary px-5 py-2.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send size={15} />
            <span className="hidden sm:inline">{lang === 'uz' ? 'Yuborish' : 'Send'}</span>
          </button>
        </form>
      </div>

      {/* RIGHT INTERACTIVE SANDBOX */}
      <div className="w-full lg:w-[480px] xl:w-[540px] flex flex-col bg-white dark:bg-gray-800 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm overflow-hidden h-full">
        <div className="px-6 py-4 border-b border-gray-150 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 select-none">
          <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider">
            <Sparkles size={16} className="text-primary-500" />
            {lang === 'uz' ? 'Interaktiv GIS Simulyatori' : 'Interactive GIS Simulator'}
          </h3>
        </div>

        <div className="flex-1 p-6 overflow-y-auto flex flex-col items-center justify-center">
          {activeDemo === 'none' && (
            <div className="text-center space-y-4 max-w-sm">
              <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-700 rounded-2xl flex items-center justify-center text-gray-400 mx-auto">
                <Info size={28} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white text-sm">Simulyator Faol Emas</h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {lang === 'uz'
                    ? "GIS konseptsiyalarini vizual ko'rish uchun chapdagi tayyor savollardan birini bosing yoki uning simulyatsiya tugmasini tanlang."
                    : "Click on one of the preset questions on the left to activate its live visual simulator sandbox."}
                </p>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 text-blue-700 dark:text-blue-400 rounded-xl text-[11px] leading-relaxed text-left flex gap-2">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>
                  <strong>Buffer, Georeferencing</strong> va <strong>UTM Zone</strong> kabi eng muhim GIS mavzulariga oid jonli dasturlashtirilgan vizualizatsiyalar o'rnatilgan.
                </span>
              </div>
            </div>
          )}

          {activeDemo === 'buffer' && <BufferSimulator lang={lang} />}
          {activeDemo === 'georeference' && <GeoreferenceSimulator lang={lang} />}
          {activeDemo === 'utm' && <UtmSimulator lang={lang} />}
        </div>
      </div>

      {/* API KEY SETTINGS MODAL */}
      {showApiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full border border-gray-200 dark:border-gray-700 shadow-2xl p-6 relative">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
              <Key size={18} className="text-primary-500" />
              OpenAI API Kaliti Sozlamalari
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">
              Erkin GIS savollarini OpenAI ChatGPT API yordamida jonli ravishda so'rash uchun o'z API kalitingizni kiriting.
              Kalit faqat brauzeringizning <code>localStorage</code> xotirasida saqlanadi va bevosita OpenAI serverlariga yuboriladi.
            </p>

            <form onSubmit={handleSaveApiKey} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">OpenAI API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="input text-xs"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowApiModal(false)}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  Yopish
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs font-semibold px-4 py-2"
                >
                  <Check size={14} />
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ==========================================
// 1. BUFFER SIMULATOR COMPONENT
// ==========================================
function BufferSimulator({ lang }) {
  const [shape, setShape] = useState('point') // 'point', 'line', 'polygon'
  const [distance, setDistance] = useState(60)
  const canvasRef = useRef(null)

  // Trigger redraw on state change
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw Grid Backdrop
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.15)'
    ctx.lineWidth = 1
    const gridSize = 25
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    if (shape === 'point') {
      const cx = width / 2
      const cy = height / 2

      // Draw Buffer Zone
      ctx.beginPath()
      ctx.arc(cx, cy, distance, 0, 2 * Math.PI)
      ctx.fillStyle = 'rgba(59, 130, 246, 0.2)'
      ctx.fill()
      ctx.strokeStyle = '#3b82f6'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 3])
      ctx.stroke()
      ctx.setLineDash([])

      // Draw original point
      ctx.beginPath()
      ctx.arc(cx, cy, 6, 0, 2 * Math.PI)
      ctx.fillStyle = '#ef4444'
      ctx.fill()
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
      ctx.stroke()

      // Dimension line
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + distance, cy)
      ctx.strokeStyle = '#ef4444'
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Dimension text
      ctx.fillStyle = '#ef4444'
      ctx.font = 'bold 9px monospace'
      ctx.fillText(`${distance}m`, cx + (distance / 3), cy - 4)
    }

    else if (shape === 'line') {
      const pts = [
        { x: 50, y: height / 2 - 20 },
        { x: width / 2 - 20, y: height / 2 + 40 },
        { x: width - 70, y: height / 2 - 30 }
      ]

      // Draw Buffer Polyline (using canvas lineCap / lineJoin trick)
      ctx.beginPath()
      ctx.moveTo(pts[0].x, pts[0].y)
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x, pts[i].y)
      }
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.lineWidth = distance * 2
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)'
      ctx.stroke()

      // Draw Buffer outline
      ctx.strokeStyle = '#3b82f6'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 3])
      ctx.stroke()
      ctx.setLineDash([])

      // Draw original thin line
      ctx.beginPath()
      ctx.moveTo(pts[0].x, pts[0].y)
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x, pts[i].y)
      }
      ctx.strokeStyle = '#ef4444'
      ctx.lineWidth = 3
      ctx.stroke()

      // Draw vertex markers
      pts.forEach((p) => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, 5, 0, 2 * Math.PI)
        ctx.fillStyle = '#ffffff'
        ctx.fill()
        ctx.strokeStyle = '#ef4444'
        ctx.lineWidth = 2
        ctx.stroke()
      })
    }

    else if (shape === 'polygon') {
      const pts = [
        { x: width / 2, y: 50 },
        { x: width - 100, y: height - 80 },
        { x: 100, y: height - 80 }
      ]

      // Draw Buffer around Polygon: we draw a very thick stroke on a polygon path and fill it
      ctx.beginPath()
      ctx.moveTo(pts[0].x, pts[0].y)
      ctx.lineTo(pts[1].x, pts[1].y)
      ctx.lineTo(pts[2].x, pts[2].y)
      ctx.closePath()

      // Set styles for outer buffer
      ctx.lineJoin = 'round'
      ctx.lineCap = 'round'
      ctx.lineWidth = distance * 2
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)'
      ctx.stroke()

      ctx.fillStyle = 'rgba(59, 130, 246, 0.2)'
      ctx.fill()

      // Outline
      ctx.strokeStyle = '#3b82f6'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 3])
      ctx.stroke()
      ctx.setLineDash([])

      // Draw original polygon
      ctx.beginPath()
      ctx.moveTo(pts[0].x, pts[0].y)
      ctx.lineTo(pts[1].x, pts[1].y)
      ctx.lineTo(pts[2].x, pts[2].y)
      ctx.closePath()
      ctx.fillStyle = 'rgba(239, 68, 68, 0.15)'
      ctx.fill()
      ctx.strokeStyle = '#ef4444'
      ctx.lineWidth = 2.5
      ctx.stroke()

      // Vertex markers
      pts.forEach((p) => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, 5, 0, 2 * Math.PI)
        ctx.fillStyle = '#ffffff'
        ctx.fill()
        ctx.strokeStyle = '#ef4444'
        ctx.lineWidth = 2
        ctx.stroke()
      })
    }

  }, [shape, distance])

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
        <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm">
          {lang === 'uz' ? 'Bufer Vizualizatori' : 'Buffer Visualizer'}
        </h4>
        <div className="flex gap-1.5">
          {['point', 'line', 'polygon'].map((t) => (
            <button
              key={t}
              onClick={() => setShape(t)}
              className={`px-2 py-1 text-[10px] font-semibold border rounded-lg uppercase tracking-wider transition-all ${
                shape === t
                  ? 'bg-primary-500 border-primary-500 text-white shadow-sm'
                  : 'bg-gray-50 dark:bg-gray-900/60 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="relative border border-gray-150 dark:border-gray-700 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <canvas ref={canvasRef} width={400} height={250} className="max-w-full h-auto aspect-[1.6]" />
      </div>

      <div>
        <div className="flex justify-between text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">
          <span>{lang === 'uz' ? 'BUFER MASOFASI (Radius)' : 'BUFFER DISTANCE (Radius)'}</span>
          <span className="font-mono text-primary-600">{distance} metr</span>
        </div>
        <input
          type="range"
          min={15}
          max={120}
          step={5}
          value={distance}
          onChange={(e) => setDistance(Number(e.target.value))}
          className="w-full accent-primary-600"
        />
      </div>

      <div className="text-[11px] text-gray-500 leading-relaxed bg-gray-50 dark:bg-gray-900/30 p-3 rounded-xl border border-gray-100 dark:border-gray-750">
        ℹ️ <strong>Tushuntirish:</strong> Moviy rangdagi chiziqli doiralar bufer maydonini anglatadi. Qizil rang esa siz xaritaga kiritgan haqiqiy ob'ektdir. Slayderni surganingizda, bufer radiusi avtomatik ravishda kattalashadi.
      </div>
    </div>
  )
}

// ==========================================
// 2. GEOREFERENCE SIMULATOR COMPONENT
// ==========================================
function GeoreferenceSimulator({ lang }) {
  const [calibrated, setCalibrated] = useState(false)
  const [isCalibrating, setIsCalibrating] = useState(false)
  const [rmse, setRmse] = useState(45.2)

  const handleCalibrate = () => {
    setIsCalibrating(true)
    setCalibrated(false)

    // Simulate RMSE reduction over 3 seconds
    let progress = 45.2
    const interval = setInterval(() => {
      progress = Math.max(0.015, progress - (progress * 0.4))
      setRmse(Number(progress.toFixed(3)))
    }, 300)

    setTimeout(() => {
      clearInterval(interval)
      setRmse(0.012)
      setIsCalibrating(false)
      setCalibrated(true)
      toast.success(lang === 'uz' ? 'Xarita geobog\'landi!' : 'Map georeferenced successfully!')
    }, 2500)
  }

  const handleReset = () => {
    setCalibrated(false)
    setRmse(45.2)
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
        <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm">
          {lang === 'uz' ? 'Georeferencing Kalibratori' : 'Georeferencing Calibrator'}
        </h4>
        <button
          onClick={calibrated ? handleReset : handleCalibrate}
          disabled={isCalibrating}
          className="btn-primary text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1"
        >
          {isCalibrating ? (
            <RefreshCw size={13} className="animate-spin" />
          ) : calibrated ? (
            <RefreshCw size={13} />
          ) : (
            <Play size={13} />
          )}
          {isCalibrating
            ? (lang === 'uz' ? 'Bog\'lanmoqda...' : 'Calibrating...')
            : calibrated
            ? (lang === 'uz' ? 'Qayta tiklash' : 'Reset')
            : (lang === 'uz' ? 'Geobog\'lashni boshlash' : 'Run Georeference')}
        </button>
      </div>

      {/* Interactive visual panels */}
      <div className="grid grid-cols-2 gap-4">
        {/* Left Side: Uncalibrated scanned map */}
        <div className="border border-gray-150 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-950 p-3 h-48 flex flex-col justify-between relative overflow-hidden">
          <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-red-150 text-red-700 dark:bg-red-950/40 dark:text-red-400 rounded text-[9px] font-bold select-none uppercase">
            {lang === 'uz' ? 'Skaner (Koordinatasiz)' : 'Raw Scan'}
          </span>

          <div
            className={`w-28 h-28 bg-yellow-100 dark:bg-yellow-900/10 border-2 border-amber-600/30 rounded-lg p-2 mx-auto mt-6 transition-all duration-1000 relative flex flex-col justify-between shadow ${
              calibrated
                ? 'opacity-20 scale-90 translate-y-2 rotate-12 filter blur-[0.5px]'
                : isCalibrating
                ? 'animate-pulse'
                : 'rotate-3 translate-x-1'
            }`}
          >
            {/* Scanned map sketch */}
            <div className="w-full h-2 bg-amber-200 dark:bg-amber-800/40 rounded mt-1" />
            <div className="w-full h-8 bg-blue-150 dark:bg-blue-900/20 border-t border-b border-blue-200 dark:border-blue-800/30 flex items-center justify-center text-[8px] text-blue-500">
              ~ Daryo ~
            </div>
            <div className="w-4 h-4 bg-emerald-200 dark:bg-emerald-800/40 rounded self-end mb-1" />

            {/* GCP points */}
            <div className="absolute top-2 left-6 w-2.5 h-2.5 bg-red-500 rounded-full border border-white flex items-center justify-center text-[7px] text-white font-bold">1</div>
            <div className="absolute bottom-4 right-8 w-2.5 h-2.5 bg-red-500 rounded-full border border-white flex items-center justify-center text-[7px] text-white font-bold">2</div>
            <div className="absolute top-12 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border border-white flex items-center justify-center text-[7px] text-white font-bold">3</div>
          </div>
        </div>

        {/* Right Side: Georeferenced target map grid */}
        <div className="border border-gray-150 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-950 p-3 h-48 flex flex-col justify-between relative overflow-hidden select-none">
          <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400 rounded text-[9px] font-bold uppercase">
            {lang === 'uz' ? 'Target Grid (WGS84)' : 'Target Grid'}
          </span>

          {/* Grid lines */}
          <div className="absolute inset-0 grid grid-cols-5 grid-rows-5 pointer-events-none opacity-20">
            {Array.from({ length: 25 }).map((_, i) => (
              <div key={i} className="border-t border-l border-gray-500"></div>
            ))}
          </div>

          {/* Transformed map layer */}
          <div
            className={`w-28 h-28 bg-yellow-100/50 dark:bg-yellow-900/20 border border-green-500 rounded-lg p-2 mx-auto mt-6 transition-all duration-1000 absolute top-2 left-[50px] flex flex-col justify-between shadow ${
              calibrated
                ? 'scale-100 rotate-0 opacity-100 border-2 border-emerald-500 shadow-md'
                : 'opacity-0 scale-75 rotate-45'
            }`}
          >
            <div className="w-full h-2 bg-emerald-200 dark:bg-emerald-800/40 rounded mt-1" />
            <div className="w-full h-8 bg-blue-100 dark:bg-blue-900/10 border-t border-b border-blue-200 dark:border-blue-800/20 flex items-center justify-center text-[8px] text-blue-500 font-bold">
              DARYO
            </div>
            <div className="w-4 h-4 bg-green-200 dark:bg-green-800/40 rounded self-end mb-1" />

            {/* Aligned GCP points */}
            <div className="absolute top-3 left-4 w-2.5 h-2.5 bg-green-500 rounded-full border border-white flex items-center justify-center text-[7px] text-white font-bold shadow">1</div>
            <div className="absolute bottom-6 right-6 w-2.5 h-2.5 bg-green-500 rounded-full border border-white flex items-center justify-center text-[7px] text-white font-bold shadow">2</div>
            <div className="absolute top-10 right-4 w-2.5 h-2.5 bg-green-500 rounded-full border border-white flex items-center justify-center text-[7px] text-white font-bold shadow">3</div>
          </div>

          {/* Static target points helper */}
          {!calibrated && (
            <>
              <div className="absolute top-12 left-14 w-3.5 h-3.5 border-2 border-dashed border-green-500 rounded-full flex items-center justify-center text-[8px] text-green-500 font-bold">1</div>
              <div className="absolute bottom-12 right-16 w-3.5 h-3.5 border-2 border-dashed border-green-500 rounded-full flex items-center justify-center text-[8px] text-green-500 font-bold">2</div>
              <div className="absolute top-20 right-12 w-3.5 h-3.5 border-2 border-dashed border-green-500 rounded-full flex items-center justify-center text-[8px] text-green-500 font-bold">3</div>
            </>
          )}
        </div>
      </div>

      {/* Telemetry metadata */}
      <div className="p-4 bg-gray-50 dark:bg-gray-900/30 border border-gray-150 dark:border-gray-700 rounded-xl grid grid-cols-2 gap-4 text-xs select-none">
        <div>
          <p className="text-gray-400 font-semibold">{lang === 'uz' ? 'Nazorat Nuqtalari:' : 'Control Points (GCP):'}</p>
          <p className="font-bold text-gray-800 dark:text-gray-200 mt-0.5">3 ta joylashtirildi</p>
        </div>
        <div>
          <p className="text-gray-400 font-semibold">{lang === 'uz' ? 'O\'rtacha kvadratik xato:' : 'RMS Error (RMSE):'}</p>
          <p className={`font-mono font-bold mt-0.5 ${rmse < 0.05 ? 'text-green-500' : 'text-orange-500 animate-pulse'}`}>
            {rmse} {rmse > 0.05 ? 'm (Yuqori)' : 'm (Ideal)'}
          </p>
        </div>
      </div>

      <div className="text-[11px] text-gray-500 leading-relaxed bg-gray-50 dark:bg-gray-900/30 p-3 rounded-xl border border-gray-100 dark:border-gray-750">
        ℹ️ <strong>Tushuntirish:</strong> "Skaner" oynasidagi qizil nuqtalar (1, 2, 3) xaritadagi tasodifiy nuqtalar. "Geobog'lash" boshlanganda, bu nuqtalar koordinatadagi o'zlarining haqiqiy yashil nuqtalariga tortilib, raster tasvirni moslashtiradi (Warp).
      </div>
    </div>
  )
}

// ==========================================
// 3. UTM COORDINATE SIMULATOR COMPONENT
// ==========================================
function UtmSimulator({ lang }) {
  const [selectedZone, setSelectedZone] = useState(42)

  const zonesData = {
    41: {
      meridian: '63° E',
      coverage: '60° E - 66° E',
      regions: lang === 'uz' ? 'Qoraqalpog\'iston, Xorazm, Buxoro' : 'Каракалпакстан, Хорезм, Бухара'
    },
    42: {
      meridian: '69° E',
      coverage: '66° E - 72° E',
      regions: lang === 'uz' ? 'Toshkent, Samarqand, Navoiy, Qashqadaryo, Jizzax' : 'Ташкент, Самарканд, Навои, Кашкадарья, Джизак'
    },
    43: {
      meridian: '75° E',
      coverage: '72° E - 78° E',
      regions: lang === 'uz' ? 'Andijon, Namangan, Farg\'ona' : 'Андижан, Наманган, Фергана'
    }
  }

  const activeZone = zonesData[selectedZone]

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
        <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm">
          {lang === 'uz' ? 'UTM Zonalari bo\'yicha tahlil' : 'UTM Zone Visualizer'}
        </h4>
        <div className="flex gap-1">
          {[41, 42, 43].map((z) => (
            <button
              key={z}
              onClick={() => setSelectedZone(z)}
              className={`px-2.5 py-1 text-xs font-bold border rounded-lg transition-all ${
                selectedZone === z
                  ? 'bg-primary-500 border-primary-500 text-white shadow-sm font-extrabold'
                  : 'bg-gray-50 dark:bg-gray-900/60 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              Zone {z}N
            </button>
          ))}
        </div>
      </div>

      {/* SVG 3D-like cylinder sphere model */}
      <div className="border border-gray-150 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-950 p-4 flex items-center justify-center relative overflow-hidden h-44 select-none">
        <svg viewBox="0 0 200 200" className="w-36 h-36">
          {/* Sphere (Earth) */}
          <circle cx="100" cy="100" r="70" fill="none" stroke="rgba(156, 163, 175, 0.4)" strokeWidth="1" />
          <circle cx="100" cy="100" r="70" fill="none" stroke="rgba(156, 163, 175, 0.15)" />

          {/* Latitudinal grid lines */}
          <path d="M 30,100 Q 100,75 170,100" fill="none" stroke="rgba(156, 163, 175, 0.25)" strokeWidth="0.8" />
          <path d="M 30,100 Q 100,125 170,100" fill="none" stroke="rgba(156, 163, 175, 0.25)" strokeWidth="0.8" />
          <path d="M 35,60 Q 100,45 165,60" fill="none" stroke="rgba(156, 163, 175, 0.2)" strokeWidth="0.8" />
          <path d="M 35,140 Q 100,155 165,140" fill="none" stroke="rgba(156, 163, 175, 0.2)" strokeWidth="0.8" />

          {/* Equator */}
          <line x1="30" y1="100" x2="170" y2="100" stroke="rgba(156, 163, 175, 0.5)" strokeWidth="1.2" strokeDasharray="3,3" />

          {/* Longitudinal slices (Zonal) */}
          <path d="M 100,30 Q 80,100 100,170" fill="none" stroke="rgba(156, 163, 175, 0.3)" />
          <path d="M 100,30 Q 120,100 100,170" fill="none" stroke="rgba(156, 163, 175, 0.3)" />

          {/* Central meridian line for zones */}
          <path d="M 100,30 Q 50,100 100,170" fill="none" stroke="rgba(156, 163, 175, 0.15)" />
          <path d="M 100,30 Q 150,100 100,170" fill="none" stroke="rgba(156, 163, 175, 0.15)" />

          {/* Active Highlighted zone slice */}
          {selectedZone === 41 && (
            <path
              d="M 100,30 Q 75,100 100,170 Q 85,100 100,30"
              fill="rgba(59, 130, 246, 0.35)"
              stroke="#3b82f6"
              strokeWidth="1"
            />
          )}
          {selectedZone === 42 && (
            <path
              d="M 100,30 Q 88,100 100,170 Q 98,100 100,30"
              fill="rgba(59, 130, 246, 0.35)"
              stroke="#3b82f6"
              strokeWidth="1"
            />
          )}
          {selectedZone === 43 && (
            <path
              d="M 100,30 Q 98,100 100,170 Q 108,100 100,30"
              fill="rgba(59, 130, 246, 0.35)"
              stroke="#3b82f6"
              strokeWidth="1"
            />
          )}

          {/* Transverse Cylinder outline */}
          <rect x="80" y="20" width="40" height="160" fill="none" stroke="#ef4444" strokeWidth="1.2" strokeDasharray="4,2" rx="4" />
        </svg>

        <span className="absolute bottom-2 right-3 text-[9px] font-mono text-red-500 uppercase tracking-widest font-semibold">
          Transverse Cylinder
        </span>
      </div>

      {/* Zone telemetry data dashboard */}
      <div className="p-4 bg-gray-50 dark:bg-gray-900/30 border border-gray-150 dark:border-gray-700 rounded-xl space-y-2.5 text-xs select-none">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 font-semibold">{lang === 'uz' ? 'Markaziy Meridian:' : 'Central Meridian:'}</span>
          <span className="font-bold text-gray-800 dark:text-gray-200">{activeZone.meridian}</span>
        </div>
        <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-850 pt-2">
          <span className="text-gray-400 font-semibold">{lang === 'uz' ? 'Qamrab olgan kengligi:' : 'Longitude Coverage:'}</span>
          <span className="font-bold text-gray-800 dark:text-gray-200">{activeZone.coverage}</span>
        </div>
        <div className="flex flex-col border-t border-gray-100 dark:border-gray-850 pt-2">
          <span className="text-gray-400 font-semibold mb-1">{lang === 'uz' ? 'O\'zbekistondagi hududlar:' : 'Covered Regions (Uzbekistan):'}</span>
          <span className="font-bold text-primary-600 dark:text-primary-400 leading-relaxed text-[11px]">{activeZone.regions}</span>
        </div>
      </div>

      <div className="text-[11px] text-gray-500 leading-relaxed bg-gray-50 dark:bg-gray-900/30 p-3 rounded-xl border border-gray-100 dark:border-gray-750">
        ℹ️ <strong>Tushuntirish:</strong> UTM proyektsiyasi Yer sharini (sferik) yotiq silindr yordamida har biri 6° kenglikdagi 60 ta bo'ylama kesimga proyeksiyalaydi. Qizil ramka silindrning Yer shari bilan kesishish tekisligidir.
      </div>
    </div>
  )
}
