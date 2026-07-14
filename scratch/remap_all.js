import fs from 'fs';
import { SUBJECTS as oldSUBJECTS, TOPICS as oldTOPICS, TESTS as oldTESTS, VIDEOS, MATERIALS, DEMO_USERS, LEADERBOARD, STATS } from '../src/data/mockData.js';

// Parse topics from doc JSON
const parsedTopics = JSON.parse(fs.readFileSync('/Users/libertywalk/gat/parsed_topics.json', 'utf-8'));
const topoParsed = parsedTopics.filter(t => t.num >= 1 && t.num <= 8);
const kartoParsed = parsedTopics.filter(t => t.num >= 9 && t.num <= 17);
const gisParsed = parsedTopics.filter(t => t.num >= 18 && t.num <= 36);

// Translate maps for additional languages
const topoTranslations = {
  1: { ru: "Цель и задачи курса. Форма и размеры Земли", en: "Course Goals. Shape and Size of Earth" },
  2: { ru: "Понятие о планах, картах и профилях. Масштабы планов и карт. Номенклатура топографических карт и планов", en: "Understanding Plans, Maps, and Profiles. Scale of Plans and Maps. Nomenclature of Topographic Maps and Plans" },
  3: { ru: "Системы координат и высот, применяемые в топографии", en: "Coordinate and Height Systems Used in Topography" },
  4: { ru: "Углы ориентирования", en: "Orientation Angles" },
  5: { ru: "Рельеф Земли и его изображение на планах и картах", en: "Earth Relief and its Representation on Plans and Maps" },
  6: { ru: "Изменение углов", en: "Angle Measurement" },
  7: { ru: "Теодолитная съёмка", en: "Theodolite Survey" },
  8: { ru: "Нивелирование", en: "Leveling" }
};

const kartoTranslations = {
  9: { ru: "Карта и другие картографические произведения", en: "Maps and Other Cartographic Works" },
  10: { ru: "Математическая основа карты", en: "Mathematical Basis of Maps" },
  11: { ru: "Выбор проекций", en: "Choosing Projections" },
  12: { ru: "Методы картографического изображения", en: "Methods of Cartographic Representation" },
  13: { ru: "Методы изображения рельефа", en: "Methods of Relief Representation" },
  14: { ru: "Картографическая генерализация", en: "Cartographic Generalization" },
  15: { ru: "Географические карты и атласы, их типы", en: "Geographic Maps and Atlases, and Their Types" },
  16: { ru: "Использование карт", en: "Map Use" },
  17: { ru: "Анализ и оценка географических карт и атласов", en: "Analysis and Evaluation of Geographic Maps and Atlases" }
};

const gisTranslations = {
  18: { ru: "Основы географических информационных систем", en: "Fundamentals of Geographic Information Systems" },
  19: { ru: "Области применения ГИС", en: "GIS Application Areas" },
  20: { ru: "Сбор и ввод данных для ГИС", en: "Data Collection and Input for GIS" },
  21: { ru: "Суть растра и вектора", en: "Raster and Vector Concepts" },
  22: { ru: "Получение геоданных из интернет-источников", en: "Getting Geodata from Internet Sources" },
  23: { ru: "Организация и обработка информации в ГИС", en: "Organizing and Processing Information in GIS" },
  24: { ru: "База геоданных", en: "Geodatabase" },
  25: { ru: "Понятие о базах данных", en: "Database Concepts" },
  26: { ru: "Анализ данных в ГИС (Геовизуализация)", en: "Data Analysis in GIS (Geovisualization)" },
  27: { ru: "Анализ данных в ГИС (Пространственное моделирование)", en: "Data Analysis in GIS (Spatial Modeling)" },
  28: { ru: "Понятие и методы геопространственного анализа", en: "Geospatial Analysis Concepts and Methods" },
  29: { ru: "Отображение данных исследований в ГИС", en: "Representing Research Data in GIS" },
  30: { ru: "Трехмерное изображение геопространственных данных в ГИС", en: "3D Representation of Geospatial Data in GIS" },
  31: { ru: "Проект умного города и его 3D-модель в ГИС", en: "Smart City Project and its 3D Model in GIS" },
  32: { ru: "Организация управления в ГИС", en: "Managing and Organizing GIS" },
  33: { ru: "Современное развитие географических информационных систем", en: "Modern Development of GIS" },
  34: { ru: "Общие сведения о дистанционном зондировании в географических исследованиях", en: "General Information about Remote Sensing in Geographic Research" },
  35: { ru: "Методы получения космических снимков в ГИС", en: "Methods of Obtaining Satellite Images in GIS" },
  36: { ru: "Обработка аэрокосмических снимков на основе ГИС-технологий", en: "Processing Aerospace Images Based on GIS Technologies" }
};

