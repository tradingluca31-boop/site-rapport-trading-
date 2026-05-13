import { createClient } from "@/lib/supabase/client";

export type Bias = "hawkish" | "dovish" | "neutral" | "ras";

export type FundamentalAsset = {
  ticker: string;
  flag: string;
  name: string;
  bias: Bias;
  score: number; // -5..+5 (legacy, derive de sentiment10)
  // Nouveau modele simplifie
  sentiment10?: number;   // 0..10 (0 = vendeur, 5 = neutre, 10 = acheteur)
  summary?: string | null; // Zone de texte unique (remplace monetary/macro/geo/sentiment)
  // Legacy (gardes pour retro-compat des imports JSON Claude mobile)
  monetary: string | null;
  macro: string | null;
  geo: string | null;
  sentiment: string | null;
  sources: string[];
  last_update: string;
};

// Helpers de conversion 0-10 <-> bias/score
export function sentiment10ToBiasScore(s: number): { bias: Bias; score: number } {
  const v = Math.max(0, Math.min(10, Math.round(s)));
  if (v === 5) return { bias: "neutral", score: 0 };
  if (v < 5) return { bias: "dovish", score: v - 5 };
  return { bias: "hawkish", score: v - 5 };
}

export function biasScoreToSentiment10(asset: Pick<FundamentalAsset, "bias" | "score" | "sentiment10">): number {
  if (typeof asset.sentiment10 === "number") return Math.max(0, Math.min(10, asset.sentiment10));
  if (asset.bias === "ras" || asset.bias === "neutral") return 5;
  // hawkish/dovish: score est dans [-5, +5]
  return Math.max(0, Math.min(10, 5 + (asset.score ?? 0)));
}

// Construit le champ summary en concatenant les anciens si absent
export function getAssetSummary(asset: FundamentalAsset): string {
  if (typeof asset.summary === "string") return asset.summary;
  const parts: string[] = [];
  if (asset.monetary) parts.push(asset.monetary);
  if (asset.macro) parts.push(asset.macro);
  if (asset.geo) parts.push(asset.geo);
  if (asset.sentiment) parts.push(asset.sentiment);
  return parts.join("\n\n");
}

export type FundamentalReport = {
  id: string;
  report_date: string;
  headline: string;
  intro: string;
  assets: FundamentalAsset[];
  created_at: string;
  updated_at: string;
};

export type FundamentalReportInput = {
  report_date: string;
  headline: string;
  intro: string;
  assets: FundamentalAsset[];
};

const TABLE = "fundamental_reports";

// Skeleton par defaut pour un nouveau rapport (toutes devises en RAS / neutre)
export const DEFAULT_ASSETS: FundamentalAsset[] = [
  { ticker: "USD", flag: "🇺🇸", name: "Dollar US",         bias: "ras", score: 0, sentiment10: 5, summary: "", monetary: null, macro: null, geo: null, sentiment: null, sources: [], last_update: "—" },
  { ticker: "EUR", flag: "🇪🇺", name: "Euro",              bias: "ras", score: 0, sentiment10: 5, summary: "", monetary: null, macro: null, geo: null, sentiment: null, sources: [], last_update: "—" },
  { ticker: "GBP", flag: "🇬🇧", name: "Livre sterling",    bias: "ras", score: 0, sentiment10: 5, summary: "", monetary: null, macro: null, geo: null, sentiment: null, sources: [], last_update: "—" },
  { ticker: "JPY", flag: "🇯🇵", name: "Yen japonais",      bias: "ras", score: 0, sentiment10: 5, summary: "", monetary: null, macro: null, geo: null, sentiment: null, sources: [], last_update: "—" },
  { ticker: "CHF", flag: "🇨🇭", name: "Franc suisse",      bias: "ras", score: 0, sentiment10: 5, summary: "", monetary: null, macro: null, geo: null, sentiment: null, sources: [], last_update: "—" },
  { ticker: "AUD", flag: "🇦🇺", name: "Dollar australien", bias: "ras", score: 0, sentiment10: 5, summary: "", monetary: null, macro: null, geo: null, sentiment: null, sources: [], last_update: "—" },
  { ticker: "NZD", flag: "🇳🇿", name: "Dollar NZ",         bias: "ras", score: 0, sentiment10: 5, summary: "", monetary: null, macro: null, geo: null, sentiment: null, sources: [], last_update: "—" },
  { ticker: "CAD", flag: "🇨🇦", name: "Dollar canadien",   bias: "ras", score: 0, sentiment10: 5, summary: "", monetary: null, macro: null, geo: null, sentiment: null, sources: [], last_update: "—" },
  { ticker: "CNY", flag: "🇨🇳", name: "Yuan chinois",      bias: "ras", score: 0, sentiment10: 5, summary: "", monetary: null, macro: null, geo: null, sentiment: null, sources: [], last_update: "—" },
  { ticker: "XAUUSD", flag: "🥇", name: "Or",               bias: "ras", score: 0, sentiment10: 5, summary: "", monetary: null, macro: null, geo: null, sentiment: null, sources: [], last_update: "—" },
  { ticker: "XAGUSD", flag: "🥈", name: "Argent",           bias: "ras", score: 0, sentiment10: 5, summary: "", monetary: null, macro: null, geo: null, sentiment: null, sources: [], last_update: "—" },
  { ticker: "USOIL", flag: "🛢️", name: "Petrole WTI",      bias: "ras", score: 0, sentiment10: 5, summary: "", monetary: null, macro: null, geo: null, sentiment: null, sources: [], last_update: "—" },
];

export function buildDefaultReport(date: string): FundamentalReportInput {
  return {
    report_date: date,
    headline: "",
    intro: "",
    assets: DEFAULT_ASSETS.map((a) => ({ ...a })),
  };
}

export async function getReportByDate(date: string): Promise<FundamentalReport | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("report_date", date)
    .maybeSingle();
  if (error) {
    console.error("[fundamentalReports] getByDate", error);
    return null;
  }
  return data as FundamentalReport | null;
}

export async function upsertReport(input: FundamentalReportInput): Promise<FundamentalReport | null> {
  const supabase = createClient();
  const payload = { ...input, updated_at: new Date().toISOString() };
  const { data, error } = await supabase
    .from(TABLE)
    .upsert(payload, { onConflict: "report_date" })
    .select()
    .single();
  if (error) {
    console.error("[fundamentalReports] upsert", error);
    return null;
  }
  return data as FundamentalReport;
}

export async function listReportDates(): Promise<string[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("report_date")
    .order("report_date", { ascending: false });
  if (error) {
    console.error("[fundamentalReports] listDates", error);
    return [];
  }
  return (data ?? []).map((r) => r.report_date as string);
}
