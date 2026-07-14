import json
import re

# Load parsed topics from doc
with open('/Users/libertywalk/gat/parsed_topics.json', 'r') as f:
    parsed_topics = json.load(f)

# Group parsed topics by subject
# 1-8 is topografiya, 9-17 is kartografiya, 18-36 is gis
topo_parsed = [t for t in parsed_topics if 1 <= t['num'] <= 8]
karto_parsed = [t for t in parsed_topics if 9 <= t['num'] <= 17]
gis_parsed = [t for t in parsed_topics if 18 <= t['num'] <= 36]

print(f"Topo: {len(topo_parsed)}, Karto: {len(karto_parsed)}, GIS: {len(gis_parsed)}")

# Define GAT topics translations and HTML content
gis_details = {
    18: {
        "ru": "Основы географических информационных систем",
        "en": "Fundamentals of Geographic Information Systems",
        "content_uz": "<h2>Geografik axborot tizimlari (GAT) asoslari</h2><p>GAT (GIS) — fazoviy ma'lumotlarni to'plash, saqlash, qayta ishlash, tahlil qilish va vizuallashtirish uchun mo'ljallangan kompyuter tizimi. Zamonaviy dunyo muammolarining aksariyatiga geografik o'lcham tegishli.</p><h3>GATning 5 komponenti</h3><ul><li><strong>Apparat ta'minot</strong>: kompyuter, server, GPS qabul qilgich, skaner, plotter</li><li><strong>Dastur ta'minot</strong>: ArcGIS, QGIS, MapInfo, Google Earth Engine</li><li><strong>Ma'lumotlar</strong>: vektor, raster, atribut, metadata</li><li><strong>Metodlar</strong>: fazoviy tahlil algoritmlari va modellashtirish</li><li><strong>Foydalanuvchilar</strong>: operatorlar, tahlilchilar, qaror qabul qiluvchilar</li></ul><h3>GATning qo'llanilish sohalari</h3><ul><li>Shahar va hududiy rejalashtirish</li><li>Atrof-muhit monitoringi</li><li>Qishloq xo'jaligi va yer boshqaruvi</li><li>Transport va logistika</li><li>Favqulodda vaziyatlar va falokatlarni boshqarish</li></ul>"
    },
    19: {
        "ru": "Области применения ГИС",
        "en": "GIS Application Areas",
        "content_uz": "<h2>GATni qo'llanilish sohalari</h2><p>Geomatika — geografik ma'lumotlarni to'plash, boshqarish va tahlil qilish uchun texnologiyalar majmuasi. GAT uning asosiy vositasidir.</p><h3>Geokodlash</h3><p>Manzilni geografik koordinatalarga aylantirish jarayoni. Masalan: \"Toshkent, Amir Temur ko'chasi 1\" → (41.299°N, 69.240°E).</p><ul><li>To'g'ri geokodlash: manzil → koordinata</li><li>Teskari geokodlash: koordinata → manzil</li></ul><h3>Qo'llanilish sohalari</h3><ul><li><strong>Yer kadastri</strong>: yer uchastkalarini ro'yxatga olish</li><li><strong>Kommunal xizmatlar</strong>: suv, gaz, elektr tarmoqlari</li><li><strong>Atrof-muhit</strong>: ifloslanish monitoringi, o'rmon boshqaruvi</li><li><strong>Savdo-sotiq</strong>: bozor tahlili, do'kon joylashuvini optimallashtirish</li></ul>"
    },
    20: {
        "ru": "Сбор и ввод данных для ГИС",
        "en": "Data Collection and Input for GIS",
        "content_uz": "<h2>GAT uchun ma'lumotlarni to'plash va kiritish</h2><p>GISning sifati ko'p jihatdan ma'lumotlar sifatiga bog'liq. Ma'lumot to'plash usulini to'g'ri tanlash loyihaning muvaffaqiyatini belgilaydi.</p><h3>Ma'lumot to'plash usullari</h3><ul><li><strong>GPS/GNSS o'lchash</strong>: maydon ma'lumotlarini to'plash</li><li><strong>Masofadan zondlash</strong>: sun'iy yo'ldosh va dron tasvirlari</li><li><strong>Raqamlashtirish</strong>: kog'oz xaritalarni skanerlab vektorlashtirish</li><li><strong>Mavjud ma'lumotlar bazasi</strong>: OpenStreetMap, davlat kadastr ma'lumotlari</li></ul>"
    },
    21: {
        "ru": "Суть растра и вектора",
        "en": "Raster and Vector Concepts",
        "content_uz": "<h2>Rastr va vektor ma'lumotlar</h2><p>GISda ma'lumotlar ikki asosiy shaklda — vektor va raster ko'rinishida saqlanadi. Har birining o'z qo'llanilish sohalari va afzalliklari bor.</p><h3>Vektor ma'lumotlar</h3><ul><li><strong>Nuqta</strong>: aniq joylashuv (shahar, quduq, stantsiya)</li><li><strong>Chiziq</strong>: yo'l, daryo, gazoprovod</li><li><strong>Ko'pburchak</strong>: mamlakat, ko'l, yer uchastkasi</li></ul><h3>Raster ma'lumotlar</h3><p>Piksellar to'ri (grid). Har bir katak bitta qiymatga ega.</p><ul><li>Sun'iy yo'ldosh tasvirlari</li><li>DEM — raqamli balandlik modeli</li></ul>"
    },
    22: {
        "ru": "Получение геоданных из интернет-источников",
        "en": "Getting Geodata from Internet Sources",
        "content_uz": "<h2>Internet manbalaridan geoma'lumotlar olish</h2><p>Internet hozirda ulkan geoma'lumot manbayiga aylangan. Bu ma'lumotlardan GIS loyihalarida samarali foydalanish mumkin.</p><h3>Ochiq ma'lumot manbalari</h3><ul><li><strong>OpenStreetMap (OSM)</strong>: bepul vektorli xarita ma'lumotlari</li><li><strong>SRTM/ASTER</strong>: NASA raqamli balandlik modellari</li><li><strong>Copernicus/Sentinel Hub</strong>: ESA sun'iy yo'ldosh tasvirlari</li><li><strong>USGS Earth Explorer</strong>: Landsat va boshqa tasvirlar</li></ul>"
    },
    23: {
        "ru": "Организация и обработка информации в ГИС",
        "en": "Organizing and Processing Information in GIS",
        "content_uz": "<h2>Geografik axborot tizimida axborotlarni tashkillashtirish va qayta ishlash</h2><p>Vektorlashtirish va raqamlashtirish xom ma'lumotlarni GATga kiritish jarayonidir. Topologiya esa ularning munosabatlarini tartibga soladi.</p><h3>Topologiya va topologik xatolar</h3><p>Topologik qoidalar fazoviy ob'ektlar chegaralari mosligini tekshiradi.</p><ul><li><strong>Overlap</strong>: chegaralarning bir-biri ustiga chiqib qolishi</li><li><strong>Gap</strong>: chegaralar orasida keraksiz bo'shliqlar qolishi</li><li><strong>Dangle</strong>: chiziqlarning ochiq qolgan uchlari</li></ul>"
    },
    24: {
        "ru": "База геоданных",
        "en": "Geodatabase",
        "content_uz": "<h2>Geoma'lumotlar bazasi</h2><p>Geoma'lumotlar bazasi — fazoviy va atribut ma'lumotlarni birgalikda saqlash, boshqarish va so'rov yo'llash uchun mo'ljallangan tizim.</p><h3>Fazoviy SQL so'rovlar</h3><ul><li><code>ST_Within(a, b)</code>: ob'ekt boshqasining ichida joylashishi</li><li><code>ST_Intersects(a, b)</code>: kesishishni aniqlash</li><li><code>ST_Distance(a, b)</code>: masofani hisoblash</li></ul><h3>Indekslash</h3><p>Fazoviy indekslar (R-Tree, GiST) bazadan ma'lumotlarni qidirishni yuzlab marta tezlashtiradi.</p>"
    },
    25: {
        "ru": "Понятие о базах данных",
        "en": "Database Concepts",
        "content_uz": "<h2>Ma'lumotlar bazasi haqida tushuncha</h2><p>Ma'lumotlar bazasini boshqarish tizimi (MBBT) yordamida katta hajmli jadvallarni bog'lash va boshqarish mumkin.</p><h3>Relatsion model va normalizatsiya</h3><p>Jadvallar o'zaro Primary Key va Foreign Key orqali bog'lanadi. Ma'lumotlarni normalizatsiya qilish (1NF, 2NF, 3NF) takrorlanishni kamaytiradi.</p>"
    },
    26: {
        "ru": "Анализ данных в ГИС (Геовизуализация)",
        "en": "Data Analysis in GIS (Geovisualization)",
        "content_uz": "<h2>GATda ma'lumotlarni tahlil qilish: Geovizuallashtirish</h2><p>Geovizuallashtirish — fazoviy ma'lumotlarni interaktiv xaritalar, diagrammalar va dashboardlar orqali aks ettirish.</p><h3>Tasvirlash uslublari (Symbology)</h3><ul><li><strong>Sequential</strong>: o'sib boruvchi demografik gradientlar</li><li><strong>Diverging</strong>: o'rtadan har ikki tomonga og'uvchi (harorat anomaliyalari)</li><li><strong>Qualitative</strong>: nominal/kategoriyalangan ma'lumotlar</li></ul>"
    },
    27: {
        "ru": "Анализ данных в ГИС (Пространственное моделирование)",
        "en": "Data Analysis in GIS (Spatial Modeling)",
        "content_uz": "<h2>GATda ma'lumotlarni tahlil qilish: Fazoviy modellashtirish</h2><p>Fazoviy modellashtirish — real dunyo hodisalarini matematik modellar orqali simulyatsiya qilish.</p><h3>Interpolatsiya metodlari</h3><ul><li><strong>IDW</strong>: yaqin nuqtalarning ta'sir kuchi balandroq</li><li><strong>Kriging</strong>: geostatistik tahlil usuli</li><li><strong>Spline</strong>: silliq egri chiziqli yuzalar yaratish</li></ul>"
    },
    28: {
        "ru": "Понятие и методы геопространственного анализа",
        "en": "Geospatial Analysis Concepts and Methods",
        "content_uz": "<h2>Geofazoviy tahlil tushunchasi va usullari</h2><p>Geofazoviy tahlil yordamida geografik ob'ektlarning o'zaro bog'liqligi va munosabatlari o'rganiladi.</p><h3>Asosiy tahlil usullari</h3><ul><li><strong>Buffer (Bufer)</strong>: ob'ekt atrofida xavfsizlik yoki muhofaza zonasi yaratish</li><li><strong>Overlay (Qatlamlarni ustma-ust qo'yish)</strong>: intersect, union, erase</li><li><strong>Tarmoq tahlili (Network Analysis)</strong>: eng qisqa yo'l va xizmat ko'rsatish hududlari</li></ul>"
    },
    29: {
        "ru": "Отображение данных исследований в ГИС",
        "en": "Representing Research Data in GIS",
        "content_uz": "<h2>Tadqiqot ma'lumotlarini GATda aks ettirish</h2><p>Ilmiy va amaliy tadqiqot natijalarini to'g'ri kartografik dizayn (Layout) asosida eksport qilish va chop etish.</p><h3>Layout elementlari</h3><ul><li>Sarlavha (Title) va Afsona (Legend)</li><li>Shimol ko'rsatkichi (North Arrow) va Masshtab (Scale Bar)</li></ul>"
    },
    30: {
        "ru": "Трехмерное изображение геопространственных данных в ГИС",
        "en": "3D Representation of Geospatial Data in GIS",
        "content_uz": "<h2>GATda geofazoviy ma’lumotlarning uch o‘lchovli tasviri</h2><p>Uch o'lchamli modellashtirish yer relyefi va ob'ektlarni real ko'rinishda ifodalaydi.</p><h3>Balandlik modellari</h3><ul><li><strong>DEM (Digital Elevation Model)</strong>: raqamli balandlik modeli</li><li><strong>DTM (Digital Terrain Model)</strong>: faqat yer yuzasi modeli</li><li><strong>DSM (Digital Surface Model)</strong>: binolar va daraxtlar bilan birga</li></ul>"
    },
    31: {
        "ru": "Проект умного города и его 3D-модель в ГИС",
        "en": "Smart City Project and its 3D Model in GIS",
        "content_uz": "<h2>GATda aqlli shahar loyihasi va uning uch o‘lchovli modeli</h2><p>Aqlli shahar (Smart City) konsepsiyasi GAT texnologiyalariga asoslanib, shahar infratuzilmasini real vaqtda optimallashtiradi.</p><h3>3D shahar modellari</h3><p>BIM (Building Information Modeling) va GIS integratsiyasi orqali Digital Twin (raqamli egizak) yaratish.</p>"
    },
    32: {
        "ru": "Организация управления в ГИС",
        "en": "Managing and Organizing GIS",
        "content_uz": "<h2>Geografik axborot tizimida boshqaruvni tashkillashtirish</h2><p>GAT loyihalarini boshqarish, dasturiy ta'minotlarni o'rnatish talablari va ekspert tizimlari.</p><h3>Boshqaruv elementlari</h3><ul><li>Ma'lumotlar xavfsizligi va foydalanish huquqlari</li><li>Dasturiy va apparat ta'minot integratsiyasi</li></ul>"
    },
    33: {
        "ru": "Современное развитие географических информационных систем",
        "en": "Modern Development of GIS",
        "content_uz": "<h2>Geografik axborot tizimining zamonaviy rivojlanishi</h2><p>Zamonaviy GAT multimedia vositalari, bulutli texnologiyalar va mobil ilovalar bilan uzviy bog'langan.</p><h3>WebGIS va MobileGIS</h3><ul><li>Internet orqali xaritalarni ulashish</li><li>Telefon yordamida oflayn/onlayn ma'lumot yig'ish</li></ul>"
    },
    34: {
        "ru": "Общие сведения о дистанционном зондировании в географических исследованиях",
        "en": "General Information about Remote Sensing in Geographic Research",
        "content_uz": "<h2>Masofadan zondlash haqida umumiy ma'lumotlar</h2><p>Masofadan zondlash (Remote Sensing) — yer yuzasini sun'iy yo'ldosh va dronlar yordamida masofadan turib suratga olish va tahlil qilish.</p><h3>Spektral indekslar</h3><p>Vegetatsiya holatini baholash uchun NDVI vegetatsiya indeksi qo'llaniladi: <code>NDVI = (NIR - RED) / (NIR + RED)</code>.</p>"
    },
    35: {
        "ru": "Методы получения космических снимков в ГИС",
        "en": "Methods of Obtaining Satellite Images in GIS",
        "content_uz": "<h2>GATda kosmik suratlarni olish usullari</h2><p>Sun'iy yo'ldoshlardan faol (radar, LiDAR) va sust (optik) sensorlar yordamida tasvirlar olish.</p><h3>Landsat-8 kanallar kombinatsiyasi</h3><ul><li>Natural Color: 4, 3, 2</li><li>False Color (NIR): 5, 4, 3</li><li>Shortwave Infrared: 7, 6, 4</li></ul>"
    },
    36: {
        "ru": "Обработка аэрокосмических снимков на основе ГИС-технологий",
        "en": "Processing Aerospace Images Based on GIS Technologies",
        "content_uz": "<h2>GAT texnologiyalari asosida aerokosmik suratlarni qayta ishlash</h2><p>Aerokosmik suratlarni georeferenslash, ortorektifikatsiya qilish hamda tasvirlarni klassifikatsiya qilish (nazoratli va nazoratsiz).</p><h3>Klassifikatsiya baholash</h3><p>Xatolik matritsasi (Confusion Matrix) va Kappa koeffitsiyenti yordamida aniqlikni baholash.</p>"
    }
}

print("GAT details prepared.")
