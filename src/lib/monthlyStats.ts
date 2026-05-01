import { Trade, TradeStatus } from "@/lib/trades";

export type EquityPoint = { idx: number; date: string; equity: number; equityPct: number; trade?: number };
export type PerTradePoint = { idx: number; date: string; pair: string; pnl: number; pnlPct: number; rr: number | null; isWin: boolean; account: string | null };

export type MonthlyStats = {
  // Top bar (Excel-like)
  returnRR: number;
  returnPct: number;
  tradeExpectancy: number;
  totalTrades: number;
  losses: number;
  wins: number;
  pctLost: number;
  pctWon: number;
  // Bottom bar ($)
  totalProfits: number;
  totalLosses: number;
  net: number;
  lossPct: number;
  profitPct: number;
  // Series
  equity: EquityPoint[];
  perTrade: PerTradePoint[];
  // Donuts
  hitRate: { wins: number; losses: number };
  profitLossRatio: { profitPct: number; lossPct: number };
  // Meta
  totalAccountSize: number;
  accountsCount: number;
};

type LogicalTrade = {
  pnlEur: number;
  rr: number | null;
  status: TradeStatus;
  pair: string;
  date: string;
  time: string | null;
  account: string | null;
  accountSize: number | null;
};

function pnlOf(t: Trade): number {
  return typeof t.pnl_eur === "number" ? t.pnl_eur : 0;
}

function rrOf(t: Trade): number | null {
  if (t.pnl_eur === null || !t.account_size_eur || !t.risk_pct) return null;
  const risk = t.account_size_eur * (t.risk_pct / 100);
  if (risk === 0) return null;
  return t.pnl_eur / risk;
}

// Aligne avec computeKpis dans TrackRecordPage : 1 idee de trade = 1 logical trade
// (meme si plusieurs lignes via group_id)
function groupLogicalTrades(trades: Trade[]): LogicalTrade[] {
  const groups = new Map<string, Trade[]>();
  const singles: Trade[] = [];
  for (const t of trades) {
    if (t.group_id) {
      const arr = groups.get(t.group_id) ?? [];
      arr.push(t);
      groups.set(t.group_id, arr);
    } else {
      singles.push(t);
    }
  }

  const logical: LogicalTrade[] = [];

  for (const t of singles) {
    logical.push({
      pnlEur: pnlOf(t),
      rr: rrOf(t),
      status: t.status,
      pair: t.pair,
      date: t.date,
      time: t.time,
      account: t.account,
      accountSize: t.account_size_eur,
    });
  }

  for (const arr of groups.values()) {
    const pnlSum = arr.reduce((acc, t) => acc + pnlOf(t), 0);
    const ref = arr[0];
    let rr: number | null = null;
    if (ref.account_size_eur && ref.risk_pct) {
      const risk = ref.account_size_eur * (ref.risk_pct / 100);
      if (risk > 0) rr = pnlSum / risk;
    }
    const hasOpen = arr.some((t) => t.status === "open");
    const status: TradeStatus = hasOpen ? "open" : pnlSum >= 0 ? "closed-win" : "closed-loss";
    logical.push({
      pnlEur: pnlSum,
      rr,
      status,
      pair: ref.pair,
      date: ref.date,
      time: ref.time,
      account: ref.account,
      accountSize: ref.account_size_eur,
    });
  }

  return logical;
}

export function computeMonthlyStats(trades: Trade[]): MonthlyStats {
  const allLogical = groupLogicalTrades(trades);
  const closed = allLogical.filter((t) => t.status === "closed-win" || t.status === "closed-loss");

  // Pre-calc total account size (dedupe par NOM)
  const accountSizes = new Map<string, number>();
  for (const t of closed) {
    if (t.account && t.accountSize) {
      accountSizes.set(t.account, t.accountSize);
    }
  }
  const totalAccountSize = Array.from(accountSizes.values()).reduce((a, b) => a + b, 0);

  // Tri chronologique pour equity curve
  const sorted = [...closed].sort((a, b) => {
    const cmp = a.date.localeCompare(b.date);
    if (cmp !== 0) return cmp;
    return (a.time ?? "").localeCompare(b.time ?? "");
  });

  let equityRunning = 0;
  const equity: EquityPoint[] = [{ idx: 0, date: sorted[0]?.date ?? "", equity: 0, equityPct: 0 }];
  const perTrade: PerTradePoint[] = [];

  let totalProfits = 0;
  let totalLosses = 0;
  let wins = 0;
  let losses = 0;
  let rrSum = 0;
  let rrWinsSum = 0;
  let rrLossesSum = 0;
  let rrWinsCount = 0;
  let rrLossesCount = 0;

  sorted.forEach((t, i) => {
    const pnl = t.pnlEur;
    const rr = t.rr;
    const isWin = t.status === "closed-win";

    equityRunning += pnl;
    const equityPct = totalAccountSize > 0 ? (equityRunning / totalAccountSize) * 100 : 0;
    equity.push({ idx: i + 1, date: t.date, equity: equityRunning, equityPct, trade: pnl });

    const pnlPct = t.accountSize && t.accountSize > 0 ? (pnl / t.accountSize) * 100 : 0;
    perTrade.push({
      idx: i + 1,
      date: t.date,
      pair: t.pair,
      pnl,
      pnlPct,
      rr,
      isWin,
      account: t.account,
    });

    if (isWin) {
      wins += 1;
      totalProfits += pnl;
      if (rr !== null) {
        rrWinsSum += rr;
        rrWinsCount += 1;
      }
    } else {
      losses += 1;
      totalLosses += pnl;
      if (rr !== null) {
        rrLossesSum += rr;
        rrLossesCount += 1;
      }
    }
    if (rr !== null) rrSum += rr;
  });

  const totalTrades = closed.length;
  const pctWon = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
  const pctLost = totalTrades > 0 ? (losses / totalTrades) * 100 : 0;

  const avgRrWins = rrWinsCount > 0 ? rrWinsSum / rrWinsCount : 0;
  const avgRrLosses = rrLossesCount > 0 ? rrLossesSum / rrLossesCount : 0;
  const tradeExpectancy = (pctWon / 100) * avgRrWins + (pctLost / 100) * avgRrLosses;

  const net = totalProfits + totalLosses;

  // Return % : dedupe par NOM de compte (totalAccountSize calcule en haut, ex: 3x 10K + 2x 50K = 130K)
  const returnPct = totalAccountSize > 0 ? (net / totalAccountSize) * 100 : 0;

  const absLosses = Math.abs(totalLosses);
  const denom = absLosses + totalProfits;
  const profitPct = denom > 0 ? (totalProfits / denom) * 100 : 0;
  const lossPct = denom > 0 ? (absLosses / denom) * 100 : 0;

  return {
    returnRR: rrSum,
    returnPct,
    tradeExpectancy,
    totalTrades,
    wins,
    losses,
    pctWon,
    pctLost,
    totalProfits,
    totalLosses,
    net,
    profitPct,
    lossPct,
    equity,
    perTrade,
    hitRate: { wins: pctWon, losses: pctLost },
    profitLossRatio: { profitPct, lossPct },
    totalAccountSize,
    accountsCount: accountSizes.size,
  };
}

export function fmtUsd(n: number): string {
  const sign = n >= 0 ? "+" : "-";
  return `${sign}$${Math.abs(n).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function fmtPct(n: number, digits = 1): string {
  return `${n >= 0 ? "" : ""}${n.toFixed(digits)}%`;
}

export function fmtR(r: number): string {
  const sign = r >= 0 ? "+" : "-";
  return `${sign}${Math.abs(r).toFixed(2)}R`;
}
