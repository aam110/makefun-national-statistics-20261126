// Dunia dalam Angka — data statistik 12 negara.
// Sumber: World Bank, World Development Indicators (WDI), diunduh 26 Nov 2026
// (pembaruan terakhir dataset 11 Nov 2026). Kode indikator:
//   SP.POP.TOTL  penduduk total            | NY.GDP.MKTP.CD  PDB (US$ berlaku)
//   NY.GDP.MKTP.KD.ZG  pertumbuhan PDB %   | FP.CPI.TOTL.ZG  inflasi CPI %
//   SL.UEM.TOTL.ZS  pengangguran (ILO) %    | SP.DYN.LE00.IN  harapan hidup (tahun)
//   SP.URB.TOTL.IN.ZS  penduduk perkotaan %
// PDB per kapita TIDAK disimpan di sini: dihitung di main.js sebagai PDB / penduduk,
// supaya angkanya konsisten di semua halaman.
// Seri: penduduk & PDB 2015-2024; pertumbuhan, inflasi, pengangguran, perkotaan
// 2019-2024; harapan hidup 2019-2023 (tahun terakhir yang diterbitkan WDI).

const YEARS = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];
const SHORT_YEARS = [2019, 2020, 2021, 2022, 2023, 2024];
const LIFE_YEARS = [2019, 2020, 2021, 2022, 2023];

