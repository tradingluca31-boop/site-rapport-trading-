"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Percent,
  DollarSign,
  BarChart3,
  Calendar as CalIcon,
  Activity,
  Trophy,
  Zap,
} from "lucide-react";
import { Trade, listTradesByDateRange } from "@/lib/trades";

const ACCENT = "#7C5CFF";
const GREEN = "#08D9D6";
const RED = "#FF2E63";
const GOLD = "#C59E3A";
const INK = "#0B0E14";

type VariantId = "classique" | "timeline" | "kanban" | "terminal";

const VARIANTS: { id: VariantId; label: string; hint: string }[] = [
  { id: "classique", label: "V1 · Classique", hint: "Cards KPI + table dense" },
  { id: "timeline", label: "V2 · Timeline", hint: "Frise chronologique" },
  { id: "kanban", label: "V3 · Cartes", hint: "Grille style journal" },
  { id: "terminal", label: "V4 · Terminal", hint: "Dark pro + equity" },
];

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
  const [variant, setVariant] = useState<VariantId>("classique");
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
    <div className="page-root" style={{ padding: "32px 28px", minHeight: "100vh", background: variant === "terminal" ? INK : "var(--bg-page, #FAFAF9)" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <HeaderBar
          start={start}
          end={end}
          onStart={setStart}
          onEnd={setEnd}
          onPreset={applyPreset}
          variant={variant}
        />
        <VariantTabs active={variant} onChange={setVariant} />

        {loading ? (
          <div style={{ padding: 60, textAlign: "center", color: variant === "terminal" ? "#6B7280" : "#9CA3AF", fontSize: 14 }}>
            Chargement des trades...
          </div>
        ) : trades.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center", color: variant === "terminal" ? "#6B7280" : "#9CA3AF", fontSize: 14 }}>
            Aucun trade sur cette periode. Elargis la plage ou importe depuis Notion sur la page Rapport.
          </div>
        ) : (
          <>
            {variant === "classique" && <VariantClassique trades={trades} kpis={kpis} />}
            {variant === "timeline" && <VariantTimeline trades={trades} kpis={kpis} />}
            {variant === "kanban" && <VariantKanban trades={trades} kpis={kpis} />}
            {variant === "terminal" && <VariantTerminal trades={trades} kpis={kpis} />}
          </>
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
  variant,
}: {
  start: string;
  end: string;
  onStart: (v: string) => void;
  onEnd: (v: string) => void;
  onPreset: (days: number) => void;
  variant: VariantId;
}) {
  const dark = variant === "terminal";
  const labelColor = dark ? "#6B7280" : "#6B7280";
  const titleColor = dark ? "#F3F4F6" : "#111";
  const inputBg = dark ? "#141821" : "white";
  const inputBorder = dark ? "#262B36" : "#E5E7EB";
  const inputColor = dark ? "#E5E7EB" : "#111";

  return (
    <header style={{ marginBottom: 24, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: labelColor, marginBottom: 6 }}>
          TRACK RECORD
        </div>
        <h1 style={{ fontSize: 30, fontWeight: 300, letterSpacing: "-0.01em", fontFamily: "var(--font-display, Georgia, serif)", color: titleColor }}>
          Historique de performance
        </h1>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => onPreset(p.days)}
            style={{
              padding: "6px 12px",
              fontSize: 11,
              fontWeight: 700,
              borderRadius: 8,
              background: inputBg,
              border: `1px solid ${inputBorder}`,
              color: inputColor,
              cursor: "pointer",
            }}
          >
            {p.label}
          </button>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <CalIcon size={14} style={{ color: labelColor }} />
          <input
            type="date"
            value={start}
            onChange={(e) => onStart(e.target.value)}
            aria-label="Date debut"
            style={{ padding: "6px 10px", borderRadius: 8, border: `1px solid ${inputBorder}`, background: inputBg, color: inputColor, fontSize: 12 }}
          />
          <span style={{ fontSize: 12, color: labelColor }}>&rarr;</span>
          <input
            type="date"
            value={end}
            onChange={(e) => onEnd(e.target.value)}
            aria-label="Date fin"
            style={{ padding: "6px 10px", borderRadius: 8, border: `1px solid ${inputBorder}`, background: inputBg, color: inputColor, fontSize: 12 }}
          />
        </div>
      </div>
    </header>
  );
}

