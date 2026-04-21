import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/public-client";

export const revalidate = 1800;

type FFRawEvent = {
  title: string;
  currency: string;
  date: string;
  time: string;
  utcIso: string;
  impact: "low" | "medium" | "high";
  forecast?: string;
  previous?: string;
};

type FFCalendarRow = {
  event_id: string;
  event_time: string;
  currency: string;
  importance: "low" | "medium" | "high" | string;
  event_name: string;
  forecast: string | null;
  previous: string | null;
  actual: string | null;
};

function xmlCData(s: string): string {
  const m = /^<!\[CDATA\[([\s\S]*?)\]\]>$/.exec(s.trim());
  return m ? m[1] : s.trim();
}

function parseTime12to24(t: string): string | null {
  const m = /^(\d{1,2}):(\d{2})(am|pm)$/i.exec(t.trim());
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const mm = m[2];
  const p = m[3].toLowerCase();
  if (p === "pm" && h < 12) h += 12;
  if (p === "am" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${mm}`;
}

function parseFFDate(d: string): string | null {
  const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(d.trim());
  if (!m) return null;
  return `${m[3]}-${m[1]}-${m[2]}`;
}

function normImpact(s: string): "low" | "medium" | "high" {
  const v = s.trim().toLowerCase();
  if (v === "high") return "high";
  if (v === "medium") return "medium";
  return "low";
}

function utcIsoToDateTime(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  const date = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
  const time = `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
  return { date, time };
}

function mapRowToFFRawEvent(row: FFCalendarRow): FFRawEvent {
  const utcIso = new Date(row.event_time).toISOString();
  const { date, time } = utcIsoToDateTime(utcIso);
  return {
    title: row.event_name,
    currency: row.currency.toUpperCase(),
    date,
    time,
    utcIso,
    impact: normImpact(row.importance),
    forecast: row.forecast ?? undefined,
    previous: row.previous ?? undefined,
  };
}

async function fetchFromSupabase(fromStr: string, toStr: string): Promise<FFRawEvent[] | null> {
  try {
    const supabase = createPublicClient();
    const start = new Date(`${fromStr}T00:00:00.000Z`).toISOString();
    const end = new Date(`${toStr}T23:59:59.999Z`).toISOString();

    const { data, error } = await supabase
      .from("ff_calendar")
      .select("event_id, event_time, currency, importance, event_name, forecast, previous, actual")
      .gte("event_time", start)
      .lte("event_time", end)
      .order("event_time", { ascending: true });

    if (error) {
      console.error("[ff_calendar] supabase error", error);
      return null;
    }
    return (data ?? []).map((r) => mapRowToFFRawEvent(r as FFCalendarRow));
  } catch (err) {
    console.error("[ff_calendar] supabase fetch threw", err);
    return null;
  }
}

function parseEvents(xml: string): FFRawEvent[] {
  const events: FFRawEvent[] = [];
  const re = /<event>([\s\S]*?)<\/event>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    const body = m[1];
    const getField = (name: string): string | undefined => {
      const mm = new RegExp(`<${name}>([\\s\\S]*?)<\\/${name}>`).exec(body);
      if (!mm) return undefined;
      return xmlCData(mm[1]);
    };
    const title = getField("title");
    const country = getField("country");
    const dateStr = getField("date");
    const timeStr = getField("time");
    const impactStr = getField("impact");
    const forecast = getField("forecast");
    const previous = getField("previous");
    if (!title || !country || !dateStr || !timeStr || !impactStr) continue;

    const date = parseFFDate(dateStr);
    if (!date) continue;

    const lowT = timeStr.trim().toLowerCase();
    if (lowT === "all day" || lowT === "tentative" || lowT === "holiday" || lowT === "") continue;

    const time24 = parseTime12to24(timeStr);
    if (!time24) continue;

    const utcIso = `${date}T${time24}:00.000Z`;

    events.push({
      title: title.trim(),
      currency: country.trim().toUpperCase(),
      date,
      time: time24,
      utcIso,
      impact: normImpact(impactStr),
      forecast: forecast && forecast.trim() ? forecast.trim() : undefined,
      previous: previous && previous.trim() ? previous.trim() : undefined,
    });
  }
  return events;
}

async function fetchFromXmlLive(fromStr: string | null, toStr: string | null): Promise<FFRawEvent[]> {
  const feeds = [
    "https://nfs.faireconomy.media/ff_calendar_thisweek.xml",
    "https://nfs.faireconomy.media/ff_calendar_nextweek.xml",
  ];

  const all: FFRawEvent[] = [];
  for (const feed of feeds) {
    try {
      const r = await fetch(feed, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; EdgeFX/1.0)" },
        next: { revalidate: 1800 },
      });
      if (!r.ok) continue;
      const xml = await r.text();
      const evts = parseEvents(xml);
      all.push(...evts);
    } catch {
      // ignore and try next
    }
  }

  const seen = new Set<string>();
  const deduped = all.filter((e) => {
    const k = `${e.currency}|${e.utcIso}|${e.title}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  if (fromStr && toStr) {
    const fromMs = new Date(`${fromStr}T00:00:00.000Z`).getTime();
    const toMs = new Date(`${toStr}T23:59:59.999Z`).getTime();
    return deduped.filter((e) => {
      const t = new Date(e.utcIso).getTime();
      return t >= fromMs && t <= toMs;
    });
  }

  return deduped;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const fromStr = url.searchParams.get("from");
  const toStr = url.searchParams.get("to");

  let events: FFRawEvent[] = [];
  let source: "supabase" | "xml-live" = "supabase";

  if (fromStr && toStr) {
    const fromSupabase = await fetchFromSupabase(fromStr, toStr);
    if (fromSupabase && fromSupabase.length > 0) {
      events = fromSupabase;
    } else {
      // Filet de securite : table vide ou erreur Supabase, on retombe sur le XML live.
      console.warn("[ff_calendar] supabase vide ou indisponible, fallback XML live");
      events = await fetchFromXmlLive(fromStr, toStr);
      source = "xml-live";
    }
  } else {
    // Sans filtre date, on prend directement le XML live (cas legacy).
    events = await fetchFromXmlLive(fromStr, toStr);
    source = "xml-live";
  }

  events.sort((a, b) => a.utcIso.localeCompare(b.utcIso));

  return NextResponse.json({ events, count: events.length, source });
}