// Rebuild SUBJECTS
const SUBJECTS = oldSUBJECTS.map(s => {
  if (s.id === 'topografiya') s.topicsCount = 8;
  if (s.id === 'kartografiya') s.topicsCount = 9;
  if (s.id === 'gis') s.topicsCount = 19;
  return s;
});

// Rebuild TOPICS
const TOPICS = {
  topografiya: oldTOPICS.topografiya.map((t, idx) => {
    const docT = topoParsed[idx];
    t.title.uz = docT.title;
    t.title.ru = topoTranslations[docT.num].ru;
    t.title.en = topoTranslations[docT.num].en;
    // Keep content format but wrap first sentence of doc desc
    t.content.uz = `<h2>${docT.title}</h2><p>${docT.desc}</p>` + t.content.uz.replace(/<h2>.*?<\/h2>/, '');
    return t;
  }),
  kartografiya: oldTOPICS.kartografiya.map((t, idx) => {
    const docT = kartoParsed[idx];
    t.title.uz = docT.title;
    t.title.ru = kartoTranslations[docT.num].ru;
    t.title.en = kartoTranslations[docT.num].en;
    t.content.uz = `<h2>${docT.title}</h2><p>${docT.desc}</p>` + t.content.uz.replace(/<h2>.*?<\/h2>/, '');
    return t;
  }),
  gis: gisParsed.map((docT, idx) => {
    const oldTopic = oldTOPICS.gis[idx] || {};
    return {
      id: `gis-${idx + 1}`,
      subjectId: 'gis',
      order: idx + 1,
      title: {
        uz: docT.title,
        ru: gisTranslations[docT.num].ru,
        en: gisTranslations[docT.num].en
      },
      content: {
        uz: `<h2>${docT.title}</h2><p>${docT.desc}</p>`
      },
      videoUrl: oldTopic.videoUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      videoDuration: oldTopic.videoDuration || '45:00',
      hasTest: true,
      hasPractical: true,
      duration: oldTopic.duration || '45 daqiqa',
      difficulty: idx < 6 ? 'beginner' : idx < 12 ? 'intermediate' : 'advanced'
    };
  })
};

