export const SUBJECTS = [
  {
    id: 'kartografiya',
    name: { uz: 'Kartografiya', ru: 'Картография', en: 'Cartography' },
    description: {
      uz: "Xaritalar yaratish, taxlil qilish va ulardan foydalanish san'ati va fani.",
      ru: 'Искусство и наука создания, анализа и использования карт.',
      en: 'The art and science of creating, analyzing, and using maps.',
    },
    icon: 'Map',
    color: 'blue',
    topicsCount: 6,
    videosCount: 12,
    testsCount: 8,
    materialsCount: 15,
    studentsCount: 234,
  },
  {
    id: 'topografiya',
    name: { uz: 'Topografiya', ru: 'Топография', en: 'Topography' },
    description: {
      uz: "Yer yuzasining tafsilotli tavsifi va tasvirini o'rganuvchi fan.",
      ru: 'Наука о детальном описании и изображении земной поверхности.',
      en: 'The science of detailed description and depiction of the surface of the Earth.',
    },
    icon: 'Mountain',
    color: 'green',
    topicsCount: 6,
    videosCount: 10,
    testsCount: 7,
    materialsCount: 12,
    studentsCount: 198,
  },
  {
    id: 'gis',
    name: { uz: 'GIS', ru: 'ГИС', en: 'GIS' },
    description: {
      uz: "Geografik axborot tizimlari - fazoviy ma'lumotlarni boshqarish va taxlil qilish.",
      ru: 'Географические информационные системы — управление и анализ пространственных данных.',
      en: 'Geographic Information Systems — managing and analyzing spatial data.',
    },
    icon: 'Globe',
    color: 'orange',
    topicsCount: 6,
    videosCount: 14,
    testsCount: 9,
    materialsCount: 18,
    studentsCount: 312,
  },
]