const COUNTRIES = [
  {
    id: "IDN", name: "Indonesia", nameEn: "Indonesia", flag: "\u{1F1EE}\u{1F1E9}",
    capital: "Jakarta", region: "Asia Tenggara", currency: "Rupiah (IDR)",
    pop: [261799249, 264627418, 267346658, 269951846, 272489381, 274814866, 276758053, 278830529, 281190067, 283487931],
    gdp: [860.85, 931.88, 1015.62, 1042.27, 1119.10, 1059.05, 1186.51, 1319.10, 1371.17, 1396.30],
    growth: [5.02, -2.07, 3.70, 5.31, 5.05, 5.03],
    infl: [3.03, 1.92, 1.56, 4.21, 3.67, 2.18],
    unemp: [3.59, 4.26, 3.83, 3.46, 3.31, 3.30],
    life: [70.3, 68.8, 67.5, 70.9, 71.1],
    urban: [55.7, 56.3, 56.9, 57.5, 58.1, 58.8]
  },
  {
    id: "JPN", name: "Jepang", nameEn: "Japan", flag: "\u{1F1EF}\u{1F1F5}",
    capital: "Tokyo", region: "Asia Timur", currency: "Yen (JPY)",
    pop: [127141000, 127076000, 126972000, 126811000, 126633000, 126261000, 125681593, 125124989, 124516650, 123975371],
    gdp: [4534.44, 5110.36, 5038.23, 5154.29, 5245.76, 5189.20, 5225.93, 4447.98, 4384.85, 4190.01],
    growth: [-0.31, -4.28, 3.56, 1.33, 0.72, -0.24],
    infl: [0.47, -0.02, -0.23, 2.50, 3.27, 2.74],
    unemp: [2.35, 2.81, 2.81, 2.61, 2.60, 2.50],
    life: [84.4, 84.6, 84.4, 84.0, 84.0],
    urban: [91.7, 91.8, 91.9, 92.0, 92.1, 92.2]
  },
  {
    id: "CHN", name: "China", nameEn: "China", flag: "\u{1F1E8}\u{1F1F3}",
    capital: "Beijing", region: "Asia Timur", currency: "Yuan (CNY)",
    pop: [1379860000, 1387790000, 1396215000, 1402760000, 1407745000, 1411100000, 1412360000, 1412175000, 1410710000, 1408975000],
    gdp: [11280.81, 11456.02, 12537.56, 14147.77, 14560.17, 14996.41, 18201.70, 18316.77, 18270.36, 18729.67],
    growth: [6.07, 2.34, 8.57, 3.13, 5.42, 4.96],
    infl: [2.90, 2.42, 0.98, 1.97, 0.23, 0.22],
    unemp: [4.56, 5.00, 4.55, 4.98, 4.67, 4.59],
    life: [77.9, 78.0, 78.1, 78.2, 78.0],
    urban: [62.7, 63.5, 64.7, 65.2, 65.5, 65.9]
  },
  {
    id: "IND", name: "India", nameEn: "India", flag: "\u{1F1EE}\u{1F1F3}",
    capital: "New Delhi", region: "Asia Selatan", currency: "Rupee (INR)",
    pop: [1328024498, 1343944296, 1359657400, 1374659064, 1389030312, 1402617695, 1414203896, 1425423212, 1438069596, 1450935791],
    gdp: [2103.59, 2294.80, 2651.47, 2702.93, 2835.61, 2674.85, 3167.27, 3249.94, 3500.91, 3760.81],
    growth: [3.87, -5.78, 9.69, 7.61, 7.21, 7.10],
    infl: [3.73, 6.62, 5.13, 6.70, 5.65, 4.95],
    unemp: [6.51, 7.86, 6.38, 4.82, 4.17, 4.17],
    life: [70.7, 70.2, 67.3, 71.7, 72.0],
    urban: [33.8, 34.1, 34.4, 34.8, 35.1, 35.4]
  },
  {
    id: "USA", name: "Amerika Serikat", nameEn: "United States", flag: "\u{1F1FA}\u{1F1F8}",
    capital: "Washington D.C.", region: "Amerika Utara", currency: "Dolar AS (USD)",
    pop: [321815121, 324353340, 326608609, 328529577, 330226227, 331578104, 332100166, 333996304, 336755052, 340003797],
    gdp: [18295.02, 18804.91, 19612.10, 20656.52, 21539.98, 21375.28, 23725.65, 26054.61, 27811.52, 29298.01],
    growth: [2.58, -2.08, 6.15, 2.52, 2.93, 2.79],
    infl: [1.81, 1.23, 4.70, 8.00, 4.12, 2.95],
    unemp: [3.67, 8.06, 5.35, 3.65, 3.64, 4.02],
    life: [78.8, 77.0, 76.3, 77.4, 78.4],
    urban: [80.1, 80.0, 80.0, 80.0, 80.1, 80.1]
  },
  {
    id: "BRA", name: "Brasil", nameEn: "Brazil", flag: "\u{1F1E7}\u{1F1F7}",
    capital: "Bras\u00EDlia", region: "Amerika Selatan", currency: "Real (BRL)",
    pop: [201675532, 203218114, 204703445, 206107261, 207455459, 208660842, 209550294, 210306415, 211140729, 211998573],
    gdp: [1802.21, 1795.69, 2063.51, 1916.93, 1873.29, 1476.11, 1670.65, 1951.92, 2191.13, 2185.82],
    growth: [1.22, -3.28, 4.76, 3.02, 3.24, 3.42],
    infl: [3.73, 3.21, 8.30, 9.28, 4.59, 4.37],
    unemp: [11.94, 13.70, 13.16, 9.23, 7.95, 6.80],
    life: [75.8, 74.5, 73.0, 74.9, 75.8],
    urban: [86.7, 86.9, 87.1, 87.3, 87.6, 87.9]
  },
  {
    id: "DEU", name: "Jerman", nameEn: "Germany", flag: "\u{1F1E9}\u{1F1EA}",
    capital: "Berlin", region: "Eropa Barat", currency: "Euro (EUR)",
    pop: [81686611, 82348669, 82657002, 82905782, 83092962, 83160871, 83196078, 83177813, 83287273, 83516593],
    gdp: [3425.10, 3536.79, 3765.35, 4055.43, 3959.89, 3941.40, 4355.25, 4201.02, 4562.21, 4685.59],
    growth: [0.98, -4.13, 3.91, 1.81, -0.87, -0.50],
    infl: [1.45, 0.14, 3.07, 6.87, 5.95, 2.26],
    unemp: [3.16, 3.88, 3.59, 3.14, 3.07, 3.40],
    life: [81.3, 81.0, 80.8, 80.6, 81.0],
    urban: [81.3, 81.5, 81.6, 81.8, 81.9, 82.0]
  },
  {
    id: "FRA", name: "Prancis", nameEn: "France", flag: "\u{1F1EB}\u{1F1F7}",
    capital: "Paris", region: "Eropa Barat", currency: "Euro (EUR)",
    pop: [66548272, 66724104, 66918020, 67158348, 67382061, 67601110, 67842811, 68184457, 68372286, 68551653],
    gdp: [2442.48, 2470.41, 2588.87, 2781.58, 2722.79, 2647.93, 2966.43, 2794.79, 3056.25, 3160.44],
    growth: [2.03, -7.44, 6.88, 2.72, 1.44, 1.19],
    infl: [1.11, 0.48, 1.64, 5.22, 4.88, 2.00],
    unemp: [8.42, 8.01, 7.87, 7.30, 7.34, 7.40],
    life: [82.8, 82.2, 82.3, 82.1, 82.8],
    urban: [78.7, 78.7, 78.7, 78.8, 78.8, 78.8]
  },
  {
    id: "GBR", name: "Inggris", nameEn: "United Kingdom", flag: "\u{1F1EC}\u{1F1E7}",
    capital: "London", region: "Eropa Barat", currency: "Pound sterling (GBP)",
    pop: [65087000, 65606000, 65964000, 66287000, 66628000, 66740000, 66978000, 67636000, 68526000, 69281000],
    gdp: [2945.58, 2706.81, 2699.12, 2897.03, 2875.71, 2724.00, 3194.56, 3181.24, 3420.80, 3695.54],
    growth: [1.26, -10.05, 8.54, 5.15, 0.27, 1.08],
    infl: [1.74, 0.99, 2.52, 7.92, 6.79, 3.27],
    unemp: [3.66, 4.47, 4.86, 3.77, 4.03, 4.36],
    life: [81.4, 80.3, 80.6, 81.0, 81.2],
    urban: [82.7, 82.9, 83.0, 83.1, 83.2, 83.2]
  },
  {
    id: "CAN", name: "Kanada", nameEn: "Canada", flag: "\u{1F1E8}\u{1F1E6}",
    capital: "Ottawa", region: "Amerika Utara", currency: "Dolar Kanada (CAD)",
    pop: [35704498, 36110803, 36545075, 37072620, 37618495, 38028638, 38239864, 38950132, 40049088, 41262329],
    gdp: [1556.51, 1528.00, 1649.27, 1725.33, 1743.73, 1655.69, 2022.38, 2200.56, 2196.59, 2270.08],
    growth: [1.91, -5.04, 5.95, 4.70, 1.95, 2.05],
    infl: [1.95, 0.72, 3.40, 6.80, 3.88, 2.38],
    unemp: [5.69, 9.66, 7.53, 5.28, 5.42, 6.35],
    life: [82.2, 81.5, 81.5, 81.1, 81.6],
    urban: [81.7, 82.0, 82.2, 82.4, 82.5, 82.7]
  },
  {
    id: "AUS", name: "Australia", nameEn: "Australia", flag: "\u{1F1E6}\u{1F1FA}",
    capital: "Canberra", region: "Oseania", currency: "Dolar Australia (AUD)",
    pop: [23815995, 24190907, 24592588, 24963258, 25334826, 25649248, 25685412, 26018721, 26659922, 27194286],
    gdp: [1356.81, 1211.59, 1330.89, 1433.14, 1398.35, 1333.34, 1560.62, 1695.63, 1734.45, 1757.02],
    growth: [2.19, -0.13, 2.01, 4.25, 3.58, 1.37],
    infl: [1.61, 0.85, 2.86, 6.59, 5.60, 3.17],
    unemp: [5.14, 6.39, 5.02, 3.73, 3.67, 3.94],
    life: [82.9, 83.2, 83.3, 83.2, 83.1],
    urban: [87.3, 87.3, 87.2, 87.3, 87.5, 87.6]
  },
  {
    id: "KOR", name: "Korea Selatan", nameEn: "Korea, Rep.", flag: "\u{1F1F0}\u{1F1F7}",
    capital: "Seoul", region: "Asia Timur", currency: "Won (KRW)",
    pop: [51014947, 51217803, 51361911, 51585058, 51764822, 51836239, 51769539, 51672569, 51712619, 51751065],
    gdp: [1539.21, 1579.15, 1710.20, 1824.25, 1751.05, 1744.07, 1942.31, 1799.36, 1844.80, 1875.39],
    growth: [2.31, -0.70, 4.61, 2.73, 1.58, 2.00],
    infl: [0.38, 0.54, 2.50, 5.09, 3.60, 2.32],
    unemp: [3.75, 3.93, 3.64, 2.86, 2.68, 2.78],
    life: [83.2, 83.4, 83.5, 82.7, 83.4],
    urban: [81.3, 81.2, 81.2, 81.2, 81.2, 81.2]
  }
];

