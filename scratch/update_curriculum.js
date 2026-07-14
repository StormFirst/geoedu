import fs from 'fs';

// Load parsed topics from JSON
const parsedTopics = JSON.parse(fs.readFileSync('/Users/libertywalk/gat/parsed_topics.json', 'utf-8'));

// Filter topografiya, kartografiya, gis
const topoParsed = parsedTopics.filter(t => t.num >= 1 && t.num <= 8);
const kartoParsed = parsedTopics.filter(t => t.num >= 9 && t.num <= 17);
const gisParsed = parsedTopics.filter(t => t.num >= 18 && t.num <= 36);

// Translations mapping for all topics to keep ru and en versions
const topoTranslations = {
  1: {
    ru: "Цель и задачи курса. Форма и размеры Земли",
    en: "Course Goals. Shape and Size of Earth",
    content: `<h2>Kursning maqsadi va vazifalari. Yerning shakli va o'lchamlari</h2><p>Topografiya va kartografiya fanining maqsadi va vazifalari. Geodeziya va topografiyani ta'rifi va uning vazifalari, boshqa fanlar bilan aloqasi Yerning shakli va o'lchamlari.</p><h3>Yerning shakli</h3><p>Yer shar shaklida emas, balki geoid shaklida bo'lib, qutblardan biroz yassilangan ellipsoid (sferoid) ko'rinishiga yaqin. Krasovskiy ellipsoidida: a = 6 378 245 m, b = 6 356 863 m, 1/f = 298.3.</p>`
  },
  2: {
    ru: "Понятие о планах, картах и профилях. Масштабы планов и карт. Номенклатура топографических карт и планов",
    en: "Understanding Plans, Maps, and Profiles. Scale of Plans and Maps. Nomenclature of Topographic Maps and Plans",
    content: `<h2>Plan, xarita va profillar to'g'risida tushuncha. Plan, xaritalarning masshtablari. Topografik xarita, planlarning nomenklaturasi</h2><p>Xarita, plan va profil. Topografik plan va xaritalar uchun shartli belgilar. Masshtablar: sonli, chiziqli va ko'ndalang masshtablar. Masshtab aniqligi. Topografik plan va xaritalar nomenklaturasi.</p>`
  },
  3: {
    ru: "Системы координат и высот, применяемые в топографии",
    en: "Coordinate and Height Systems Used in Topography",
    content: `<h2>Topografiyada qo'llaniladigan koordinatalar va balandliklar sistemalari</h2><p>Geografik koordinatalar sistemasi. To'g'ri burchakli koordinatalar sistemasi. Balandlik sistemalari. Mutloq va nisbiy balandliklar.</p>`
  },
  4: {
    ru: "Углы ориентирования",
    en: "Orientation Angles",
    content: `<h2>Oriyentirlash burchaklari</h2><p>Chiziqlarni oriyentirlash. haqiqiy azimut, direksion burchak, magnit azimuti va rumb. Ular orasidagi munosabat. Xarita va planlarda azimut, rumb va direksion burchaklarni aniqlash.</p>`
  },
  5: {
    ru: "Рельеф Земли и его изображение на планах и картах",
    en: "Earth Relief and its Representation on Plans and Maps",
    content: `<h2>Yer relyefi va uni plan va xaritalarda tasvirlash</h2><p>Relyefni tasvirlash usullari. Relyefni gorizontallar bilan tasvirlash. Topografik plan va xaritalar shartli belgilari. Topografik xaritada bajariladigan mashqlar.</p>`
  },
  6: {
    ru: "Измерение углов",
    en: "Angle Measurement",
    content: `<h2>Burchaklarni o'lchash</h2><p>Gorizontal burchakni o'lchash mohiyati; teodolitlarni sinflanishi va tuzilishi. Gorizontal burchaklarni o'lchash prinsipi va usullari. Teodolitni nuqtada o'rnatish va ish holatga keltirish. Vertikal burchaklarni o'lchash, burchak o'lchash aniqligi. Elektron teodolitlar haqida ma'lumot.</p>`
  },
  7: {
    ru: "Теодолитная съёмка",
    en: "Theodolite Survey",
    content: `<h2>Teodolit syomkasi</h2><p>Teodolit syomkasining mohiyati, teodolit yo'llarni o'tkazish. Teodolit yo'llarida burchak va tomonlar uzunligini o'lchash. Tafsilotlarni syomka qilish usullari va teodolit syomka planni rasmiylashtirish.</p>`
  },
  8: {
    ru: "Нивелирование",
    en: "Leveling",
    content: `<h2>Nivelirlash</h2><p>Nivelirlashning mohiyati va turlari. Geometrik nivelirlash usullari. Ketma - ket geometrik nivelirlash. Nivelirlar turi. Aniq va texnik nivelirlar tuzilishi. Nivelir reykalari. Elektron raqamli nivelirlar haqida ma'lumot.</p>`
  }
};

