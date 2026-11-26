// Dunia dalam Angka — halaman situs (render + logika angka).
// Semua angka dihitung dari data.js; PDB per kapita = PDB / penduduk,
// peringkat = urutan nilai yang sama di semua halaman.

function countryById(id) {
  return COUNTRIES.find(function (c) { return c.id === id; }) || COUNTRIES[0];
}

function indByKey(key) {
  return INDICATORS.find(function (i) { return i.key === key; }) || INDICATORS[0];
}

// Seri (tahun, nilai) satu indikator untuk satu negara. PDB per kapita dihitung.
function seriesFor(c, indKey) {
  const ind = indByKey(indKey);
  if (indKey === "gdppc") {
    const vals = c.gdp.map(function (g, i) { return (g * 1e9) / c.pop[i]; });
    return { years: YEARS, values: vals };
  }
  return { years: ind.years, values: c[ind.series] };
}

// Nilai indikator pada satu tahun; harapan hidup memakai tahun terakhir (2023)
// bila tahun yang dipilih 2024.
function valueAt(c, indKey, year) {
  const s = seriesFor(c, indKey);
  const i = s.years.indexOf(year);
  if (i !== -1) return s.values[i];
  return s.values[s.values.length - 1];
}

// Tahun efektif yang benar-benar dipakai (untuk label "data terakhir 2023").
function effectiveYear(indKey, year) {
  const ind = indByKey(indKey);
  if (year > ind.years[ind.years.length - 1]) return ind.years[ind.years.length - 1];
  if (year < ind.years[0]) return ind.years[0];
  return year;
}

function rankOf(countryId, indKey, year) {
  const ind = indByKey(indKey);
  const rows = COUNTRIES.map(function (c) { return { id: c.id, v: valueAt(c, indKey, year) }; });
  rows.sort(function (a, b) { return ind.higherBetter ? b.v - a.v : a.v - b.v; });
  for (let i = 0; i < rows.length; i++) if (rows[i].id === countryId) return i + 1;
  return 12;
}

function avgOf(indKey, year) {
  let sum = 0;
  COUNTRIES.forEach(function (c) { sum += valueAt(c, indKey, year); });
  return sum / COUNTRIES.length;
}

function totalOf(indKey, year) {
  let sum = 0;
  COUNTRIES.forEach(function (c) { sum += valueAt(c, indKey, year); });
  return sum;
}

