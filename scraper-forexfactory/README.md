# ForexFactory Scraper — briefing Claude Code (exécution sur **VPS Windows**)

> Ce document est destiné à **une instance de Claude Code qui tourne sur le VPS Windows de Luca** (pas le PC Windows local de dev).
> Le VPS fait déjà tourner MetaTrader 5 + un scraper Python MT5 FTMO. On veut ajouter un **deuxième scraper indépendant** qui récupère le calendrier économique ForexFactory et le pousse dans la même base Supabase, de façon à ce que le site `site-rapport-trading.vercel.app` ait les IPC, IPP, chômage, discours, etc. manquants dans MT5 FTMO.

---

## ⚠️ Précautions chemins (PC dev Windows de Luca ≠ VPS Windows)

Les chemins dans les exemples (`C:\edgefx\scraper-forexfactory\`) sont **indicatifs**. Sur le VPS :

- Le VPS peut avoir une arborescence différente du PC de Luca. **Ne pas supposer `C:\Users\lbye3\`** — c'est le PC local.
- Repérer où sont les scrapers existants : `Get-ChildItem -Path C:\ -Filter "mt5_scraper.py" -Recurse -ErrorAction SilentlyContinue` ou demander à Luca le chemin du scraper MT5.
- Python peut être installé dans `C:\Python312\`, `C:\Users\<user>\AppData\Local\Programs\Python\Python312\`, ou via Windows Store. Vérifier : `Get-Command python` ou `where.exe python`.
- L'utilisateur Windows peut être `Administrator`, `luca`, `Admin`, etc. Vérifier : `$env:USERNAME`.
- Le disque principal peut être `C:\` ou `D:\`.
- **La console par défaut est PowerShell** (ou cmd.exe selon le VPS). Les scripts ici sont en `.ps1` (PowerShell).
- Vérifier la version de Python : `python --version` → doit être >= 3.8.

**Règle d'or** : avant de créer un fichier ou enregistrer une tâche planifiée, faire `Get-Location`, `$env:USERNAME`, `Get-ChildItem` pour comprendre où tu es.

---

## 🎯 Objectif

Créer sur le VPS Windows un scraper Python qui :

1. Fetch le XML officiel ForexFactory (miroir `faireconomy.media`) toutes les 30 min.
2. Parse les events (IPC, IPP, taux de chômage, NFP, discours Fed/BCE, etc.).
3. Upsert dans la table `public.ff_calendar` de Supabase (avec `event_id` comme clé primaire).
4. Tourne en permanence via **Windows Task Scheduler**, indépendamment du PC de Luca (VPS allumé H24).

Le site Next.js (`site-rapport-trading.vercel.app`) **lira** ensuite cette table, en plus de `mt5_calendar` qu'il lit déjà.

---

## 📦 Contenu du dossier (déjà créé dans le repo `site-rapport-trading-`)

```
scraper-forexfactory/
├── forexfactory_scraper.py           # Script Python (standalone : requests + loader .env intégré)
├── requirements.txt                  # Dépendance : requests (pas besoin de python-dotenv)
├── .env.example                      # Template config → copier vers .env
├── sql/
│   └── 001_ff_calendar.sql           # Schema table Supabase + index + RLS
├── windows/
│   ├── run.ps1                       # Wrapper PowerShell (active venv, lance le script, log)
│   └── register-task.ps1             # Enregistre la tâche planifiée (à exécuter 1x admin)
└── README.md                         # Ce fichier
```

---

## 🗂️ Étape 1 — Créer la table Supabase

1. Ouvrir Supabase Dashboard → projet **MEMOIRE EA** (URL : `https://kzwsokuppgcbkjphecpn.supabase.co`).
2. `SQL Editor` → `New query`.
3. Coller le contenu de [`sql/001_ff_calendar.sql`](sql/001_ff_calendar.sql) et `Run`.
4. Vérifier : `Table Editor` → `ff_calendar` doit exister (colonnes : `event_id`, `event_time`, `currency`, `importance`, `event_name`, `forecast`, `previous`, `actual`, `url`, `fetched_at`).
5. Récupérer la **clé `service_role`** : `Project Settings` → `API` → `service_role` (secret). Copiée dans `.env` plus bas.

---

## 🐍 Étape 2 — Déployer le script sur le VPS Windows

### 2.1 — Cloner le repo

Choisir un emplacement stable (ex. `C:\edgefx\` ou là où est le scraper MT5 existant) :

```powershell
# Exemple : si les scrapers sont dans C:\edgefx\
cd C:\edgefx\
git clone https://github.com/tradingluca31-boop/site-rapport-trading-.git
cd site-rapport-trading-\scraper-forexfactory
```

Noter le **chemin absolu** du dossier — sera utile pour le Task Scheduler. Ex : `C:\edgefx\site-rapport-trading-\scraper-forexfactory\`.

### 2.2 — Environnement Python (venv recommandé)

```powershell
# Vérifier Python
python --version

# Créer un venv (évite de polluer le Python global)
python -m venv .venv

# Activer (PowerShell)
.\.venv\Scripts\Activate.ps1
# Si erreur ExecutionPolicy :
# Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Installer deps
pip install -r requirements.txt
```

### 2.3 — Config `.env`

```powershell
Copy-Item .env.example .env
notepad .env
```

Remplir :
```
SUPABASE_URL=https://kzwsokuppgcbkjphecpn.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<COLLER_LA_CLE_SERVICE_ROLE_ICI>
```

Le script Python charge automatiquement `.env` au démarrage (loader intégré, pas besoin de `python-dotenv`).

### 2.4 — Test manuel (dry-run)

```powershell
.\.venv\Scripts\Activate.ps1
python forexfactory_scraper.py --dry-run
```

Doit afficher ~150-250 events. Si OK, test réel :

```powershell
python forexfactory_scraper.py
```

Sortie attendue : `[ok] X events upserts dans ff_calendar @ ...`

Vérifier dans Supabase `Table Editor > ff_calendar` : les rows doivent apparaître.

---

## ⏰ Étape 3 — Automatisation via Task Scheduler Windows

### 3.1 — Tester le wrapper PowerShell manuellement

```powershell
powershell.exe -ExecutionPolicy Bypass -File .\windows\run.ps1
```

Doit produire un fichier `scraper.log` dans le dossier `scraper-forexfactory\` avec le résultat.

### 3.2 — Enregistrer la tâche planifiée

Lancer **PowerShell en Administrateur**, puis :

```powershell
cd C:\edgefx\site-rapport-trading-\scraper-forexfactory\windows
powershell.exe -ExecutionPolicy Bypass -File .\register-task.ps1
```

Ce script :
- Crée une tâche nommée `ForexFactoryScraper`.
- Déclenche une première exécution 2 min après maintenant.
- Répète **toutes les 30 minutes**, à perpétuité.
- Fonctionne même si le VPS est redémarré (trigger `StartWhenAvailable`).
- Tourne sous l'utilisateur courant (`$env:USERNAME`) avec `RunLevel Highest`.

### 3.3 — Vérifications

```powershell
# État de la tâche
Get-ScheduledTask -TaskName ForexFactoryScraper
Get-ScheduledTaskInfo -TaskName ForexFactoryScraper

# Lancer manuellement maintenant (sans attendre le trigger)
Start-ScheduledTask -TaskName ForexFactoryScraper

# Tail du log
Get-Content .\scraper.log -Tail 30 -Wait
```

Alternativement : UI Task Scheduler → `taskschd.msc` → `Task Scheduler Library` → la tâche est visible, `Last Run Result` doit être `(0x0)` = succès.

---

## 🔍 Debug / erreurs courantes

| Erreur | Cause | Fix |
|---|---|---|
| `ModuleNotFoundError: requests` | venv pas activé dans run.ps1 | Vérifier que `.venv\Scripts\python.exe` existe, sinon recréer le venv |
| `[error] SUPABASE_URL ... requises` | `.env` pas à côté du script, ou mal formaté | `.env` doit être dans `scraper-forexfactory\` (pas dans `windows\`) |
| HTTP 401 upsert | Mauvaise clé | Utiliser `service_role`, pas `anon` |
| HTTP 404 upsert | Table pas créée | Lancer `sql/001_ff_calendar.sql` |
| `ExecutionPolicy` bloque `.ps1` | Windows par défaut bloque les scripts | `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` |
| Tâche planifiée `Last Run Result = 0x1` | Voir `scraper.log` pour détails | Relancer manuel + analyser |
| `python` introuvable dans run.ps1 | Pas de venv ou path bizarre | Éditer `run.ps1` ligne `$pythonExe` pour mettre un chemin absolu |

---

## 🔐 Sécurité

- `.env` contient `SUPABASE_SERVICE_ROLE_KEY` — clé d'écriture complète. **Ne jamais commit.**
- Le fichier `.env` n'est pas suivi par git (à confirmer avec `git status` : il ne doit pas apparaître).
- Si la clé fuit : Supabase Dashboard → Project Settings → API → `Reset service_role`.
- La tâche tourne sous le user Windows courant — OK pour un VPS dédié Luca.

---

## 🔁 Étape 4 — Côté site Next.js (à faire plus tard par Luca, PAS sur le VPS)

Actuellement, le site fetch le XML ForexFactory **live** via une route API Next.js (`/api/calendar/forexfactory`) avec cache 30 min Vercel. Cela fonctionne déjà.

Une fois le scraper VPS opérationnel et que la table `ff_calendar` est remplie, Luca basculera le site pour lire depuis Supabase `ff_calendar` (plus fiable, permet historique). **Cette étape est à faire sur le PC dev Windows de Luca, pas sur le VPS.**

---

## 📊 Volume attendu

- ~150-250 events/semaine (this week + next week)
- ~600-1000 events/mois
- Upsert idempotent par `event_id` → pas de doublons même si le scraper tourne 100x par jour
- Optionnel : cleanup mensuel des events > 60 jours (commande SQL commentée en bas de `sql/001_ff_calendar.sql`)

---

## ✅ Checklist déploiement VPS Windows

- [ ] Table `ff_calendar` créée dans Supabase
- [ ] Clé `service_role` copiée
- [ ] Repo `site-rapport-trading-` cloné à un emplacement stable sur le VPS
- [ ] Python 3.8+ installé et accessible (`python --version`)
- [ ] `python -m venv .venv` + activation + `pip install -r requirements.txt`
- [ ] `.env` créé + rempli (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
- [ ] `python forexfactory_scraper.py --dry-run` → ~150-250 events listés
- [ ] `python forexfactory_scraper.py` → rows visibles dans Supabase `ff_calendar`
- [ ] `run.ps1` fonctionne manuellement (crée `scraper.log`)
- [ ] `register-task.ps1` exécuté en admin → tâche `ForexFactoryScraper` créée
- [ ] Après 30 min : `Get-ScheduledTaskInfo` montre `LastTaskResult = 0` et `LastRunTime` récent
- [ ] Supabase : `fetched_at` des rows se met à jour toutes les 30 min
