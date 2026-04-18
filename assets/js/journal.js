// Daily journal – wizard with conditional questions
mountLayout({
  page: 'journal',
  title: 'Journal quotidien',
  subtitle: 'Un bilan structuré chaque jour pour progresser.',
  actions: `<button class="btn" id="toggleView">Voir les entrées</button>`
});

const c = document.getElementById('content');
let entries = load(STORAGE.journal, []);

// ---------------- Wizard definition ----------------
// A step is an object with id, prompt, type, options?, next(state) → nextStepId
// type: single | multi | number | text | textarea | rating
const EMOTIONS = ['Calme', 'Confiant', 'Hésitant', 'Stressé', 'Frustré', 'Impulsif', 'Euphorique', 'Discipliné', 'Fatigué'];
const SESSIONS = ['Asie', 'Londres', 'New York', 'Overlap LDN/NY'];
const DRIFT = ['Entrée anticipée', 'Entrée tardive', 'Sortie trop tôt', 'Sortie trop tard', 'Taille trop grosse', 'Taille trop petite', 'SL non respecté', 'TP modifié', 'Moyenne à la baisse', 'Trade hors plan'];
const WHY_NO = ['Aucun setup valide', 'Hors session de trading', 'Pas eu le temps', 'Discipline / pause volontaire', 'Actualités à risque', 'Marché plat / peu volatil', 'Fatigue / mauvaise forme'];
const WHY_MISS = ['Pas vu le setup', 'Manque de confiance', 'Hors session', 'Pas dans mon plan', 'Distraction', 'Hésitation / doute', 'Entrée déjà passée'];
const SETUP_TYPE = ['Suivi de tendance', 'Retracement (pullback)', 'Range / rejet', 'Breakout', 'Reversal', 'News trade', 'Autre'];

