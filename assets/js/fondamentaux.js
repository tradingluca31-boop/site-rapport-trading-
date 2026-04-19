// Rapports fondamentaux – quotidiens & hebdomadaires
mountLayout({
  page: 'fondamentaux',
  title: 'Rapports fondamentaux',
  subtitle: 'Macro, actualités banques centrales, biais directionnels.',
  actions: `<button class="btn btn-primary" id="addBtn">+ Nouveau rapport</button>`
});

const c = document.getElementById('content');
let items = load(STORAGE.fundamentals, []);
let activeTab = 'daily';

function render() {
  c.innerHTML = `
    <div class="tabs">
      <button class="tab-btn ${activeTab === 'daily' ? 'active' : ''}" data-t="daily">Quotidien</button>
      <button class="tab-btn ${activeTab === 'weekly' ? 'active' : ''}" data-t="weekly">Hebdomadaire</button>
    </div>
    <div id="formCard" class="card" style="display:none;margin-bottom:16px"></div>
    <div id="list"></div>
  `;
  document.querySelectorAll('.tab-btn').forEach(b => b.onclick = () => { activeTab = b.dataset.t; render(); });
  document.getElementById('addBtn').onclick = showForm;
  renderList();
}

function renderList() {
  const list = items.filter(i => i.type === activeTab);
  const el = document.getElementById('list');
  if (!list.length) {
    el.innerHTML = `<div class="card empty"><div class="big">📰</div>Aucun rapport ${activeTab === 'daily' ? 'quotidien' : 'hebdomadaire'} pour l'instant.</div>`;
    return;
  }
  el.innerHTML = list.map(i => `
    <div class="entry">
      <div class="head">
        <div>
          <b>${i.title || 'Sans titre'}</b>
          <span class="dim"> · ${fmtDate(i.date)}</span>
        </div>
        <div class="row">
          ${i.bias ? `<span class="badge ${i.bias === 'bullish' ? 'pos' : i.bias === 'bearish' ? 'neg' : 'info'}">${i.bias === 'bullish' ? '🟢 Bullish' : i.bias === 'bearish' ? '🔴 Bearish' : '⚪ Neutre'}</span>` : ''}
          ${i.currencies?.length ? `<span class="badge">${i.currencies.join(' · ')}</span>` : ''}
          <button class="btn btn-sm" data-edit="${i.id}">Modifier</button>
          <button class="btn btn-sm btn-danger" data-del="${i.id}">Supprimer</button>
        </div>
      </div>
      ${i.events?.length ? `<div class="row" style="margin:4px 0 10px;gap:6px;flex-wrap:wrap">${i.events.map(e => `<span class="badge info">📅 ${e}</span>`).join('')}</div>` : ''}
      <div class="body">${i.content || ''}</div>
      ${i.images?.length ? `<div class="thumbs" style="margin-top:10px">${i.images.map((img, idx) => `<div class="thumb"><img src="${img}" data-img="${i.id}:${idx}" style="cursor:zoom-in" /></div>`).join('')}</div>` : ''}
    </div>
  `).join('');

  document.querySelectorAll('[data-del]').forEach(b => b.onclick = () => {
    if (!confirm('Supprimer ?')) return;
    items = items.filter(x => x.id !== b.dataset.del);
    save(STORAGE.fundamentals, items); render();
  });
  document.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => {
    const it = items.find(x => x.id === b.dataset.edit);
    if (it) showForm(it);
  });
  document.querySelectorAll('[data-img]').forEach(im => im.onclick = () => {
    const ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:100;display:grid;place-items:center;padding:20px;cursor:zoom-out';
    ov.innerHTML = `<img src="${im.src}" style="max-width:95vw;max-height:95vh;border-radius:10px" />`;
    ov.onclick = () => ov.remove();
    document.body.appendChild(ov);
  });
}

