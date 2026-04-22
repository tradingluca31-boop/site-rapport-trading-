import { createClient } from "@/lib/supabase/client";

export type Bias = "hawkish" | "dovish" | "neutral" | "ras";

export type FundamentalAsset = {
  ticker: string;
  flag: string;
  name: string;
  bias: Bias;
  score: number; // -5..+5
  monetary: string | null;
  macro: string | null;
  geo: string | null;
  sentiment: string | null;
  sources: string[];
  last_update: string;
};

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

// Skeleton par defaut pour un nouveau rapport (toutes devises en RAS)
export const DEFAULT_ASSETS: FundamentalAsset[] = [
  { ticker: "USD", flag: "🇺🇸", name: "Dollar US",         bias: "ras", score: 0, monetary: null, macro: null, geo: null, sentiment: null, sources: [], last_update: "—" },
  { ticker: "EUR", flag: "🇪🇺", name: "Euro",              bias: "ras", score: 0, monetary: null, macro: null, geo: null, sentiment: null, sources: [], last_update: "—" },
  { ticker: "GBP", flag: "🇬🇧", name: "Livre sterling",    bias: "ras", score: 0, monetary: null, macro: null, geo: null, sentiment: null, sources: [], last_update: "—" },
  { ticker: "JPY", flag: "🇯🇵", name: "Yen japonais",      bias: "ras", score: 0, monetary: null, macro: null, geo: null, sentiment: null, sources: [], last_update: "—" },
  { ticker: "CHF", flag: "🇨🇭", name: "Franc suisse",      bias: "ras", score: 0, monetary: null, macro: null, geo: null, sentiment: null, sources: [], last_update: "—" },
  { ticker: "AUD", flag: "🇦🇺", name: "Dollar australien", bias: "ras", score: 0, monetary: null, macro: null, geo: null, sentiment: null, sources: [], last_update: "—" },
  { ticker: "NZD", flag: "🇳🇿", name: "Dollar NZ",         bias: "ras", score: 0, monetary: null, macro: null, geo: null, sentiment: null, sources: [], last_update: "—" },
  { ticker: "CAD", flag: "🇨🇦", name: "Dollar canadien",   bias: "ras", score: 0, monetary: null, macro: null, geo: null, sentiment: null, sources: [], last_update: "—" },
  { ticker: "CNY", flag: "🇨🇳", name: "Yuan chinois",      bias: "ras", score: 0, monetary: null, macro: null, geo: null, sentiment: null, sources: [], last_update: "—" },
  { ticker: "XAUUSD", flag: "🥇", name: "Or",               bias: "ras", score: 0, monetary: null, macro: null, geo: null, sentiment: null, sources: [], last_update: "—" },
  { ticker: "XAGUSD", flag: "🥈", name: "Argent",           bias: "ras", score: 0, monetary: null, macro: null, geo: null, sentiment: null, sources: [], last_update: "—" },
  { ticker: "USOIL", flag: "🛢️", name: "Petrole WTI",      bias: "ras", score: 0, monetary: null, macro: null, geo: null, sentiment: null, sources: [], last_update: "—" },
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
