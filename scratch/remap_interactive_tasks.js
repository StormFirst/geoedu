import fs from 'fs';

let content = fs.readFileSync('/Users/libertywalk/gat/src/pages/Subjects/components/InteractivePracticalTask.jsx', 'utf-8');

// 1. Rename checkGis functions with placeholder to prevent clashes
content = content.replace(/const checkGis13 =/g, 'const checkGisTMP17 =');
content = content.replace(/const checkGis12 =/g, 'const checkGisTMP14 =');
content = content.replace(/const checkGis11 =/g, 'const checkGisTMP12 =');
content = content.replace(/const checkGis7 =/g, 'const checkGisTMP8 =');
content = content.replace(/const checkGis6 =/g, 'const checkGisTMP7 =');

// 2. Rename function calls to checkGis
content = content.replace(/checkGis13\(\)/g, 'checkGisTMP17()');
content = content.replace(/checkGis12\(\)/g, 'checkGisTMP14()');
content = content.replace(/checkGis11\(\)/g, 'checkGisTMP12()');
content = content.replace(/checkGis7\(\)/g, 'checkGisTMP8()');
content = content.replace(/checkGis6\(/g, 'checkGisTMP7(');

content = content.replace(/onClick=\{checkGis13\}/g, 'onClick={checkGisTMP17}');
content = content.replace(/onClick=\{checkGis12\}/g, 'onClick={checkGisTMP14}');
content = content.replace(/onClick=\{checkGis11\}/g, 'onClick={checkGisTMP12}');
content = content.replace(/onClick=\{checkGis7\}/g, 'onClick={checkGisTMP8}');

// Rename topic ID strings checks in JSX/effect (using placeholders)
const topicRemap = [
  { old: 'gis-15', tmp: 'gis-TMP6' },   // was topologik, now gis-6
  { old: 'gis-14', tmp: 'gis-TMP18' },  // was bands, now gis-18
  { old: 'gis-13', tmp: 'gis-TMP17' },  // was ndvi, now gis-17
  { old: 'gis-12', tmp: 'gis-TMP14' },  // was 3d sandbox, now gis-14
  { old: 'gis-11', tmp: 'gis-TMP12' },  // was layout, now gis-12
  { old: 'gis-10', tmp: 'gis-TMP11' },  // was buffer, now gis-11
  { old: 'gis-9',  tmp: 'gis-TMP10' },  // was interpolation, now gis-10
  { old: 'gis-8',  tmp: 'gis-TMP9' },   // was symbology, now gis-9
  { old: 'gis-7',  tmp: 'gis-TMP8' },   // was primary key, now gis-8
  { old: 'gis-6',  tmp: 'gis-TMP7' }    // was SQL within, now gis-7
];

for (const tr of topicRemap) {
  const re1 = new RegExp(`'${tr.old}'`, 'g');
  content = content.replace(re1, `'${tr.tmp}'`);
  const re2 = new RegExp(`"${tr.old}"`, 'g');
  content = content.replace(re2, `"${tr.tmp}"`);
}

// Rename translation key usages using placeholders to avoid overlapping replacements
const keyRemap = [
  { old: 'gis15_', tmp: 'gisTMP6_' },
  { old: 'gis14_', tmp: 'gisTMP18_' },
  { old: 'gis13_', tmp: 'gisTMP17_' },
  { old: 'gis12_', tmp: 'gisTMP14_' },
  { old: 'gis11_', tmp: 'gisTMP12_' },
  { old: 'gis10_', tmp: 'gisTMP11_' },
  { old: 'gis9_',  tmp: 'gisTMP10_' },
  { old: 'gis8_',  tmp: 'gisTMP9_' },
  { old: 'gis7_',  tmp: 'gisTMP8_' },
  { old: 'gis6_',  tmp: 'gisTMP7_' }
];

for (const kr of keyRemap) {
  const re = new RegExp(`tStr\\.${kr.old}`, 'g');
  content = content.replace(re, `tStr.${kr.tmp}`);
  const re2 = new RegExp(`\\b${kr.old}`, 'g');
  content = content.replace(re2, kr.tmp);
}

// Translate references to check functions from placeholders to final names
content = content.replace(/checkGisTMP17/g, 'checkGis17');
content = content.replace(/checkGisTMP14/g, 'checkGis14');
content = content.replace(/checkGisTMP12/g, 'checkGis12');
content = content.replace(/checkGisTMP8/g, 'checkGis8');
content = content.replace(/checkGisTMP7/g, 'checkGis7');

// Translate topic IDs from placeholders to final names
for (const tr of topicRemap) {
  const finalId = tr.tmp.replace('TMP', '');
  const re1 = new RegExp(`'${tr.tmp}'`, 'g');
  content = content.replace(re1, `'${finalId}'`);
  const re2 = new RegExp(`"${tr.tmp}"`, 'g');
  content = content.replace(re2, `"${finalId}"`);
}

// Translate translation keys from placeholders to final names
for (const kr of keyRemap) {
  const finalKey = kr.tmp.replace('TMP', '');
  const re1 = new RegExp(`tStr\\.${kr.tmp}`, 'g');
  content = content.replace(re1, `tStr.${finalKey}`);
  const re2 = new RegExp(`\\b${kr.tmp}`, 'g');
  content = content.replace(re2, finalKey);
}

// Replace isMatchingTask list
content = content.replace(
  "const isMatchingTask = ['karto-1', 'karto-2', 'karto-4', 'gis-2', 'gis-8', 'gis-9', 'gis-14', 'gis-15'].includes(topicId)",
  "const isMatchingTask = ['karto-1', 'karto-2', 'karto-4', 'gis-2', 'gis-6', 'gis-9', 'gis-10', 'gis-13', 'gis-15', 'gis-16', 'gis-18', 'gis-19'].includes(topicId)"
);

// Update termsSource setup in useEffect
content = content.replace(
  `    if (topicId === 'karto-1') termsSource = tStr.karto1_terms
    if (topicId === 'karto-2') termsSource = tStr.karto2_terms
    if (topicId === 'karto-4') termsSource = tStr.karto4_terms
    if (topicId === 'gis-2') termsSource = tStr.gis2_terms
    if (topicId === 'gis-8') termsSource = tStr.gis8_terms
    if (topicId === 'gis-9') termsSource = tStr.gis9_terms
    if (topicId === 'gis-14') termsSource = tStr.gis14_terms
    if (topicId === 'gis-15') termsSource = tStr.gis15_terms`,
  `    if (topicId === 'karto-1') termsSource = tStr.karto1_terms
    if (topicId === 'karto-2') termsSource = tStr.karto2_terms
    if (topicId === 'karto-4') termsSource = tStr.karto4_terms
    if (topicId === 'gis-2') termsSource = tStr.gis2_terms
    if (topicId === 'gis-6') termsSource = tStr.gis6_terms
    if (topicId === 'gis-9') termsSource = tStr.gis9_terms
    if (topicId === 'gis-10') termsSource = tStr.gis10_terms
    if (topicId === 'gis-13') termsSource = tStr.gis13_terms
    if (topicId === 'gis-15') termsSource = tStr.gis15_terms
    if (topicId === 'gis-16') termsSource = tStr.gis16_terms
    if (topicId === 'gis-18') termsSource = tStr.gis18_terms
    if (topicId === 'gis-19') termsSource = tStr.gis19_terms`
);

content = content.replace(
  `    if (topicId === 'karto-1') {
      sourceTerms = tStr.karto1_terms
    } else if (topicId === 'karto-2') {
      sourceTerms = tStr.karto2_terms
    } else if (topicId === 'karto-4') {
      sourceTerms = tStr.karto4_terms
    } else if (topicId === 'gis-2') {
      sourceTerms = tStr.gis2_terms
    } else if (topicId === 'gis-8') {
      sourceTerms = tStr.gis8_terms
    } else if (topicId === 'gis-9') {
      sourceTerms = tStr.gis9_terms
    } else if (topicId === 'gis-14') {
      sourceTerms = tStr.gis14_terms
    } else if (topicId === 'gis-15') {
      sourceTerms = tStr.gis15_terms`,
  `    if (topicId === 'karto-1') {
      sourceTerms = tStr.karto1_terms
    } else if (topicId === 'karto-2') {
      sourceTerms = tStr.karto2_terms
    } else if (topicId === 'karto-4') {
      sourceTerms = tStr.karto4_terms
    } else if (topicId === 'gis-2') {
      sourceTerms = tStr.gis2_terms
    } else if (topicId === 'gis-6') {
      sourceTerms = tStr.gis6_terms
    } else if (topicId === 'gis-9') {
      sourceTerms = tStr.gis9_terms
    } else if (topicId === 'gis-10') {
      sourceTerms = tStr.gis10_terms
    } else if (topicId === 'gis-13') {
      sourceTerms = tStr.gis13_terms
    } else if (topicId === 'gis-15') {
      sourceTerms = tStr.gis15_terms
    } else if (topicId === 'gis-16') {
      sourceTerms = tStr.gis16_terms
    } else if (topicId === 'gis-18') {
      sourceTerms = tStr.gis18_terms
    } else if (topicId === 'gis-19') {
      sourceTerms = tStr.gis19_terms`
);

// Add the other banner/description keys in translation strings and components checks:
content = content.replace(
  "              {topicId === 'gis-14' && tStr.gis14_title}\n              {topicId === 'gis-15' && tStr.gis15_title}",
  "              {topicId === 'gis-14' && tStr.gis14_title}\n              {topicId === 'gis-15' && tStr.gis15_title}\n              {topicId === 'gis-16' && tStr.gis16_title}\n              {topicId === 'gis-17' && tStr.gis17_title}\n              {topicId === 'gis-18' && tStr.gis18_title}\n              {topicId === 'gis-19' && tStr.gis19_title}"
);
content = content.replace(
  "              {topicId === 'gis-14' && tStr.gis14_desc}\n              {topicId === 'gis-15' && tStr.gis15_desc}",
  "              {topicId === 'gis-14' && tStr.gis14_desc}\n              {topicId === 'gis-15' && tStr.gis15_desc}\n              {topicId === 'gis-16' && tStr.gis16_desc}\n              {topicId === 'gis-17' && tStr.gis17_desc}\n              {topicId === 'gis-18' && tStr.gis18_desc}\n              {topicId === 'gis-19' && tStr.gis19_desc}"
);

// 3. Add translation blocks:
const newUzTranslations = `      // gis-13
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
      gis16_desc: "Zamonaviy GIS texnologiyalarining yo'nalishlarini moslashtiring.",
      gis16_terms: {
        "WebGIS": "Brauzer orqali xaritalarni onlayn tarqatish va tahlil qilish tizimi",
        "MobileGIS": "Maydonda oflayn geoma'lumot to'plash uchun mobil ilovalar (masalan, QField)",
        "Bulutli GAT": "Ma'lumotlarni internetdagi serverlarda saqlash va tahlil qilish texnologiyasi"
      },

      // gis-19
      gis19_title: "Aerokosmik suratlarni qayta ishlash",
      gis19_desc: "Aerokosmik suratlarni qayta ishlash va tahlil qilish atamalarini bog'lang.",
      gis19_terms: {
        "Ortorektifikatsiya": "Aerokosmik suratdagi relyef va kamera og'ishi xatolarini to'g'rilash",
        "Nazoratli klassifikatsiya": "Namunaviy piksellar yordamida tasvirni sinflarga ajratish",
        "Confusion Matrix": "Klassifikatsiya aniqligi va xatoliklarini baholash jadvali"
      },`;

const newRuTranslations = `      // gis-13
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
      },`;

// Insert new translations into localText.uz (just before Default match puzzle)
content = content.replace(
  "      // Default match puzzle\n      def_title:",
  newUzTranslations + "\n\n      // Default match puzzle\n      def_title:"
);

// Insert new translations into localText.ru
content = content.replace(
  "      // Default match puzzle\n      def_title: \"Сопоставьте термины ГИС и картографии\",",
  newRuTranslations + "\n\n      // Default match puzzle\n      def_title: \"Сопоставьте термины ГИС и картографии\","
);

fs.writeFileSync('/Users/libertywalk/gat/src/pages/Subjects/components/InteractivePracticalTask.jsx', content, 'utf-8');
console.log("Successfully remapped InteractivePracticalTask.jsx!");
