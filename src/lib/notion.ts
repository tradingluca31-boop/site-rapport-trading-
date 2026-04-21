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
  if (p.type === "multi_select" && p.multi_select?.length) return p.multi_select.map((s) => s.name).join(", ");
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
  if (/\b(long|buy|achat)\b/.test(v)) return "long";
  if (/\b(short|sell|vente)\b/.test(v)) return "short";
  return null;
}

function normalizeStatus(raw: string | null): TradeStatus {
  if (!raw) return "open";
  const v = raw.trim().toLowerCase();
  if (v.includes("cancel") || v.includes("annul")) return "cancelled";
  if (v.includes("open") || v.includes("cours") || v.includes("pending")) return "open";
  if (
    v.includes("profit") ||
    v.includes("win") ||
    v === "gain" ||
    v === "tp" ||
    v.includes("gagn")
  )
    return "closed-win";
  if (
    v.includes("loss") ||
    v.includes("perte") ||
    v === "sl" ||
    v === "perdu" ||
    v.includes("stop")
  )
    return "closed-loss";
  if (v.includes("be") || v.includes("break")) return "closed-win";
  return "open";
}

// Liste de noms de proprietes deja mappees vers des champs specifiques.
// Tout le reste sera dumpe dans notes pour ne rien perdre.
const MAPPED_PROP_NAMES = new Set(
  [
    "Date", "DATE", "Jour", "Day",
    "Actifs", "Actif", "Paire", "Pair", "Symbol", "Symbole", "Instrument",
    "Type d'Ordre", "Type d Ordre", "Direction", "Sens", "Side", "Ordre",
    "RÉSULTAT", "Resultat", "Résultat", "Statut", "Status", "Etat", "État",
    "Entry", "Entrée", "Entree", "Prix entrée", "Prix entree",
    "SL", "Stop", "Stop Loss", "StopLoss",
    "TP", "Target", "Take Profit", "TakeProfit",
    "Size", "Taille", "Lot", "Lots", "Volume", "Risk",
    "$ NET", "PnL", "P&L", "PNL", "Gain",
    "R/R final", "RR final", "R final", "R/R",
    "% NET", "% net", "Pct NET",
    "Idée", "Idea", "These", "Thèse", "Thesis", "Type de trade",
    "Notes", "Note", "Commentaire", "Comment", "Erreurs",
    "Tags", "Tag", "Categorie", "Catégorie", "Tendance",
    "Time-Frame", "Timeframe", "TF",
  ].map((s) => s.toLowerCase())
);

function dumpExtraProps(props: Record<string, NotionProperty>): string {
  const lines: string[] = [];
  for (const [name, prop] of Object.entries(props)) {
    if (MAPPED_PROP_NAMES.has(name.toLowerCase())) continue;
    let value: string | null = null;
    if (prop.type === "date") {
      const parsed = propDate(prop);
      if (parsed) value = parsed.time ? `${parsed.date} ${parsed.time}` : parsed.date;
    } else if (prop.type === "checkbox") {
      value = prop.checkbox ? "oui" : "non";
    } else {
      value = propText(prop);
    }
    if (value && value.trim()) lines.push(`${name}: ${value.trim()}`);
  }
  return lines.join("\n");
}