function VariantTabs({ active, onChange }: { active: VariantId; onChange: (v: VariantId) => void }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 6,
        marginBottom: 24,
        padding: 5,
        background: active === "terminal" ? "#141821" : "#F3F4F6",
        borderRadius: 12,
        width: "fit-content",
      }}
    >
      {VARIANTS.map((v) => {
        const isActive = active === v.id;
        return (
          <button
            key={v.id}
            type="button"
            onClick={() => onChange(v.id)}
            title={v.hint}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: "none",
              background: isActive ? (active === "terminal" ? "#1F2430" : "white") : "transparent",
              color: isActive ? (active === "terminal" ? "#E5E7EB" : "#111") : active === "terminal" ? "#6B7280" : "#6B7280",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 0.3,
              cursor: "pointer",
              boxShadow: isActive && active !== "terminal" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}
          >
            {v.label}
          </button>
        );
      })}
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  sub,
  accent,
  dark,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent?: string;
  dark?: boolean;
}) {
  return (
    <div
      style={{
        background: dark ? "#141821" : "white",
        borderRadius: 14,
        border: `1px solid ${dark ? "#262B36" : "#E5E7EB"}`,
        padding: 18,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: accent ? `${accent}18` : dark ? "#1F2430" : "#F3F4F6",
            color: accent ?? (dark ? "#9CA3AF" : "#6B7280"),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </div>
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: dark ? "#9CA3AF" : "#6B7280" }}>{label}</span>
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, fontFamily: "monospace", color: dark ? "#F3F4F6" : "#111" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: dark ? "#6B7280" : "#9CA3AF", marginTop: 4 }}>{sub}</div>}
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

