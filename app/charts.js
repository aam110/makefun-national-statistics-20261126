// Dunia dalam Angka — pembangun grafik SVG murni (tanpa library, tanpa network).
// Dua fungsi: lineChart (tren multi-seri) dan barChart (perbandingan antar negara).

const CHART_COLORS = ["#0b4f6c", "#c89b3c", "#2e7d6b", "#8a4b6e", "#4a6fa5", "#b4552d"];

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function niceNum(v) {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  const a = Math.abs(v);
  if (a >= 1e12) return (v / 1e12).toFixed(2).replace(/\.00$/, "") + " T";
  if (a >= 1e9) return (v / 1e9).toFixed(2).replace(/\.00$/, "") + " M";
  if (a >= 1e6) return (v / 1e6).toFixed(1).replace(/\.0$/, "") + " jt";
  if (a >= 1000) return v.toLocaleString("id-ID", { maximumFractionDigits: 0 });
  return String(Math.round(v * 100) / 100);
}

// Grafik garis: series = [{ label, color, values: [n|null,...] }], years = [2015,...]
// Mengembalikan string SVG lengkap dengan sumbu, grid, label, dan legenda.
function lineChart(series, years, opts) {
  opts = opts || {};
  const W = opts.width || 760;
  const H = opts.height || 300;
  const padL = 64, padR = 16, padT = 14, padB = 30;
  const iw = W - padL - padR, ih = H - padT - padB;
  let min = Infinity, max = -Infinity;
  series.forEach(function (s) {
    s.values.forEach(function (v) {
      if (v !== null && v !== undefined) { if (v < min) min = v; if (v > max) max = v; }
    });
  });
  if (!isFinite(min)) { min = 0; max = 1; }
  if (max === min) { max = min + 1; }
  const span = max - min;
  min -= span * 0.08; max += span * 0.08;
  function X(i) { return padL + (years.length === 1 ? iw / 2 : (i / (years.length - 1)) * iw); }
  function Y(v) { return padT + ih - ((v - min) / (max - min)) * ih; }
  let out = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Grafik garis" class="chart-svg">';
  const ticks = 4;
  for (let t = 0; t <= ticks; t++) {
    const v = min + ((max - min) * t) / ticks;
    const y = Y(v);
    out += '<line x1="' + padL + '" y1="' + y.toFixed(1) + '" x2="' + (W - padR) + '" y2="' + y.toFixed(1) + '" class="grid"/>';
    out += '<text x="' + (padL - 8) + '" y="' + (y + 4).toFixed(1) + '" class="axis" text-anchor="end">' + esc(niceNum(v)) + '</text>';
  }
  years.forEach(function (yr, i) {
    if (i % Math.ceil(years.length / 6) === 0 || i === years.length - 1) {
      out += '<text x="' + X(i).toFixed(1) + '" y="' + (H - 8) + '" class="axis" text-anchor="middle">' + yr + '</text>';
    }
  });
  series.forEach(function (s, si) {
    let d = "", pts = [];
    s.values.forEach(function (v, i) {
      if (v === null || v === undefined) return;
      const x = X(i), y = Y(v);
      d += (d === "" ? "M" : " L") + x.toFixed(1) + " " + y.toFixed(1);
      pts.push([x, y]);
    });
    if (d) out += '<path d="' + d + '" fill="none" stroke="' + s.color + '" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>';
    pts.forEach(function (p) {
      out += '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="3.5" fill="' + s.color + '" stroke="#fff" stroke-width="1.5"/>';
    });
  });
  out += "</svg>";
  return out;
}

// Grafik batang: items = [{ label, value, color }], horizontal.
// Mengembalikan string SVG dengan label negara, nilai, dan skala.
function barChart(items, opts) {
  opts = opts || {};
  const W = opts.width || 760;
  const rowH = opts.rowH || 30;
  const H = items.length * rowH + 34;
  const padL = 132, padR = 76, padT = 8, padB = 26;
  const iw = W - padL - padR;
  let max = 0;
  items.forEach(function (it) { if (it.value > max) max = it.value; });
  if (max === 0) max = 1;
  let out = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Grafik batang" class="chart-svg">';
  for (let t = 0; t <= 4; t++) {
    const x = padL + (iw * t) / 4;
    out += '<line x1="' + x.toFixed(1) + '" y1="' + padT + '" x2="' + x.toFixed(1) + '" y2="' + (H - padB) + '" class="grid"/>';
    out += '<text x="' + x.toFixed(1) + '" y="' + (H - 8) + '" class="axis" text-anchor="middle">' + esc(niceNum((max * t) / 4)) + '</text>';
  }
  items.forEach(function (it, i) {
    const y = padT + i * rowH + 5;
    const w = Math.max(2, (it.value / max) * iw);
    out += '<text x="' + (padL - 8) + '" y="' + (y + 13) + '" class="bar-label" text-anchor="end">' + esc(it.label) + '</text>';
    out += '<rect x="' + padL + '" y="' + y + '" width="' + w.toFixed(1) + '" height="18" rx="3" fill="' + it.color + '"/>';
    const vt = esc(it.valueText || niceNum(it.value));
    if (w > 170) {
      out += '<text x="' + (padL + w - 8).toFixed(1) + '" y="' + (y + 13) + '" class="bar-value-in" text-anchor="end">' + vt + '</text>';
    } else {
      out += '<text x="' + (padL + w + 8).toFixed(1) + '" y="' + (y + 13) + '" class="bar-value">' + vt + '</text>';
    }
  });
  out += "</svg>";
  return out;
}

// Batang perbandingan sederhana untuk satu negara vs rata-rata 12 negara.
// indKey adalah kunci indikator (pop/gdp/gdppc/growth/infl/unemp/life/urban).
function vsAverageBar(value, avg, indKey) {
  const max = Math.max(value, avg) * 1.15;
  const pct = function (v) { return Math.max(2, (v / max) * 100).toFixed(1); };
  return '<div class="vsavg">'
    + '<div class="vsavg-row"><span class="vsavg-label">Negara ini</span><div class="vsavg-track"><div class="vsavg-fill country" style="width:' + pct(value) + '%"></div></div><b>' + esc(fmtValue(indKey, value)) + '</b></div>'
    + '<div class="vsavg-row"><span class="vsavg-label">Rata-rata 12 negara</span><div class="vsavg-track"><div class="vsavg-fill avg" style="width:' + pct(avg) + '%"></div></div><b>' + esc(fmtValue(indKey, avg)) + '</b></div>'
    + "</div>";
}
