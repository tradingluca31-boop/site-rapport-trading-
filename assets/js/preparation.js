// Préparation de la semaine – événements macro jour par jour
mountLayout({
  page: 'preparation',
  title: 'Préparation de la semaine',
  subtitle: 'Planifie chaque jour : annonces macro, pays, niveau d\'impact.',
  actions: `<button class="btn" id="prevW">← Semaine préc.</button>
            <button class="btn" id="nextW">Semaine suiv. →</button>
            <button class="btn btn-primary" id="todayBtn">📅 Cette semaine</button>`
});

const c = document.getElementById('content');

// Pays principaux (clé = code, drapeau, monnaie associée)
const COUNTRIES = [
  { code: 'US',  flag: '🇺🇸', name: 'États-Unis',   currency: 'USD' },
  { code: 'EU',  flag: '🇪🇺', name: 'Zone Euro',    currency: 'EUR' },
  { code: 'UK',  flag: '🇬🇧', name: 'Royaume-Uni',  currency: 'GBP' },
  { code: 'JP',  flag: '🇯🇵', name: 'Japon',        currency: 'JPY' },
  { code: 'CH',  flag: '🇨🇭', name: 'Suisse',       currency: 'CHF' },
  { code: 'CA',  flag: '🇨🇦', name: 'Canada',       currency: 'CAD' },
  { code: 'AU',  flag: '🇦🇺', name: 'Australie',    currency: 'AUD' },
  { code: 'NZ',  flag: '🇳🇿', name: 'Nouvelle-Z.',  currency: 'NZD' },
  { code: 'CN',  flag: '🇨🇳', name: 'Chine',        currency: 'CNY' },
  { code: 'DE',  flag: '🇩🇪', name: 'Allemagne',    currency: 'EUR' },
  { code: 'FR',  flag: '🇫🇷', name: 'France',       currency: 'EUR' },
  { code: 'GLB', flag: '🌐', name: 'Global / OPEP', currency: 'XAU' },
];

// Suggestions d'annonces à impact élevé (templates rapides)
const EVENT_TEMPLATES = [
  { country: 'US', title: 'NFP (Non-Farm Payrolls)', impact: 'high', time: '14:30' },
  { country: 'US', title: 'CPI (inflation)', impact: 'high', time: '14:30' },
  { country: 'US', title: 'Core PCE', impact: 'high', time: '14:30' },
  { country: 'US', title: 'FOMC – décision de taux', impact: 'high', time: '20:00' },
  { country: 'US', title: 'FOMC – conférence Powell', impact: 'high', time: '20:30' },
  { country: 'US', title: 'Retail Sales', impact: 'medium', time: '14:30' },
  { country: 'US', title: 'PMI Manufacturier ISM', impact: 'medium', time: '16:00' },
  { country: 'US', title: 'Unemployment Claims', impact: 'medium', time: '14:30' },
  { country: 'US', title: 'Stocks pétrole (EIA)', impact: 'medium', time: '16:30' },
  { country: 'EU', title: 'BCE – décision de taux', impact: 'high', time: '14:15' },
  { country: 'EU', title: 'BCE – conférence Lagarde', impact: 'high', time: '14:45' },
  { country: 'EU', title: 'CPI Zone Euro', impact: 'high', time: '11:00' },
  { country: 'DE', title: 'IFO / ZEW', impact: 'medium', time: '10:00' },
  { country: 'UK', title: 'BoE – décision de taux', impact: 'high', time: '13:00' },
  { country: 'UK', title: 'CPI UK', impact: 'high', time: '08:00' },
  { country: 'UK', title: 'PIB UK', impact: 'medium', time: '08:00' },
  { country: 'JP', title: 'BoJ – décision de taux', impact: 'high', time: '04:00' },
  { country: 'JP', title: 'CPI Tokyo', impact: 'medium', time: '00:30' },
  { country: 'CH', title: 'SNB – décision de taux', impact: 'high', time: '09:30' },
  { country: 'CA', title: 'BoC – décision de taux', impact: 'high', time: '15:45' },
  { country: 'CA', title: 'CPI Canada', impact: 'high', time: '14:30' },
  { country: 'CA', title: 'Emploi Canada', impact: 'high', time: '14:30' },
  { country: 'AU', title: 'RBA – décision de taux', impact: 'high', time: '05:30' },
  { country: 'AU', title: 'Emploi Australie', impact: 'medium', time: '02:30' },
  { country: 'NZ', title: 'RBNZ – décision de taux', impact: 'high', time: '03:00' },
  { country: 'CN', title: 'PMI Caixin', impact: 'medium', time: '03:45' },
  { country: 'GLB', title: 'Réunion OPEP+', impact: 'high', time: '—' },
  { country: 'GLB', title: 'Stocks pétrole (API)', impact: 'medium', time: '22:30' },
];

