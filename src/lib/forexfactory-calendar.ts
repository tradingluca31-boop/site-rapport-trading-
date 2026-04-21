import { EcoEvent, Impact } from "@/types";
import { inferCategory } from "@/lib/mt5-calendar";
import { translateEventName } from "@/lib/event-translator";

type FFApiEvent = {
  title: string;
  currency: string;
  date: string;
  time: string;
  utcIso: string;
  impact: "low" | "medium" | "high";
  forecast?: string;
  previous?: string;
};

type FFApiResponse = {
  events: FFApiEvent[];
  count: number;
};

function toLocalIsoDate(isoTs: string): string {
  const d = new Date(isoTs);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function toLocalTime(isoTs: string): string {
  const d = new Date(isoTs);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export async function fetchForexFactoryEvents(startDate: string, endDate: string): Promise<EcoEvent[]> {
  try {
    const baseUrl = typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_SITE_URL || "";
    const url = `${baseUrl}/api/calendar/forexfactory?from=${startDate}&to=${endDate}`;
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) {
      console.error("[forexfactory] API error", r.status);
      return [];
    }
    const j: FFApiResponse = await r.json();
    return j.events.map((e, i) => ({
      id: `ff-${e.currency}-${e.utcIso}-${i}`,
      date: toLocalIsoDate(e.utcIso),
      time: toLocalTime(e.utcIso),
      currency: e.currency,
      title: translateEventName(e.title),
      impact: e.impact as Impact,
      category: inferCategory(e.title),
      forecast: e.forecast,
      previous: e.previous,
      actual: undefined,
    }));
  } catch (err) {
    console.error("[forexfactory] fetch error", err);
    return [];
  }
}