// Generate new GAT tests to fill the holes
const testGis6 = {
  "id": "test-gis-6",
  "topicId": "gis-6",
  "subjectId": "gis",
  "title": {
    "uz": "Geografik axborot tizimida axborotlarni tashkillashtirish va qayta ishlash bo'yicha test",
    "ru": "Тест по организации и обработке информации в ГИС",
    "en": "Test on Organizing and Processing Information in GIS"
  },
  "timeLimit": 15,
  "passingScore": 70,
  "questions": [
    {
      "id": "q1", "type": "single",
      "question": { "uz": "GATda raqamlashtirish (digitizing) nima?" },
      "options": { "uz": ["Kog'oz yoki raster xaritalarni vektor formatga o'tkazish", "Sun'iy yo'ldosh suratini olish", "GPS koordinatalarini o'lchash", "SQL so'rovini bajarish"] },
      "correctAnswers": [0],
      "explanation": { "uz": "Raqamlashtirish (digitizing) - bu analog (skanerlangan raster, qog'oz) xaritalarni kompyuterda nuqta, chiziq va poligon ko'rinishida vektorlashtirish jarayonidir." }
    },
    {
      "id": "q2", "type": "single",
      "question": { "uz": "Topologik qoidalar GATda nima uchun qo'llaniladi?" },
      "options": { "uz": ["Vektor ob'ektlar o'rtasidagi fazoviy munosabatlar va chegaralarni tekshirish", "Raster tasvirlarni siqish", "Sun'iy yo'ldosh kanallarini birlashtirish", "Xarita masshtabini o'zgartirish"] },
      "correctAnswers": [0],
      "explanation": { "uz": "Topologik qoidalar vektor qatlamlaridagi ob'ektlarning o'zaro fazoviy munosabatlarini tekshirish va to'g'rilash uchun ishlatiladi." }
    },
    {
      "id": "q3", "type": "single",
      "question": { "uz": "Overlap topologik xatosi nima?" },
      "options": { "uz": ["Ikki qo'shni poligon chegarasining bir-biri ustiga chiqib qolishi", "Chegaralar orasida bo'shliq qolishi", "Chiziq uchining tutashmay qolishi", "Koordinatalar tizimi mos kelmasligi"] },
      "correctAnswers": [0],
      "explanation": { "uz": "Overlap (ustma-ust tushish) xatosi qo'shni poligonlar (masalan, yer uchastkalari) chegaralari noto'g'ri chizilib, bir-birining maydonini bosib qolganda yuzaga keladi." }
    },
    {
      "id": "q4", "type": "single",
      "question": { "uz": "Gap (Bo'shliq) topologik xatosi nima?" },
      "options": { "uz": ["Qo'shni poligonlar chegaralari orasida keraksiz bo'sh joylar qolib ketishi", "Poligon ichida teshik bo'lishi", "Chiziqning uzilib qolishi", "Atribut jadvalining bo'sh qolishi"] },
      "correctAnswers": [0],
      "explanation": { "uz": "Gap (bo'shliq) xatosi qo'shni poligonlar chegaralari jipslashmay, ular orasida mikroskopik yoki ko'rinadigan bo'shliqlar qolib ketganda yuzaga keladi." }
    },
    {
      "id": "q5", "type": "single",
      "question": { "uz": "Dangle (Osilgan chiziq) xatosi nima?" },
      "options": { "uz": ["Chiziqning boshqa chiziq bilan tutashmay ochiq qolib ketgan uchi", "Poligonning yopilmasligi", "Nuqtalarning tarqalib ketishi", "Raster piksellarning buzilishi"] },
      "correctAnswers": [0],
      "explanation": { "uz": "Dangle - bu chiziqli ob'ektlar (masalan, yo'llar yoki gidrografiya) tugunlarining boshqa chiziqlar bilan tutashmay, ochiq va osilib qolishi xatosidir." }
    },
    {
      "id": "q6", "type": "single",
      "question": { "uz": "Vektorizatsiya (vectorization) nima?" },
      "options": { "uz": ["Raster tasvirlarni vektor shakliga o'tkazish jarayoni", "Vektor qatlamni rasterga o'tkazish", "GPS ma'lumotlarini qayta ishlash", "Xaritani chop etishga tayyorlash"] },
      "correctAnswers": [0],
      "explanation": { "uz": "Vektorizatsiya - bu raster tasvir elementlarini (piksellar to'plamini) avtomatik yoki yarim avtomatik ravishda vektor ob'ektlarga (nuqta, chiziq, poligon) aylantirish jarayonidir." }
    },
    {
      "id": "q7", "type": "single",
      "question": { "uz": "GATda ma'lumotlarni tahrirlashda Snapping (yopishish) funksiyasi nima uchun kerak?" },
      "options": { "uz": ["Yangi chizilayotgan nuqtalarni mavjud ob'ektlar uchiga avtomatik jipslashtirish", "Xarita rangini o'zgartirish", "SQL so'rovlarini tezlashtirish", "Raster o'lchamini kamaytirish"] },
      "correctAnswers": [0],
      "explanation": { "uz": "Snapping (yopishish) funksiyasi yangi ob'ektlarni chizishda ularning uchlarini yoki chegaralarini mavjud ob'ektlar tugunlariga aniq birlashtirib, topologik xatolarni oldini oladi." }
    },
    {
      "id": "q8", "type": "single",
      "question": { "uz": "Qaysi format GATda vektor ma'lumotlarini saqlash uchun ishlatiladi?" },
      "options": { "uz": ["Shapefile", "GeoTIFF", "JPEG", "BMP"] },
      "correctAnswers": [0],
      "explanation": { "uz": "Shapefile, GeoJSON va KML vektor formatlar hisoblanadi. GeoTIFF esa raster formatdir." }
    },
    {
      "id": "q9", "type": "single",
      "question": { "uz": "Atribut ma'lumoti nima?" },
      "options": { "uz": ["Fazoviy ob'ektlarning geografik bo'lmagan xususiyatlari (jadvaldagi ma'lumotlar)", "Ob'ektning koordinatalari", "Sun'iy yo'ldosh kamerasi turi", "Dastur sozlamalari"] },
      "correctAnswers": [0],
      "explanation": { "uz": "Atribut ma'lumotlari - bu geografik ob'ektlarga biriktirilgan jadval ko'rinishidagi ma'lumotlar (masalan, yo'lning nomi, kengligi, qoplamasi)." }
    },
    {
      "id": "q10", "type": "single",
      "question": { "uz": "Avtomatik vektorizatsiya qanday hollarda samarasiz bo'ladi?" },
      "options": { "uz": ["Raster tasvir sifati juda past yoki fon juda murakkab bo'lganda", "Tasvir yuqori aniqlikda bo'lganda", "Faqat bitta rang ishlatilganda", "Kompyuter tezligi juda yuqori bo'lganda"] },
      "correctAnswers": [0],
      "explanation": { "uz": "Raster tasvir sifati past yoki shovqinlar ko'p bo'lsa, avtomatik vektorizatsiya ko'plab xatolarni keltirib chiqaradi, bunday holda qo'lda raqamlashtirish afzal." }
    }
  ]
};

