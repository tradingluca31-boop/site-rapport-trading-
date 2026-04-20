// Traduction FR des annonces eco MT5/Myfxbook vers le francais trader.
// Conserve m/m, y/y, q/q car standards internationaux.
// Les patterns s'appliquent dans l'ordre, en chaine.

type Rule = [RegExp, string | ((m: RegExpMatchArray) => string)];

// 1) Patterns speakers prioritaires — si matche, on renvoie directement
const SPEAKER_PATTERNS: Array<[RegExp, (m: RegExpMatchArray) => string]> = [
  // "Bbk Executive Board Member X Speech" -> "Discours Bundesbank (X, Membre du directoire)"
  [
    /^Bbk\s+Executive\s+Board\s+Member\s+(.+?)\s+Speech$/i,
    (m) => `Discours Bundesbank (${m[1]}, Membre du directoire)`,
  ],
  // "ECB Executive Board Member X" (avec ou sans Speech)
  [
    /^ECB\s+Executive\s+Board\s+Member\s+(.+?)(?:\s+Speech)?$/i,
    (m) => `Discours ECB (${m[1]}, Membre du directoire)`,
  ],
  // "ECB Vice President X Speech" -> "Discours Vice President ECB (X)"
  [
    /^ECB\s+Vice[- ]President\s+de\s+(\w+)\s+Speech$/i,
    (m) => `Discours Vice President ECB (de ${m[1]})`,
  ],
  [
    /^(ECB|Fed|BoE|BoC|BoJ|SNB|RBA|RBNZ)\s+Vice[- ]President\s+(.+?)\s+Speech$/i,
    (m) => `Discours Vice President ${m[1]} (${m[2]})`,
  ],
  // "ECB President Lagarde Speech"
  [
    /^(ECB|Fed|BoE|BoC|BoJ|SNB|RBA|RBNZ)\s+(President|Chair|Chairman|Chairwoman)\s+(.+?)\s+Speech$/i,
    (m) => `Discours ${m[2]} ${m[1]} (${m[3]})`,
  ],
  // "Fed Governor Waller Speech"
  [
    /^(Fed|FOMC|ECB|BoE|BoC|BoJ|SNB|RBA|RBNZ)\s+(Governor|Member|Board Member|Official)\s+(.+?)\s+Speech$/i,
    (m) => `Discours ${m[2]} ${m[1]} (${m[3]})`,
  ],
  // Fallback speeches
  [
    /^(Fed|FOMC|ECB|BoE|BoC|BoJ|SNB|RBA|RBNZ)\s+(.+?)\s+Speech$/i,
    (m) => `Discours ${m[1]} ${m[2]}`,
  ],
  [/^(.+?)\s+Speaks$/i, (m) => `Discours ${m[1]}`],
];

