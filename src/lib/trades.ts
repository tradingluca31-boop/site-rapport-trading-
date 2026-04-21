import { createClient } from "@/lib/supabase/client";

export type TradeDirection = "long" | "short";
export type TradeStatus = "open" | "closed-win" | "closed-loss" | "cancelled";
export type TradeSource = "manual" | "notion" | "mt5";

export type Trade = {
  id: string;
  created_at: string;
  updated_at: string;
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
  source: TradeSource;
  notion_id: string | null;
};

export type TradeInput = Omit<Trade, "id" | "created_at" | "updated_at">;
export type TradePatch = Partial<TradeInput>;

const TABLE = "trades";

export async function listTrades(): Promise<Trade[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("date", { ascending: false })
    .order("time", { ascending: false, nullsFirst: false });
  if (error) {
    console.error("[trades] listTrades error", error);
    return [];
  }
  return (data ?? []) as Trade[];
}

export async function listTradesByDate(date: string): Promise<Trade[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("date", date)
    .order("time", { ascending: true, nullsFirst: false });
  if (error) {
    console.error("[trades] listTradesByDate error", error);
    return [];
  }
  return (data ?? []) as Trade[];
}

export async function listTradesByDateRange(start: string, end: string): Promise<Trade[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .gte("date", start)
    .lte("date", end)
    .order("date", { ascending: false })
    .order("time", { ascending: false, nullsFirst: false });
  if (error) {
    console.error("[trades] listTradesByDateRange error", error);
    return [];
  }
  return (data ?? []) as Trade[];
}

export async function createTrade(input: Partial<TradeInput> & Pick<TradeInput, "date" | "pair" | "direction">): Promise<Trade | null> {
  const supabase = createClient();
  const payload = {
    status: "open" as TradeStatus,
    source: "manual" as TradeSource,
    tags: [] as string[],
    ...input,
  };
  const { data, error } = await supabase.from(TABLE).insert(payload).select().single();
  if (error) {
    console.error("[trades] createTrade error", error);
    return null;
  }
  return data as Trade;
}

export async function updateTrade(id: string, patch: TradePatch): Promise<Trade | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from(TABLE)
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) {
    console.error("[trades] updateTrade error", error);
    return null;
  }
  return data as Trade;
}

export async function deleteTrade(id: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) {
    console.error("[trades] deleteTrade error", error);
    return false;
  }
  return true;
}

export async function upsertTradeByNotionId(
  notionId: string,
  input: Partial<TradeInput> & Pick<TradeInput, "date" | "pair" | "direction">
): Promise<Trade | null> {
  const supabase = createClient();
  const payload = {
    status: "open" as TradeStatus,
    source: "notion" as TradeSource,
    tags: [] as string[],
    ...input,
    notion_id: notionId,
  };
  const { data, error } = await supabase
    .from(TABLE)
    .upsert(payload, { onConflict: "notion_id" })
    .select()
    .single();
  if (error) {
    console.error("[trades] upsertTradeByNotionId error", error);
    return null;
  }
  return data as Trade;
}

export function computeTradeStats(trades: Trade[]): {
  total: number;
  wins: number;
  losses: number;
  open: number;
  winrate: number | null;
} {
  const closed = trades.filter((t) => t.status === "closed-win" || t.status === "closed-loss");
  const wins = trades.filter((t) => t.status === "closed-win").length;
  const losses = trades.filter((t) => t.status === "closed-loss").length;
  const open = trades.filter((t) => t.status === "open").length;
  const winrate = closed.length > 0 ? (wins / closed.length) * 100 : null;
  return { total: trades.length, wins, losses, open, winrate };
}