export const TOPICS = {
  kartografiya: [
    {
      id: 'karto-1',
      subjectId: 'kartografiya',
      order: 1,
      title: { uz: 'Kartografiya asoslari', ru: 'Основы картографии', en: 'Fundamentals of Cartography' },
      content: {
        uz: `<h2>Kartografiya asoslari</h2>
<p>Kartografiya — yer yuzasining grafik tasvirini yaratish, tadqiq etish va ulardan foydalanish haqidagi fan. Bu fan qadimgi davrlardan boshlab rivojlanib kelgan va hozirda zamonaviy texnologiyalar bilan boyitilgan.</p>

<h3>Xaritaning asosiy elementlari</h3>
<ul>
<li><strong>Masshtab</strong> — xaritadagi masofa va real masofa nisbati</li>
<li><strong>Proeksiya</strong> — yer shari yuzasini tekislikka ko'chirish usuli</li>
<li><strong>Koordinatlar tizimi</strong> — ob'ektlar joylashuvini aniqlash</li>
<li><strong>Ramka va legenda</strong> — xaritaning chegarasi va belgilar izohi</li>
</ul>

<h3>Kartografiyaning turlari</h3>
<p>Zamonaviy kartografiya quyidagi yo'nalishlarga bo'linadi:</p>
<ol>
<li>Umumgeografik kartografiya</li>
<li>Tematik kartografiya</li>
<li>Matematik kartografiya</li>
<li>Kompyuter kartografiyasi</li>
</ol>

<h3>Tarixiy rivojlanish</h3>
<p>Birinchi xaritalar 25,000 yil oldin tosh yoki sopol taxtachalariga chizilgan. Ptolemey (milodiy II asr) geografik koordinatalar tizimini ishlab chiqqan. XVI asrdan boshlab Merkator proeksiyasi keng qo'llana boshladi.</p>`,
      },
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      videoDuration: '42:15',
      hasTest: true,
      hasPractical: true,
      duration: '45 daqiqa',
      difficulty: 'beginner',
    },
    {
      id: 'karto-2',
      subjectId: 'kartografiya',
      order: 2,
      title: { uz: "Xaritalarning turlari", ru: 'Виды карт', en: 'Types of Maps' },
      content: {
        uz: `<h2>Xaritalarning turlari</h2>
<p>Xaritalar turli mezonlar bo'yicha tasniflanadi: maqsadi, masshtabi, mavzusi va boshqalar.</p>

<h3>Masshtab bo'yicha</h3>
<ul>
<li><strong>Katta masshtabli</strong> — 1:10 000 va undan katta (topografik xaritalar)</li>
<li><strong>O'rta masshtabli</strong> — 1:200 000 dan 1:1 000 000 gacha</li>
<li><strong>Kichik masshtabli</strong> — 1:1 000 000 dan kichik (umumgeografik atlaslar)</li>
</ul>

<h3>Maqsadi bo'yicha</h3>
<ul>
<li>Umumgeografik xaritalar</li>
<li>Tematik xaritalar (iqlim, aholi, iqtisodiyot)</li>
<li>Dengiz navigatsiya xaritalari</li>
<li>Aviatsiya xaritalari</li>
</ul>

<h3>Proeksiyalar</h3>
<p>Merkator, Lambert, Gauss-Krüger kabi proeksiyalar turli maqsadlar uchun ishlatiladi.</p>`,
      },
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      videoDuration: '38:20',
      hasTest: true,
      hasPractical: false,
      duration: '40 daqiqa',
      difficulty: 'beginner',
    },
    {
      id: 'karto-3',
      subjectId: 'kartografiya',
      order: 3,
      title: { uz: 'Masshtab va koordinatalar', ru: 'Масштаб и координаты', en: 'Scale and Coordinates' },
      content: {
        uz: `<h2>Masshtab va koordinatalar</h2>
<p>Masshtab — xaritadagi chiziqli uzunlikning yerda shu chiziqning haqiqiy uzunligiga nisbati.</p>

<h3>Masshtab turlari</h3>
<ul>
<li><strong>Sonli masshtab</strong>: 1:25 000 (1 sm = 250 m)</li>
<li><strong>Chiziqli masshtab</strong>: grafik ko'rinishda</li>
<li><strong>Og'zaki masshtab</strong>: "1 santimetr 1 km"</li>
</ul>

<h3>Koordinatalar tizimi</h3>
<p>Kenglik (latitude) va uzunlik (longitude) — yer sharida joylashuvni aniqlashning asosiy usuli.</p>
<ul>
<li>Kenglik: 0° (ekvator) dan ±90° (qutblar) gacha</li>
<li>Uzunlik: 0° (Grinvich) dan ±180° gacha</li>
</ul>`,
      },
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      videoDuration: '55:10',
      hasTest: true,
      hasPractical: true,
      duration: '60 daqiqa',
      difficulty: 'intermediate',
    },
    {
      id: 'karto-4',
      subjectId: 'kartografiya',
      order: 4,
      title: { uz: 'Kartografik belgilar', ru: 'Картографические знаки', en: 'Cartographic Signs' },
      content: {
        uz: `<h2>Kartografik belgilar</h2>
<p>Kartografik belgilar — xaritada turli ob'ektlarni ifodalovchi maxsus grafik elementlar.</p>

<h3>Belgilar turlari</h3>
<ul>
<li>Nuqtali belgilar (shahar, qishloq)</li>
<li>Chiziqli belgilar (yo'l, daryo)</li>
<li>Maydonli belgilar (o'rmon, ko'l)</li>
<li>Ranglar va shtrihovka</li>
</ul>`,
      },
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      videoDuration: '35:45',
      hasTest: true,
      hasPractical: false,
      duration: '40 daqiqa',
      difficulty: 'beginner',
    },
    {
      id: 'karto-5',
      subjectId: 'kartografiya',
      order: 5,
      title: { uz: 'Raqamli kartografiya', ru: 'Цифровая картография', en: 'Digital Cartography' },
      content: {
        uz: `<h2>Raqamli kartografiya</h2>
<p>Zamonaviy kartografiya kompyuter texnologiyalari asosida rivojlangan.</p>

<h3>Asosiy dasturlar</h3>
<ul>
<li>ArcGIS — professional GIS tizimi</li>
<li>QGIS — bepul ochiq kodli dastur</li>
<li>AutoCAD Map — muhandislik xaritalari</li>
<li>Google Maps / OpenStreetMap — veb xaritalar</li>
</ul>`,
      },
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      videoDuration: '48:30',
      hasTest: true,
      hasPractical: true,
      duration: '50 daqiqa',
      difficulty: 'intermediate',
    },
    {
      id: 'karto-6',
      subjectId: 'kartografiya',
      order: 6,
      title: { uz: 'Xarita tahlili', ru: 'Анализ карт', en: 'Map Analysis' },
      content: {
        uz: `<h2>Xarita tahlili</h2>
<p>Xarita tahlili — kartografik ma'lumotlardan amaliy foydalanish usullari.</p>

<h3>Tahlil usullari</h3>
<ul>
<li>Vizual tahlil</li>
<li>Masofani o'lchash</li>
<li>Maydonni hisoblash</li>
<li>Yo'nalishni aniqlash</li>
</ul>`,
      },
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      videoDuration: '52:00',
      hasTest: true,
      hasPractical: true,
      duration: '55 daqiqa',
      difficulty: 'advanced',
    },
  ],
  topografiya: [
    {
      id: 'topo-1',
      subjectId: 'topografiya',
      order: 1,
      title: { uz: 'Topografik xaritalar', ru: 'Топографические карты', en: 'Topographic Maps' },
      content: {
        uz: `<h2>Topografik xaritalar</h2>
<p>Topografik xaritalar — yer yuzasining batafsil grafik tasviri bo'lib, undagi barcha muhim ob'ektlarni ko'rsatadi.</p>

<h3>Asosiy xususiyatlar</h3>
<ul>
<li>Masshtab: 1:25 000 dan 1:200 000 gacha</li>
<li>Gorizontallar yordamida rel'ef ko'rsatiladi</li>
<li>Standartlashtirilgan belgilar tizimi</li>
<li>Koordinata to'ri</li>
</ul>

<h3>Qo'llanilishi</h3>
<p>Topografik xaritalar harbiy maqsadlar, qurilish, yer tuzish, turizm va ilmiy tadqiqotlarda keng qo'llaniladi.</p>`,
      },
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      videoDuration: '44:20',
      hasTest: true,
      hasPractical: true,
      duration: '50 daqiqa',
      difficulty: 'beginner',
    },
    {
      id: 'topo-2',
      subjectId: 'topografiya',
      order: 2,
      title: { uz: 'Topografik belgilar', ru: 'Топографические знаки', en: 'Topographic Signs' },
      content: {
        uz: `<h2>Topografik belgilar</h2>
<p>Topografik belgilar — topografik xaritalarda ob'ektlarni ifodalash uchun qo'llaniladigan standartlashtirilgan grafik belgilar.</p>

<h3>Belgilar kategoriyalari</h3>
<ul>
<li>Aholi punktlari (shahar, qishloq, ovul)</li>
<li>Yo'llar (avtomobil, temir yo'l, piyoda yo'l)</li>
<li>Gidrologiya (daryo, ko'l, kanal, quduq)</li>
<li>O'simlik qoplami (o'rmon, o'tloq, bog')</li>
<li>Tuproq va grunt (qum, botqoq, tosh)</li>
<li>Inshootlar (ko'prik, to'g'on, ombor)</li>
</ul>`,
      },
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      videoDuration: '39:15',
      hasTest: true,
      hasPractical: false,
      duration: '45 daqiqa',
      difficulty: 'beginner',
    },
    {
      id: 'topo-3',
      subjectId: 'topografiya',
      order: 3,
      title: { uz: "Rel'ef va balandliklar", ru: 'Рельеф и высоты', en: 'Relief and Elevations' },
      content: {
        uz: `<h2>Rel'ef va balandliklar</h2>
<p>Rel'ef — yer yuzasining notekis shakllari majmuasi. Topografiyada rel'ef gorizontallar yordamida tasvirlanadi.</p>

<h3>Gorizontallar</h3>
<p>Gorizontal — bir xil balandlikdagi nuqtalarni birlashtiruvchi egri chiziq.</p>
<ul>
<li>Asosiy gorizontallar</li>
<li>Yordamchi gorizontallar</li>
<li>Qalinlashtirilgan gorizontallar (har 5-chi)</li>
</ul>

<h3>Rel'ef shakllari</h3>
<ul>
<li>Tog' (tepa) — barcha tomonga qiyalik bor</li>
<li>Qozon (chuqurlik) — ichkariga qarab qiyalik</li>
<li>Tizma (tog' tizmasi)</li>
<li>Vodiy (daryo vodiysi)</li>
<li>Egat (suv ajratuvchi chiziq)</li>
</ul>`,
      },
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      videoDuration: '51:40',
      hasTest: true,
      hasPractical: true,
      duration: '55 daqiqa',
      difficulty: 'intermediate',
    },
    {
      id: 'topo-4',
      subjectId: 'topografiya',
      order: 4,
      title: { uz: 'Topografik suratga olish', ru: 'Топографическая съёмка', en: 'Topographic Survey' },
      content: {
        uz: `<h2>Topografik suratga olish</h2>
<p>Topografik suratga olish — yer yuzasidagi ob'ektlarni o'lchash va xaritaga tushirish jarayoni.</p>

<h3>Suratga olish usullari</h3>
<ul>
<li>Aerosuratga olish</li>
<li>Kosmik suratga olish</li>
<li>Yerdan suratga olish (nivelirovka)</li>
<li>GPS/GNSS o'lchash</li>
</ul>`,
      },
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      videoDuration: '46:50',
      hasTest: true,
      hasPractical: true,
      duration: '50 daqiqa',
      difficulty: 'intermediate',
    },
    {
      id: 'topo-5',
      subjectId: 'topografiya',
      order: 5,
      title: { uz: 'Nivelirovka', ru: 'Нивелирование', en: 'Leveling' },
      content: {
        uz: `<h2>Nivelirovka</h2>
<p>Nivelirovka — nuqtalarning nisbiy balandligi va absolyut balandligini aniqlash usuli.</p>

<h3>Nivelirovka turlari</h3>
<ul>
<li>Geometrik nivelirovka</li>
<li>Trigonometrik nivelirovka</li>
<li>Barometrik nivelirovka</li>
<li>Gidrostatik nivelirovka</li>
</ul>`,
      },
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      videoDuration: '43:25',
      hasTest: true,
      hasPractical: false,
      duration: '45 daqiqa',
      difficulty: 'advanced',
    },
    {
      id: 'topo-6',
      subjectId: 'topografiya',
      order: 6,
      title: { uz: 'Topografiyada hisob-kitob', ru: 'Расчёты в топографии', en: 'Calculations in Topography' },
      content: {
        uz: `<h2>Topografiyada hisob-kitob</h2>
<p>Topografik hisob-kitoblar masofa, maydon, balandlik farqlari va boshqalarni aniqlashda qo'llaniladi.</p>

<h3>Asosiy hisob-kitoblar</h3>
<ul>
<li>Masofa hisoblash</li>
<li>Maydon hisoblash (planimetr, raqamli usul)</li>
<li>Qiyalik burchagini aniqlash</li>
<li>Koordinatalarni hisoblash</li>
</ul>`,
      },
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      videoDuration: '58:10',
      hasTest: true,
      hasPractical: true,
      duration: '60 daqiqa',
      difficulty: 'advanced',
    },
  ],
  gis: [
    {
      id: 'gis-1',
      subjectId: 'gis',
      order: 1,
      title: { uz: 'GIS tushunchasi', ru: 'Понятие ГИС', en: 'GIS Concepts' },
      content: {
        uz: `<h2>GIS tushunchasi</h2>
<p>Geografik Axborot Tizimi (GIS) — fazoviy ma'lumotlarni to'plash, saqlash, qayta ishlash, tahlil qilish va vizuallashtirish uchun mo'ljallangan kompyuter tizimi.</p>

<h3>GIS ning asosiy tarkibiy qismlari</h3>
<ul>
<li><strong>Apparat ta'minot</strong> — kompyuter, GPS qurilmalar, printerlar</li>
<li><strong>Dastur ta'minot</strong> — ArcGIS, QGIS, MapInfo</li>
<li><strong>Ma'lumotlar</strong> — vektor, raster, atribut ma'lumotlari</li>
<li><strong>Metodlar</strong> — tahlil va vizualizatsiya usullari</li>
<li><strong>Foydalanuvchilar</strong> — mutaxassislar va boshqalar</li>
</ul>

<h3>GIS ning qo'llanilishi</h3>
<p>GIS quyidagi sohalarda keng qo'llaniladi:</p>
<ul>
<li>Shahar rejalashtirish</li>
<li>Atrof-muhit monitoringi</li>
<li>Qishloq xo'jaligi</li>
<li>Transport va logistika</li>
<li>Favqulodda vaziyatlar boshqaruvi</li>
</ul>`,
      },
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      videoDuration: '50:30',
      hasTest: true,
      hasPractical: false,
      duration: '55 daqiqa',
      difficulty: 'beginner',
    },
    {
      id: 'gis-2',
      subjectId: 'gis',
      order: 2,
      title: { uz: 'ArcGIS bilan ishlash', ru: 'Работа с ArcGIS', en: 'Working with ArcGIS' },
      content: {
        uz: `<h2>ArcGIS bilan ishlash</h2>
<p>ArcGIS — Esri kompaniyasi tomonidan ishlab chiqilgan professional GIS dasturiy majmuasi.</p>

<h3>ArcGIS Desktop komponentlari</h3>
<ul>
<li><strong>ArcMap</strong> — asosiy xarita muharriri</li>
<li><strong>ArcCatalog</strong> — ma'lumotlar boshqaruvi</li>
<li><strong>ArcToolbox</strong> — geoijro vositalari</li>
<li><strong>ArcScene</strong> — 3D vizualizatsiya</li>
</ul>

<h3>Asosiy operatsiyalar</h3>
<ol>
<li>Ma'lumot qatlamlarini yuklash</li>
<li>Atribut jadvallar bilan ishlash</li>
<li>Fazoviy so'rovlar</li>
<li>Xarita chiqarish</li>
</ol>`,
      },
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      videoDuration: '68:45',
      hasTest: true,
      hasPractical: true,
      duration: '75 daqiqa',
      difficulty: 'intermediate',
    },
    {
      id: 'gis-3',
      subjectId: 'gis',
      order: 3,
      title: { uz: 'QGIS bilan ishlash', ru: 'Работа с QGIS', en: 'Working with QGIS' },
      content: {
        uz: `<h2>QGIS bilan ishlash</h2>
<p>QGIS (Quantum GIS) — bepul, ochiq kodli GIS dasturi. GNU General Public License ostida tarqatiladi.</p>

<h3>QGIS ning afzalliklari</h3>
<ul>
<li>Bepul va ochiq manba</li>
<li>Ko'p platformali (Windows, macOS, Linux)</li>
<li>Keng plagina tizimi</li>
<li>Python skriptlash imkoniyati</li>
</ul>

<h3>Asosiy funksiyalar</h3>
<ul>
<li>Vektor va raster ma'lumotlarni yuklash</li>
<li>Geoprotsessing vositalari</li>
<li>Chop etish composer</li>
<li>PostGIS integratsiyasi</li>
</ul>`,
      },
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      videoDuration: '62:20',
      hasTest: true,
      hasPractical: true,
      duration: '70 daqiqa',
      difficulty: 'intermediate',
    },
    {
      id: 'gis-4',
      subjectId: 'gis',
      order: 4,
      title: { uz: "Vektor va raster ma'lumotlar", ru: 'Векторные и растровые данные', en: 'Vector and Raster Data' },
      content: {
        uz: `<h2>Vektor va raster ma'lumotlar</h2>
<p>GIS da ma'lumotlar ikki asosiy shaklda saqlanadi: vektor va raster.</p>

<h3>Vektor ma'lumotlar</h3>
<ul>
<li>Nuqtalar (shaharchalar, quduqlar)</li>
<li>Chiziqlar (yo'llar, daryolar)</li>
<li>Ko'pburchaklar (davlatlar, ko'llar)</li>
</ul>

<h3>Raster ma'lumotlar</h3>
<ul>
<li>Piksel asosida</li>
<li>Sun'iy yo'ldosh tasvirlari</li>
<li>DEM (raqamli balandlik modeli)</li>
</ul>`,
      },
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      videoDuration: '47:55',
      hasTest: true,
      hasPractical: false,
      duration: '50 daqiqa',
      difficulty: 'beginner',
    },
    {
      id: 'gis-5',
      subjectId: 'gis',
      order: 5,
      title: { uz: 'Fazoviy tahlil', ru: 'Пространственный анализ', en: 'Spatial Analysis' },
      content: {
        uz: `<h2>Fazoviy tahlil</h2>
<p>Fazoviy tahlil — ob'ektlarning joylashuvi va ular orasidagi munosabatlarni o'rganish.</p>

<h3>Tahlil usullari</h3>
<ul>
<li>Buffer tahlili</li>
<li>Kesishma (Intersect)</li>
<li>Birlashtirma (Union)</li>
<li>Proximity tahlili</li>
<li>Network tahlili</li>
</ul>`,
      },
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      videoDuration: '55:35',
      hasTest: true,
      hasPractical: true,
      duration: '60 daqiqa',
      difficulty: 'advanced',
    },
    {
      id: 'gis-6',
      subjectId: 'gis',
      order: 6,
      title: { uz: 'GPS va GNSS texnologiyalari', ru: 'GPS и GNSS технологии', en: 'GPS and GNSS Technologies' },
      content: {
        uz: `<h2>GPS va GNSS texnologiyalari</h2>
<p>GPS (Global Positioning System) — sun'iy yo'ldoshlar yordamida yerda joylashuvni aniqlash tizimi.</p>

<h3>GNSS tizimlari</h3>
<ul>
<li>GPS (AQSH) — 31 ta sun'iy yo'ldosh</li>
<li>GLONASS (Rossiya) — 24 ta</li>
<li>Galileo (Yevropa) — 30 ta</li>
<li>BeiDou (Xitoy) — 35 ta</li>
</ul>

<h3>GIS da GPS ishlatish</h3>
<ul>
<li>Maydon ma'lumot to'plash</li>
<li>Koordinatalarni tekshirish</li>
<li>Real vaqt monitoringi</li>
</ul>`,
      },
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      videoDuration: '49:10',
      hasTest: true,
      hasPractical: true,
      duration: '55 daqiqa',
      difficulty: 'intermediate',
    },
  ],
}