const kartoTranslations = {
  9: {
    ru: "Карта и другие картографические произведения",
    en: "Maps and Other Cartographic Works",
    content: `<h2>Xarita va boshqa kartografik asarlar</h2><p>Xaritaga ta'rif. Umumgeografik va mavzuli xaritalarni elementlari. Geografik atlaslar, sistemali kartografik asar sifatida.</p>`
  },
  10: {
    ru: "Математическая основа карты",
    en: "Mathematical Basis of Maps",
    content: `<h2>Xaritani matematik asosi</h2><p>Yer ellipsoidi. Masshtablar. Kartografik proyeksiyalar haqida tushuncha, ularni turlari, proyeksiyalarni tasnifi.</p>`
  },
  11: {
    ru: "Выбор проекций",
    en: "Choosing Projections",
    content: `<h2>Proyeksiyalar tanlash</h2><p>Dunyo, yarimsharlar, materiklar va davlatlar xaritalari uchun proyeksiyalar. Kartografik proyeksiyani tanlash xaritaning ilmiy ishonchliligi va amaliy qo'llanish doirasini belgilaydi.</p>`
  },
  12: {
    ru: "Методы картографического изображения",
    en: "Methods of Cartographic Representation",
    content: `<h2>Kartografik tasvirlash usullari</h2><p>Kartografik belgilar; ularni funksiyasi va qo'llanilishi. Tasvirlash usullari: belgilar, teng chiziqlar, sifatli rang va boshqalar.</p>`
  },
  13: {
    ru: "Методы изображения рельефа",
    en: "Methods of Relief Representation",
    content: `<h2>Relyefni tasvirlash usullari</h2><p>Shkalalarni ishlab chiqish, har xil tasvirlash usullarini birgalikda qo'llash. Relyefni tasvirlash usullari haqida tushuncha.</p>`
  },
  14: {
    ru: "Картографическая генерализация",
    en: "Cartographic Generalization",
    content: `<h2>Kartografik generalizatsiya</h2><p>Generalizatsiyani mohiyati va omillari. Generalizatsiyani turlari va yo'llari. Punktlarda, chiziqlarda va maydonlarda tarqalgan xodisalarni generalizatsiya qilish.</p>`
  },
  15: {
    ru: "Географические карты и атласы, их типы",
    en: "Geographic Maps and Atlases, and Their Types",
    content: `<h2>Geografik xarita va atlaslar va ularni tiplari</h2><p>Geografik xaritalarni tayyorlash usullari. Xaritalar dasturi, xaritani tuzish taxrir qilish. Umumgeografik, mavzuli va maxsus xaritalarni loyihalash usullari.</p>`
  },
  16: {
    ru: "Использование карт",
    en: "Map Use",
    content: `<h2>Xaritalardan foydalanish</h2><p>Xaritalardan foydalanish haqida tushuncha. Xaritalardan foydalanishni asosiy usullari. Kartografik tadqiqot usuli.</p>`
  },
  17: {
    ru: "Анализ и оценка географических карт и атласов",
    en: "Analysis and Evaluation of Geographic Maps and Atlases",
    content: `<h2>Geografik xarita va atlaslarni tahlil qilish va baholash</h2><p>Xaritalarni tahlil qilish va baholash haqida tushuncha. Xaritalarni ishonchliligi. Xaritalarni matematik asosi. Mazmunini to'liqligini tahlil qilish. Informatsiya hajmini baholash haqida. Xaritalarni jihozlash sifatini baholash. Atlaslarni tahlil qilish va baholash.</p>`
  }
};