// Format angka Indonesia: 1.234.567,89
function fmtId(n, digits) {
  return Number(n).toLocaleString("id-ID", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function fmtPop(n) {
  if (n >= 1e9) return fmtId(n / 1e9, 2) + " miliar";
  if (n >= 1e6) return fmtId(n / 1e6, 1) + " juta";
  return fmtId(n, 0);
}

function fmtGdp(bn) {
  if (bn >= 1000) return "US$ " + fmtId(bn / 1000, 2) + " triliun";
  return "US$ " + fmtId(bn, 0) + " miliar";
}

function fmtValue(indKey, v) {
  if (v === null || v === undefined) return "—";
  if (indKey === "pop") return fmtPop(v) + " jiwa";
  if (indKey === "gdp") return fmtGdp(v);
  if (indKey === "gdppc") return "US$ " + fmtId(v, 0);
  if (indKey === "life") return fmtId(v, 1) + " tahun";
  return fmtId(v, 2) + "%";
}

function fmtNum(v, unit) {
  if (unit === "US$") return "US$ " + fmtId(v, 0);
  if (unit === "tahun") return fmtId(v, 1) + " tahun";
  if (unit === "%") return fmtId(v, 2) + "%";
  return fmtId(v, 0);
}

function yearOptions(selected, years) {
  return years.map(function (y) {
    return '<option value="' + y + '"' + (y === selected ? " selected" : "") + ">" + y + "</option>";
  }).join("");
}

function indOptions(selected) {
  return INDICATORS.map(function (i) {
    return '<option value="' + i.key + '"' + (i.key === selected ? " selected" : "") + ">" + i.name + "</option>";
  }).join("");
}

function countryOptions(selected) {
  return COUNTRIES.map(function (c) {
    return '<option value="' + c.id + '"' + (c.id === selected ? " selected" : "") + ">" + c.flag + " " + c.name + "</option>";
  }).join("");
}

function navLink(href, label, current) {
  return '<a href="' + href + '" class="nav-link' + (current ? " active" : "") + '">' + label + "</a>";
}

// ---------------- BERANDA ----------------
function viewHome(state) {
  const year = state.year;
  const totalPop = totalOf("pop", year);
  const totalGdp = totalOf("gdp", year);
  const topGdppc = COUNTRIES.slice().sort(function (a, b) { return valueAt(b, "gdppc", year) - valueAt(a, "gdppc", year); })[0];
  const topGrowth = COUNTRIES.slice().sort(function (a, b) { return valueAt(b, "growth", year) - valueAt(a, "growth", year); })[0];
  const topPop = COUNTRIES.slice().sort(function (a, b) { return valueAt(b, "pop", year) - valueAt(a, "pop", year); })[0];
  const topLife = COUNTRIES.slice().sort(function (a, b) { return valueAt(b, "life", 2023) - valueAt(a, "life", 2023); })[0];
  const topUnemp = COUNTRIES.slice().sort(function (a, b) { return valueAt(a, "unemp", year) - valueAt(b, "unemp", year); })[0];

  const gdpSeries = YEARS.map(function (y) { return totalOf("gdp", y); });
  const chart = lineChart([{ label: "PDB gabungan 12 negara", color: "#0b4f6c", values: gdpSeries }], YEARS);

  const top5 = COUNTRIES.slice().sort(function (a, b) { return valueAt(b, "gdp", year) - valueAt(a, "gdp", year); }).slice(0, 5);
  const rows = top5.map(function (c, i) {
    return "<tr><td>" + (i + 1) + "</td><td><a href=\"#/negara/" + c.id + "\">" + c.flag + " " + esc(c.name) + "</a></td>"
      + "<td class=\"num\">" + fmtGdp(valueAt(c, "gdp", year)) + "</td>"
      + "<td class=\"num\">" + fmtValue("gdppc", valueAt(c, "gdppc", year)) + "</td>"
      + "<td class=\"num\">" + fmtValue("growth", valueAt(c, "growth", year)) + "</td></tr>";
  }).join("");

  const cards = COUNTRIES.map(function (c) {
    return '<a class="country-card" href="#/negara/' + c.id + '"><span class="cc-flag">' + c.flag + '</span>'
      + '<span class="cc-name">' + esc(c.name) + '</span>'
      + '<span class="cc-stat">PDB ' + fmtGdp(valueAt(c, "gdp", year)) + '</span>'
      + '<span class="cc-stat dim">' + fmtPop(valueAt(c, "pop", year)) + ' jiwa</span></a>';
  }).join("");

  return '<section class="hero">'
    + '<p class="eyebrow">Atlas statistik &middot; 12 negara &middot; 8 indikator &middot; data 2015&ndash;2024</p>'
    + "<h1>Dunia dalam Angka</h1>"
    + "<p class=\"lede\">Bandingkan statistik nasional dua belas negara besar — penduduk, PDB, pertumbuhan, inflasi, pengangguran, harapan hidup, dan urbanisasi — dari satu sumber resmi: World Bank, World Development Indicators.</p>"
    + '<div class="toolbar"><label>Tahun data <select id="yearSelect" data-action="year">' + yearOptions(year, SHORT_YEARS) + "</select></label>"
    + '<a class="btn" href="#/bandingkan">Bandingkan negara &rarr;</a>'
    + '<a class="btn ghost" href="#/peringkat">Lihat peringkat</a></div>'
    + "</section>"
    + '<section class="stat-grid">'
    + statCard("Penduduk 12 negara", fmtPop(totalPop) + " jiwa", "Total " + year + ", dari " + fmtPop(totalPop / 12) + " jiwa rata-rata per negara")
    + statCard("PDB gabungan 12 negara", fmtGdp(totalGdp), "Total " + year + " — " + fmtId((totalGdp / totalOf("gdp", 2015) - 1) * 100, 1) + "% di atas 2015")
    + statCard("PDB per kapita tertinggi", fmtValue("gdppc", valueAt(topGdppc, "gdppc", year)), topGdppc.flag + " " + esc(topGdppc.name) + " &middot; peringkat 1 dari 12")
    + statCard("Pertumbuhan tercepat " + year, topGrowth.flag + " " + esc(topGrowth.name), fmtValue("growth", valueAt(topGrowth, "growth", year)) + " &middot; PDB riil tahunan")
    + "</section>"
    + '<section class="panel"><h2>PDB gabungan 12 negara, 2015&ndash;2024</h2>'
    + '<p class="panel-sub">US$ miliar, harga berlaku. Puncak 2021&ndash;2024 didorong Amerika Serikat, China, dan India.</p>'
    + chart
    + '<p class="source">' + esc(SOURCE_NOTE) + "</p></section>"
    + '<section class="panel"><h2>5 ekonomi terbesar, ' + year + '</h2>'
    + '<table class="data-table"><thead><tr><th>#</th><th>Negara</th><th class="num">PDB</th><th class="num">PDB per kapita</th><th class="num">Pertumbuhan</th></tr></thead><tbody>' + rows + "</tbody></table>"
    + '<p class="panel-sub"><a href="#/peringkat">Lihat peringkat lengkap 12 negara &rarr;</a></p></section>'
    + '<section class="panel"><h2>Sorotan ' + year + '</h2><div class="spot-grid">'
    + spotCard("Negara terpadat", topPop.flag + " " + esc(topPop.name), fmtPop(valueAt(topPop, "pop", year)) + " jiwa — " + fmtId((valueAt(topPop, "pop", year) / totalPop) * 100, 1) + "% dari total 12 negara.")
    + spotCard("Harapan hidup tertinggi", topLife.flag + " " + esc(topLife.name), fmtValue("life", valueAt(topLife, "life", 2023)) + " (2023) — tertinggi dari 12 negara, disusul Korea Selatan " + fmtValue("life", valueAt(countryById("KOR"), "life", 2023)) + ".")
    + spotCard("Pengangguran terendah", topUnemp.flag + " " + esc(topUnemp.name), fmtValue("unemp", valueAt(topUnemp, "unemp", year)) + " dari angkatan kerja — terendah dari 12 negara.")
    + "</div></section>"
    + '<section class="panel"><h2>Semua negara</h2><p class="panel-sub">Klik sebuah negara untuk melihat profil lengkapnya.</p><div class="country-grid">' + cards + "</div></section>";
}

function statCard(label, value, sub) {
  return '<div class="stat-card"><span class="stat-label">' + label + '</span><span class="stat-value">' + value + '</span><span class="stat-sub">' + sub + "</span></div>";
}

function spotCard(title, head, body) {
  return '<div class="spot-card"><h3>' + title + "</h3><p class=\"spot-head\">" + head + "</p><p>" + body + "</p></div>";
}

// ---------------- PERINGKAT ----------------
function viewRank(state) {
  const ind = indByKey(state.rankInd);
  const year = state.year;
  const effYear = effectiveYear(ind.key, year);
  let rows = COUNTRIES.map(function (c) { return { c: c, v: valueAt(c, ind.key, year) }; });
  rows.sort(function (a, b) { return state.rankDir === "asc" ? a.v - b.v : b.v - a.v; });
  const dirLabel = state.rankDir === "asc" ? "Terendah dulu" : "Tertinggi dulu";
  const body = rows.map(function (r, i) {
    const avg = avgOf(ind.key, year);
    const diff = ((r.v - avg) / avg) * 100;
    return "<tr><td>" + (i + 1) + "</td><td><a href=\"#/negara/" + r.c.id + "\">" + r.c.flag + " " + esc(r.c.name) + "</a></td>"
      + "<td class=\"num\"><b>" + fmtValue(ind.key, r.v) + "</b></td>"
      + "<td class=\"num\">" + (diff >= 0 ? "+" : "") + fmtId(diff, 1) + "%</td></tr>";
  }).join("");
  const bars = rows.slice().sort(function (a, b) { return b.v - a.v; }).map(function (r, i) {
    return { label: r.c.name, value: r.v, valueText: fmtValue(ind.key, r.v), color: CHART_COLORS[i % CHART_COLORS.length] };
  });
  const chart = barChart(bars);
  return '<section class="panel"><h1>Peringkat 12 negara</h1>'
    + '<p class="lede small">Satu indikator, dua belas negara, satu urutan. ' + esc(ind.note) + "</p>"
    + '<div class="toolbar"><label>Indikator <select id="rankInd" data-action="rankInd">' + indOptions(ind.key) + "</select></label>"
    + '<label>Tahun <select id="yearSelect" data-action="year">' + yearOptions(year, SHORT_YEARS) + "</select></label>"
    + '<button class="btn" data-action="rankDir" type="button">Urutkan: ' + dirLabel + " &#8645;</button></div>"
    + "<h2>" + esc(ind.name) + " — " + effYear + (effYear !== year ? " (data terakhir)" : "") + "</h2>"
    + chart
    + '<table class="data-table"><thead><tr><th data-action="sortRank" data-dir="rank">#</th><th>Negara</th><th class="num">Nilai</th><th class="num">vs rata-rata 12 negara</th></tr></thead><tbody>' + body + "</tbody></table>"
    + '<p class="source">' + esc(ind.name) + " &middot; kode WDI " + esc(ind.code) + ". " + esc(SOURCE_NOTE) + "</p></section>";
}

// ---------------- BANDINGKAN ----------------
function viewCompare(state) {
  const ind = indByKey(state.cmpInd);
  const year = state.year;
  const effYear = effectiveYear(ind.key, year);
  const picked = state.cmp.map(function (id) { return countryById(id); });
  const series = picked.map(function (c, i) {
    const s = seriesFor(c, ind.key);
    return { label: c.name, color: CHART_COLORS[i % CHART_COLORS.length], values: s.values };
  });
  const years = seriesFor(picked[0], ind.key).years;
  let chart;
  if (state.cmpChart === "bar") {
    const bars = picked.map(function (c, i) {
      return { label: c.name, value: valueAt(c, ind.key, year), valueText: fmtValue(ind.key, valueAt(c, ind.key, year)), color: CHART_COLORS[i % CHART_COLORS.length] };
    });
    chart = barChart(bars);
  } else {
    chart = lineChart(series, years);
  }
  const rows = INDICATORS.map(function (ii) {
    const vals = picked.map(function (c) { return valueAt(c, ii.key, year); });
    let best = 0;
    vals.forEach(function (v, i) { if (ii.higherBetter ? v > vals[best] : v < vals[best]) best = i; });
    const cells = vals.map(function (v, i) {
      return '<td class="num' + (i === best ? " winner" : "") + '">' + fmtValue(ii.key, v) + (i === best ? " &#9733;" : "") + "</td>";
    }).join("");
    return "<tr><td>" + esc(ii.name) + (ii.key === "life" && year === 2024 ? " (2023)" : "") + "</td>" + cells + "</tr>";
  }).join("");
  const head = picked.map(function (c) { return '<th class="num">' + c.flag + " " + esc(c.name) + "</th>"; }).join("");
  const selects = picked.map(function (c, i) {
    return '<label>Negara ' + "ABC"[i] + ' <select data-action="cmpCountry" data-idx="' + i + '">' + countryOptions(c.id) + "</select></label>";
  }).join("");
  return '<section class="panel"><h1>Bandingkan negara</h1>'
    + '<p class="lede small">Pilih dua atau tiga negara — tabel dan grafik membandingkan kedelapan indikator sekaligus. Tanda &#9733; menandai nilai terbaik tiap baris.</p>'
    + '<div class="toolbar">' + selects
    + '<label>Indikator grafik <select data-action="cmpInd">' + indOptions(ind.key) + "</select></label>"
    + '<label>Tahun <select data-action="year">' + yearOptions(year, SHORT_YEARS) + "</select></label>"
    + '<span class="seg" role="group" aria-label="Jenis grafik"><button type="button" data-action="cmpChart" data-v="line" class="' + (state.cmpChart === "line" ? "on" : "") + '">Garis</button><button type="button" data-action="cmpChart" data-v="bar" class="' + (state.cmpChart === "bar" ? "on" : "") + '">Batang</button></span>'
    + "</div>"
    + "<h2>" + esc(ind.name) + " — " + years[0] + "&ndash;" + years[years.length - 1] + "</h2>"
    + chart
    + '<div class="legend">' + picked.map(function (c, i) { return '<span><i style="background:' + CHART_COLORS[i % CHART_COLORS.length] + '"></i>' + esc(c.name) + "</span>"; }).join("") + "</div>"
    + "<h2>Semua indikator, " + effYear + "</h2>"
    + '<table class="data-table"><thead><tr><th>Indikator</th>' + head + "</tr></thead><tbody>" + rows + "</tbody></table>"
    + '<p class="source">Nilai terbaik per baris: tertinggi, kecuali inflasi dan pengangguran (terendah). ' + esc(SOURCE_NOTE) + "</p></section>";
}

// ---------------- NEGARA ----------------
function viewCountry(state) {
  const q = (state.search || "").toLowerCase();
  const list = COUNTRIES.filter(function (c) {
    return !q || c.name.toLowerCase().indexOf(q) !== -1 || c.nameEn.toLowerCase().indexOf(q) !== -1 || c.id.toLowerCase().indexOf(q) !== -1;
  });
  const c = countryById(state.countryId);
  const year = state.year;
  const tiles = INDICATORS.map(function (ii) {
    const v = valueAt(c, ii.key, year);
    const ey = effectiveYear(ii.key, year);
    return '<div class="stat-card"><span class="stat-label">' + esc(ii.name) + (ey !== year ? " (" + ey + ")" : "") + '</span><span class="stat-value">' + fmtValue(ii.key, v) + '</span><span class="stat-sub">Peringkat #' + rankOf(c.id, ii.key, year) + " dari 12 &middot; " + esc(ii.unit) + "</span></div>";
  }).join("");
  const gdpSeries = seriesFor(c, "gdp");
  const chart = lineChart([{ label: c.name + " — PDB", color: "#0b4f6c", values: gdpSeries.values }], gdpSeries.years);
  const avgRows = ["gdp", "gdppc", "growth", "life"].map(function (key) {
    const ii = indByKey(key);
    const v = valueAt(c, key, year);
    const avg = avgOf(key, year);
    return "<h3>" + esc(ii.name) + " — " + effectiveYear(key, year) + "</h3>" + vsAverageBar(v, avg, key);
  }).join("");
  const chips = list.map(function (x) {
    return '<a class="chip' + (x.id === c.id ? " on" : "") + '" href="#/negara/' + x.id + '">' + x.flag + " " + esc(x.name) + "</a>";
  }).join("") || '<p class="panel-sub">Tidak ada negara yang cocok dengan pencarian itu.</p>';
  return '<section class="panel"><h1>Profil negara</h1>'
    + '<p class="lede small">Cari negara, lalu lihat semua indikatornya beserta peringkatnya di antara 12 negara.</p>'
    + '<div class="toolbar"><label>Cari negara <input type="search" id="countrySearch" data-action="search" placeholder="mis. Jepang, India, USA&hellip;" value="' + esc(state.search || "") + '"></label>'
    + '<label>Pilih <select data-action="countryPick">' + countryOptions(c.id) + "</select></label></div>"
    + '<div class="chip-row">' + chips + "</div></section>"
    + '<section class="panel country-head"><div class="country-title"><span class="big-flag">' + c.flag + '</span><div><h2>' + esc(c.name) + ' <span class="dim">(' + esc(c.nameEn) + ")</span></h2>"
    + "<p>Ibu kota " + esc(c.capital) + " &middot; " + esc(c.region) + " &middot; Mata uang: " + esc(c.currency) + "</p></div></div>"
    + '<div class="stat-grid">' + tiles + "</div></section>"
    + '<section class="panel"><h2>PDB ' + esc(c.name) + ', 2015&ndash;2024</h2><p class="panel-sub">US$ miliar, harga berlaku.</p>' + chart
    + '<p class="source">' + esc(SOURCE_NOTE) + "</p></section>"
    + '<section class="panel"><h2>' + esc(c.name) + ' vs rata-rata 12 negara, ' + year + "</h2>" + avgRows + "</section>";
}

// ---------------- INDIKATOR ----------------
function viewIndicator(state) {
  const ind = indByKey(state.indKey);
  const c = countryById(state.indCountry);
  const year = state.year;
  const effYear = effectiveYear(ind.key, year);
  const s = seriesFor(c, ind.key);
  let chart;
  if (state.indChart === "bar") {
    const bars = COUNTRIES.map(function (x, i) {
      return { label: x.name, value: valueAt(x, ind.key, year), valueText: fmtValue(ind.key, valueAt(x, ind.key, year)), color: x.id === c.id ? "#0b4f6c" : "#9db8c6" };
    }).sort(function (a, b) { return b.value - a.value; });
    chart = barChart(bars);
  } else {
    chart = lineChart([{ label: c.name, color: "#0b4f6c", values: s.values }], s.years);
  }
  const rows = COUNTRIES.slice().sort(function (a, b) { return valueAt(b, ind.key, year) - valueAt(a, ind.key, year); }).map(function (x, i) {
    return "<tr" + (x.id === c.id ? ' class="hl"' : "") + "><td>" + (i + 1) + "</td><td><a href=\"#/negara/" + x.id + "\">" + x.flag + " " + esc(x.name) + "</a></td>"
      + "<td class=\"num\"><b>" + fmtValue(ind.key, valueAt(x, ind.key, year)) + "</b></td></tr>";
  }).join("");
  const buttons = INDICATORS.map(function (ii) {
    return '<button type="button" class="chip' + (ii.key === ind.key ? " on" : "") + '" data-action="indPick" data-v="' + ii.key + '">' + esc(ii.name) + "</button>";
  }).join("");
  return '<section class="panel"><h1>Indikator: ' + esc(ind.name) + '</h1>'
    + '<p class="lede small">' + esc(ind.note) + " Kode WDI: <code>" + esc(ind.code) + "</code>. Satuan: " + esc(ind.unit) + ".</p>"
    + '<div class="chip-row">' + buttons + "</div>"
    + '<div class="toolbar"><label>Negara <select data-action="indCountry">' + countryOptions(c.id) + "</select></label>"
    + '<label>Tahun tabel <select data-action="year">' + yearOptions(year, SHORT_YEARS) + "</select></label>"
    + '<span class="seg" role="group" aria-label="Jenis grafik"><button type="button" data-action="indChart" data-v="line" class="' + (state.indChart === "line" ? "on" : "") + '">Garis</button><button type="button" data-action="indChart" data-v="bar" class="' + (state.indChart === "bar" ? "on" : "") + '">Batang</button></span></div>'
    + "<h2>" + esc(ind.name) + " — " + esc(c.name) + ", " + s.years[0] + "&ndash;" + s.years[s.years.length - 1] + "</h2>"
    + chart
    + "<h2>Semua negara, " + effYear + "</h2>"
    + '<table class="data-table"><thead><tr><th>#</th><th>Negara</th><th class="num">' + esc(ind.name) + "</th></tr></thead><tbody>" + rows + "</tbody></table>"
    + '<p class="source">' + esc(SOURCE_NOTE) + "</p></section>";
}

// ---------------- METODOLOGI & SUMBER ----------------
function viewMethod() {
  const rows = INDICATORS.map(function (ii) {
    return "<tr><td>" + esc(ii.name) + "</td><td><code>" + esc(ii.code) + "</code></td><td>" + ii.years[0] + "&ndash;" + ii.years[ii.years.length - 1] + "</td><td>" + esc(ii.note) + "</td></tr>";
  }).join("");
  return '<section class="panel"><h1>Metodologi &amp; sumber</h1>'
    + '<p class="lede small">Semua angka di situs ini berasal dari satu sumber resmi dan dapat diperiksa ulang. Tidak ada angka contoh, tidak ada estimasi kami sendiri — kecuali PDB per kapita, yang dihitung dari dua seri resmi.</p>'
    + "<h2>Sumber data</h2>"
    + "<p><b>World Bank, World Development Indicators (WDI)</b> — basis data indikator pembangunan Bank Dunia, dikumpulkan dari badan statistik nasional tiap negara dan lembaga internasional (PBB, ILO, IMF). Dataset diunduh 26 November 2026; pembaruan terakhir dataset 11 November 2026.</p>"
    + '<table class="data-table"><thead><tr><th>Indikator</th><th>Kode WDI</th><th>Tahun tersedia</th><th>Catatan</th></tr></thead><tbody>' + rows + "</tbody></table>"
    + "<h2>Cara angka dihitung</h2><ul class=\"method-list\">"
    + "<li><b>PDB per kapita</b> = PDB (US$ berlaku) &divide; penduduk, tahun yang sama. Karena dihitung dari dua seri yang sama, nilainya konsisten di Beranda, Peringkat, Bandingkan, Negara, dan Indikator.</li>"
    + "<li><b>Peringkat</b> = urutan nilai indikator yang sama pada tahun yang sama. Peringkat 1 berarti nilai tertinggi — kecuali inflasi dan pengangguran, yang peringkat 1-nya berarti nilai terendah.</li>"
    + "<li><b>Rata-rata 12 negara</b> = rata-rata aritmetik sederhana dari nilai kedua belas negara, bukan rata-rata tertimbang penduduk.</li>"
    + "<li><b>Total 12 negara</b> (penduduk dan PDB di Beranda) = jumlah dari kedua belas negara pada tahun yang sama.</li>"
    + "<li><b>Harapan hidup</b>: WDI terakhir menerbitkan tahun 2023. Bila Anda memilih tahun 2024, halaman menampilkan nilai 2023 dan menandainya.</li>"
    + "<li><b>Pembulatan</b>: PDB ditampilkan dalam US$ miliar (dua desimal di data, dibulatkan saat tampil); persen dua desimal; harapan hidup dan perkotaan satu desimal.</li>"
    + "</ul>"
    + "<h2>Batasan</h2><ul class=\"method-list\">"
    + "<li>PDB dalam dolar AS dipengaruhi kurs: naik-turunnya PDB nominal sebagian mencerminkan pergerakan mata uang, bukan hanya output riil. Untuk pertumbuhan riil, lihat indikator Pertumbuhan PDB.</li>"
    + "<li>Pengangguran adalah estimasi model ILO, agar antar-negara dapat dibandingkan; angka survei nasional tiap negara bisa sedikit berbeda.</li>"
    + "<li>Definisi “perkotaan” mengikuti definisi nasional masing-masing negara, sehingga tidak sepenuhnya sebanding.</li>"
    + "</ul>"
    + "<h2>Tentang situs ini</h2>"
    + "<p><b>Dunia dalam Angka</b> adalah atlas pembanding statistik 12 negara: Indonesia, Jepang, China, India, Amerika Serikat, Brasil, Jerman, Prancis, Inggris, Kanada, Australia, dan Korea Selatan. Situs ini statis, bekerja tanpa jaringan, dan semua grafik digambar sebagai SVG dari data yang sama. Dibangun untuk kompetisi make.fun “Make the best national statistics site”.</p>"
    + "</section>";
}