const testGis13 = {
  "id": "test-gis-13",
  "topicId": "gis-13",
  "subjectId": "gis",
  "title": {
    "uz": "GATda geofazoviy ma'lumotlarning uch o'lchovli tasviri bo'yicha test",
    "ru": "Тест по трехмерному изображению геопространственных данных в ГИС",
    "en": "Test on 3D Representation of Geospatial Data in GIS"
  },
  "timeLimit": 15,
  "passingScore": 70,
  "questions": [
    {
      "id": "q1", "type": "single",
      "question": { "uz": "DEM (Digital Elevation Model) nima?" },
      "options": { "uz": ["Raqamli balandlik modeli - faqat yer yuzasi balandliklarini ifodalovchi raster grid", "Binolar 3D modeli", "Daraxtlar balandligi xaritasi", "Vektorli relyef qatlami"] },
      "correctAnswers": [0],
      "explanation": { "uz": "DEM - bu yer yuzasi balandliklarini piksellar to'ri orqali uzluksiz ifodalovchi raqamli balandlik modelidir." }
    },
    {
      "id": "q2", "type": "single",
      "question": { "uz": "DSM (Digital Surface Model) va DTM (Digital Terrain Model) o'rtasidagi farq nima?" },
      "options": { "uz": ["DSM binolar va daraxtlarni o'z ichiga oladi, DTM esa faqat yer sathini ko'rsatadi", "DSM faqat suv sathini ko'rsatadi", "DTM yuqori aniqlikka ega", "Ular mutlaqo bir xil narsa"] },
      "correctAnswers": [0],
      "explanation": { "uz": "DSM (Digital Surface Model) yer yuzasidagi barcha sun'iy va tabiiy ob'ektlarni (binolar, daraxtlar) o'z ichiga oladi, DTM (Digital Terrain Model) esa ularni olib tashlab, faqat 'yalang'och' yer sathini ko'rsatadi." }
    },
    {
      "id": "q3", "type": "single",
      "question": { "uz": "LOD (Level of Detail) GATda 3D modellashtirishda nimani anglatadi?" },
      "options": { "uz": ["3D ob'ektlarning batafsillik va aniqlik darajasi (LOD 0 dan LOD 4 gacha)", "Dastur yuklanish tezligi", "Ma'lumotlar bazasi hajmi", "Lazer nuri kuchi"] },
      "correctAnswers": [0],
      "explanation": { "uz": "LOD (Batafsillik darajasi) - 3D shahar modellarida ob'ektlarning qanchalik batafsil (LOD0 - tekis, LOD4 - ichki arxitekturasi bilan) chizilganligini bildiradi." }
    },
    {
      "id": "q4", "type": "single",
      "question": { "uz": "3D geofazoviy ma'lumotlarni yaratishda qaysi texnologiya eng yuqori aniqlik beradi?" },
      "options": { "uz": ["LiDAR (Lazer skanerlash)", "Kosmik optik suratlar", "GPS treklari", "Qog'oz xaritalarni skanerlash"] },
      "correctAnswers": [0],
      "explanation": { "uz": "LiDAR (Light Detection and Ranging) lazer impulslari orqali yer yuzasining yuqori aniqlikdagi 3D nuqtalar bulutini yaratadi." }
    },
    {
      "id": "q5", "type": "single",
      "question": { "uz": "Tin (Triangulated Irregular Network) nima?" },
      "options": { "uz": ["Uchburchakli tartibsiz to'r - relyefni vektorli ifodalash usuli", "Sun'iy yo'ldosh tarmog'i", "Dasturlar integratsiyasi", "3D koordinatalar tizimi"] },
      "correctAnswers": [0],
      "explanation": { "uz": "TIN - relyef sirtini tutashgan uchburchaklar to'plami yordamida vektor formatda ifodalash usulidir." }
    },
    {
      "id": "q6", "type": "single",
      "question": { "uz": "Qaysi format 3D shahar modellarini saqlash uchun OGC standarti hisoblanadi?" },
      "options": { "uz": ["CityGML", "Shapefile", "JPEG", "MP4"] },
      "correctAnswers": [0],
      "explanation": { "uz": "CityGML (City Geography Markup Language) - 3D shahar va hudud modellarini saqlash va almashish uchun xalqaro OGC standartidir." }
    },
    {
      "id": "q7", "type": "single",
      "question": { "uz": "3D vizualizatsiya nima uchun kerak?" },
      "options": { "uz": ["Fazoviy munosabatlarni real uch o'lchamli ko'rinishda tahlil qilish va namoyish etish", "Faqat chiroyli rasm olish uchun", "Ma'lumotlarni siqish uchun", "Ma'lumotlar bazasini himoyalash uchun"] },
      "correctAnswers": [0],
      "explanation": { "uz": "3D vizualizatsiya relyef, binolar, havo yo'llari va yerosti kommunikatsiyalarini uchinchi o'q (Z) bo'yicha tahlil qilish va tushunishni osonlashtiradi." }
    },
    {
      "id": "q8", "type": "single",
      "question": { "uz": "Extrusion (cho'zish) GATda nima?" },
      "options": { "uz": ["2D vektor ob'ektga balandlik atributi bo'yicha 3D hajm berish jarayoni", "Xaritaning masshtabini kattalashtirish", "Raster piksellarni o'chirish", "SQL so'rovini yozish"] },
      "correctAnswers": [0],
      "explanation": { "uz": "Extrusion - 2D poligonlarga (masalan, bino konturlariga) atribut jadvalidagi balandlik qiymatiga ko'ra balandlik berib, ularni 3D binoga aylantirishdir." }
    },
    {
      "id": "q9", "type": "single",
      "question": { "uz": "BIM (Building Information Modeling) nima?" },
      "options": { "uz": ["Binoning batafsil raqamli modeli - muhandislik va arxitektura ma'lumotlari tizimi", "Xarita loyihalash dasturi", "Global sun'iy yo'ldosh tizimi", "Lazer o'lchov asbobi"] },
      "correctAnswers": [0],
      "explanation": { "uz": "BIM - binoning barcha muhandislik, material va arxitektura ma'lumotlarini o'z ichiga olgan batafsil 3D modeli bo'lib, keyinchalik GISga integratsiya qilinadi." }
    },
    {
      "id": "q10", "type": "single",
      "question": { "uz": "Qaysi dastur 3D GIS bilan ishlash uchun ishlatiladi?" },
      "options": { "uz": ["ArcGIS Pro (ArcScene / ArcGlobe)", "Microsoft Excel", "Photoshop", "Notepad++"] },
      "correctAnswers": [0],
      "explanation": { "uz": "ArcGIS Pro, ArcScene, ArcGlobe hamda CesiumJS, QGIS (3D view) tizimlari 3D geofazoviy tahlil va vizualizatsiya uchun ishlatiladi." }
    }
  ]
};

