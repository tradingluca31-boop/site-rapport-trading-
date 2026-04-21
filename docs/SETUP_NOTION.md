# Import Notion — Setup (5 min)

Objectif : cliquer sur "Importer Notion" dans Rapport → synchronise tous les trades depuis `JOURNAL DE TRADING 2026` vers Supabase.

## 1. Créer une Notion Integration

1. Va sur https://www.notion.so/my-integrations
2. "New integration" → Nom : `EdgeFX Import` → Workspace : le tien → Submit
3. Copie le **Internal Integration Token** (commence par `secret_...` ou `ntn_...`)

## 2. Partager la DB avec l'intégration

1. Ouvre la page `JOURNAL DE TRADING 2026` sur Notion
2. En haut à droite : `...` → `Connections` → ajoute `EdgeFX Import`

## 3. Récupérer l'ID de la DB

À partir de l'URL :
```
https://www.notion.so/JOURNAL-DE-TRADING-2026-2e28a00082ca810fbf16f0ef1bbf553e
```
→ ID = `2e28a00082ca810fbf16f0ef1bbf553e`

(Si ton lien a des tirets, garde-les tels quels ou enlève-les, les deux marchent côté API.)

## 4. Ajouter les variables d'env sur Vercel

Vercel → Project `site-rapport-trading` → Settings → Environment Variables :

| Nom | Valeur |
|---|---|
| `NOTION_TOKEN` | `secret_xxx...` (étape 1) |
| `NOTION_TRADES_DB_ID` | `2e28a00082ca810fbf16f0ef1bbf553e` |

Environnement : **Production** (coche aussi Preview si tu veux tester en branch).

Puis **redeploy** le projet pour que les env soient prises en compte.

## 5. Schéma Notion attendu

Le script reconnaît automatiquement ces propriétés (plusieurs noms possibles pour chaque) :

| Champ trade | Notion property type | Noms reconnus |
|---|---|---|
| date (obligatoire) | Date | `Date`, `Jour`, `Day` |
| pair (obligatoire) | Title / Rich text / Select | `Paire`, `Pair`, `Symbol`, `Symbole`, `Instrument`, `Actif` |
| direction (obligatoire) | Select | `Direction`, `Sens`, `Side` (valeurs : long/short/buy/sell/achat/vente) |
| status | Select / Status | `Statut`, `Status`, `Etat` (valeurs : open/win/loss/cancel + variantes FR) |
| entry | Rich text / Number | `Entry`, `Entrée` |
| sl | Rich text / Number | `SL`, `Stop`, `Stop Loss` |
| tp | Rich text / Number | `TP`, `Target`, `Take Profit` |
| size | Rich text / Number | `Size`, `Taille`, `Lot`, `Lots`, `Volume` |
| pnl | Rich text / Number | `PnL`, `P&L`, `PNL`, `Résultat`, `R` |
| idea | Rich text | `Idée`, `Idea`, `Thèse`, `Thesis` |
| notes | Rich text | `Notes`, `Note`, `Commentaire` |
| tags | Multi-select | `Tags`, `Catégorie` |

> Si une ligne Notion n'a pas de `Date`, `Paire` ou `Direction` → elle est ignorée.

## 6. Lancer l'import

1. Ouvre https://edgefx.vercel.app/rapport
2. Clique **Importer Notion** en haut à droite
3. Attends 1-5 sec → message vert `Import OK : X trades synchronisés`

## Dédup

L'import utilise `notion_id` comme clé de dédoublonnage (colonne unique en DB).
Tu peux cliquer Importer autant de fois que tu veux : les trades existants seront **mis à jour**, pas dupliqués.

## Troubleshooting

- **"NOTION_TOKEN manquant"** → tu n'as pas ajouté les env Vercel ou pas redeploy
- **"Notion API 404"** → la DB n'est pas partagée avec l'intégration (étape 2)
- **"Aucun trade récupérable"** → les propriétés Notion n'ont pas les noms reconnus (étape 5) ; renomme-les ou ajoute ton nom à la liste dans `src/lib/notion.ts`