const STEPS = [
  {
    id: 'traded',
    prompt: 'As-tu tradé aujourd\'hui ?',
    hint: 'Le point de départ de ton bilan.',
    type: 'single',
    options: [
      { v: 'oui', l: '✅ Oui, j\'ai pris au moins un trade' },
      { v: 'non', l: '⏸️ Non, je n\'ai pas tradé' },
      { v: 'rate', l: '⚠️ J\'ai raté une / plusieurs opportunités' },
    ],
    next: (s) => s.traded === 'oui' ? 'instruments' : s.traded === 'non' ? 'why_no' : 'miss_instruments'
  },

  // ===== Branche OUI =====
  { id: 'instruments', prompt: 'Quels instruments as-tu tradés ?', hint: 'Sélection multiple.', type: 'multi', options: ALL_INSTRUMENTS.map(v => ({ v, l: v })), next: () => 'n_trades' },
  { id: 'n_trades', prompt: 'Combien de trades as-tu pris ?', type: 'number', min: 1, max: 50, next: () => 'sessions' },
  { id: 'sessions', prompt: 'Sur quelle(s) session(s) ?', type: 'multi', options: SESSIONS.map(v => ({ v, l: v })), next: () => 'setup' },
  { id: 'setup', prompt: 'Type de setup principal', type: 'single', options: SETUP_TYPE.map(v => ({ v, l: v })), next: () => 'net_r' },
  { id: 'net_r', prompt: 'Résultat net de la journée (en R)', hint: 'Ex : +1.8 pour 1,8R gagné, −0.5 pour 0,5R perdu.', type: 'number', step: 0.1, next: () => 'plan_followed' },
  {
    id: 'plan_followed',
    prompt: 'As-tu respecté ton plan de trading ?',
    type: 'single',
    options: [
      { v: 'oui', l: '✅ Oui, totalement' },
      { v: 'partiel', l: '🟡 Partiellement' },
      { v: 'non', l: '❌ Non' },
    ],
    next: (s) => s.plan_followed === 'oui' ? 'htf_aligned' : 'drift'
  },
  { id: 'drift', prompt: 'Qu\'est-ce qui a dérapé ?', hint: 'Coche toutes les erreurs commises.', type: 'multi', options: DRIFT.map(v => ({ v, l: v })), next: () => 'htf_aligned' },
  {
    id: 'htf_aligned', prompt: 'Tes trades étaient-ils alignés avec la tendance HTF ?',
    type: 'single', options: [
      { v: 'oui', l: '✅ Oui, dans le sens de la tendance' },
      { v: 'contre', l: '🔄 Non, à contre-tendance (volontaire)' },
      { v: 'pas_verif', l: '🤷 Je n\'ai pas vérifié' },
    ], next: () => 'risk_mgmt'
  },
  {
    id: 'risk_mgmt', prompt: 'Gestion du risque',
    type: 'single', options: [
      { v: 'strict', l: '🎯 Risque fixe respecté' },
      { v: 'ajuste', l: '⚖️ Ajusté en cours de trade (justifié)' },
      { v: 'depasse', l: '🚨 Risque dépassé' },
    ], next: () => 'emotions'
  },
  { id: 'emotions', prompt: 'Émotions dominantes aujourd\'hui', type: 'multi', options: EMOTIONS.map(v => ({ v, l: v })), next: () => 'overtrade' },
  {
    id: 'overtrade', prompt: 'As-tu surtradé (forcé des trades) ?',
    type: 'single', options: [
      { v: 'non', l: '✅ Non' }, { v: 'un_peu', l: '🟡 Un peu' }, { v: 'oui', l: '❌ Oui' },
    ], next: () => 'went_well'
  },
  { id: 'went_well', prompt: 'Qu\'est-ce qui a BIEN fonctionné aujourd\'hui ?', hint: 'Points forts, succès, bonnes décisions.', type: 'textarea', next: () => 'to_improve' },
  { id: 'to_improve', prompt: 'Qu\'est-ce qui est à AMÉLIORER ?', hint: 'Sois honnête et précis.', type: 'textarea', next: () => 'mood' },

  // ===== Branche NON =====
  { id: 'why_no', prompt: 'Pourquoi n\'as-tu pas tradé ?', type: 'multi', options: WHY_NO.map(v => ({ v, l: v })), next: () => 'tomorrow_plan' },
  { id: 'tomorrow_plan', prompt: 'Quel est ton plan pour demain ?', hint: 'Paires à surveiller, niveaux clés, biais…', type: 'textarea', next: () => 'mood' },

  // ===== Branche RATE =====
  { id: 'miss_instruments', prompt: 'Sur quels instruments ?', type: 'multi', options: ALL_INSTRUMENTS.map(v => ({ v, l: v })), next: () => 'miss_why' },
  { id: 'miss_why', prompt: 'Pourquoi as-tu raté cette opportunité ?', type: 'multi', options: WHY_MISS.map(v => ({ v, l: v })), next: () => 'miss_in_plan' },
  {
    id: 'miss_in_plan', prompt: 'Était-ce conforme à ton plan ?',
    type: 'single', options: [
      { v: 'oui', l: '✅ Oui, setup valide raté' },
      { v: 'non', l: '❌ Non, hors plan' },
      { v: 'partiel', l: '🟡 Partiellement conforme' },
    ], next: () => 'miss_cost'
  },
  { id: 'miss_cost', prompt: 'Potentiel estimé en R (si le trade avait été pris)', hint: 'Optionnel – aide à mesurer le coût psychologique.', type: 'number', step: 0.1, optional: true, next: () => 'miss_lesson' },
  { id: 'miss_lesson', prompt: 'Leçon à retenir', hint: 'Comment éviter cela demain ?', type: 'textarea', next: () => 'mood' },

  // ===== Fin commune =====
  { id: 'mood', prompt: 'Note globale de ta journée (1 à 10)', hint: 'Discipline, humeur, satisfaction.', type: 'rating', next: () => 'checklist' },
  {
    id: 'checklist', prompt: 'Check-list quotidienne', hint: 'Coche ce que tu as fait.',
    type: 'multi', options: [
      { v: 'rev_journal', l: 'J\'ai relu mon journal précédent' },
      { v: 'lu_news', l: 'J\'ai lu les news macro du jour' },
      { v: 'prep_demain', l: 'J\'ai préparé mes niveaux pour demain' },
      { v: 'respire', l: 'Je suis resté calme pendant mes trades' },
    ], next: () => 'notes'
  },
  { id: 'notes', prompt: 'Notes libres', hint: 'Tout ce qui n\'a pas été dit.', type: 'textarea', optional: true, next: () => null },
];

// ---------------- Wizard state ----------------
let state = { date: todayISO(), order: [] };
let currentId = 'traded';

function getStep(id) { return STEPS.find(s => s.id === id); }