function showForm(editing = null) {
  const f = document.getElementById('formCard');
  f.style.display = 'block';
  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'NZD', 'XAU', 'WTI'];
  f.innerHTML = `
    <h3>${editing ? 'Modifier' : 'Nouveau'} rapport ${activeTab === 'daily' ? 'quotidien' : 'hebdomadaire'}</h3>
    <div class="grid grid-2">
      <div class="field">
        <label>Date</label>
        <input type="date" class="input" id="fDate" value="${editing?.date || todayISO()}" />
      </div>
      <div class="field">
        <label>Biais dominant</label>
        <select class="select" id="fBias">
          <option value="">—</option>
          <option value="bullish" ${editing?.bias === 'bullish' ? 'selected' : ''}>🟢 Bullish</option>
          <option value="bearish" ${editing?.bias === 'bearish' ? 'selected' : ''}>🔴 Bearish</option>
          <option value="neutral" ${editing?.bias === 'neutral' ? 'selected' : ''}>⚪ Neutre</option>
        </select>
      </div>
    </div>
    <div class="field">
      <label>Titre</label>
      <input type="text" class="input" id="fTitle" value="${editing?.title || ''}" placeholder="Ex : Semaine FOMC, CPI USD, BCE..." />
    </div>
    <div class="field">
      <label>Devises / instruments concernés</label>
      <div class="choices" id="fCurWrap">
        ${currencies.map(cur => `<button type="button" class="chip ${editing?.currencies?.includes(cur) ? 'selected' : ''}" data-cur="${cur}">${cur}</button>`).join('')}
      </div>
    </div>
    <div class="field">
      <label>Événements macro à venir (séparés par virgule)</label>
      <input type="text" class="input" id="fEvents" value="${(editing?.events || []).join(', ')}" placeholder="FOMC jeudi 20h, NFP vendredi 14h30..." />
    </div>
    <div class="field">
      <label>Contenu du rapport</label>
      <textarea class="textarea" id="fContent" style="min-height:200px" placeholder="Contexte macro, attentes, scénarios, niveaux clés...">${editing?.content || ''}</textarea>
    </div>
    <div class="field">
      <label>Images (graphiques, annonces, captures)</label>
      <div class="dropzone" id="fDrop">📎 Déposer des images ici ou cliquer</div>
      <input type="file" id="fFile" accept="image/*" multiple hidden />
      <div class="thumbs" id="fPreview"></div>
    </div>
    <div class="row">
      <button class="btn" id="fCancel">Annuler</button>
      <div class="spacer"></div>
      <button class="btn btn-primary" id="fSave">${editing ? 'Enregistrer' : 'Publier'}</button>
    </div>
  `;

  let images = [...(editing?.images || [])];
  let curr = [...(editing?.currencies || [])];

  document.querySelectorAll('#fCurWrap .chip').forEach(ch => ch.onclick = () => {
    const v = ch.dataset.cur;
    if (curr.includes(v)) curr = curr.filter(x => x !== v);
    else curr.push(v);
    ch.classList.toggle('selected');
  });

  const drop = document.getElementById('fDrop');
  const fileInp = document.getElementById('fFile');
  const preview = document.getElementById('fPreview');
  const updatePreview = () => {
    preview.innerHTML = images.map((img, idx) => `
      <div class="thumb">
        <img src="${img}" />
        <button class="del" data-rm="${idx}">✕</button>
      </div>
    `).join('');
    preview.querySelectorAll('[data-rm]').forEach(b => b.onclick = (e) => {
      e.stopPropagation();
      images.splice(Number(b.dataset.rm), 1);
      updatePreview();
    });
  };
  updatePreview();

  const handleFiles = async (files) => {
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      images.push(await compressImage(file));
    }
    updatePreview();
  };
  drop.onclick = () => fileInp.click();
  fileInp.onchange = (e) => handleFiles([...e.target.files]);
  drop.ondragover = (e) => { e.preventDefault(); drop.classList.add('drag'); };
  drop.ondragleave = () => drop.classList.remove('drag');
  drop.ondrop = (e) => { e.preventDefault(); drop.classList.remove('drag'); handleFiles([...e.dataTransfer.files]); };

  document.getElementById('fCancel').onclick = () => f.style.display = 'none';
  document.getElementById('fSave').onclick = () => {
    const entry = {
      id: editing?.id || uid(),
      type: activeTab,
      date: document.getElementById('fDate').value,
      title: document.getElementById('fTitle').value.trim(),
      bias: document.getElementById('fBias').value,
      content: document.getElementById('fContent').value,
      currencies: curr,
      events: document.getElementById('fEvents').value.split(',').map(s => s.trim()).filter(Boolean),
      images,
      createdAt: editing?.createdAt || new Date().toISOString(),
    };
    if (!entry.title && !entry.content) return toast('Titre ou contenu requis');
    if (editing) items = items.map(x => x.id === editing.id ? entry : x);
    else items.unshift(entry);
    save(STORAGE.fundamentals, items);
    toast('Rapport enregistré');
    f.style.display = 'none';
    render();
  };
}

render();
