# 📊 FX Journal — Journal de trading Forex & Matières premières

Un **site web personnel**, **design** et **ultra performant**, pour suivre au quotidien
ton activité de trader Forex / matières premières / indices. Tout est conçu pour
te faire **progresser chaque jour** grâce à un journal structuré, des rapports
fondamentaux, un suivi du sentiment de marché et un bilan hebdomadaire.

> 🎯 **En une phrase** : un tableau de bord local, rapide, sans base de données,
> dans lequel tu notes ce que tu fais chaque jour, où tu colles tes captures
> d'écran (positions, Fear & Greed, attentes des banques centrales, devises
> non pondérées…) et tu rédiges tes rapports. Tout est stocké **localement**
> dans ton navigateur.

---

## ✨ Ce que le site fait pour toi

| Page | À quoi ça sert |
|------|----------------|
| **📊 Dashboard** | Vue d'ensemble : KPI sur 30 jours, jours tradés, note moyenne, rappel du dernier rapport et checklist quotidienne. |
| **📓 Journal quotidien** | Un **assistant de questions** (wizard) avec questions **conditionnelles**. Réponds simplement, les questions suivantes s'adaptent à tes réponses. |
| **📅 Bilan hebdomadaire** | Synthèse de la semaine : statistiques automatiques (R net, discipline, note moyenne) + rédaction libre (points forts, erreurs, leçons, plan). |
| **🗓️ Préparation de la semaine** | Planifie **semaine par semaine, jour par jour** : plan global, biais dominant, paires prioritaires. Pour chaque jour : heure, pays, événement macro, niveau d'impact (élevé/moyen/faible), devise, prévu/précédent, note. Templates rapides (NFP, CPI, FOMC, BCE, BoE, BoJ, SNB, BoC, RBA, RBNZ, OPEP…). |
| **📈 Positions & captures** | Upload tes **screenshots de trades** (glisser-déposer), avec instrument, direction, R multiple, notes. Filtrage par instrument / direction / résultat. |
| **📰 Rapports fondamentaux** | Rédige tes **rapports macro** quotidiens et hebdomadaires, avec biais directionnel (bullish / bearish / neutre), devises concernées, événements à venir, images. |
| **🌡️ Sentiment de marché** | Onglets dédiés pour : **Fear & Greed**, **attentes banques centrales**, **devises non pondérées** (hebdo), **COT / positionnement**, autres. Images + notes. |

---

## 🧠 Le journal intelligent (questions conditionnelles)

Chaque jour, tu ouvres `journal.html` et tu réponds à une question.
**Les questions suivantes dépendent de tes réponses.**

Exemple de parcours :

```
┌─ "As-tu tradé aujourd'hui ?"
│
├─ ✅ OUI  →  Instruments → Nb trades → Sessions → Setup → Résultat en R
│            → Plan respecté ? (si non/partiel → qu'est-ce qui a dérapé ?)
│            → Alignement HTF → Gestion du risque → Émotions → Surtradé ?
│            → Points forts → À améliorer → Note /10 → Checklist → Notes
│
├─ ⏸️ NON  →  Pourquoi ? (setup absent / hors session / discipline…)
│            → Plan pour demain → Note /10 → Checklist → Notes
│
└─ ⚠️ RATÉ →  Instruments ratés → Pourquoi ? → Était-ce dans ton plan ?
             → Potentiel en R → Leçon à retenir → Note /10 → …
```

Les questions sont **pensées pour un trader forex / matières premières** :
sessions (Asie / Londres / NY / Overlap), setups (tendance, pullback, range,
breakout, reversal, news), discipline (taille, SL, TP, moyenner…), émotions,
check-list quotidienne (revue du journal, news macro, préparation).

---

## 🗂️ Structure du projet

