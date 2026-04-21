"use client";

import { PageId, EcoEvent } from "@/types";
import { currentWeek, recentReports } from "@/lib/mock-data";
import { fetchNextHighCatalyst } from "@/lib/mt5-calendar";
import { Trade, listTradesByDateRange } from "@/lib/trades";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  FileText,
  Target,
  BookOpen,
  Activity,
  DollarSign,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Pencil,
  Check,
  X,
} from "lucide-react";

const THESES_STORAGE_KEY = "edgefx:theses-macro:v1";

interface ThesesState {
  shortTerm: string;
  longTerm: string;
  shortLabel: string;
  longLabel: string;
}

interface DashboardPageProps {
  onNavigate: (page: PageId) => void;
}

function formatHeroDate(): { dateLine: string; summary: string } {
  const now = new Date();
  const dateLabel = now.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const timeLabel = now.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const offsetMinutes = -now.getTimezoneOffset();
  const offsetHours = offsetMinutes / 60;
  const tz = `GMT${offsetHours >= 0 ? "+" : ""}${offsetHours}`;
  return {
    dateLine: `${dateLabel.toUpperCase()} · ${timeLabel} ${tz}`,
    summary: "Semaine 17 en cours · 1 prép validée · 2 trades ouverts",
  };
}

function formatCountdown(targetIso: string): string {
  const now = new Date().getTime();
  const target = new Date(targetIso).getTime();
  const diff = target - now;
  if (diff <= 0) return "imminent";
  const totalMin = Math.floor(diff / 60000);
  const days = Math.floor(totalMin / (60 * 24));
  const hours = Math.floor((totalMin - days * 60 * 24) / 60);
  const minutes = totalMin - days * 60 * 24 - hours * 60;
  if (days > 0) return `${days}j ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes.toString().padStart(2, "0")}min`;
  return `${minutes}min`;
}

function formatEventDateLabel(dateStr: string, timeStr: string): string {
  const d = new Date(`${dateStr}T${timeStr}:00`);
  const day = d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
  return `${day} · ${timeStr}`;
}

function isoDateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function parsePnlToNumber(pnl: string | null): number | null {
  if (!pnl) return null;
  const cleaned = pnl.replace(/[^\d.,\-]/g, "").replace(",", ".");
  if (!cleaned) return null;
  const n = parseFloat(cleaned);
  if (isNaN(n)) return null;
  return pnl.trim().startsWith("-") ? -Math.abs(n) : n;
}

function parseRr(pnl: string | null): number | null {
  if (!pnl) return null;
  const m = pnl.trim().match(/^([+-]?\d+(?:[.,]\d+)?)\s*R$/i);
  if (!m) return null;
  const n = parseFloat(m[1].replace(",", "."));
  return isNaN(n) ? null : n;
}

type DashboardKpis = {
  winRate: string;
  winRateDelta: string;
  pnlMonth: string;
  pnlMonthDelta: string;
  rrAvg: string;
  rrAvgDelta: string;
  tradesPerWeek: string;
  tradesPerWeekDelta: string;
};

