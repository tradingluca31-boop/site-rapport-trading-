// Sentiment de marché – Fear & Greed, attentes BC, devises non pondérées
mountLayout({
  page: 'sentiment',
  title: 'Sentiment de marché',
  subtitle: 'Fear & Greed, attentes banques centrales, devises non pondérées.',
  actions: `<button class="btn btn-primary" id="addBtn">+ Nouvelle capture</button>`
});

const c = document.getElementById('content');
let items = load(STORAGE.sentiment, []);
let activeTab = 'fear';

const TABS = [
  { id: 'fear',    label: '😱 Fear & Greed' },
  { id: 'central', label: '🏦 Attentes banques centrales' },
  { id: 'pairs',   label: '💱 Devises non pondérées' },
  { id: 'cot',     label: '📊 COT / Positionnement' },
  { id: 'other',   label: '🌐 Autres' },
];

function render() {
  c.innerHTML = `
    <div class="tabs">
      ${TABS.map(t => `<button class="tab-btn ${activeTab === t.id ? 'active' : ''}" data-t="${t.id}">${t.label}</button>`).join('')}
    </div>
    <div id="formCard" class="card" style="display:none;margin-bottom:16px"></div>
    <div id="list"></div>
  `;
  document.querySelectorAll('.tab-btn').forEach(b => b.onclick = () => { activeTab = b.dataset.t; render(); });
  document.getElementById('addBtn').onclick = showForm;
  renderList();
}

function renderList() {
  const list = items.filter(i => i.category === activeTab);
  const el = document.getElementById('list');
  if (!list.length) {
    el.innerHTML = `<div class="card empty"><div class="big">🌡️</div>Aucune capture dans cette catégorie.</div>`;
    return;
  }
  el.innerHTML = `<div class="grid grid-2">${list.map(i => `
    <div class="card">
      <div class="row" style="margin-bottom:8px">
        <b>${i.title || 'Capture'}</b>
        <div class="spacer"></div>
        <span class="badge info">${fmtDateShort(i.date)}</span>
        ${i.week ? `<span class="badge">Semaine ${i.week}</span>` : ''}
      </div>
      ${i.image ? `<img src="${i.image}" style="width:100%;border-radius:10px;cursor:zoom-in" data-zoom="${i.id}" />` : ''}
      ${i.notes ? `<div style="margin-top:10px;font-size:13.5px;line-height:1.5;white-space:pre-wrap">${i.notes}</div>` : ''}
      <div class="row" style="margin-top:10px">
        <button class="btn btn-sm" data-edit="${i.id}">Modifier</button>
        <div class="spacer"></div>
        <button class="btn btn-sm btn-danger" data-del="${i.id}">Supprimer</button>
      </div>
    </div>
  `).join('')}</div>`;

  document.querySelectorAll('[data-del]').forEach(b => b.onclick = () => {
    if (!confirm('Supprimer ?')) return;
    items = items.filter(x => x.id !== b.dataset.del);
    save(STORAGE.sentiment, items); render();
  });
  document.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => {
    const it = items.find(x => x.id === b.dataset.edit);
    if (it) showForm(it);
  });
  document.querySelectorAll('[data-zoom]').forEach(im => im.onclick = () => {
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
  const label = TABS.find(t => t.id === activeTab).label;
  f.innerHTML = `
    <h3>${editing ? 'Modifier' : 'Nouvelle capture'} — ${label}</h3>
    <div class="grid grid-2">
      <div class="field">
        <label>Date</label>
        <input type="date" class="input" id="fDate" value="${editing?.date || todayISO()}" />
      </div>
      <div class="field">
        <label>Titre</label>
        <input type="text" class="input" id="fTitle" value="${editing?.title || ''}" placeholder="Ex : F&G 62 · Greed · 18 avril" />
      </div>
    </div>
    <div class="field">
      <label>Notes / analyse</label>
      <textarea class="textarea" id="fNotes" placeholder="Interprétation, implications, tendance...">${editing?.notes || ''}</textarea>
    </div>
    <div class="field">
      <label>Image</label>
      <div class="dropzone" id="fDrop">📸 Déposer l'image ici ou cliquer</div>
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

  document.getElementById('fCancel').onclick = () => f.style.display = 'none';
  document.getElementById('fSave').onclick = () => {
    const date = document.getElementById('fDate').value;
    const entry = {
      id: editing?.id || uid(),
      category: activeTab,
      date,
      week: getWeek(date),
      title: document.getElementById('fTitle').value.trim(),
      notes: document.getElementById('fNotes').value,
      image: imgData,
      createdAt: editing?.createdAt || new Date().toISOString(),
    };
    if (!entry.image && !entry.notes) return toast('Image ou note requise');
    if (editing) items = items.map(x => x.id === editing.id ? entry : x);
    else items.unshift(entry);
    save(STORAGE.sentiment, items);
    toast('Capture enregistrée');
    f.style.display = 'none';
    render();
  };
}

render();
