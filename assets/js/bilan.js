// Bilan hebdomadaire
mountLayout({
  page: 'bilan',
  title: 'Bilan hebdomadaire',
  subtitle: 'Revue de performance et leçons de la semaine.',
  actions: `<button class="btn btn-primary" id="addBtn">+ Nouveau bilan</button>`
});

const c = document.getElementById('content');
let weeklies = load(STORAGE.weekly, []);
const journals = load(STORAGE.journal, []);

function weekStats(weekKey) {
  const entries = journals.filter(e => e.week === weekKey);
  const traded = entries.filter(e => e.traded === 'oui').length;
  const missed = entries.filter(e => e.traded === 'rate').length;
  const skipped = entries.filter(e => e.traded === 'non').length;
  const totalR = entries.reduce((s, e) => s + (Number(e.net_r) || 0), 0);
  const moods = entries.map(e => Number(e.mood)).filter(x => !isNaN(x));
  const avgMood = moods.length ? (moods.reduce((a, b) => a + b, 0) / moods.length).toFixed(1) : '—';
  const plan = entries.filter(e => e.plan_followed === 'oui').length;
  return { count: entries.length, traded, missed, skipped, totalR, avgMood, planRespected: plan, entries };
}

function render() {
  c.innerHTML = `
    <div id="formCard" class="card" style="display:none;margin-bottom:16px"></div>
    <div id="currentWeek" style="margin-bottom:18px"></div>
    <div id="list"></div>
  `;
  document.getElementById('addBtn').onclick = () => showForm();
  renderCurrentWeek();
  renderList();
}

function renderCurrentWeek() {
  const wk = getWeek(todayISO());
  const st = weekStats(wk);
  document.getElementById('currentWeek').innerHTML = `
    <div class="card">
      <div class="row" style="margin-bottom:12px">
        <h3 style="margin:0">Semaine en cours · ${wk}</h3>
        <div class="spacer"></div>
        <span class="badge info">${st.count} entrée(s)</span>
      </div>
      <div class="grid grid-4">
        <div class="kpi ${st.totalR >= 0 ? 'pos' : 'neg'}">
          <div class="label">Net semaine</div>
          <div class="value">${st.totalR >= 0 ? '+' : ''}${st.totalR.toFixed(2)} R</div>
        </div>
        <div class="kpi">
          <div class="label">Tradé / Raté / Off</div>
          <div class="value" style="font-size:22px">${st.traded} · ${st.missed} · ${st.skipped}</div>
        </div>
        <div class="kpi">
          <div class="label">Plan respecté</div>
          <div class="value" style="font-size:22px">${st.planRespected}/${st.traded || 0}</div>
        </div>
        <div class="kpi">
          <div class="label">Note moy.</div>
          <div class="value" style="font-size:22px">${st.avgMood}/10</div>
        </div>
      </div>
    </div>
  `;
}

function renderList() {
  const el = document.getElementById('list');
  if (!weeklies.length) {
    el.innerHTML = `<div class="card empty"><div class="big">📅</div>Aucun bilan hebdo rédigé. Faites le premier !</div>`;
    return;
  }
  el.innerHTML = weeklies.map(w => {
    const st = weekStats(w.week);
    return `
      <div class="entry">
        <div class="head">
          <div>
            <b>Semaine ${w.week}</b>
            <span class="dim"> · ${fmtDateShort(w.date)}</span>
          </div>
          <div class="row">
            <span class="badge ${st.totalR >= 0 ? 'pos' : 'neg'}">${st.totalR >= 0 ? '+' : ''}${st.totalR.toFixed(2)} R</span>
            <span class="badge">${st.count} jours</span>
            <button class="btn btn-sm" data-edit="${w.id}">Modifier</button>
            <button class="btn btn-sm btn-danger" data-del="${w.id}">Supprimer</button>
          </div>
        </div>
        <div class="body">
          ${w.wins ? `<div style="margin-bottom:8px"><b>🏆 Points forts :</b><br>${w.wins}</div>` : ''}
          ${w.losses ? `<div style="margin-bottom:8px"><b>📉 Échecs / erreurs :</b><br>${w.losses}</div>` : ''}
          ${w.lessons ? `<div style="margin-bottom:8px"><b>💡 Leçons :</b><br>${w.lessons}</div>` : ''}
          ${w.next ? `<div style="margin-bottom:8px"><b>🎯 Semaine prochaine :</b><br>${w.next}</div>` : ''}
          ${w.macro ? `<div style="margin-bottom:8px"><b>🌐 Contexte macro :</b><br>${w.macro}</div>` : ''}
        </div>
      </div>
    `;
  }).join('');

  document.querySelectorAll('[data-del]').forEach(b => b.onclick = () => {
    if (!confirm('Supprimer ?')) return;
    weeklies = weeklies.filter(x => x.id !== b.dataset.del);
    save(STORAGE.weekly, weeklies); render();
  });
  document.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => {
    const it = weeklies.find(x => x.id === b.dataset.edit);
    if (it) showForm(it);
  });
}