function computeDashboardKpis(trades30d: Trade[]): DashboardKpis {
  if (trades30d.length === 0) {
    return {
      winRate: "—",
      winRateDelta: "pas de trades",
      pnlMonth: "—",
      pnlMonthDelta: "pas de trades",
      rrAvg: "—",
      rrAvgDelta: "pas de trades",
      tradesPerWeek: "—",
      tradesPerWeekDelta: "pas de trades",
    };
  }

  const closed = trades30d.filter((t) => t.status === "closed-win" || t.status === "closed-loss");
  const wins = trades30d.filter((t) => t.status === "closed-win").length;
  const winRate = closed.length > 0 ? Math.round((wins / closed.length) * 100) : null;

  const pnlNumbers = trades30d.map((t) => parsePnlToNumber(t.pnl)).filter((n): n is number => n !== null);
  const pnlSum = pnlNumbers.reduce((a, b) => a + b, 0);

  const rrNumbers = trades30d.map((t) => parseRr(t.pnl)).filter((n): n is number => n !== null);
  const rrAvg = rrNumbers.length > 0 ? rrNumbers.reduce((a, b) => a + b, 0) / rrNumbers.length : null;

  const tradesPerWeek = (trades30d.length / 30) * 7;

  return {
    winRate: winRate === null ? "—" : `${winRate}%`,
    winRateDelta: closed.length === 0 ? "aucun trade clos" : `${wins}W / ${closed.length - wins}L sur 30j`,
    pnlMonth: pnlNumbers.length === 0 ? "—" : `${pnlSum >= 0 ? "+" : ""}${Math.round(pnlSum)}`,
    pnlMonthDelta: pnlNumbers.length === 0 ? "PnL non quantifiable" : `${pnlNumbers.length} trades sur 30j`,
    rrAvg: rrAvg === null ? "—" : `${rrAvg >= 0 ? "+" : ""}${rrAvg.toFixed(2)}R`,
    rrAvgDelta: rrNumbers.length === 0 ? "aucun RR renseigne" : `${rrNumbers.length} trades RR`,
    tradesPerWeek: tradesPerWeek.toFixed(1),
    tradesPerWeekDelta: `${trades30d.length} trades sur 30j`,
  };
}

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const [catalyst, setCatalyst] = useState<EcoEvent | null>(null);
  const [catalystLoading, setCatalystLoading] = useState(true);
  const [countdown, setCountdown] = useState<string>("—");
  const scenarios = currentWeek.scenarios.filter((s) => s.eventId === catalyst?.id);
  const [heroDate, setHeroDate] = useState<{ dateLine: string; summary: string }>({
    dateLine: "",
    summary: "",
  });

  const defaultTheses: ThesesState = {
    shortTerm: currentWeek.thesisShortTerm,
    longTerm: currentWeek.thesisLongTerm,
    shortLabel: `COURT TERME · S${currentWeek.weekNumber}`,
    longLabel: "LONG TERME · Q2 2026",
  };
  const [theses, setTheses] = useState<ThesesState>(defaultTheses);
  const [editingTheses, setEditingTheses] = useState(false);
  const [draft, setDraft] = useState<ThesesState>(defaultTheses);

  const [trades30d, setTrades30d] = useState<Trade[]>([]);
  const kpis = useMemo(() => computeDashboardKpis(trades30d), [trades30d]);

  useEffect(() => {
    let cancelled = false;
    const start = isoDateOffset(-30);
    const end = isoDateOffset(0);
    listTradesByDateRange(start, end)
      .then((list) => {
        if (!cancelled) setTrades30d(list);
      })
      .catch((err) => console.error("[dashboard] listTradesByDateRange", err));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setHeroDate(formatHeroDate());
    const id = setInterval(() => setHeroDate(formatHeroDate()), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchNextHighCatalyst()
      .then((ev) => {
        if (!cancelled) setCatalyst(ev);
      })
      .catch((err) => {
        console.error("[dashboard] fetchNextHighCatalyst", err);
      })
      .finally(() => {
        if (!cancelled) setCatalystLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!catalyst) {
      setCountdown("—");
      return;
    }
    const iso = `${catalyst.date}T${catalyst.time}:00`;
    setCountdown(formatCountdown(iso));
    const id = setInterval(() => setCountdown(formatCountdown(iso)), 30_000);
    return () => clearInterval(id);
  }, [catalyst]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(THESES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ThesesState>;
        setTheses((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // ignore malformed storage
    }
  }, []);

  function openThesesEditor() {
    setDraft(theses);
    setEditingTheses(true);
  }

  function cancelThesesEdit() {
    setEditingTheses(false);
  }

  function saveTheses() {
    setTheses(draft);
    try {
      localStorage.setItem(THESES_STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // ignore quota errors
    }
    setEditingTheses(false);
  }

  return (
    <div className="page-root px-24 py-10 animate-in" style={{ maxWidth: 1400, margin: "0 auto" }}>
      {/* ==================== HERO (Option C) ==================== */}
      <section
        className="dashboard-hero"
        style={{
          padding: "44px 52px",
          background: "linear-gradient(135deg, #1a1a1a 0%, #2c3e50 100%)",
          borderRadius: 14,
          color: "white",
          marginBottom: 24,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -80,
            top: -80,
            width: 320,
            height: 320,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 80,
            bottom: -60,
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: "rgba(248, 196, 113, 0.06)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative" }}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: 2.5,
              fontWeight: 700,
              opacity: 0.55,
              marginBottom: 14,
            }}
          >
            {heroDate.dateLine || "\u00a0"}
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 48,
              fontWeight: 400,
              marginBottom: 12,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
            }}
          >
            Bonjour Luca.
          </h1>
          <p
            style={{
              fontSize: 15,
              opacity: 0.78,
              maxWidth: 560,
              lineHeight: 1.6,
              marginBottom: 24,
            }}
          >
            {catalystLoading ? (
              <>Chargement du prochain catalyseur…</>
            ) : catalyst ? (
              <>
                {catalyst.title} ({catalyst.currency}) dans{" "}
                <strong style={{ color: "#f8c471", fontWeight: 600 }}>{countdown}</strong>.{" "}
                {heroDate.summary}.
              </>
            ) : (
              <>Aucune annonce HIGH impact planifiée dans les 14 jours.</>
            )}
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={() => onNavigate("preparation")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 20px",
                borderRadius: 8,
                background: "white",
                color: "#1a1a1a",
                fontSize: 13,
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                transition: "transform 0.1s",
              }}
            >
              <CalendarDays size={14} />
              Voir la semaine
            </button>
            <button
              type="button"
              onClick={() => onNavigate("rapport")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 20px",
                borderRadius: 8,
                background: "rgba(255,255,255,0.1)",
                color: "white",
                fontSize: 13,
                fontWeight: 600,
                border: "1px solid rgba(255,255,255,0.22)",
                cursor: "pointer",
              }}
            >
              <FileText size={14} />
              + Rapport
            </button>
          </div>
        </div>
      </section>

      {/* ==================== 4 KPI CARDS (Option A) ==================== */}
      <div
        className="mobile-stack-2"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 14,
          marginBottom: 24,
        }}
      >
        <KpiCard label="WIN RATE" value={kpis.winRate} delta={kpis.winRateDelta} icon={<Activity size={16} />} />
        <KpiCard label="P&L MOIS" value={kpis.pnlMonth} delta={kpis.pnlMonthDelta} icon={<DollarSign size={16} />} />
        <KpiCard label="RR MOYEN" value={kpis.rrAvg} delta={kpis.rrAvgDelta} icon={<Target size={16} />} />
        <KpiCard label="TRADES / SEM" value={kpis.tradesPerWeek} delta={kpis.tradesPerWeekDelta} icon={<BarChart3 size={16} />} />
      </div>

      {/* ==================== CATALYSEUR + THESES (Option A) ==================== */}
      <div
        className="mobile-stack"
        style={{
          display: "grid",
          gridTemplateColumns: "1.3fr 1fr",
          gap: 14,
          marginBottom: 14,
        }}
      >
        {/* Catalyseur */}
        <div className="card" style={{ padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <Target size={14} style={{ color: "var(--text-muted)" }} />
            <span className="section-label">PROCHAIN CATALYSEUR · {countdown.toUpperCase()}</span>
          </div>
          {catalystLoading ? (
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Chargement…</p>
          ) : catalyst ? (
            <>
              <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
                <span className="tag tag-high font-semibold flex items-center gap-1.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: "var(--high-impact)" }}
                  />
                  HIGH
                </span>
                <span className="tag">{catalyst.currency}</span>
                <span className="tag flex items-center gap-1.5">
                  <CalendarDays size={11} />
                  {formatEventDateLabel(catalyst.date, catalyst.time)}
                </span>
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 20,
                  fontWeight: 500,
                  marginBottom: 6,
                }}
              >
                {catalyst.title}
              </h3>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 14 }}>
                {catalyst.forecast ? (
                  <>
                    Consensus <strong className="font-mono">{catalyst.forecast}</strong>
                  </>
                ) : (
                  <span style={{ color: "var(--text-muted)" }}>Consensus non renseigné</span>
                )}
                {catalyst.previous && (
                  <>
                    <span style={{ color: "var(--text-muted)" }}> · précédent </span>
                    <span className="font-mono">{catalyst.previous}</span>
                  </>
                )}
              </p>
              {scenarios.length > 0 && (
                <div style={{ display: "flex", height: 8, gap: 2, borderRadius: 4, overflow: "hidden" }}>
                  {scenarios.map((s) => (
                    <div
                      key={s.id}
                      style={{
                        width: `${s.probability}%`,
                        background:
                          s.type === "bear"
                            ? "var(--bear)"
                            : s.type === "bull"
                            ? "var(--bull)"
                            : "var(--accent)",
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
              Aucune annonce HIGH impact dans les 14 prochains jours.
            </p>
          )}
        </div>

        {/* Theses Macro */}
        <div className="card" style={{ padding: "20px 24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              marginBottom: 14,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <BookOpen size={14} style={{ color: "var(--text-muted)" }} />
              <span className="section-label">THESES MACRO</span>
            </div>
            {editingTheses ? (
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  type="button"
                  onClick={cancelThesesEdit}
                  aria-label="Annuler"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "4px 8px",
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 500,
                    background: "transparent",
                    color: "var(--text-muted)",
                    border: "1px solid var(--border-light)",
                    cursor: "pointer",
                  }}
                >
                  <X size={12} />
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={saveTheses}
                  aria-label="Enregistrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "4px 10px",
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 600,
                    background: "var(--text-primary)",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <Check size={12} />
                  Enregistrer
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={openThesesEditor}
                aria-label="Editer les theses"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "4px 8px",
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 500,
                  color: "var(--text-secondary)",
                  background: "transparent",
                  border: "1px solid var(--border-light)",
                  cursor: "pointer",
                }}
              >
                <Pencil size={11} />
                Editer
              </button>
            )}
          </div>

          {/* COURT TERME */}
          <div style={{ marginBottom: 14 }}>
            {editingTheses ? (
              <input
                type="text"
                aria-label="Titre court terme"
                placeholder="COURT TERME · S17"
                value={draft.shortLabel}
                onChange={(e) => setDraft((d) => ({ ...d, shortLabel: e.target.value }))}
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 1.2,
                  color: "var(--accent)",
                  marginBottom: 6,
                  padding: "3px 6px",
                  border: "1px solid var(--border-light)",
                  borderRadius: 4,
                  background: "var(--bg)",
                  width: "100%",
                  fontFamily: "inherit",
                  textTransform: "uppercase",
                }}
              />
            ) : (
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 1.2,
                  color: "var(--accent)",
                  marginBottom: 5,
                }}
              >
                {theses.shortLabel}
              </div>
            )}
            {editingTheses ? (
              <textarea
                aria-label="These court terme"
                placeholder="These court terme..."
                value={draft.shortTerm}
                onChange={(e) => setDraft((d) => ({ ...d, shortTerm: e.target.value }))}
                rows={4}
                style={{
                  width: "100%",
                  fontSize: 13,
                  lineHeight: 1.55,
                  color: "var(--text-primary)",
                  padding: "8px 10px",
                  border: "1px solid var(--border-light)",
                  borderRadius: 6,
                  background: "var(--bg)",
                  fontFamily: "inherit",
                  resize: "vertical",
                }}
              />
            ) : (
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  lineHeight: 1.55,
                }}
              >
                {theses.shortTerm}
              </p>
            )}
          </div>

          {/* LONG TERME */}
          <div>
            {editingTheses ? (
              <input
                type="text"
                aria-label="Titre long terme"
                placeholder="LONG TERME · Q2 2026"
                value={draft.longLabel}
                onChange={(e) => setDraft((d) => ({ ...d, longLabel: e.target.value }))}
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 1.2,
                  color: "var(--accent-gold)",
                  marginBottom: 6,
                  padding: "3px 6px",
                  border: "1px solid var(--border-light)",
                  borderRadius: 4,
                  background: "var(--bg)",
                  width: "100%",
                  fontFamily: "inherit",
                  textTransform: "uppercase",
                }}
              />
            ) : (
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 1.2,
                  color: "var(--accent-gold)",
                  marginBottom: 5,
                }}
              >
                {theses.longLabel}
              </div>
            )}
            {editingTheses ? (
              <textarea
                aria-label="These long terme"
                placeholder="These long terme..."
                value={draft.longTerm}
                onChange={(e) => setDraft((d) => ({ ...d, longTerm: e.target.value }))}
                rows={5}
                style={{
                  width: "100%",
                  fontSize: 13,
                  lineHeight: 1.55,
                  color: "var(--text-primary)",
                  padding: "8px 10px",
                  border: "1px solid var(--border-light)",
                  borderRadius: 6,
                  background: "var(--bg)",
                  fontFamily: "inherit",
                  resize: "vertical",
                }}
              />
            ) : (
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  lineHeight: 1.55,
                }}
              >
                {theses.longTerm}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ==================== DERNIERS RAPPORTS (Option A) ==================== */}
      <div className="card" style={{ padding: "16px 24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <FileText size={14} style={{ color: "var(--text-muted)" }} />
            <span className="section-label">DERNIERS RAPPORTS</span>
          </div>
          <button
            type="button"
            onClick={() => onNavigate("bibliotheque")}
            style={{
              fontSize: 11,
              color: "var(--text-muted)",
              fontWeight: 500,
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            Tout voir →
          </button>
        </div>
        <div className="mobile-stack" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {recentReports.slice(0, 3).map((r) => (
            <MiniReport
              key={r.id}
              date={r.date.slice(5).replace("-", "/")}
              type={r.type === "daily" ? "DAILY" : r.type === "weekly" ? "WEEKLY" : "FUNDAMENTAL"}
              title={r.title}
              pnl={r.pnlPct !== null ? `${r.pnlPct > 0 ? "+" : ""}${r.pnlPct}%` : ""}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ==================== PRIMITIVES ==================== */

function KpiCard({
  label,
  value,
  delta,
  icon,
  up,
}: {
  label: string;
  value: string;
  delta: string;
  icon: React.ReactNode;
  up?: boolean;
}) {
  return (
    <div className="card" style={{ padding: "20px 22px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            background: up ? "var(--bull-bg)" : "var(--bg-elevated)",
            color: up ? "var(--bull)" : "var(--text-muted)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 3,
            fontSize: 11,
            color: up ? "var(--bull)" : "var(--text-muted)",
            fontFamily: "var(--font-mono)",
            fontWeight: 500,
          }}
        >
          {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {delta}
        </div>
      </div>
      <div
        style={{
          fontSize: 10,
          letterSpacing: 1.5,
          fontWeight: 700,
          color: "var(--text-muted)",
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 28,
          fontWeight: 300,
          lineHeight: 1,
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function MiniReport({
  date,
  type,
  title,
  pnl,
}: {
  date: string;
  type: string;
  title: string;
  pnl: string;
}) {
  const isPos = pnl.startsWith("+") && pnl !== "+0%";
  return (
    <div
      style={{
        padding: 14,
        border: "1px solid var(--border-light)",
        borderRadius: 8,
        display: "flex",
        flexDirection: "column",
        gap: 6,
        cursor: "pointer",
        transition: "background 0.1s",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 11,
        }}
      >
        <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>{date}</span>
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            padding: "3px 6px",
            borderRadius: 3,
            letterSpacing: 0.5,
            background:
              type === "DAILY"
                ? "var(--accent-light)"
                : type === "WEEKLY"
                ? "var(--neutral-bg)"
                : "var(--accent-gold-light)",
            color:
              type === "DAILY"
                ? "var(--accent)"
                : type === "WEEKLY"
                ? "var(--neutral-c)"
                : "var(--accent-gold)",
          }}
        >
          {type}
        </span>
      </div>
      <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.3 }}>{title}</div>
      {pnl && (
        <div
          style={{
            fontSize: 13,
            fontFamily: "var(--font-mono)",
            fontWeight: 500,
            color: isPos ? "var(--bull)" : "var(--text-muted)",
          }}
        >
          {pnl}
        </div>
      )}
    </div>
  );
}
