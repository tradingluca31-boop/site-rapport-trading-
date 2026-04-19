import { createPublicClient } from "@/lib/supabase/public-client";
import { EcoEvent, EventCategory, Impact } from "@/types";

type Mt5CalendarRow = {
  event_id: number | string;
  event_time: string;
  currency: string;
  importance: "low" | "medium" | "high" | string;
  event_name: string;
  actual: number | null;
  forecast: number | null;
  previous: number | null;
  unit: string | null;
};

export function inferCategory(eventName: string): EventCategory {
  const n = eventName.toLowerCase();
  if (/\b(cpi|ppi|inflation|price index|deflator|rpi)\b/.test(n)) return "inflation";
  if (/\b(nfp|jobless|unemployment|employment|payroll|claimant|adp|jolts|job)\b/.test(n)) return "emploi";
  if (/\b(gdp|retail|manufacturing|production|pmi|ism|industrial|construction|durable|trade balance)\b/.test(n)) return "croissance";
  if (/\b(fomc|interest rate|rate decision|ecb|boj|boc|boe|snb|rba|rbnz|monetary|cash rate|refi rate)\b/.test(n)) return "politique_monetaire";
  if (/\b(speech|testimony|conference|speaks|remarks|press|minutes|statement|powell|lagarde|bailey|ueda)\b/.test(n))
    return "discours";
  if (/\b(sentiment|confidence|michigan|zew|ifo|consumer|business climate)\b/.test(n)) return "sentiment";
  return "autre";
}

function normalizeImpact(importance: string): Impact {
  const v = (importance ?? "").toLowerCase();
  if (v === "high") return "high";
  if (v === "medium" || v === "moderate") return "medium";
  return "low";
}

function formatNumber(n: number | null, unit: string | null): string | undefined {
  if (n === null || n === undefined) return undefined;
  const suffix = unit && unit.trim() !== "" ? unit : "";
  return `${n}${suffix}`;
}

function toLocalIsoDate(isoTs: string): string {
  const d = new Date(isoTs);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function toLocalTime(isoTs: string): string {
  const d = new Date(isoTs);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function mapRowToEcoEvent(row: Mt5CalendarRow): EcoEvent {
  return {
    id: String(row.event_id),
    date: toLocalIsoDate(row.event_time),
    time: toLocalTime(row.event_time),
    currency: row.currency,
    title: row.event_name,
    impact: normalizeImpact(row.importance),
    category: inferCategory(row.event_name),
    forecast: formatNumber(row.forecast, row.unit),
    previous: formatNumber(row.previous, row.unit),
    actual: formatNumber(row.actual, row.unit),
  };
}

export async function fetchWeekEvents(startDate: string, endDate: string): Promise<EcoEvent[]> {
  const supabase = createPublicClient();
  const start = new Date(`${startDate}T00:00:00`).toISOString();
  const end = new Date(`${endDate}T23:59:59`).toISOString();

  const { data, error } = await supabase
    .from("mt5_calendar")
    .select("event_id, event_time, currency, importance, event_name, actual, forecast, previous, unit")
    .gte("event_time", start)
    .lte("event_time", end)
    .order("event_time", { ascending: true });

  if (error) {
    console.error("[mt5-calendar] fetch error", error);
    return [];
  }

  return (data ?? []).map((r) => mapRowToEcoEvent(r as Mt5CalendarRow));
}