const testGis15 = {
  "id": "test-gis-15",
  "topicId": "gis-15",
  "subjectId": "gis",
  "title": {
    "uz": "Geografik axborot tizimida boshqaruvni tashkillashtirish bo'yicha test",
    "ru": "Тест по организации управления в ГИС",
    "en": "Test on Managing and Organizing GIS"
  },
  "timeLimit": 15,
  "passingScore": 70,
  "questions": [
    {
      "id": "q1", "type": "single",
      "question": { "uz": "GAT loyihalarini boshqarishda birinchi navbatda nima aniqlanadi?" },
      "options": { "uz": ["Loyiha maqsadi va foydalanuvchilar ehtiyojlari", "Dasturiy ta'minot narxi", "Kompyuter protsessori tezligi", "GPS markasi"] },
      "correctAnswers": [0],
      "explanation": { "uz": "GAT tizimini yaratish loyihasining muvaffaqiyati birinchi navbatda foydalanuvchilar talablarini va loyiha maqsadini aniq belgilashga bog'liq." }
    },
    {
      "id": "q2", "type": "single",
      "question": { "uz": "GATda apparat ta'minot (Hardware) tarkibiga nima kiradi?" },
      "options": { "uz": ["Kompyuter, server, GPS qabul qiluvchi, skaner va plotter", "Dasturlar va operatsion tizimlar", "Ma'lumotlar bazasi jadvallari", "Tahlil usullari"] },
      "correctAnswers": [0],
      "explanation": { "uz": "Apparat ta'minoti - bu GAT ishlashi uchun zarur bo'lgan barcha jismoniy qurilmalar va kompyuter texnikasidir." }
    },
    {
      "id": "q3", "type": "single",
      "question": { "uz": "Ekspert tizimlar GATda qanday vazifani bajaradi?" },
      "options": { "uz": ["Bilimlar bazasi va mantiqiy xulosalar asosida murakkab fazoviy qarorlar qabul qilishga yordam beradi", "Faqat xaritalarni chop etadi", "GPS signallarini tahrirlaydi", "Atribut jadvallarini o'chiradi"] },
      "correctAnswers": [0],
      "explanation": { "uz": "Ekspert tizimlari sun'iy intellekt elementlarini qo'llab, mutaxassislar tajribasi va bilimlariga tayanib murakkab geologik, ekologik yoki rejalashtirish qarorlarini qabul qilishda yordam beradi." }
    },
    {
      "id": "q4", "type": "single",
      "question": { "uz": "Qaysi dasturiy ta'minot litsenziyali korporativ GAT hisoblanadi?" },
      "options": { "uz": ["ArcGIS (Esri)", "QGIS", "GRASS GIS", "SAGA GIS"] },
      "correctAnswers": [0],
      "explanation": { "uz": "ArcGIS - bu litsenziya talab qiladigan eng mashhur tijorat GAT tizimidir. QGIS, GRASS va SAGA esa bepul va ochiq kodli dasturlardir." }
    },
    {
      "id": "q5", "type": "single",
      "question": { "uz": "GAT tizimini o'rnatishga bo'lgan talablarga nimalar kiradi?" },
      "options": { "uz": ["Operatsion tizim, tezkor xotira (RAM), disk maydoni va videokarta ko'rsatkichlari", "Faqat internet tezligi", "Faqat GPS qurilmasi", "Faqat monitor o'lchami"] },
      "correctAnswers": [0],
      "explanation": { "uz": "Tizim talablari GAT dasturi barqaror ishlashi uchun kompyuterning operativ xotirasi, video xotirasi, disk hajmi va protsessor quvvatini belgilaydi." }
    },
    {
      "id": "q6", "type": "single",
      "question": { "uz": "GATda ma'lumotlar xavfsizligini ta'minlash uchun nima qilinadi?" },
      "options": { "uz": ["Foydalanish huquqlarini cheklash va zaxira nusxalarini (backup) yaratish", "Dasturlarni tez-tez o'chirib yoqish", "Faqat oflayn ishlash", "Kompyuterni internetdan uzib qo'yish"] },
      "correctAnswers": [0],
      "explanation": { "uz": "Ma'lumotlar xavfsizligi foydalanuvchilarning huquqlarini boshqarish (rol tizimi) va kutilmagan yo'qotishlarning oldini olish uchun zaxira nusxalarini saqlash orqali amalga oshiriladi." }
    },
    {
      "id": "q7", "type": "single",
      "question": { "uz": "Plotter qurilmasi nima uchun ishlatiladi?" },
      "options": { "uz": ["Katta formatdagi xarita va chizmalarni yuqori sifatda chop etish uchun", "Xaritalarni skanerlash uchun", "Koordinatalarni o'lchash uchun", "3D modellar yaratish uchun"] },
      "correctAnswers": [0],
      "explanation": { "uz": "Plotter (grafik chizgich) - katta o'lchamdagi (A0, A1 va h.k.) topografik va geografik xaritalarni qog'ozga yuqori aniqlikda chiqarish uchun mo'ljallangan qurilmadir." }
    },
    {
      "id": "q8", "type": "single",
      "question": { "uz": "Enterprise GIS (Korporativ GAT) nima?" },
      "options": { "uz": ["Butun tashkilot miqyosida ko'plab foydalanuvchilar uchun ma'lumotlarni markaziy serverda birlashtirgan tizim", "Faqat bitta kompyuterda ishlaydigan dastur", "GPS qurilmalarining to'plami", "Onlayn o'yin xaritasi"] },
      "correctAnswers": [0],
      "explanation": { "uz": "Enterprise GIS - yirik tashkilotlar uchun mo'ljallangan bo'lib, ko'plab bo'limlarning geoma'lumotlarini yagona serverda birlashtiradi va markazlashgan tahlillarni amalga oshiradi." }
    },
    {
      "id": "q9", "type": "single",
      "question": { "uz": "GAT dasturiy ta'minotini tanlashda qaysi omil eng kam ahamiyatga ega?" },
      "options": { "uz": ["Foydalanuvchining shaxsiy kompyuteri rangi", "Litsenziya narxi", "Dasturning funksional imkoniyatlari", "Texnik yordam va hamjamiyat va do'stona munosabatlar"] },
      "correctAnswers": [0],
      "explanation": { "uz": "Litsenziya narxi, funksionalligi va hamjamiyat yordami dastur tanlashda buyuk mezonlardir, kompyuterning rangi esa mutlaqo aloqasiz." }
    },
    {
      "id": "q10", "type": "single",
      "question": { "uz": "GATda bulutli texnologiyalar (Cloud GIS) ning afzalligi nima?" },
      "options": { "uz": ["Ma'lumotlarni internet orqali istalgan joydan ochish va yuqori quvvatli serverlarda tahlil qilish", "Hech qanday internet talab qilmasligi", "Mutlaqo bepul bo'lishi", "Apparat ta'minoti talab etilmasligi"] },
      "correctAnswers": [0],
      "explanation": { "uz": "Cloud GIS (masalan, ArcGIS Online, Google Earth Engine) bulutli serverlar yordamida foydalanuvchilarga ma'lumotlarni saqlash va murakkab hisob-kitoblarni internet orqali bajarish imkonini beradi." }
    }
  ]
};

