import { NextResponse } from "next/server";

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

export async function GET(req: Request) {
  const url = new URL(req.url);
  const fromStr = url.searchParams.get("from");
  const toStr = url.searchParams.get("to");

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

  let filtered = deduped;
  if (fromStr && toStr) {
    const fromMs = new Date(`${fromStr}T00:00:00.000Z`).getTime();
    const toMs = new Date(`${toStr}T23:59:59.999Z`).getTime();
    filtered = deduped.filter((e) => {
      const t = new Date(e.utcIso).getTime();
      return t >= fromMs && t <= toMs;
    });
  }

  filtered.sort((a, b) => a.utcIso.localeCompare(b.utcIso));

  return NextResponse.json({ events: filtered, count: filtered.length });
}
