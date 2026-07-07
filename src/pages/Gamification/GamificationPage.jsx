import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useAuth } from '../../context/AuthContext'
import {
  Gamepad2, Trophy, Navigation, ArrowLeft, RefreshCcw,
  CheckCircle, Play, ChevronRight, Award, Compass, Star,
  Users, Plus, Clock, LogOut, X, Crown, Copy, MapPin, Loader2, Eye, Maximize2, Minimize2
} from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

// Import Firestore configuration
import { db } from '../../firebase/config'
import {
  collection, doc, setDoc, getDoc, updateDoc, deleteDoc,
  onSnapshot, query, where, serverTimestamp
} from 'firebase/firestore'

// Local translations for gamification components
const localT = {
  uz: {
    title: "Geoo'yin: Koordinata topish",
    tagline: "Google Street View panoramalari yordamida joylashuvni aniqlang va sinfdoshlaringiz bilan bellashing!",
    soloTitle: "Yakka o'yin",
    soloDesc: "Tasodifiy Street View joylashuvlaridan atrofni kuzating va ularni xaritadan topib, ballar to'plang.",
    soloBtn: "Yakkalik o'yinni boshlash",
    battleTitle: "Guruh Musobaqasi (Multiplayer)",
    battleDesc: "Sinfdoshlaringiz bilan real vaqtda bir xil Street View nuqtalarini topish bo'yicha kuch sinashing!",
    createRoomBtn: "Yangi xona yaratish",
    joinRoomBtn: "Xonaga qo'shilish",
    activeRoomsTitle: "Faol musobaqa xonalari",
    noActiveRooms: "Hozirda faol xonalar yo'q. Birinchi bo'lib xona yarating!",
    enterCodePlaceholder: "Xona kodini kiriting (Masalan: GAT-1234)",
    or: "yoki",
    roomLabel: "Xona",
    hostLabel: "Tashkilotchi",
    playersCount: "O'yinchilar",
    joinBtn: "Qo'shilish",
    lobbyTitle: "Musobaqa kutish xonasi",
    roomCodeLabel: "Xona kodi",
    copyCodeToast: "Xona kodi buferga nusxalandi!",
    playersListTitle: "Tayyor turgan o'yinchilar",
    waitingForHost: "Xona tashkilotchisi o'yinni boshlashini kutmoqdamiz...",
    startBattleBtn: "O'yinni boshlash",
    cancelBattleBtn: "Xonani yopish",
    leaveRoomBtn: "Xonadan chiqish",
    thinking: "Fikrlamoqda... ⏳",
    ready: "Javob berdi ✅",
    confirmGuessBtn: "Taxminni tasdiqlash",
    placedGuess: "Taxmin belgilandi. Tasdiqlash tugmasini bosing.",
    waitingForOthers: "Boshqa o'yinchilar taxmin yuborishini kutmoqdamiz...",
    timeLeft: "Qolgan vaqt",
    roundLeaderboard: "Raund reytingi",
    finalLeaderboard: "Yakuniy peshqadamlar",
    winnerBadge: "G'olib",
    pointsWord: "ball",
    congratsPro: "A'lo daraja! Siz professional kartografsiz! 🏆",
    congratsGood: "Yaxshi natija! Ko'proq mashq qiling. 👍",
    congratsBad: "Qoniqarsiz. Koordinata o'qish mavzusini qayta o'qing. 📚",
    ptsAddedToast: "Hisobingizga +{pts} ball qo'shildi!",
    errorSavingPts: "Ballni saqlashda xatolik yuz berdi.",
    roomCancelled: "Musobaqa tashkilotchi tomonidan bekor qilindi!",
    roomNotFound: "Bunday kodli xona topilmadi!",
    roomClosed: "Ushbu xonada o'yin boshlangan yoki yopilgan!",
    enterCodeError: "Iltimos, xona kodini kiriting!",
    networkError: "Ma'lumotlar bazasi bilan aloqa o'rnatib bo'lmadi. Keyinroq urinib ko'ring.",
    timeOutMsg: "Vaqt tugadi! 0 ball.",
    backToDashboard: "Dashboard",
    retryBtn: "Qayta o'ynash",
    backBtn: "Orqaga"
  },
  ru: {
    title: "Геоигра: Поиск мест",
    tagline: "Определяйте местоположение с помощью панорам Google Street View и соревнуйтесь с одноклассниками!",
    soloTitle: "Одиночная игра",
    soloDesc: "Исследуйте окрестности по случайным панорамам Street View и ищите их на карте самостоятельно.",
    soloBtn: "Начать одиночную игру",
    battleTitle: "Групповое соревнование (Мультиплеер)",
    battleDesc: "Соревнуйтесь с одноклассниками в режиме реального времени на одной карте по панорамам!",
    createRoomBtn: "Создать комнату",
    joinRoomBtn: "Войти в комнату",
    activeRoomsTitle: "Активные игровые комнаты",
    noActiveRooms: "В данный момент активных комнат нет. Создайте первую комнату!",
    enterCodePlaceholder: "Введите код комнаты (Например: GAT-1234)",
    or: "или",
    roomLabel: "Комната",
    hostLabel: "Организатор",
    playersCount: "Игроки",
    joinBtn: "Войти",
    lobbyTitle: "Ожидание соревнования",
    roomCodeLabel: "Код комнаты",
    copyCodeToast: "Код комнаты скопирован в буфер обмена!",
    playersListTitle: "Готовые игроки",
    waitingForHost: "Ожидаем, пока организатор начнет соревнование...",
    startBattleBtn: "Начать соревнование",
    cancelBattleBtn: "Закрыть комнату",
    leaveRoomBtn: "Выйти из комнаты",
    thinking: "Думает... ⏳",
    ready: "Ответил ✅",
    confirmGuessBtn: "Подтвердить прогноз",
    placedGuess: "Прогноз выбран. Нажмите кнопку подтверждения.",
    waitingForOthers: "Ожидаем прогнозы остальных участников...",
    timeLeft: "Оставшееся время",
    roundLeaderboard: "Рейтинг раунда",
    finalLeaderboard: "Финальные результаты",
    winnerBadge: "Победитель",
    pointsWord: "очков",
    congratsPro: "Отлично! Вы профессиональный картограф! 🏆",
    congratsGood: "Хороший результат! Потренируйтесь еще. 👍",
    congratsBad: "Неудовлетворительно. Повторите тему чтения координат. 📚",
    ptsAddedToast: "Вам начислено +{pts} очков!",
    errorSavingPts: "Ошибка при сохранении очков.",
    roomCancelled: "Соревнование отменено организатором!",
    roomNotFound: "Комната с таким кодом не найдена!",
    roomClosed: "Эта комната уже играет или закрыта!",
    enterCodeError: "Пожалуйста, введите код комнаты!",
    networkError: "Не удалось подключиться к базе данных. Попробуйте позже.",
    timeOutMsg: "Время вышло! 0 очков.",
    backToDashboard: "Панель управления",
    retryBtn: "Играть снова",
    backBtn: "Назад"
  },
  en: {
    title: "GeoGame: Spot Locations",
    tagline: "Identify your location using Google Street View panoramas and compete with classmates!",
    soloTitle: "Solo Game",
    soloDesc: "Explore locations via random Street View panoramas and find them on the map individually.",
    soloBtn: "Start Solo Game",
    battleTitle: "Group Battle (Multiplayer)",
    battleDesc: "Compete with classmates in real-time, identifying the same Street View panoramas!",
    createRoomBtn: "Create Room",
    joinRoomBtn: "Join Room",
    activeRoomsTitle: "Active Game Rooms",
    noActiveRooms: "No active rooms at the moment. Create the first room!",
    enterCodePlaceholder: "Enter room code (e.g. GAT-1234)",
    or: "or",
    roomLabel: "Room",
    hostLabel: "Host",
    playersCount: "Players",
    joinBtn: "Join",
    lobbyTitle: "Battle Lobby",
    roomCodeLabel: "Room Code",
    copyCodeToast: "Room code copied to clipboard!",
    playersListTitle: "Players in Lobby",
    waitingForHost: "Waiting for host to start the game...",
    startBattleBtn: "Start Game",
    cancelBattleBtn: "Close Room",
    leaveRoomBtn: "Leave Room",
    thinking: "Thinking... ⏳",
    ready: "Guessed ✅",
    confirmGuessBtn: "Confirm Guess",
    placedGuess: "Guess placed. Click the confirm button.",
    waitingForOthers: "Waiting for other players to submit their guesses...",
    timeLeft: "Time Left",
    roundLeaderboard: "Round Leaderboard",
    finalLeaderboard: "Final Standings",
    winnerBadge: "Winner",
    pointsWord: "points",
    congratsPro: "Excellent! You are a professional cartographer! 🏆",
    congratsGood: "Good job! Practice a bit more. 👍",
    congratsBad: "Unsatisfactory. Re-read coordinate reading concepts. 📚",
    ptsAddedToast: "+{pts} points added to your score!",
    errorSavingPts: "Failed to save points.",
    roomCancelled: "Battle was cancelled by the host!",
    roomNotFound: "Room code not found!",
    roomClosed: "This room is already in-game or closed!",
    enterCodeError: "Please enter the room code!",
    networkError: "Could not connect to database. Please try again later.",
    timeOutMsg: "Time's up! 0 points.",
    backToDashboard: "Dashboard",
    retryBtn: "Play Again",
    backBtn: "Back"
  }
}