// =============================================================================
// VARIANT 1 — CLASSIQUE
// =============================================================================
function VariantClassique({ trades, kpis }: { trades: Trade[]; kpis: Kpis }) {
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

// =============================================================================
// VARIANT 2 — TIMELINE
// =============================================================================
function VariantTimeline({ trades, kpis }: { trades: Trade[]; kpis: Kpis }) {
  const grouped: Record<string, Trade[]> = {};
  for (const t of trades) {
    (grouped[t.date] ??= []).push(t);
  }
  const dates = Object.keys(grouped).sort((a, b) => (a < b ? 1 : -1));

  return (
    <div style={{ display: "grid", gridTemplateColumns: "260px minmax(0, 1fr)", gap: 24, alignItems: "flex-start" }}>
      <div style={{ position: "sticky", top: 24, display: "flex", flexDirection: "column", gap: 12 }}>
        <KpiCard icon={<Percent size={14} />} label="WIN RATE" value={kpis.winRate !== null ? `${kpis.winRate.toFixed(0)}%` : "—"} sub={`${kpis.wins}W / ${kpis.losses}L`} accent={GREEN} />
        <KpiCard icon={<DollarSign size={14} />} label="P&L NET" value={fmtUsd(kpis.pnlUsd)} sub={`${kpis.total} trades`} accent={kpis.pnlUsd >= 0 ? GREEN : RED} />
        <KpiCard icon={<Target size={14} />} label="RR MOYEN" value={kpis.rrAvg !== null ? `${kpis.rrAvg.toFixed(2)}R` : "—"} accent={ACCENT} />
        <KpiCard icon={<Activity size={14} />} label="JOURS TRADES" value={String(dates.length)} accent={GOLD} />
      </div>

      <div style={{ position: "relative", paddingLeft: 28 }}>
        <div style={{ position: "absolute", left: 8, top: 0, bottom: 0, width: 2, background: "#E5E7EB" }} />
        {dates.map((d) => {
          const dayTrades = grouped[d];
          const dayWins = dayTrades.filter((t) => t.status === "closed-win").length;
          const dayLosses = dayTrades.filter((t) => t.status === "closed-loss").length;
          const dayPnl = dayTrades.reduce((acc, t) => acc + (parsePnlUsd(t.pnl) ?? 0), 0);
          const dayColor = dayPnl > 0 ? GREEN : dayPnl < 0 ? RED : "#6B7280";

          return (
            <div key={d} style={{ marginBottom: 28, position: "relative" }}>
              <div style={{ position: "absolute", left: -26, top: 4, width: 18, height: 18, borderRadius: "50%", background: dayColor, border: "3px solid white", boxShadow: `0 0 0 2px ${dayColor}40` }} />
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{d}</div>
                <div style={{ fontSize: 11, color: "#6B7280" }}>
                  {dayTrades.length} trade(s) · {dayWins}W / {dayLosses}L
                </div>
                <div style={{ marginLeft: "auto", fontSize: 14, fontWeight: 700, fontFamily: "monospace", color: dayColor }}>
                  {dayPnl !== 0 ? fmtUsd(dayPnl) : "—"}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {dayTrades.map((t) => (
                  <div
                    key={t.id}
                    style={{
                      background: "white",
                      border: "1px solid #E5E7EB",
                      borderRadius: 10,
                      padding: "10px 14px",
                      display: "grid",
                      gridTemplateColumns: "60px 80px auto minmax(0, 1fr) auto",
                      gap: 12,
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: 11, fontFamily: "monospace", color: "#9CA3AF" }}>{t.time ?? "—"}</span>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{t.pair}</span>
                    <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 6px", borderRadius: 4, background: t.direction === "long" ? `${GREEN}15` : `${RED}15`, color: t.direction === "long" ? GREEN : RED }}>
                      {t.direction.toUpperCase()}
                    </span>
                    <span style={{ fontSize: 12, color: "#6B7280", fontStyle: "italic", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {t.idea ?? ""}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 700, fontFamily: "monospace", color: statusColor(t.status) }}>{t.pnl ?? "—"}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================================
// VARIANT 3 — KANBAN CARDS
// =============================================================================
function VariantKanban({ trades, kpis }: { trades: Trade[]; kpis: Kpis }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <KpiCard icon={<Percent size={14} />} label="WIN RATE" value={kpis.winRate !== null ? `${kpis.winRate.toFixed(0)}%` : "—"} sub={`${kpis.wins}W / ${kpis.losses}L`} accent={GREEN} />
        <KpiCard icon={<DollarSign size={14} />} label="P&L NET" value={fmtUsd(kpis.pnlUsd)} sub={`${kpis.total} trades`} accent={kpis.pnlUsd >= 0 ? GREEN : RED} />
        <KpiCard icon={<Target size={14} />} label="RR MOYEN" value={kpis.rrAvg !== null ? `${kpis.rrAvg.toFixed(2)}R` : "—"} sub={`cum ${kpis.rrSum.toFixed(1)}R`} accent={ACCENT} />
        <KpiCard icon={<Trophy size={14} />} label="BEST TRADE" value={kpis.bestTrade !== null ? fmtUsd(kpis.bestTrade) : "—"} sub={kpis.bestPair ?? ""} accent={GOLD} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
        {trades.map((t) => {
          const isLong = t.direction === "long";
          const stColor = statusColor(t.status);
          return (
            <div
              key={t.id}
              style={{
                background: "white",
                borderRadius: 14,
                border: "1px solid #E5E7EB",
                padding: 16,
                borderTop: `3px solid ${stColor}`,
                position: "relative",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: isLong ? `${GREEN}15` : `${RED}15`,
                    color: isLong ? GREEN : RED,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {isLong ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{t.pair}</div>
                  <div style={{ fontSize: 10, fontFamily: "monospace", color: "#9CA3AF" }}>
                    {t.date} {t.time ? `· ${t.time}` : ""}
                  </div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 4, background: `${stColor}15`, color: stColor, letterSpacing: 1 }}>
                  {statusLabel(t.status)}
                </span>
              </div>
              <div style={{ fontSize: 11, color: "#6B7280", fontFamily: "monospace", marginBottom: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                {t.entry && <span>Entry {t.entry}</span>}
                {t.sl && <span>· SL {t.sl}</span>}
                {t.tp && <span>· TP {t.tp}</span>}
                {t.size && <span>· {t.size}</span>}
              </div>
              {t.idea && (
                <div style={{ fontSize: 12, color: "#374151", fontStyle: "italic", lineHeight: 1.5, marginBottom: 10 }}>
                  &ldquo;{t.idea}&rdquo;
                </div>
              )}
              {t.pnl && (
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    fontFamily: "monospace",
                    color: stColor,
                    paddingTop: 10,
                    borderTop: "1px solid #F3F4F6",
                    textAlign: "right",
                  }}
                >
                  {t.pnl}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================================
// VARIANT 4 — PRO TERMINAL (dark)
// =============================================================================
function VariantTerminal({ trades, kpis }: { trades: Trade[]; kpis: Kpis }) {
  const equityPoints: { date: string; cum: number }[] = [];
  const sorted = [...trades].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  let cum = 0;
  for (const t of sorted) {
    const u = parsePnlUsd(t.pnl);
    if (u !== null) cum += u;
    equityPoints.push({ date: t.date, cum });
  }
  const minCum = Math.min(0, ...equityPoints.map((p) => p.cum));
  const maxCum = Math.max(0, ...equityPoints.map((p) => p.cum));
  const span = Math.max(Math.abs(maxCum - minCum), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
        <KpiCard dark icon={<Percent size={14} />} label="WIN RATE" value={kpis.winRate !== null ? `${kpis.winRate.toFixed(0)}%` : "—"} sub={`${kpis.wins}W / ${kpis.losses}L`} accent={GREEN} />
        <KpiCard dark icon={<DollarSign size={14} />} label="P&L NET" value={fmtUsd(kpis.pnlUsd)} sub={`${kpis.total} trades`} accent={kpis.pnlUsd >= 0 ? GREEN : RED} />
        <KpiCard dark icon={<Target size={14} />} label="RR MOYEN" value={kpis.rrAvg !== null ? `${kpis.rrAvg.toFixed(2)}R` : "—"} sub={`cum ${kpis.rrSum.toFixed(1)}R`} accent={ACCENT} />
        <KpiCard dark icon={<Trophy size={14} />} label="BEST" value={kpis.bestTrade !== null ? fmtUsd(kpis.bestTrade) : "—"} sub={kpis.bestPair ?? ""} accent={GREEN} />
        <KpiCard dark icon={<Zap size={14} />} label="WORST" value={kpis.worstTrade !== null ? fmtUsd(kpis.worstTrade) : "—"} accent={RED} />
      </div>

      <div style={{ background: "#141821", border: "1px solid #262B36", borderRadius: 14, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, color: "#6B7280" }}>EQUITY CURVE</div>
          <div style={{ fontSize: 11, color: "#6B7280", fontFamily: "monospace" }}>
            min {fmtUsd(minCum)} &nbsp;·&nbsp; max {fmtUsd(maxCum)}
          </div>
        </div>
        <svg width="100%" height="180" viewBox={`0 0 ${Math.max(equityPoints.length - 1, 1) * 10} 100`} preserveAspectRatio="none" style={{ display: "block" }}>
          <line x1="0" y1="50" x2={Math.max(equityPoints.length - 1, 1) * 10} y2="50" stroke="#262B36" strokeWidth="0.3" />
          <polyline
            fill="none"
            stroke={kpis.pnlUsd >= 0 ? GREEN : RED}
            strokeWidth="1.2"
            points={equityPoints
              .map((p, i) => {
                const y = 50 - ((p.cum - (minCum + maxCum) / 2) / span) * 80;
                return `${i * 10},${y.toFixed(2)}`;
              })
              .join(" ")}
          />
        </svg>
      </div>

      <div style={{ background: "#141821", border: "1px solid #262B36", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ padding: "12px 18px", borderBottom: "1px solid #262B36", fontSize: 10, fontWeight: 800, letterSpacing: 2, color: "#6B7280" }}>
          TRADES · {trades.length}
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: "monospace" }}>
          <thead>
            <tr style={{ background: "#0F1319" }}>
              {["DATE", "HR", "PAIR", "DIR", "ENT", "SL", "TP", "SIZ", "ST", "P&L"].map((h) => (
                <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: 9, fontWeight: 800, letterSpacing: 1, color: "#6B7280", borderBottom: "1px solid #262B36" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {trades.map((t) => (
              <tr key={t.id} style={{ borderBottom: "1px solid #1F2430" }}>
                <td style={{ padding: "7px 12px", color: "#9CA3AF" }}>{t.date}</td>
                <td style={{ padding: "7px 12px", color: "#9CA3AF" }}>{t.time ?? "—"}</td>
                <td style={{ padding: "7px 12px", color: "#E5E7EB", fontWeight: 700 }}>{t.pair}</td>
                <td style={{ padding: "7px 12px", color: t.direction === "long" ? GREEN : RED, fontWeight: 700 }}>{t.direction === "long" ? "L" : "S"}</td>
                <td style={{ padding: "7px 12px", color: "#E5E7EB" }}>{t.entry ?? "—"}</td>
                <td style={{ padding: "7px 12px", color: "#E5E7EB" }}>{t.sl ?? "—"}</td>
                <td style={{ padding: "7px 12px", color: "#E5E7EB" }}>{t.tp ?? "—"}</td>
                <td style={{ padding: "7px 12px", color: "#9CA3AF" }}>{t.size ?? "—"}</td>
                <td style={{ padding: "7px 12px", color: statusColor(t.status), fontWeight: 700 }}>{statusLabel(t.status)}</td>
                <td style={{ padding: "7px 12px", color: statusColor(t.status), fontWeight: 700 }}>{t.pnl ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
