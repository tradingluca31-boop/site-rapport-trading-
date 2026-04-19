export type PageId =
  | "dashboard"
  | "preparation"
  | "rapport"
  | "bibliotheque"
  | "parametres";

export type Impact = "high" | "medium" | "low";
export type ScenarioType = "bull" | "bear" | "neutral";
export type ReportType = "daily" | "weekly" | "fundamental";
export type BiasDirection = "long" | "short" | "flat";

export interface EcoEvent {
  id: string;
  date: string;
  time: string;
  currency: string;
  title: string;
  impact: Impact;
  forecast?: string;
  previous?: string;
  actual?: string;
}

export interface Scenario {
  id: string;
  eventId: string;
  type: ScenarioType;
  title: string;
  description: string;
  probability: number;
  instruments: string[];
  validated?: boolean;
  realizedPct?: number;
}

export interface WeeklyPrep {
  id: string;
  weekNumber: number;
  year: number;
  startDate: string;
  endDate: string;
  theme: string;
  status: "en_cours" | "validee" | "archivee";
  thesisShortTerm: string;
  thesisLongTerm: string;
  events: EcoEvent[];
  scenarios: Scenario[];
}

export interface DailyReport {
  id: string;
  date: string;
  dayOfWeek: string;
  catalysts: string[];
  // Pre-marche
  biasMacro: string;
  announcements: string[];
  technicalLevels: string[];
  mentalState: number;
  // Execution
  positionTaken: string;
  planRespected: boolean | null;
  executionQuality: number;
  // Emotionnel
  emotions: string[];
  decisionProcess: "process" | "mix" | "emotion" | null;
  // Debrief
  marketEvents: string;
  mistakeToAvoid: string;
  lessonLearned: string;
  // Synthese
  synthesis: string;
  // Meta
  tags: string[];
  pnlPct: number | null;
}

export interface InstrumentBias {
  instrument: string;
  direction: BiasDirection;
  price: number;
}

export interface LibraryEntry {
  id: string;
  date: string;
  type: ReportType;
  title: string;
  summary: string;
  tags: string[];
  pnlPct: number | null;
}