const gisTranslations = {
  18: {
    ru: "Основы географических информационных систем",
    en: "Fundamentals of Geographic Information Systems",
    content: "<h2>Geografik axborot tizimlari (GAT) asoslari</h2><p>Geografik axborot tizimlari fani tushunchasi va vazifalari. Zamonaviy GAT texnalogiyalarining roli, GAT to'g'risida umumiy ma'lumot.</p><h3>GATning 5 komponenti</h3><ul><li><strong>Apparat ta'minot</strong>: kompyuter, server, GPS qabul qilgich, skaner, plotter</li><li><strong>Dastur ta'minot</strong>: ArcGIS, QGIS, MapInfo, Google Earth Engine</li><li><strong>Ma'lumotlar</strong>: vektor, raster, atribut, metadata</li><li><strong>Metodlar</strong>: fazoviy tahlil algoritmlari va modellashtirish</li><li><strong>Foydalanuvchilar</strong>: operatorlar, tahlilchilar, qaror qabul qiluvchilar</li></ul>"
  },
  19: {
    ru: "Области применения ГИС",
    en: "GIS Application Areas",
    content: "<h2>GAT ni qo'llanilish sohalari</h2><p>Asosiy ishlatiladigan termin va atamalar. Tizimning qo'llanilish sohalari. Geomatika tushunchasi va tizimdagi o'rni. Geokodlash.</p>"
  },
  20: {
    ru: "Сбор и ввод данных для ГИС",
    en: "Data Collection and Input for GIS",
    content: "<h2>Geografik axborot tizimlari uchun ma'lumotlarni to'plash va uni kiritish</h2><p>Ma'lumot va axborot to'g'risida tushuncha. Ma'lumotlarni to'plash usullari. Ma'lumot to'plashning bosqichlari. Asosiy geografik ma'lumot olish turlari.</p>"
  },
  21: {
    ru: "Суть растра и вектора",
    en: "Raster and Vector Concepts",
    content: "<h2>Rastr va vektor mohiyati</h2><p>Rastr va vektor ma'lumot olish. Yordamchi yoki ikkilamchi geografik ma'lumot olish. Raqamli fotogrammetriya orqali ma'lumot olish. GPS qurilmasi orqali ma'lumot olish.</p>"
  },
  22: {
    ru: "Получение геоданных из интернет-источников",
    en: "Getting Geodata from Internet Sources",
    content: "<h2>Internet manbalaridan geoma'lumotlar olish</h2><p>Tashqi manbalardan ma'lumot olish. Geografik ma'lumot formatlari.</p>"
  },
  23: {
    ru: "Организация и обработка информации в ГИС",
    en: "Organizing and Processing Information in GIS",
    content: "<h2>Geografik axborot tizimida axborotlarni tashkillashtirish va qayta ishlash</h2><p>Raqamli maxsus GAT texnalogiyalari va tasvirlashning qoidalari. Boshqariladigan raqamlashtirish va vektorizatsiyalash. Topologiya.</p>"
  },
  24: {
    ru: "База геоданных",
    en: "Geodatabase",
    content: "<h2>Geoma'lumotlar bazasi</h2><p>Ma'lumotni MBBT jadvallarida joylashtirish. Ma'lumotlar bazasini loyihalash. SQL to'g'risida tushuncha. Indekslashning so'rov jarayonidagi ahamiyati.</p>"
  },
  25: {
    ru: "Понятие о базах данных",
    en: "Database Concepts",
    content: "<h2>Ma'lumotlar bazasi haqida tushuncha</h2><p>Ma'lumotlar bazasini boshqarish tizimi (MBBT). Ma'lumotlar bazasini boshqaruvchi dasturlar. MBBT ning turlari. MBBT ning afzalliklari. MBBT ning vazifalari.</p>"
  },
  26: {
    ru: "Анализ данных в ГИС (Геовизуализация)",
    en: "Data Analysis in GIS (Geovisualization)",
    content: "<h2>Geografik axborot tizimida ma'lumotlarni tahlil qilish</h2><p>Geografiyada GAT ma'lumotlari to'plash usullari. GATda kartografik tasvirlash usullari. Geovizuallashtirish tushunchasi mohiyati.</p>"
  },
  27: {
    ru: "Анализ данных в ГИС (Пространственное моделирование)",
    en: "Data Analysis in GIS (Spatial Modeling)",
    content: "<h2>Geografik axborot tizimida ma'lumotlarni tahlil qilish</h2><p>Modellashtirish va modellar. GATda fazoviy modellashtirish. Fazoviy ma'lumotlarning formatlari. Geografiyada GAT ma'lumotlarni geofazoviy tahlil qilish.</p>"
  },
  28: {
    ru: "Понятие и методы геопространственного анализа",
    en: "Geospatial Analysis Concepts and Methods",
    content: "<h2>Geofazoviy tahlil tushunchasi va usullari</h2><p>Geofazoviy tahlil to'g'risida tushuncha. Geofazoviy tahlil usullari. Geofazoviy o'lchovlar. Overley operatsiyasi. Tarmoq tahlili. Yer yuzasi tahlili.</p>"
  },
  29: {
    ru: "Отображение данных исследований в ГИС",
    en: "Representing Research Data in GIS",
    content: "<h2>Geografik tadqiqotlarda olingan ma'lumotlarni GAT da aks ettirish</h2><p>Geotasvirlash usullari. Sinflash, qayta sinflash, kartani qiyoslash, grafik va hisobot ko'rinishlari, karta orqali tasvirlash. Elektron kartalar tizimi. Plotter va uning qo'llanilishi.</p>"
  },
  30: {
    ru: "Трехмерное изображение геопространственных данных в ГИС",
    en: "3D Representation of Geospatial Data in GIS",
    content: "<h2>GATda geofazoviy ma’lumotlarning uch o‘lchovli tasviri</h2><p>GAT texnologiyalari yordamida geofazoviy ma'lumotlarning uch o'lchovli tasviri. Uch o'lchamli tasvirlash. Relyefning raqamli modeli (RRM-DEM) va Joyning raqamli modeli (JRM-DTM).</p>"
  },
  31: {
    ru: "Проект умного города и его 3D-модель в ГИС",
    en: "Smart City Project and its 3D Model in GIS",
    content: "<h2>GATda aqlli shahar loyihasi va uning uch o‘lchovli modeli</h2><p>GAT texnologiyalari orqali shaharning uch o'lchovli modeli (Smart city). Geofazoviy ma'lumotlarni uch o'lchovli tasvirlash.</p>"
  },
  32: {
    ru: "Организация управления в ГИС",
    en: "Managing and Organizing GIS",
    content: "<h2>Geografik axborot tizimida boshqaruvni tashkillashtirish</h2><p>Geografik axborot tizimida boshqaruvning o'rni va vazifalari. Dasturiy ta'minot va uning turlari. Geografik axborot dasturlarini o'rnatishga bo'lgan talablarni o'rganish. Tizimda qo'llaniladigan kompyuter texnologiyalari va ularni boshqarish. Ekspert tizimlar to'g'risida tushunchalar.</p>"
  },
  33: {
    ru: "Современное развитие географических информационных систем",
    en: "Modern Development of GIS",
    content: "<h2>Geografik axborot tizimining zamonaviy rivojlanishi</h2><p>Geografik axborot tizimini ishlatishda multimedia vositalarining o'rni. Geografik axborot tizimi dasturlari va ma'lumotlarini internet tarmog'i orqali o'rganish. Uch o'lchamli modellarning o'rni. Mobillashgan geografik axborot tizimini o'rganish.</p>"
  },
  34: {
    ru: "Общие сведения о дистанционном зондировании в географических исследованиях",
    en: "General Information about Remote Sensing in Geographic Research",
    content: "<h2>Geografik tadqiqotlarda masofadan zondlash haqida umumiy ma’lumotlar</h2><p>Raqamli xaritalash. Masofadan zondlash texnologiyasi. Masofadan zondlash orqali olingan maxsulot. Geoaxborot tizimining masofadan zondlash bilan o'zaro aloqadorligi.</p>"
  },
  35: {
    ru: "Методы получения космических снимков в ГИС",
    en: "Methods of Obtaining Satellite Images in GIS",
    content: "<h2>GATda kosmik suratlarni olish usullari</h2><p>Kosmik suratlarni olish usullari. Masofadan ma'lumot olishdagi muammolar. Turli kosmik suratlarning xususiyatlari to'g'risida ma'lumotlar. Global Pozitsiyalash tizimi (GPS) va uning qo'llanilishi. GPS-pryomniklar to'g'risida ma'lumotlar.</p>"
  },
  36: {
    ru: "Обработка аэрокосмических снимков на основе ГИС-технологий",
    en: "Processing Aerospace Images Based on GIS Technologies",
    content: "<h2>GAT texnologiyalari asosida aerokosmik suratlarni qayta ishlasah</h2><p>Aerokosmik suratlarni olish usullari. Aerokosmik suratlarni olishdagi muammolar. Turli aerokosmik suratlarning xususiyatlari to'g'risida ma'lumotlar.</p>"
  }
};