// Game Coordinates List (historical landmarks & city centers in Uzbekistan)
const GAME_LOCATIONS = [
  {
    id: 'loc-1',
    target: { lat: 48.8584, lng: 2.2945 },
    name: { uz: 'Eyfel minorasi, Parij', ru: 'Эйфелева башня, Париж', en: 'Eiffel Tower, Paris' },
    hint: { uz: 'Fransiyaning ramzi, 1889-yilda qurilgan temir minora.', ru: 'Символ Франции, железная башня, построенная в 1889 году.', en: 'Symbol of France, iron tower built in 1889.' }
  },
  {
    id: 'loc-2',
    target: { lat: 40.7580, lng: -73.9855 },
    name: { uz: 'Tayms-Skver, Nyu-York', ru: 'Таймс-сквер, Нью-Йорк', en: 'Times Square, New York' },
    hint: { uz: 'Nyu-Yorkning yorqin reklamalar va Broadway teatrlari bilan mashhur markazi.', ru: 'Яркий центр Нью-Йорка, известный рекламой и театрами Бродвея.', en: 'Bright center of New York, famous for billboards and Broadway theaters.' }
  },
  {
    id: 'loc-3',
    target: { lat: 51.5007, lng: -0.1246 },
    name: { uz: 'Vestminster saroyi, London', ru: 'Вестминстерский дворец, Лондон', en: 'Palace of Westminster, London' },
    hint: { uz: 'Big Ben soat minorasi joylashgan Buyuk Britaniya parlamenti binosi.', ru: 'Здание парламента Великобритании с часовой башней Биг-Бен.', en: 'UK Parliament building with the iconic Big Ben clock tower.' }
  },
  {
    id: 'loc-4',
    target: { lat: 41.8902, lng: 12.4922 },
    name: { uz: 'Kolizey, Rim', ru: 'Колизей, Рим', en: 'Colosseum, Rome' },
    hint: { uz: '70-yilda qurilgan Rimning buyuk amfiteatri — qadimgi dunyoning eng katta stadioni.', ru: 'Великий амфитеатр Рима, построенный в 70 году — крупнейший стадион античного мира.', en: 'Great amphitheater of Rome built in 70 AD — the largest stadium of the ancient world.' }
  },
  {
    id: 'loc-5',
    target: { lat: 41.4036, lng: 2.1744 },
    name: { uz: 'Sagrada Familia, Barselona', ru: 'Саграда Фамилия, Барселона', en: 'Sagrada Familia, Barcelona' },
    hint: { uz: 'Antoni Gaudí loyihalashtirgan Barselonaning mashhur tugallanmagan sobori.', ru: 'Знаменитый незавершённый собор Барселоны, спроектированный Антони Гауди.', en: 'Famous unfinished basilica in Barcelona designed by Antoni Gaudí.' }
  },
  {
    id: 'loc-6',
    target: { lat: 35.6595, lng: 139.7004 },
    name: { uz: 'Shibuya chorrahasи, Tokio', ru: 'Перекрёсток Сибуя, Токио', en: 'Shibuya Crossing, Tokyo' },
    hint: { uz: 'Dunyodagi eng gavjum piyodalar chorrahasi — Tokio Shibuyasidagi ikonik nuqta.', ru: 'Самый оживлённый пешеходный перекрёсток в мире — иконическое место в Токио.', en: 'World\'s busiest pedestrian crossing — iconic spot in Tokyo\'s Shibuya district.' }
  },
  {
    id: 'loc-7',
    target: { lat: 27.1751, lng: 78.0421 },
    name: { uz: 'Toj Mahal, Agra', ru: 'Тадж-Махал, Агра', en: 'Taj Mahal, Agra' },
    hint: { uz: 'Hindistondagi XVII asrda qurilgan oq marmardan noyob maqbara.', ru: 'Уникальный мавзолей из белого мрамора, построенный в Индии в XVII веке.', en: 'Unique white marble mausoleum built in India in the 17th century.' }
  },
  {
    id: 'loc-8',
    target: { lat: 52.5163, lng: 13.3777 },
    name: { uz: 'Brandenburg darvozasi, Berlin', ru: 'Бранденбургские ворота, Берлин', en: 'Brandenburg Gate, Berlin' },
    hint: { uz: 'Germaniyaning birlashuvi ramzi, XVIII asrda qurilgan neoklassik darvoza.', ru: 'Символ объединения Германии, неоклассические ворота, построенные в XVIII веке.', en: 'Symbol of German reunification, neoclassical gate built in the 18th century.' }
  },
  {
    id: 'loc-9',
    target: { lat: 25.1972, lng: 55.2744 },
    name: { uz: 'Burj Xalifa, Dubai', ru: 'Бурдж-Халифа, Дубай', en: 'Burj Khalifa, Dubai' },
    hint: { uz: 'Dunyodagi eng baland bino — 828 metr balandlikdagi Dubay mo\'jizasi.', ru: 'Самое высокое здание в мире — чудо Дубая высотой 828 метров.', en: 'World\'s tallest building — 828-meter miracle of Dubai.' }
  },
  {
    id: 'loc-10',
    target: { lat: 37.9715, lng: 23.7267 },
    name: { uz: 'Akropol, Afina', ru: 'Акрополь, Афины', en: 'Acropolis, Athens' },
    hint: { uz: 'Afina tepaligida joylashgan Partenon ibodatxonasi bilan mashhur qadimiy qal\'a.', ru: 'Древняя крепость на холме Афин, известная храмом Парфенон.', en: 'Ancient citadel on Athens hill, famous for the Parthenon temple.' }
  },
  {
    id: 'loc-11',
    target: { lat: 37.8199, lng: -122.4783 },
    name: { uz: 'Oltin Darvoza ko\'prigi, San-Fransisko', ru: 'Мост Золотые Ворота, Сан-Франциско', en: 'Golden Gate Bridge, San Francisco' },
    hint: { uz: '1937-yilda qurilgan Atlantika-Tinch okean yo\'lida joylashgan ikonik to\'g\'ri ko\'prik.', ru: 'Культовый подвесной мост, построенный в 1937 году в Сан-Франциско.', en: 'Iconic suspension bridge built in 1937 in San Francisco.' }
  },
  {
    id: 'loc-12',
    target: { lat: 41.0086, lng: 28.9802 },
    name: { uz: 'Oyasofiya, Istanbul', ru: 'Собор Святой Софии, Стамбул', en: 'Hagia Sophia, Istanbul' },
    hint: { uz: '537-yilda qurilgan, avval cherkov, keyin masjidga aylangan buyuk me\'moriy obida.', ru: 'Великий архитектурный памятник, построенный в 537 году, бывший собор, затем мечеть.', en: 'Great architectural monument built in 537, formerly a church, then a mosque.' }
  },
  {
    id: 'loc-13',
    target: { lat: 48.8606, lng: 2.3376 },
    name: { uz: 'Luvr muzeyi, Parij', ru: 'Музей Лувр, Париж', en: 'Louvre Museum, Paris' },
    hint: { uz: 'Dunyodagi eng katta va ko\'p tashrif buyuriladigan san\'at muzeyi — shisha piramida bilan mashhur.', ru: 'Крупнейший и наиболее посещаемый художественный музей мира, известный стеклянной пирамидой.', en: 'World\'s largest and most visited art museum, famous for its glass pyramid.' }
  },
  {
    id: 'loc-14',
    target: { lat: -33.8568, lng: 151.2153 },
    name: { uz: 'Sidney Opera uyi, Sidney', ru: 'Сиднейский оперный театр, Сидней', en: 'Sydney Opera House, Sydney' },
    hint: { uz: 'Avstraliyaning ramzi, dengiz to\'lqinlari shaklida qurilgan opera binosi.', ru: 'Символ Австралии, здание оперы в форме морских волн.', en: 'Symbol of Australia, opera house shaped like ocean waves.' }
  },
  {
    id: 'loc-15',
    target: { lat: 55.7525, lng: 37.6231 },
    name: { uz: 'Qizil Maydon, Moskva', ru: 'Красная площадь, Москва', en: 'Red Square, Moscow' },
    hint: { uz: 'Moskvaning tarixiy markazi — Vasil Blazhenniy sobori va Kreml\'ga tutashgan bosh maydon.', ru: 'Исторический центр Москвы — главная площадь рядом с собором Василия Блаженного и Кремлём.', en: 'Historical center of Moscow — main square next to St. Basil\'s Cathedral and the Kremlin.' }
  },
  {
    id: 'loc-16',
    target: { lat: 51.1789, lng: -1.8262 },
    name: { uz: 'Stonehendj, Angliya', ru: 'Стоунхендж, Англия', en: 'Stonehenge, England' },
    hint: { uz: 'Angliyaning Solsberi tekisligidagi miloddan avvalgi sirli tosh tuzilma.', ru: 'Таинственное каменное сооружение на Солсберийской равнине Англии, датируемое до нашей эры.', en: 'Mysterious prehistoric stone structure on Salisbury Plain, England.' }
  },
  {
    id: 'loc-17',
    target: { lat: 29.9792, lng: 31.1342 },
    name: { uz: 'Giza piramidasi, Misr', ru: 'Пирамиды Гизы, Египет', en: 'Pyramids of Giza, Egypt' },
    hint: { uz: 'Dunyo mo\'jizalaridan biri — Qadimgi Misr fir\'avnlari uchun qurilgan ulkan qabr inshooti.', ru: 'Одно из чудес света — огромная гробница, построенная для фараонов Древнего Египта.', en: 'One of the wonders of the world — massive tomb built for pharaohs of Ancient Egypt.' }
  },
  {
    id: 'loc-18',
    target: { lat: 48.8698, lng: 2.3078 },
    name: { uz: 'Shanz-Elize xiyoboni, Parij', ru: 'Елисейские Поля, Париж', en: 'Champs-Élysées, Paris' },
    hint: { uz: 'Parijning eng mashhur ko\'chasi — G\'alaba yoyi bilan boshlangan ulug\'vor xiyobon.', ru: 'Самая известная улица Парижа — грандиозный проспект, начинающийся от Триумфальной арки.', en: 'Most famous street in Paris — grand boulevard starting from the Arc de Triomphe.' }
  },
  {
    id: 'loc-19',
    target: { lat: 40.4319, lng: 116.5704 },
    name: { uz: 'Xitoy buyuk devori, Pekin yaqini', ru: 'Великая Китайская стена, близ Пекина', en: 'Great Wall of China, near Beijing' },
    hint: { uz: 'Miloddan avvalgi III asrdan boshlab qurilgan, Xitoyni himoya qilgan ulkan mudofaa devori.', ru: 'Грандиозная оборонительная стена, защищавшая Китай, строившаяся с III века до н.э.', en: 'Massive defensive wall protecting China, built from the 3rd century BC.' }
  },
  {
    id: 'loc-20',
    target: { lat: 41.9022, lng: 12.4534 },
    name: { uz: 'Muqaddas Butrus maydoni, Vatikan', ru: 'Площадь Святого Петра, Ватикан', en: 'St. Peter\'s Square, Vatican' },
    hint: { uz: 'Katolik dunyosining markazi — Rim papasi yashaydi va ibodatga chaqiradi.', ru: 'Центр католического мира — резиденция папы римского и место богослужений.', en: 'Center of the Catholic world — residence of the Pope and place of worship.' }
  }
]

