// Dunia dalam Angka — router hash, state bersama, dan wiring kontrol.
// Semua halaman dirender dari views.js; state (tahun, pilihan) bertahan saat
// berpindah halaman supaya angka konsisten antar halaman.

const state = {
  year: 2024,
  rankInd: "gdp",
  rankDir: "desc",
  cmp: ["IDN", "JPN", "USA"],
  cmpInd: "gdp",
  cmpChart: "line",
  countryId: "IDN",
  search: "",
  indKey: "gdp",
  indCountry: "IDN",
  indChart: "line"
};

function currentRoute() {
  const h = (window.location.hash || "#/").replace(/^#/, "");
  const parts = h.split("/").filter(function (p) { return p !== ""; });
  return { page: parts[0] || "home", arg: parts[1] || null };
}

function render() {
  const r = currentRoute();
  const app = document.getElementById("app");
  const nav = document.querySelectorAll(".nav-link");
  nav.forEach(function (a) { a.classList.remove("active"); });
  let html = "";
  if (r.page === "peringkat") {
    html = viewRank(state);
    markNav("peringkat");
  } else if (r.page === "bandingkan") {
    html = viewCompare(state);
    markNav("bandingkan");
  } else if (r.page === "negara") {
    if (r.arg && countryById(r.arg)) state.countryId = r.arg;
    html = viewCountry(state);
    markNav("negara");
  } else if (r.page === "indikator") {
    html = viewIndicator(state);
    markNav("indikator");
  } else if (r.page === "metodologi") {
    html = viewMethod();
    markNav("metodologi");
  } else {
    html = viewHome(state);
    markNav("home");
  }
  app.innerHTML = html;
  window.scrollTo(0, 0);
}

function markNav(page) {
  const nav = document.querySelectorAll(".nav-link");
  nav.forEach(function (a) {
    if (a.getAttribute("data-page") === page) a.classList.add("active");
  });
}

function rerenderKeepSearchFocus() {
  const hadFocus = document.activeElement && document.activeElement.id === "countrySearch";
  const pos = hadFocus ? document.activeElement.selectionStart : 0;
  render();
  if (hadFocus) {
    const el = document.getElementById("countrySearch");
    if (el) { el.focus(); try { el.setSelectionRange(pos, pos); } catch (e) { /* abaikan */ } }
  }
}

document.addEventListener("change", function (e) {
  const t = e.target;
  const action = t.getAttribute && t.getAttribute("data-action");
  if (!action) return;
  if (action === "year") { state.year = Number(t.value); render(); }
  else if (action === "rankInd") { state.rankInd = t.value; render(); }
  else if (action === "cmpInd") { state.cmpInd = t.value; render(); }
  else if (action === "cmpCountry") {
    const idx = Number(t.getAttribute("data-idx"));
    state.cmp[idx] = t.value;
    render();
  } else if (action === "countryPick") {
    state.countryId = t.value;
    window.location.hash = "#/negara/" + t.value;
    render();
  } else if (action === "indCountry") { state.indCountry = t.value; render(); }
});

document.addEventListener("input", function (e) {
  const t = e.target;
  if (t.getAttribute && t.getAttribute("data-action") === "search") {
    state.search = t.value;
    rerenderKeepSearchFocus();
  }
});

document.addEventListener("click", function (e) {
  const t = e.target.closest ? e.target.closest("[data-action]") : null;
  if (!t) return;
  const action = t.getAttribute("data-action");
  if (action === "rankDir" || action === "sortRank") {
    state.rankDir = state.rankDir === "desc" ? "asc" : "desc";
    render();
  } else if (action === "cmpChart") {
    state.cmpChart = t.getAttribute("data-v");
    render();
  } else if (action === "indChart") {
    state.indChart = t.getAttribute("data-v");
    render();
  } else if (action === "indPick") {
    state.indKey = t.getAttribute("data-v");
    render();
  }
});

window.addEventListener("hashchange", render);
render();
