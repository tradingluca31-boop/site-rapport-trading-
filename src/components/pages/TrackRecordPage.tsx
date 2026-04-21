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

function parsePnlUsd(s: string | null): number | null {
  if (!s) return null;
  const cleaned = s.replace(/[^\d.\-+%R]/gi, "");
  if (/R\b/i.test(s) || cleaned.endsWith("R")) return null;
  if (cleaned.endsWith("%")) return null;
  const n = parseFloat(s.replace(/[^\d.\-]/g, ""));
  if (isNaN(n)) return null;
  return s.trim().startsWith("-") ? -Math.abs(n) : Math.abs(n);
}

function parseRr(s: string | null): number | null {
  if (!s) return null;
  if (!/R\b/i.test(s)) return null;
  const n = parseFloat(s.replace(/[^\d.\-]/g, ""));
  return isNaN(n) ? null : n;
}

type Kpis = {
  total: number;
  wins: number;
  losses: number;
  opens: number;
  winRate: number | null;
  pnlUsd: number;
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

  let pnlUsd = 0;
  let rrSum = 0;
  let rrCount = 0;
  let best: number | null = null;
  let worst: number | null = null;
  const byPair: Record<string, number> = {};

  for (const t of trades) {
    const u = parsePnlUsd(t.pnl);
    if (u !== null) {
      pnlUsd += u;
      if (best === null || u > best) best = u;
      if (worst === null || u < worst) worst = u;
      byPair[t.pair] = (byPair[t.pair] ?? 0) + u;
    }
    const r = parseRr(t.pnl);
    if (r !== null) {
      rrSum += r;
      rrCount += 1;
    }
  }

  const rrAvg = rrCount > 0 ? rrSum / rrCount : null;
  const bestPair = Object.entries(byPair).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return {
    total: trades.length,
    wins,
    losses,
    opens,
    winRate,
    pnlUsd,
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

export default function TrackRecordPage() {
  const [start, setStart] = useState<string>(isoDateOffset(29));
  const [end, setEnd] = useState<string>(isoDateOffset(0));
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const list = await listTradesByDateRange(start, end);
    setTrades(list);
    setLoading(false);
  }, [start, end]);

  useEffect(() => {
    reload();
  }, [reload]);

  const kpis = useMemo(() => computeKpis(trades), [trades]);

  const applyPreset = (days: number) => {
    if (days === -1) {
      const now = new Date();
      setStart(`${now.getFullYear()}-01-01`);
      setEnd(isoDateOffset(0));
    } else {
      setStart(isoDateOffset(days));
      setEnd(isoDateOffset(0));
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
        />

        {loading ? (
          <div style={{ padding: 60, textAlign: "center", color: "#9CA3AF", fontSize: 14 }}>
            Chargement des trades...
          </div>
        ) : trades.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center", color: "#9CA3AF", fontSize: 14 }}>
            Aucun trade sur cette periode. Elargis la plage pour en voir plus.
          </div>
        ) : (
          <TrackRecordBody trades={trades} kpis={kpis} />
        )}
      </div>
    </div>
  );
}

function HeaderBar({
  start,
  end,
  onStart,
  onEnd,
  onPreset,
}: {
  start: string;
  end: string;
  onStart: (v: string) => void;
  onEnd: (v: string) => void;
  onPreset: (days: number) => void;
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
      <div>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: "#6B7280", marginBottom: 6 }}>
          TRACK RECORD
        </div>
        <h1 style={{ fontSize: 30, fontWeight: 300, letterSpacing: "-0.01em", fontFamily: "var(--font-display, Georgia, serif)", color: "#111" }}>
          Historique de performance
        </h1>
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
    <div
      style={{
        background: "white",
        borderRadius: 14,
        border: "1px solid #E5E7EB",
        padding: 18,
      }}
    >
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
      <div style={{ fontSize: 26, fontWeight: 700, fontFamily: "monospace", color: "#111" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function fmtUsd(n: number): string {
  const sign = n >= 0 ? "+" : "-";
  return `${sign}$${Math.round(Math.abs(n)).toLocaleString("fr-FR")}`;
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

function TrackRecordBody({ trades, kpis }: { trades: Trade[]; kpis: Kpis }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
        <KpiCard icon={<Percent size={14} />} label="WIN RATE" value={kpis.winRate !== null ? `${kpis.winRate.toFixed(0)}%` : "—"} sub={`${kpis.wins}W / ${kpis.losses}L`} accent={GREEN} />
        <KpiCard icon={<DollarSign size={14} />} label="P&L NET" value={fmtUsd(kpis.pnlUsd)} sub={`sur ${kpis.total} trades`} accent={kpis.pnlUsd >= 0 ? GREEN : RED} />
        <KpiCard icon={<Target size={14} />} label="RR MOYEN" value={kpis.rrAvg !== null ? `${kpis.rrAvg.toFixed(2)}R` : "—"} sub={`sum ${kpis.rrSum.toFixed(1)}R`} accent={ACCENT} />
        <KpiCard icon={<BarChart3 size={14} />} label="NB TRADES" value={String(kpis.total)} sub={`${kpis.opens} en cours`} accent={GOLD} />
        <KpiCard icon={<Trophy size={14} />} label="BEST TRADE" value={kpis.bestTrade !== null ? fmtUsd(kpis.bestTrade) : "—"} sub={kpis.bestPair ?? ""} accent={GREEN} />
        <KpiCard icon={<Zap size={14} />} label="WORST TRADE" value={kpis.worstTrade !== null ? fmtUsd(kpis.worstTrade) : "—"} accent={RED} />
      </div>

      <div style={{ background: "white", borderRadius: 14, border: "1px solid #E5E7EB", overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #F3F4F6", fontSize: 11, fontWeight: 800, letterSpacing: 2, color: "#6B7280" }}>
          TOUS LES TRADES ({trades.length})
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#FAFAF9" }}>
              {["Date", "Heure", "Paire", "Dir.", "Entry", "SL", "TP", "Size", "Status", "P&L", "Idee"].map((h) => (
                <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 10, fontWeight: 800, letterSpacing: 1, color: "#6B7280", borderBottom: "1px solid #E5E7EB" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {trades.map((t) => (
              <tr key={t.id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                <td style={{ padding: "10px 12px", fontFamily: "monospace", fontSize: 11, color: "#6B7280" }}>{t.date}</td>
                <td style={{ padding: "10px 12px", fontFamily: "monospace", fontSize: 11, color: "#6B7280" }}>{t.time ?? "—"}</td>
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
                <td style={{ padding: "10px 12px", fontFamily: "monospace", fontWeight: 700, color: statusColor(t.status) }}>{t.pnl ?? "—"}</td>
                <td style={{ padding: "10px 12px", fontSize: 12, color: "#6B7280", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.idea ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
