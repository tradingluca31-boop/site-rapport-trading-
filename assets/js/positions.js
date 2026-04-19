// Positions & captures
mountLayout({
  page: 'positions',
  title: 'Positions & captures',
  subtitle: 'Archivez vos screenshots de trades pour revue.',
  actions: `<button class="btn btn-primary" id="addBtn">+ Nouvelle position</button>`
});

const c = document.getElementById('content');
let items = load(STORAGE.positions, []);

function render() {
  c.innerHTML = `
    <div class="card" id="formCard" style="display:none;margin-bottom:16px"></div>

    <div class="row" style="margin-bottom:14px">
      <select id="filterInst" class="select" style="max-width:240px">
        <option value="">Tous les instruments</option>
        ${[...new Set(items.map(i => i.instrument))].map(v => `<option value="${v}">${v}</option>`).join('')}
      </select>
      <select id="filterDir" class="select" style="max-width:180px">
        <option value="">Long & Short</option>
        <option value="long">LONG uniquement</option>
        <option value="short">SHORT uniquement</option>
      </select>
      <select id="filterOutcome" class="select" style="max-width:180px">
        <option value="">Tous les résultats</option>
        <option value="win">Gagnants</option>
        <option value="loss">Perdants</option>
        <option value="be">Breakeven</option>
        <option value="open">En cours</option>
      </select>
      <div class="spacer"></div>
      <span class="muted" id="count"></span>
    </div>

    <div id="list"></div>
  `;

  document.getElementById('addBtn').onclick = () => showForm();
  ['filterInst', 'filterDir', 'filterOutcome'].forEach(id => document.getElementById(id).onchange = renderList);
  renderList();
}

function renderList() {
  const inst = document.getElementById('filterInst').value;
  const dir = document.getElementById('filterDir').value;
  const out = document.getElementById('filterOutcome').value;
  const filtered = items.filter(i =>
    (!inst || i.instrument === inst) &&
    (!dir || i.direction === dir) &&
    (!out || i.outcome === out)
  );
  document.getElementById('count').textContent = `${filtered.length} position(s)`;
  const list = document.getElementById('list');
  if (!filtered.length) {
    list.innerHTML = `<div class="card empty"><div class="big">📈</div>Aucune position enregistrée.</div>`;
    return;
  }
  list.innerHTML = `<div class="grid grid-3">${filtered.map(cardHTML).join('')}</div>`;
  document.querySelectorAll('[data-del]').forEach(b => b.onclick = () => {
    if (!confirm('Supprimer ?')) return;
    items = items.filter(x => x.id !== b.dataset.del);
    save(STORAGE.positions, items); render();
  });
  document.querySelectorAll('[data-view]').forEach(b => b.onclick = () => viewModal(b.dataset.view));
}

function cardHTML(i) {
  const outcomeBadge = i.outcome === 'win' ? '<span class="badge pos">Gagnant</span>'
    : i.outcome === 'loss' ? '<span class="badge neg">Perdant</span>'
    : i.outcome === 'be' ? '<span class="badge">Breakeven</span>'
    : '<span class="badge warn">En cours</span>';
  const dirBadge = i.direction === 'long' ? '<span class="badge pos">LONG</span>' : '<span class="badge neg">SHORT</span>';
  const rBadge = i.rMultiple !== undefined && i.rMultiple !== '' ? `<span class="badge ${Number(i.rMultiple) >= 0 ? 'pos' : 'neg'}">${Number(i.rMultiple) >= 0 ? '+' : ''}${i.rMultiple} R</span>` : '';
  return `
    <div class="card" style="padding:0;overflow:hidden">
      <div style="position:relative;cursor:pointer" data-view="${i.id}">
        <img src="${i.image}" style="width:100%;aspect-ratio:16/10;object-fit:cover;display:block" />
        <div style="position:absolute;top:8px;left:8px;display:flex;gap:6px;flex-wrap:wrap">${dirBadge}${outcomeBadge}${rBadge}</div>
      </div>
      <div style="padding:14px 16px">
        <div style="font-weight:700;margin-bottom:4px">${i.instrument}</div>
        <div class="muted" style="font-size:12.5px">${fmtDateShort(i.date)} · ${i.timeframe || '—'}</div>
        ${i.notes ? `<div style="margin-top:8px;font-size:13px;line-height:1.5;color:var(--text)">${i.notes.slice(0, 140)}${i.notes.length > 140 ? '…' : ''}</div>` : ''}
        <div class="row" style="margin-top:10px">
          <button class="btn btn-sm" data-view="${i.id}">Ouvrir</button>
          <div class="spacer"></div>
          <button class="btn btn-sm btn-danger" data-del="${i.id}">Supprimer</button>
        </div>
      </div>
    </div>
  `;
}

