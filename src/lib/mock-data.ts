import { WeeklyPrep, DailyReport, InstrumentBias, LibraryEntry } from "@/types";

export const currentWeek: WeeklyPrep = {
  id: "s20-2026",
  weekNumber: 20,
  year: 2026,
  startDate: "2026-05-11",
  endDate: "2026-05-15",
  theme: "Crise politique UK + transition Powell → Warsh",
  status: "en_cours",
  thesisShortTerm: "Pression interne croissante sur PM Starmer (~100 MPs Labour demandent demission). Streeting pousse, Miliband se positionne. CPI US sorti hot mardi (core MoM +0.4%) mais marche refuse de pricer USD strength : yields baissent, DXY ne se renforce pas. Transition Fed Powell → Warsh vendredi 15 mai = catalyst binaire 50/50. Risque politique UK et binaire Fed → no trade force avant Warsh, monitor + react. Biais GBP : short selectif sur rebonds 1.36-1.37, alertes setup pour cassure 1.345.",
  thesisLongTerm: "UK en political risk premium structurel 3-6 mois. Les 3 scenarios politiques (demission immediate / differee / Starmer reste fragilise) convergent dans la direction bearish GBP = asymetrie negative structurelle. Aucun retour rapide a la stabilite avant l'automne. Rebonds techniques GBPUSD vers 1.36-1.37 = opportunites de short a moyenne probabilite. Cote USD, repricing Fed hawkish massif (proba hike Dec 2026 passe de 1.6% a 38.1% en 1 mois) mais spot ne suit pas avant Warsh. Si Warsh hawkish = USD long selectif (USDJPY/USDCHF), si dovish = USD weakness + AUD bid.",
  events: [
    { id: "e1", date: "2026-04-13", time: "11:00", currency: "EUR", title: "Production industrielle Zone Euro", impact: "medium", category: "croissance" },
    { id: "e2", date: "2026-04-14", time: "14:30", currency: "USD", title: "CPI US (MoM & YoY, core & headline)", impact: "high", category: "inflation", forecast: "0.2% / 3.1%", previous: "0.3% / 3.2%" },
    { id: "e3", date: "2026-04-15", time: "20:00", currency: "USD", title: "FOMC — Decision & conference Powell", impact: "high", category: "politique_monetaire" },
    { id: "e4", date: "2026-04-16", time: "14:30", currency: "USD", title: "Jobless claims + Philly Fed", impact: "medium", category: "emploi" },
    { id: "e5", date: "2026-04-17", time: "16:00", currency: "USD", title: "Michigan — sentiment & inflation 1y", impact: "medium", category: "sentiment" },
  ],
  scenarios: [
    // --- e1 : Production industrielle Zone Euro (11h00, EUR, medium) ---
    {
      id: "sc1-1", eventId: "e1", type: "bear", title: "Production < -0.5% MoM (tres faible)",
      description: "Signal recession EZ confirme. EURUSD -0.4%, DAX sous pression, BCE renforce narrative dovish.",
      probability: 25, instruments: ["EURUSD", "DAX", "EUR10Y"], validated: false,
    },
    {
      id: "sc1-2", eventId: "e1", type: "neutral", title: "En ligne (-0.2% a +0.1%)",
      description: "Stabilisation confirmee. Reaction limitee, marche attend CPI US mardi.",
      probability: 55, instruments: ["EURUSD", "DAX"], validated: false,
    },
    {
      id: "sc1-3", eventId: "e1", type: "bull", title: "Production > +0.3% (rebond)",
      description: "Signal reprise EZ. EURUSD +0.3% vers 1.0930, BCE peut ralentir cuts.",
      probability: 20, instruments: ["EURUSD", "DAX", "EUR10Y"], validated: false,
    },
    // --- e2 : CPI US (14h30, USD, high) ---
    {
      id: "sc2-1", eventId: "e2", type: "bear", title: "CPI core <2.9% YoY (cold)",
      description: "Validation narrative cuts. DXY -0.6%, Gold +1%, NAS bid.",
      probability: 30, instruments: ["DXY", "EURUSD", "XAUUSD", "NAS100"], validated: false,
    },
    {
      id: "sc2-2", eventId: "e2", type: "neutral", title: "CPI en ligne (3.0-3.2%)",
      description: "Reactivite moderee, range maintenu avant FOMC.",
      probability: 45, instruments: ["DXY", "EURUSD"], validated: false,
    },
    {
      id: "sc2-3", eventId: "e2", type: "bull", title: "CPI core >3.3% (hot)",
      description: "DXY squeeze +0.8%, Gold correction, yields +10bp.",
      probability: 25, instruments: ["DXY", "XAUUSD", "US10Y"], validated: false,
    },
    // --- e3 : FOMC Decision + Powell (20h00, USD, high) ---
    {
      id: "sc3-1", eventId: "e3", type: "bear", title: "Cut 25bp + guidance dovish",
      description: "Powell insiste sur desinflation. DXY -1%, Gold +1.5%, 2Y -15bp, NAS +1.5%.",
      probability: 35, instruments: ["DXY", "XAUUSD", "NAS100", "US2Y"], validated: false,
    },
    {
      id: "sc3-2", eventId: "e3", type: "neutral", title: "Hold + guidance data-dependent",
      description: "Statu quo, Powell evite de s'engager. Volatilite intraday, clotures proches de pre-FOMC.",
      probability: 45, instruments: ["DXY", "EURUSD", "XAUUSD"], validated: false,
    },
    {
      id: "sc3-3", eventId: "e3", type: "bull", title: "Hold + ton hawkish (risque long)",
      description: "Powell evoque inflation persistante. DXY +0.8%, Gold -1%, NAS -1.5%, yields +12bp.",
      probability: 20, instruments: ["DXY", "XAUUSD", "NAS100", "US10Y"], validated: false,
    },
    // --- e4 : Jobless claims + Philly Fed (14h30, USD, medium) ---
    {
      id: "sc4-1", eventId: "e4", type: "bear", title: "Claims >240k + Philly <-10",
      description: "Deterioration marche travail + manufacture. Confirme narrative cuts, DXY -0.3%, Gold +0.5%.",
      probability: 30, instruments: ["DXY", "XAUUSD", "US2Y"], validated: false,
    },
    {
      id: "sc4-2", eventId: "e4", type: "neutral", title: "Claims 210-230k + Philly stable",
      description: "Donnees en ligne. Reactivite limitee, marche digere FOMC de la veille.",
      probability: 50, instruments: ["DXY"], validated: false,
    },
    {
      id: "sc4-3", eventId: "e4", type: "bull", title: "Claims <200k + Philly >5",
      description: "Marche travail resilient + manufacture surprise positive. DXY +0.4%, yields +5bp.",
      probability: 20, instruments: ["DXY", "US10Y"], validated: false,
    },
    // --- e5 : Michigan sentiment + inflation 1y (16h00, USD, medium) ---
    {
      id: "sc5-1", eventId: "e5", type: "bear", title: "Sentiment <70 + inflation 1y <2.8%",
      description: "Confiance consommateur degrade + anticipations baisses. DXY -0.2%, Gold +0.3%.",
      probability: 25, instruments: ["DXY", "XAUUSD"], validated: false,
    },
    {
      id: "sc5-2", eventId: "e5", type: "neutral", title: "Sentiment 72-76 + inflation 2.9-3.1%",
      description: "En ligne. Cloture de semaine calme, positionnement week-end.",
      probability: 55, instruments: ["DXY"], validated: false,
    },
    {
      id: "sc5-3", eventId: "e5", type: "bull", title: "Sentiment >78 + inflation 1y >3.3%",
      description: "Consommateur resilient mais anticipations d'inflation re-ancrees. DXY +0.3%, yields +5bp.",
      probability: 20, instruments: ["DXY", "US10Y"], validated: false,
    },
  ],
  weeklyScenarios: [
    {
      id: "ws-uk-dovish", kind: "dovish", title: "Starmer survit fragilise (slow leak)",
      description: "PM tient bon, State Opening passe sans encombre. Cabinet reste hostile en arriere-plan, ministres briefent contre le PM, risque permanent de nouvelle tentative de demission dans les 6 mois. GBPUSD reste en range 1.32-1.36 indefiniment, volatility croissante a chaque vague de pression. Pas de crise, mais pas de confiance non plus. Le moins pire des 3 scenarios pour le GBP, mais toujours bearish structurel.",
      probability: 50, instruments: ["GBPUSD", "GBPJPY", "GILTS"], validated: false,
    },
    {
      id: "ws-uk-base", kind: "base", title: "Demission differee style May (lame duck)",
      description: "Demission annoncee mais reportee : Starmer reste jusqu'a l'election d'un successeur designe. PM devient lame duck, plus aucune decision majeure, cabinet en guerre de succession. Probleme cle : aucun candidat (Streeting / Miliband / Cooper / Burnham / Reeves) ne fait l'unanimite ni n'apporte de premium positif au GBP. Drift GBPUSD de 1.35 vers 1.32 sur 2-3 mois sans grand mouvement explosif.",
      probability: 25, instruments: ["GBPUSD", "GBPJPY"], validated: false,
    },
    {
      id: "ws-uk-hawkish", kind: "hawkish", title: "Demission immediate + contest 6-10 semaines",
      description: "Starmer demissionne, leadership contest commence immediatement. Pendant 6 a 10 semaines, le UK n'a plus de gouvernement decisionnaire fort. GBP devient 'a la merci des autres devises' : pas de reponse coordonnee si Trump annonce des tarifs, si BoE doit bouger, si Iran s'aggrave. Reference historique : ete 2022 (Johnson → Truss → Sunak) ou GBPUSD passe de 1.22 a 1.04 en 90 jours. Pire scenario pour le GBP, gap-down initial 100-180 pips quasi-garanti.",
      probability: 25, instruments: ["GBPUSD", "GBPJPY", "GILTS", "GBPCHF"], validated: false,
    },
  ],
};