function renderWizard() {
  const step = getStep(currentId);
  const totalKnown = state.order.length + 1;
  // approximate progress: compare to typical path length
  const approxTotal = state.traded === 'oui' ? 14 : state.traded === 'rate' ? 9 : 6;
  const pct = Math.min(100, Math.round((totalKnown / approxTotal) * 100));

  c.innerHTML = `
    <div class="card q-card">
      <div class="row" style="margin-bottom:8px">
        <span class="badge info">📅 ${fmtDate(state.date)}</span>
        <span class="badge">Étape ${totalKnown}</span>
        <div class="spacer"></div>
        <input type="date" class="input" style="width:auto" id="dateInp" value="${state.date}" />
      </div>
      <div class="progress" style="margin-bottom:18px"><div style="width:${pct}%"></div></div>

      <div class="q-step active">
        <div class="q-prompt">${step.prompt}</div>
        ${step.hint ? `<div class="q-hint">${step.hint}</div>` : ''}
        ${renderStepInput(step)}
      </div>

      <div class="q-actions">
        <button class="btn btn-ghost" id="prevBtn" ${state.order.length === 0 ? 'disabled style="opacity:.4;cursor:not-allowed"' : ''}>← Précédent</button>
        <div class="row">
          ${step.optional ? `<button class="btn btn-ghost" id="skipBtn">Passer</button>` : ''}
          <button class="btn btn-primary" id="nextBtn">${step.next(state) ? 'Suivant →' : '💾 Enregistrer le rapport'}</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('dateInp').addEventListener('change', (e) => { state.date = e.target.value; renderWizard(); });
  document.getElementById('prevBtn').addEventListener('click', goBack);
  document.getElementById('nextBtn').addEventListener('click', goNext);
  document.getElementById('skipBtn')?.addEventListener('click', () => { delete state[currentId]; goNext(true); });
  wireInputs(step);
}

function renderStepInput(step) {
  const val = state[step.id];
  if (step.type === 'single') {
    return `<div class="choices">${step.options.map(o => `<button class="chip ${val === o.v ? 'selected' : ''}" data-v="${o.v}">${o.l}</button>`).join('')}</div>`;
  }
  if (step.type === 'multi') {
    const vs = Array.isArray(val) ? val : [];
    return `<div class="choices">${step.options.map(o => `<button class="chip ${vs.includes(o.v) ? 'selected' : ''}" data-v="${o.v}">${o.l}</button>`).join('')}</div>`;
  }
  if (step.type === 'number') {
    return `<input type="number" class="input" id="numInp" value="${val ?? ''}" placeholder="Ex : ${step.id === 'net_r' ? '+1.5' : '2'}" ${step.step ? `step="${step.step}"` : 'step="1"'} ${step.min !== undefined ? `min="${step.min}"` : ''} ${step.max !== undefined ? `max="${step.max}"` : ''} style="max-width:220px" />`;
  }
  if (step.type === 'text') {
    return `<input type="text" class="input" id="txtInp" value="${val ?? ''}" />`;
  }
  if (step.type === 'textarea') {
    return `<textarea class="textarea" id="taInp" placeholder="Écris ici…">${val ?? ''}</textarea>`;
  }
  if (step.type === 'rating') {
    return `
      <div class="choices" id="ratingWrap">
        ${Array.from({ length: 10 }, (_, i) => i + 1).map(n => `<button class="chip ${val === n ? 'selected' : ''}" data-v="${n}">${n}</button>`).join('')}
      </div>
    `;
  }
  return '';
}

function wireInputs(step) {
  if (step.type === 'single' || step.type === 'rating') {
    document.querySelectorAll('.chip').forEach(el => {
      el.addEventListener('click', () => {
        const v = step.type === 'rating' ? Number(el.dataset.v) : el.dataset.v;
        state[step.id] = v;
        document.querySelectorAll('.chip').forEach(x => x.classList.remove('selected'));
        el.classList.add('selected');
      });
    });
  } else if (step.type === 'multi') {
    document.querySelectorAll('.chip').forEach(el => {
      el.addEventListener('click', () => {
        const v = el.dataset.v;
        const cur = Array.isArray(state[step.id]) ? state[step.id] : [];
        if (cur.includes(v)) state[step.id] = cur.filter(x => x !== v);
        else state[step.id] = [...cur, v];
        el.classList.toggle('selected');
      });
    });
  } else if (step.type === 'number') {
    document.getElementById('numInp').addEventListener('input', (e) => { state[step.id] = e.target.value === '' ? undefined : Number(e.target.value); });
  } else if (step.type === 'textarea') {
    document.getElementById('taInp').addEventListener('input', (e) => { state[step.id] = e.target.value; });
  } else if (step.type === 'text') {
    document.getElementById('txtInp').addEventListener('input', (e) => { state[step.id] = e.target.value; });
  }
}

function goBack() {
  if (state.order.length === 0) return;
  const prev = state.order.pop();
  currentId = prev;
  renderWizard();
}
function goNext(skipping = false) {
  const step = getStep(currentId);
  // Validate required
  if (!skipping && !step.optional) {
    const v = state[step.id];
    const empty = v === undefined || v === '' || (Array.isArray(v) && v.length === 0);
    if (empty) { toast('Réponds à la question pour continuer'); return; }
  }
  state.order.push(currentId);
  const nextId = step.next(state);
  if (!nextId) { finalize(); return; }
  currentId = nextId;
  renderWizard();
}

function finalize() {
  const entry = { ...state, id: uid(), createdAt: new Date().toISOString(), week: getWeek(state.date) };
  delete entry.order;
  entries.unshift(entry);
  save(STORAGE.journal, entries);
  toast('Rapport enregistré ✅');
  setTimeout(() => renderList(), 300);
}

// ---------------- List view ----------------
function renderList() {
  const weekFilter = new URL(location.href).searchParams.get('week');
  const filtered = weekFilter ? entries.filter(e => e.week === weekFilter) : entries;

  c.innerHTML = `
    <div class="row" style="margin-bottom:14px">
      <button class="btn btn-primary" id="newBtn">+ Nouveau rapport</button>
      <div class="spacer"></div>
      <input type="text" id="search" class="input" placeholder="Rechercher…" style="max-width:260px" />
    </div>
    ${filtered.length === 0 ? `
      <div class="card empty"><div class="big">📓</div>
        Aucune entrée. Commencez votre premier rapport.
      </div>
    ` : `
      <div id="entriesList">
        ${filtered.map(renderEntryCard).join('')}
      </div>
    `}
  `;
  document.getElementById('newBtn').addEventListener('click', () => { state = { date: todayISO(), order: [] }; currentId = 'traded'; renderWizard(); });
  document.getElementById('search')?.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    document.getElementById('entriesList').innerHTML = filtered.filter(x =>
      JSON.stringify(x).toLowerCase().includes(q)
    ).map(renderEntryCard).join('');
    wireEntryActions();
  });
  wireEntryActions();
}

function renderEntryCard(e) {
  const badges = [];
  if (e.traded === 'oui') badges.push('<span class="badge pos">Tradé</span>');
  else if (e.traded === 'rate') badges.push('<span class="badge warn">Raté</span>');
  else badges.push('<span class="badge">Pas tradé</span>');
  if (e.net_r !== undefined && e.net_r !== '') badges.push(`<span class="badge ${Number(e.net_r) >= 0 ? 'pos' : 'neg'}">${Number(e.net_r) >= 0 ? '+' : ''}${e.net_r} R</span>`);
  if (e.plan_followed === 'oui') badges.push('<span class="badge pos">Plan ✓</span>');
  if (e.plan_followed === 'non') badges.push('<span class="badge neg">Plan ✗</span>');
  if (e.mood) badges.push(`<span class="badge info">${e.mood}/10</span>`);

  const details = [];
  if (e.instruments?.length) details.push(`<b>Instruments :</b> ${e.instruments.join(', ')}`);
  if (e.n_trades) details.push(`<b>Trades :</b> ${e.n_trades}`);
  if (e.sessions?.length) details.push(`<b>Sessions :</b> ${e.sessions.join(', ')}`);
  if (e.setup) details.push(`<b>Setup :</b> ${e.setup}`);
  if (e.drift?.length) details.push(`<b>Erreurs :</b> ${e.drift.join(', ')}`);
  if (e.emotions?.length) details.push(`<b>Émotions :</b> ${e.emotions.join(', ')}`);
  if (e.why_no?.length) details.push(`<b>Raisons :</b> ${e.why_no.join(', ')}`);
  if (e.miss_instruments?.length) details.push(`<b>Ratés sur :</b> ${e.miss_instruments.join(', ')}`);
  if (e.miss_why?.length) details.push(`<b>Pourquoi :</b> ${e.miss_why.join(', ')}`);
  if (e.went_well) details.push(`<b>✅ Bien :</b> ${e.went_well}`);
  if (e.to_improve) details.push(`<b>⚠️ À améliorer :</b> ${e.to_improve}`);
  if (e.miss_lesson) details.push(`<b>💡 Leçon :</b> ${e.miss_lesson}`);
  if (e.tomorrow_plan) details.push(`<b>📋 Demain :</b> ${e.tomorrow_plan}`);
  if (e.notes) details.push(`<b>📝 Notes :</b> ${e.notes}`);

  return `
    <div class="entry" data-id="${e.id}">
      <div class="head">
        <div><b>${fmtDate(e.date)}</b> <span class="dim">· ${e.week}</span></div>
        <div class="row">${badges.join('')}
          <button class="btn btn-sm btn-danger" data-action="del" data-id="${e.id}">Supprimer</button>
        </div>
      </div>
      <div class="body">${details.join('<br>')}</div>
    </div>
  `;
}

function wireEntryActions() {
  document.querySelectorAll('[data-action="del"]').forEach(b => {
    b.addEventListener('click', () => {
      if (!confirm('Supprimer cette entrée ?')) return;
      entries = entries.filter(e => e.id !== b.dataset.id);
      save(STORAGE.journal, entries);
      renderList();
    });
  });
}

// View toggle
document.getElementById('toggleView').addEventListener('click', () => {
  if (c.querySelector('.q-card')) renderList();
  else { state = { date: todayISO(), order: [] }; currentId = 'traded'; renderWizard(); }
});

// Default: show wizard if no entry today, else list
const todayEntry = entries.find(e => e.date === todayISO());
if (todayEntry) renderList(); else { renderWizard(); }