const DAYS = [
  { i: 1, l: 'Lundi' },
  { i: 2, l: 'Mardi' },
  { i: 3, l: 'Mercredi' },
  { i: 4, l: 'Jeudi' },
  { i: 5, l: 'Vendredi' },
  { i: 6, l: 'Samedi' },
  { i: 0, l: 'Dimanche' },
];

let items = load(STORAGE.preparation, []);
let currentWeek = weekKeyFromDate(new Date());

function weekKeyFromDate(d) {
  const dt = new Date(d);
  dt.setHours(0, 0, 0, 0);
  dt.setDate(dt.getDate() + 4 - (dt.getDay() || 7));
  const yearStart = new Date(dt.getFullYear(), 0, 1);
  const wn = Math.ceil((((dt - yearStart) / 86400000) + 1) / 7);
  return `${dt.getFullYear()}-S${String(wn).padStart(2, '0')}`;
}
function mondayOfWeekKey(wk) {
  const [y, s] = wk.split('-S').map(Number);
  const jan4 = new Date(y, 0, 4);
  const jan4Day = jan4.getDay() || 7;
  const monW1 = new Date(jan4); monW1.setDate(jan4.getDate() - (jan4Day - 1));
  const monday = new Date(monW1); monday.setDate(monW1.getDate() + (s - 1) * 7);
  return monday;
}
function shiftWeek(delta) {
  const monday = mondayOfWeekKey(currentWeek);
  monday.setDate(monday.getDate() + delta * 7);
  currentWeek = weekKeyFromDate(monday);
  render();
}
function dateForDay(weekKey, weekday) {
  const monday = mondayOfWeekKey(weekKey);
  const offset = weekday === 0 ? 6 : weekday - 1;
  const d = new Date(monday); d.setDate(monday.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

// Ensure structure exists for current week
function ensureWeek(wk) {
  let w = items.find(x => x.week === wk);
  if (!w) {
    w = {
      id: uid(),
      week: wk,
      weekPlan: '',
      keyPairs: [],
      bias: '',
      days: {}, // { "YYYY-MM-DD": { plan: '', events: [...] } }
      createdAt: new Date().toISOString(),
    };
    DAYS.forEach(d => {
      const iso = dateForDay(wk, d.i);
      w.days[iso] = { plan: '', events: [] };
    });
    items.unshift(w);
    save(STORAGE.preparation, items);
  } else {
    // Ensure all days are present
    DAYS.forEach(d => {
      const iso = dateForDay(wk, d.i);
      if (!w.days[iso]) w.days[iso] = { plan: '', events: [] };
    });
  }
  return w;
}

function render() {
  document.getElementById('prevW').onclick = () => shiftWeek(-1);
  document.getElementById('nextW').onclick = () => shiftWeek(1);
  document.getElementById('todayBtn').onclick = () => { currentWeek = weekKeyFromDate(new Date()); render(); };

  const w = ensureWeek(currentWeek);
  const monday = mondayOfWeekKey(currentWeek);
  const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6);
  const rangeLbl = `${monday.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' })} → ${sunday.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}`;

  const totalEvents = Object.values(w.days).reduce((s, d) => s + (d.events?.length || 0), 0);
  const highImpact = Object.values(w.days).reduce((s, d) => s + (d.events?.filter(e => e.impact === 'high').length || 0), 0);

  c.innerHTML = `
    <div class="card" style="margin-bottom:16px">
      <div class="row" style="margin-bottom:6px">
        <h3 style="margin:0">Semaine ${currentWeek}</h3>
        <span class="dim">· ${rangeLbl}</span>
        <div class="spacer"></div>
        <span class="badge info">${totalEvents} événement(s)</span>
        <span class="badge neg">${highImpact} à fort impact</span>
      </div>

      <div class="grid grid-2" style="margin-top:14px">
        <div class="field">
          <label>🎯 Plan général de la semaine</label>
          <textarea class="textarea" id="weekPlan" placeholder="Thèmes dominants, biais macro, pairs prioritaires, ce qu'il faut surveiller...">${w.weekPlan || ''}</textarea>
        </div>
        <div>
          <div class="field">
            <label>⚖️ Biais dominant</label>
            <select class="select" id="weekBias">
              <option value="">—</option>
              <option value="risk_on"  ${w.bias === 'risk_on'  ? 'selected' : ''}>🟢 Risk-On</option>
              <option value="risk_off" ${w.bias === 'risk_off' ? 'selected' : ''}>🔴 Risk-Off</option>
              <option value="mixed"    ${w.bias === 'mixed'    ? 'selected' : ''}>🟡 Mixte</option>
              <option value="usd_bull" ${w.bias === 'usd_bull' ? 'selected' : ''}>💵 USD Bullish</option>
              <option value="usd_bear" ${w.bias === 'usd_bear' ? 'selected' : ''}>💵 USD Bearish</option>
            </select>
          </div>
          <div class="field">
            <label>📌 Paires / instruments prioritaires</label>
            <input type="text" class="input" id="keyPairs" value="${(w.keyPairs || []).join(', ')}" placeholder="Ex : EUR/USD, XAU/USD, USD/JPY, WTI" />
          </div>
        </div>
      </div>
    </div>

    <div id="days"></div>
  `;

  // Wire weekly inputs
  document.getElementById('weekPlan').oninput = (e) => { w.weekPlan = e.target.value; save(STORAGE.preparation, items); };
  document.getElementById('weekBias').onchange = (e) => { w.bias = e.target.value; save(STORAGE.preparation, items); };
  document.getElementById('keyPairs').oninput = (e) => {
    w.keyPairs = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
    save(STORAGE.preparation, items);
  };

  renderDays(w);
}

function renderDays(w) {
  const container = document.getElementById('days');
  container.innerHTML = DAYS.map(d => {
    const iso = dateForDay(currentWeek, d.i);
    const day = w.days[iso];
    const dateObj = new Date(iso);
    const isToday = iso === todayISO();
    const isWeekend = d.i === 0 || d.i === 6;
    const sortedEvents = [...(day.events || [])].sort((a, b) => (a.time || '').localeCompare(b.time || ''));

    return `
      <div class="card" style="margin-bottom:14px;${isToday ? 'border-color:rgba(16,185,129,.5);box-shadow:0 0 0 2px rgba(16,185,129,.15), var(--shadow)' : ''}">
        <div class="row" style="margin-bottom:10px">
          <div>
            <div style="font-size:16px;font-weight:700">
              ${d.l} ${dateObj.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' })}
              ${isToday ? '<span class="badge pos" style="margin-left:8px">Aujourd\'hui</span>' : ''}
              ${isWeekend ? '<span class="badge" style="margin-left:6px">Weekend</span>' : ''}
            </div>
          </div>
          <div class="spacer"></div>
          <span class="badge info">${sortedEvents.length} annonce(s)</span>
          <button class="btn btn-sm btn-primary" data-add="${iso}">+ Annonce</button>
          <button class="btn btn-sm" data-template="${iso}">⚡ Template</button>
        </div>

        <div class="field" style="margin-bottom:10px">
          <label style="font-size:12px">Notes / plan du jour</label>
          <textarea class="textarea" data-plan="${iso}" style="min-height:60px" placeholder="Biais, setups à surveiller, niveaux clés, précautions...">${day.plan || ''}</textarea>
        </div>

        ${sortedEvents.length ? `
          <div class="ev-list">
            ${sortedEvents.map(ev => evCard(iso, ev)).join('')}
          </div>
        ` : `<div class="dim" style="padding:10px 0;font-size:13px">Aucune annonce prévue ce jour.</div>`}

        <div id="form-${iso}"></div>
      </div>
    `;
  }).join('');

  // Wire day plans
  container.querySelectorAll('[data-plan]').forEach(ta => {
    ta.oninput = (e) => {
      const iso = ta.dataset.plan;
      w.days[iso].plan = e.target.value;
      save(STORAGE.preparation, items);
    };
  });
  container.querySelectorAll('[data-add]').forEach(b => b.onclick = () => showEventForm(w, b.dataset.add));
  container.querySelectorAll('[data-template]').forEach(b => b.onclick = () => showTemplatePicker(w, b.dataset.template));
  container.querySelectorAll('[data-del-ev]').forEach(b => b.onclick = () => {
    const [iso, evId] = b.dataset.delEv.split('|');
    if (!confirm('Supprimer cet événement (et ses scénarios) ?')) return;
    w.days[iso].events = w.days[iso].events.filter(e => e.id !== evId);
    save(STORAGE.preparation, items);
    renderDays(w);
  });
  container.querySelectorAll('[data-edit-ev]').forEach(b => b.onclick = () => {
    const [iso, evId] = b.dataset.editEv.split('|');
    const ev = w.days[iso].events.find(x => x.id === evId);
    if (ev) showEventForm(w, iso, ev);
  });

  // Scenarios wiring
  container.querySelectorAll('[data-toggle-sc]').forEach(b => b.onclick = () => {
    const [iso, evId] = b.dataset.toggleSc.split('|');
    const box = document.getElementById(`sc-${iso}-${evId}`);
    box.style.display = box.style.display === 'none' ? 'block' : 'none';
  });
  container.querySelectorAll('[data-add-sc]').forEach(b => b.onclick = () => {
    const [iso, evId] = b.dataset.addSc.split('|');
    showScenarioForm(w, iso, evId);
  });
  container.querySelectorAll('[data-edit-sc]').forEach(b => b.onclick = () => {
    const [iso, evId, scId] = b.dataset.editSc.split('|');
    const ev = w.days[iso].events.find(x => x.id === evId);
    const sc = ev?.scenarios?.find(x => x.id === scId);
    if (sc) showScenarioForm(w, iso, evId, sc);
  });
  container.querySelectorAll('[data-del-sc]').forEach(b => b.onclick = () => {
    const [iso, evId, scId] = b.dataset.delSc.split('|');
    if (!confirm('Supprimer ce scénario ?')) return;
    const ev = w.days[iso].events.find(x => x.id === evId);
    ev.scenarios = (ev.scenarios || []).filter(s => s.id !== scId);
    save(STORAGE.preparation, items);
    renderDays(w);
  });
  container.querySelectorAll('[data-preset-sc]').forEach(b => b.onclick = () => {
    const [iso, evId] = b.dataset.presetSc.split('|');
    addHotColdPreset(w, iso, evId);
  });
}

function showScenarioForm(w, iso, evId, editing = null) {
  const ev = w.days[iso].events.find(x => x.id === evId);
  const holder = document.getElementById(`sc-form-${iso}-${evId}`);
  const curr = ev.currency || (COUNTRIES.find(c => c.code === ev.country)?.currency) || '';
  holder.innerHTML = `
    <div class="card" style="margin-top:8px;background:rgba(16,185,129,.04)">
      <h3>${editing ? 'Modifier' : 'Nouveau'} scénario — ${ev.title}</h3>
      <div class="grid grid-2">
        <div class="field">
          <label>Condition déclencheuse</label>
          <input type="text" class="input" id="scCond" value="${editing?.condition || ''}" placeholder="Ex : CPI > 3.3% (hotter) / Hawkish / Miss" />
        </div>
        <div class="field">
          <label>Biais attendu</label>
          <select class="select" id="scBias">
            <option value="">—</option>
            <option value="bullish" ${editing?.bias === 'bullish' ? 'selected' : ''}>🟢 Bullish ${curr}</option>
            <option value="bearish" ${editing?.bias === 'bearish' ? 'selected' : ''}>🔴 Bearish ${curr}</option>
            <option value="neutral" ${editing?.bias === 'neutral' ? 'selected' : ''}>⚪ Neutre / range</option>
          </select>
        </div>
      </div>
      <div class="field">
        <label>Paires / instruments à trader</label>
        <input type="text" class="input" id="scPairs" value="${(editing?.pairs || []).join(', ')}" placeholder="Ex : EUR/USD, XAU/USD, USD/JPY" />
      </div>
      <div class="field">
        <label>Plan d'action</label>
        <textarea class="textarea" id="scPlan" placeholder="Attendre la clôture M15, chercher pullback sur résistance, risque 0.5%, viser 2R...">${editing?.plan || ''}</textarea>
      </div>
      <div class="grid grid-2">
        <div class="field">
          <label>📌 Niveaux clés</label>
          <input type="text" class="input" id="scLevels" value="${editing?.levels || ''}" placeholder="Ex : Support 1.0820 / Résistance 1.0880" />
        </div>
        <div class="field">
          <label>🚫 Invalidation</label>
          <input type="text" class="input" id="scInv" value="${editing?.invalidation || ''}" placeholder="Ex : Clôture D1 sous 1.0800" />
        </div>
      </div>
      <div class="row">
        <button class="btn" id="scCancel">Annuler</button>
        <div class="spacer"></div>
        <button class="btn btn-primary" id="scSave">${editing ? 'Enregistrer' : 'Ajouter'}</button>
      </div>
    </div>
  `;

  document.getElementById('scCancel').onclick = () => holder.innerHTML = '';
  document.getElementById('scSave').onclick = () => {
    const sc = {
      id: editing?.id || uid(),
      condition: document.getElementById('scCond').value.trim(),
      bias: document.getElementById('scBias').value,
      pairs: document.getElementById('scPairs').value.split(',').map(s => s.trim()).filter(Boolean),
      plan: document.getElementById('scPlan').value,
      levels: document.getElementById('scLevels').value.trim(),
      invalidation: document.getElementById('scInv').value.trim(),
    };
    if (!sc.condition && !sc.plan) return toast('Condition ou plan requis');
    ev.scenarios = ev.scenarios || [];
    if (editing) {
      ev.scenarios = ev.scenarios.map(x => x.id === editing.id ? sc : x);
    } else {
      ev.scenarios.push(sc);
    }
    save(STORAGE.preparation, items);
    toast('Scénario enregistré');
    renderDays(w);
  };
}

function addHotColdPreset(w, iso, evId) {
  const ev = w.days[iso].events.find(x => x.id === evId);
  const curr = ev.currency || (COUNTRIES.find(c => c.code === ev.country)?.currency) || '';
  ev.scenarios = ev.scenarios || [];
  ev.scenarios.push(
    {
      id: uid(),
      condition: `Chiffre > prévu (hot / hawkish)`,
      bias: 'bullish',
      pairs: [],
      plan: `${curr} fort : attendre le choc, puis chercher un pullback avec structure en ${curr}+. Risque fixe, viser 2R minimum.`,
      levels: '',
      invalidation: '',
    },
    {
      id: uid(),
      condition: `Chiffre < prévu (cold / dovish)`,
      bias: 'bearish',
      pairs: [],
      plan: `${curr} faible : attendre confirmation, chercher un pullback avec structure en ${curr}-. Risque fixe, viser 2R minimum.`,
      levels: '',
      invalidation: '',
    },
    {
      id: uid(),
      condition: `Chiffre en ligne / réaction confuse`,
      bias: 'neutral',
      pairs: [],
      plan: `Pas de trade forcé. Observer 30min, attendre un rebond net de volatilité et une structure claire.`,
      levels: '',
      invalidation: '',
    },
  );
  save(STORAGE.preparation, items);
  toast('3 scénarios ajoutés (Hot/Cold/Neutre)');
  renderDays(w);
}

function evCard(iso, ev) {
  const country = COUNTRIES.find(c => c.code === ev.country) || { flag: '🏳️', name: ev.country, currency: '' };
  const impactBadge = ev.impact === 'high'   ? '<span class="badge neg">🔴 Élevé</span>'
                    : ev.impact === 'medium' ? '<span class="badge warn">🟠 Moyen</span>'
                    : '<span class="badge">🟢 Faible</span>';
  const currency = ev.currency || country.currency || '';
  const scenarios = ev.scenarios || [];

  return `
    <div class="ev-card" data-ev="${iso}|${ev.id}">
      <div class="ev-head">
        <div class="ev-time"><b>${ev.time || '—'}</b></div>
        <div class="ev-country">${country.flag} <span>${country.name}</span></div>
        <div class="ev-title">
          <div style="font-weight:600">${ev.title}</div>
          ${ev.forecast || ev.previous ? `<div class="dim" style="font-size:11.5px;margin-top:2px">
            ${ev.forecast ? `Prévu : <b>${ev.forecast}</b>` : ''}
            ${ev.previous ? ` · Précédent : <b>${ev.previous}</b>` : ''}
          </div>` : ''}
          ${ev.note ? `<div class="dim" style="font-size:12px;margin-top:2px">${ev.note}</div>` : ''}
        </div>
        <div class="ev-tags">${impactBadge} ${currency ? `<span class="badge info">${currency}</span>` : ''}</div>
        <div class="ev-actions">
          <button class="btn btn-sm" data-toggle-sc="${iso}|${ev.id}">🎬 Scénarios${scenarios.length ? ` (${scenarios.length})` : ''}</button>
          <button class="btn btn-sm" data-edit-ev="${iso}|${ev.id}">✏️</button>
          <button class="btn btn-sm btn-danger" data-del-ev="${iso}|${ev.id}">✕</button>
        </div>
      </div>
      <div class="ev-scenarios" id="sc-${iso}-${ev.id}" style="display:${scenarios.length ? 'block' : 'none'}">
        ${renderScenarios(iso, ev)}
      </div>
    </div>
  `;
}

function renderScenarios(iso, ev) {
  const scenarios = ev.scenarios || [];
  const items = scenarios.length ? scenarios.map(sc => {
    const biasBadge = sc.bias === 'bullish' ? '<span class="badge pos">🟢 Bullish</span>'
                   : sc.bias === 'bearish' ? '<span class="badge neg">🔴 Bearish</span>'
                   : sc.bias === 'neutral' ? '<span class="badge">⚪ Neutre</span>'
                   : '<span class="badge info">🎯 Plan</span>';
    return `
      <div class="sc-item">
        <div class="sc-head">
          <span class="sc-cond">${sc.condition || 'Scénario'}</span>
          ${biasBadge}
          ${sc.pairs?.length ? `<span class="badge">${sc.pairs.join(' · ')}</span>` : ''}
          <div class="spacer"></div>
          <button class="btn btn-sm" data-edit-sc="${iso}|${ev.id}|${sc.id}">✏️</button>
          <button class="btn btn-sm btn-danger" data-del-sc="${iso}|${ev.id}|${sc.id}">✕</button>
        </div>
        ${sc.plan ? `<div class="sc-plan">${sc.plan}</div>` : ''}
        ${sc.levels ? `<div class="sc-levels"><b>📌 Niveaux :</b> ${sc.levels}</div>` : ''}
        ${sc.invalidation ? `<div class="sc-inv"><b>🚫 Invalidation :</b> ${sc.invalidation}</div>` : ''}
      </div>
    `;
  }).join('') : '<div class="dim" style="font-size:13px;padding:4px 0 10px">Aucun scénario. Prépare ton plan : "Si chiffre > prévu → …", "Si < prévu → …".</div>';

  return `
    ${items}
    <div class="row" style="margin-top:8px">
      <button class="btn btn-sm btn-primary" data-add-sc="${iso}|${ev.id}">+ Scénario</button>
      <button class="btn btn-sm" data-preset-sc="${iso}|${ev.id}">⚡ Preset Hot/Cold</button>
    </div>
    <div id="sc-form-${iso}-${ev.id}"></div>
  `;
}

function showEventForm(w, iso, editing = null) {
  const holder = document.getElementById(`form-${iso}`);
  holder.innerHTML = `
    <div class="card" style="margin-top:10px;background:rgba(56,189,248,.04)">
      <h3>${editing ? 'Modifier' : 'Ajouter'} une annonce</h3>
      <div class="grid grid-3">
        <div class="field">
          <label>Heure</label>
          <input type="time" class="input" id="evTime" value="${editing?.time || ''}" />
        </div>
        <div class="field">
          <label>Pays</label>
          <select class="select" id="evCountry">
            ${COUNTRIES.map(c => `<option value="${c.code}" ${editing?.country === c.code ? 'selected' : ''}>${c.flag} ${c.name}</option>`).join('')}
          </select>
        </div>
        <div class="field">
          <label>Impact</label>
          <select class="select" id="evImpact">
            <option value="high"   ${editing?.impact === 'high'   ? 'selected' : ''}>🔴 Élevé</option>
            <option value="medium" ${!editing || editing?.impact === 'medium' ? 'selected' : ''}>🟠 Moyen</option>
            <option value="low"    ${editing?.impact === 'low'    ? 'selected' : ''}>🟢 Faible</option>
          </select>
        </div>
      </div>
      <div class="field">
        <label>Événement</label>
        <input type="text" class="input" id="evTitle" value="${editing?.title || ''}" placeholder="Ex : NFP, CPI, FOMC, BCE..." />
      </div>
      <div class="grid grid-3">
        <div class="field">
          <label>Prévu</label>
          <input type="text" class="input" id="evForecast" value="${editing?.forecast || ''}" placeholder="Ex : 3.1% / 50k" />
        </div>
        <div class="field">
          <label>Précédent</label>
          <input type="text" class="input" id="evPrevious" value="${editing?.previous || ''}" placeholder="Ex : 3.2% / 42k" />
        </div>
        <div class="field">
          <label>Devise impactée</label>
          <input type="text" class="input" id="evCurrency" value="${editing?.currency || ''}" placeholder="Auto si vide" />
        </div>
      </div>
      <div class="field">
        <label>Note</label>
        <input type="text" class="input" id="evNote" value="${editing?.note || ''}" placeholder="Commentaire, attente de marché..." />
      </div>
      <div class="row">
        <button class="btn" id="evCancel">Annuler</button>
        <div class="spacer"></div>
        <button class="btn btn-primary" id="evSave">${editing ? 'Enregistrer' : 'Ajouter'}</button>
      </div>
    </div>
  `;

  document.getElementById('evCancel').onclick = () => holder.innerHTML = '';
  document.getElementById('evSave').onclick = () => {
    const ev = {
      id: editing?.id || uid(),
      time: document.getElementById('evTime').value,
      country: document.getElementById('evCountry').value,
      impact: document.getElementById('evImpact').value,
      title: document.getElementById('evTitle').value.trim(),
      forecast: document.getElementById('evForecast').value.trim(),
      previous: document.getElementById('evPrevious').value.trim(),
      currency: document.getElementById('evCurrency').value.trim(),
      note: document.getElementById('evNote').value.trim(),
    };
    if (!ev.title) return toast('Titre de l\'événement requis');
    if (editing) {
      w.days[iso].events = w.days[iso].events.map(x => x.id === editing.id ? ev : x);
    } else {
      w.days[iso].events.push(ev);
    }
    save(STORAGE.preparation, items);
    toast('Annonce enregistrée');
    renderDays(w);
  };
}

function showTemplatePicker(w, iso) {
  const holder = document.getElementById(`form-${iso}`);
  holder.innerHTML = `
    <div class="card" style="margin-top:10px;background:rgba(167,139,250,.05)">
      <h3>⚡ Ajout rapide depuis template</h3>
      <div class="sub">Clique pour ajouter. Tu pourras ensuite préciser heure / chiffres.</div>
      <div class="choices" style="max-height:320px;overflow:auto;padding:4px">
        ${EVENT_TEMPLATES.map((t, i) => {
          const co = COUNTRIES.find(c => c.code === t.country);
          const col = t.impact === 'high' ? 'danger' : t.impact === 'medium' ? 'warn' : '';
          return `<button class="chip ${col}" data-tpl="${i}">${co.flag} ${t.title} <span class="dim">· ${t.time}</span></button>`;
        }).join('')}
      </div>
      <div class="row" style="margin-top:10px">
        <button class="btn" id="tplClose">Fermer</button>
      </div>
    </div>
  `;
  document.getElementById('tplClose').onclick = () => holder.innerHTML = '';
  holder.querySelectorAll('[data-tpl]').forEach(b => b.onclick = () => {
    const t = EVENT_TEMPLATES[Number(b.dataset.tpl)];
    const co = COUNTRIES.find(c => c.code === t.country);
    const ev = {
      id: uid(),
      time: t.time === '—' ? '' : t.time,
      country: t.country,
      impact: t.impact,
      title: t.title,
      forecast: '',
      previous: '',
      currency: co?.currency || '',
      note: '',
    };
    w.days[iso].events.push(ev);
    save(STORAGE.preparation, items);
    toast(`${t.title} ajouté`);
    renderDays(w);
  });
}

render();
