import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin, Compass, Percent, Layers, CheckCircle2, RotateCcw, HelpCircle, Ruler, Box, Activity, CheckSquare, Settings, Database, Server, Image, ShieldAlert, ExternalLink, Globe, Building2, Cpu, TreePine } from 'lucide-react'

// Simple Haversine formula to compute distance in km
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export default function InteractivePracticalTask({ topicId, lang, onComplete, isAlreadyCompleted }) {
  const navigate = useNavigate()
  const [taskState, setTaskState] = useState('idle') // idle, active, success, fail
  const [feedbackMsg, setFeedbackMsg] = useState('')
  const [attempts, setAttempts] = useState(0)

  // Input states for various tasks
  const [topo1Input, setTopo1Input] = useState('')
  const [topo2Input, setTopo2Input] = useState('')
  const [azimuthInput, setAzimuthInput] = useState('')
  const [slopeInput, setSlopeInput] = useState('')
  const [topo6Deg, setTopo6Deg] = useState('')
  const [topo6Min, setTopo6Min] = useState('')
  const [topo7Input, setTopo7Input] = useState('')
  const [topo8Input, setTopo8Input] = useState('')

  // Kartografiya states
  const [karto3Selection, setKarto3Selection] = useState('')
  const [karto5Input, setKarto5Input] = useState('')
  const [karto6Selection, setKarto6Selection] = useState('')
  const [karto7Order, setKarto7Order] = useState([])
  const [karto8Input, setKarto8Input] = useState('')
  const [karto9Selection, setKarto9Selection] = useState('')

  // New GIS states
  const [gis1Sorted, setGis1Sorted] = useState([]) // sorted list of items
  const [gis1CurrentIndex, setGis1CurrentIndex] = useState(0)
  const [gis5Checks, setGis5Checks] = useState({
    req: false, layers: false, crs: false, bbox: false, format: false, dev: false, color: false
  })
  const [gis6Selection, setGis6Selection] = useState('')
  const [gis7Input, setGis7Input] = useState('')
  const [gis11Checks, setGis11Checks] = useState({
    title: false, legend: false, scale: false, north: false, cpu: false, internet: false
  })
  const [gis13Input, setGis13Input] = useState('')

  // GIS-4: Raster vs Vector classification
  const [gis4Classified, setGis4Classified] = useState({})
  const [gis4Score, setGis4Score] = useState(0)

  // GIS-10: Buffer analysis map
  const gis10MapRef = useRef(null)
  const gis10LeafletMap = useRef(null)
  const gis10BufferLayers = useRef([])
  const [gis10SelectedCity, setGis10SelectedCity] = useState(null)
  const [gis10Input, setGis10Input] = useState('')

  // GIS-12: ArcGIS 3D sandbox task
  const [gis12ScoreInput, setGis12ScoreInput] = useState('')

  // Matching game states for default and matched tasks
  const [dragItems, setDragItems] = useState([])
  const [matches, setMatches] = useState({})
  const [selectedTerm, setSelectedTerm] = useState(null)

  const mapRef = useRef(null)
  const leafletMap = useRef(null)
  const leafletMarker = useRef(null)
  const polygonPoints = useRef([])
  const leafletPolygon = useRef(null)

  // Translation Strings
  const localText = {
    uz: {
      startBtn: "Amaliy topshiriqni boshlash",
      resetBtn: "Qaytadan urinib ko'rish",
      submitBtn: "Tekshirish",
      successMsg: "Barakalla! Topshiriq to'g'ri va muvaffaqiyatli bajarildi! 🎉",
      incorrectMsg: "Javob noto'g'ri, qaytadan urinib ko'ring.",
      attemptsText: "Urinishlar",
      clue: "Maslahat",
      completedText: "Topshiriq topshirildi! ✅",

      // topo-1
      topo1_title: "Yer ellipsoidini hisoblash",
      topo1_desc: "Krasovskiy ellipsoidida Yerning ekvator radiusi a = 6,378,245 metr, qutb radiusi esa b = 6,356,863 metr qabul qilingan. Ekvator va qutb radiusi o'rtasidagi farqni metrlarda hisoblang.",
      topo1_label: "Farqni kiriting (metrda):",

      // topo-2
      topo2_title: "Masshtab bo'yicha masofa hisoblash",
      topo2_desc: "Chizg'ich yordamida 1:50 000 masshtabdagi xaritada ikki ob'ekt orasidagi masofa 5.5 sm deb o'lchandi. Joydagi haqiqiy masofani metrlarda hisoblang.",
      topo2_label: "Joydagi masofani kiriting (metrda):",

      // topo-3
      topo3_title: "Xaritadan Registon maydonini toping",
      topo3_desc: "Quyidagi interaktiv xaritadan Samarqand shahridagi tarixiy Registon maydoni joylashgan joyni toping va ustiga bosing.",
      topo3_clue1: "Toshkentdan janubiy-g'arbga tomon qarab harakatlaning.",
      topo3_clue2: "Xaritani yaqinlashtiring va Samarqand shahar markazini qidiring.",

      // topo-4
      topo4_title: "Azimut burchagini aniqlash",
      topo4_desc: "Shimol yo'nalishi (0°)ga nisbatan qizil bayroqcha o'rnatilgan ob'ektgacha bo'lgan azimut burchagini aniqlang (kompas siferblatidan foydalaning) va gradus qiymatini kiriting.",
      topo4_label: "Azimut burchagini kiriting (gradusda, masalan: 120):",

      // topo-5
      topo5_title: "Relefdan qiyalik foizini hisoblash",
      topo5_desc: "Tog' qiyaligida ikkita nuqta ko'rsatilgan: A nuqta (balandligi 160 m) va B nuqta (balandligi 120 m). Ular orasidagi gorizontal masofa 500 metr. Qiyalik foizini (%) hisoblang: i = (H_A - H_B) / d * 100",
      topo5_label: "Qiyalik qiymatini foizda (%) kiriting:",

      // topo-6
      topo6_title: "Teodolit limbi ko'rsatkichini o'qish",
      topo6_desc: "Quyida teodolitning burchak o'lchov oynasi keltirovchi limbning ko'rsatgan gorizontal burchagini daraja va daqiqalarda o'qing.",
      topo6_label_deg: "Daraja (°):",
      topo6_label_min: "Daqiqa ('):",

      // topo-7
      topo7_title: "Teodolit poligonining burchak yopilish xatosi",
      topo7_desc: "Yopiq to'rtburchakli poligon teodolit burchak o'lchovlari natijalari: A = 89°58', B = 90°01', C = 89°59', D = 90°04'. Poligonning burchak yopilish xatosi necha daqiqa (') ekanligini aniqlang.",
      topo7_label: "Yopilish xatosini kiriting (faqat son, masalan: +2):",

      // topo-8
      topo8_title: "Geometrik nivelirlash balandligini hisoblash",
      topo8_desc: "Geometrik nivelirlashda A nuqtadagi reyka o'qishi (orqa) a = 1650 mm, B nuqtadagi reyka o'qishi (oldingi) b = 1220 mm. A nuqtaning absolyut balandligi H_A = 102.50 m bo'lsa, B nuqtaning absolyut balandligini metrda hisoblang.",
      topo8_label: "B nuqta balandligini kiriting (metrda, masalan: 102.93):",

      // karto-1
      karto1_title: "Atlas turlarini tasniflash",
      karto1_desc: "Chap tomondagi atlas turlarini o'ng tomondagi mos ta'riflar bilan bog'lang.",
      karto1_terms: {
        "Milliy atlas": "Mamlakatning tabiati, aholisi va iqtisodiyotini har tomonlama ko'rsatadigan yirik asar",
        "Maktab atlasi": "O'quv dasturlariga moslashtirilgan, soddalashtirilgan kartografik tasvirlar to'plami",
        "Sayohat atlasi": "Turistlar va yo'llar tarmog'i aks etgan, amaliy foydalanishga mo'ljallangan atlas"
      },

      // karto-2
      karto2_title: "Matematik asosi: Buzilish turlari",
      karto2_desc: "Matematik proyeksiyalarni ularning maydon va burchaklarni saqlab qolish xususiyatiga ko'ra bog'lang.",
      karto2_terms: {
        "Konform proyeksiyalar": "Burchaklarni o'zgartirmay saqlaydi (xaritadagi burchaklar yerga teng)",
        "Ekvivalent proyeksiyalar": "Maydonlar nisbatini saqlab qoladi (hududlar maydonini o'lchashga qulay)",
        "Ekvidistant proyeksiyalar": "Asosiy yo'nalishlar bo'ylab masofani proyeksiyasiz saqlaydi"
      },

      // karto-3
      karto3_title: "Hududga mos proyeksiya tanlash",
      karto3_desc: "Indoneziya va Ekvator bo'yicha cho'zilgan hududlarni tasvirlash uchun qaysi turdagi xarita proyeksiyasi eng kam buzilish beradi?",
      karto3_opt1: "Silindrli proyeksiya",
      karto3_opt2: "Konusli proyeksiya",
      karto3_opt3: "Azimutli proyeksiya",

      // karto-4
      karto4_title: "Kartografik tasvirlash usullarini moslash",
      karto4_desc: "Chap tomondagi geografik hodisalarni ularni xaritada ifodalash uchun ishlatiladigan eng mos usul bilan bog'lang.",
      karto4_terms: {
        "Aholi zichligi xaritasi (ranglar intensivligi)": "Kartogramma usuli",
        "Daraxt turlari tarqalgan hudud (areal)": "Areallar usuli",
        "Shahar aholi soni (aylana o'lchami)": "Kartodiagramma usuli",
        "Iqlim xaritasidagi harorat chiziqlari": "Izochiziqlar usuli"
      },

      // karto-5
      karto5_title: "Relyef gorizontallaridan balandlik aniqlash",
      karto5_desc: "SVG tasvirda tog' gorizontallari 100m, 150m va 200m balandlik bilan ko'rsatilgan. Nuqta X gorizontallar (150m va 200m) o'rtasida joylashgan. Uning taxminiy balandligini metrda aniqlang.",
      karto5_label: "Balandlikni metrda kiriting (masalan: 175):",

      // karto-6
      karto6_title: "Kartografik generalizatsiya",
      karto6_desc: "Xarita masshtabi kichraytirilganda, mayda daryo burilishlarini silliqlashtirish va faqat asosiy tarmoqlarni qoldirish jarayoni nima deb ataladi?",
      karto6_opt1: "Koordinata siljitish",
      karto6_opt2: "Tanlash va umumlashtirish (Generalizatsiya)",
      karto6_opt3: "Masshtabni yiriklashtirish",

      // karto-7
      karto7_title: "Xarita tuzish bosqichlari tartibi",
      karto7_desc: "Quyidagi xarita tuzish bosqichlarini to'g'ri ketma-ketlikda joylashtiring. (1 dan 5 gacha sonlarni mos ravishda kiriting).",
      karto7_step1: "Loyiha konsepsiyasi va maqsadini ishlab chiqish",
      karto7_step2: "Matematik asosni tanlash (proyeksiyalar)",
      karto7_step3: "Manba ma'lumotlarini yig'ish va qayta ishlash",
      karto7_step4: "Xarita mazmunini chizish va tahrirlash",
      karto7_step5: "Raqamli nashr qilish va chop etish",

      // karto-8
      karto8_title: "Xaritadan foydalanish: Masofa o'lchash",
      karto8_desc: "Xarita sonli masshtabi 1:25 000 (1 sm da 250 m). Xaritada ikki shahar orasidagi masofa chizg'ichda 4 sm deb o'lchandi. Joydagi haqiqiy masofani metrlarda aniqlang.",
      karto8_label: "Masofani metrlarda kiriting:",

      // karto-9
      karto9_title: "Xarita sifatini baholash (Metadata)",
      karto9_desc: "Quyidagi ma'lumotlardan qaysi biri xaritaning ishonchliligi, aniqligi va sifati haqida ma'lumot beruvchi metama'lumot (metadata) hisoblanadi?",
      karto9_opt1: "Xarita narxi va dizaynerning kompyuter markasi",
      karto9_opt2: "Yaratilgan sana, koordinatalar tizimi (CRS) va ma'lumotlar manbayi",
      karto9_opt3: "Xaritadagi barcha ranglar va chiziqlar ro'yxati",

      // gis-1
      gis1_title: "GATning 5 ta asosiy komponenti",
      gis1_desc: "Quyidagi atamani mos keluvchi GAT komponentiga yo'naltiring.",
      gis1_comp1: "Apparat ta'minot",
      gis1_comp2: "Dastur ta'minot",
      gis1_comp3: "Ma'lumotlar",
      gis1_comp4: "Metodlar",
      gis1_comp5: "Foydalanuvchilar",
      gis1_items: [
        { name: "GPS qabul qilgich", cat: "c1" },
        { name: "QGIS dasturi", cat: "c2" },
        { name: "Shapefile formati", cat: "c3" },
        { name: "Interpolatsiya tahlili", cat: "c4" },
        { name: "GIS Tahlilchi", cat: "c5" }
      ],

      // gis-2
      gis2_title: "Interaktiv geokodlash",
      gis2_desc: "Geografik manzilni uning koordinata qiymatlari bilan to'g'ri bog'lang.",
      gis2_terms: {
        "Toshkent shahar markazi (Amir Temur)": "41.311° N, 69.240° E",
        "London (Grinvich rasadxonasi)": "51.507° N, -0.127° W",
        "Nyu-York (Tayms-skver)": "40.712° N, -74.006° W"
      },

      // gis-4
      gis4_title: "Vektor va Raster ma'lumotlarni tasniflash",
      gis4_desc: "Quyidagi 6 ta geografik ma'lumot namunasini 'Vektor' yoki 'Raster' turlaridan biriga tasniflang. Har bir to'g'ri tasniflash 1 ball beradi (maks. 6 ball).",
      gis4_items: [
        { id: 'a', label: '📍 GPS yordamida olingan nuqtalar (koordinatalar)', correct: 'vector' },
        { id: 'b', label: '🛰️ Landsat-8 sun\'iy yo\'ldosh tasviri (piksellar)', correct: 'raster' },
        { id: 'c', label: '🌊 Daryo va kanal chiziqli konfiguratsiyasi', correct: 'vector' },
        { id: 'd', label: '🏔️ DEM — Raqamli Balandlik Modeli (grid)', correct: 'raster' },
        { id: 'e', label: '🏙️ Shahar chegara ko\'pburchagi (polygon)', correct: 'vector' },
        { id: 'f', label: '🌡️ Harorat interpolatsiyasi (issiqlik xaritasi)', correct: 'raster' },
      ],
      gis4_vectorBtn: "Vektor",
      gis4_rasterBtn: "Raster",
      gis4_score: "Ball",
      gis4_submitLabel: "Barcha kartochkalar tasniflanmadi",

      // gis-5
      gis5_title: "WMS server so'rov parametrlari",
      gis5_desc: "WMS (Web Map Service) serverdan xarita tasvirini olish so'rovida qatnashishi majburiy bo'lgan 5 ta asosiy parametrni tanlang.",
      gis5_opt1: "REQUEST=GetMap (Majburiy)",
      gis5_opt2: "LAYERS (Majburiy)",
      gis5_opt3: "CRS/SRS (Majburiy)",
      gis5_opt4: "BBOX (Majburiy)",
      gis5_opt5: "FORMAT (Majburiy)",
      gis5_opt6: "DEVELOPER_KEY (Ixtiyoriy)",
      gis5_opt7: "BACKGROUND_COLOR (Ixtiyoriy)",

      // gis-6
      gis7_title: "Fazoviy SQL so'rovini tuzish",
      gis7_desc: "Uylar (buildings) va bog'lar (parks) jadvallari berilgan. 'Amir Temur bog'i' hududiga to'liq kiruvchi binolar ID raqamini aniqlash uchun to'g'ri SQL so'rovini tanlang.",
      gis7_opt1: "SELECT buildings.id FROM buildings, parks WHERE ST_Within(buildings.geom, parks.geom) AND parks.name = 'Amir Temur bog\'i'",
      gis7_opt2: "SELECT * FROM buildings WHERE ST_Distance(geom, 'Amir Temur bog\'i')",
      gis7_opt3: "SELECT * FROM buildings JOIN parks ON ST_Buffer(buildings.geom)",

      // gis-7
      gis8_title: "Relatsion ma'lumotlar bazasi bog'lanishi",
      gis8_desc: "Uchastkalar kadastri (cadastre: parcel_id, area, address) va mulkdorlar (owners: owner_id, owner_name, parcel_id) jadvallarini bir-biriga bog'lash uchun qaysi umumiy ustun (Primary Key) ishlatiladi?",
      gis8_label: "Bog'lovchi ustun nomini kiriting:",

      // gis-8
      gis9_title: "Geovizuallashtirish Symbology turlari",
      gis9_desc: "Geografik hodisalarni ularga mos xarita ramplari/tasvirlash uslubi bilan bog'lang.",
      gis9_terms: {
        "Aholi zichligi (tartibli o'sish)": "Sequential (Och rangdan to'q ranggacha / Gradient)",
        "Harorat anomaliyasi (musbat va manfiy)": "Diverging (Moviy va Qizil ranglar / Kontrastli)",
        "Tuproq turlari (kategoriyalangan)": "Qualitative (Har xil ranglar / Tasodifiy)"
      },

      // gis-9
      gis10_title: "Fazoviy interpolatsiya metodlari",
      gis10_desc: "Fazoviy interpolatsiya metodlarini ularning ta'riflari bilan bog'lang.",
      gis10_terms: {
        "IDW": "Masofaga teskari og'irlik - yaqin nuqtalarga ko'proq ta'sir beruvchi metod",
        "Kriging": "Geostatistik interpolatsiya - fazoviy korrelyatsiyani hisobga oladi",
        "Spline": "Silliq egri chiziq yuzasini hosil qiluvchi matematik metod"
      },

      // gis-11
      gis12_title: "Xarita sahifasi (Layout) elementlari",
      gis12_desc: "Eksport qilishga tayyor xaritada mavjud bo'lishi shart bo'lgan 4 ta majburiy kartografik elementni tanlang.",
      gis12_opt1: "Xarita sarlavhasi (Title)",
      gis12_opt2: "Xarita afsonasi (Legend)",
      gis12_opt3: "Shimol ko'rsatkichi (North Arrow)",
      gis12_opt4: "Masshtab chizig'i (Scale Bar)",
      gis12_opt5: "Kompyuter video kartasi modeli",
      gis12_opt6: "Internet tarmog'i tezligi",

      // gis-10
      gis11_title: "Buffer Tahlili — Shahar atrofida Muhofaza Zonasi",
      gis11_desc: "Quyidagi interaktiv xaritada O'zbekiston shaharlari ko'rsatilgan. Biror shahar ustiga bosing — uning atrofida 50 km va 100 km bufer zonalari chiziladi. Keyin bu shaharning nomini kiriting va topshiriqni tasdiqlang.",
      gis11_label: "Bosgan shahar nomini kiriting:",
      gis11_submit: "Tasdiqlash",
      gis11_hint: "Maslahat: Xaritada ko'rsatilgan shaharlardan birini tanlang (Toshkent, Samarqand, Buxoro yoki Namangan).",

      // gis-12
      gis14_title: "ArcGIS 3D Sandbox — Aqlli Shahar Loyihalash",
      gis14_desc: "Bu amaliy topshiriq platformaning ArcGIS 3D Sandbox sahifasida bajariladi. Quyidagi vazifani bajaring:",
      gis14_task: "3D xaritada kamida 5 ta bino, 3 ta shamol turbinasi va 8 ta daraxt joylashtiring. Loyihangizni saqlang va ochiq meydonda umumiy ob'ektlar sonini hisoblang.",
      gis14_scoreLabel: "Loyihangizdagi jami ob'ektlar sonini kiriting:",
      gis14_openBtn: "ArcGIS 3D Sandbox ga o'tish →",
      gis14_hint: "Maslahat: 3D sahifasida Edit Mode tugmasini bosib ob'ektlar qo'shing. Maqsad: kamida 16 ta ob'ekt (5 bino + 3 turbin + 8 daraxt).",

      // gis-13
      gis17_title: "NDVI vegetatsiya indeksini hisoblash",
      gis17_desc: "Pikselning infraqizil (NIR) qaytishi 0.60 va qizil (RED) qaytishi 0.20 ga teng. NDVI vegetatsiya indeksini hisoblang: (NIR - RED) / (NIR + RED)",
      gis17_label: "NDVI qiymatini kiriting (masalan: 0.5):",

      // gis-14
      gis18_title: "Kosmik kanallar (Band) kombinatsiyalari",
      gis18_desc: "Landsat-8 sun'iy yo'ldosh kanallari kombinatsiyasini uning tasvirlash maqsadi bilan bog'lang.",
      gis18_terms: {
        "Tabiiy ranglar (Natural Color)": "4, 3, 2 kanallar",
        "Sun'iy o'simlik ranglari (False Color Infrared)": "5, 4, 3 kanallar",
        "Qurilgan hududlar (Shortwave Infrared)": "7, 6, 4 kanallar"
      },

      // gis-15
      gis6_title: "Topologik xatolar va tahlil",
      gis6_desc: "Vektor ma'lumotlar bazasidagi topologik xato turlarini ularning tavsifi bilan bog'lang.",
      gis6_terms: {
        "Overlap (Ustma-ust tushish)": "Ikki qo'shni yer uchastkasi chegaralari bir-biri ustiga chiqib qolishi",
        "Gap (Bo'shliq)": "Chegaralar orasida keraksiz bo'sh joylar qolib ketishi",
        "Dangle (Osilgan chiziq)": "Chiziqning boshqa chiziq bilan tutashmay ochiq qolgan uchi"
      },

      // gis-13
      gis13_title: "3D Balandlik Modellari (DEM/DTM/DSM)",
      gis13_desc: "Balandlik modellarining turlarini ularning to'g'ri ta'riflari bilan bog'lang.",
      gis13_terms: {
        "DEM (Digital Elevation Model)": "Faqat yer yuzasi relyefi balandliklarining raqamli modeli",
        "DSM (Digital Surface Model)": "Yer yuzasidagi ob'ektlar (binolar, daraxtlar) bilan birgalikdagi balandlik modeli",
        "TIN (Triangulated Irregular Network)": "Relyefni uchburchaklar to'plami yordamida vektor shaklida ifodalash"
      },

      // gis-15
      gis15_title: "GATda boshqaruvni tashkillashtirish",
      gis15_desc: "GAT loyihalarini boshqarish va apparat ta'minotiga doir atamalarni moslashtiring.",
      gis15_terms: {
        "Apparat ta'minot": "Kompyuter, server, skaner, GPS va plotter kabi jismoniy qurilmalar",
        "Ekspert tizim": "Mantiqiy qoidalar asosida fazoviy qarorlar qabul qiluvchi aqlli tizim",
        "Litsenziyali GAT": "Foydalanish uchun haq to'lanadigan litsenziyaga ega dastur (masalan, ArcGIS)"
      },

      // gis-16
      gis16_title: "GATning zamonaviy rivojlanishi (Web/Cloud/Mobile)",
      gis16_desc: "Zamonaviy GAT texnologiyalarining yo'nalishlarini moslashtiring.",
      gis16_terms: {
        "WebGAT": "Brauzer orqali xaritalarni onlayn tarqatish va tahlil qilish tizimi",
        "Mobil GAT": "Maydonda oflayn geoma'lumot to'plash uchun mobil ilovalar (masalan, QField)",
        "Bulutli GAT": "Ma'lumotlarni internetdagi serverlarda saqlash va tahlil qilish texnologiyasi"
      },

      // gis-19
      gis19_title: "Aerokosmik suratlarni qayta ishlash",
      gis19_desc: "Aerokosmik suratlarni qayta ishlash va tahlil qilish atamalarini bog'lang.",
      gis19_terms: {
        "Ortorektifikatsiya": "Aerokosmik suratdagi relyef va kamera og'ishi xatolarini to'g'rilash",
        "Nazoratli klassifikatsiya": "Namunaviy piksellar yordamida tasvirni sinflarga ajratish",
        "Confusion Matrix": "Klassifikatsiya aniqligi va xatoliklarini baholash jadvali"
      },

      // Default match puzzle
      def_title: "GAT va Kartografiya atamalari mosligini toping",
      def_desc: "Chap tomondagi atamalardan birini tanlang va o'ng tomondagi mos ta'rifga bosing.",
      def_terms: {
        "Geoid": "Yerning o'rtacha dengiz sathiga mos keluvchi haqiqiy shakli",
        "Krasovskiy": "O'zbekistonda geodezik o'lchovlar uchun qabul qilingan ellipsoid modeli",
        "QGIS": "Bepul va ochiq kodli geografik axborot tizimi dasturiy ta'minoti",
        "Azimut": "Shimoliy yo'nalishdan soat strelkasi bo'yicha o'lchanadigan burchak",
        "Nivelirlash": "Er ustidagi nuqtalarning balandlik farqini aniqlash jarayoni"
      }
    },
    ru: {
      startBtn: "Начать практическое задание",
      resetBtn: "Попробовать снова",
      submitBtn: "Проверить",
      successMsg: "Отлично! Задание выполнено верно! 🎉",
      incorrectMsg: "Неверно, попробуйте еще раз.",
      attemptsText: "Попытки",
      clue: "Подсказка",
      completedText: "Задание выполнено! ✅",

      // topo-1
      topo1_title: "Расчет эллипсоида Земли",
      topo1_desc: "В эллипсоиде Красовского экваториальный радиус Земли a = 6 378 245 метров, а полярный радиус b = 6 356 863 метров. Рассчитайте разницу между экваториальным и полярным радиусами в метрах.",
      topo1_label: "Введите разницу (в метрах):",

      // topo-2
      topo2_title: "Расчет расстояния по масштабу",
      topo2_desc: "На карте масштаба 1:50 000 расстояние между двумя объектами измерено линейкой и составляет 5.5 см. Вычислите реальное расстояние на местности в метрах.",
      topo2_label: "Введите расстояние на местности (в метрах):",

      // topo-3
      topo3_title: "Найдите площадь Регистан на карте",
      topo3_desc: "На интерактивной карте найдите местоположение исторической площади Регистан в Самарканде и кликните по ней.",
      topo3_clue1: "Двигайтесь на юго-запад от Ташкента.",
      topo3_clue2: "Приблизьте карту и найдите центр Самарканда.",

      // topo-4
      topo4_title: "Определение азимута",
      topo4_desc: "Определите угол азимута относительно севера (0°) до красного флажка и введите значение в градусах.",
      topo4_label: "Введите азимут (в градусах, например: 120):",

      // topo-5
      topo5_title: "Расчет уклона рельефа",
      topo5_desc: "На склоне отмечены две точки: А (высота 160 м) и Б (высота 120 м). Горизонтальное расстояние между ними 500 метров. Рассчитайте процент уклона (grade %): i = (H_A - H_B) / d * 100",
      topo5_label: "Введите величину уклона в процентах (%):",

      // topo-6
      topo6_title: "Считывание показаний лимба теодолита",
      topo6_desc: "Ниже приведено окно отсчетного устройства теодолита. Считайте показание горизонтального угла в градусах и минутах.",
      topo6_label_deg: "Градусы (°):",
      topo6_label_min: "Минуты ('):",

      // topo-7
      topo7_title: "Угловая невязка теодолитного хода",
      topo7_desc: "Измеренные углы замкнутого четырехугольного полигона составляют: A = 89°58', B = 90°01', C = 89°59', D = 90°04'. Определите угловую невязку полигона в минутах (').",
      topo7_label: "Введите невязку (только число, например: +2):",

      // topo-8
      topo8_title: "Расчет высоты при геометрическом нивелировании",
      topo8_desc: "При геометрическом нивелировании отсчет по рейке на точке А (задний) a = 1650 мм, отсчет по рейке на точке Б (передний) b = 1220 мм. Абсолютная высота точки А составляет H_A = 102.50 м. Вычислите абсолютную высоту точки Б в метрах.",
      topo8_label: "Введите высоту точки Б (в метрах, например: 102.93):",

      // karto-1
      karto1_title: "Классификация атласов",
      karto1_desc: "Сопоставьте типы атласов слева с их описаниями справа.",
      karto1_terms: {
        "Национальный атлас": "Крупное научно-справочное произведение, всесторонне характеризующее страну",
        "Школьный атлас": "Сборник упрощенных карт, адаптированный под учебную программу",
        "Дорожный атлас": "Атлас для автомобилистов и туристов с дорожной сетью и сервисом"
      },

      // karto-2
      karto2_title: "Математическая основа: Виды искажений",
      karto2_desc: "Сопоставьте картографические проекции по характеру сохраняемых свойств площадей и углов.",
      karto2_terms: {
        "Равноугольные проекции": "Сохраняют углы без искажений (углы на карте равны углам на местности)",
        "Равновеликие проекции": "Сохраняют пропорции площадей (удобны для вычисления площадей)",
        "Произвольные проекции": "Сохраняют масштаб расстояний по некоторым выделенным направлениям"
      },

      // karto-3
      karto3_title: "Выбор проекции для территории",
      karto3_desc: "Какая картографическая проекция дает наименьшие искажения для изображения Индонезии и приэкваториальных широт?",
      karto3_opt1: "Цилиндрическая проекция",
      karto3_opt2: "Коническая проекция",
      karto3_opt3: "Азимутальная проекция",

      // karto-4
      karto4_title: "Методы картографического изображения",
      karto4_desc: "Сопоставьте географическое явление с наиболее подходящим методом его отображения на карте.",
      karto4_terms: {
        "Плотность населения (интенсивность по границам)": "Метод картограммы",
        "Ареал произрастания хвойных лесов": "Метод ареалов",
        "Численность городов (круговые диаграммы)": "Метод картодиаграммы",
        "Линии одинаковых температур на климатической карте": "Метод изотерм (изолиний)"
      },

      // karto-5
      karto5_title: "Определение высоты по горизонталям",
      karto5_desc: "На чертеже горизонтали холма показаны отметками 100м, 150м и 200м. Точка Х находится ровно посередине между горизонталями 150м и 200м. Определите ее высоту в метрах.",
      karto5_label: "Введите высоту в метрах (например: 175):",

      // karto-6
      karto6_title: "Картографическая генерализация",
      karto6_desc: "Как называется процесс сглаживания изгибов рек и отбора только главных при уменьшении масштаба?",
      karto6_opt1: "Сдвиг координат",
      karto6_opt2: "Отбор и обобщение (Генерализация)",
      karto6_opt3: "Увеличение детальности",

      // karto-7
      karto7_title: "Этапы создания карты",
      karto7_desc: "Расположите этапы создания карты в правильной последовательности (введите цифры от 1 до 5).",
      karto7_step1: "Разработка концепции и назначения проекта",
      karto7_step2: "Выбор математической основы (проекции)",
      karto7_step3: "Сбор и обработка источников данных",
      karto7_step4: "Составление и редактирование содержания карты",
      karto7_step5: "Издание и печать тиража",

      // karto-8
      karto8_title: "Использование карт: Расчет расстояния",
      karto8_desc: "Численный масштаб карты 1:25 000 (в 1 см - 250 м). Расстояние на карте между городами составляет 4 см. Вычислите реальное расстояние на местности в метрах.",
      karto8_label: "Введите расстояние в метрах:",

      // karto-9
      karto9_title: "Оценка качества карт (Метаданные)",
      karto9_desc: "Что из следующего является метаданными карты, помогающими оценить ее качество, точность и достоверность?",
      karto9_opt1: "Цена карты и марка компьютера картографа",
      karto9_opt2: "Дата создания, система координат (CRS) и источник исходных данных",
      karto9_opt3: "Список всех цветов и условных линий на карте",

      // gis-1
      gis1_title: "5 ключевых компонентов ГИС",
      gis1_desc: "Распределите элемент в соответствующую категорию компонентов ГИС.",
      gis1_comp1: "Аппаратное обеспечение",
      gis1_comp2: "Программное обеспечение",
      gis1_comp3: "Данные",
      gis1_comp4: "Методы",
      gis1_comp5: "Пользователи",
      gis1_items: [
        { name: "Приемник GPS", cat: "c1" },
        { name: "Программа QGIS", cat: "c2" },
        { name: "Формат Shapefile", cat: "c3" },
        { name: "Интерполяция данных", cat: "c4" },
        { name: "Аналитик ГИС", cat: "c5" }
      ],

      // gis-2
      gis2_title: "Интерактивное геокодирование",
      gis2_desc: "Сопоставьте географический адрес с его координатами на карте.",
      gis2_terms: {
        "Центр Ташкента (Амир Темур)": "41.311° N, 69.240° E",
        "Лондон (Гринвичская обсерватория)": "51.507° N, -0.127° W",
        "Нью-Йорк (Таймс-сквер)": "40.712° N, -74.006° W"
      },

      // gis-5
      gis5_title: "Параметры WMS запроса",
      gis5_desc: "Выберите 5 обязательных параметров для успешного GetMap запроса к WMS серверу.",
      gis5_opt1: "REQUEST=GetMap (Обязательно)",
      gis5_opt2: "LAYERS (Обязательно)",
      gis5_opt3: "CRS/SRS (Обязательно)",
      gis5_opt4: "BBOX (Обязательно)",
      gis5_opt5: "FORMAT (Обязательно)",
      gis5_opt6: "DEVELOPER_KEY (Опционально)",
      gis5_opt7: "BACKGROUND_COLOR (Опционально)",

      // gis-6
      gis7_title: "Составление пространственного SQL запроса",
      gis7_desc: "Даны таблицы зданий (buildings) и парков (parks). Выберите правильный SQL запрос для нахождения ID зданий, находящихся внутри парка 'Amir Temur bog\'i'.",
      gis7_opt1: "SELECT buildings.id FROM buildings, parks WHERE ST_Within(buildings.geom, parks.geom) AND parks.name = 'Amir Temur bog\'i'",
      gis7_opt2: "SELECT * FROM buildings WHERE ST_Distance(geom, 'Amir Temur bog\'i')",
      gis7_opt3: "SELECT * FROM buildings JOIN parks ON ST_Buffer(buildings.geom)",

      // gis-7
      gis8_title: "Связь реляционной базы данных",
      gis8_desc: "Какой общий столбец (Primary Key) используется для объединения таблиц кадастра (cadastre: parcel_id, area, address) и владельцев (owners: owner_id, owner_name, parcel_id)?",
      gis8_label: "Введите название ключевого столбца:",

      // gis-8
      gis9_title: "Стили визуализации ГИС",
      gis9_desc: "Сопоставьте географическое явление со стилем шкалы отображения.",
      gis9_terms: {
        "Плотность населения (возрастание)": "Sequential (От светлого к темному / Градиент)",
        "Аномалия температур (плюс и минус)": "Diverging (Синий и красный / Контрастный)",
        "Типы почв (категории)": "Qualitative (Разные цвета / Случайный)"
      },

      // gis-9
      gis10_title: "Методы пространственной интерполяции",
      gis10_desc: "Сопоставьте методы пространственной интерполяции с их описаниями.",
      gis10_terms: {
        "IDW": "Обратно взвешенные расстояния - больший вес ближайшим точкам",
        "Kriging": "Геостатистическая интерполяция с учетом пространственной корреляции",
        "Spline": "Математический метод получения гладкой кривой поверхности"
      },

      // gis-11
      gis12_title: "Элементы компоновки карты (Layout)",
      gis12_desc: "Выберите 4 обязательных картографических элемента, которые должны присутствовать на готовом макете карты.",
      gis12_opt1: "Название карты (Title)",
      gis12_opt2: "Легенда карты (Legend)",
      gis12_opt3: "Указатель севера (North Arrow)",
      gis12_opt4: "Линейный масштаб (Scale Bar)",
      gis12_opt5: "Модель видеокарты компьютера",
      gis12_opt6: "Скорость интернет-соединения",

      // gis-13
      gis17_title: "Расчет вегетационного индекса NDVI",
      gis17_desc: "Отражение пикселя в ближнем инфракрасном (NIR) спектре равно 0.60, а в красном (RED) спектре 0.20. Вычислите значение NDVI: (NIR - RED) / (NIR + RED)",
      gis17_label: "Введите значение NDVI (например: 0.5):",

      // gis-14
      gis18_title: "Комбинации космических каналов",
      gis18_desc: "Сопоставьте комбинацию каналов Landsat-8 с ее назначением визуализации.",
      gis18_terms: {
        "Естественные цвета (Natural Color)": "4, 3, 2 каналы",
        "Искусственные цвета растительности (False Color)": "5, 4, 3 каналы",
        "Урбанизированные зоны (Shortwave Infrared)": "7, 6, 4 каналы"
      },

      // gis-15
      gis6_title: "Топологические ошибки",
      gis6_desc: "Сопоставьте топологические ошибки в векторных базах данных с их описанием.",
      gis6_terms: {
        "Overlap (Перекрытие)": "Наложение границ двух соседних участков друг на друга",
        "Gap (Пробел)": "Образование пустых пространств/дыр между смежными границами",
        "Dangle (Висячий узел)": "Конец линии, который не соединяется с другими линиями"
      },

      // gis-13
      gis13_title: "3D модели высот (DEM/DTM/DSM)",
      gis13_desc: "Сопоставьте типы моделей высот с их правильными определениями.",
      gis13_terms: {
        "DEM (Digital Elevation Model)": "Цифровая модель высот, представляющая только рельеф земной поверхности",
        "DSM (Digital Surface Model)": "Модель высот, включающая объекты на земной поверхности (здания, деревья)",
        "TIN (Triangulated Irregular Network)": "Представление рельефа в виде сети связанных треугольников в векторном формате"
      },

      // gis-15
      gis15_title: "Организация управления в ГИС",
      gis15_desc: "Сопоставьте термины, связанные с управлением ГИС-проектами и аппаратным обеспечением.",
      gis15_terms: {
        "Apparat ta'minot": "Физические устройства, такие как компьютер, сервер, сканер, GPS и плоттер",
        "Ekspert tizim": "Интеллектуальная система принятия пространственных решений на основе логических правил",
        "Litsenziyali GAT": "Платное лицензионное программное обеспечение (например, ArcGIS)"
      },

      // gis-16
      gis16_title: "Современное развитие ГИС (Web/Cloud/Mobile)",
      gis16_desc: "Сопоставьте направления развития современных ГИС-технологий.",
      gis16_terms: {
        "WebGIS": "Система онлайн-распространения и анализа карт через браузер",
        "MobileGIS": "Мобильные приложения для полевого сбора геоданных в режиме офлайн (например, QField)",
        "Bulutli GAT": "Технология хранения и анализа данных на интернет-серверах"
      },

      // gis-19
      gis19_title: "Обработка аэрокосмических снимков",
      gis19_desc: "Сопоставьте термины обработки и анализа аэрокосмических снимков.",
      gis19_terms: {
        "Ortorektifikatsiya": "Исправление геометрических искажений снимка, вызванных рельефом и наклоном камеры",
        "Nazoratli klassifikatsiya": "Классификация изображения на основе эталонных пикселей",
        "Confusion Matrix": "Таблица оценки точности и ошибок классификации снимка"
      },

      // Default match puzzle
      def_title: "Сопоставьте термины ГИС и картографии",
      def_desc: "Выберите термин слева и кликните на его определение справа.",
      def_terms: {
        "Геоид": "Истинная форма Земли, соответствующая среднему уровню океана",
        "Красовского": "Модель эллипсоида, принятая для геодезических измерений в Узбекистане",
        "QGIS": "Бесплатное программное обеспечение ГИС с открытым исходным кодом",
        "Азимут": "Угол, измеряемый от направления на север по часовой стрелке",
        "Нивелирование": "Процесс определения разности высот точек земной поверхности"
      }
    }
  }

  const tStr = localText[lang] || localText.uz

  // Sync taskState with isAlreadyCompleted
  useEffect(() => {
    if (isAlreadyCompleted) {
      setTaskState('success')
      setFeedbackMsg(tStr.successMsg)
    } else {
      setTaskState('idle')
      setFeedbackMsg('')
    }
  }, [isAlreadyCompleted, topicId])

  // Setup matching game states for matching exercises dynamically
  useEffect(() => {
    let sourceTerms = null

    if (topicId === 'karto-1') {
      sourceTerms = tStr.karto1_terms
    } else if (topicId === 'karto-2') {
      sourceTerms = tStr.karto2_terms
    } else if (topicId === 'karto-4') {
      sourceTerms = tStr.karto4_terms
    } else if (topicId === 'gis-2') {
      sourceTerms = tStr.gis2_terms
    } else if (topicId === 'gis-9') {
      sourceTerms = tStr.gis9_terms
    } else if (topicId === 'gis-10') {
      sourceTerms = tStr.gis10_terms
    } else if (topicId === 'gis-18') {
      sourceTerms = tStr.gis18_terms
    } else if (topicId === 'gis-6') {
      sourceTerms = tStr.gis6_terms
    } else if (
      !topicId.startsWith('topo-') && 
      !topicId.startsWith('karto-') && 
      !topicId.startsWith('gis-')
    ) {
      sourceTerms = tStr.def_terms
    }

    if (sourceTerms) {
      const termsList = Object.keys(sourceTerms)
      const shuffledDefs = Object.values(sourceTerms).sort(() => Math.random() - 0.5)
      setDragItems({ terms: termsList, definitions: shuffledDefs })
    }
  }, [topicId, lang])

  // Initialize Leaflet map for gis-10 (buffer analysis)
  useEffect(() => {
    if (taskState !== 'active') return
    if (topicId !== 'gis-11') return

    if (gis10LeafletMap.current) {
      gis10LeafletMap.current.remove()
      gis10LeafletMap.current = null
    }

    const timer = setTimeout(() => {
      if (!gis10MapRef.current) return

      const map = L.map(gis10MapRef.current, {
        center: [41.3, 63.5],
        zoom: 6,
        zoomControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{y}/{x}.png', {
        maxZoom: 18,
        attribution: '© OpenStreetMap'
      }).addTo(map)

      gis10LeafletMap.current = map

      // Uzbekistan cities
      const cities = [
        { name: 'Toshkent', lat: 41.299, lng: 69.240 },
        { name: 'Samarqand', lat: 39.655, lng: 66.975 },
        { name: 'Buxoro', lat: 39.768, lng: 64.422 },
        { name: 'Namangan', lat: 40.998, lng: 71.672 },
        { name: 'Andijon', lat: 40.783, lng: 72.343 },
        { name: "Farg'ona", lat: 40.384, lng: 71.787 },
        { name: 'Nukus', lat: 42.460, lng: 59.612 },
      ]

      const cityIcon = L.divIcon({
        className: '',
        html: `<div style="width:12px;height:12px;border-radius:50%;background:#3b82f6;border:2px solid white;box-shadow:0 0 6px rgba(59,130,246,0.6)"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6]
      })

      cities.forEach(city => {
        const marker = L.marker([city.lat, city.lng], { icon: cityIcon })
          .addTo(map)
          .bindTooltip(`<b>${city.name}</b>`, { permanent: false, direction: 'top' })

        marker.on('click', () => {
          // Remove old buffers
          gis10BufferLayers.current.forEach(l => {
            try { map.removeLayer(l) } catch(e){}
          })
          gis10BufferLayers.current = []

          // Draw 50km and 100km circles
          const circle50 = L.circle([city.lat, city.lng], {
            radius: 50000,
            color: '#f59e0b',
            fillColor: '#fef3c7',
            fillOpacity: 0.25,
            weight: 2,
          }).addTo(map).bindTooltip('50 km bufer zonasi', { direction: 'center' })

          const circle100 = L.circle([city.lat, city.lng], {
            radius: 100000,
            color: '#ef4444',
            fillColor: '#fee2e2',
            fillOpacity: 0.15,
            weight: 1.5,
            dashArray: '6,4',
          }).addTo(map).bindTooltip('100 km bufer zonasi', { direction: 'center' })

          gis10BufferLayers.current = [circle50, circle100]
          setGis10SelectedCity(city.name)
          setGis10Input(city.name)
        })
      })
    }, 150)

    return () => clearTimeout(timer)
  }, [taskState, topicId])

  // Initialize Map for topo-3 and gis-3
  useEffect(() => {
    if (taskState !== 'active') return
    if (topicId !== 'topo-3' && topicId !== 'gis-3') return

    if (leafletMap.current) {
      leafletMap.current.remove()
      leafletMap.current = null
    }

    const timer = setTimeout(() => {
      if (!mapRef.current) return

      const center = topicId === 'topo-3' ? [39.6548, 66.9757] : [41.625, 70.04]
      const zoom = topicId === 'topo-3' ? 8 : 12

      const map = L.map(mapRef.current, {
        center: center,
        zoom: zoom,
        zoomControl: true,
      })

      const tileUrl = topicId === 'gis-3' 
        ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        : 'https://{s}.tile.openstreetmap.org/{z}/{y}/{x}.png'

      L.tileLayer(tileUrl, {
        maxZoom: 18,
        attribution: '© OpenStreetMap | Esri'
      }).addTo(map)

      leafletMap.current = map

      const divMarkerIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div class="w-4 h-4 rounded-full bg-primary-500 border-2 border-white shadow-md animate-ping absolute"></div>
               <div class="w-4 h-4 rounded-full bg-primary-600 border-2 border-white shadow-md relative"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      })

      if (topicId === 'topo-3') {
        map.setView([40.1, 67.2], 7)

        map.on('click', (e) => {
          const { lat, lng } = e.latlng
          
          if (leafletMarker.current) {
            leafletMarker.current.setLatLng(e.latlng)
          } else {
            leafletMarker.current = L.marker(e.latlng, { icon: divMarkerIcon }).addTo(map)
          }

          const dist = getDistance(lat, lng, 39.6548, 66.9757)
          if (dist <= 6) {
            setFeedbackMsg(tStr.successMsg)
            setTaskState('success')
            onComplete()
          } else {
            setAttempts(a => a + 1)
            let clue = `${tStr.clue}: `
            if (lat > 39.7) clue += "Janubga yuring. "
            if (lat < 39.6) clue += "Shimolga yuring. "
            if (lng > 67.1) clue += "G'arbga yuring. "
            if (lng < 66.9) clue += "Sharqqa yuring. "
            setFeedbackMsg(clue + `(Oraliq masofa: ~${Math.round(dist)} km)`)
          }
        })
      } else if (topicId === 'gis-3') {
        polygonPoints.current = []

        map.on('click', (e) => {
          const { lat, lng } = e.latlng
          
          if (polygonPoints.current.length >= 3) {
            const first = polygonPoints.current[0]
            const dist = getDistance(lat, lng, first[0], first[1])
            if (dist < 0.4) {
              closePolygon()
              return
            }
          }

          polygonPoints.current.push([lat, lng])
          L.marker(e.latlng, { icon: divMarkerIcon }).addTo(map)

          if (leafletPolygon.current) {
            map.removeLayer(leafletPolygon.current)
          }
          leafletPolygon.current = L.polygon(polygonPoints.current, { color: '#a855f7', fillOpacity: 0.3 }).addTo(map)
        })
      }
    }, 150)

    return () => clearTimeout(timer)
  }, [taskState, topicId])

  const closePolygon = () => {
    if (polygonPoints.current.length < 5) {
      setFeedbackMsg("Iltimos, Chorvoq ko'li bo'ylab kamida 5 ta nuqta belgilang!")
      return
    }

    let latSum = 0, lngSum = 0
    polygonPoints.current.forEach(p => {
      latSum += p[0]
      lngSum += p[1]
    })
    const centerLat = latSum / polygonPoints.current.length
    const centerLng = lngSum / polygonPoints.current.length
    const distToCenter = getDistance(centerLat, centerLng, 41.625, 70.04)

    if (distToCenter < 4) {
      setFeedbackMsg(tStr.successMsg)
      setTaskState('success')
      onComplete()
    } else {
      setAttempts(a => a + 1)
      setFeedbackMsg("Poligon yopildi, lekin bu Chorvoq suv ombori sirtiga to'g'ri kelmadi. Qayta urinib ko'ring!")
      polygonPoints.current = []
      if (leafletMap.current && leafletPolygon.current) {
        leafletMap.current.removeLayer(leafletPolygon.current)
        leafletPolygon.current = null
      }
    }
  }

  // topo check functions
  const checkTopo1 = () => {
    const cleanVal = topo1Input.replace(/[\s,\._a-zA-Z]/g, '').trim()
    const val = parseInt(cleanVal)
    if (val === 21382) {
      setFeedbackMsg(tStr.successMsg)
      setTaskState('success')
      onComplete()
    } else {
      setAttempts(a => a + 1)
      setFeedbackMsg(tStr.incorrectMsg + " Maslahat: 6378245 dan 6356863 ni ayiring.")
    }
  }

  const checkTopo2 = () => {
    const cleanVal = topo2Input.replace(/[\s,\._a-zA-Z]/g, '').trim()
    const val = parseInt(cleanVal)
    if (val === 2750) {
      setFeedbackMsg(tStr.successMsg)
      setTaskState('success')
      onComplete()
    } else {
      setAttempts(a => a + 1)
      setFeedbackMsg(tStr.incorrectMsg + " Maslahat: 1:50 000 masshtabda 1 sm = 500 m. Masofani 500 ga ko'paytiring.")
    }
  }

  const checkAzimuth = () => {
    const cleanVal = azimuthInput.replace(/[\s,\._a-zA-Z]/g, '').trim()
    const val = parseInt(cleanVal)
    if (isNaN(val)) return
    if (Math.abs(val - 120) <= 3) {
      setFeedbackMsg(tStr.successMsg)
      setTaskState('success')
      onComplete()
    } else {
      setAttempts(a => a + 1)
      setFeedbackMsg(tStr.incorrectMsg + " Maslahat: Qizil bayroqcha 120 darajada joylashgan.")
    }
  }

  const checkSlope = () => {
    const cleanVal = slopeInput.replace(/[\s,\._a-zA-Z]/g, '').trim()
    const val = parseFloat(cleanVal)
    if (val === 8) {
      setFeedbackMsg(tStr.successMsg)
      setTaskState('success')
      onComplete()
    } else {
      setAttempts(a => a + 1)
      setFeedbackMsg(tStr.incorrectMsg + " Formula: (160 - 120) / 500 * 100")
    }
  }

  const checkTopo6 = () => {
    const cleanDeg = topo6Deg.replace(/[\s,\._a-zA-Z]/g, '').trim()
    const cleanMin = topo6Min.replace(/[\s,\._a-zA-Z]/g, '').trim()
    const deg = parseInt(cleanDeg)
    const min = parseInt(cleanMin)
    if (deg === 125 && min === 24) {
      setFeedbackMsg(tStr.successMsg)
      setTaskState('success')
      onComplete()
    } else {
      setAttempts(a => a + 1)
      setFeedbackMsg(tStr.incorrectMsg + " Maslahat: Limbdagi daraja 125 va vernierdagi qo'shimcha daqiqa 24 ga mos keladi.")
    }
  }

  const checkTopo7 = () => {
    const cleanVal = topo7Input.replace(/[\s,\._a-zA-Z\+]/g, '').trim()
    const val = parseInt(cleanVal)
    if (val === 2) {
      setFeedbackMsg(tStr.successMsg)
      setTaskState('success')
      onComplete()
    } else {
      setAttempts(a => a + 1)
      setFeedbackMsg(tStr.incorrectMsg + " Maslahat: Ichki burchaklar yig'indisini 360° dan ayiring: (89°58'+90°01'+89°59'+90°04') - 360°")
    }
  }

  const checkTopo8 = () => {
    const cleanVal = topo8Input.replace(/[^0-9\.]/g, '').trim()
    const val = parseFloat(cleanVal)
    if (val === 102.93) {
      setFeedbackMsg(tStr.successMsg)
      setTaskState('success')
      onComplete()
    } else {
      setAttempts(a => a + 1)
      setFeedbackMsg(tStr.incorrectMsg + " Maslahat: h = a - b = 1650 - 1220 = 430 mm = 0.43 m. H_B = 102.50 + 0.43")
    }
  }

  // karto check functions
  const checkKarto3 = (opt) => {
    setKarto3Selection(opt)
    if (opt === 'opt1') {
      setFeedbackMsg(tStr.successMsg)
      setTaskState('success')
      onComplete()
    } else {
      setAttempts(a => a + 1)
      setFeedbackMsg(tStr.incorrectMsg + " Maslahat: Ekvatorial hududlarda silindrli (Merkator) proyeksiyalar eng optimal hisoblanadi.")
    }
  }

  const checkKarto5 = () => {
    const cleanVal = karto5Input.replace(/[\s,\._a-zA-Z]/g, '').trim()
    const val = parseInt(cleanVal)
    if (val === 175) {
      setFeedbackMsg(tStr.successMsg)
      setTaskState('success')
      onComplete()
    } else {
      setAttempts(a => a + 1)
      setFeedbackMsg(tStr.incorrectMsg + " Maslahat: 150m va 200m gorizontallarining o'rtasidagi balandlikni hisoblang: (150 + 200) / 2")
    }
  }

  const checkKarto6 = (opt) => {
    setKarto6Selection(opt)
    if (opt === 'opt2') {
      setFeedbackMsg(tStr.successMsg)
      setTaskState('success')
      onComplete()
    } else {
      setAttempts(a => a + 1)
      setFeedbackMsg(tStr.incorrectMsg + " Maslahat: Xaritadagi axborotlarni tanlash va umumlashtirish 'generalizatsiya' deb ataladi.")
    }
  }

  const checkKarto7 = (stepId, index) => {
    if (taskState === 'success') return
    const newOrder = [...karto7Order]
    newOrder[index] = stepId
    setKarto7Order(newOrder)

    if (newOrder[0] === 's1' && newOrder[1] === 's2' && newOrder[2] === 's3' && newOrder[3] === 's4' && newOrder[4] === 's5') {
      setFeedbackMsg(tStr.successMsg)
      setTaskState('success')
      onComplete()
    } else if (newOrder.filter(Boolean).length === 5) {
      setAttempts(a => a + 1)
      setFeedbackMsg(tStr.incorrectMsg + " Loyihalash bosqichlari: Konsepsiya -> Matematika -> Ma'lumot yig'ish -> Tahrirlash -> Nashr.")
    }
  }

  const checkKarto8 = () => {
    const cleanVal = karto8Input.replace(/[\s,\._a-zA-Z]/g, '').trim()
    const val = parseInt(cleanVal)
    if (val === 1000) {
      setFeedbackMsg(tStr.successMsg)
      setTaskState('success')
      onComplete()
    } else {
      setAttempts(a => a + 1)
      setFeedbackMsg(tStr.incorrectMsg + " Maslahat: 1:25 000 masshtabda 1 sm = 250 m. 4 sm ni 250 ga ko'paytiring.")
    }
  }

  const checkKarto9 = (opt) => {
    setKarto9Selection(opt)
    if (opt === 'opt2') {
      setFeedbackMsg(tStr.successMsg)
      setTaskState('success')
      onComplete()
    } else {
      setAttempts(a => a + 1)
      setFeedbackMsg(tStr.incorrectMsg + " Maslahat: Metadata - xaritaning ma'lumot manbayi, sanasi va CRS koordinatalarini o'z ichiga oladi.")
    }
  }

  // New GIS check functions
  const checkGis1 = (catId) => {
    if (taskState === 'success') return
    const currentItem = tStr.gis1_items[gis1CurrentIndex]
    if (currentItem.cat === catId) {
      const updated = [...gis1Sorted, currentItem.name]
      setGis1Sorted(updated)
      if (gis1CurrentIndex + 1 < tStr.gis1_items.length) {
        setGis1CurrentIndex(gis1CurrentIndex + 1)
        setFeedbackMsg("To'g'ri! Keyingisini joylashtiring.")
      } else {
        setFeedbackMsg(tStr.successMsg)
        setTaskState('success')
        onComplete()
      }
    } else {
      setAttempts(a => a + 1)
      setFeedbackMsg("Noto'g'ri joylashtirish, qayta urinib ko'ring.")
    }
  }

  const checkGis5 = () => {
    const { req, layers, crs, bbox, format, dev, color } = gis5Checks
    if (req && layers && crs && bbox && format && !dev && !color) {
      setFeedbackMsg(tStr.successMsg)
      setTaskState('success')
      onComplete()
    } else {
      setAttempts(a => a + 1)
      setFeedbackMsg(tStr.incorrectMsg + " Maslahat: Faqat 5 ta majburiy GetMap parametrlarini tanlang.")
    }
  }

  const checkGis7 = (opt) => {
    setGis6Selection(opt)
    if (opt === 'opt1') {
      setFeedbackMsg(tStr.successMsg)
      setTaskState('success')
      onComplete()
    } else {
      setAttempts(a => a + 1)
      setFeedbackMsg(tStr.incorrectMsg + " Maslahat: Binolarning bog' ichida ekanligini tekshirish uchun ST_Within(geom1, geom2) funksiyasi ishlatiladi.")
    }
  }

  const checkGis8 = () => {
    const val = gis7Input.replace(/[\s']/g, '').trim().toLowerCase()
    if (val === 'parcel_id') {
      setFeedbackMsg(tStr.successMsg)
      setTaskState('success')
      onComplete()
    } else {
      setAttempts(a => a + 1)
      setFeedbackMsg(tStr.incorrectMsg + " Maslahat: Ikkala jadvalda ham mavjud bo'lgan umumiy bog'lovchi kalit ustun nomi.")
    }
  }

  const checkGis12 = () => {
    const { title, legend, scale, north, cpu, internet } = gis11Checks
    if (title && legend && scale && north && !cpu && !internet) {
      setFeedbackMsg(tStr.successMsg)
      setTaskState('success')
      onComplete()
    } else {
      setAttempts(a => a + 1)
      setFeedbackMsg(tStr.incorrectMsg + " Maslahat: Faqat 4 ta standart kartografik layout elementlarini belgilang.")
    }
  }

  const checkGis17 = () => {
    const cleanVal = gis13Input.replace(/[^0-9\.]/g, '').trim()
    const val = parseFloat(cleanVal)
    if (val === 0.5 || val === 0.50) {
      setFeedbackMsg(tStr.successMsg)
      setTaskState('success')
      onComplete()
    } else {
      setAttempts(a => a + 1)
      setFeedbackMsg(tStr.incorrectMsg + " Maslahat: (0.60 - 0.20) / (0.60 + 0.20) = 0.40 / 0.80")
    }
  }

  // GIS-4: Classify an item as vector or raster
  const handleGis4Classify = (itemId, type) => {
    if (taskState === 'success') return
    const item = tStr.gis4_items.find(i => i.id === itemId)
    const isCorrect = item?.correct === type
    const newClassified = { ...gis4Classified, [itemId]: { type, correct: isCorrect } }
    setGis4Classified(newClassified)

    if (Object.keys(newClassified).length === tStr.gis4_items.length) {
      const score = Object.values(newClassified).filter(v => v.correct).length
      setGis4Score(score)
      if (score >= 5) {
        setFeedbackMsg(tStr.successMsg + ` (${score}/6 to'g'ri)`)
        setTaskState('success')
        onComplete()
      } else {
        setAttempts(a => a + 1)
        setFeedbackMsg(tStr.incorrectMsg + ` ${score}/6 to'g'ri. Kamida 5 ta to'g'ri bo'lishi kerak.`)
        setGis4Classified({})
      }
    }
  }

  // GIS-10: Buffer map city click
  const handleGis10Submit = () => {
    const validCities = ['toshkent', 'samarqand', 'buxoro', 'namangan', 'andijon', 'farg\'ona', 'nukus']
    const val = gis10Input.trim().toLowerCase()
    if (!gis10SelectedCity) {
      setFeedbackMsg("Avval xaritadan shahar ustiga bosing.")
      return
    }
    if (validCities.some(c => val.includes(c.slice(0, 4)))) {
      setFeedbackMsg(tStr.successMsg)
      setTaskState('success')
      onComplete()
    } else {
      setAttempts(a => a + 1)
      setFeedbackMsg(tStr.incorrectMsg + " Maslahat: Xaritadagi markerga bosganda shahar nomi ko'rinadi.")
    }
  }

  // GIS-12: ArcGIS 3D score check
  const checkGis14 = () => {
    const val = parseInt(gis12ScoreInput.trim())
    if (isNaN(val)) {
      setFeedbackMsg("Iltimos, raqam kiriting.")
      return
    }
    if (val >= 16) {
      setFeedbackMsg(tStr.successMsg + ` (${val} ta ob'ekt joylashtirildi 🏙️)`)
      setTaskState('success')
      onComplete()
    } else {
      setAttempts(a => a + 1)
      setFeedbackMsg(tStr.incorrectMsg + ` Hozir ${val} ta ob'ekt bor. Kamida 16 ta (5 bino + 3 turbin + 8 daraxt) bo'lishi kerak.`)
    }
  }

  // Match term selection
  const handleTermSelect = (term) => {
    if (taskState !== 'active') return
    setSelectedTerm(term)
  }

  const handleDefinitionSelect = (def) => {
    if (!selectedTerm || taskState !== 'active') return

    // Get correct definitions dynamically based on topicId
    let termsSource = tStr.def_terms
    if (topicId === 'karto-1') termsSource = tStr.karto1_terms
    if (topicId === 'karto-2') termsSource = tStr.karto2_terms
    if (topicId === 'karto-4') termsSource = tStr.karto4_terms
    if (topicId === 'gis-2') termsSource = tStr.gis2_terms
    if (topicId === 'gis-9') termsSource = tStr.gis9_terms
    if (topicId === 'gis-10') termsSource = tStr.gis10_terms
    if (topicId === 'gis-18') termsSource = tStr.gis18_terms
    if (topicId === 'gis-6') termsSource = tStr.gis6_terms

    const correctDef = termsSource[selectedTerm]
    if (correctDef === def) {
      const updatedMatches = { ...matches, [selectedTerm]: def }
      setMatches(updatedMatches)
      setSelectedTerm(null)

      if (Object.keys(updatedMatches).length === Object.keys(termsSource).length) {
        setFeedbackMsg(tStr.successMsg)
        setTaskState('success')
        onComplete()
      }
    } else {
      setAttempts(a => a + 1)
      setFeedbackMsg("Ta'rif mos kelmadi, qaytadan urinib ko'ring.")
      setSelectedTerm(null)
    }
  }

  const handleReset = () => {
    setTaskState('active')
    setFeedbackMsg('')
    setAttempts(0)
    setTopo1Input('')
    setTopo2Input('')
    setAzimuthInput('')
    setSlopeInput('')
    setTopo6Deg('')
    setTopo6Min('')
    setTopo7Input('')
    setTopo8Input('')
    setKarto3Selection('')
    setKarto5Input('')
    setKarto6Selection('')
    setKarto7Order([])
    setKarto8Input('')
    setKarto9Selection('')
    setGis1Sorted([])
    setGis1CurrentIndex(0)
    setGis5Checks({ req: false, layers: false, crs: false, bbox: false, format: false, dev: false, color: false })
    setGis6Selection('')
    setGis7Input('')
    setGis11Checks({ title: false, legend: false, scale: false, north: false, cpu: false, internet: false })
    setGis13Input('')
    setGis4Classified({})
    setGis4Score(0)
    setGis10SelectedCity(null)
    setGis10Input('')
    setGis12ScoreInput('')
    if (gis10LeafletMap.current) {
      gis10BufferLayers.current.forEach(l => {
        try { gis10LeafletMap.current.removeLayer(l) } catch(e){}
      })
      gis10BufferLayers.current = []
    }
    setMatches({})
    setSelectedTerm(null)
    polygonPoints.current = []
    if (leafletMarker.current && leafletMap.current) {
      leafletMap.current.removeLayer(leafletMarker.current)
      leafletMarker.current = null
    }
    if (leafletPolygon.current && leafletMap.current) {
      leafletMap.current.removeLayer(leafletPolygon.current)
      leafletPolygon.current = null
    }
  }

  // Determine if it is a matching task
  const isMatchingTask = ['karto-1', 'karto-2', 'karto-4', 'gis-2', 'gis-9', 'gis-10', 'gis-18', 'gis-6'].includes(topicId) || 
    (!topicId.startsWith('topo-') && !topicId.startsWith('karto-') && !topicId.startsWith('gis-'))

  return (
    <div className="bg-white dark:bg-gray-855 rounded-2xl border border-gray-150 dark:border-gray-800 overflow-hidden shadow-sm transition-all duration-300">
      {/* Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-indigo-600 p-5 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md">
            {topicId === 'topo-1' && <Box size={20} />}
            {topicId === 'topo-2' && <Ruler size={20} />}
            {topicId === 'topo-3' && <MapPin size={20} />}
            {topicId === 'topo-4' && <Compass size={20} />}
            {topicId === 'topo-5' && <Percent size={20} />}
            {topicId === 'topo-6' && <Compass size={20} />}
            {topicId === 'topo-7' && <Activity size={20} />}
            {topicId === 'topo-8' && <Layers size={20} />}
            {topicId.startsWith('karto-') && <Layers size={20} />}
            {topicId.startsWith('gis-') && <Settings size={20} />}
            {!topicId.startsWith('topo-') && !topicId.startsWith('karto-') && !topicId.startsWith('gis-') && <HelpCircle size={20} />}
          </div>
          <div>
            <h4 className="font-bold text-sm leading-tight text-white">
              {topicId === 'topo-1' && tStr.topo1_title}
              {topicId === 'topo-2' && tStr.topo2_title}
              {topicId === 'topo-3' && tStr.topo3_title}
              {topicId === 'topo-4' && tStr.topo4_title}
              {topicId === 'topo-5' && tStr.topo5_title}
              {topicId === 'topo-6' && tStr.topo6_title}
              {topicId === 'topo-7' && tStr.topo7_title}
              {topicId === 'topo-8' && tStr.topo8_title}
              {topicId === 'karto-1' && tStr.karto1_title}
              {topicId === 'karto-2' && tStr.karto2_title}
              {topicId === 'karto-3' && tStr.karto3_title}
              {topicId === 'karto-4' && tStr.karto4_title}
              {topicId === 'karto-5' && tStr.karto5_title}
              {topicId === 'karto-6' && tStr.karto6_title}
              {topicId === 'karto-7' && tStr.karto7_title}
              {topicId === 'karto-8' && tStr.karto8_title}
              {topicId === 'karto-9' && tStr.karto9_title}
              {topicId === 'gis-1' && tStr.gis1_title}
              {topicId === 'gis-2' && tStr.gis2_title}
              {topicId === 'gis-4' && tStr.gis4_title}
              {topicId === 'gis-5' && tStr.gis5_title}
              {topicId === 'gis-7' && tStr.gis7_title}
              {topicId === 'gis-8' && tStr.gis8_title}
              {topicId === 'gis-9' && tStr.gis9_title}
              {topicId === 'gis-10' && tStr.gis10_title}
              {topicId === 'gis-11' && tStr.gis11_title}
              {topicId === 'gis-12' && tStr.gis12_title}
              {topicId === 'gis-14' && tStr.gis14_title}
              {topicId === 'gis-17' && tStr.gis17_title}
              {topicId === 'gis-18' && tStr.gis18_title}
              {topicId === 'gis-6' && tStr.gis6_title}
              {!topicId.startsWith('topo-') && !topicId.startsWith('karto-') && !topicId.startsWith('gis-') && tStr.def_title}
            </h4>
            <p className="text-[11px] text-white/80 mt-0.5">
              {topicId.startsWith('karto-') ? "Kartografiya Amaliy Mashg'uloti" : topicId.startsWith('gis-') ? "GAT Amaliy Mashg'uloti" : "Topografiya Amaliy Mashg'uloti"}
            </p>
          </div>
        </div>
        {isAlreadyCompleted && (
          <span className="bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full backdrop-blur-sm">
            Topshirilgan
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-6">
        {taskState === 'idle' ? (
          <div className="py-8 flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6">
              {topicId === 'topo-1' && tStr.topo1_desc}
              {topicId === 'topo-2' && tStr.topo2_desc}
              {topicId === 'topo-3' && tStr.topo3_desc}
              {topicId === 'topo-4' && tStr.topo4_desc}
              {topicId === 'topo-5' && tStr.topo5_desc}
              {topicId === 'topo-6' && tStr.topo6_desc}
              {topicId === 'topo-7' && tStr.topo7_desc}
              {topicId === 'topo-8' && tStr.topo8_desc}
              {topicId === 'karto-1' && tStr.karto1_desc}
              {topicId === 'karto-2' && tStr.karto2_desc}
              {topicId === 'karto-3' && tStr.karto3_desc}
              {topicId === 'karto-4' && tStr.karto4_desc}
              {topicId === 'karto-5' && tStr.karto5_desc}
              {topicId === 'karto-6' && tStr.karto6_desc}
              {topicId === 'karto-7' && tStr.karto7_desc}
              {topicId === 'karto-8' && tStr.karto8_desc}
              {topicId === 'karto-9' && tStr.karto9_desc}
              {topicId === 'gis-1' && tStr.gis1_desc}
              {topicId === 'gis-2' && tStr.gis2_desc}
              {topicId === 'gis-4' && tStr.gis4_desc}
              {topicId === 'gis-5' && tStr.gis5_desc}
              {topicId === 'gis-7' && tStr.gis7_desc}
              {topicId === 'gis-8' && tStr.gis8_desc}
              {topicId === 'gis-9' && tStr.gis9_desc}
              {topicId === 'gis-10' && tStr.gis10_desc}
              {topicId === 'gis-11' && tStr.gis11_desc}
              {topicId === 'gis-12' && tStr.gis12_desc}
              {topicId === 'gis-14' && tStr.gis14_desc}
              {topicId === 'gis-17' && tStr.gis17_desc}
              {topicId === 'gis-18' && tStr.gis18_desc}
              {topicId === 'gis-6' && tStr.gis6_desc}
              {!topicId.startsWith('topo-') && !topicId.startsWith('karto-') && !topicId.startsWith('gis-') && tStr.def_desc}
            </p>
            <button
              onClick={() => setTaskState('active')}
              className="btn-primary py-2.5 px-6 rounded-xl text-sm font-semibold shadow-md shadow-primary-500/10"
            >
              {tStr.startBtn}
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Clue Panel */}
            <div className="p-3.5 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800 text-xs text-gray-550 dark:text-gray-400 leading-relaxed">
              {topicId === 'topo-1' && tStr.topo1_desc}
              {topicId === 'topo-2' && tStr.topo2_desc}
              {topicId === 'topo-3' && tStr.topo3_desc}
              {topicId === 'topo-4' && tStr.topo4_desc}
              {topicId === 'topo-5' && tStr.topo5_desc}
              {topicId === 'topo-6' && tStr.topo6_desc}
              {topicId === 'topo-7' && tStr.topo7_desc}
              {topicId === 'topo-8' && tStr.topo8_desc}
              {topicId === 'karto-1' && tStr.karto1_desc}
              {topicId === 'karto-2' && tStr.karto2_desc}
              {topicId === 'karto-3' && tStr.karto3_desc}
              {topicId === 'karto-4' && tStr.karto4_desc}
              {topicId === 'karto-5' && tStr.karto5_desc}
              {topicId === 'karto-6' && tStr.karto6_desc}
              {topicId === 'karto-7' && tStr.karto7_desc}
              {topicId === 'karto-8' && tStr.karto8_desc}
              {topicId === 'karto-9' && tStr.karto9_desc}
              {topicId === 'gis-1' && tStr.gis1_desc}
              {topicId === 'gis-2' && tStr.gis2_desc}
              {topicId === 'gis-4' && tStr.gis4_desc}
              {topicId === 'gis-5' && tStr.gis5_desc}
              {topicId === 'gis-7' && tStr.gis7_desc}
              {topicId === 'gis-8' && tStr.gis8_desc}
              {topicId === 'gis-9' && tStr.gis9_desc}
              {topicId === 'gis-10' && tStr.gis10_desc}
              {topicId === 'gis-11' && tStr.gis11_desc}
              {topicId === 'gis-12' && tStr.gis12_desc}
              {topicId === 'gis-14' && tStr.gis14_desc}
              {topicId === 'gis-17' && tStr.gis17_desc}
              {topicId === 'gis-18' && tStr.gis18_desc}
              {topicId === 'gis-6' && tStr.gis6_desc}
              {!topicId.startsWith('topo-') && !topicId.startsWith('karto-') && !topicId.startsWith('gis-') && tStr.def_desc}
            </div>

            {/* Widget Workspace */}
            <div className="rounded-xl border border-gray-150 dark:border-gray-800 bg-gray-50/50 relative z-0">
              {/* TOPO-1 */}
              {topicId === 'topo-1' && (
                <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-855 min-h-[220px]">
                  <div className="flex items-center gap-6 mb-5">
                    <div className="w-16 h-16 rounded-full border-4 border-dashed border-primary-500 flex items-center justify-center font-bold text-primary-500">a</div>
                    <div className="w-12 h-16 rounded-full border-4 border-dashed border-emerald-500 flex items-center justify-center font-bold text-emerald-500">b</div>
                  </div>
                  <div className="w-full max-w-md flex items-center gap-3">
                    <label className="text-xs text-gray-500 font-semibold flex-shrink-0">{tStr.topo1_label}</label>
                    <input
                      type="text"
                      className="input py-1.5 px-3 text-sm text-center flex-1 min-w-[80px]"
                      value={topo1Input}
                      placeholder="Metrda"
                      onChange={e => setTopo1Input(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && checkTopo1()}
                      disabled={taskState === 'success'}
                    />
                    {taskState !== 'success' && (
                      <button onClick={checkTopo1} className="btn-primary py-1.5 px-4 text-xs font-bold rounded-lg flex-shrink-0">{tStr.submitBtn}</button>
                    )}
                  </div>
                </div>
              )}

              {/* TOPO-2 */}
              {topicId === 'topo-2' && (
                <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-855 min-h-[220px]">
                  <div className="w-64 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center relative mb-5">
                    <div className="absolute left-4 w-0.5 h-4 bg-red-500"></div>
                    <span className="absolute left-6 text-[9px] text-gray-400">0</span>
                    <div className="absolute right-4 w-0.5 h-4 bg-red-500"></div>
                    <span className="absolute right-8 text-[9px] text-gray-400">5.5 sm</span>
                    <div className="w-full h-0.5 bg-red-400 absolute left-4 right-4"></div>
                    <span className="w-full text-center text-xs font-bold text-gray-750 dark:text-gray-300">1:50 000 xarita</span>
                  </div>
                  <div className="w-full max-w-lg flex items-center gap-3 relative z-10">
                    <label className="text-xs text-gray-500 font-semibold flex-shrink-0">{tStr.topo2_label}</label>
                    <input
                      type="text"
                      className="input py-1.5 px-3 text-sm text-center flex-1 min-w-[80px]"
                      value={topo2Input}
                      placeholder="Metrda"
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck={false}
                      onChange={e => setTopo2Input(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && checkTopo2()}
                      disabled={taskState === 'success'}
                    />
                    {taskState !== 'success' && (
                      <button onClick={checkTopo2} className="btn-primary py-1.5 px-4 text-xs font-bold rounded-lg flex-shrink-0">{tStr.submitBtn}</button>
                    )}
                  </div>
                </div>
              )}


              {/* TOPO-3 */}
              {topicId === 'topo-3' && (
                <div ref={mapRef} className="w-full h-80 z-10" />
              )}

              {/* TOPO-4 */}
              {topicId === 'topo-4' && (
                <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-855 h-80">
                  <svg className="w-60 h-60 select-none relative" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="85" fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-200 dark:text-gray-700" />
                    <circle cx="100" cy="100" r="75" fill="none" stroke="currentColor" strokeWidth="1" className="text-gray-150 dark:text-gray-750" strokeDasharray="3,3" />
                    <text x="100" y="27" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#ef4444">N (0°)</text>
                    <text x="100" y="181" textAnchor="middle" fontSize="9" fontWeight="bold" fill="currentColor" className="text-gray-400">S (180°)</text>
                    <text x="180" y="103" textAnchor="middle" fontSize="9" fontWeight="bold" fill="currentColor" className="text-gray-400">E (90°)</text>
                    <text x="21" y="103" textAnchor="middle" fontSize="9" fontWeight="bold" fill="currentColor" className="text-gray-400">W (270°)</text>

                    {[30, 60, 120, 150, 210, 240, 300, 330].map(deg => {
                      const rad = (deg - 90) * Math.PI / 180
                      const x1 = 100 + 78 * Math.cos(rad)
                      const y1 = 100 + 78 * Math.sin(rad)
                      const x2 = 100 + 84 * Math.cos(rad)
                      const y2 = 100 + 84 * Math.sin(rad)
                      return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="1" className="text-gray-300 dark:text-gray-600" />
                    })}

                    {(() => {
                      const flagRad = (120 - 90) * Math.PI / 180
                      const fx = 100 + 65 * Math.cos(flagRad)
                      const fy = 100 + 65 * Math.sin(flagRad)
                      return (
                        <g>
                          <line x1="100" y1="100" x2={fx} y2={fy} stroke="#a855f7" strokeWidth="1.5" strokeDasharray="2,2" />
                          <circle cx={fx} cy={fy} r="4" fill="#ef4444" />
                          <path d={`M ${fx} ${fy} L ${fx+10} ${fy-5} L ${fx} ${fy-10} Z`} fill="#ef4444" />
                          <line x1={fx} y1={fy} x2={fx} y2={fy+12} stroke="#ef4444" strokeWidth="1.5" />
                        </g>
                      )
                    })()}
                    <circle cx="100" cy="100" r="5" fill="currentColor" className="text-gray-800 dark:text-white" />
                  </svg>
                  <div className="w-full max-w-md mt-3 flex items-center gap-3">
                    <label className="text-xs text-gray-500 font-semibold flex-shrink-0">{tStr.topo4_label}</label>
                    <input
                      type="text"
                      className="input py-1.5 px-3 text-sm text-center flex-1 min-w-[80px]"
                      value={azimuthInput}
                      placeholder="Gradus"
                      onChange={e => setAzimuthInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && checkAzimuth()}
                      disabled={taskState === 'success'}
                    />
                    {taskState !== 'success' && (
                      <button onClick={checkAzimuth} className="btn-primary py-1.5 px-4 text-xs font-bold rounded-lg flex-shrink-0">{tStr.submitBtn}</button>
                    )}
                  </div>
                </div>
              )}

              {/* TOPO-5 */}
              {topicId === 'topo-5' && (
                <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-855 h-80">
                  <svg className="w-full max-w-sm h-48 select-none" viewBox="0 0 300 150">
                    <path d="M 20 120 Q 150 120 280 40" fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-400" />
                    <circle cx="240" cy="52" r="5" fill="#3b82f6" />
                    <text x="240" y="42" textAnchor="middle" fontSize="10" fontWeight="bold" fill="currentColor" className="text-gray-700 dark:text-gray-300">A (160 m)</text>
                    <circle cx="90" cy="115" r="5" fill="#10b981" />
                    <text x="90" y="132" textAnchor="middle" fontSize="10" fontWeight="bold" fill="currentColor" className="text-gray-700 dark:text-gray-300">B (120 m)</text>
                    <line x1="90" y1="115" x2="240" y2="115" stroke="currentColor" strokeWidth="1.5" className="text-gray-300 dark:text-gray-600" strokeDasharray="3,3" />
                    <text x="165" y="105" textAnchor="middle" fontSize="9" fill="currentColor" className="text-gray-400">Masofa: d = 500 m</text>
                  </svg>
                  <div className="w-full max-w-lg mt-3 flex items-center gap-3">
                    <label className="text-xs text-gray-500 font-semibold flex-shrink-0">{tStr.topo5_label}</label>
                    <input
                      type="text"
                      className="input py-1.5 px-3 text-sm text-center flex-1 min-w-[80px]"
                      value={slopeInput}
                      placeholder="%"
                      onChange={e => setSlopeInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && checkSlope()}
                      disabled={taskState === 'success'}
                    />
                    {taskState !== 'success' && (
                      <button onClick={checkSlope} className="btn-primary py-1.5 px-4 text-xs font-bold rounded-lg flex-shrink-0">{tStr.submitBtn}</button>
                    )}
                  </div>
                </div>
              )}

              {/* TOPO-6 */}
              {topicId === 'topo-6' && (
                <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-855 min-h-[260px]">
                  <div className="w-64 bg-amber-50 dark:bg-gray-900 border-2 border-amber-200 dark:border-amber-900 rounded-xl p-4 flex flex-col items-center shadow-inner mb-5">
                    <svg className="w-56 h-24" viewBox="0 0 200 80">
                      <line x1="20" y1="50" x2="180" y2="50" stroke="currentColor" strokeWidth="1.5" className="text-gray-700 dark:text-gray-355" />
                      <line x1="40" y1="50" x2="40" y2="35" stroke="currentColor" strokeWidth="1.5" className="text-gray-700 dark:text-gray-355" />
                      <text x="40" y="65" textAnchor="middle" fontSize="8" fill="currentColor" className="text-gray-700 dark:text-gray-300">124°</text>
                      <line x1="100" y1="50" x2="100" y2="35" stroke="currentColor" strokeWidth="1.5" className="text-gray-700 dark:text-gray-355" />
                      <text x="100" y="65" textAnchor="middle" fontSize="8" fill="currentColor" className="text-gray-700 dark:text-gray-300">125°</text>
                      <line x1="160" y1="50" x2="160" y2="35" stroke="currentColor" strokeWidth="1.5" className="text-gray-700 dark:text-gray-355" />
                      <text x="160" y="65" textAnchor="middle" fontSize="8" fill="currentColor" className="text-gray-700 dark:text-gray-300">126°</text>

                      <line x1="124" y1="35" x2="124" y2="15" stroke="#ef4444" strokeWidth="2" />
                      <polygon points="124,35 121,30 127,30" fill="#ef4444" />
                      <text x="124" y="10" textAnchor="middle" fontSize="7" fill="#ef4444" fontWeight="bold">↓ ALHIDADA KO'RSATKICHI (Index)</text>
                      <text x="135" y="45" textAnchor="middle" fontSize="7" fill="#a855f7" className="font-bold">24' aligned</text>
                    </svg>
                  </div>
                  <div className="w-full max-w-xs flex items-center justify-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-500">{tStr.topo6_label_deg}</span>
                      <input
                        type="text"
                        className="input py-1.5 w-16 text-sm text-center"
                        value={topo6Deg}
                        placeholder="125"
                        onChange={e => setTopo6Deg(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && checkTopo6()}
                        disabled={taskState === 'success'}
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-500">{tStr.topo6_label_min}</span>
                      <input
                        type="text"
                        className="input py-1.5 w-16 text-sm text-center"
                        value={topo6Min}
                        placeholder="24"
                        onChange={e => setTopo6Min(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && checkTopo6()}
                        disabled={taskState === 'success'}
                      />
                    </div>
                    {taskState !== 'success' && (
                      <button onClick={checkTopo6} className="btn-primary py-1.5 px-4 text-xs font-bold rounded-lg flex-shrink-0">{tStr.submitBtn}</button>
                    )}
                  </div>
                </div>
              )}

              {/* TOPO-7 */}
              {topicId === 'topo-7' && (
                <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-855 min-h-[220px]">
                  <div className="w-full max-w-xs bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 text-xs space-y-1 mb-5">
                    <p className="font-bold mb-1 text-gray-750 dark:text-gray-300">O'lchangan burchaklar:</p>
                    <p>A = 89° 58'</p>
                    <p>B = 90° 01'</p>
                    <p>C = 89° 59'</p>
                    <p>D = 90° 04'</p>
                  </div>
                  <div className="w-full max-w-lg flex items-center gap-3">
                    <label className="text-xs text-gray-500 font-semibold flex-shrink-0">{tStr.topo7_label}</label>
                    <input
                      type="text"
                      className="input py-1.5 px-3 text-sm text-center flex-1 min-w-[80px]"
                      value={topo7Input}
                      placeholder="Daqiqa"
                      onChange={e => setTopo7Input(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && checkTopo7()}
                      disabled={taskState === 'success'}
                    />
                    {taskState !== 'success' && (
                      <button onClick={checkTopo7} className="btn-primary py-1.5 px-4 text-xs font-bold rounded-lg flex-shrink-0">{tStr.submitBtn}</button>
                    )}
                  </div>
                </div>
              )}

              {/* TOPO-8 */}
              {topicId === 'topo-8' && (
                <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-855 min-h-[280px]">
                  <svg className="w-full max-w-xs h-32 select-none mb-5" viewBox="0 0 200 100">
                    <path d="M 10 90 L 100 85 L 190 70" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400" />
                    <line x1="100" y1="85" x2="100" y2="40" stroke="currentColor" strokeWidth="2" className="text-gray-800 dark:text-white" />
                    <line x1="90" y1="85" x2="100" y2="40" stroke="currentColor" strokeWidth="1.5" className="text-gray-700 dark:text-gray-300" />
                    <line x1="110" y1="85" x2="100" y2="40" stroke="currentColor" strokeWidth="1.5" className="text-gray-700 dark:text-gray-300" />
                    <rect x="90" y="38" width="20" height="5" rx="1" fill="#3b82f6" />
                    <rect x="25" y="30" width="4" height="60" fill="#f3f4f6" stroke="#d1d5db" />
                    <text x="18" y="55" fontSize="7" fill="currentColor">a = 1650 mm</text>
                    <text x="27" y="98" fontSize="8" fontWeight="bold" fill="currentColor">A (102.50m)</text>
                    <rect x="171" y="10" width="4" height="60" fill="#f3f4f6" stroke="#d1d5db" />
                    <text x="178" y="35" fontSize="7" fill="currentColor">b = 1220 mm</text>
                    <text x="173" y="78" fontSize="8" fontWeight="bold" fill="currentColor">B</text>
                    <line x1="29" y1="40.5" x2="171" y2="40.5" stroke="#ef4444" strokeWidth="1" strokeDasharray="2,2" />
                  </svg>
                  <div className="w-full max-w-lg flex items-center gap-3">
                    <label className="text-xs text-gray-500 font-semibold flex-shrink-0">{tStr.topo8_label}</label>
                    <input
                      type="text"
                      className="input py-1.5 px-3 text-sm text-center flex-1 min-w-[80px]"
                      value={topo8Input}
                      placeholder="Balandlik"
                      onChange={e => setTopo8Input(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && checkTopo8()}
                      disabled={taskState === 'success'}
                    />
                    {taskState !== 'success' && (
                      <button onClick={checkTopo8} className="btn-primary py-1.5 px-4 text-xs font-bold rounded-lg flex-shrink-0">{tStr.submitBtn}</button>
                    )}
                  </div>
                </div>
              )}

              {/* KARTO-3 */}
              {topicId === 'karto-3' && (
                <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-850 min-h-[250px] space-y-4">
                  <div className="w-full max-w-xs flex flex-col gap-2">
                    <button
                      onClick={() => checkKarto3('opt1')}
                      className={`w-full p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                        karto3Selection === 'opt1'
                          ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500 text-emerald-600'
                          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 text-gray-700 dark:text-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      🗺️ {tStr.karto3_opt1}
                    </button>
                    <button
                      onClick={() => checkKarto3('opt2')}
                      className={`w-full p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                        karto3Selection === 'opt2'
                          ? 'bg-red-50 dark:bg-red-950/20 border-red-500 text-red-600'
                          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 text-gray-700 dark:text-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      📐 {tStr.karto3_opt2}
                    </button>
                    <button
                      onClick={() => checkKarto3('opt3')}
                      className={`w-full p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                        karto3Selection === 'opt3'
                          ? 'bg-red-50 dark:bg-red-950/20 border-red-500 text-red-600'
                          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 text-gray-700 dark:text-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      🌐 {tStr.karto3_opt3}
                    </button>
                  </div>
                </div>
              )}

              {/* KARTO-5 */}
              {topicId === 'karto-5' && (
                <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-850 min-h-[260px]">
                  <svg className="w-full max-w-sm h-40 select-none" viewBox="0 0 250 150">
                    <ellipse cx="125" cy="75" rx="100" ry="60" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-300 dark:text-gray-700" />
                    <text x="125" y="132" textAnchor="middle" fontSize="8" fill="currentColor" className="text-gray-400">100 m</text>
                    <ellipse cx="125" cy="75" rx="70" ry="40" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-455 dark:text-gray-600" />
                    <text x="125" y="112" textAnchor="middle" fontSize="8" fill="currentColor" className="text-gray-400">150 m</text>
                    <ellipse cx="125" cy="75" rx="40" ry="25" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-600 dark:text-gray-550" />
                    <text x="125" y="96" textAnchor="middle" fontSize="8" fill="currentColor" className="text-gray-400">200 m</text>
                    <circle cx="125" cy="45" r="4.5" fill="#ef4444" />
                    <text x="125" y="38" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#ef4444">X</text>
                  </svg>
                  <div className="w-full max-w-lg flex items-center gap-3 mt-2">
                    <label className="text-xs text-gray-500 font-semibold flex-shrink-0">{tStr.karto5_label}</label>
                    <input
                      type="text"
                      className="input py-1.5 px-3 text-sm text-center flex-1 min-w-[80px]"
                      value={karto5Input}
                      placeholder="Metr"
                      onChange={e => setKarto5Input(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && checkKarto5()}
                      disabled={taskState === 'success'}
                    />
                    {taskState !== 'success' && (
                      <button onClick={checkKarto5} className="btn-primary py-1.5 px-4 text-xs font-bold rounded-lg flex-shrink-0">{tStr.submitBtn}</button>
                    )}
                  </div>
                </div>
              )}

              {/* KARTO-6 */}
              {topicId === 'karto-6' && (
                <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-855 min-h-[240px] space-y-3">
                  <div className="w-full max-w-xs flex flex-col gap-2">
                    <button
                      onClick={() => checkKarto6('opt1')}
                      className={`w-full p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                        karto6Selection === 'opt1'
                          ? 'bg-red-50 dark:bg-red-950/20 border-red-500 text-red-600'
                          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 text-gray-700 dark:text-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      ❌ {tStr.karto6_opt1}
                    </button>
                    <button
                      onClick={() => checkKarto6('opt2')}
                      className={`w-full p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                        karto6Selection === 'opt2'
                          ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500 text-emerald-600'
                          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 text-gray-700 dark:text-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      ✅ {tStr.karto6_opt2}
                    </button>
                    <button
                      onClick={() => checkKarto6('opt3')}
                      className={`w-full p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                        karto6Selection === 'opt3'
                          ? 'bg-red-50 dark:bg-red-950/20 border-red-500 text-red-600'
                          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 text-gray-700 dark:text-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      ❌ {tStr.karto6_opt3}
                    </button>
                  </div>
                </div>
              )}

              {/* KARTO-7 */}
              {topicId === 'karto-7' && (
                <div className="flex flex-col p-5 bg-white dark:bg-gray-850 min-h-[300px] space-y-4">
                  <div className="space-y-2">
                    {[
                      { id: 's1', text: tStr.karto7_step1 },
                      { id: 's2', text: tStr.karto7_step2 },
                      { id: 's3', text: tStr.karto7_step3 },
                      { id: 's4', text: tStr.karto7_step4 },
                      { id: 's5', text: tStr.karto7_step5 }
                    ].map((step, idx) => {
                      const currentAssignedIndex = karto7Order.indexOf(step.id)
                      return (
                        <div key={step.id} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs">
                          <span className="text-gray-700 dark:text-gray-300 font-medium">{step.text}</span>
                          <div className="flex gap-1.5 flex-shrink-0">
                            {[1, 2, 3, 4, 5].map((num) => {
                              const targetIndex = num - 1
                              const isActive = currentAssignedIndex === targetIndex
                              return (
                                <button
                                  key={num}
                                  onClick={() => checkKarto7(step.id, targetIndex)}
                                  disabled={taskState === 'success'}
                                  className={`w-6 h-6 rounded-md text-[10px] font-bold flex items-center justify-center transition-all ${
                                    isActive ? 'bg-primary-600 text-white shadow-sm' : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-500 hover:bg-gray-100'
                                  }`}
                                >
                                  {num}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* KARTO-8 */}
              {topicId === 'karto-8' && (
                <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-855 min-h-[220px]">
                  <div className="w-64 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center relative mb-5">
                    <div className="absolute left-4 w-0.5 h-4 bg-red-500"></div>
                    <span className="absolute left-6 text-[9px] text-gray-400">0</span>
                    <div className="absolute right-4 w-0.5 h-4 bg-red-500"></div>
                    <span className="absolute right-8 text-[9px] text-gray-400">4 sm</span>
                    <div className="w-full h-0.5 bg-red-400 absolute left-4 right-4"></div>
                    <span className="w-full text-center text-xs font-bold text-gray-750 dark:text-gray-300">1:25 000 xarita</span>
                  </div>
                  <div className="w-full max-w-lg flex items-center gap-3">
                    <label className="text-xs text-gray-500 font-semibold flex-shrink-0">{tStr.karto8_label}</label>
                    <input
                      type="text"
                      className="input py-1.5 px-3 text-sm text-center flex-1 min-w-[80px]"
                      value={karto8Input}
                      placeholder="Metr"
                      onChange={e => setKarto8Input(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && checkKarto8()}
                      disabled={taskState === 'success'}
                    />
                    {taskState !== 'success' && (
                      <button onClick={checkKarto8} className="btn-primary py-1.5 px-4 text-xs font-bold rounded-lg flex-shrink-0">{tStr.submitBtn}</button>
                    )}
                  </div>
                </div>
              )}

              {/* KARTO-9 */}
              {topicId === 'karto-9' && (
                <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-855 min-h-[240px] space-y-3">
                  <div className="w-full max-w-xs flex flex-col gap-2">
                    <button
                      onClick={() => checkKarto9('opt1')}
                      className={`w-full p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                        karto9Selection === 'opt1' ? 'bg-red-50 dark:bg-red-950/20 border-red-500 text-red-600' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 text-gray-700 dark:text-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      ❌ {tStr.karto9_opt1}
                    </button>
                    <button
                      onClick={() => checkKarto9('opt2')}
                      className={`w-full p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                        karto9Selection === 'opt2' ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500 text-emerald-600' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 text-gray-700 dark:text-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      ✅ {tStr.karto9_opt2}
                    </button>
                    <button
                      onClick={() => checkKarto9('opt3')}
                      className={`w-full p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                        karto9Selection === 'opt3' ? 'bg-red-50 dark:bg-red-950/20 border-red-500 text-red-600' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 text-gray-700 dark:text-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      ❌ {tStr.karto9_opt3}
                    </button>
                  </div>
                </div>
              )}

              {/* GIS-1: DRAG & SORT COMPONENT */}
              {topicId === 'gis-1' && (
                <div className="flex flex-col p-5 bg-white dark:bg-gray-850 min-h-[280px] space-y-4">
                  {gis1CurrentIndex < tStr.gis1_items.length ? (
                    <div className="flex flex-col items-center justify-center py-4 bg-primary-50/30 dark:bg-primary-950/10 border border-dashed border-primary-200 dark:border-primary-900 rounded-xl mb-4">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Guruhlang:</span>
                      <span className="text-base font-extrabold text-gray-850 dark:text-white">{tStr.gis1_items[gis1CurrentIndex].name}</span>
                    </div>
                  ) : null}

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    {[
                      { id: 'c1', name: tStr.gis1_comp1, icon: Server },
                      { id: 'c2', name: tStr.gis1_comp2, icon: Settings },
                      { id: 'c3', name: tStr.gis1_comp3, icon: Database },
                      { id: 'c4', name: tStr.gis1_comp4, icon: Ruler },
                      { id: 'c5', name: tStr.gis1_comp5, icon: MapPin }
                    ].map(comp => {
                      const count = gis1Sorted.filter(name => tStr.gis1_items.find(x => x.name === name)?.cat === comp.id).length
                      return (
                        <button
                          key={comp.id}
                          onClick={() => checkGis1(comp.id)}
                          disabled={taskState === 'success'}
                          className="flex flex-col items-center justify-center p-3 rounded-xl border border-gray-200 dark:border-gray-750 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all text-center gap-1.5"
                        >
                          <comp.icon size={16} className="text-primary-500" />
                          <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 leading-tight">{comp.name}</span>
                          {count > 0 && <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-1.5 py-0.5 rounded-full">{count} ta</span>}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* GIS-3 */}
              {topicId === 'gis-3' && (
                <div className="relative">
                  <div ref={mapRef} className="w-full h-80 z-10" />
                  <div className="absolute bottom-3 right-3 z-20">
                    <button
                      onClick={() => navigate('/gis-lab')}
                      className="flex items-center gap-1.5 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-xs font-bold text-primary-600 dark:text-primary-400 px-3 py-1.5 rounded-lg shadow-lg hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-all"
                    >
                      <ExternalLink size={11} />
                      GAT Laboratoriya — GeoJSON yuklash
                    </button>
                  </div>
                </div>
              )}

              {/* GIS-4: RASTER vs VECTOR CLASSIFICATION */}
              {topicId === 'gis-4' && (
                <div className="flex flex-col p-5 bg-white dark:bg-gray-850 min-h-[340px] space-y-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Kartochkalarni tasniflang:</span>
                    <span className="text-xs font-bold bg-primary-100 dark:bg-primary-950/30 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full">
                      {Object.keys(gis4Classified).length} / {tStr.gis4_items.length} tasniflandi
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {tStr.gis4_items.map(item => {
                      const classified = gis4Classified[item.id]
                      return (
                        <div key={item.id} className={`rounded-xl border-2 p-3 transition-all ${
                          classified
                            ? classified.correct
                              ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20'
                              : 'border-red-400 bg-red-50 dark:bg-red-950/20'
                            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                        }`}>
                          <p className="text-xs font-semibold text-gray-750 dark:text-gray-200 leading-snug mb-2">{item.label}</p>
                          {!classified ? (
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => handleGis4Classify(item.id, 'vector')}
                                disabled={taskState === 'success'}
                                className="flex-1 py-1 rounded-lg text-[10px] font-bold bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-all border border-blue-200 dark:border-blue-800"
                              >
                                📐 {tStr.gis4_vectorBtn}
                              </button>
                              <button
                                onClick={() => handleGis4Classify(item.id, 'raster')}
                                disabled={taskState === 'success'}
                                className="flex-1 py-1 rounded-lg text-[10px] font-bold bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/40 transition-all border border-orange-200 dark:border-orange-800"
                              >
                                🖼️ {tStr.gis4_rasterBtn}
                              </button>
                            </div>
                          ) : (
                            <div className={`text-[10px] font-bold flex items-center gap-1 ${
                              classified.correct ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'
                            }`}>
                              {classified.correct ? '✅' : '❌'} {classified.type === 'vector' ? `📐 ${tStr.gis4_vectorBtn}` : `🖼️ ${tStr.gis4_rasterBtn}`}
                              {!classified.correct && <span className="text-gray-400"> (To'g'risi: {item.correct === 'vector' ? tStr.gis4_vectorBtn : tStr.gis4_rasterBtn})</span>}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* GIS-5: CHECKBOX PARAMS */}
              {topicId === 'gis-5' && (
                <div className="flex flex-col p-5 bg-white dark:bg-gray-850 min-h-[300px] space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { key: 'req', label: tStr.gis5_opt1 },
                      { key: 'layers', label: tStr.gis5_opt2 },
                      { key: 'crs', label: tStr.gis5_opt3 },
                      { key: 'bbox', label: tStr.gis5_opt4 },
                      { key: 'format', label: tStr.gis5_opt5 },
                      { key: 'dev', label: tStr.gis5_opt6 },
                      { key: 'color', label: tStr.gis5_opt7 }
                    ].map(opt => (
                      <label key={opt.key} className="flex items-center gap-3 p-3 rounded-lg border border-gray-150 dark:border-gray-750 bg-gray-50/50 dark:bg-gray-900/10 cursor-pointer hover:bg-gray-100/50 transition-colors">
                        <input
                          type="checkbox"
                          checked={gis5Checks[opt.key]}
                          disabled={taskState === 'success'}
                          onChange={e => setGis5Checks(prev => ({ ...prev, [opt.key]: e.target.checked }))}
                          className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                  {taskState !== 'success' && (
                    <button onClick={checkGis5} className="btn-primary py-2 px-5 text-xs font-bold rounded-xl self-end">
                      {tStr.submitBtn}
                    </button>
                  )}
                </div>
              )}

              {/* GIS-6: SQL CHOICE */}
              {topicId === 'gis-7' && (
                <div className="flex flex-col p-5 bg-white dark:bg-gray-850 min-h-[250px] space-y-4">
                  <div className="space-y-2">
                    <button
                      onClick={() => checkGis7('opt1')}
                      className={`w-full p-3 rounded-xl border text-xs font-mono text-left transition-all ${
                        gis6Selection === 'opt1'
                          ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500 text-emerald-600'
                          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 text-gray-700 dark:text-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {tStr.gis7_opt1}
                    </button>
                    <button
                      onClick={() => checkGis7('opt2')}
                      className={`w-full p-3 rounded-xl border text-xs font-mono text-left transition-all ${
                        gis6Selection === 'opt2'
                          ? 'bg-red-50 dark:bg-red-950/20 border-red-500 text-red-600'
                          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 text-gray-700 dark:text-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {tStr.gis7_opt2}
                    </button>
                    <button
                      onClick={() => checkGis7('opt3')}
                      className={`w-full p-3 rounded-xl border text-xs font-mono text-left transition-all ${
                        gis6Selection === 'opt3'
                          ? 'bg-red-50 dark:bg-red-950/20 border-red-500 text-red-600'
                          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 text-gray-700 dark:text-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {tStr.gis7_opt3}
                    </button>
                  </div>
                </div>
              )}

              {/* GIS-7: PK IDENTIFIER */}
              {topicId === 'gis-8' && (
                <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-855 min-h-[220px]">
                  <div className="w-full max-w-xs bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 text-xs space-y-2 mb-5">
                    <p className="font-bold mb-1 text-gray-750 dark:text-gray-300">Jadvallar tuzilishi:</p>
                    <p><b>cadastre</b>: parcel_id, area, address</p>
                    <p><b>owners</b>: owner_id, owner_name, parcel_id</p>
                  </div>
                  <div className="w-full max-w-lg flex items-center gap-3">
                    <label className="text-xs text-gray-500 font-semibold flex-shrink-0">{tStr.gis8_label}</label>
                    <input
                      type="text"
                      className="input py-1.5 px-3 text-sm text-center flex-1 min-w-[80px]"
                      value={gis7Input}
                      placeholder="parcel_id"
                      onChange={e => setGis7Input(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && checkGis8()}
                      disabled={taskState === 'success'}
                    />
                    {taskState !== 'success' && (
                      <button onClick={checkGis8} className="btn-primary py-1.5 px-4 text-xs font-bold rounded-lg flex-shrink-0">{tStr.submitBtn}</button>
                    )}
                  </div>
                </div>
              )}

              {/* GIS-11: LAYOUT CHECKBOX */}
              {topicId === 'gis-12' && (
                <div className="flex flex-col p-5 bg-white dark:bg-gray-850 min-h-[300px] space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { key: 'title', label: tStr.gis12_opt1 },
                      { key: 'legend', label: tStr.gis12_opt2 },
                      { key: 'north', label: tStr.gis12_opt3 },
                      { key: 'scale', label: tStr.gis12_opt4 },
                      { key: 'cpu', label: tStr.gis12_opt5 },
                      { key: 'internet', label: tStr.gis12_opt6 }
                    ].map(opt => (
                      <label key={opt.key} className="flex items-center gap-3 p-3 rounded-lg border border-gray-150 dark:border-gray-750 bg-gray-50/50 dark:bg-gray-900/10 cursor-pointer hover:bg-gray-100/50 transition-colors">
                        <input
                          type="checkbox"
                          checked={gis11Checks[opt.key]}
                          disabled={taskState === 'success'}
                          onChange={e => setGis11Checks(prev => ({ ...prev, [opt.key]: e.target.checked }))}
                          className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                  {taskState !== 'success' && (
                    <button onClick={checkGis12} className="btn-primary py-2 px-5 text-xs font-bold rounded-xl self-end">
                      {tStr.submitBtn}
                    </button>
                  )}
                </div>
              )}

              {/* GIS-10: BUFFER ANALYSIS MAP */}
              {topicId === 'gis-11' && (
                <div className="flex flex-col bg-white dark:bg-gray-850 min-h-[380px]">
                  <div
                    ref={gis10MapRef}
                    className="w-full h-64 z-10"
                    style={{ minHeight: 240 }}
                  />
                  <div className="p-4 space-y-3">
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-950/20 rounded-lg p-2.5 border border-blue-100 dark:border-blue-900/30">
                      💡 {tStr.gis11_hint}
                    </p>
                    {gis10SelectedCity && (
                      <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        ✅ Tanlangan shahar: <b>{gis10SelectedCity}</b> — 50km va 100km bufer zonalari chizildi
                      </p>
                    )}
                    <div className="flex items-center gap-3">
                      <label className="text-xs text-gray-500 font-semibold flex-shrink-0">{tStr.gis11_label}</label>
                      <input
                        type="text"
                        className="input py-1.5 px-3 text-sm flex-1"
                        value={gis10Input}
                        placeholder="Shahar nomi..."
                        onChange={e => setGis10Input(e.target.value)}
                        disabled={taskState === 'success'}
                      />
                      {taskState !== 'success' && (
                        <button onClick={handleGis10Submit} className="btn-primary py-1.5 px-4 text-xs font-bold rounded-lg flex-shrink-0">{tStr.gis11_submit}</button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* GIS-12: ARCGIS 3D CITY PLANNING */}
              {topicId === 'gis-14' && (
                <div className="flex flex-col p-5 bg-white dark:bg-gray-850 min-h-[320px] space-y-4">
                  <div className="rounded-xl overflow-hidden border-2 border-dashed border-indigo-300 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/20 dark:to-violet-950/20 p-5">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0">
                        <Building2 size={18} className="text-white" />
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-gray-850 dark:text-white">Topshiriq:</h5>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 leading-relaxed">{tStr.gis14_task}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="bg-white/60 dark:bg-gray-800/40 rounded-lg p-2.5 text-center border border-white/80 dark:border-gray-700">
                        <Building2 size={16} className="text-indigo-500 mx-auto mb-1" />
                        <p className="text-[10px] font-bold text-gray-700 dark:text-gray-300">5+ Bino</p>
                      </div>
                      <div className="bg-white/60 dark:bg-gray-800/40 rounded-lg p-2.5 text-center border border-white/80 dark:border-gray-700">
                        <Cpu size={16} className="text-violet-500 mx-auto mb-1" />
                        <p className="text-[10px] font-bold text-gray-700 dark:text-gray-300">3+ Turbin</p>
                      </div>
                      <div className="bg-white/60 dark:bg-gray-800/40 rounded-lg p-2.5 text-center border border-white/80 dark:border-gray-700">
                        <TreePine size={16} className="text-emerald-500 mx-auto mb-1" />
                        <p className="text-[10px] font-bold text-gray-700 dark:text-gray-300">8+ Daraxt</p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/arcgis-3d')}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20"
                    >
                      <Globe size={14} />
                      {tStr.gis14_openBtn}
                    </button>
                  </div>
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-950/20 rounded-lg p-2.5 border border-amber-100 dark:border-amber-900/30">
                    💡 {tStr.gis14_hint}
                  </p>
                  <div className="flex items-center gap-3">
                    <label className="text-xs text-gray-500 font-semibold flex-shrink-0">{tStr.gis14_scoreLabel}</label>
                    <input
                      type="number"
                      className="input py-1.5 px-3 text-sm text-center flex-1"
                      value={gis12ScoreInput}
                      placeholder="16"
                      min="0"
                      onChange={e => setGis12ScoreInput(e.target.value)}
                      disabled={taskState === 'success'}
                    />
                    {taskState !== 'success' && (
                      <button onClick={checkGis14} className="btn-primary py-1.5 px-4 text-xs font-bold rounded-lg flex-shrink-0">{tStr.submitBtn}</button>
                    )}
                  </div>
                </div>
              )}

              {/* GIS-13: NDVI CALCULATION */}
              {topicId === 'gis-17' && (
                <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-855 min-h-[220px]">
                  <div className="w-full max-w-xs bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 text-xs space-y-2 mb-5">
                    <p className="font-bold mb-1 text-gray-750 dark:text-gray-300">NDVI formula:</p>
                    <p>NDVI = (NIR - RED) / (NIR + RED)</p>
                    <p>NIR = 0.60</p>
                    <p>RED = 0.20</p>
                  </div>
                  <div className="w-full max-w-lg flex items-center gap-3">
                    <label className="text-xs text-gray-500 font-semibold flex-shrink-0">{tStr.gis17_label}</label>
                    <input
                      type="text"
                      className="input py-1.5 px-3 text-sm text-center flex-1 min-w-[80px]"
                      value={gis13Input}
                      placeholder="0.5"
                      onChange={e => setGis13Input(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && checkGis17()}
                      disabled={taskState === 'success'}
                    />
                    {taskState !== 'success' && (
                      <button onClick={checkGis17} className="btn-primary py-1.5 px-4 text-xs font-bold rounded-lg flex-shrink-0">{tStr.submitBtn}</button>
                    )}
                  </div>
                </div>
              )}

              {/* DEFAULT MATCHING GAME (karto-1, karto-2, karto-4, gis-2, gis-8, gis-9, gis-14, gis-15) */}
              {isMatchingTask && (
                <div className="grid grid-cols-2 gap-4 p-5 bg-white dark:bg-gray-850 min-h-[300px]">
                  <div className="space-y-2">
                    <p className="text-xs text-gray-400 font-bold mb-2 uppercase">Atamalar</p>
                    {dragItems.terms?.map(term => {
                      const isMatched = !!matches[term]
                      const isSelected = selectedTerm === term
                      return (
                        <button
                          key={term}
                          onClick={() => handleTermSelect(term)}
                          disabled={isMatched || taskState === 'success'}
                          className={`w-full text-left p-2.5 rounded-lg border text-xs font-medium transition-all ${
                            isMatched
                              ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 opacity-60'
                              : isSelected
                              ? 'bg-primary-50 dark:bg-primary-950/40 border-primary-500 text-primary-700 dark:text-primary-400 scale-[1.01] shadow-sm'
                              : 'bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 hover:bg-gray-100/50'
                          }`}
                        >
                          {term}
                        </button>
                      )
                    })}
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs text-gray-400 font-bold mb-2 uppercase">Ta'riflar</p>
                    {dragItems.definitions?.map(def => {
                      const isMatched = Object.values(matches).includes(def)
                      return (
                        <button
                          key={def}
                          onClick={() => handleDefinitionSelect(def)}
                          disabled={isMatched || !selectedTerm || taskState === 'success'}
                          className={`w-full text-left p-2.5 rounded-lg border text-[11px] leading-relaxed transition-all ${
                            isMatched
                              ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 opacity-60'
                              : selectedTerm
                              ? 'bg-white dark:bg-gray-800 border-primary-100 hover:border-primary-400 cursor-pointer text-gray-700 dark:text-gray-300'
                              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-450 cursor-not-allowed'
                          }`}
                        >
                          {def}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Status Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                {taskState === 'success' ? (
                  <CheckCircle2 className="text-emerald-500 w-5 h-5 flex-shrink-0" />
                ) : (
                  <span className="text-xs text-gray-400 font-medium">
                    {tStr.attemptsText}: <b className="text-gray-750 dark:text-gray-200 font-bold">{attempts}</b>
                  </span>
                )}
                <span className={`text-xs font-medium leading-normal ${
                  taskState === 'success' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-gray-500 dark:text-gray-300'
                }`}>
                  {feedbackMsg || "Vazifani bajarishga kirishing."}
                </span>
              </div>

              {taskState === 'success' ? (
                <div className="flex items-center gap-3">
                  <span className="text-emerald-500 text-xs font-bold flex items-center gap-1">
                    {tStr.completedText}
                  </span>
                  <button
                    onClick={handleReset}
                    className="btn-secondary py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 opacity-70 hover:opacity-100"
                  >
                    <RotateCcw size={12} />
                    Qayta yechish
                  </button>
                </div>
              ) : (
                attempts > 0 && (
                  <button onClick={handleReset} className="btn-secondary py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                    <RotateCcw size={12} />
                    {tStr.resetBtn}
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