export const TESTS = {
  'karto-1': {
    id: 'test-karto-1',
    topicId: 'karto-1',
    subjectId: 'kartografiya',
    title: { uz: "Kartografiya asoslari bo'yicha test", ru: 'Тест по основам картографии', en: 'Test on Cartography Fundamentals' },
    timeLimit: 15,
    passingScore: 60,
    questions: [
      {
        id: 'q1',
        type: 'single',
        question: { uz: "Kartografiya nima?", ru: 'Что такое картография?', en: 'What is cartography?' },
        options: {
          uz: [
            "Xaritalar yaratish va tadqiq etish fani",
            "Yer qobig'ini o'rganuvchi fan",
            "Ob-havo hodisalarini o'rganuvchi fan",
            "Dengiz va okeanlarni o'rganuvchi fan",
          ],
        },
        correctAnswers: [0],
        explanation: { uz: "Kartografiya — xaritalar yaratish, tadqiq etish va ulardan foydalanish fani." },
      },
      {
        id: 'q2',
        type: 'single',
        question: { uz: "Masshtab deb nimaga aytiladi?", ru: 'Что называется масштабом?', en: 'What is called a scale?' },
        options: {
          uz: [
            "Xaritaning rangi",
            "Xaritadagi masofa va real masofa nisbati",
            "Xaritaning o'lchamlari",
            "Koordinatalar tizimi",
          ],
        },
        correctAnswers: [1],
        explanation: { uz: "Masshtab — xaritadagi chiziqli uzunlikning yerda shu chiziqning haqiqiy uzunligiga nisbati." },
      },
      {
        id: 'q3',
        type: 'multiple',
        question: { uz: "Zamonaviy kartografiyaning qaysi yo'nalishlari mavjud? (bir nechta javob tanlang)", ru: 'Какие направления современной картографии существуют?', en: 'What are the directions of modern cartography?' },
        options: {
          uz: [
            "Umumgeografik kartografiya",
            "Tematik kartografiya",
            "Matematik kartografiya",
            "Biologik kartografiya",
          ],
        },
        correctAnswers: [0, 1, 2],
        explanation: { uz: "Biologik kartografiya mavjud emas. Qolgan uchta to'g'ri." },
      },
      {
        id: 'q4',
        type: 'single',
        question: { uz: "Ptolemey kimdir?", ru: 'Кто такой Птолемей?', en: 'Who is Ptolemy?' },
        options: {
          uz: [
            "Birinchi xaritani yaratgan qadimgi misrlik",
            "Geografik koordinatalar tizimini ishlab chiqqan qadimgi olim",
            "Merkator proeksiyasini kashf etgan",
            "GPS tizimini ixtiro qilgan",
          ],
        },
        correctAnswers: [1],
        explanation: { uz: "Ptolemey (milodiy II asr) geografik koordinatalar tizimini ishlab chiqqan." },
      },
      {
        id: 'q5',
        type: 'single',
        question: { uz: "Xaritaning asosiy elementlaridan biri bo'lmagan qaysi?", ru: 'Что не является основным элементом карты?', en: 'What is not a main element of a map?' },
        options: {
          uz: [
            "Masshtab",
            "Proeksiya",
            "Koordinatalar tizimi",
            "Qog'oz turi",
          ],
        },
        correctAnswers: [3],
        explanation: { uz: "Qog'oz turi xaritaning asosiy elementi emas. Masshtab, proeksiya va koordinatalar tizimi asosiy elementlardir." },
      },
    ],
  },
  'karto-2': {
    id: 'test-karto-2',
    topicId: 'karto-2',
    subjectId: 'kartografiya',
    title: { uz: "Xarita turlari bo'yicha test", ru: 'Тест по видам карт', en: 'Test on Types of Maps' },
    timeLimit: 10,
    passingScore: 60,
    questions: [
      {
        id: 'q1',
        type: 'single',
        question: { uz: "1:5000 masshtab qaysi turga kiradi?", ru: 'К какому типу относится масштаб 1:5000?', en: 'What type does the scale 1:5000 belong to?' },
        options: { uz: ["Katta masshtabli", "O'rta masshtabli", "Kichik masshtabli", "Mikro masshtabli"] },
        correctAnswers: [0],
        explanation: { uz: "1:10 000 dan katta masshtablar katta masshtabli deyiladi." },
      },
      {
        id: 'q2',
        type: 'single',
        question: { uz: "Iqlim xaritasi qaysi turga kiradi?", ru: 'К какому типу относится климатическая карта?', en: 'What type does a climate map belong to?' },
        options: { uz: ["Umumgeografik", "Tematik", "Navigatsiya", "Topografik"] },
        correctAnswers: [1],
        explanation: { uz: "Iqlim xaritasi tematik xaritalar turiga kiradi." },
      },
      {
        id: 'q3',
        type: 'single',
        question: { uz: "Merkator proeksiyasi kim tomonidan yaratilgan?", ru: 'Кем создана проекция Меркатора?', en: 'Who created the Mercator projection?' },
        options: { uz: ["Ptolemey", "Merkator", "Lambert", "Gauss"] },
        correctAnswers: [1],
        explanation: { uz: "Merkator proeksiyasi gerhard Merkator tomonidan XVI asrda yaratilgan." },
      },
    ],
  },
  'topo-1': {
    id: 'test-topo-1',
    topicId: 'topo-1',
    subjectId: 'topografiya',
    title: { uz: "Topografik xaritalar bo'yicha test", ru: 'Тест по топографическим картам', en: 'Test on Topographic Maps' },
    timeLimit: 15,
    passingScore: 60,
    questions: [
      {
        id: 'q1',
        type: 'single',
        question: { uz: "Topografik xaritalar odatda qanday masshtabda bo'ladi?", ru: 'В каком масштабе обычно составляются топографические карты?', en: 'What scale are topographic maps usually made at?' },
        options: { uz: ["1:1 000 000 va undan kichik", "1:25 000 dan 1:200 000 gacha", "1:500 000 dan 1:2 000 000 gacha", "1 mm = 1 km"] },
        correctAnswers: [1],
        explanation: { uz: "Topografik xaritalar odatda 1:25 000 dan 1:200 000 gacha masshtabda tuziladi." },
      },
      {
        id: 'q2',
        type: 'single',
        question: { uz: "Topografik xaritada rel'ef qanday ko'rsatiladi?", ru: 'Как показывается рельеф на топографической карте?', en: 'How is relief shown on a topographic map?' },
        options: { uz: ["Ranglar bilan", "Gorizontallar bilan", "Raqamlar bilan", "Belgilar bilan"] },
        correctAnswers: [1],
        explanation: { uz: "Topografik xaritalarda rel'ef gorizontallar yordamida ko'rsatiladi." },
      },
      {
        id: 'q3',
        type: 'multiple',
        question: { uz: "Topografik xaritalar qaysi sohalarda qo'llaniladi? (bir nechta tanlang)", ru: 'В каких областях применяются топографические карты?', en: 'In what fields are topographic maps used?' },
        options: { uz: ["Harbiy maqsadlar", "Qurilish", "Turizm", "Tasviriy san'at"] },
        correctAnswers: [0, 1, 2],
        explanation: { uz: "Topografik xaritalar harbiy, qurilish va turizm maqsadlarida keng qo'llaniladi." },
      },
    ],
  },
  'gis-1': {
    id: 'test-gis-1',
    topicId: 'gis-1',
    subjectId: 'gis',
    title: { uz: "GIS tushunchasi bo'yicha test", ru: 'Тест по понятию ГИС', en: 'Test on GIS Concepts' },
    timeLimit: 15,
    passingScore: 60,
    questions: [
      {
        id: 'q1',
        type: 'single',
        question: { uz: "GIS ning to'liq nomi nima?", ru: 'Какова полная расшифровка ГИС?', en: 'What is the full name of GIS?' },
        options: { uz: ["Global Iqtisodiy Sistema", "Geografik Axborot Tizimi", "Geodezik Ishlov Sxemasi", "Global Ilmiy Standart"] },
        correctAnswers: [1],
        explanation: { uz: "GIS — Geografik Axborot Tizimi." },
      },
      {
        id: 'q2',
        type: 'multiple',
        question: { uz: "GIS ning asosiy tarkibiy qismlari qaysilar? (bir nechta tanlang)", ru: 'Каковы основные компоненты ГИС?', en: 'What are the main components of GIS?' },
        options: { uz: ["Apparat ta'minot", "Dastur ta'minot", "Ma'lumotlar", "Internet tezligi"] },
        correctAnswers: [0, 1, 2],
        explanation: { uz: "GIS ning asosiy komponentlari: apparat, dastur ta'minot va ma'lumotlar." },
      },
      {
        id: 'q3',
        type: 'single',
        question: { uz: "Quyidagilardan qaysi biri GIS dasturi emas?", ru: 'Что из следующего не является ГИС-программой?', en: 'Which of the following is not a GIS software?' },
        options: { uz: ["ArcGIS", "QGIS", "MapInfo", "Microsoft Word"] },
        correctAnswers: [3],
        explanation: { uz: "Microsoft Word matn muharriri bo'lib, GIS dasturi emas." },
      },
      {
        id: 'q4',
        type: 'single',
        question: { uz: "GIS qaysi sohada qo'llanilmaydi?", ru: 'В какой сфере ГИС не применяется?', en: 'In what field is GIS not applied?' },
        options: { uz: ["Shahar rejalashtirish", "Atrof-muhit monitoringi", "Musiqa tarkib etish", "Transport va logistika"] },
        correctAnswers: [2],
        explanation: { uz: "GIS musiqa tarkib etishda qo'llanilmaydi." },
      },
    ],
  },
}