function showForm(editing = null) {
  const f = document.getElementById('formCard');
  f.style.display = 'block';
  f.innerHTML = `
    <h3>${editing ? 'Modifier' : 'Nouvelle'} position</h3>
    <div class="grid grid-2">
      <div class="field">
        <label>Instrument</label>
        <select class="select" id="fInst">
          ${ALL_INSTRUMENTS.map(v => `<option value="${v}" ${editing?.instrument === v ? 'selected' : ''}>${v}</option>`).join('')}
        </select>
      </div>
      <div class="field">
        <label>Date</label>
        <input type="date" class="input" id="fDate" value="${editing?.date || todayISO()}" />
      </div>
      <div class="field">
        <label>Direction</label>
        <select class="select" id="fDir">
          <option value="long" ${editing?.direction === 'long' ? 'selected' : ''}>LONG</option>
          <option value="short" ${editing?.direction === 'short' ? 'selected' : ''}>SHORT</option>
        </select>
      </div>
      <div class="field">
        <label>Résultat</label>
        <select class="select" id="fOut">
          <option value="open" ${editing?.outcome === 'open' ? 'selected' : ''}>En cours</option>
          <option value="win" ${editing?.outcome === 'win' ? 'selected' : ''}>Gagnant (TP)</option>
          <option value="loss" ${editing?.outcome === 'loss' ? 'selected' : ''}>Perdant (SL)</option>
          <option value="be" ${editing?.outcome === 'be' ? 'selected' : ''}>Breakeven</option>
        </select>
      </div>
      <div class="field">
        <label>Timeframe</label>
        <select class="select" id="fTF">
          <option value="">—</option>
          ${['M5','M15','M30','H1','H4','Daily','Weekly'].map(v => `<option value="${v}" ${editing?.timeframe === v ? 'selected' : ''}>${v}</option>`).join('')}
        </select>
      </div>
      <div class="field">
        <label>R multiple</label>
        <input type="number" step="0.1" class="input" id="fR" value="${editing?.rMultiple ?? ''}" placeholder="+2.0 / -1.0" />
      </div>
    </div>
    <div class="field">
      <label>Notes / analyse</label>
      <textarea class="textarea" id="fNotes" placeholder="Raison d'entrée, gestion, sortie, émotions…">${editing?.notes || ''}</textarea>
    </div>
    <div class="field">
      <label>Capture d'écran (glisser-déposer ou cliquer)</label>
      <div class="dropzone" id="fDrop">📸 Déposer une image ici ou cliquer pour en choisir une</div>
      <input type="file" id="fFile" accept="image/*" hidden />
      <div class="thumbs" id="fPreview">${editing?.image ? `<div class="thumb"><img src="${editing.image}" /></div>` : ''}</div>
    </div>
    <div class="row">
      <button class="btn" id="fCancel">Annuler</button>
      <div class="spacer"></div>
      <button class="btn btn-primary" id="fSave">${editing ? 'Enregistrer' : 'Ajouter'}</button>
    </div>
  `;

  let imgData = editing?.image || null;
  const drop = document.getElementById('fDrop');
  const fileInp = document.getElementById('fFile');
  const preview = document.getElementById('fPreview');

  const handleFile = async (file) => {
    if (!file?.type.startsWith('image/')) return toast('Image requise');
    imgData = await compressImage(file);
    preview.innerHTML = `<div class="thumb"><img src="${imgData}" /></div>`;
  };
  drop.onclick = () => fileInp.click();
  fileInp.onchange = (e) => handleFile(e.target.files[0]);
  drop.ondragover = (e) => { e.preventDefault(); drop.classList.add('drag'); };
  drop.ondragleave = () => drop.classList.remove('drag');
  drop.ondrop = (e) => { e.preventDefault(); drop.classList.remove('drag'); handleFile(e.dataTransfer.files[0]); };

  document.getElementById('fCancel').onclick = () => { f.style.display = 'none'; };
  document.getElementById('fSave').onclick = () => {
    const entry = {
      id: editing?.id || uid(),
      instrument: document.getElementById('fInst').value,
      date: document.getElementById('fDate').value,
      direction: document.getElementById('fDir').value,
      outcome: document.getElementById('fOut').value,
      timeframe: document.getElementById('fTF').value,
      rMultiple: document.getElementById('fR').value,
      notes: document.getElementById('fNotes').value,
      image: imgData,
      createdAt: editing?.createdAt || new Date().toISOString(),
    };
    if (!entry.image) return toast('Ajoutez une capture');
    if (editing) items = items.map(x => x.id === editing.id ? entry : x);
    else items.unshift(entry);
    save(STORAGE.positions, items);
    toast('Position enregistrée');
    f.style.display = 'none';
    render();
  };
}

function viewModal(id) {
  const i = items.find(x => x.id === id); if (!i) return;
  const m = document.createElement('div');
  m.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:100;display:grid;place-items:center;padding:20px;backdrop-filter:blur(6px)';
  m.innerHTML = `
    <div class="card" style="max-width:1000px;width:100%;max-height:90vh;overflow:auto">
      <div class="row" style="margin-bottom:10px">
        <div style="font-size:18px;font-weight:700">${i.instrument}</div>
        <span class="badge ${i.direction === 'long' ? 'pos' : 'neg'}">${i.direction.toUpperCase()}</span>
        <span class="badge">${fmtDate(i.date)}</span>
        <div class="spacer"></div>
        <button class="btn btn-sm" id="closeM">Fermer</button>
      </div>
      <img src="${i.image}" style="width:100%;border-radius:10px" />
      ${i.notes ? `<div style="margin-top:12px;white-space:pre-wrap;line-height:1.55">${i.notes}</div>` : ''}
    </div>
  `;
  document.body.appendChild(m);
  m.querySelector('#closeM').onclick = () => m.remove();
  m.onclick = (e) => { if (e.target === m) m.remove(); };
}

render();
