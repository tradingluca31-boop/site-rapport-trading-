// Import ponctuel depuis Notion vers Supabase rapport_trading.trades.
// On utilise l'API REST Notion directement pour eviter d'ajouter @notionhq/client.
// Token: env NOTION_TOKEN (Integration secret). DB: env NOTION_TRADES_DB_ID.

import { TradeDirection, TradeStatus } from "@/lib/trades";

const NOTION_VERSION = "2022-06-28";

type NotionProperty = {
  id: string;
  type: string;
  title?: Array<{ plain_text: string }>;
  rich_text?: Array<{ plain_text: string }>;
  number?: number | null;
  select?: { name: string } | null;
  status?: { name: string } | null;
  multi_select?: Array<{ name: string }>;
  date?: { start: string; end: string | null } | null;
  checkbox?: boolean;
  url?: string | null;
};

type NotionPage = {
  id: string;
  properties: Record<string, NotionProperty>;
};

type NotionQueryResponse = {
  results: NotionPage[];
  next_cursor: string | null;
  has_more: boolean;
};

export type NotionTradeDraft = {
  notion_id: string;
  date: string;
  time: string | null;
  pair: string;
  direction: TradeDirection;
  entry: string | null;
  sl: string | null;
  tp: string | null;
  size: string | null;
  status: TradeStatus;
  pnl: string | null;
  idea: string | null;
  notes: string | null;
  tags: string[];
};

function propText(p: NotionProperty | undefined): string | null {
  if (!p) return null;
  if (p.type === "title" && p.title?.length) return p.title.map((t) => t.plain_text).join("").trim() || null;
  if (p.type === "rich_text" && p.rich_text?.length) return p.rich_text.map((t) => t.plain_text).join("").trim() || null;
  if (p.type === "select") return p.select?.name ?? null;
  if (p.type === "status") return p.status?.name ?? null;
  if (p.type === "url") return p.url ?? null;
  if (p.type === "number" && p.number !== null && p.number !== undefined) return String(p.number);
  return null;
}

function propDate(p: NotionProperty | undefined): { date: string; time: string | null } | null {
  if (!p || p.type !== "date" || !p.date?.start) return null;
  const s = p.date.start;
  if (s.length === 10) return { date: s, time: null };
  const d = new Date(s);
  const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return { date, time };
}

function propMultiSelect(p: NotionProperty | undefined): string[] {
  if (!p || p.type !== "multi_select" || !p.multi_select) return [];
  return p.multi_select.map((s) => s.name);
}

function findProp(props: Record<string, NotionProperty>, candidates: string[]): NotionProperty | undefined {
  const lowered = Object.keys(props).reduce<Record<string, string>>((acc, k) => {
    acc[k.toLowerCase()] = k;
    return acc;
  }, {});
  for (const c of candidates) {
    const hit = lowered[c.toLowerCase()];
    if (hit) return props[hit];
  }
  return undefined;
}

function normalizeDirection(raw: string | null): TradeDirection | null {
  if (!raw) return null;
  const v = raw.trim().toLowerCase();
  if (v === "long" || v === "buy" || v === "achat") return "long";
  if (v === "short" || v === "sell" || v === "vente") return "short";
  return null;
}

function normalizeStatus(raw: string | null): TradeStatus {
  if (!raw) return "open";
  const v = raw.trim().toLowerCase();
  if (v.includes("win") || v === "gain" || v === "tp" || v === "gagné" || v === "gagne") return "closed-win";
  if (v.includes("loss") || v.includes("perte") || v === "sl" || v === "perdu") return "closed-loss";
  if (v.includes("cancel") || v.includes("annul")) return "cancelled";
  if (v.includes("open") || v.includes("cours") || v.includes("pending")) return "open";
  return "open";
}

function mapPageToDraft(page: NotionPage): NotionTradeDraft | null {
  const props = page.properties;

  const dateProp = findProp(props, ["Date", "Jour", "Day"]);
  const parsedDate = propDate(dateProp);
  if (!parsedDate) return null;

  const pairRaw = propText(findProp(props, ["Paire", "Pair", "Symbol", "Symbole", "Instrument", "Actif"]));
  if (!pairRaw) return null;

  const dir = normalizeDirection(propText(findProp(props, ["Direction", "Sens", "Side"])));
  if (!dir) return null;

  const status = normalizeStatus(propText(findProp(props, ["Statut", "Status", "Etat", "État"])));

  const entry = propText(findProp(props, ["Entry", "Entrée", "Entree", "Prix entrée", "Prix entree"]));
  const sl = propText(findProp(props, ["SL", "Stop", "Stop Loss", "StopLoss"]));
  const tp = propText(findProp(props, ["TP", "Target", "Take Profit", "TakeProfit"]));
  const size = propText(findProp(props, ["Size", "Taille", "Lot", "Lots", "Volume"]));
  const pnl = propText(findProp(props, ["PnL", "P&L", "PNL", "Résultat", "Resultat", "Gain", "R"]));
  const idea = propText(findProp(props, ["Idée", "Idea", "These", "Thèse", "Thesis"]));
  const notes = propText(findProp(props, ["Notes", "Note", "Commentaire", "Comment"]));
  const tags = propMultiSelect(findProp(props, ["Tags", "Tag", "Categorie", "Catégorie"]));

  return {
    notion_id: page.id,
    date: parsedDate.date,
    time: parsedDate.time,
    pair: pairRaw.trim().toUpperCase(),
    direction: dir,
    entry,
    sl,
    tp,
    size,
    status,
    pnl,
    idea,
    notes,
    tags,
  };
}

export async function fetchNotionTrades(): Promise<NotionTradeDraft[]> {
  const token = process.env.NOTION_TOKEN;
  const dbId = process.env.NOTION_TRADES_DB_ID;
  if (!token) throw new Error("NOTION_TOKEN manquant (env Vercel)");
  if (!dbId) throw new Error("NOTION_TRADES_DB_ID manquant (env Vercel)");

  const drafts: NotionTradeDraft[] = [];
  let cursor: string | null = null;

  do {
    const body: Record<string, unknown> = { page_size: 100 };
    if (cursor) body.start_cursor = cursor;

    const res: Response = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Notion API ${res.status} : ${txt.slice(0, 200)}`);
    }

    const json = (await res.json()) as NotionQueryResponse;
    for (const page of json.results) {
      const draft = mapPageToDraft(page);
      if (draft) drafts.push(draft);
    }
    cursor = json.has_more ? json.next_cursor : null;
  } while (cursor);

  return drafts;
}
