// Traduction FR des annonces eco MT5/Myfxbook vers le francais trader.
// Conserve m/m, y/y, q/q car standards internationaux.

const DIRECT: Array<[RegExp, string]> = [
  // Inflation
  [/^CPI\b/i, "IPC"],
  [/^Core CPI\b/i, "IPC sous-jacent"],
  [/^PPI\b/i, "IPP"],
  [/^Core PPI\b/i, "IPP sous-jacent"],
  [/^RPI\b/i, "Indice des prix de detail"],
  [/\bInflation Rate\b/i, "Taux d'inflation"],
  [/\bHICP\b/i, "IPCH"],

  // Emploi
  [/^Non[- ]Farm Payrolls?\b/i, "Emplois non agricoles (NFP)"],
  [/^NFP\b/i, "Emplois non agricoles (NFP)"],
  [/\bUnemployment Rate\b/i, "Taux de chomage"],
  [/\bUnemployment Claims?\b/i, "Inscriptions au chomage"],
  [/\bInitial Jobless Claims\b/i, "Inscriptions hebdo au chomage"],
  [/\bContinuing Claims\b/i, "Chomeurs continus"],
  [/\bClaimant Count Change\b/i, "Variation des demandeurs d'emploi"],
  [/\bEmployment Change\b/i, "Variation de l'emploi"],
  [/\bADP (Employment|Non[- ]Farm)\b/i, "Emploi prive ADP"],
  [/\bAverage Weekly Earnings\b/i, "Salaires hebdo moyens"],
  [/\bAverage Earnings\b/i, "Salaires moyens"],
  [/\bAverage Hourly Earnings\b/i, "Salaires horaires moyens"],
  [/\bParticipation Rate\b/i, "Taux de participation"],
  [/\bJOLTS\b/i, "Offres d'emploi JOLTS"],
  [/\bJob Openings\b/i, "Offres d'emploi"],
  [/\bLabor Force\b/i, "Population active"],

  // Croissance
  [/^GDP\b/i, "PIB"],
  [/\bRetail Sales\b/i, "Ventes au detail"],
  [/\bIndustrial Production\b/i, "Production industrielle"],
  [/\bManufacturing Production\b/i, "Production manufacturiere"],
  [/\bDurable Goods\b/i, "Biens durables"],
  [/\bFactory Orders\b/i, "Commandes industrielles"],
  [/\bTrade Balance\b/i, "Balance commerciale"],
  [/\bCurrent Account\b/i, "Balance courante"],
  [/\bConstruction PMI\b/i, "PMI construction"],
  [/\bServices PMI\b/i, "PMI services"],
  [/\bManufacturing PMI\b/i, "PMI manufacturier"],
  [/\bComposite PMI\b/i, "PMI composite"],
  [/\bISM Manufacturing\b/i, "ISM manufacturier"],
  [/\bISM (Non[- ]Manufacturing|Services)\b/i, "ISM services"],
  [/\bBuilding Permits\b/i, "Permis de construire"],
  [/\bHousing Starts\b/i, "Mises en chantier"],
  [/\bNew Home Sales\b/i, "Ventes de logements neufs"],
  [/\bExisting Home Sales\b/i, "Ventes de logements existants"],

  // Politique monetaire
  [/\bInterest Rate Decision\b/i, "Decision sur les taux"],
  [/\bRate Decision\b/i, "Decision sur les taux"],
  [/\bCash Rate\b/i, "Taux directeur"],
  [/\bFOMC Minutes\b/i, "Minutes du FOMC"],
  [/\bFOMC Statement\b/i, "Communique FOMC"],
  [/\bECB Monetary Policy Statement\b/i, "Communique BCE"],
  [/\bMonetary Policy Statement\b/i, "Communique de politique monetaire"],
  [/\bRefi Rate\b/i, "Taux de refinancement"],
  [/\bDeposit Rate\b/i, "Taux de depot"],

  // Sentiment
  [/\bZEW (Economic Sentiment|Sentiment)\b/i, "Sentiment economique ZEW"],
  [/\bIFO Business Climate\b/i, "Climat des affaires IFO"],
  [/\bMichigan Consumer Sentiment\b/i, "Sentiment conso Michigan"],
  [/\bConsumer Confidence\b/i, "Confiance des consommateurs"],
  [/\bConsumer Sentiment\b/i, "Sentiment consommateurs"],
  [/\bBusiness Confidence\b/i, "Confiance des entreprises"],
  [/\bBusiness Climate\b/i, "Climat des affaires"],
  [/\bBusiness Outlook Survey\b/i, "Enquete perspectives entreprises"],
  [/\bTankan\b/i, "Tankan (grandes entreprises)"],

  // Speaks / discours — pattern specifique
  [/\bPress Conference\b/i, "Conference de presse"],
  [/\bTestimony\b/i, "Temoignage"],
];

const SPEAKER_PATTERNS: Array<[RegExp, (m: RegExpMatchArray) => string]> = [
  // "Fed Governor X Speech" / "Fed Chair X Speech" / "ECB President X Speech"
  [
    /^(Fed|FOMC|ECB|BoE|BoC|BoJ|SNB|RBA|RBNZ)\s+(Governor|Chair|President|Vice[- ]President|Chairman|Chairwoman|Member|Board Member|Official)\s+(.+?)\s+Speech$/i,
    (m) => `Discours ${m[2].replace(/[- ]/g, " ")} ${m[1]} ${m[3]}`,
  ],
  [
    /^(Fed|FOMC|ECB|BoE|BoC|BoJ|SNB|RBA|RBNZ)\s+(Governor|Chair|President|Vice[- ]President|Chairman|Chairwoman|Member|Board Member|Official)\s+(.+?)\s+Speaks$/i,
    (m) => `Discours ${m[2].replace(/[- ]/g, " ")} ${m[1]} ${m[3]}`,
  ],
  // "ECB President Lagarde Speech"
  [
    /^(ECB|Fed|BoE|BoC|BoJ)\s+(President|Chair)\s+(\w+)\s+(Speech|Speaks|Testimony)$/i,
    (m) => `Discours ${m[2]} ${m[1]} (${m[3]})`,
  ],
  // "Fed X Speech"
  [
    /^(Fed|FOMC|ECB|BoE|BoC|BoJ|SNB|RBA|RBNZ)\s+(.+?)\s+Speech$/i,
    (m) => `Discours ${m[1]} ${m[2]}`,
  ],
  // "X Speaks"
  [/^(.+?)\s+Speaks$/i, (m) => `Discours ${m[1]}`],
];

function applyDirect(name: string): string | null {
  for (const [re, fr] of DIRECT) {
    if (re.test(name)) {
      return name.replace(re, fr);
    }
  }
  return null;
}

function applySpeakers(name: string): string | null {
  for (const [re, fn] of SPEAKER_PATTERNS) {
    const m = name.match(re);
    if (m) return fn(m);
  }
  return null;
}

export function translateEventName(raw: string): string {
  if (!raw) return raw;
  const trimmed = raw.trim();

  const speaker = applySpeakers(trimmed);
  if (speaker) return speaker;

  const direct = applyDirect(trimmed);
  if (direct) return direct;

  return trimmed;
}