const SUBJECTS = [
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
    topicsCount: 8,
    videosCount: 10,
    testsCount: 8,
    materialsCount: 12,
    studentsCount: 198,
  },
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
    topicsCount: 9,
    videosCount: 12,
    testsCount: 9,
    materialsCount: 15,
    studentsCount: 234,
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
    topicsCount: 19,
    videosCount: 14,
    testsCount: 19,
    materialsCount: 18,
    studentsCount: 312,
  },
];

const TOPICS = {
  topografiya: topoParsed.map((t, idx) => ({
    id: `topo-${idx + 1}`,
    subjectId: 'topografiya',
    order: idx + 1,
    title: {
      uz: t.title,
      ru: topoTranslations[t.num].ru,
      en: topoTranslations[t.num].en
    },
    content: {
      uz: topoTranslations[t.num].content
    },
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    videoDuration: '45:00',
    hasTest: true,
    hasPractical: true,
    duration: '45 daqiqa',
    difficulty: 'beginner'
  })),
  kartografiya: kartoParsed.map((t, idx) => ({
    id: `karto-${idx + 1}`,
    subjectId: 'kartografiya',
    order: idx + 1,
    title: {
      uz: t.title,
      ru: kartoTranslations[t.num].ru,
      en: kartoTranslations[t.num].en
    },
    content: {
      uz: kartoTranslations[t.num].content
    },
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    videoDuration: '50:00',
    hasTest: true,
    hasPractical: true,
    duration: '50 daqiqa',
    difficulty: 'intermediate'
  })),
  gis: gisParsed.map((t, idx) => ({
    id: `gis-${idx + 1}`,
    subjectId: 'gis',
    order: idx + 1,
    title: {
      uz: t.title,
      ru: gisTranslations[t.num].ru,
      en: gisTranslations[t.num].en
    },
    content: {
      uz: gisTranslations[t.num].content
    },
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    videoDuration: '55:00',
    hasTest: true,
    hasPractical: true,
    duration: '55 daqiqa',
    difficulty: 'advanced'
  }))
};