// Remap all tests
const TESTS = {};
// Copy topografiya and kartografiya tests
for (let i = 1; i <= 8; i++) {
  TESTS[`topo-${i}`] = oldTESTS[`topo-${i}`];
}
for (let i = 1; i <= 9; i++) {
  TESTS[`karto-${i}`] = oldTESTS[`karto-${i}`];
}

// Remap old GAT tests to new GAT topic IDs
const oldGisKeys = {
  'gis-1': 'gis-1',
  'gis-2': 'gis-2',
  'gis-3': 'gis-3',
  'gis-4': 'gis-4',
  'gis-5': 'gis-5',
  'gis-6': 'gis-7',   // SQL -> Geoma'lumotlar bazasi
  'gis-7': 'gis-8',   // MBBT -> Ma'lumotlar bazasi haqida tushuncha
  'gis-8': 'gis-9',   // Geovizualizatsiya -> tahlil qilish (26)
  'gis-9': 'gis-10',  // Interpolation -> tahlil qilish (27)
  'gis-10': 'gis-11', // Buffer/Overlay -> Geofazoviy tahlil
  'gis-11': 'gis-12', // Layout -> tadqiqotlarda aks ettirish
  'gis-12': 'gis-14', // 3D -> aqlli shahar
  'gis-13': 'gis-17', // NDVI -> masofadan zondlash
  'gis-14': 'gis-18', // Satellite -> kosmik suratlarni olish
  'gis-15': 'gis-19', // Aerospace -> aerokosmik suratlarni qayta ishlash
  'gis-16': 'gis-16', // WebGIS -> zamonaviy rivojlanishi
};