export const VIDEOS = [
  {
    id: 'v1',
    subjectId: 'kartografiya',
    topicId: 'karto-1',
    title: { uz: "Kartografiya asoslari - 1-dars", ru: 'Основы картографии - Урок 1', en: 'Cartography Basics - Lesson 1' },
    url: 'https://www.youtube.com/watch?v=BHACKCNDMW8',
    thumbnail: 'https://img.youtube.com/vi/BHACKCNDMW8/maxresdefault.jpg',
    duration: '42:15',
    views: 1234,
    date: '2024-01-15',
  },
  {
    id: 'v2',
    subjectId: 'kartografiya',
    topicId: 'karto-2',
    title: { uz: "Xarita turlari - 2-dars", ru: 'Виды карт - Урок 2', en: 'Map Types - Lesson 2' },
    url: 'https://www.youtube.com/watch?v=kl7ziH4ULUE',
    thumbnail: 'https://img.youtube.com/vi/kl7ziH4ULUE/maxresdefault.jpg',
    duration: '38:20',
    views: 987,
    date: '2024-01-22',
  },
  {
    id: 'v3',
    subjectId: 'topografiya',
    topicId: 'topo-1',
    title: { uz: "Topografik xaritalar - 1-dars", ru: 'Топографические карты - Урок 1', en: 'Topographic Maps - Lesson 1' },
    url: 'https://www.youtube.com/watch?v=p_d3KalTvBI',
    thumbnail: 'https://img.youtube.com/vi/p_d3KalTvBI/maxresdefault.jpg',
    duration: '44:20',
    views: 856,
    date: '2024-02-01',
  },
  {
    id: 'v4',
    subjectId: 'gis',
    topicId: 'gis-1',
    title: { uz: "GIS tushunchasi - 1-dars", ru: 'Понятие ГИС - Урок 1', en: 'GIS Concepts - Lesson 1' },
    url: 'https://www.youtube.com/watch?v=qFx2_diyeMs',
    thumbnail: 'https://img.youtube.com/vi/qFx2_diyeMs/maxresdefault.jpg',
    duration: '50:30',
    views: 2341,
    date: '2024-02-10',
  },
  {
    id: 'v5',
    subjectId: 'gis',
    topicId: 'gis-2',
    title: { uz: "ArcGIS bilan ishlash - 2-dars", ru: 'Работа с ArcGIS - Урок 2', en: 'Working with ArcGIS - Lesson 2' },
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    duration: '68:45',
    views: 1567,
    date: '2024-02-18',
  },
  {
    id: 'v6',
    subjectId: 'topografiya',
    topicId: 'topo-3',
    title: { uz: "Rel'ef va gorizontallar - 3-dars", ru: 'Рельеф и горизонтали - Урок 3', en: 'Relief and Contours - Lesson 3' },
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    duration: '51:40',
    views: 743,
    date: '2024-02-25',
  },
]

