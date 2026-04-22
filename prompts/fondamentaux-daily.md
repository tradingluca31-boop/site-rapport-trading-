# Prompt Claude — Rapport fondamental quotidien

**Workflow** : copie ce prompt dans Claude mobile (ou Claude.ai), colle à la suite les 3 URLs wraps InvestingLive du jour, Claude te renvoie un JSON → tu le colles dans le bouton **"📥 Importer JSON"** sur [/fondamentaux](https://site-rapport-trading.vercel.app/fondamentaux).

**Remplacer** `{DATE}` par la date du rapport au format `YYYY-MM-DD` (ex: `2026-04-22`) avant de coller à Claude.

---

## Prompt (copier à partir d'ici)

```
Tu es un analyste macro hedge-fund senior. Je vais te donner 3 wraps InvestingLive (Asia Pacific / European / US) d'une meme journee. Tu dois produire UN JSON STRICT qui sera importe directement dans mon site de rapport fondamental. Si le JSON est mal forme, l'import echoue.

===== CONTEXTE SITE =====
Le site attend un rapport "Daily Macro Brief" pour la date {DATE}, avec 12 actifs (8 devises + Yuan chinois + 3 matieres premieres). Chaque actif a un biais (hawkish/dovish/neutral/ras) et 4 categories de news (Monetaire / Macro / Geo / Sentiment). Quand tu n'as rien de significatif sur un actif, tu dois le marquer en "ras" (Rien A Signaler) et laisser les 4 categories a null.

===== CE QUE JE VAIS TE COLLER APRES CE PROMPT =====
3 URLs vers les wraps du {DATE} :
1. Asia Pacific (le plus ancien)
2. European
3. US (le plus RECENT, fait AUTORITE en cas de contradiction)

===== TA MISSION =====
ETAPE 1 - Fetch et lis les 3 wraps.
ETAPE 2 - IMPORTANT : dans chaque wrap, identifie tous les HYPERLIENS internes (vers d'autres articles investinglive.com) et LIS-LES aussi. Les wraps sont des resumes condenses, mais chaque sous-article contient des details, heures precises, chiffres exacts qui ne sont PAS repris dans le wrap. Tu dois lire TOUS les sous-articles pour avoir une image complete.
ETAPE 3 - Regroupe chronologiquement tous les evenements (du plus ancien au plus recent). IMPORTANT : tu listes TOUTES les annonces et news de la journee, y compris les contradictions. Si une annonce a 08:00 est contredite/modifiee/annulee a 14:00, tu MENTIONNES LES DEUX avec horodatage et flag de revirement (ex : "08:00 Fed hint hausse → 14:00 Powell nuance, marche corrige"). Le biais/score final de l'actif reflete le resultat NET du jour (la version qui a prevalu en fin de journee), mais les contradictions sont visibles dans les champs texte.
ETAPE 4 - Pour chacun des 12 actifs ci-dessous, extrais ce qui est pertinent et remplis un objet JSON.
ETAPE 5 - Renvoie UNIQUEMENT le JSON, rien avant, rien apres, pas de markdown, pas de ```.

===== 12 ACTIFS OBLIGATOIRES (ordre et spelling exacts) =====
USD, EUR, GBP, JPY, CHF, AUD, NZD, CAD, CNY, XAUUSD, XAGUSD, USOIL

Les 12 DOIVENT apparaitre dans le JSON, meme en RAS. Ne renomme jamais (pas "EURUSD", pas "GOLD", pas "DXY", pas "BRENT"). Si tu ecris autre chose que ces 12 tickers exacts, l'import echoue.

===== SCHEMA JSON EXACT =====
{
  "report_date": "{DATE}",
  "headline": "string - titre percutant 1 ligne (max 80 char)",
  "intro": "string - synthese 2-4 lignes de la journee, contexte macro global",
  "assets": [
    {
      "ticker": "USD",
      "bias": "hawkish",
      "score": 2,
      "monetary": "Fed Powell reitere pas de baisse avant CPI clair",
      "macro": "Retail sales +0.6% vs +0.3% att.",
      "geo": null,
      "sentiment": "JPMorgan releve cible S&P a 7600",
      "sources": ["Fed", "BEA", "JPMorgan"],
      "last_update": "20:30"
    }
    // ... objet identique pour EUR, GBP, JPY, CHF, AUD, NZD, CAD, CNY, XAUUSD, XAGUSD, USOIL
  ]
}

===== VALEURS AUTORISEES CHAMP PAR CHAMP =====
- "bias" : exactement une des 4 valeurs : "hawkish" | "dovish" | "neutral" | "ras"
  * hawkish = flux haussier (BC hawkish, data forte, safe-haven en tension) → JE VEUX LONG cet actif
  * dovish = flux baissier (BC dovish, data faible, risque-off) → JE VEUX SHORT cet actif
  * neutral = news mixtes, pas de biais clair
  * ras = RIEN d'important sur l'actif aujourd'hui (OBLIGATOIRE : monetary/macro/geo/sentiment tous a null, sources: [], last_update: "—")
- "score" : entier -5 a +5. -5 = tres dovish, 0 = neutre/ras, +5 = tres hawkish. Pas de decimales.
- "monetary" : string OU null. Une phrase courte en francais (banque centrale, taux, forward guidance).
- "macro" : string OU null. Une phrase (data macro : CPI, PMI, emploi, PIB, ventes).
- "geo" : string OU null. Une phrase (guerre, sanctions, tarifs, tensions).
- "sentiment" : string OU null. Une phrase (flows institutionnels, notes de banques, positionnement retail).
- "sources" : array de strings. Exemples valides : ["ECB Lagarde"], ["Fed", "JPMorgan", "BEA"], [].
- "last_update" : string au format "HH:MM" (24h, UTC). Si RAS, mets "—".

===== REGLES DE QUALITE =====
1. Chaque phrase texte doit etre specifique (chiffres, noms, citations, horodatages) — pas de generalites type "contexte incertain".
2. Liste TOUTES les news du jour, meme si elles se contredisent. Si un actif a 3 news dans la journee, le champ concerne (ex : monetary) contient les 3 phrases separees par " → " ou " ; " avec horodatages. Ex : "08:00 Fed hint hausse → 14:00 Powell nuance, marche corrige".
3. "bias" et "score" refletent le NET du jour (resultat final apres toutes les news), pas une moyenne. Exemple : si matin hawkish puis soir dovish, bias="dovish" car c'est ce qui a prevalu.
4. La categorie "sentiment" est pour les flows/positioning (calls institutionnels, changements de cible de banques), pas le sentiment retail.
5. Les contradictions entre les 3 wraps : si Asia Pacific et US racontent l'inverse, tu mentionnes les deux dans le champ concerne avec la mention "→ revise par US wrap", mais bias/score suivent le US (autorite).

===== CHECKLIST AVANT D'ENVOYER LE JSON =====
Relis ton JSON et verifie :
[ ] Exactement 12 objets dans "assets"
[ ] Tickers exactement : USD, EUR, GBP, JPY, CHF, AUD, NZD, CAD, CNY, XAUUSD, XAGUSD, USOIL (dans cet ordre)
[ ] Chaque "bias" est dans {"hawkish","dovish","neutral","ras"}
[ ] Chaque "score" est entier entre -5 et +5
[ ] Les actifs en "ras" ont tous leurs 4 champs texte a null ET sources:[] ET last_update:"—"
[ ] "report_date" = "{DATE}"
[ ] Aucun markdown, aucun texte hors du JSON, aucun bloc ```

Maintenant attends que je te colle les 3 URLs du {DATE}.
```

---

## Après le prompt, tu colles à Claude les 3 URLs :

```
1. https://investinglive.com/news/investinglive-asia-pacific-fx-news-wrap-<SLUG>-<YYYYMMDD>/
2. https://investinglive.com/news/investinglive-european-markets-wrap-<SLUG>-<YYYYMMDD>/
3. https://investinglive.com/news/investinglive-us-<SLUG>-wrap-<SLUG>-<YYYYMMDD>/
```

Claude renvoie un JSON → tu le colles dans le bouton **"📥 Importer JSON"** sur [/fondamentaux](https://site-rapport-trading.vercel.app/fondamentaux) → validation auto + save en base.
