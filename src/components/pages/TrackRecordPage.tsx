"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Target,
  Percent,
  DollarSign,
  BarChart3,
  Calendar as CalIcon,
  Trophy,
  Zap,
  ChevronLeft,
  ChevronRight,
  X as XIcon,
} from "lucide-react";
import { Trade, listTradesByDateRange } from "@/lib/trades";

const ACCENT = "#7C5CFF";
const GREEN = "#08D9D6";
const RED = "#FF2E63";
const GOLD = "#C59E3A";

function isoDateOffset(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function pnlEur(t: Trade): number {
  return typeof t.pnl_eur === "number" ? t.pnl_eur : 0;
}

function tradeRR(t: Trade): number | null {
  if (t.pnl_eur === null || !t.account_size_eur || !t.risk_pct) return null;
  const risk = t.account_size_eur * (t.risk_pct / 100);
  if (risk === 0) return null;
  return t.pnl_eur / risk;
}

function fmtEur(n: number): string {
  const sign = n >= 0 ? "+" : "-";
  return `${sign}€${Math.abs(n).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtRr(r: number): string {
  const sign = r >= 0 ? "+" : "-";
  return `${sign}${Math.abs(r).toFixed(2)}R`;
}

function countLogicalTrades(trades: Trade[]): number {
  const seenGroups = new Set<string>();
  let count = 0;
  for (const t of trades) {
    if (t.group_id) {
      if (seenGroups.has(t.group_id)) continue;
      seenGroups.add(t.group_id);
    }
    count += 1;
  }
  return count;
}

type Kpis = {
  total: number;
  wins: number;
  losses: number;
  opens: number;
  winRate: number | null;
  pnlEurTotal: number;
  rrAvg: number | null;
  rrSum: number;
  bestTrade: number | null;
  worstTrade: number | null;
  bestPair: string | null;
};

function computeKpis(trades: Trade[]): Kpis {
  const closed = trades.filter((t) => t.status === "closed-win" || t.status === "closed-loss");
  const wins = trades.filter((t) => t.status === "closed-win").length;
  const losses = trades.filter((t) => t.status === "closed-loss").length;
  const opens = trades.filter((t) => t.status === "open").length;
  const winRate = closed.length > 0 ? (wins / closed.length) * 100 : null;

  let pnlEurTotal = 0;
  let rrSum = 0;
  let rrCount = 0;
  let best: number | null = null;
  let worst: number | null = null;
  const byPair: Record<string, number> = {};

  for (const t of trades) {
    const u = pnlEur(t);
    pnlEurTotal += u;
    if (best === null || u > best) best = u;
    if (worst === null || u < worst) worst = u;
    byPair[t.pair] = (byPair[t.pair] ?? 0) + u;

    const r = tradeRR(t);
    if (r !== null) {
      rrSum += r;
      rrCount += 1;
    }
  }

  const rrAvg = rrCount > 0 ? rrSum / rrCount : null;
  const bestPair = Object.entries(byPair).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return {
    total: countLogicalTrades(trades),
    wins,
    losses,
    opens,
    winRate,
    pnlEurTotal,
    rrAvg,
    rrSum,
    bestTrade: best,
    worstTrade: worst,
    bestPair,
  };
}

const PRESETS: { label: string; days: number }[] = [
  { label: "7j", days: 6 },
  { label: "30j", days: 29 },
  { label: "90j", days: 89 },
  { label: "YTD", days: -1 },
];

const ALL_ACCOUNTS = "__all__";

function formatMonthFr(year: number, month0: number): string {
  const months = ["janvier", "fevrier", "mars", "avril", "mai", "juin", "juillet", "aout", "septembre", "octobre", "novembre", "decembre"];
  return `${months[month0].charAt(0).toUpperCase()}${months[month0].slice(1)} ${year}`;
}

export default function TrackRecordPage() {
  const today = new Date();
  const todayIso = isoDateOffset(0);
  const [start, setStart] = useState<string>(isoDateOffset(29));
  const [end, setEnd] = useState<string>(todayIso);
  const [allTrades, setAllTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [accountFilter, setAccountFilter] = useState<string>(ALL_ACCOUNTS);
  const [calYear, setCalYear] = useState<number>(today.getFullYear());
  const [calMonth, setCalMonth] = useState<number>(today.getMonth()); // 0-11
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // Fetch une fois large (tous les trades de 2024-2030) — filtrage client-side
  const reload = useCallback(async () => {
    setLoading(true);
    const list = await listTradesByDateRange("2024-01-01", "2030-12-31");
    setAllTrades(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const accounts = useMemo(() => {
    const set = new Set<string>();
    for (const t of allTrades) if (t.account) set.add(t.account);
    return Array.from(set).sort();
  }, [allTrades]);

  // trades = filtre par compte (utilise pour le calendrier, nav mois libre)
  const trades = useMemo(() => {
    if (accountFilter === ALL_ACCOUNTS) return allTrades;
    return allTrades.filter((t) => t.account === accountFilter);
  }, [allTrades, accountFilter]);

  // rangeTrades = filtre par plage de dates (pour KPIs + table)
  const rangeTrades = useMemo(() => {
    return trades.filter((t) => t.date >= start && t.date <= end);
  }, [trades, start, end]);

  const kpis = useMemo(() => computeKpis(rangeTrades), [rangeTrades]);

  const applyPreset = (days: number) => {
    if (days === -1) {
      const now = new Date();
      setStart(`${now.getFullYear()}-01-01`);
      setEnd(todayIso);
    } else {
      setStart(isoDateOffset(days));
      setEnd(todayIso);
    }
  };

  return (
    <div className="page-root" style={{ padding: "32px 28px", minHeight: "100vh", background: "var(--bg-page, #FAFAF9)" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <HeaderBar
          start={start}
          end={end}
          onStart={setStart}
          onEnd={setEnd}
          onPreset={applyPreset}
          accounts={accounts}
          accountFilter={accountFilter}
          onAccountFilterChange={setAccountFilter}
        />

        {loading ? (
          <div style={{ padding: 60, textAlign: "center", color: "#9CA3AF", fontSize: 14 }}>
            Chargement des trades...
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <CalendarView
              trades={trades}
              year={calYear}
              month={calMonth}
              onDayClick={(d) => setSelectedDay(d)}
              onPrev={() => {
                if (calMonth === 0) {
                  setCalMonth(11);
                  setCalYear((y) => y - 1);
                } else {
                  setCalMonth((m) => m - 1);
                }
              }}
              onNext={() => {
                if (calMonth === 11) {
                  setCalMonth(0);
                  setCalYear((y) => y + 1);
                } else {
                  setCalMonth((m) => m + 1);
                }
              }}
              onToday={() => {
                const now = new Date();
                setCalMonth(now.getMonth());
                setCalYear(now.getFullYear());
              }}
              accountFilter={accountFilter}
            />

            {rangeTrades.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: "#9CA3AF", fontSize: 14 }}>
                Aucun trade sur la plage de dates selectionnee (change la plage ou les presets).
              </div>
            ) : (
              <TrackRecordBody trades={rangeTrades} kpis={kpis} accountFilter={accountFilter} />
            )}
          </div>
        )}
      </div>
      {selectedDay && (
        <DayDetailModal
          day={selectedDay}
          trades={trades.filter((t) => t.date === selectedDay)}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </div>
  );
}

function HeaderBar({
  start,
  end,
  onStart,
  onEnd,
  onPreset,
  accounts,
  accountFilter,
  onAccountFilterChange,
}: {
  start: string;
  end: string;
  onStart: (v: string) => void;
  onEnd: (v: string) => void;
  onPreset: (days: number) => void;
  accounts: string[];
  accountFilter: string;
  onAccountFilterChange: (v: string) => void;
}) {
  const today = isoDateOffset(0);
  const activePreset = PRESETS.find((p) => {
    if (end !== today) return false;
    if (p.days === -1) {
      const year = new Date().getFullYear();
      return start === `${year}-01-01`;
    }
    return start === isoDateOffset(p.days);
  });

  return (
    <header style={{ marginBottom: 24, display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: "#6B7280", marginBottom: 6 }}>
            TRACK RECORD
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 300, letterSpacing: "-0.01em", fontFamily: "var(--font-display, Georgia, serif)", color: "#111" }}>
            Historique de performance
          </h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: "#6B7280" }}>COMPTE</label>
          <select
            value={accountFilter}
            onChange={(e) => onAccountFilterChange(e.target.value)}
            aria-label="Filtre compte"
            style={{ padding: "7px 12px", borderRadius: 8, border: `1px solid ${ACCENT}40`, background: "white", color: "#111", fontSize: 12, fontWeight: 600, minWidth: 140 }}
          >
            <option value={ALL_ACCOUNTS}>Tous les comptes</option>
            {accounts.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {PRESETS.map((p) => {
          const isActive = activePreset?.label === p.label;
          return (
            <button
              key={p.label}
              type="button"
              onClick={() => onPreset(p.days)}
              style={{
                padding: "6px 12px",
                fontSize: 11,
                fontWeight: 700,
                borderRadius: 8,
                background: isActive ? ACCENT : "white",
                border: `1px solid ${isActive ? ACCENT : "#E5E7EB"}`,
                color: isActive ? "white" : "#111",
                cursor: "pointer",
                boxShadow: isActive ? `0 1px 4px ${ACCENT}40` : "none",
              }}
            >
              {p.label}
            </button>
          );
        })}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <CalIcon size={14} style={{ color: "#6B7280" }} />
          <input
            type="date"
            value={start}
            onChange={(e) => onStart(e.target.value)}
            aria-label="Date debut"
            style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #E5E7EB", background: "white", color: "#111", fontSize: 12 }}
          />
          <span style={{ fontSize: 12, color: "#6B7280" }}>&rarr;</span>
          <input
            type="date"
            value={end}
            onChange={(e) => onEnd(e.target.value)}
            aria-label="Date fin"
            style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #E5E7EB", background: "white", color: "#111", fontSize: 12 }}
          />
        </div>
      </div>
    </header>
  );
}

function CalendarView({
  trades,
  year,
  month,
  onPrev,
  onNext,
  onToday,
  onDayClick,
  accountFilter,
}: {
  trades: Trade[];
  year: number;
  month: number; // 0-11
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onDayClick: (date: string) => void;
  accountFilter: string;
}) {
  // Group month's trades by date
  const monthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`;
  const monthTrades = trades.filter((t) => t.date.startsWith(monthPrefix));
  const tradesByDate: Record<string, Trade[]> = {};
  for (const t of monthTrades) {
    if (!tradesByDate[t.date]) tradesByDate[t.date] = [];
    tradesByDate[t.date].push(t);
  }

  // Monthly stats
  const monthlyPnl = monthTrades.reduce((acc, t) => acc + pnlEur(t), 0);
  const tradingDays = Object.keys(tradesByDate).length;
  let monthlyRr: number | null = null;
  if (accountFilter !== ALL_ACCOUNTS && monthTrades.length > 0) {
    const firstAcc = monthTrades[0];
    if (firstAcc.account_size_eur && firstAcc.risk_pct) {
      const risk = firstAcc.account_size_eur * (firstAcc.risk_pct / 100);
      if (risk > 0) monthlyRr = monthlyPnl / risk;
    }
  }

  // Build grid (6 rows × 7 cols, Mon-Sun)
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  // getDay: 0=Sun..6=Sat → convert to Mon=0..Sun=6
  const firstWeekday = (firstDay.getDay() + 6) % 7;
  const prevMonthLastDay = new Date(year, month, 0).getDate();

  const cells: { date: string; day: number; inMonth: boolean }[] = [];
  for (let i = 0; i < firstWeekday; i++) {
    const day = prevMonthLastDay - firstWeekday + 1 + i;
    const d = new Date(year, month - 1, day);
    cells.push({
      date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
      day,
      inMonth: false,
    });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      date: `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
      day: d,
      inMonth: true,
    });
  }
  const totalCells = Math.ceil(cells.length / 7) * 7;
  let nextDay = 1;
  while (cells.length < totalCells) {
    const d = new Date(year, month + 1, nextDay);
    cells.push({
      date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
      day: nextDay,
      inMonth: false,
    });
    nextDay += 1;
  }

  const todayIso = isoDateOffset(0);

  return (
    <div style={{ background: "white", borderRadius: 14, border: "1px solid #E5E7EB", overflow: "hidden" }}>
      <div style={{ padding: "14px 18px", borderBottom: "1px solid #F3F4F6", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={onToday}
          style={{ padding: "6px 14px", fontSize: 12, fontWeight: 700, borderRadius: 8, background: "white", border: "1px solid #E5E7EB", color: "#111", cursor: "pointer" }}
        >
          Aujourd&apos;hui
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button
            type="button"
            onClick={onPrev}
            aria-label="Mois precedent"
            style={{ width: 30, height: 30, borderRadius: 8, background: "white", border: "1px solid #E5E7EB", color: "#111", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <ChevronLeft size={16} />
          </button>
          <div style={{ padding: "0 12px", fontSize: 14, fontWeight: 700, color: "#111", minWidth: 150, textAlign: "center" }}>
            {formatMonthFr(year, month)}
          </div>
          <button
            type="button"
            onClick={onNext}
            aria-label="Mois suivant"
            style={{ width: 30, height: 30, borderRadius: 8, background: "white", border: "1px solid #E5E7EB", color: "#111", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#6B7280" }}>
          <span>Stats mensuelles :</span>
          <span
            style={{
              padding: "4px 10px",
              borderRadius: 6,
              background: monthlyPnl >= 0 ? `${GREEN}18` : `${RED}18`,
              color: monthlyPnl >= 0 ? GREEN : RED,
              fontWeight: 700,
              fontFamily: "monospace",
            }}
          >
            {fmtEur(monthlyPnl)}
          </span>
          {monthlyRr !== null && (
            <span
              style={{
                padding: "4px 10px",
                borderRadius: 6,
                background: monthlyRr >= 0 ? `${GREEN}18` : `${RED}18`,
                color: monthlyRr >= 0 ? GREEN : RED,
                fontWeight: 700,
                fontFamily: "monospace",
              }}
            >
              {fmtRr(monthlyRr)}
            </span>
          )}
          <span style={{ padding: "4px 10px", borderRadius: 6, background: "#F3F4F6", color: "#6B7280", fontWeight: 600 }}>
            Jours de trading : {tradingDays}
          </span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderTop: "1px solid #F3F4F6" }}>
        {["LUN.", "MAR.", "MER.", "JEU.", "VEN.", "SAM.", "DIM."].map((d) => (
          <div
            key={d}
            style={{ padding: "10px 12px", fontSize: 11, fontWeight: 800, letterSpacing: 1.5, color: "#9CA3AF", borderRight: "1px solid #F3F4F6", borderBottom: "1px solid #F3F4F6" }}
          >
            {d}
          </div>
        ))}
        {cells.map((cell, idx) => {
          const dayTrades = tradesByDate[cell.date] ?? [];
          const dayPnl = dayTrades.reduce((acc, t) => acc + pnlEur(t), 0);
          let dayRr: number | null = null;
          if (accountFilter !== ALL_ACCOUNTS && dayTrades.length > 0) {
            const t = dayTrades[0];
            if (t.account_size_eur && t.risk_pct) {
              const risk = t.account_size_eur * (t.risk_pct / 100);
              if (risk > 0) dayRr = dayPnl / risk;
            }
          }
          const nbLogical = countLogicalTrades(dayTrades);
          const isToday = cell.date === todayIso;
          const hasTrades = dayTrades.length > 0;
          const positive = dayPnl > 0;
          const negative = dayPnl < 0;

          const clickable = hasTrades && cell.inMonth;
          return (
            <div
              key={idx}
              onClick={clickable ? () => onDayClick(cell.date) : undefined}
              onKeyDown={clickable ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onDayClick(cell.date);
                }
              } : undefined}
              tabIndex={clickable ? 0 : -1}
              style={{
                minHeight: 100,
                padding: 8,
                borderRight: (idx + 1) % 7 === 0 ? "none" : "1px solid #F3F4F6",
                borderBottom: "1px solid #F3F4F6",
                opacity: cell.inMonth ? 1 : 0.35,
                display: "flex",
                flexDirection: "column",
                gap: 6,
                cursor: clickable ? "pointer" : "default",
                transition: "background 0.15s",
              }}
              onMouseEnter={clickable ? (e) => (e.currentTarget.style.background = "#FAFAF9") : undefined}
              onMouseLeave={clickable ? (e) => (e.currentTarget.style.background = "transparent") : undefined}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: isToday ? "white" : cell.inMonth ? "#374151" : "#9CA3AF",
                  width: isToday ? 24 : "auto",
                  height: isToday ? 24 : "auto",
                  borderRadius: isToday ? "50%" : 0,
                  background: isToday ? "#2563EB" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: isToday ? "center" : "flex-start",
                }}
              >
                {cell.day}
              </div>
              {hasTrades && cell.inMonth && (
                <div
                  style={{
                    background: positive ? `${GREEN}18` : negative ? `${RED}18` : "#F3F4F6",
                    borderRadius: 6,
                    padding: "6px 8px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: positive ? GREEN : negative ? RED : "#6B7280",
                      fontFamily: "monospace",
                    }}
                  >
                    {fmtEur(dayPnl)}
                  </div>
                  {dayRr !== null && (
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: positive ? GREEN : negative ? RED : "#6B7280",
                        fontFamily: "monospace",
                      }}
                    >
                      {fmtRr(dayRr)}
                    </div>
                  )}
                  <div style={{ fontSize: 10, color: "#6B7280" }}>
                    Trades : {nbLogical}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div style={{ background: "white", borderRadius: 14, border: "1px solid #E5E7EB", padding: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: accent ? `${accent}18` : "#F3F4F6",
            color: accent ?? "#6B7280",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </div>
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: "#6B7280" }}>{label}</span>
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "monospace", color: "#111" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function statusLabel(s: Trade["status"]): string {
  if (s === "closed-win") return "WIN";
  if (s === "closed-loss") return "LOSS";
  if (s === "open") return "OPEN";
  return "CANCEL";
}

function statusColor(s: Trade["status"]): string {
  if (s === "closed-win") return GREEN;
  if (s === "closed-loss") return RED;
  return "#6B7280";
}

function DayDetailModal({ day, trades, onClose }: { day: string; trades: Trade[]; onClose: () => void }) {
  const dayPnl = trades.reduce((acc, t) => acc + pnlEur(t), 0);
  const logical = countLogicalTrades(trades);
  const dayLabel = (() => {
    const [y, m, d] = day.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    return dt.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  })();

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "white", borderRadius: 16, width: "100%", maxWidth: 860, maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden" }}
      >
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #E5E7EB", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: "#6B7280", marginBottom: 4 }}>JOURNEE DE TRADING</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "#111", textTransform: "capitalize" }}>{dayLabel}</div>
            <div style={{ fontSize: 12, color: "#6B7280", marginTop: 4, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ padding: "3px 10px", borderRadius: 6, background: dayPnl >= 0 ? `${GREEN}18` : `${RED}18`, color: dayPnl >= 0 ? GREEN : RED, fontWeight: 700, fontFamily: "monospace" }}>
                {fmtEur(dayPnl)}
              </span>
              <span>{logical} trade{logical > 1 ? "s" : ""} · {trades.length} ligne{trades.length > 1 ? "s" : ""}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            title="Fermer"
            style={{ width: 32, height: 32, borderRadius: 8, background: "#F3F4F6", border: "none", color: "#6B7280", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <XIcon size={16} />
          </button>
        </div>
        <div style={{ padding: "18px 24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
          {trades.map((t) => {
            const rr = tradeRR(t);
            const pnl = pnlEur(t);
            const sColor = statusColor(t.status);
            return (
              <div
                key={t.id}
                style={{ border: "1px solid #E5E7EB", borderRadius: 12, padding: 14, display: "flex", flexDirection: "column", gap: 8, background: "#FAFAF9" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>{t.pair}</span>
                  <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 4, background: t.direction === "long" ? `${GREEN}15` : `${RED}15`, color: t.direction === "long" ? GREEN : RED, letterSpacing: 0.5 }}>
                    {t.direction.toUpperCase()}
                  </span>
                  <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 4, background: `${sColor}15`, color: sColor, letterSpacing: 0.5 }}>
                    {statusLabel(t.status)}
                  </span>
                  {t.account && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4, background: `${ACCENT}15`, color: ACCENT, letterSpacing: 0.5 }}>
                      {t.account}
                    </span>
                  )}
                  {t.time && <span style={{ fontSize: 11, fontFamily: "monospace", color: "#6B7280" }}>{t.time}</span>}
                  <div style={{ flex: 1 }} />
                  <span style={{ fontSize: 14, fontWeight: 700, fontFamily: "monospace", color: sColor }}>{t.pnl_eur !== null ? fmtEur(pnl) : "—"}</span>
                  {rr !== null && (
                    <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "monospace", color: sColor, padding: "2px 8px", borderRadius: 4, background: `${sColor}12` }}>
                      {fmtRr(rr)}
                    </span>
                  )}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10, fontSize: 11, color: "#6B7280", fontFamily: "monospace" }}>
                  <Info label="ENTRY" value={t.entry} />
                  <Info label="SL" value={t.sl} />
                  <Info label="TP" value={t.tp} />
                  <Info label="SIZE" value={t.size} />
                </div>
                {t.idea && (
                  <div style={{ fontSize: 12, color: "#374151", fontStyle: "italic", borderLeft: `3px solid ${ACCENT}`, paddingLeft: 10 }}>
                    {t.idea}
                  </div>
                )}
                {t.notes && (
                  <div style={{ fontSize: 11, color: "#6B7280", whiteSpace: "pre-wrap" }}>
                    {t.notes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string | null }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1, color: "#9CA3AF" }}>{label}</span>
      <span style={{ color: "#111", fontSize: 12 }}>{value ?? "—"}</span>
    </div>
  );
}

function TrackRecordBody({ trades, kpis, accountFilter }: { trades: Trade[]; kpis: Kpis; accountFilter: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
        <KpiCard icon={<Percent size={14} />} label="WIN RATE" value={kpis.winRate !== null ? `${kpis.winRate.toFixed(0)}%` : "—"} sub={`${kpis.wins}W / ${kpis.losses}L`} accent={GREEN} />
        <KpiCard icon={<DollarSign size={14} />} label="P&L NET" value={fmtEur(kpis.pnlEurTotal)} sub={`sur ${kpis.total} trades`} accent={kpis.pnlEurTotal >= 0 ? GREEN : RED} />
        <KpiCard icon={<Target size={14} />} label="RR MOYEN" value={kpis.rrAvg !== null ? fmtRr(kpis.rrAvg) : "—"} sub={`sum ${kpis.rrSum >= 0 ? "+" : ""}${kpis.rrSum.toFixed(2)}R`} accent={ACCENT} />
        <KpiCard icon={<BarChart3 size={14} />} label="NB TRADES" value={String(kpis.total)} sub={`${kpis.opens} en cours`} accent={GOLD} />
        <KpiCard icon={<Trophy size={14} />} label="BEST TRADE" value={kpis.bestTrade !== null ? fmtEur(kpis.bestTrade) : "—"} sub={kpis.bestPair ?? ""} accent={GREEN} />
        <KpiCard icon={<Zap size={14} />} label="WORST TRADE" value={kpis.worstTrade !== null ? fmtEur(kpis.worstTrade) : "—"} accent={RED} />
      </div>

      <div style={{ background: "white", borderRadius: 14, border: "1px solid #E5E7EB", overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #F3F4F6", fontSize: 11, fontWeight: 800, letterSpacing: 2, color: "#6B7280", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>TOUS LES TRADES ({trades.length})</span>
          {accountFilter !== ALL_ACCOUNTS && (
            <span style={{ fontSize: 11, fontWeight: 700, color: ACCENT, letterSpacing: 1 }}>COMPTE : {accountFilter}</span>
          )}
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#FAFAF9" }}>
                {["Date", "Heure", "Compte", "Paire", "Dir.", "Entry", "SL", "TP", "Size", "Status", "P&L (€)", "R", "Idee"].map((h) => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 10, fontWeight: 800, letterSpacing: 1, color: "#6B7280", borderBottom: "1px solid #E5E7EB", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trades.map((t) => {
                const rr = tradeRR(t);
                const pnl = pnlEur(t);
                return (
                  <tr key={t.id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                    <td style={{ padding: "10px 12px", fontFamily: "monospace", fontSize: 11, color: "#6B7280", whiteSpace: "nowrap" }}>{t.date}</td>
                    <td style={{ padding: "10px 12px", fontFamily: "monospace", fontSize: 11, color: "#6B7280" }}>{t.time ?? "—"}</td>
                    <td style={{ padding: "10px 12px", fontSize: 11 }}>
                      {t.account ? (
                        <span style={{ padding: "2px 7px", borderRadius: 4, background: `${ACCENT}15`, color: ACCENT, fontSize: 10, fontWeight: 700, letterSpacing: 0.5 }}>
                          {t.account}
                        </span>
                      ) : "—"}
                    </td>
                    <td style={{ padding: "10px 12px", fontWeight: 700 }}>{t.pair}</td>
                    <td style={{ padding: "10px 12px" }}>
                      <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 6px", borderRadius: 4, background: t.direction === "long" ? `${GREEN}15` : `${RED}15`, color: t.direction === "long" ? GREEN : RED }}>
                        {t.direction.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px", fontFamily: "monospace", fontSize: 11 }}>{t.entry ?? "—"}</td>
                    <td style={{ padding: "10px 12px", fontFamily: "monospace", fontSize: 11 }}>{t.sl ?? "—"}</td>
                    <td style={{ padding: "10px 12px", fontFamily: "monospace", fontSize: 11 }}>{t.tp ?? "—"}</td>
                    <td style={{ padding: "10px 12px", fontFamily: "monospace", fontSize: 11 }}>{t.size ?? "—"}</td>
                    <td style={{ padding: "10px 12px" }}>
                      <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 6px", borderRadius: 4, background: `${statusColor(t.status)}15`, color: statusColor(t.status) }}>
                        {statusLabel(t.status)}
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px", fontFamily: "monospace", fontWeight: 700, color: statusColor(t.status) }}>
                      {t.pnl_eur !== null ? fmtEur(pnl) : "—"}
                    </td>
                    <td style={{ padding: "10px 12px", fontFamily: "monospace", fontWeight: 700, color: rr !== null ? (rr >= 0 ? GREEN : RED) : "#9CA3AF" }}>
                      {rr !== null ? fmtRr(rr) : "—"}
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: 12, color: "#6B7280", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.idea ?? ""}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