// 2) Remplacements en chaine (tous appliques dans l'ordre)
const CHAIN_RULES: Rule[] = [
  // Suffixes temporels
  [/\b(\d+)[- ]?Months?\b/gi, "$1 mois"],
  [/\b(\d+)[- ]?Weeks?\b/gi, "$1 semaines"],
  [/\b(\d+)[- ]?Days?\b/gi, "$1 jours"],
  // NE PAS traduire "5-Year" dans "5-Year TIPS Auction" (bond label) -> geré plus bas

  // Inflation
  [/\bCore CPI\b/gi, "IPC sous-jacent"],
  [/\bCore PPI\b/gi, "IPP sous-jacent"],
  [/\bCore PCE\b/gi, "PCE sous-jacent"],
  [/\bPCE Price Index\b/gi, "Indice PCE"],
  [/\bCPI\b/gi, "IPC"],
  [/\bPPI\b/gi, "IPP"],
  [/\bRPI\b/gi, "Indice des prix de detail"],
  [/\bHICP\b/gi, "IPCH"],
  [/\bInflation Rate\b/gi, "Taux d'inflation"],
  [/\bexcl\.?\s+Food and Energy\b/gi, "hors alimentaire et energie"],
  [/\bexcluding\s+Food and Energy\b/gi, "hors alimentaire et energie"],
  [/\bFood and Energy\b/gi, "alimentaire et energie"],

  // Emploi
  [/\bNon[- ]Farm Payrolls?\b/gi, "Emplois non agricoles (NFP)"],
  [/\bNFP\b/g, "Emplois non agricoles (NFP)"],
  [/\bUnemployment Rate\b/gi, "Taux de chomage"],
  [/\bInitial Jobless Claims\b/gi, "Inscriptions hebdo au chomage"],
  [/\bJobless Claims\b/gi, "Inscriptions au chomage"],
  [/\bContinuing Claims\b/gi, "Chomeurs continus"],
  [/\bClaimant Count Change\b/gi, "Variation demandeurs d'emploi"],
  [/\bClaimant Count\b/gi, "Demandeurs d'emploi"],
  [/\bEmployment Change\b/gi, "Variation de l'emploi"],
  [/\bADP Employment\b/gi, "Emploi prive ADP"],
  [/\bADP Non[- ]Farm\b/gi, "Emploi prive ADP"],
  [/\bAverage Weekly Earnings\b/gi, "Salaires hebdo moyens"],
  [/\bAverage Hourly Earnings\b/gi, "Salaires horaires moyens"],
  [/\bAverage Earnings\b/gi, "Salaires moyens"],
  [/\bParticipation Rate\b/gi, "Taux de participation"],
  [/\bTotal Pay\b/gi, "Remuneration totale"],
  [/\bJOLTS\b/g, "Offres d'emploi JOLTS"],
  [/\bJob Openings\b/gi, "Offres d'emploi"],
  [/\bLabor Force\b/gi, "Population active"],
  [/\bLabour Force\b/gi, "Population active"],

  // Croissance / activite
  [/\bAdjusted Trade Balance\b/gi, "Balance commerciale ajustee"],
  [/\bTrade Balance\b/gi, "Balance commerciale"],
  [/\bAdjusted Current Account\b/gi, "Balance courante ajustee"],
  [/\bCurrent Account\b/gi, "Balance courante"],
  [/\bGDP\b/g, "PIB"],
  [/\bRetail Sales\b/gi, "Ventes au detail"],
  [/\bIndustrial Production\b/gi, "Production industrielle"],
  [/\bManufacturing Production\b/gi, "Production manufacturiere"],
  [/\bDurable Goods Orders?\b/gi, "Commandes de biens durables"],
  [/\bDurable Goods\b/gi, "Biens durables"],
  [/\bFactory Orders?\b/gi, "Commandes industrielles"],
  [/\bConstruction PMI\b/gi, "PMI construction"],
  [/\bServices PMI\b/gi, "PMI services"],
  [/\bManufacturing PMI\b/gi, "PMI manufacturier"],
  [/\bComposite PMI\b/gi, "PMI composite"],
  [/\bISM Manufacturing\b/gi, "ISM manufacturier"],
  [/\bISM (Non[- ]Manufacturing|Services)\b/gi, "ISM services"],
  [/\bBuilding Permits\b/gi, "Permis de construire"],
  [/\bHousing Starts\b/gi, "Mises en chantier"],
  [/\bNew Home Sales\b/gi, "Ventes de logements neufs"],
  [/\bExisting Home Sales\b/gi, "Ventes de logements existants"],
  [/\bNew Housing Price Index\b/gi, "Indice prix logements neufs"],
  [/\bHousing Price Index\b/gi, "Indice prix logements"],
  [/\bHouse Price Index\b/gi, "Indice prix immobilier"],
  [/\bExports\b/gi, "Exportations"],
  [/\bImports\b/gi, "Importations"],
  [/\bRMPI\b/g, "Indice prix matieres premieres"],
  [/\bIPPI\b/g, "Indice prix industriels"],

  // Politique monetaire
  [/\bInterest Rate Decision\b/gi, "Decision sur les taux"],
  [/\bRate Decision\b/gi, "Decision sur les taux"],
  [/\bCash Rate\b/gi, "Taux directeur"],
  [/\bFOMC Minutes\b/gi, "Minutes du FOMC"],
  [/\bFOMC Statement\b/gi, "Communique FOMC"],
  [/\bECB Monetary Policy Statement\b/gi, "Communique BCE"],
  [/\bMonetary Policy Statement\b/gi, "Communique politique monetaire"],
  [/\bRefi Rate\b/gi, "Taux de refinancement"],
  [/\bDeposit Rate\b/gi, "Taux de depot"],

  // Sentiment
  [/\bZEW Economic Sentiment\b/gi, "Sentiment economique ZEW"],
  [/\bZEW Sentiment\b/gi, "Sentiment ZEW"],
  [/\bIFO Business Climate\b/gi, "Climat des affaires IFO"],
  [/\bMichigan Consumer Sentiment\b/gi, "Sentiment conso Michigan"],
  [/\bConsumer Confidence\b/gi, "Confiance des consommateurs"],
  [/\bConsumer Sentiment\b/gi, "Sentiment consommateurs"],
  [/\bBusiness Confidence\b/gi, "Confiance des entreprises"],
  [/\bBusiness Climate\b/gi, "Climat des affaires"],
  [/\bBusiness Outlook Survey\b/gi, "Enquete perspectives entreprises"],
  [/\bTankan\b/gi, "Tankan"],

  // Adjudications / obligations
  [/\bTIPS Auction\b/gi, "Adjudication TIPS"],
  [/\bBond Auction\b/gi, "Adjudication obligataire"],
  [/\bNote Auction\b/gi, "Adjudication obligataire"],
  [/\bBill Auction\b/gi, "Adjudication T-Bills"],
  [/\bAuction\b/gi, "Adjudication"],

  // Generique
  [/\bPress Conference\b/gi, "Conference de presse"],
  [/\bTestimony\b/gi, "Temoignage"],
  [/\bStatement\b/gi, "Communique"],
  [/\bMinutes\b/gi, "Minutes"],
  [/\bSurvey\b/gi, "Enquete"],
  [/\bOutlook\b/gi, "Perspectives"],
];

function applySpeakers(name: string): string | null {
  for (const [re, fn] of SPEAKER_PATTERNS) {
    const m = name.match(re);
    if (m) return fn(m);
  }
  return null;
}

function applyChain(name: string): string {
  let out = name;
  for (const [re, rep] of CHAIN_RULES) {
    if (typeof rep === "string") {
      out = out.replace(re, rep);
    } else {
      out = out.replace(re, (...args) => {
        const matchArr = Array.from(args).slice(0, -2) as unknown as RegExpMatchArray;
        return rep(matchArr);
      });
    }
  }
  return out;
}

export function translateEventName(raw: string): string {
  if (!raw) return raw;
  const trimmed = raw.trim();

  const speaker = applySpeakers(trimmed);
  if (speaker) return speaker;

  return applyChain(trimmed);
}
