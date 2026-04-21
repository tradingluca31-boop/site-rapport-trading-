# ForexFactory Scraper — briefing Claude Code (exécution sur **VPS Windows**)

> Ce document est destiné à **une instance de Claude Code qui tourne sur le VPS Windows de Luca** (pas le PC Windows local de dev).
> Il contient à la fois le **contexte projet** (pour que tu comprennes à quoi ça sert) et les **étapes techniques** de déploiement.

---

## 🧭 Contexte : qui est Luca, c'est quoi le projet

**Luca** est trader algorithmique. Il travaille sur XAUUSD (or) et les majors FX, avec pour objectif de passer un challenge **FTMO** (firme de prop trading, max DD 10 %, profit target 10 %). Il combine trading **manuel** (analyse technique + fondamentale) et bots/EA (stable-baselines3, MT5).

Il a un écosystème de sites/outils :

- **`site-rapport-trading.vercel.app`** (où vit ce repo) → terminal web pour sa **préparation de semaine** : calendrier éco, thèses macro, scénarios d'events, analyses fonda, journal de trades. C'est son "cockpit" pour décider quoi trader.
- **`edgefx.vercel.app`** → terminal de sentiment retail (Myfxbook Community Outlook).
- **Un bot Telegram** qui relaie des wraps quotidiens / alertes.

Ce scraper que tu vas déployer sert à **alimenter le site site-rapport-trading**. Sans lui, la page `/preparation` affiche un calendrier incomplet.

## 🎯 À quoi sert ce scraper concrètement

Le site a besoin d'afficher **tous** les events éco de la semaine pour que Luca puisse préparer ses trades :

- **IPC / CPI** (inflation) — core, headline, m/m, y/y
- **IPP / PPI** (producteurs)
- **Taux de chômage / Claimant Count / NFP / Earnings**
- **PMI, ISM, Retail Sales, ZEW, Ifo, Michigan**
- **Décisions de taux** (Fed, BCE, BoE, BoJ, BoC, SNB, RBA, RBNZ)
- **Discours** (Powell, Lagarde, Bailey, Waller, etc.)

Ces events **déplacent les marchés** → Luca doit les avoir à l'œil, écrire des scénarios (bull / base / bear), et parfois s'abstenir de trader pendant les releases majeures (risque FTMO).

### Le problème à résoudre

Le VPS fait déjà tourner un scraper MT5 FTMO (`mt5_scraper.py`) qui remplit la table Supabase `mt5_calendar`. Mais **MT5 FTMO ne fournit pas un calendrier complet** : beaucoup d'events manquent (exemples observés le 21 avril 2026 : UK Claimant Count, UK Unemployment Rate, UK Average Earnings, ZEW, US Retail Sales, discours Fed…).

D'où ce deuxième scraper : il récupère le calendrier officiel **ForexFactory** (via le mirror XML `faireconomy.media`) et remplit une **deuxième table** `ff_calendar` dans la même base Supabase. Le site Next.js merge les deux sources (dédoublonnage automatique par devise + date + heure + titre).

## 🗺️ Vue d'ensemble de l'architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│  VPS WINDOWS (tourne H24, indépendant du PC de Luca)                │
│                                                                     │
│  ┌─────────────────────┐        ┌──────────────────────────┐        │
│  │ MT5 + mt5_scraper   │        │ forexfactory_scraper.py  │        │
│  │ (déjà en place)     │        │ (CE QUE TU VAS DÉPLOYER) │        │
│  └──────────┬──────────┘        └─────────────┬────────────┘        │
│             │ toutes les X min               │ toutes les 30 min    │
└─────────────┼────────────────────────────────┼──────────────────────┘
              │ upsert                         │ upsert
              ▼                                ▼
┌──────────────────────────────────────────────────────────────────┐
│  SUPABASE (cloud, projet MEMOIRE EA)                             │
│  ┌─────────────────┐           ┌─────────────────────────────┐   │
│  │  mt5_calendar   │           │  ff_calendar (À CRÉER)      │   │
│  │  (existant)     │           │                             │   │
│  └────────┬────────┘           └──────────────┬──────────────┘   │
└───────────┼───────────────────────────────────┼──────────────────┘
            │            SELECT (merge)         │
            └───────────────┬───────────────────┘
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│  VERCEL — site-rapport-trading.vercel.app                        │
│  Next.js 14 / TypeScript                                         │
│  Page /preparation → lit les 2 tables, dédoublonne, affiche      │
│                     le calendrier économique complet             │
└──────────────────────────────────────────────────────────────────┘
                            ▲
                            │ consulte
                            │
                          LUCA
                  (trader, son cockpit)
```

### Ton rôle (Claude Code VPS)

Tu vas :
1. Créer une **table Supabase** (`ff_calendar`) via un SQL.
2. Cloner le repo, installer Python + dépendances dans un venv.
3. Configurer un `.env` avec les clés Supabase.
4. Tester manuellement le scraper (dry-run puis run réel).
5. Enregistrer une **tâche planifiée Windows** qui relance le scraper toutes les 30 min, même si personne n'est connecté au VPS.
6. Vérifier que ça tourne et remonter la checklist remplie à Luca.

**Tu ne touches PAS au site Next.js.** Le site a déjà une API fallback qui fetch le XML live en direct — il continuera à fonctionner pendant ta mise en place. Quand `ff_calendar` sera peuplée, Luca basculera la lecture côté site (sur son PC local, pas sur le VPS).

## 🔗 Stack & conventions

- **Langage scraper** : Python 3.8+, une seule dépendance (`requests`).
- **Orchestration** : Windows Task Scheduler (pas cron, pas systemd).
- **Base** : Supabase PostgreSQL, auth par clé `service_role` (écriture, bypass RLS).
- **Source de données** : `https://nfs.faireconomy.media/ff_calendar_thisweek.xml` + `_nextweek.xml` (mirror public officiel ForexFactory, pas d'API key requise, encoding `windows-1252`).
- **Dédoublonnage** : clé primaire `event_id` = hash SHA1 court de `currency|utc_iso|title` → un upsert est idempotent, le scraper peut tourner 100 fois sur la même semaine sans créer de doublons.

## 💡 Points importants à garder en tête

- Le scraper **ne doit jamais bloquer le VPS** : timeout HTTP 20 s, 3 retries, exit propre en cas d'erreur — la tâche planifiée réessaiera 30 min plus tard.
- Les **logs** sont dans `scraper.log` à côté du script → vérifier ce fichier avant Supabase si tu doutes.
- `.env` contient une **clé service_role** = accès écriture complet. Si elle fuit : Luca reset dans Supabase Dashboard. Jamais commit, jamais log verbeux.
- L'heure des events dans le XML est en **UTC**, pas en ET (vérifié empiriquement) → le script stocke en `timestamptz` UTC, le site convertit en heure locale Paris côté client.
- En cas de doute sur une manip destructive (effacer table, changer policy RLS, modifier la tâche existante `mt5_scraper`) → **demande à Luca** avant de faire, ne pas agir seul.

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