// Map existing ones
for (const [oldKey, newKey] of Object.entries(oldGisKeys)) {
  if (oldTESTS[oldKey]) {
    const testCopy = JSON.parse(JSON.stringify(oldTESTS[oldKey]));
    testCopy.topicId = newKey;
    testCopy.id = `test-${newKey}`;
    // Let's update titles for renamed topics
    if (newKey === 'gis-6') {
      testCopy.title.uz = "Geografik axborot tizimida axborotlarni tashkillashtirish va qayta ishlash bo'yicha test";
    } else if (newKey === 'gis-7') {
      testCopy.title.uz = "Geoma'lumotlar bazasi bo'yicha test";
    } else if (newKey === 'gis-8') {
      testCopy.title.uz = "Ma'lumotlar bazasi haqida tushuncha bo'yicha test";
    } else if (newKey === 'gis-9') {
      testCopy.title.uz = "Geografik axborot tizimida ma'lumotlarni tahlil qilish bo'yicha test";
    } else if (newKey === 'gis-10') {
      testCopy.title.uz = "Geografik axborot tizimida ma'lumotlarni tahlil qilish bo'yicha test";
    } else if (newKey === 'gis-11') {
      testCopy.title.uz = "Geofazoviy tahlil tushunchasi va usullari bo'yicha test";
    } else if (newKey === 'gis-12') {
      testCopy.title.uz = "Geografik tadqiqotlarda olingan ma'lumotlarni GAT da aks ettirish bo'yicha test";
    } else if (newKey === 'gis-14') {
      testCopy.title.uz = "GATda aqlli shahar loyihasi va uning uch o'lchovli modeli bo'yicha test";
    } else if (newKey === 'gis-16') {
      testCopy.title.uz = "Geografik axborot tizimining zamonaviy rivojlanishi bo'yicha test";
    } else if (newKey === 'gis-17') {
      testCopy.title.uz = "Geografik tadqiqotlarda masofadan zondlash haqida umumiy ma'lumotlar bo'yicha test";
    } else if (newKey === 'gis-18') {
      testCopy.title.uz = "GATda kosmik suratlarni olish usullari bo'yicha test";
    } else if (newKey === 'gis-19') {
      testCopy.title.uz = "GAT texnologiyalari asosida aerokosmik suratlarni qayta ishlash bo'yicha test";
    }
    TESTS[newKey] = testCopy;
  }
}

