// Forex Journal – shared utilities
// LocalStorage keys
const STORAGE = {
  journal: 'fx.journal.v1',
  positions: 'fx.positions.v1',
  fundamentals: 'fx.fundamentals.v1',
  sentiment: 'fx.sentiment.v1',
  weekly: 'fx.weekly.v1',
  preparation: 'fx.preparation.v1',
};

const load = (k, def = []) => {
  try { const v = JSON.parse(localStorage.getItem(k)); return v ?? def; }
  catch { return def; }
};
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

const fmtDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
};
const fmtDateShort = (iso) => new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });
const todayISO = () => new Date().toISOString().slice(0, 10);
const getWeek = (dateISO) => {
  const d = new Date(dateISO);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return `${d.getFullYear()}-S${String(Math.ceil((((d - yearStart) / 86400000) + 1) / 7)).padStart(2, '0')}`;
};

const fileToBase64 = (file) => new Promise((res, rej) => {
  const r = new FileReader();
  r.onload = () => res(r.result);
  r.onerror = rej;
  r.readAsDataURL(file);
});

// Compress image to max dimension to keep localStorage light
const compressImage = (file, maxDim = 1400, quality = 0.82) => new Promise(async (res) => {
  const dataUrl = await fileToBase64(file);
  const img = new Image();
  img.onload = () => {
    let { width, height } = img;
    const ratio = Math.min(1, maxDim / Math.max(width, height));
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
    const c = document.createElement('canvas');
    c.width = width; c.height = height;
    c.getContext('2d').drawImage(img, 0, 0, width, height);
    res(c.toDataURL('image/jpeg', quality));
  };
  img.src = dataUrl;
});

const toast = (msg) => {
  let t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(window.__toastT);
  window.__toastT = setTimeout(() => t.classList.remove('show'), 2200);
};

// Build sidebar + topbar
function mountLayout({ page, title, subtitle, actions = '' }) {
  document.body.innerHTML = `
    <div class="app">
      <aside class="sidebar" id="sidebar">
        <div class="brand">
          <div class="brand-logo">FX</div>
          <div>
            <div>FX Journal</div>
            <div class="dim" style="font-size:11px;font-weight:500">Trading performance suite</div>
          </div>
        </div>
        <nav class="nav">
          <div class="sect">Journal</div>
          <a href="index.html" data-p="dashboard">📊  Dashboard</a>
          <a href="journal.html" data-p="journal">📓  Journal quotidien</a>
          <a href="bilan.html" data-p="bilan">📅  Bilan hebdomadaire</a>
          <div class="sect">Préparation</div>
          <a href="preparation.html" data-p="preparation">🗓️  Préparation de la semaine</a>
          <div class="sect">Analyse</div>
          <a href="positions.html" data-p="positions">📈  Positions & captures</a>
          <a href="fondamentaux.html" data-p="fondamentaux">📰  Rapports fondamentaux</a>
          <a href="sentiment.html" data-p="sentiment">🌡️  Sentiment de marché</a>
          <div class="sect">Données</div>
          <a href="#" id="exportBtn">⬇️  Exporter (JSON)</a>
          <a href="#" id="importBtn">⬆️  Importer</a>
          <input type="file" id="importFile" accept="application/json" hidden />
        </nav>
        <div style="margin-top:auto;font-size:11.5px;color:var(--text-muted);line-height:1.5">
          Données stockées localement<br>dans votre navigateur.
        </div>
      </aside>
      <main class="main">
        <div class="topbar">
          <div>
            <button class="btn btn-sm menu-btn" id="menuBtn">☰</button>
            <div class="page-title">${title}</div>
            ${subtitle ? `<div class="page-sub">${subtitle}</div>` : ''}
          </div>
          <div class="topbar-actions">${actions}</div>
        </div>
        <div id="content"></div>
      </main>
    </div>
  `;
  document.querySelectorAll('.nav a[data-p]').forEach(a => {
    if (a.dataset.p === page) a.classList.add('active');
  });
  document.getElementById('menuBtn')?.addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });
  document.getElementById('exportBtn').addEventListener('click', (e) => { e.preventDefault(); exportAll(); });
  document.getElementById('importBtn').addEventListener('click', (e) => { e.preventDefault(); document.getElementById('importFile').click(); });
  document.getElementById('importFile').addEventListener('change', onImport);
}

function exportAll() {
  const data = {};
  Object.entries(STORAGE).forEach(([k, v]) => data[k] = load(v, []));
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `fx-journal-${todayISO()}.json`;
  a.click();
  toast('Export téléchargé');
}
function onImport(e) {
  const file = e.target.files?.[0]; if (!file) return;
  const r = new FileReader();
  r.onload = () => {
    try {
      const data = JSON.parse(r.result);
      Object.entries(STORAGE).forEach(([k, v]) => { if (data[k]) save(v, data[k]); });
      toast('Import réussi – rechargez la page');
    } catch { toast('Fichier invalide'); }
  };
  r.readAsText(file);
}

// Pairs & instruments
const PAIRS_FX = ['EUR/USD','GBP/USD','USD/JPY','AUD/USD','USD/CAD','USD/CHF','NZD/USD','EUR/JPY','GBP/JPY','EUR/GBP','EUR/CHF','AUD/JPY','CAD/JPY','CHF/JPY','NZD/JPY','AUD/NZD','EUR/AUD','EUR/CAD','EUR/NZD','GBP/AUD','GBP/CAD','GBP/CHF','GBP/NZD'];
const COMMODITIES = ['XAU/USD (Or)','XAG/USD (Argent)','WTI Oil','Brent Oil','Nat Gas','Copper','Platine'];
const INDICES = ['US30','NAS100','SPX500','GER40','UK100','FRA40','JPN225'];
const ALL_INSTRUMENTS = [...PAIRS_FX, ...COMMODITIES, ...INDICES];