```
site-rapport-trading-/
├── index.html              # Dashboard (page d'accueil)
├── journal.html            # Journal quotidien (wizard conditionnel)
├── bilan.html              # Bilan hebdomadaire
├── positions.html          # Captures de positions
├── fondamentaux.html       # Rapports fondamentaux (daily/weekly)
├── sentiment.html          # Fear & Greed, BC, devises non pondérées…
├── assets/
│   ├── css/styles.css      # Thème sombre premium, responsive
│   └── js/
│       ├── common.js       # Layout, stockage, utilitaires partagés
│       ├── dashboard.js
│       ├── journal.js      # Moteur de questions conditionnelles
│       ├── bilan.js
│       ├── positions.js
│       ├── fondamentaux.js
│       └── sentiment.js
└── README.md
```

---

## 🚀 Utilisation — 3 façons

### 1. **En local** (le plus simple)
Clone le repo, puis ouvre `index.html` dans ton navigateur.
Aucune installation, aucune commande, aucune dépendance.

```bash
git clone https://github.com/tradingluca31-boop/site-rapport-trading-.git
cd site-rapport-trading-
# double-clic sur index.html  OU
python3 -m http.server 8000   # puis http://localhost:8000
```

### 2. **GitHub Pages** (accessible partout, gratuit)
1. Va dans **Settings → Pages** sur le repo
2. Source : branche `main` (ou celle où tu as poussé), dossier `/ (root)`
3. GitHub te donne une URL du type `https://tradingluca31-boop.github.io/site-rapport-trading-/`

### 3. **Netlify / Vercel / Cloudflare Pages**
Déploie-le en glisser-déposer du dossier. Zéro config, zéro build.

---

## 💾 Stockage des données

Toutes tes données (journal, positions, rapports, images) sont enregistrées
dans le **localStorage de ton navigateur**. Conséquences :

- ✅ **100 % privé** — rien ne quitte ton appareil
- ✅ **Rapide** — pas de serveur, pas d'attente
- ⚠️ **Lié au navigateur** — si tu vides le cache ou changes d'appareil, tu perds tes données
- ✅ **Export / Import JSON** — un bouton dans la sidebar pour sauvegarder ou restaurer

> 💡 **Conseil** : fais un export JSON chaque fin de semaine (bouton *⬇️ Exporter*
> dans la barre latérale) et stocke le fichier dans un cloud (Drive, Dropbox…).

---

## 🖼️ Import d'images

Partout où tu peux charger une image, tu peux :
- **Cliquer** sur la zone en pointillés
- **Glisser-déposer** un fichier dessus

Les images sont automatiquement **compressées** (max 1400 px, JPEG 82 %) avant
d'être stockées en base64 dans le localStorage, pour ne pas saturer l'espace.

Tu peux y mettre :
- tes **positions** (screenshot TradingView avec SL/TP),
- le **Fear & Greed** de la journée,
- les **attentes des banques centrales** (Fed, BCE, BoE…),
- les **devises non pondérées** (capture hebdo pour suivre la tendance),
- les **rapports COT**, graphiques macro, dot plots, etc.

---

## 🎨 Design

- Thème **sombre premium** (inspiré Bloomberg / TradingView)
- **Accents émeraude** (gains) / **rose** (pertes) / **cyan** / **violet**
- Typo **Inter** (Google Fonts)
- **Responsive** (mobile → desktop), menu hamburger sur petit écran
- **Aucun framework JS** → chargement instantané

---

## 🛣️ Idées d'évolution (plus tard)

- [ ] Graphique d'équity curve (Chart.js ou Recharts)
- [ ] Synchronisation optionnelle (Supabase / Firebase)
- [ ] PWA installable
- [ ] Mode d'impression pour le bilan hebdo (PDF)
- [ ] Tags personnalisés et recherche avancée
- [ ] Rappels (notifications) pour remplir le journal

---

## 📄 Licence

Usage personnel — libre à toi d'adapter à ton workflow.

**Bonne route, trader 🚀**