function showForm(editing = null) {
  const f = document.getElementById('formCard');
  f.style.display = 'block';
  f.innerHTML = `
    <h3>${editing ? 'Modifier' : 'Nouveau'} bilan hebdomadaire</h3>
    <div class="grid grid-2">
      <div class="field">
        <label>Semaine</label>
        <input type="text" class="input" id="fWeek" value="${editing?.week || getWeek(todayISO())}" />
      </div>
      <div class="field">
        <label>Date de rédaction</label>
        <input type="date" class="input" id="fDate" value="${editing?.date || todayISO()}" />
      </div>
    </div>
    <div class="field">
      <label>🏆 Points forts de la semaine</label>
      <textarea class="textarea" id="fWins" placeholder="Ce qui a bien fonctionné, bonnes décisions...">${editing?.wins || ''}</textarea>
    </div>
    <div class="field">
      <label>📉 Erreurs / échecs</label>
      <textarea class="textarea" id="fLosses" placeholder="Ce qui n'a pas marché, pertes évitables...">${editing?.losses || ''}</textarea>
    </div>
    <div class="field">
      <label>💡 Leçons retenues</label>
      <textarea class="textarea" id="fLessons" placeholder="3 enseignements concrets de la semaine...">${editing?.lessons || ''}</textarea>
    </div>
    <div class="field">
      <label>🎯 Plan pour la semaine prochaine</label>
      <textarea class="textarea" id="fNext" placeholder="Paires à surveiller, changements à opérer, objectifs...">${editing?.next || ''}</textarea>
    </div>
    <div class="field">
      <label>🌐 Contexte macro / événements clés</label>
      <textarea class="textarea" id="fMacro" placeholder="FOMC, CPI, NFP, biais dominant, corrélations...">${editing?.macro || ''}</textarea>
    </div>
    <div class="row">
      <button class="btn" id="fCancel">Annuler</button>
      <div class="spacer"></div>
      <button class="btn btn-primary" id="fSave">${editing ? 'Enregistrer' : 'Publier'}</button>
    </div>
  `;
  document.getElementById('fCancel').onclick = () => f.style.display = 'none';
  document.getElementById('fSave').onclick = () => {
    const entry = {
      id: editing?.id || uid(),
      week: document.getElementById('fWeek').value,
      date: document.getElementById('fDate').value,
      wins: document.getElementById('fWins').value,
      losses: document.getElementById('fLosses').value,
      lessons: document.getElementById('fLessons').value,
      next: document.getElementById('fNext').value,
      macro: document.getElementById('fMacro').value,
      createdAt: editing?.createdAt || new Date().toISOString(),
    };
    if (editing) weeklies = weeklies.map(x => x.id === editing.id ? entry : x);
    else weeklies.unshift(entry);
    save(STORAGE.weekly, weeklies);
    toast('Bilan enregistré');
    f.style.display = 'none';
    render();
  };
}

render();