export const MATERIALS = [
  {
    id: 'm1',
    subjectId: 'kartografiya',
    title: { uz: "Kartografiya asoslari - Ma'ruzalar kursi", ru: 'Основы картографии - Курс лекций', en: 'Cartography Fundamentals - Lecture Course' },
    type: 'PDF',
    size: '2.4 MB',
    downloads: 456,
    date: '2024-01-10',
    url: '#',
  },
  {
    id: 'm2',
    subjectId: 'kartografiya',
    title: { uz: "Xarita proeksiyalari - Qo'llanma", ru: 'Проекции карт - Пособие', en: 'Map Projections - Guide' },
    type: 'PDF',
    size: '1.8 MB',
    downloads: 312,
    date: '2024-01-20',
    url: '#',
  },
  {
    id: 'm3',
    subjectId: 'topografiya',
    title: { uz: "Topografik belgilar jadvali", ru: 'Таблица топографических знаков', en: 'Topographic Signs Table' },
    type: 'PDF',
    size: '3.1 MB',
    downloads: 678,
    date: '2024-01-25',
    url: '#',
  },
  {
    id: 'm4',
    subjectId: 'topografiya',
    title: { uz: "Nivelirovka amaliy mashg'ulotlar", ru: 'Нивелирование - практические занятия', en: 'Leveling - Practical Classes' },
    type: 'DOCX',
    size: '0.9 MB',
    downloads: 234,
    date: '2024-02-05',
    url: '#',
  },
  {
    id: 'm5',
    subjectId: 'gis',
    title: { uz: "QGIS boshlang'ich qo'llanma", ru: 'Руководство начинающего QGIS', en: 'QGIS Beginner Guide' },
    type: 'PDF',
    size: '5.2 MB',
    downloads: 892,
    date: '2024-02-12',
    url: '#',
  },
  {
    id: 'm6',
    subjectId: 'gis',
    title: { uz: "ArcGIS amaliy topshiriqlar to'plami", ru: 'Сборник практических заданий ArcGIS', en: 'ArcGIS Practical Assignments Collection' },
    type: 'ZIP',
    size: '15.7 MB',
    downloads: 445,
    date: '2024-02-20',
    url: '#',
  },
  {
    id: 'm7',
    subjectId: 'gis',
    title: { uz: "GIS ma'lumot bazalari", ru: 'Базы данных ГИС', en: 'GIS Databases' },
    type: 'PPTX',
    size: '4.3 MB',
    downloads: 321,
    date: '2024-03-01',
    url: '#',
  },
]