export const instrumentBiases: InstrumentBias[] = [
  { instrument: "DXY", direction: "short", price: 104.12 },
  { instrument: "EURUSD", direction: "long", price: 1.0895 },
  { instrument: "GBPUSD", direction: "long", price: 1.2640 },
  { instrument: "XAUUSD", direction: "long", price: 3008.4 },
  { instrument: "USOIL", direction: "flat", price: 76.80 },
  { instrument: "NAS100", direction: "long", price: 18420 },
  { instrument: "US10Y", direction: "flat", price: 4.32 },
];

export const recentReports: LibraryEntry[] = [
  { id: "r1", date: "2026-04-10", type: "daily", title: "Vendredi — NFP 215k, salaires +0.4%", summary: "NFP plus chaud que prevu, DXY squeeze +0.6%, mais reverse vendredi AM sur commentaires Waller. Pris long EURUSD 1.0895 → sortie BE.", tags: ["USD", "NFP"], pnlPct: 0.0 },
  { id: "r2", date: "2026-04-09", type: "daily", title: "Jeudi — Flat, range pre-NFP", summary: "Pas de trade. Observation des flows DXY et or. Patience avant NFP.", tags: ["Flat"], pnlPct: 0.0 },
  { id: "r3", date: "2026-04-08", type: "daily", title: "Mercredi — Short DXY 104.20", summary: "Setup rejection 104.20 daily. Short 104.18 SL 104.45 TP 103.60. TP hit.", tags: ["USD", "DXY"], pnlPct: 1.8 },
  { id: "r4", date: "2026-04-07", type: "fundamental", title: "These Q2 2026 — Or & USD", summary: "Structurel long gold sur dip, DXY cap a 105. Scenario recession douce US avec BCE pause.", tags: ["Gold", "USD", "Thesis"], pnlPct: null },
  { id: "r5", date: "2026-04-06", type: "weekly", title: "Prep S15 — CPI EU, FOMC minutes", summary: "Semaine legere en data. Focus BCE speakers et minutes FOMC mercredi.", tags: ["EUR", "USD"], pnlPct: null },
  { id: "r6", date: "2026-04-03", type: "daily", title: "Vendredi — Long Gold 2985", summary: "Breakout H4 sur rejection 2985. Long 2988 SL 2970 TP 3015. TP hit.", tags: ["Gold"], pnlPct: 2.3 },
  { id: "r7", date: "2026-04-02", type: "fundamental", title: "Note — Divergence BCE/FED", summary: "BCE cut en avance de phase vs FED : fenetre de short EUR limitee, puis reversal H2.", tags: ["EUR", "USD", "Thesis"], pnlPct: null },
];

export const weeklyPrecision = [62, 58, 65, 70, 66, 72, 68, 74, 71, 69, 73, 68];

export const currentDailyReport: DailyReport = {
  id: "dr-20260414",
  date: "2026-04-14",
  dayOfWeek: "Mardi",
  catalysts: ["CPI DAY"],
  biasMacro: "Biais DXY bear si CPI core < 3.0%, sinon flat. Priorite preservation de capital avant 14h30.",
  announcements: ["CPI US (14h30) — haute impact", "Retail sales Canada (14h30)", "BoE Bailey speech (16h00)"],
  technicalLevels: ["EURUSD: 1.0935 (R) / 1.0870 (S)", "XAUUSD: 3015 (R) / 2985 (S)", "DXY: 103.80 (S) / 104.40 (R)"],
  mentalState: 8,
  positionTaken: "",
  planRespected: null,
  executionQuality: 0,
  emotions: [],
  decisionProcess: null,
  marketEvents: "",
  mistakeToAvoid: "",
  lessonLearned: "",
  synthesis: "",
  tags: [],
  pnlPct: null,
};