// Set new ones
TESTS['gis-6'] = testGis6;
TESTS['gis-13'] = testGis13;
TESTS['gis-15'] = testGis15;

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

console.log("TESTS generated. Total keys:", Object.keys(TESTS).length);

// Reassemble new mockData.js file content
const output = `// Auto-generated curriculum data aligned with topografiya_kartografiya_GAT.doc
export const SUBJECTS = ${JSON.stringify(SUBJECTS, null, 2)};

export const TOPICS = ${JSON.stringify(TOPICS, null, 2)};

export const TESTS = ${JSON.stringify(TESTS, null, 2)};

export const VIDEOS = ${JSON.stringify(VIDEOS, null, 2)};

export const MATERIALS = ${JSON.stringify(MATERIALS, null, 2)};

export const ASSIGNMENTS = ${JSON.stringify(ASSIGNMENTS, null, 2)};

export const DEMO_USERS = ${JSON.stringify(DEMO_USERS, null, 2)};

export const LEADERBOARD = ${JSON.stringify(LEADERBOARD, null, 2)};

export const STATS = ${JSON.stringify(STATS, null, 2)};
`;

fs.writeFileSync('/Users/libertywalk/gat/src/data/mockData.js', output, 'utf-8');
console.log('Successfully updated src/data/mockData.js!');