export const ASSIGNMENTS = [
  {
    id: 'a1',
    subjectId: 'kartografiya',
    topicId: 'karto-1',
    title: { uz: "Xarita tahlili", ru: 'Анализ карты', en: 'Map Analysis' },
    description: { uz: "Berilgan kartografik materiallarni tahlil qiling va hisobot yozing. Xaritaning masshtabini aniqlang, koordinatalar tizimini tushuntiring va asosiy elementlarini ta'riflang." },
    dueDate: '2024-04-01',
    maxScore: 100,
    status: 'active',
  },
  {
    id: 'a2',
    subjectId: 'topografiya',
    topicId: 'topo-3',
    title: { uz: "Gorizontallar bilan ishlash", ru: 'Работа с горизонталями', en: 'Working with Contours' },
    description: { uz: "Berilgan topografik xaritada gorizontallarni tahlil qiling. Tog' cho'qqisini, vodiyni va qiyalikni aniqlang. Kesim balandligini hisoblang." },
    dueDate: '2024-04-10',
    maxScore: 100,
    status: 'active',
  },
  {
    id: 'a3',
    subjectId: 'gis',
    topicId: 'gis-3',
    title: { uz: "QGIS loyihasi", ru: 'Проект QGIS', en: 'QGIS Project' },
    description: { uz: "QGIS da yangi loyiha yarating. Toshkent shahrining ma'muriy chegara qatlamini yuklang. Atribut jadvalini to'ldiring va xarita chiqaring." },
    dueDate: '2024-04-20',
    maxScore: 100,
    status: 'active',
  },
]

