// Dashboard
mountLayout({
  page: 'dashboard',
  title: 'Dashboard',
  subtitle: 'Vue d\'ensemble de votre activité de trading',
  actions: `<a href="journal.html" class="btn btn-primary">+ Nouveau rapport du jour</a>`
});

const c = document.getElementById('content');
const journal = load(STORAGE.journal, []);
const positions = load(STORAGE.positions, []);
const fundamentals = load(STORAGE.fundamentals, []);
const sentiment = load(STORAGE.sentiment, []);
const weekly = load(STORAGE.weekly, []);

// KPI calculations
const last30 = journal.filter(e => (Date.now() - new Date(e.date).getTime()) < 30 * 86400000);
const tradedDays = last30.filter(e => e.traded === 'oui').length;
const missedDays = last30.filter(e => e.traded === 'rate').length;
const avgMood = (() => {
  const ms = last30.map(e => Number(e.mood)).filter(x => !isNaN(x));
  return ms.length ? (ms.reduce((a, b) => a + b, 0) / ms.length).toFixed(1) : '—';
})();
const netR = (() => {
  const rs = last30.map(e => Number(e.netR)).filter(x => !isNaN(x));
  return rs.length ? rs.reduce((a, b) => a + b, 0).toFixed(2) : '0';
})();

const thisWeekKey = getWeek(todayISO());
const thisWeekEntries = journal.filter(e => getWeek(e.date) === thisWeekKey);

const lastJournal = journal[0];
const lastFundamental = fundamentals[0];
const recentPositions = positions.slice(0, 4);

c.innerHTML = `
  <div class="grid grid-4" style="margin-bottom:18px">
    <div class="card kpi ${Number(netR) >= 0 ? 'pos' : 'neg'}">
      <div class="label">Net (30 derniers j.)</div>
      <div class="value">${Number(netR) >= 0 ? '+' : ''}${netR} R</div>
      <div class="delta">Somme des R sur 30j</div>
    </div>
    <div class="card kpi">
      <div class="label">Jours tradés</div>
      <div class="value">${tradedDays}<span class="dim" style="font-size:16px"> / 30</span></div>
      <div class="delta">${missedDays} opportunité${missedDays > 1 ? 's' : ''} ratée${missedDays > 1 ? 's' : ''}</div>
    </div>
    <div class="card kpi">
      <div class="label">Note moyenne</div>
      <div class="value">${avgMood}<span class="dim" style="font-size:16px"> / 10</span></div>
      <div class="delta">Humeur & discipline</div>
    </div>
    <div class="card kpi">
      <div class="label">Cette semaine</div>
      <div class="value">${thisWeekEntries.length}<span class="dim" style="font-size:16px"> entrées</span></div>
      <div class="delta">Semaine ${thisWeekKey.split('-S')[1]}</div>
    </div>
  </div>

  <div class="grid grid-2">
    <div class="card">
      <h3>Dernier rapport quotidien</h3>
      <div class="sub">Récap rapide de votre dernière entrée</div>
      ${lastJournal ? `
        <div class="row" style="margin-bottom:10px">
          <span class="badge info">${fmtDate(lastJournal.date)}</span>
          ${lastJournal.traded === 'oui' ? '<span class="badge pos">Tradé</span>' :
            lastJournal.traded === 'rate' ? '<span class="badge warn">Opportunité ratée</span>' :
            '<span class="badge">Pas tradé</span>'}
          ${lastJournal.netR !== undefined && lastJournal.netR !== '' ? `<span class="badge ${Number(lastJournal.netR) >= 0 ? 'pos' : 'neg'}">${Number(lastJournal.netR) >= 0 ? '+' : ''}${lastJournal.netR} R</span>` : ''}
        </div>
        <div class="muted" style="font-size:13.5px;line-height:1.55">${(lastJournal.lesson || lastJournal.wentWell || '—').slice(0, 220)}${(lastJournal.lesson || lastJournal.wentWell || '').length > 220 ? '…' : ''}</div>
        <div style="margin-top:14px"><a href="journal.html" class="btn btn-sm">Voir le journal</a></div>
      ` : `<div class="empty"><div class="big">📓</div>Aucun rapport pour l'instant.<div style="margin-top:10px"><a href="journal.html" class="btn btn-primary btn-sm">Commencer</a></div></div>`}
    </div>

    <div class="card">
      <h3>Dernier rapport fondamental</h3>
      <div class="sub">Macro / news / biais directionnel</div>
      ${lastFundamental ? `
        <div class="row" style="margin-bottom:10px">
          <span class="badge info">${fmtDate(lastFundamental.date)}</span>
          <span class="badge">${lastFundamental.type === 'weekly' ? 'Hebdomadaire' : 'Quotidien'}</span>
        </div>
        <div style="font-weight:600;margin-bottom:4px">${lastFundamental.title || 'Sans titre'}</div>
        <div class="muted" style="font-size:13.5px;line-height:1.55">${(lastFundamental.content || '').slice(0, 220)}${(lastFundamental.content || '').length > 220 ? '…' : ''}</div>
        <div style="margin-top:14px"><a href="fondamentaux.html" class="btn btn-sm">Voir les rapports</a></div>
      ` : `<div class="empty"><div class="big">📰</div>Aucun rapport fondamental.<div style="margin-top:10px"><a href="fondamentaux.html" class="btn btn-primary btn-sm">Ajouter</a></div></div>`}
    </div>
  </div>

  <div class="grid grid-2" style="margin-top:16px">
    <div class="card">
      <h3>Captures récentes</h3>
      <div class="sub">4 dernières positions enregistrées</div>
      ${recentPositions.length ? `
        <div class="thumbs">
          ${recentPositions.map(p => `
            <div class="thumb" title="${p.instrument} – ${fmtDateShort(p.date)}">
              <img src="${p.image}" alt="${p.instrument}" />
              <div class="cap">${p.instrument} · ${p.direction === 'long' ? 'LONG' : 'SHORT'}</div>
            </div>`).join('')}
        </div>
        <div style="margin-top:14px"><a href="positions.html" class="btn btn-sm">Voir toutes les positions</a></div>
      ` : `<div class="empty"><div class="big">📈</div>Aucune position.<div style="margin-top:10px"><a href="positions.html" class="btn btn-primary btn-sm">Ajouter</a></div></div>`}
    </div>

    <div class="card">
      <h3>Checklist de la journée</h3>
      <div class="sub">Rituels du trader discipliné</div>
      <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:8px">
        ${[
          ['📓', 'Remplir le journal quotidien', 'journal.html'],
          ['📰', 'Lire / rédiger le rapport fondamental du jour', 'fondamentaux.html'],
          ['🌡️', 'Vérifier le sentiment (Fear & Greed, attentes BC)', 'sentiment.html'],
          ['📈', 'Archiver les captures des positions prises', 'positions.html'],
          ['📅', 'En fin de semaine : rédiger le bilan', 'bilan.html'],
        ].map(([emo, text, href]) => `
          <li style="display:flex;gap:10px;align-items:center;padding:10px 12px;border:1px solid var(--border);border-radius:10px;background:rgba(255,255,255,.015)">
            <span style="font-size:18px">${emo}</span>
            <span style="flex:1">${text}</span>
            <a href="${href}" class="btn btn-sm">Ouvrir</a>
          </li>
        `).join('')}
      </ul>
    </div>
  </div>
`;
