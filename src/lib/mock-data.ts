import { WeeklyPrep, DailyReport, InstrumentBias, LibraryEntry } from "@/types";

export const currentWeek: WeeklyPrep = {
  id: "s16-2026",
  weekNumber: 16,
  year: 2026,
  startDate: "2026-04-13",
  endDate: "2026-04-17",
  theme: "Inflation US + divergence BCE/FED",
  status: "en_cours",
  thesisShortTerm: "Le marche attend un CPI US core en-dessous de 3.0% pour valider la sequence de baisses FED. Un print hot relance DXY et pese sur Gold/EURUSD. Cote BCE, Lagarde doit confirmer la pause apres la baisse de mars — toute hawkish surprise soutient EURUSD.",
  thesisLongTerm: "Regime desinflation US en deceleration, zone de fin de cycle de baisses FED (2-3 cuts prices 2026). EUR structurellement soutenu par differentiel de croissance favorable et fin d'assouplissement BCE prevue H2 2026. Or tenu par achats BC + flux refuge sur tensions geopolitiques. Biais moyen terme : EUR/USD long sur repli 1.0850, Gold long sur pullback 2980, DXY short sur rebond 103.",
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
      id: "ws-dovish", kind: "dovish", title: "Scenario dovish — CPI cold + FOMC dovish",
      description: "CPI core <2.9% mardi puis FOMC cut 25bp + guidance dovish mercredi. Pricing de 3 cuts 2026 confirme. DXY -1.5% sur la semaine (103.50), EUR/USD +1.2% (1.102), Gold +2.5% (3080), NAS +2%. Biais risk-on consolide.",
      probability: 30, instruments: ["DXY", "EURUSD", "XAUUSD", "NAS100", "US2Y"], validated: false,
    },
    {
      id: "ws-base", kind: "base", title: "Scenario base — CPI en ligne + FOMC hold data-dependent",
      description: "CPI proche consensus (3.0-3.2%) puis FOMC hold avec ton equilibre. Range maintenu : DXY 103.80-104.40, EUR/USD 1.085-1.095, Gold 2985-3020. Volatilite intraday mais clotures semaine proches des niveaux actuels. Focus sur Jobless jeudi + Michigan vendredi pour biais de fin de semaine.",
      probability: 50, instruments: ["DXY", "EURUSD", "XAUUSD"], validated: false,
    },
    {
      id: "ws-hawkish", kind: "hawkish", title: "Scenario hawkish — CPI hot + FOMC ton hawkish",
      description: "CPI core >3.3% + FOMC hold avec Powell evoquant inflation persistante. Repricing : 1 cut 2026 max. DXY +1.2% (105.30), EUR/USD -1% (1.078), Gold -2% (2950), NAS -2.5%, yields 10Y +15bp (4.47). Biais risk-off, short squeeze sur DXY.",
      probability: 20, instruments: ["DXY", "EURUSD", "XAUUSD", "NAS100", "US10Y"], validated: false,
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