const PREDEFINED_UZ_FEATURES = [
  {
    id: 'uz-f1',
    target: { lat: 41.6201, lng: 70.0160 },
    name: { uz: 'Chimyon tog\'i', ru: 'Гора Чимган', en: 'Mount Chimgan' },
    hint: { uz: 'Toshkent viloyatidagi eng baland tog\' cho\'qqilaridan biri — qishki kurort hududi.', ru: 'Одна из самых высоких горных вершин Ташкентской области — горнолыжный курорт.', en: 'One of the highest mountain peaks in Tashkent region — a winter resort area.' }
  },
  {
    id: 'uz-f2',
    target: { lat: 41.6253, lng: 70.0402 },
    name: { uz: 'Chorvoq suv ombori', ru: 'Чарвакское водохранилище', en: 'Charvak Reservoir' },
    hint: { uz: 'Ugam-Chotqol milliy bog\'idagi mashhur yirik sun\'iy ko\'l.', ru: 'Популярное крупное искусственное озеро в Угам-Чаткальском национальном парке.', en: 'Popular large artificial lake in the Ugam-Chatkal National Park.' }
  },
  {
    id: 'uz-f3',
    target: { lat: 43.7667, lng: 59.0333 },
    name: { uz: 'Mo\'ynoq kema qabristoni (Orol dengizi)', ru: 'Кладбище кораблей в Муйнаке (Аральское море)', en: 'Muynak Ship Graveyard (Aral Sea)' },
    hint: { uz: 'Qurib qolgan Orol dengizining sobiq tubidagi tashlab ketilgan kemalar qabristoni.', ru: 'Кладбище заброшенных кораблей на бывшем дне высохшего Аральского моря.', en: 'Graveyard of abandoned ships on the former bed of the dried-up Aral Sea.' }
  },
  {
    id: 'uz-f4',
    target: { lat: 39.6022, lng: 68.3244 },
    name: { uz: 'Zomin milliy bog\'i', ru: 'Зааминский национальный парк', en: 'Zaamin National Park' },
    hint: { uz: 'Jizzax viloyatidagi archazor o\'rmonlar va toza havoli tog\'lar o\'lkasi.', ru: 'Край арчовых лесов и чистого горного воздуха в Джизакской области.', en: 'Land of juniper forests and fresh mountain air in the Jizzakh region.' }
  },
  {
    id: 'uz-f5',
    target: { lat: 39.3528, lng: 66.9038 },
    name: { uz: 'Taxtaqoracha dovoni (Kitob dovoni)', ru: 'Перевал Тахтакарача', en: 'Takhtakaracha Pass' },
    hint: { uz: 'Samarqand va Qashqadaryo viloyatlarini bog\'lovchi go\'zal tog\' dovoni.', ru: 'Живописный горный перевал, соединяющий Самаркандскую и Кашкадарьинскую области.', en: 'Scenic mountain pass connecting Samarkand and Kashkadarya regions.' }
  },
  {
    id: 'uz-f6',
    target: { lat: 40.7181, lng: 66.7844 },
    name: { uz: 'Aydarkul ko\'li bo\'yi', ru: 'Озеро Айдаркуль', en: 'Aydarkul Lake' },
    hint: { uz: 'Qizilqum cho\'li markazidagi yirik sho\'r ko\'l.', ru: 'Крупное соленое озеро в центре пустыни Кызылкум.', en: 'Large saline lake in the center of the Kyzylkum Desert.' }
  },
  {
    id: 'uz-f7',
    target: { lat: 38.9667, lng: 67.3333 },
    name: { uz: 'Hisor tog\' tizmalari', ru: 'Гиссарский хребет', en: 'Hissar Mountain Range' },
    hint: { uz: 'O\'zbekistonning eng baland cho\'qqilari joylashgan rugged ohaktosh tog\'lari.', ru: 'Суровые известняковые горы, где расположены самые высокие вершины Узбекистана.', en: 'Rugged limestone mountains housing the highest peaks in Uzbekistan.' }
  },
  {
    id: 'uz-f8',
    target: { lat: 41.5333, lng: 60.6333 },
    name: { uz: 'Amudaryo vodiysi', ru: 'Долина реки Амударья', en: 'Amu Darya River Valley' },
    hint: { uz: 'O\'rta Osiyodagi eng yirik daryolardan birining keng qumli o\'zani.', ru: 'Широкое песчаное русло одной из крупнейших рек Средней Азии.', en: 'Wide sandy bed of one of the largest rivers in Central Asia.' }
  }
]

const PREDEFINED_WORLD_FEATURES = [
  {
    id: 'w-f1',
    target: { lat: 28.0026, lng: 86.8528 },
    name: { uz: 'Everest tog\'i bazaviy lageri', ru: 'Базовый лагерь Эвереста', en: 'Mount Everest Base Camp' },
    hint: { uz: 'Dunyodagi eng baland cho\'qqining etagida joylashgan alpinistlar boshpanasi.', ru: 'Приют альпинистов у подножия самой высокой вершины мира.', en: 'Shelter for climbers at the foot of the highest peak in the world.' }
  },
  {
    id: 'w-f2',
    target: { lat: 36.0573, lng: -112.1432 },
    name: { uz: 'Grand Kanyon, AQSh', ru: 'Гранд-Каньон, США', en: 'Grand Canyon, USA' },
    hint: { uz: 'Kolorado daryosi million yillar davomida o\'yib chiqqan ulkan darasi.', ru: 'Гигантское ущелье, высеченное рекой Колорадо за миллионы лет.', en: 'Giant gorge carved by the Colorado River over millions of years.' }
  },
  {
    id: 'w-f3',
    target: { lat: 35.3606, lng: 138.7274 },
    name: { uz: 'Fuji tog\'i, Yaponiya', ru: 'Гора Фудзи, Япония', en: 'Mount Fuji, Japan' },
    hint: { uz: 'Yaponiyaning ramzi bo\'lgan qorli faol vulqon cho\'qqisi.', ru: 'Заснеженная вершина действующего вулкана, символ Японии.', en: 'Snow-capped active volcano peak, symbol of Japan.' }
  },
  {
    id: 'w-f4',
    target: { lat: 31.0983, lng: -3.9822 },
    name: { uz: 'Sahroi Kabir (Merzuga barxanlari)', ru: 'Пустыня Сахара (дюны Мерзуга)', en: 'Sahara Desert (Merzouga dunes)' },
    hint: { uz: 'Dunyodagi eng katta issiq cho\'lning ulkan to\'q sariq qum tepaliklari.', ru: 'Гигантские оранжевые песчаные холмы крупнейшей жаркой пустыни в мире.', en: 'Gigantic orange sand dunes of the largest hot desert in the world.' }
  },
  {
    id: 'w-f5',
    target: { lat: 45.9763, lng: 7.6585 },
    name: { uz: 'Alp tog\'lari (Matterhorn, Shveysariya)', ru: 'Альпы (Маттерхорн, Швейцария)', en: 'Swiss Alps (Matterhorn)' },
    hint: { uz: 'Piramida shaklidagi go\'zal cho\'qqi — Yevropa Alplari ramzi.', ru: 'Живописная пирамидальная вершина — символ европейских Альп.', en: 'Picturesque pyramidal peak — symbol of the European Alps.' }
  },
  {
    id: 'w-f6',
    target: { lat: 43.0828, lng: -79.0742 },
    name: { uz: 'Niagara sharsharasi', ru: 'Ниагарский водопад', en: 'Niagara Falls' },
    hint: { uz: 'AQSh va Kanada chegarasidagi dunyoning eng sersuv sharsharalaridan biri.', ru: 'Один из самых полноводных водопадов мира на границе США и Канады.', en: 'One of the most voluminous waterfalls in the world on the US-Canada border.' }
  },
  {
    id: 'w-f7',
    target: { lat: -3.1319, lng: -60.0242 },
    name: { uz: 'Amazonka daryosi, Braziliya', ru: 'Река Амазонка, Бразилия', en: 'Amazon River, Brazil' },
    hint: { uz: 'Dunyodagi eng sersuv daryo va uni o\'rab turgan zich tropik o\'rmonlar.', ru: 'Самая полноводная река мира и окружающие её густые тропические леса.', en: 'The most voluminous river in the world and its surrounding dense rainforests.' }
  },
  {
    id: 'w-f8',
    target: { lat: -17.9243, lng: 25.8572 },
    name: { uz: 'Viktoriya sharsharasi', ru: 'Водопад Виктория', en: 'Victoria Falls' },
    hint: { uz: 'Zambezi daryosidagi ulkan sharshara — \"gumburlovchi tutun\" deb ham ataladi.', ru: 'Гигантский водопад на реке Замбези, также называемый \"гремящим дымом\".', en: 'Giant waterfall on the Zambezi River, also called \"the smoke that thunders\".' }
  },
  {
    id: 'w-f9',
    target: { lat: 64.3104, lng: -20.3024 },
    name: { uz: 'Geysir issiq buloqlari, Islandiya', ru: 'Горячие источники Гейсир, Исландия', en: 'Geysir Hot Springs, Iceland' },
    hint: { uz: 'Vaqti-vaqti bilan qaynoq suv otilib chiquvchi geotermal hudud.', ru: 'Геотермальная зона с периодически извергающимися фонтанами горячей воды.', en: 'Geothermal area with periodically erupting fountains of hot water.' }
  },
  {
    id: 'w-f10',
    target: { lat: -0.7401, lng: -90.3113 },
    name: { uz: 'Galapagos orollari', ru: 'Галапагосские острова', en: 'Galapagos Islands' },
    hint: { uz: 'Tinch okeanidagi noyob hayvonot dunyosi va vulqonli tuproqli orollar.', ru: 'Острова в Тихом океане с уникальным животным миром и вулканической почвой.', en: 'Islands in the Pacific Ocean with unique wildlife and volcanic soil.' }
  }
]