export const DEMO_USERS = {
  admin: {
    id: 'user-admin',
    email: 'admin@geoedu.uz',
    password: 'admin123',
    name: 'Abdullayev Jasur',
    role: 'admin',
    avatar: null,
    university: "O'zbekiston Milliy Universiteti",
    group: null,
    joinDate: '2023-09-01',
    completedTopics: [],
    testResults: [],
    certificates: [],
  },
  teacher: {
    id: 'user-teacher',
    email: 'teacher@geoedu.uz',
    password: 'teacher123',
    name: "Rahimova Malika",
    role: 'teacher',
    avatar: null,
    university: "Toshkent Davlat Texnika Universiteti",
    group: null,
    joinDate: '2023-09-05',
    completedTopics: [],
    testResults: [],
    certificates: [],
  },
  student: {
    id: 'user-student',
    email: 'student@geoedu.uz',
    password: 'student123',
    name: 'Mirzayev Bobur',
    role: 'student',
    avatar: null,
    university: "Samarqand Davlat Universiteti",
    group: 'GIS-21',
    joinDate: '2023-09-10',
    completedTopics: ['karto-1', 'karto-2', 'topo-1'],
    testResults: [
      { testId: 'test-karto-1', score: 80, maxScore: 100, date: '2024-01-20', passed: true },
      { testId: 'test-karto-2', score: 67, maxScore: 100, date: '2024-01-28', passed: true },
      { testId: 'test-topo-1', score: 100, maxScore: 100, date: '2024-02-05', passed: true },
    ],
    certificates: [],
  },
}