// Let's write the assignments list (28 matching the doc exactly)
const ASSIGNMENTS = [
  {
    id: 'a1',
    subjectId: 'topografiya',
    topicId: 'topo-2',
    title: { uz: "Masshtab turlari bo‘yicha mashqlar bajarish", ru: "Упражнения по типам масштабов", en: "Exercises on Scale Types" },
    description: { uz: "Masshtab turlari bo'yicha mashqlar bajarish: sonli, chiziqli va ko'ndalang masshtablarni hisoblash, xaritadagi masofalarni joydagi masofaga aylantirish." },
    dueDate: '2024-09-15',
    maxScore: 100,
    status: 'active'
  },
  {
    id: 'a2',
    subjectId: 'topografiya',
    topicId: 'topo-2',
    title: { uz: "1:10 000 masshtabli karta varag‘i nomenklaturasini nuqta geografik koordinatalari bo‘yicha aniqlash", ru: "Определение номенклатуры листа карты масштаба 1:10 000 по географическим координатам точки", en: "Determining 1:10,000 Scale Map Nomenclature by Geographic Coordinates" },
    description: { uz: "Berilgan geografik koordinatalarga ko'ra 1:10 000 masshtabli topografik xarita varag'ining nomenklaturasini hisoblash va aniqlash." },
    dueDate: '2024-09-22',
    maxScore: 100,
    status: 'active'
  },
  {
    id: 'a3',
    subjectId: 'topografiya',
    topicId: 'topo-4',
    title: { uz: "Topografik karta ustida masalalar yechish: koordinatalar, azimut va direksion burchaklarni aniqlash", ru: "Решение задач на топографической карте: определение координат, азимутов и дирекционных углов", en: "Solving Map Tasks: Determining Coordinates, Azimuths, and Direction Angles" },
    description: { uz: "Xaritadan nuqtalarning geografik va to'g'ri burchakli koordinatalarini aniqlash, berilgan yo'nalishlarning azimuti va direksion burchaklarini o'lchash." },
    dueDate: '2024-10-01',
    maxScore: 100,
    status: 'active'
  },
  {
    id: 'a4',
    subjectId: 'topografiya',
    topicId: 'topo-5',
    title: { uz: "Topografik karta ustida masalalar yechish: Gorizontallar bo‘yicha masalalar", ru: "Решение задач на топографической карте: задачи по горизонталям", en: "Solving Map Tasks: Contour Line Tasks" },
    description: { uz: "Gorizontallar yordamida relyef shakllarini aniqlash, nuqtalarning balandligini topish va qiyalik foizini hisoblash." },
    dueDate: '2024-10-10',
    maxScore: 100,
    status: 'active'
  },
  {
    id: 'a5',
    subjectId: 'topografiya',
    topicId: 'topo-6',
    title: { uz: "Teodolitni nuqtaga o‘rnatish tartibi va gorizontal burchaklarni o‘lchash", ru: "Порядок установки теодолита на точке и измерение горизонтальных углов", en: "Theodolite Setup and Horizontal Angle Measurement" },
    description: { uz: "Teodolitni markazlashtirish va gorizontallash. To'la qabul usulida gorizontal burchak o'lchash. Lenta/ruletka bilan masofa o'lchash." },
    dueDate: '2024-10-20',
    maxScore: 100,
    status: 'active'
  },
  {
    id: 'a6',
    subjectId: 'topografiya',
    topicId: 'topo-7',
    title: { uz: "Teodolit syomkasi planini 1:1 000 masshtabda tuzish va rasmiylashtirish", ru: "Составление и оформление плана теодолитной съёмки в масштабе 1:1 000", en: "Compiling and Designing a 1:1,000 Theodolite Survey Plan" },
    description: { uz: "Teodolit yo'li jurnalini qayta ishlash, koordinatalarni hisoblash va plan chizish." },
    dueDate: '2024-10-30',
    maxScore: 100,
    status: 'active'
  },
  {
    id: 'a7',
    subjectId: 'topografiya',
    topicId: 'topo-8',
    title: { uz: "Aniq nivelirlar (NV-1, N3) va nivelir reykalarini tuzilishini o'rganish", ru: "Изучение устройства точных нивелиров (НВ-1, Н3) и нивелирных реек", en: "Studying the Design of Precision Levels (NV-1, N3) and Leveling Staffs" },
    description: { uz: "Nivelir va reyka tuzilishi bilan tanishish, geometrik nivelirlashni bekatda bajarish va nazorat o'lchovlarini amalga oshirish." },
    dueDate: '2024-11-05',
    maxScore: 100,
    status: 'active'
  },
  {
    id: 'a8',
    subjectId: 'topografiya',
    topicId: 'topo-8',
    title: { uz: "Trassa nivelirlash jurnalini ishlab chiqish va nuqtalar balandligini aniqlash", ru: "Обработка журнала нивелирования трассы и определение высот точек", en: "Processing Route Leveling Log and Determining Point Heights" },
    description: { uz: "Trassa nivelirlash jurnali ma'lumotlarini hisoblash, bog'lovchi va oraliq nuqtalar balandligini aniqlash." },
    dueDate: '2024-11-12',
    maxScore: 100,
    status: 'active'
  },
  {
    id: 'a9',
    subjectId: 'topografiya',
    topicId: 'topo-8',
    title: { uz: "Nivelirlash jurnalini ishlab chiqish va bo‘ylama profil tuzish", ru: "Обработка журнала нивелирования и составление продольного профиля", en: "Processing Leveling Log and Construction of Longitudinal Profile" },
    description: { uz: "Nivelirlash jurnali asosida bo'ylama profil chizish va loyiha balandliklarini aniqlash." },
    dueDate: '2024-11-20',
    maxScore: 100,
    status: 'active'
  },
  {
    id: 'a10',
    subjectId: 'kartografiya',
    topicId: 'karto-1',
    title: { uz: "Umumgeografik va mavzuli maxsus kartalarning elementlarini o‘rganish", ru: "Изучение элементов общегеографических и тематических специальных карт", en: "Studying Elements of General Geographic and Thematic Special Maps" },
    description: { uz: "Umumgeografik va mavzuli (tematik), maxsus kartalarning elementlarini o'rganish va farqlarini aniqlash." },
    dueDate: '2024-11-28',
    maxScore: 100,
    status: 'active'
  },
  {
    id: 'a11',
    subjectId: 'kartografiya',
    topicId: 'karto-1',
    title: { uz: "Geografik globus va u bilan ishlash", ru: "Географический глобус и работа с ним", en: "Geographic Globe and Working with It" },
    description: { uz: "Globus yordamida geografik koordinatalar, masofalar va yo'nalishlarni aniqlash mashqlarini bajarish." },
    dueDate: '2024-12-05',
    maxScore: 100,
    status: 'active'
  },
  {
    id: 'a12',
    subjectId: 'kartografiya',
    topicId: 'karto-3',
    title: { uz: "Silindrik, azimutal va konusli proyeksiyalarni oddiy usulda chizish", ru: "Черчение цилиндрических, азимутальных и конических проекций простым способом", en: "Drawing Cylindrical, Azimuthal, and Conic Projections Simply" },
    description: { uz: "To'g'ri burchakli silindrik, qutbiy azimutal va konusli proyeksiyalarni oddiy usulda chizish va proyeksiyaning buzilish turlarini tahlil qilish." },
    dueDate: '2024-12-15',
    maxScore: 100,
    status: 'active'
  },
  {
    id: 'a13',
    subjectId: 'kartografiya',
    topicId: 'karto-4',
    title: { uz: "Kartografik tasvirlash usullarini o‘rganish", ru: "Изучение методов картографического изображения", en: "Studying Cartographic Representation Methods" },
    description: { uz: "Xaritada geografik hodisalarni ifodalash usullarini (belgilar, areallar, kartogramma va b.) o'rganish." },
    dueDate: '2024-12-22',
    maxScore: 100,
    status: 'active'
  },
  {
    id: 'a14',
    subjectId: 'kartografiya',
    topicId: 'karto-9',
    title: { uz: "Umumgeografik va mavzuli kartalarni o‘rganish, tahlil qilish va baholash", ru: "Изучение, анализ и оценка общегеографических и тематических карт", en: "Studying, Analyzing, and Evaluating General Geographic and Thematic Maps" },
    description: { uz: "Umumgeografik va mavzuli xaritalarni tahlil qilish, ularning aniqligi va metodologiyasini baholash." },
    dueDate: '2024-12-30',
    maxScore: 100,
    status: 'active'
  },
  {
    id: 'a15',
    subjectId: 'gis',
    topicId: 'gis-1',
    title: { uz: "GATning asosiy tushunchalari va dasturlari", ru: "Основные понятия и программы ГИС", en: "Basic GIS Concepts and Software" },
    description: { uz: "GATning 5 komponenti va dasturiy ta'minotlari haqida umumiy tushunchalarni o'rganish." },
    dueDate: '2025-01-10',
    maxScore: 100,
    status: 'active'
  },
  {
    id: 'a16',
    subjectId: 'gis',
    topicId: 'gis-1',
    title: { uz: "GAT dasturlari bilan tanishish", ru: "Ознакомление с программами ГИС", en: "Introduction to GIS Software" },
    description: { uz: "QGIS va ArcGIS dasturiy ta'minotlarining interfeysi va asosiy panellari bilan tanishish." },
    dueDate: '2025-01-18',
    maxScore: 100,
    status: 'active'
  },
  {
    id: 'a17',
    subjectId: 'gis',
    topicId: 'gis-3',
    title: { uz: "GATda geografik ma’lumotlarni to‘plash va uni kiritish", ru: "Сбор и ввод географических данных в ГИС", en: "Collecting and Inputting Geographic Data in GIS" },
    description: { uz: "GATda geografik ma'lumotlarni to'plash va uni koordinatalar yoki import yo'li bilan kiritish." },
    dueDate: '2025-01-25',
    maxScore: 100,
    status: 'active'
  },
  {
    id: 'a18',
    subjectId: 'gis',
    topicId: 'gis-4',
    title: { uz: "Rastr hamda vektor ma’lumotlarini o‘rganish", ru: "Изучение растровых и векторных данных", en: "Studying Raster and Vector Data" },
    description: { uz: "Rastr hamda vektor ma'lumotlarining mohiyati, afzalliklari va cheklovlarini solishtirish." },
    dueDate: '2025-02-05',
    maxScore: 100,
    status: 'active'
  },
  {
    id: 'a19',
    subjectId: 'gis',
    topicId: 'gis-7',
    title: { uz: "Ma’lumotlar bazasi va ma’lumotlar bazasi so‘rovini o‘rganish", ru: "Изучение баз данных и запросов к базам данных", en: "Studying Databases and Database Queries" },
    description: { uz: "SQL yordamida atributli va fazoviy ma'lumotlar bazasida so'rovlar bajarish." },
    dueDate: '2025-02-12',
    maxScore: 100,
    status: 'active'
  },
  {
    id: 'a20',
    subjectId: 'gis',
    topicId: 'gis-9',
    title: { uz: "ArcGIS dasturining asosiy funksional imkoniyatlarini o‘rganish", ru: "Изучение основных функциональных возможностей программы ArcGIS", en: "Studying the Core Functional Capabilities of ArcGIS" },
    description: { uz: "ArcGIS platformasining ishlash prinsiplari, ma'lumotlarni boshqarish tizimlari bilan tanishish." },
    dueDate: '2025-02-20',
    maxScore: 100,
    status: 'active'
  },
  {
    id: 'a21',
    subjectId: 'gis',
    topicId: 'gis-9',
    title: { uz: "ArcGIS dasturining ArcMap ilovasining asosiy funksional imkoniyatlarini o‘rganish", ru: "Изучение основных возможностей приложения ArcMap программы ArcGIS", en: "Studying ArcMap Application in ArcGIS" },
    description: { uz: "ArcMap interfeysi, qatlamlar bilan ishlash va atribut jadvallarini boshqarish." },
    dueDate: '2025-02-28',
    maxScore: 100,
    status: 'active'
  },
  {
    id: 'a22',
    subjectId: 'gis',
    topicId: 'gis-12',
    title: { uz: "ArcGIS dasturida mavzuli xaritalarning komponovkasini ishlab chiqish", ru: "Разработка компоновки тематических карт в программе ArcGIS", en: "Designing Layouts for Thematic Maps in ArcGIS" },
    description: { uz: "Xarita sarlavhasi, afsona (legend), masshtab va boshqa elementlarni Layout view da to'g'ri joylashtirish." },
    dueDate: '2025-03-08',
    maxScore: 100,
    status: 'active'
  },
  {
    id: 'a23',
    subjectId: 'gis',
    topicId: 'gis-12',
    title: { uz: "ArcGIS dasturida geografik ma’lumotlar bilan ishlash", ru: "Работа с географическими данными в программе ArcGIS", en: "Working with Geographic Data in ArcGIS" },
    description: { uz: "ArcGIS da vektor va raster ma'lumotlarni tahlil qilish, tahrirlash va saqlash." },
    dueDate: '2025-03-15',
    maxScore: 100,
    status: 'active'
  },
  {
    id: 'a24',
    subjectId: 'gis',
    topicId: 'gis-12',
    title: { uz: "GAT dasturlari asosida O‘zbekiston Respublikasi aholi xaritasini yaratish", ru: "Создание карты населения Республики Узбекистан на основе ГИС-программ", en: "Creating Uzbekistan Population Map in GIS" },
    description: { uz: "Demografik ma'lumotlar asosida viloyatlar kesimida aholi zichligi xaritasini yaratish." },
    dueDate: '2025-03-22',
    maxScore: 100,
    status: 'active'
  },
  {
    id: 'a25',
    subjectId: 'gis',
    topicId: 'gis-12',
    title: { uz: "O‘zbekiston Milliy universiteti raqamli xaritasini yaratish", ru: "Создание цифровой карты Национального университета Узбекистана", en: "Creating National University of Uzbekistan Digital Map" },
    description: { uz: "Sun'iy yo'ldosh yoki dron surati asosida universitet hududi ob'ektlarini raqamlashtirish." },
    dueDate: '2025-04-01',
    maxScore: 100,
    status: 'active'
  },
  {
    id: 'a26',
    subjectId: 'gis',
    topicId: 'gis-13',
    title: { uz: "ArcGIS dasturida 3 o‘lchamli xaritalar yaratish", ru: "Создание трехмерных карт в программе ArcGIS", en: "Creating 3D Maps in ArcGIS" },
    description: { uz: "ArcScene yoki ArcGIS 3D Analyst yordamida relyef va binolarni 3D ko'rinishda vizuallashtirish." },
    dueDate: '2025-04-10',
    maxScore: 100,
    status: 'active'
  },
  {
    id: 'a27',
    subjectId: 'gis',
    topicId: 'gis-16',
    title: { uz: "GAT da animatsion xaritalarni tuzish", ru: "Составление анимационных карт в ГИС", en: "Compiling Animated Maps in GIS" },
    description: { uz: "Time Slider yordamida vaqt o'qi bo'yicha o'zgaruvchi jarayonlarni animatsiya ko'rinishida taqdim etish." },
    dueDate: '2025-04-20',
    maxScore: 100,
    status: 'active'
  },
  {
    id: 'a28',
    subjectId: 'gis',
    topicId: 'gis-16',
    title: { uz: "Mobil GAT ilovalari bilan ishlash", ru: "Работа с мобильными ГИС-приложениями", en: "Working with Mobile GIS Applications" },
    description: { uz: "QField yoki Survey123 kabi mobil ilovalar yordamida maydonda ma'lumot to'plash va sinxronizatsiya qilish." },
    dueDate: '2025-04-30',
    maxScore: 100,
    status: 'active'
  }
];

console.log("Assignments array prepared.");
fs.writeFileSync('/Users/libertywalk/gat/scratch/debug_assignments.json', JSON.stringify(ASSIGNMENTS, null, 2));
EOF