// Helper: Custom SVG Icon for markers
const createMarkerIcon = (type = 'click') => {
  const color = type === 'target' ? '#10b981' : '#ef4444'
  const svg = type === 'target'
    ? `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" style="width: 32px; height: 32px; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.3));">
        <path fill-rule="evenodd" d="M3 2.25a.75.75 0 01.75.75v.54l1.838-.46a9.75 9.75 0 016.725.738l.108.054a8.25 8.25 0 005.18.893l3.087-.617a.75.75 0 01.898.721v10.182a.75.75 0 01-.601.737l-3.086.618a9.75 9.75 0 01-6.725-.738l-.108-.054a8.25 8.25 0 00-5.18-.893l-1.837.368v6.182a.75.75 0 01-1.5 0V3z" clip-rule="evenodd" />
      </svg>
    `
    : `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" style="width: 32px; height: 32px; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.3));">
        <path fill-rule="evenodd" d="M12 2.25a.75.75 0 01.75.75v1.616a8.25 8.25 0 005.38 5.38h1.62a.75.75 0 010 1.5h-1.62a8.25 8.25 0 00-5.38 5.38v1.62a.75.75 0 01-1.5 0v-1.62a8.25 8.25 0 00-5.38-5.38H3.75a.75.75 0 010-1.5h1.62a8.25 8.25 0 005.38-5.38V3a.75.75 0 01.75-.75zM12 15a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
      </svg>
    `

  return L.divIcon({
    html: `<div style="display: flex; align-items: center; justify-content: center;">${svg}</div>`,
    className: 'custom-game-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  })
}

export default function GamificationPage() {
  const { i18n } = useTranslation()
  const { currentUser, updateUser } = useAuth()
  const navigate = useNavigate()
  const lang = i18n.language?.slice(0, 2) || 'uz'

  // Translation helper
  const translate = (key, params = {}) => {
    let text = localT[lang]?.[key] || localT['uz']?.[key] || key
    Object.keys(params).forEach(p => {
      text = text.replace(`{${p}}`, params[p])
    })
    return text
  }

  // Ref variables for Leaflet (guess map)
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)

  // Overlay references (Solo)
  const clickMarkerRef = useRef(null)
  const targetMarkerRef = useRef(null)
  const lineRef = useRef(null)

  // Overlay references (Multiplayer)
  const playerMarkersRef = useRef([])
  const playerLinesRef = useRef([])

  // Global Game Modes
  const [gameMode, setGameMode] = useState(null) // 'solo' | 'battle' | null
  const [screen, setScreen] = useState('start') // 'start', 'lobby', 'playing', 'summary'
  
  // Solo / Shared States
  const [roundsList, setRoundsList] = useState([])
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [isRoundFinished, setIsRoundFinished] = useState(false)
  const [hoverCoords, setHoverCoords] = useState(null)
  const [roundDistance, setRoundDistance] = useState(null)
  const [roundPoints, setRoundPoints] = useState(0)

  // Multiplayer (Battle) States
  const [inputCode, setInputCode] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [roomData, setRoomData] = useState(null)
  const [activeRooms, setActiveRooms] = useState([])
  const [isHost, setIsHost] = useState(false)
  const [tempGuess, setTempGuess] = useState(null)
  const [countdown, setCountdown] = useState(45)
  const [scoreSynced, setScoreSynced] = useState(false)

  // Dynamic street view generation options
  const [gameTheme, setGameTheme] = useState('landmarks') // 'landmarks' | 'uz_streets' | 'world_streets'
  const [loadingRounds, setLoadingRounds] = useState(false)

  // UI state for hints & map hover
  const [showHint, setShowHint] = useState(false)
  const [mapHovered, setMapHovered] = useState(false)
  const [isMapFullscreen, setIsMapFullscreen] = useState(false)

  // Street View Embed API — uses iframe with referrerPolicy=no-referrer to bypass key restrictions
  const streetViewContainerRef = useRef(null)
  const [svLoading, setSvLoading] = useState(true)
  const [svError, setSvError] = useState(false)

  const getStreetViewEmbedUrl = (lat, lng) => {
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    return `https://www.google.com/maps/embed/v1/streetview?key=${key}&location=${lat},${lng}&heading=0&pitch=0&fov=90`
  }

  // --- DYNAMIC STREET VIEW GENERATION ALGORITHMS ---
  const generateRandomStreetLocationUz = () => {
    const REGIONS = [
      { lat: 41.2995, lng: 69.2401, name: "Toshkent" },
      { lat: 39.6542, lng: 66.9597, name: "Samarqand" },
      { lat: 39.7777, lng: 64.4108, name: "Buxoro" },
      { lat: 41.3783, lng: 60.3601, name: "Xiva" },
      { lat: 40.7833, lng: 72.3500, name: "Andijon" },
      { lat: 40.3842, lng: 71.7878, name: "Farg'ona" },
      { lat: 41.0011, lng: 71.6683, name: "Namangan" },
      { lat: 38.8617, lng: 65.7892, name: "Qarshi" },
      { lat: 40.1030, lng: 65.3739, name: "Navoiy" },
      { lat: 37.2242, lng: 67.2783, name: "Termiz" },
      { lat: 40.4900, lng: 68.7800, name: "Guliston" },
      { lat: 40.5283, lng: 70.9425, name: "Qo'qon" },
      { lat: 42.4647, lng: 59.6019, name: "Nukus" },
      { lat: 41.5500, lng: 60.6333, name: "Urganch" }
    ]
    const center = REGIONS[Math.floor(Math.random() * REGIONS.length)]
    // Random offset within 0.08 degrees (~8km)
    const offsetLat = (Math.random() - 0.5) * 0.08
    const offsetLng = (Math.random() - 0.5) * 0.08
    return {
      lat: center.lat + offsetLat,
      lng: center.lng + offsetLng,
      cityName: center.name
    }
  }

  const generateRandomStreetLocationGlobal = () => {
    const REGIONS = [
      { lat: 48.8566, lng: 2.3522, name: "Parij, Fransiya" },
      { lat: 40.7128, lng: -74.0060, name: "Nyu-York, AQSh" },
      { lat: 51.5074, lng: -0.1278, name: "London, Angliya" },
      { lat: 35.6762, lng: 139.6503, name: "Tokio, Yaponiya" },
      { lat: 41.8919, lng: 12.5113, name: "Rim, Italiya" },
      { lat: 41.3851, lng: 2.1734, name: "Barselona, Ispaniya" },
      { lat: 52.5200, lng: 13.4050, name: "Berlin, Germaniya" },
      { lat: 25.2048, lng: 55.2708, name: "Dubay, BAA" },
      { lat: -33.8688, lng: 151.2093, name: "Sidney, Avstraliya" },
      { lat: 41.0082, lng: 28.9784, name: "Istanbul, Turkiya" },
      { lat: 37.7749, lng: -122.4194, name: "San-Fransisko, AQSh" },
      { lat: -22.9068, lng: -43.1729, name: "Rio-de-Janeyro, Braziliya" },
      { lat: 34.0522, lng: -118.2437, name: "Los-Anjeles, AQSh" },
      { lat: 1.3521, lng: 103.8198, name: "Singapur" },
      { lat: 43.6532, lng: -79.3832, name: "Toronto, Kanada" },
      { lat: 55.7558, lng: 37.6173, name: "Moskva, Rossiya" }
    ]
    const center = REGIONS[Math.floor(Math.random() * REGIONS.length)]
    // Random offset within 0.12 degrees (~12km)
    const offsetLat = (Math.random() - 0.5) * 0.12
    const offsetLng = (Math.random() - 0.5) * 0.12
    return {
      lat: center.lat + offsetLat,
      lng: center.lng + offsetLng,
      cityName: center.name
    }
  }

  const fetchRandomStreetLocations = (count = 5, mode = 'uzbekistan') => {
    return new Promise((resolve) => {
      if (!window.google?.maps) {
        // Fallback to pre-defined locations if Google Maps script is not yet loaded
        const shuffled = [...GAME_LOCATIONS].sort(() => 0.5 - Math.random())
        resolve(shuffled.slice(0, count))
        return
      }

      const sv = new window.google.maps.StreetViewService()
      const results = []
      let attempts = 0
      const maxAttempts = 30

      const findNext = () => {
        if (results.length >= count || attempts >= maxAttempts) {
          if (results.length < count) {
            const remaining = count - results.length
            const shuffled = [...GAME_LOCATIONS].sort(() => 0.5 - Math.random())
            resolve([...results, ...shuffled.slice(0, remaining)])
          } else {
            resolve(results)
          }
          return
        }

        attempts++
        const rawLoc = mode === 'uzbekistan' 
          ? generateRandomStreetLocationUz() 
          : generateRandomStreetLocationGlobal()

        sv.getPanorama({ location: { lat: rawLoc.lat, lng: rawLoc.lng }, radius: 5000 }, (data, status) => {
          if (status === 'OK') {
            const panoLat = data.location.latLng.lat()
            const panoLng = data.location.latLng.lng()
            const resolvedName = data.location.description || rawLoc.cityName

            results.push({
              id: `rand-${Math.random().toString(36).substr(2, 9)}`,
              target: { lat: panoLat, lng: panoLng },
              name: {
                uz: resolvedName,
                ru: resolvedName,
                en: resolvedName
              },
              hint: {
                uz: `${rawLoc.cityName} hududidagi tasodifiy ko'cha.`,
                ru: `Случайная улица в районе ${rawLoc.cityName}.`,
                en: `Random street in the area of ${rawLoc.cityName}.`
              }
            })
          }
          findNext()
        })
      }

      findNext()
    })
  }

  // Pre-load Google Maps JavaScript SDK for StreetViewService checks
  useEffect(() => {
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    if (key && !window.google?.maps && !document.getElementById('gmaps-js')) {
      const script = document.createElement('script')
      script.id = 'gmaps-js'
      script.src = `https://maps.googleapis.com/maps/api/js?key=${key}`
      script.defer = true
      document.head.appendChild(script)
    }
  }, [])

  // Clear overlays
  const clearPlayerOverlays = useCallback(() => {
    if (mapRef.current) {
      playerMarkersRef.current.forEach(m => mapRef.current.removeLayer(m))
      playerLinesRef.current.forEach(l => mapRef.current.removeLayer(l))
    }
    playerMarkersRef.current = []
    playerLinesRef.current = []
  }, [])

  const clearOverlays = useCallback(() => {
    if (mapRef.current) {
      if (clickMarkerRef.current) mapRef.current.removeLayer(clickMarkerRef.current)
      if (targetMarkerRef.current) mapRef.current.removeLayer(targetMarkerRef.current)
      if (lineRef.current) mapRef.current.removeLayer(lineRef.current)
    }
    clickMarkerRef.current = null
    targetMarkerRef.current = null
    lineRef.current = null
    clearPlayerOverlays()
  }, [clearPlayerOverlays])

  // --- SOLO MODE HANDLERS ---
  const handleStartSolo = async () => {
    setGameMode('solo')
    setScoreSynced(false)
    setShowHint(false)
    setLoadingRounds(true)

    let selected = []
    if (gameTheme === 'landmarks') {
      const shuffled = [...GAME_LOCATIONS].sort(() => 0.5 - Math.random())
      selected = shuffled.slice(0, 5)
    } else if (gameTheme === 'uz_features') {
      const shuffled = [...PREDEFINED_UZ_FEATURES].sort(() => 0.5 - Math.random())
      selected = shuffled.slice(0, 5)
    } else if (gameTheme === 'world_features') {
      const shuffled = [...PREDEFINED_WORLD_FEATURES].sort(() => 0.5 - Math.random())
      selected = shuffled.slice(0, 5)
    } else {
      const shuffled = [...GAME_LOCATIONS].sort(() => 0.5 - Math.random())
      selected = shuffled.slice(0, 5)
    }

    setRoundsList(selected)
    setCurrentRoundIdx(0)
    setScore(0)
    setIsRoundFinished(false)
    setRoundDistance(null)
    setRoundPoints(0)
    setLoadingRounds(false)
    setScreen('playing')
  }

  const handleFinishSolo = useCallback(async () => {
    clearOverlays()
    setScreen('summary')

    if (currentUser) {
      const currentScore = currentUser.totalScore || 0
      const newScore = currentScore + score
      try {
        await updateUser({ totalScore: newScore })
        toast.success(translate('ptsAddedToast', { pts: score }))
      } catch (err) {
        toast.error(translate('errorSavingPts'))
        console.error(err)
      }
    }
  }, [clearOverlays, currentUser, score, updateUser])

  const handleNextRoundSolo = () => {
    clearOverlays()
    setIsRoundFinished(false)
    setRoundDistance(null)
    setRoundPoints(0)
    setShowHint(false)

    if (mapRef.current) {
      const center = gameTheme === 'uz_features' ? [40.0, 66.0] : [20.0, 0.0]
      const zoom = gameTheme === 'uz_features' ? 6.5 : 2
      mapRef.current.setView(center, zoom)
    }

    if (currentRoundIdx + 1 < roundsList.length) {
      setCurrentRoundIdx((idx) => idx + 1)
    } else {
      handleFinishSolo()
    }
  }

  // --- MULTIPLAYER (BATTLE) HANDLERS ---

  // Listen to active rooms
  useEffect(() => {
    if (!db) return
    if (screen !== 'start' || gameMode !== 'battle') return

    const q = query(collection(db, 'georooms'), where('status', '==', 'waiting'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rooms = []
      snapshot.forEach((doc) => {
        rooms.push({ id: doc.id, ...doc.data() })
      })
      rooms.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
      setActiveRooms(rooms)
    }, (err) => {
      console.error("Active rooms listener error:", err)
    })

    return () => unsubscribe()
  }, [screen, gameMode])

  // Create battle room
  const handleCreateRoom = async () => {
    if (!db) {
      toast.error(translate('networkError'))
      return
    }
    if (!currentUser) return
    setLoadingRounds(true)

    let selectedRounds = []
    if (gameTheme === 'landmarks') {
      const shuffled = [...GAME_LOCATIONS].sort(() => 0.5 - Math.random())
      selectedRounds = shuffled.slice(0, 5)
    } else if (gameTheme === 'uz_features') {
      const shuffled = [...PREDEFINED_UZ_FEATURES].sort(() => 0.5 - Math.random())
      selectedRounds = shuffled.slice(0, 5)
    } else if (gameTheme === 'world_features') {
      const shuffled = [...PREDEFINED_WORLD_FEATURES].sort(() => 0.5 - Math.random())
      selectedRounds = shuffled.slice(0, 5)
    } else {
      const shuffled = [...GAME_LOCATIONS].sort(() => 0.5 - Math.random())
      selectedRounds = shuffled.slice(0, 5)
    }

    const code = `GAT-${Math.floor(1000 + Math.random() * 9000)}`

    const payload = {
      roomId: code,
      hostId: currentUser.uid,
      hostName: currentUser.name || currentUser.email,
      status: 'waiting',
      rounds: selectedRounds,
      gameTheme: gameTheme,
      currentRound: 0,
      roundStatus: 'guessing',
      players: {
        [currentUser.uid]: {
          uid: currentUser.uid,
          name: currentUser.name || currentUser.email,
          avatar: currentUser.avatar || null,
          hasGuessed: false,
          totalScore: 0,
          currentGuess: null
        }
      },
      createdAt: serverTimestamp(),
      lastActive: serverTimestamp()
    }

    try {
      const roomRef = doc(db, 'georooms', code)
      await setDoc(roomRef, payload)
      setRoomCode(code)
      setIsHost(true)
      setScoreSynced(false)
      setLoadingRounds(false)
      setScreen('lobby')
    } catch (err) {
      console.error("Room creation error:", err)
      toast.error(translate('networkError'))
      setLoadingRounds(false)
    }
  }

  // Join battle room
  const handleJoinRoom = async (code) => {
    if (!db) {
      toast.error(translate('networkError'))
      return
    }
    if (!currentUser) return
    
    const cleanCode = code.trim().toUpperCase()
    if (!cleanCode) {
      toast.error(translate('enterCodeError'))
      return
    }

    try {
      const roomRef = doc(db, 'georooms', cleanCode)
      const docSnap = await getDoc(roomRef)

      if (!docSnap.exists()) {
        toast.error(translate('roomNotFound'))
        return
      }

      const data = docSnap.data()
      if (data.status !== 'waiting') {
        toast.error(translate('roomClosed'))
        return
      }

      const playerPayload = {
        uid: currentUser.uid,
        name: currentUser.name || currentUser.email,
        avatar: currentUser.avatar || null,
        hasGuessed: false,
        totalScore: 0,
        currentGuess: null
      }

      await updateDoc(roomRef, {
        [`players.${currentUser.uid}`]: playerPayload,
        lastActive: serverTimestamp()
      })

      setRoomCode(cleanCode)
      setIsHost(false)
      setScoreSynced(false)
      setScreen('lobby')
    } catch (err) {
      console.error("Join room error:", err)
      toast.error(translate('networkError'))
    }
  }

  // Host Start Game
  const handleHostStartGame = async () => {
    if (!roomCode || !isHost) return
    const roomRef = doc(db, 'georooms', roomCode)
    try {
      await updateDoc(roomRef, {
        status: 'playing',
        currentRound: 0,
        roundStatus: 'guessing',
        lastActive: serverTimestamp()
      })
    } catch (err) {
      console.error(err)
      toast.error("O'yinni boshlashda xatolik yuz berdi")
    }
  }

  // Leave / Cancel Room
  const handleLeaveRoom = async () => {
    if (!roomCode || !roomData) {
      setScreen('start')
      setGameMode(null)
      setRoomCode('')
      setRoomData(null)
      setIsHost(false)
      return
    }

    const roomRef = doc(db, 'georooms', roomCode)
    try {
      if (isHost) {
        await updateDoc(roomRef, { status: 'cancelled' })
        setTimeout(async () => {
          try {
            await deleteDoc(roomRef)
          } catch (e) {}
        }, 1500)
      } else {
        const updatedPlayers = { ...roomData.players }
        delete updatedPlayers[currentUser.uid]
        await updateDoc(roomRef, {
          players: updatedPlayers
        })
      }
    } catch (e) {
      console.error(e)
    } finally {
      setScreen('start')
      setGameMode(null)
      setRoomCode('')
      setRoomData(null)
      setIsHost(false)
      clearOverlays()
    }
  }

  // Confirm guess (Battle)
  const handleConfirmGuess = async () => {
    if (!roomCode || !roomData || !tempGuess || !currentUser) return

    const activeLoc = roomData.rounds[roomData.currentRound]
    const targetCoords = activeLoc.target
    
    const clickLatLng = L.latLng(tempGuess.lat, tempGuess.lng)
    const targetLatLng = L.latLng(targetCoords.lat, targetCoords.lng)
    const distance = clickLatLng.distanceTo(targetLatLng)

    let pts = 0
    if (distance < 150) pts = 100
    else if (distance < 1000) pts = 85
    else if (distance < 4000) pts = 65
    else if (distance < 15000) pts = 45
    else if (distance < 50000) pts = 25
    else if (distance < 150000) pts = 10
    else pts = 0

    const roomRef = doc(db, 'georooms', roomCode)
    try {
      await updateDoc(roomRef, {
        [`players.${currentUser.uid}.currentGuess`]: {
          lat: tempGuess.lat,
          lng: tempGuess.lng,
          distance: distance,
          points: pts
        },
        [`players.${currentUser.uid}.hasGuessed`]: true
      })
      setIsRoundFinished(true)
      toast.success(translate('placedGuess'))
    } catch (err) {
      console.error(err)
      toast.error("Javob yuborishda xatolik yuz berdi")
    }
  }

  // Time Out Submission
  const handleTimeOutSubmit = useCallback(async () => {
    if (!roomCode || !currentUser) return
    const roomRef = doc(db, 'georooms', roomCode)
    try {
      await updateDoc(roomRef, {
        [`players.${currentUser.uid}.currentGuess`]: {
          lat: 40.0,
          lng: 66.0,
          distance: 999999,
          points: 0
        },
        [`players.${currentUser.uid}.hasGuessed`]: true
      })
      setIsRoundFinished(true)
      toast.error(translate('timeOutMsg'))
    } catch (err) {
      console.error(err)
    }
  }, [roomCode, currentUser])

  // Host transition to next round
  const handleHostNextRound = async () => {
    if (!roomCode || !roomData || !isHost) return

    const roomRef = doc(db, 'georooms', roomCode)
    const nextRound = roomData.currentRound + 1
    const isFinished = nextRound >= 5

    try {
      const updates = {}
      Object.keys(roomData.players).forEach(uid => {
        const player = roomData.players[uid]
        const earned = player.currentGuess?.points || 0
        updates[`players.${uid}.totalScore`] = (player.totalScore || 0) + earned
        updates[`players.${uid}.hasGuessed`] = false
        updates[`players.${uid}.currentGuess`] = null
      })

      if (isFinished) {
        updates.status = 'finished'
      } else {
        updates.currentRound = nextRound
        updates.roundStatus = 'guessing'
      }

      await updateDoc(roomRef, updates)
    } catch (err) {
      console.error(err)
      toast.error("Raundni o'zgartirishda xatolik!")
    }
  }

  // --- MULTIPLAYER REAL-TIME LISTENER EFFECTS ---

  // Listen to current room
  useEffect(() => {
    if (gameMode !== 'battle' || !roomCode) return

    const roomRef = doc(db, 'georooms', roomCode)
    const unsubscribe = onSnapshot(roomRef, (snapshot) => {
      if (!snapshot.exists()) {
        if (screen !== 'start') {
          toast.error(translate('roomCancelled'))
          setScreen('start')
          setGameMode(null)
          setRoomCode('')
          setRoomData(null)
          setIsHost(false)
        }
        return
      }

      const data = snapshot.data()
      setRoomData(data)

      if (data.status === 'cancelled') {
        toast.error(translate('roomCancelled'))
        setScreen('start')
        setGameMode(null)
        setRoomCode('')
        setRoomData(null)
        setIsHost(false)
        clearOverlays()
      } else if (data.status === 'playing') {
        setScreen('playing')
        setRoundsList(data.rounds)
        setCurrentRoundIdx(data.currentRound)

        const myPlayer = data.players[currentUser.uid]
        setIsRoundFinished(myPlayer?.hasGuessed || false)

        if (data.roundStatus === 'guessing') {
          if (data.currentRound !== currentRoundIdx) {
            clearOverlays()
            setTempGuess(null)
            setShowHint(false)
          }
        }
      } else if (data.status === 'finished') {
        setScreen('summary')
        clearOverlays()
      }
    }, (err) => {
      console.error("Room listener error:", err)
    })

    return () => unsubscribe()
  }, [gameMode, roomCode, currentUser.uid, currentRoundIdx, screen, clearOverlays])

  // Host checks if all players have guessed in active playing phase
  useEffect(() => {
    if (gameMode !== 'battle' || !isHost || !roomData || screen !== 'playing') return

    if (roomData.status === 'playing' && roomData.roundStatus === 'guessing') {
      const playersList = Object.values(roomData.players)
      const allGuessed = playersList.length > 0 && playersList.every(p => p.hasGuessed)

      if (allGuessed) {
        const roomRef = doc(db, 'georooms', roomCode)
        updateDoc(roomRef, { roundStatus: 'results' }).catch(console.error)
      }
    }
  }, [gameMode, isHost, roomData, roomCode, screen])

  // Battle countdown timer logic
  useEffect(() => {
    if (gameMode !== 'battle' || screen !== 'playing' || !roomData) return
    if (roomData.roundStatus !== 'guessing') return
    if (isRoundFinished) return

    setCountdown(45)

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleTimeOutSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameMode, screen, roomData?.currentRound, roomData?.roundStatus, isRoundFinished, handleTimeOutSubmit])

  // Final score sync to user profile
  useEffect(() => {
    if (gameMode === 'battle' && roomData && roomData.status === 'finished' && !scoreSynced) {
      const myPoints = roomData.players[currentUser.uid]?.totalScore || 0
      if (myPoints > 0) {
        const currentGlobalScore = currentUser.totalScore || 0
        updateUser({ totalScore: currentGlobalScore + myPoints }).then(() => {
          setScoreSynced(true)
          toast.success(translate('ptsAddedToast', { pts: myPoints }))
        }).catch((err) => {
          console.error(err)
          toast.error(translate('errorSavingPts'))
        })
      }
    }
  }, [roomData?.status, gameMode, scoreSynced, currentUser, roomData, updateUser])

  // Reset showHint and isMapFullscreen when round changes
  useEffect(() => {
    setShowHint(false)
    setIsMapFullscreen(false)
  }, [currentRoundIdx])

  // Trigger map size invalidation on dimension changes (transition delays handled)
  useEffect(() => {
    if (mapRef.current) {
      const t = setTimeout(() => {
        mapRef.current.invalidateSize()
      }, 350)
      return () => clearTimeout(t)
    }
  }, [mapHovered, isRoundFinished, screen, gameMode, roomData?.roundStatus, isMapFullscreen])

  // Centrally control Leaflet guess map centering when round starts or resets
  useEffect(() => {
    if (screen === 'playing' && mapRef.current && !isRoundFinished) {
      const center = gameTheme === 'uz_features' ? [40.0, 66.0] : [20.0, 0.0]
      const zoom = gameTheme === 'uz_features' ? 6.5 : 2
      mapRef.current.setView(center, zoom)
    }
  }, [currentRoundIdx, isRoundFinished, screen, gameTheme])

  // --- LEAFLET INTERACTIVE MAP RENDERING ---

  // Init/destruct Map instance
  useEffect(() => {
    if (screen !== 'playing') return

    if (mapContainerRef.current && !mapRef.current) {
      const initialCenter = gameTheme === 'uz_features' ? [40.0, 66.0] : [20.0, 0.0]
      const initialZoom = gameTheme === 'uz_features' ? 6.5 : 2

      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView(initialCenter, initialZoom)

      L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(mapRef.current)

      mapRef.current.on('mousemove', (e) => {
        setHoverCoords({ lat: e.latlng.lat, lng: e.latlng.lng })
      })
    }

    // Attach click events
    const handleMapClick = (e) => {
      if (isRoundFinished) return

      const { lat, lng } = e.latlng

      if (gameMode === 'battle') {
        // Place temporary guess pin
        if (clickMarkerRef.current) {
          clickMarkerRef.current.setLatLng([lat, lng])
        } else {
          clickMarkerRef.current = L.marker([lat, lng], {
            icon: createMarkerIcon('click')
          }).addTo(mapRef.current)
        }
        setTempGuess({ lat, lng })
      } else {
        // Solo mode: immediate submit
        const activeLoc = roundsList[currentRoundIdx]
        const targetCoords = activeLoc.target

        const distance = L.latLng(lat, lng).distanceTo(L.latLng(targetCoords.lat, targetCoords.lng))

        targetMarkerRef.current = L.marker([targetCoords.lat, targetCoords.lng], {
          icon: createMarkerIcon('target')
        }).addTo(mapRef.current)
          .bindTooltip(activeLoc.name[lang] || activeLoc.name.uz, { permanent: true, direction: 'top' })

        clickMarkerRef.current = L.marker([lat, lng], {
          icon: createMarkerIcon('click')
        }).addTo(mapRef.current)

        lineRef.current = L.polyline([[lat, lng], [targetCoords.lat, targetCoords.lng]], {
          color: '#ef4444',
          weight: 3,
          dashArray: '5, 8'
        }).addTo(mapRef.current)

        const group = L.featureGroup([clickMarkerRef.current, targetMarkerRef.current])
        mapRef.current.fitBounds(group.getBounds().pad(0.3), { animate: true })

        let pts = 0
        if (distance < 150) pts = 100
        else if (distance < 1000) pts = 85
        else if (distance < 4000) pts = 65
        else if (distance < 15000) pts = 45
        else if (distance < 50000) pts = 25
        else if (distance < 150000) pts = 10
        else pts = 0

        setRoundDistance(distance)
        setRoundPoints(pts)
        setScore((s) => s + pts)
        setIsRoundFinished(true)
      }
    }

    if (mapRef.current) {
      mapRef.current.on('click', handleMapClick)
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.off('click', handleMapClick)
      }
    }
  }, [screen, roundsList, currentRoundIdx, isRoundFinished, lang, gameMode])

  // Draw MULTIPLAYER results when round status is results
  useEffect(() => {
    if (gameMode !== 'battle' || screen !== 'playing' || !roomData) return

    if (roomData.roundStatus === 'results') {
      const activeLoc = roomData.rounds[roomData.currentRound]
      const targetCoords = activeLoc.target

      clearOverlays()

      // Target pin
      targetMarkerRef.current = L.marker([targetCoords.lat, targetCoords.lng], {
        icon: createMarkerIcon('target')
      }).addTo(mapRef.current)
        .bindTooltip(activeLoc.name[lang] || activeLoc.name.uz, { permanent: true, direction: 'top' })

      const colors = ['#ef4444', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#10b981']
      let colorIdx = 0
      const boundsArr = [[targetCoords.lat, targetCoords.lng]]

      Object.values(roomData.players || {}).forEach((p) => {
        if (p.currentGuess) {
          const isSelf = p.uid === currentUser.uid
          const playerColor = isSelf ? '#3b82f6' : colors[colorIdx % colors.length]
          if (!isSelf) colorIdx++

          const markerSvg = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${playerColor}" style="width: 26px; height: 26px; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.35));">
              <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
            </svg>
          `

          const markerIcon = L.divIcon({
            html: `<div style="display: flex; flex-direction: column; align-items: center;">
                     <div style="background-color: ${playerColor}; color: white; padding: 2px 5px; border-radius: 4px; font-size: 10px; font-weight: bold; white-space: nowrap; margin-bottom: 2px; box-shadow: 0 1px 3px rgba(0,0,0,0.3);">
                       ${p.name}
                     </div>
                     ${markerSvg}
                   </div>`,
            className: 'custom-player-icon',
            iconSize: [60, 42],
            iconAnchor: [30, 42]
          })

          const marker = L.marker([p.currentGuess.lat, p.currentGuess.lng], { icon: markerIcon }).addTo(mapRef.current)
          playerMarkersRef.current.push(marker)
          boundsArr.push([p.currentGuess.lat, p.currentGuess.lng])

          const line = L.polyline([[p.currentGuess.lat, p.currentGuess.lng], [targetCoords.lat, targetCoords.lng]], {
            color: playerColor,
            weight: 3,
            dashArray: '6, 6'
          }).addTo(mapRef.current)
          playerLinesRef.current.push(line)
        }
      })

      if (mapRef.current && boundsArr.length > 1) {
        mapRef.current.fitBounds(L.latLngBounds(boundsArr).pad(0.3), { animate: true })
      }
    }
  }, [roomData?.roundStatus, roomData?.currentRound, screen, gameMode, currentUser, lang, clearOverlays])

  // Reset SV loading state on round change
  useEffect(() => {
    setSvLoading(true)
    setSvError(false)
  }, [currentRoundIdx])

  // Cleanup map completely when page unmounts
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  return (
    <div className="relative w-full h-full bg-gray-105 dark:bg-gray-950 flex flex-col justify-center items-center overflow-hidden">
      
      {/* SCREEN 1: START/WELCOME PAGE WITH SELECTIONS */}
      {screen === 'start' && (
        <div className="max-w-4xl w-full px-4 py-8 overflow-y-auto max-h-full space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-primary-600 to-indigo-600 dark:from-primary-400 dark:to-indigo-400 bg-clip-text text-transparent">
              {translate('title')}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
              {translate('tagline')}
            </p>
          </div>

          {/* GAME THEME SELECTOR */}
          <div className="max-w-md mx-auto bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700/50 p-1.5 rounded-2xl shadow-md flex justify-between gap-1 select-none">
            <button
              onClick={() => setGameTheme('landmarks')}
              className={clsx(
                "flex-1 py-2 text-xs font-bold rounded-xl transition-all",
                gameTheme === 'landmarks'
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow shadow-indigo-500/20"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/40"
              )}
            >
              🏛️ Tarixiy joylar
            </button>
            <button
              onClick={() => setGameTheme('uz_features')}
              className={clsx(
                "flex-1 py-2 text-xs font-bold rounded-xl transition-all",
                gameTheme === 'uz_features'
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow shadow-indigo-500/20"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/40"
              )}
            >
              🇺🇿 O'zbekiston tabiati
            </button>
            <button
              onClick={() => setGameTheme('world_features')}
              className={clsx(
                "flex-1 py-2 text-xs font-bold rounded-xl transition-all",
                gameTheme === 'world_features'
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow shadow-indigo-500/20"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/40"
              )}
            >
              🌍 Dunyo tabiati
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Solo Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
                  <Gamepad2 size={24} />
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{translate('soloTitle')}</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    {translate('soloDesc')}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/40 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50 text-left text-xs space-y-2.5">
                  <div className="flex items-center gap-2 font-semibold text-gray-700 dark:text-gray-300">
                    <Trophy size={14} className="text-yellow-500" />
                    <span>Ball berish qoidalari (Raund: 5 ta)</span>
                  </div>
                  <ul className="space-y-1 text-gray-500 dark:text-gray-400">
                    <li className="flex justify-between">
                      <span>🎯 150 metrgacha xato:</span>
                      <span className="font-semibold text-green-600">+100 ball</span>
                    </li>
                    <li className="flex justify-between">
                      <span>🚗 1 kmgacha xato:</span>
                      <span className="font-semibold text-green-500">+85 ball</span>
                    </li>
                    <li className="flex justify-between">
                      <span>🚲 4 kmgacha xato:</span>
                      <span className="font-semibold text-blue-500">+65 ball</span>
                    </li>
                    <li className="flex justify-between">
                      <span>🏃 15 kmgacha xato:</span>
                      <span className="font-semibold text-yellow-600">+45 ball</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="btn-secondary px-4 py-2.5 text-xs font-semibold rounded-xl"
                >
                  {translate('backBtn')}
                </button>
                <button
                  onClick={handleStartSolo}
                  className="flex-1 btn-primary py-2.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-primary-500/20"
                >
                  <Play size={14} />
                  {translate('soloBtn')}
                </button>
              </div>
            </div>

            {/* Battle (Multiplayer) Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20 text-white">
                  <Users size={24} />
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{translate('battleTitle')}</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    {translate('battleDesc')}
                  </p>
                </div>

                {gameMode !== 'battle' ? (
                  <button
                    onClick={() => setGameMode('battle')}
                    className="w-full btn-primary py-2.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white shadow-lg shadow-rose-500/20"
                  >
                    Musobaqa bo'limiga o'tish
                  </button>
                ) : (
                  <div className="space-y-3 pt-2">
                    
                    {/* Create Room */}
                    <button
                      onClick={handleCreateRoom}
                      className="w-full btn-secondary py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
                    >
                      <Plus size={14} />
                      {translate('createRoomBtn')}
                    </button>

                    <div className="relative flex py-1 items-center">
                      <div className="flex-grow border-t border-gray-100 dark:border-gray-700"></div>
                      <span className="flex-shrink mx-4 text-[10px] text-gray-400 uppercase tracking-widest">{translate('or')}</span>
                      <div className="flex-grow border-t border-gray-100 dark:border-gray-700"></div>
                    </div>

                    {/* Join Input & Button */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value)}
                        placeholder={translate('enterCodePlaceholder')}
                        className="flex-1 min-w-0 px-3 py-2 text-xs border border-gray-250 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                      />
                      <button
                        onClick={() => handleJoinRoom(inputCode)}
                        className="btn-primary px-4 py-2 text-xs font-bold rounded-xl"
                      >
                        {translate('joinBtn')}
                      </button>
                    </div>

                    {/* Active rooms list container */}
                    <div className="mt-3">
                      <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">{translate('activeRoomsTitle')}</p>
                      
                      {activeRooms.length === 0 ? (
                        <div className="text-[11px] text-gray-400 dark:text-gray-500 italic p-3 text-center bg-gray-50/50 dark:bg-gray-900/10 rounded-xl border border-gray-100 dark:border-gray-800/40">
                          {translate('noActiveRooms')}
                        </div>
                      ) : (
                        <div className="max-h-[140px] overflow-y-auto space-y-1.5 pr-1">
                          {activeRooms.map((room) => (
                            <div key={room.id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-880 p-2.5 rounded-xl text-xs">
                              <div className="text-left">
                                <p className="font-extrabold text-primary-600 dark:text-primary-400">{room.roomId}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">{translate('hostLabel')}: {room.hostName}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] bg-gray-200/50 dark:bg-gray-800/50 px-2 py-0.5 rounded text-gray-500 dark:text-gray-400 font-medium">
                                  👥 {Object.keys(room.players || {}).length} player
                                </span>
                                <button
                                  onClick={() => handleJoinRoom(room.roomId)}
                                  className="bg-primary-50 hover:bg-primary-100 dark:bg-primary-950/40 dark:hover:bg-primary-900/40 text-primary-600 dark:text-primary-400 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all"
                                >
                                  {translate('joinBtn')}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </div>

              {gameMode === 'battle' && (
                <button
                  onClick={() => setGameMode(null)}
                  className="w-fit text-[11px] font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1 hover:text-gray-700 dark:hover:text-white"
                >
                  <ArrowLeft size={12} />
                  {translate('backBtn')}
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* SCREEN 2: MULTIPLAYER LOBBY SCREEN */}
      {screen === 'lobby' && roomData && (
        <div className="max-w-md w-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
          <div className="w-14 h-14 bg-gradient-to-br from-amber-50 to-rose-500 rounded-2xl flex items-center justify-center mx-auto text-white shadow-lg shadow-amber-500/20">
            <Users size={28} />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{translate('lobbyTitle')}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Taklif kodi orqali o'yinchilarni chaqiring</p>
          </div>

          {/* Room Code Card */}
          <div className="bg-gray-50 dark:bg-gray-900/40 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50 flex justify-between items-center text-left">
            <div>
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{translate('roomCodeLabel')}</p>
              <p className="text-2xl font-black text-primary-600 dark:text-primary-400 tracking-wide font-mono mt-0.5">{roomCode}</p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(roomCode)
                toast.success(translate('copyCodeToast'))
              }}
              className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-all shadow-sm"
              title="Copy code"
            >
              <Copy size={16} />
            </button>
          </div>

          {/* Players in Lobby */}
          <div className="space-y-2 text-left">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">
              {translate('playersListTitle')} ({Object.keys(roomData.players || {}).length})
            </p>
            <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
              {Object.values(roomData.players || {}).map((p) => (
                <div key={p.uid} className="flex justify-between items-center bg-gray-50 dark:bg-gray-900/20 border border-gray-100 dark:border-gray-700/50 p-2.5 rounded-xl text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-[10px]">
                      {p.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{p.name}</span>
                  </div>
                  {p.uid === roomData.hostId ? (
                    <span className="flex items-center gap-0.5 text-[9px] font-extrabold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/40 dark:border-amber-900/40 px-2 py-0.5 rounded-md">
                      <Crown size={10} />
                      HOST
                    </span>
                  ) : (
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">PLAYER</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2 pt-2">
            {isHost ? (
              <button
                onClick={handleHostStartGame}
                className="w-full btn-primary py-2.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-primary-500/20"
              >
                <Play size={14} />
                {translate('startBattleBtn')}
              </button>
            ) : (
              <div className="p-3 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/30 dark:border-blue-900/30 text-xs text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center gap-2">
                <Loader2 size={14} className="animate-spin" />
                <span>{translate('waitingForHost')}</span>
              </div>
            )}
            
            <button
              onClick={handleLeaveRoom}
              className="w-full py-2.5 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs font-semibold rounded-xl transition-all"
            >
              {isHost ? translate('cancelBattleBtn') : translate('leaveRoomBtn')}
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 3: ACTIVE PLAYING MAP & STREET VIEW HUD */}
      {screen === 'playing' && roundsList.length > 0 && (
        <div className="w-full h-full relative flex items-center justify-center">
          
          {/* Main Viewport: Google Maps Street View 360° Embed */}
          {(((gameMode === 'solo' && !isRoundFinished) || (gameMode === 'battle' && roomData?.roundStatus === 'guessing' && !isRoundFinished))) ? (
            <div
              className={clsx(
                "transition-all duration-300 shadow-2xl bg-gray-900 overflow-hidden",
                isMapFullscreen
                  ? "absolute bottom-4 right-4 z-[1000] border-2 border-white dark:border-gray-800 rounded-2xl w-[240px] h-[170px] sm:w-[280px] sm:h-[200px] hover:w-[340px] hover:h-[250px] sm:hover:w-[480px] sm:hover:h-[360px] opacity-90 hover:opacity-100 scale-100 hover:scale-102"
                  : "w-full h-full absolute inset-0 z-0"
              )}
            >
              {/* Loading spinner */}
              {svLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10 pointer-events-none">
                  <Loader2 className="animate-spin text-primary-500 mb-2" size={32} />
                  <span className="text-xs text-gray-400 font-medium">Google Street View...</span>
                </div>
              )}
              {/* No imagery fallback */}
              {svError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10 pointer-events-none gap-3">
                  <span className="text-4xl">🗺️</span>
                  <p className="text-sm text-gray-300 font-semibold">Bu joyda Street View mavjud emas</p>
                </div>
              )}
              {/* Maps Embed API iframe */}
              <iframe
                key={`sv-embed-${currentRoundIdx}`}
                src={getStreetViewEmbedUrl(
                  roundsList[currentRoundIdx]?.target.lat,
                  roundsList[currentRoundIdx]?.target.lng
                )}
                className="w-full h-full border-0 absolute inset-0 z-10"
                style={{ display: svError ? 'none' : 'block' }}
                referrerPolicy="no-referrer-when-downgrade"
                allow="accelerometer; gyroscope; magnetometer; fullscreen"
                allowFullScreen
                onLoad={() => setSvLoading(false)}
                onError={() => { setSvLoading(false); setSvError(true) }}
                title="Google Street View 360°"
              />
              {/* Restore/Minimize button when Street View is shrunken */}
              {isMapFullscreen && !svLoading && !svError && (
                <button
                  onClick={() => setIsMapFullscreen(false)}
                  className="absolute top-2 right-2 z-30 bg-black/60 hover:bg-black/85 text-white p-1.5 rounded-lg transition-all shadow-md flex items-center justify-center"
                  title="Xaritani kichik qilish"
                >
                  <Minimize2 size={13} />
                </button>
              )}
              {/* Badge */}
              {!svLoading && !svError && !isMapFullscreen && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 bg-black/60 text-white text-[11px] font-bold px-4 py-1.5 rounded-full tracking-wider backdrop-blur select-none pointer-events-none flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse inline-block"></span>
                  GOOGLE STREET VIEW — 360°
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-full absolute inset-0 bg-gray-105 dark:bg-gray-950 z-0" />
          )}

          {/* TELEMETRY COORDINATES overlay at top center */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/95 dark:bg-gray-800/95 backdrop-blur shadow-xl border border-gray-200/50 dark:border-gray-700/50 px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-mono select-none">
            <Compass size={14} className="text-primary-500 animate-spin" style={{ animationDuration: '6s' }} />
            {hoverCoords ? (
              <span className="text-gray-700 dark:text-gray-300 font-bold">
                {hoverCoords.lat.toFixed(5)}° N, {hoverCoords.lng.toFixed(5)}° E
              </span>
            ) : (
              <span className="text-gray-400">Kursor xarita ustida emas</span>
            )}
          </div>

          {/* GAME TARGET PANEL floating on left */}
          <div className="absolute top-4 left-4 z-[1000] w-[340px] sm:w-[360px] bg-white/95 dark:bg-gray-800/95 backdrop-blur shadow-2xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-4 space-y-4">
            
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
              <div className="flex items-center gap-1.5">
                <Gamepad2 size={18} className="text-primary-500" />
                <span className="font-bold text-sm text-gray-900 dark:text-white">
                  {gameMode === 'battle' ? translate('battleTitle') : translate('soloTitle')}
                </span>
              </div>
              <span className="bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-2.5 py-1 rounded-lg text-xs font-bold">
                Raund {currentRoundIdx + 1} / 5
              </span>
            </div>

            {/* Target Coordinate / Guessing Info Panel */}
            {(!isRoundFinished && (gameMode === 'solo' || (gameMode === 'battle' && roomData?.roundStatus === 'guessing'))) ? (
              // Hiding the target name and coordinates during guessing so they have to search Street View!
              <div className="bg-gray-50 dark:bg-gray-900/40 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50 text-center space-y-2">
                <div className="w-8 h-8 rounded-full bg-primary-50 dark:bg-primary-950/40 text-primary-500 flex items-center justify-center mx-auto mb-1">
                  <Eye size={16} />
                </div>
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Joylashuvni aniqlang</p>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug">
                  Street View panoramasi orqali atrofni kuzating va o'ng pastki burchakdagi xaritadan ushbu joyni taxmin qiling.
                </div>
              </div>
            ) : (
              // Reveal coordinates on round results phase
              <div className="bg-green-50/50 dark:bg-green-950/10 border border-green-200/40 dark:border-green-900/40 p-3.5 rounded-xl text-center space-y-1 animate-fade-in">
                <p className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-widest font-mono">Haqiqiy koordinata</p>
                <div className="font-mono text-base font-extrabold text-green-700 dark:text-green-400 select-all leading-tight">
                  {roundsList[currentRoundIdx].target.lat.toFixed(5)}° N<br />
                  {roundsList[currentRoundIdx].target.lng.toFixed(5)}° E
                </div>
              </div>
            )}

            {/* Hint Box */}
            {(!isRoundFinished && (gameMode === 'solo' || (gameMode === 'battle' && roomData?.roundStatus === 'guessing'))) ? (
              <div className="space-y-2">
                {showHint ? (
                  <div className="bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100/30 dark:border-blue-900/30 text-xs text-left animate-fade-in">
                    <p className="font-bold text-blue-700 dark:text-blue-400">Maslahat:</p>
                    <p className="text-gray-650 dark:text-gray-400 mt-1 leading-snug">
                      {roundsList[currentRoundIdx].hint[lang] || roundsList[currentRoundIdx].hint.uz}
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowHint(true)}
                    className="w-full py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-lg transition-all"
                  >
                    Maslahat (Show Hint)
                  </button>
                )}
              </div>
            ) : (
              // Reveal exact place name on round results phase
              <div className="bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100/30 dark:border-blue-900/30 text-xs text-left">
                <p className="font-bold text-gray-850 dark:text-gray-200">
                  📍 {roundsList[currentRoundIdx].name[lang] || roundsList[currentRoundIdx].name.uz}
                </p>
                <p className="text-gray-500 dark:text-gray-400 mt-1 leading-snug">
                  {roundsList[currentRoundIdx].hint[lang] || roundsList[currentRoundIdx].hint.uz}
                </p>
              </div>
            )}

            {/* Battle countdown timer & players list */}
            {gameMode === 'battle' && roomData && (
              <div className="space-y-3 pt-1 border-t border-gray-150 dark:border-gray-705">
                
                {/* Timer */}
                {roomData.roundStatus === 'guessing' && !isRoundFinished && (
                  <div className="flex justify-between items-center bg-rose-50/40 dark:bg-rose-950/10 border border-rose-100/30 dark:border-rose-900/30 rounded-xl px-3 py-2 text-xs">
                    <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Clock size={14} className="text-rose-500" />
                      {translate('timeLeft')}:
                    </span>
                    <span className="font-mono font-black text-rose-600 dark:text-rose-400 text-sm animate-pulse">
                      {countdown}s
                    </span>
                  </div>
                )}

                {/* Score and status of players */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-0.5">{translate('playersCount')}</p>
                  <div className="space-y-1 max-h-[110px] overflow-y-auto pr-1">
                    {Object.values(roomData.players || {}).map((p) => (
                      <div key={p.uid} className="flex justify-between items-center text-xs bg-gray-50/50 dark:bg-gray-900/10 p-1.5 rounded-lg border border-gray-100 dark:border-gray-850">
                        <span className="font-medium text-gray-700 dark:text-gray-300 truncate max-w-[150px]">{p.name}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-yellow-600 dark:text-yellow-400 text-[10px]">
                            {p.totalScore || 0} {translate('pointsWord')}
                          </span>
                          <span className="text-[10px] font-semibold">
                            {p.hasGuessed ? (
                              <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                            ) : (
                              <span className="text-gray-400">...</span>
                            )}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Score (Solo) */}
            {gameMode === 'solo' && (
              <div className="flex justify-between items-center text-xs px-1.5">
                <span className="text-gray-500">Joriy ballar:</span>
                <span className="font-extrabold text-yellow-600 dark:text-yellow-400 flex items-center gap-1 text-sm">
                  <Star size={14} fill="currentColor" />
                  {score} {translate('pointsWord')}
                </span>
              </div>
            )}

            {/* Confirm & Leave actions */}
            <div className="space-y-2">
              {gameMode === 'battle' && roomData.roundStatus === 'guessing' && !isRoundFinished && (
                <button
                  onClick={handleConfirmGuess}
                  disabled={!tempGuess}
                  className={clsx(
                    "w-full py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition-all duration-300 shadow-lg",
                    tempGuess 
                      ? "bg-green-600 hover:bg-green-700 text-white shadow-green-500/20" 
                      : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed shadow-none"
                  )}
                >
                  <CheckCircle size={14} />
                  {tempGuess ? translate('confirmGuessBtn') : "Xaritani bosing"}
                </button>
              )}

              {/* Waiting for others spinner */}
              {gameMode === 'battle' && roomData.roundStatus === 'guessing' && isRoundFinished && (
                <div className="p-3 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/30 dark:border-blue-900/30 text-xs text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center gap-2 font-medium">
                  <Loader2 size={14} className="animate-spin" />
                  <span>{translate('waitingForOthers')}</span>
                </div>
              )}

              <button
                onClick={gameMode === 'battle' ? handleLeaveRoom : () => setScreen('start')}
                className="w-full py-2 border border-gray-250 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 text-gray-500 dark:text-gray-400 text-xs font-semibold rounded-xl transition-all"
              >
                O'yinni tark etish
              </button>
            </div>
          </div>

          {/* Leaflet Map: Hover expandable container floating at bottom-right during guessing phase, taking over full screen in results/fullscreen phase */}
          <div
            onMouseEnter={() => setMapHovered(true)}
            onMouseLeave={() => setMapHovered(false)}
            className={clsx(
              "transition-all duration-300 overflow-hidden shadow-2xl rounded-2xl border-white dark:border-gray-800",
              
              // Guessing phase: either floating mini-map or full screen
              ((gameMode === 'solo' && !isRoundFinished) || (gameMode === 'battle' && roomData?.roundStatus === 'guessing' && !isRoundFinished))
                ? (isMapFullscreen
                    ? "absolute inset-0 w-full h-full z-0 rounded-none border-0 shadow-none"
                    : clsx(
                        "absolute bottom-4 right-4 z-[1000] border-2",
                        mapHovered 
                          ? "w-[340px] h-[250px] sm:w-[480px] sm:h-[360px] opacity-100 scale-102" 
                          : "w-[240px] h-[170px] sm:w-[280px] sm:h-[200px] opacity-90 hover:opacity-100"
                      )
                  )
                
                // Results/Summary phase: Always full screen map takeover
                : "absolute inset-0 w-full h-full z-0 rounded-none border-0 shadow-none"
            )}
          >
            {/* Maximize map button when shrunken */}
            {((gameMode === 'solo' && !isRoundFinished) || (gameMode === 'battle' && roomData?.roundStatus === 'guessing' && !isRoundFinished)) && !isMapFullscreen && (
              <button
                onClick={() => setIsMapFullscreen(true)}
                className="absolute top-2 right-2 z-[2000] bg-black/60 hover:bg-black/85 text-white p-1.5 rounded-lg transition-all shadow-md flex items-center justify-center"
                title="Xaritani to'liq ekranga yoyish"
              >
                <Maximize2 size={13} />
              </button>
            )}
            <div ref={mapContainerRef} className="w-full h-full" />
          </div>

          {/* ACTIVE ROUND RESULTS feedback floating modal (Solo) */}
          {gameMode === 'solo' && isRoundFinished && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000] w-[320px] sm:w-[350px] bg-white/95 dark:bg-gray-800/95 shadow-2xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-gray-900 dark:text-white">Raund yakunlandi!</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug">
                  Siz tanlagan nuqta haqiqiy koordinatadan 
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    {' '}{roundDistance >= 1000 ? `${(roundDistance / 1000).toFixed(2)} km` : `${roundDistance.toFixed(0)} metr`}
                  </span>
                  {' '}uzoqda joylashgan ekan.
                </p>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200/50 dark:border-yellow-800/50 rounded-xl p-3.5 flex justify-between items-center text-xs">
                <span className="text-yellow-800 dark:text-yellow-400 font-medium">Ushbu raund uchun:</span>
                <span className="font-extrabold text-yellow-600 dark:text-yellow-400 text-lg">
                  +{roundPoints} {translate('pointsWord')}
                </span>
              </div>

              <button
                onClick={handleNextRoundSolo}
                className="w-full btn-primary py-2.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5"
              >
                <span>{currentRoundIdx + 1 === roundsList.length ? "O'yinni yakunlash" : "Keyingi raund"}</span>
                <ChevronRight size={14} />
              </button>
            </div>
          )}

          {/* ACTIVE ROUND RESULTS feedback floating modal (Battle) */}
          {gameMode === 'battle' && roomData && roomData.roundStatus === 'results' && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000] w-[320px] sm:w-[360px] bg-white/95 dark:bg-gray-800/95 shadow-2xl rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center mx-auto">
                <Trophy size={24} />
              </div>
              
              <div className="space-y-1">
                <h3 className="font-bold text-gray-900 dark:text-white">{translate('roundLeaderboard')}</h3>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider truncate max-w-[300px]">Mavze: {roomData.rounds[roomData.currentRound].name[lang] || roomData.rounds[roomData.currentRound].name.uz}</p>
              </div>

              {/* Round Player guesses ranking */}
              <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-1 text-left">
                {Object.values(roomData.players || {})
                  .sort((a, b) => (b.currentGuess?.points || 0) - (a.currentGuess?.points || 0))
                  .map((player, idx) => {
                    const dist = player.currentGuess?.distance;
                    const pointsEarned = player.currentGuess?.points || 0;
                    return (
                      <div key={player.uid} className="flex justify-between items-center bg-gray-50 dark:bg-gray-900/40 p-2 rounded-xl text-xs border border-gray-100 dark:border-gray-800">
                        <div className="truncate max-w-[180px]">
                          <span className="font-bold text-gray-400 mr-1.5">{idx + 1}.</span>
                          <span className="font-semibold text-gray-800 dark:text-gray-200">{player.name}</span>
                          <p className="text-[9px] text-gray-400 mt-0.5">
                            {dist !== undefined 
                              ? (dist >= 1000 ? `${(dist / 1000).toFixed(2)} km` : `${dist.toFixed(0)} m`)
                              : "No Guess"
                            }
                          </p>
                        </div>
                        <span className="font-black text-amber-600 dark:text-amber-400 text-sm">
                          +{pointsEarned}
                        </span>
                      </div>
                    )
                  })
                }
              </div>

              {/* Host triggers next round, other players wait */}
              {isHost ? (
                <button
                  onClick={handleHostNextRound}
                  className="w-full btn-primary py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
                >
                  <span>{roomData.currentRound + 1 === 5 ? "O'yinni yakunlash" : "Keyingi raund"}</span>
                  <ChevronRight size={14} />
                </button>
              ) : (
                <div className="p-3 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/30 dark:border-blue-900/30 text-xs text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center gap-2 font-medium">
                  <Loader2 size={14} className="animate-spin" />
                  <span>Kutib turing, host keyingi raundni boshlamoqda...</span>
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* SCREEN 4: SUMMARY GAME RESULTS PAGE */}
      {screen === 'summary' && (
        <div className="max-w-md w-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-2xl p-6 sm:p-8 shadow-2xl text-center space-y-6 animate-fade-in z-[1000]">
          
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-yellow-500/20 text-white">
            <Award size={36} />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">O'yin yakunlandi!</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {gameMode === 'solo' ? (
                score >= 400
                  ? translate('congratsPro')
                  : score >= 250
                  ? translate('congratsGood')
                  : translate('congratsBad')
              ) : (
                "Musobaqa muvaffaqiyatli yakunlandi!"
              )}
            </p>
          </div>

          {/* Solo Score indicators */}
          {gameMode === 'solo' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 dark:bg-gray-900/40 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50 text-center">
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">TO'PLANGAN BALLAR</p>
                <p className="text-2xl font-extrabold text-amber-500">+{score}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/40 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50 text-center">
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">UMUMIY SCORE</p>
                <p className="text-2xl font-extrabold text-primary-500">{currentUser?.totalScore || score}</p>
              </div>
            </div>
          )}

          {/* Battle Final Leaderboard */}
          {gameMode === 'battle' && roomData && (
            <div className="space-y-3 text-left">
              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">{translate('finalLeaderboard')}</p>
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {Object.values(roomData.players || {})
                  .sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0))
                  .map((player, idx) => {
                    const isWinner = idx === 0;
                    return (
                      <div 
                        key={player.uid} 
                        className={clsx(
                          "flex justify-between items-center p-3 rounded-xl border transition-all",
                          isWinner 
                            ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900/40 shadow-sm" 
                            : "bg-gray-50 dark:bg-gray-900/40 border-gray-100 dark:border-gray-800"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <div className={clsx(
                            "w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-sm",
                            isWinner 
                              ? "bg-amber-400 text-white" 
                              : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                          )}>
                            {isWinner ? "👑" : idx + 1}
                          </div>
                          <div>
                            <p className="font-bold text-gray-850 dark:text-gray-205 text-xs">
                              {player.name}
                            </p>
                            {isWinner && (
                              <span className="text-[9px] font-extrabold text-amber-600 dark:text-amber-400 tracking-wide uppercase">
                                {translate('winnerBadge')}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className={clsx(
                          "font-black text-sm",
                          isWinner ? "text-amber-600 dark:text-amber-400 text-base" : "text-gray-600 dark:text-gray-400"
                        )}>
                          {player.totalScore || 0} {translate('pointsWord')}
                        </span>
                      </div>
                    )
                  })
                }
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 btn-secondary py-2.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-1 shadow-sm"
            >
              <ArrowLeft size={13} />
              {translate('backToDashboard')}
            </button>
            <button
              onClick={gameMode === 'battle' ? () => {
                setScreen('start')
                setGameMode(null)
                setRoomCode('')
                setRoomData(null)
                setIsHost(false)
              } : handleStartSolo}
              className="flex-1 btn-primary py-2.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-1 shadow-lg shadow-primary-500/20"
            >
              <RefreshCcw size={13} />
              {translate('retryBtn')}
            </button>
          </div>
        </div>
      )}

      {/* FULL SCREEN LOADING OVERLAY FOR ROUNDS GENERATION */}
      {loadingRounds && (
        <div className="absolute inset-0 z-[9999] bg-gray-950/80 backdrop-blur-md flex flex-col justify-center items-center text-white space-y-4 animate-fade-in">
          <div className="relative flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin"></div>
            <Compass size={24} className="absolute text-indigo-400 animate-pulse" />
          </div>
          <div className="text-center space-y-1.5 px-6">
            <h3 className="font-extrabold text-lg text-white">Tasodifiy ko'chalar aniqlanmoqda...</h3>
            <p className="text-xs text-gray-400 max-w-xs mx-auto">
              Google Street View ma'lumotlar bazasidan haqiqiy panoramali ko'chalar tanlanmoqda. Bu bir necha soniya olishi mumkin.
            </p>
          </div>
        </div>
      )}

    </div>
  )
}