// Definisi 8 indikator yang dipakai di seluruh situs.
const INDICATORS = [
  { key: "pop",    name: "Penduduk",          unit: "jiwa",   code: "SP.POP.TOTL",       series: "pop",    years: YEARS,       higherBetter: true,  digits: 0, note: "Jumlah penduduk tengah tahun (estimasi PBB, via WDI)." },
  { key: "gdp",    name: "PDB",               unit: "US$ miliar", code: "NY.GDP.MKTP.CD", series: "gdp",    years: YEARS,       higherBetter: true,  digits: 0, note: "Produk domestik bruto, harga berlaku, dolar AS." },
  { key: "gdppc",  name: "PDB per kapita",    unit: "US$",     code: "NY.GDP.MKTP.CD / SP.POP.TOTL", series: "gdppc", years: YEARS, higherBetter: true, digits: 0, note: "Dihitung: PDB (US$) dibagi penduduk pada tahun yang sama." },
  { key: "growth", name: "Pertumbuhan PDB",   unit: "%/tahun", code: "NY.GDP.MKTP.KD.ZG", series: "growth", years: SHORT_YEARS, higherBetter: true,  digits: 2, note: "Pertumbuhan PDB riil tahunan (harga konstan)." },
  { key: "infl",   name: "Inflasi (CPI)",     unit: "%/tahun", code: "FP.CPI.TOTL.ZG",  series: "infl",   years: SHORT_YEARS, higherBetter: false, digits: 2, note: "Inflasi harga konsumen tahunan; lebih rendah lebih stabil." },
  { key: "unemp",  name: "Pengangguran",      unit: "% angkatan kerja", code: "SL.UEM.TOTL.ZS", series: "unemp", years: SHORT_YEARS, higherBetter: false, digits: 2, note: "Estimasi model ILO, % dari total angkatan kerja." },
  { key: "life",   name: "Harapan hidup",     unit: "tahun",   code: "SP.DYN.LE00.IN",  series: "life",   years: LIFE_YEARS,  higherBetter: true,  digits: 1, note: "Harapan hidup saat lahir. Data terakhir yang diterbitkan: 2023." },
  { key: "urban",  name: "Penduduk perkotaan", unit: "% penduduk", code: "SP.URB.TOTL.IN.ZS", series: "urban", years: SHORT_YEARS, higherBetter: true, digits: 1, note: "% penduduk yang tinggal di wilayah perkotaan (definisi nasional)." }
];

const SOURCE_NOTE = "Sumber: World Bank, World Development Indicators (data.worldbank.org/indicator). Dataset diunduh 26 Nov 2026, pembaruan terakhir 11 Nov 2026.";