function mapPageToDraft(page: NotionPage): NotionTradeDraft | null {
  const props = page.properties;

  const dateProp = findProp(props, ["Date", "DATE", "Jour", "Day"]);
  const parsedDate = propDate(dateProp);
  if (!parsedDate) return null;

  const pairRaw = propText(findProp(props, ["Actifs", "Actif", "Paire", "Pair", "Symbol", "Symbole", "Instrument"]));
  if (!pairRaw) return null;

  const dir = normalizeDirection(propText(findProp(props, ["Type d'Ordre", "Type d Ordre", "Direction", "Sens", "Side", "Ordre"])));
  if (!dir) return null;

  const status = normalizeStatus(propText(findProp(props, ["RÉSULTAT", "Resultat", "Résultat", "Statut", "Status", "Etat", "État"])));

  const entry = propText(findProp(props, ["Entry", "Entrée", "Entree", "Prix entrée", "Prix entree"]));
  const sl = propText(findProp(props, ["SL", "Stop", "Stop Loss", "StopLoss"]));
  const tp = propText(findProp(props, ["TP", "Target", "Take Profit", "TakeProfit"]));
  const size = propText(findProp(props, ["Size", "Taille", "Lot", "Lots", "Volume", "Risk"]));

  // PnL : priorite $ NET (rich_text) > R/R final (number) > % NET (number)
  const pnlUsd = propText(findProp(props, ["$ NET", "PnL", "P&L", "PNL", "Gain"]));
  const rrFinal = propText(findProp(props, ["R/R final", "RR final", "R final", "R/R"]));
  const pctNet = propText(findProp(props, ["% NET", "% net", "Pct NET"]));
  let pnl: string | null = null;
  if (pnlUsd) pnl = pnlUsd;
  else if (rrFinal) pnl = `${rrFinal}R`;
  else if (pctNet) pnl = `${pctNet}%`;

  const idea = propText(findProp(props, ["Idée", "Idea", "These", "Thèse", "Thesis", "Type de trade"]));
  const notesBase = propText(findProp(props, ["Notes", "Note", "Commentaire", "Comment", "Erreurs"]));
  const extraDump = dumpExtraProps(props);
  const notesParts: string[] = [];
  if (notesBase) notesParts.push(notesBase);
  if (extraDump) notesParts.push(`--- Proprietes Notion ---\n${extraDump}`);
  const notes = notesParts.length ? notesParts.join("\n\n") : null;

  const tags = [
    ...propMultiSelect(findProp(props, ["Tags", "Tag", "Categorie", "Catégorie", "Tendance"])),
    ...propMultiSelect(findProp(props, ["Time-Frame", "Timeframe", "TF"])),
  ];

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

function normalizeId(raw: string): string {
  const id = raw.toLowerCase().replace(/-/g, "");
  return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20)}`;
}

export function extractNotionPageId(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;
  // Priorite 1 : URL avec ?p=<id> (cas des sous-pages dans une DB Notion)
  const queryMatch = raw.match(/[?&]p=([0-9a-f]{32}|[0-9a-f-]{36})/i);
  if (queryMatch) {
    const cand = queryMatch[1].replace(/-/g, "");
    if (cand.length === 32) return normalizeId(cand);
  }
  // Priorite 2 : UUID avec tirets dans le path
  const dashed = raw.match(/([0-9a-f]{8})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{12})/i);
  if (dashed) {
    const [, a, b, c, d, e] = dashed;
    return `${a}-${b}-${c}-${d}-${e}`.toLowerCase();
  }
  // Priorite 3 : dernier bloc 32 hex dans le path (le plus a droite = page, pas DB)
  const bares = Array.from(raw.matchAll(/([0-9a-f]{32})/gi));
  if (bares.length > 0) {
    const last = bares[bares.length - 1][1];
    return normalizeId(last);
  }
  return null;
}

type NotionRichText = { plain_text: string };
type NotionBlock = {
  id: string;
  type: string;
  has_children?: boolean;
  [key: string]: unknown;
};

function extractBlockText(block: NotionBlock): string | null {
  const type = block.type;
  if (!type) return null;
  const payload = block[type] as { rich_text?: NotionRichText[]; checked?: boolean; language?: string } | undefined;
  if (!payload) return null;
  const rt = payload.rich_text;
  if (!rt || !rt.length) return null;
  const text = rt.map((r) => r.plain_text).join("").trim();
  if (!text) return null;
  switch (type) {
    case "heading_1": return `# ${text}`;
    case "heading_2": return `## ${text}`;
    case "heading_3": return `### ${text}`;
    case "bulleted_list_item": return `- ${text}`;
    case "numbered_list_item": return `1. ${text}`;
    case "to_do": return `${payload.checked ? "[x]" : "[ ]"} ${text}`;
    case "quote": return `> ${text}`;
    case "code": return `\`\`\`${payload.language ?? ""}\n${text}\n\`\`\``;
    case "toggle": return `▸ ${text}`;
    case "callout": return `💡 ${text}`;
    default: return text;
  }
}

async function fetchBlocksRecursive(pageId: string, token: string, depth = 0): Promise<string[]> {
  if (depth > 3) return [];
  const lines: string[] = [];
  let cursor: string | null = null;
  do {
    const url = new URL(`https://api.notion.com/v1/blocks/${pageId}/children`);
    url.searchParams.set("page_size", "100");
    if (cursor) url.searchParams.set("start_cursor", cursor);
    const res: Response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Notion-Version": NOTION_VERSION,
      },
      cache: "no-store",
    });
    if (!res.ok) break;
    const json = (await res.json()) as { results: NotionBlock[]; next_cursor: string | null; has_more: boolean };
    for (const block of json.results) {
      const text = extractBlockText(block);
      if (text) lines.push(text);
      if (block.has_children) {
        const children = await fetchBlocksRecursive(block.id, token, depth + 1);
        for (const c of children) lines.push(`  ${c}`);
      }
    }
    cursor = json.has_more ? json.next_cursor : null;
  } while (cursor);
  return lines;
}

export async function fetchNotionPage(pageId: string): Promise<NotionTradeDraft | null> {
  const token = process.env.NOTION_TOKEN;
  if (!token) throw new Error("NOTION_TOKEN manquant (env Vercel)");
  const res = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": NOTION_VERSION,
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Notion API ${res.status} : ${txt.slice(0, 200)}`);
  }
  const page = (await res.json()) as NotionPage;
  const draft = mapPageToDraft(page);
  if (!draft) return null;

  // Fetch body blocks and append to notes
  try {
    const blockLines = await fetchBlocksRecursive(pageId, token);
    if (blockLines.length) {
      const body = blockLines.join("\n");
      draft.notes = draft.notes
        ? `${draft.notes}\n\n--- Contenu de la page ---\n${body}`
        : `--- Contenu de la page ---\n${body}`;
    }
  } catch (err) {
    console.warn("[fetchNotionPage] blocks fetch failed", err);
  }

  return draft;
}

export async function fetchNotionTrades(filterDate?: string): Promise<NotionTradeDraft[]> {
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
      if (!draft) continue;
      if (filterDate && draft.date !== filterDate) continue;
      drafts.push(draft);
    }
    cursor = json.has_more ? json.next_cursor : null;
  } while (cursor);

  return drafts;
}