export const LEADERBOARD = [
  { id: 'u1', name: 'Mirzayev Bobur', avatar: null, score: 2450, tests: 12, group: 'GIS-21' },
  { id: 'u2', name: 'Hasanova Dilnoza', avatar: null, score: 2380, tests: 11, group: 'KAR-21' },
  { id: 'u3', name: "Toshmatov Sardor", avatar: null, score: 2210, tests: 10, group: 'TOP-22' },
  { id: 'u4', name: 'Yusupova Feruza', avatar: null, score: 2100, tests: 10, group: 'GIS-21' },
  { id: 'u5', name: "Qodirov Ulug'bek", avatar: null, score: 1980, tests: 9, group: 'KAR-22' },
  { id: 'u6', name: 'Nazarova Shahlo', avatar: null, score: 1870, tests: 9, group: 'TOP-21' },
  { id: 'u7', name: 'Ergashev Jahongir', avatar: null, score: 1760, tests: 8, group: 'GIS-22' },
  { id: 'u8', name: 'Mamatova Gulnora', avatar: null, score: 1650, tests: 8, group: 'KAR-21' },
  { id: 'u9', name: "Aliyev Sherzod", avatar: null, score: 1540, tests: 7, group: 'TOP-22' },
  { id: 'u10', name: 'Raximova Kamola', avatar: null, score: 1430, tests: 7, group: 'GIS-21' },
]

export const STATS = {
  totalStudents: 744,
  totalTeachers: 12,
  totalTopics: 18,
  totalTests: 24,
  totalVideos: 36,
  totalMaterials: 45,
  avgScore: 74.5,
  activeUsers: 312,
}
