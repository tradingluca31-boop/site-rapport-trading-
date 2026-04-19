"use client";

import { PageId } from "@/types";
import { instrumentBiases, currentWeek, recentReports, weeklyPrecision } from "@/lib/mock-data";
import {
  CalendarDays,
  FileText,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Compass,
  Pencil,
} from "lucide-react";

interface DashboardPageProps {
  onNavigate: (page: PageId) => void;
}

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const nextEvent = currentWeek.events.find((e) => e.impact === "high");
  const scenarios = currentWeek.scenarios.filter((s) => s.eventId === nextEvent?.id);

  return (
    <div className="px-40 py-10 animate-in">
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: "300px",
          zIndex: 9999,
          pointerEvents: "none",
        }}
      >
        🐻
      </div>
      {/* Header */}
      <div className="flex items-start justify-between mb-14 gap-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-4xl" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
            Bonjour Luca.
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
            Mardi 14 avril — 07:42 GMT+2 · CPI US a 14h30 · 1 prep validee cette semaine
          </p>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={() => onNavigate("preparation")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors hover:bg-gray-50 whitespace-nowrap"
            style={{ borderColor: "var(--border)" }}
          >
            <CalendarDays size={14} />
            Voir la semaine
          </button>
          <button
            type="button"
            onClick={() => onNavigate("rapport")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors whitespace-nowrap"
            style={{ background: "var(--text-primary)" }}
          >
            <FileText size={14} />
            + Rapport
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-6 mb-12">
        <KpiCard label="PRECISION SCENARIOS 4S" value="68%" sub="+4pts vs 4s prec." subColor="var(--bull)" sparkline />
        <KpiCard label="SCENARIOS VALIDES" value="32/47" sub="ratio 68%" />
        <KpiCard label="WIN RATE (30J)" value="64%" sub="RR 1.85" subColor="var(--bull)" />
        <KpiCard label="P&L MOIS (%)" value="+8.6%" sub="6 trades/semaine" subColor="var(--bull)" />
      </div>

      {/* Prochain Catalyseur + Biais Instruments */}
      <div className="grid grid-cols-[1fr_380px] gap-6 mb-12">
        {/* Catalyseur */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target size={15} style={{ color: "var(--text-muted)" }} />
              <span className="section-label">PROCHAIN CATALYSEUR</span>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>· dans 6h 48min</span>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("preparation")}
              className="flex items-center gap-1 text-xs font-medium transition-colors hover:underline"
              style={{ color: "var(--text-secondary)" }}
            >
              Ouvrir la prep <ArrowRight size={12} />
            </button>
          </div>
          <div className="card-body">
            {/* Tags */}
            <div className="flex items-center gap-3 mb-4">
              <span className="tag tag-high font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--high-impact)" }} />
                HIGH
              </span>
              <span className="tag">USD</span>
              <span className="tag flex items-center gap-1.5">
                <CalendarDays size={11} />
                Mar 14 · 14:30
              </span>
            </div>

            {/* Event title */}
            <h3 className="text-xl mb-2" style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>
              CPI US (MoM & YoY, core & headline)
            </h3>
            <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>
              Consensus <strong className="font-mono">0.2%</strong> / <strong className="font-mono">3.1%</strong>
              <span style={{ color: "var(--text-muted)" }}> · precedent </span>
              <span className="font-mono">0.3%</span> / <span className="font-mono">3.2%</span>
            </p>

            {/* Scenario bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold tracking-[1.5px] uppercase" style={{ color: "var(--text-secondary)" }}>
                  REPARTITION DES SCENARIOS
                </span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {scenarios.length} scenarios
                </span>
              </div>
              <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
                {scenarios.map((s) => (
                  <div
                    key={s.id}
                    style={{
                      width: `${s.probability}%`,
                      background: s.type === "bear" ? "var(--bear)" : s.type === "bull" ? "var(--bull)" : "var(--accent)",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Scenario list */}
            <div className="space-y-2.5">
              {scenarios.map((s) => (
                <div key={s.id} className="flex items-center gap-4 text-sm">
                  <span
                    className="text-[10px] font-bold px-2.5 py-1 rounded min-w-[65px] text-center"
                    style={{
                      background: s.type === "bear" ? "var(--bear-bg)" : s.type === "bull" ? "var(--bull-bg)" : "var(--neutral-bg)",
                      color: s.type === "bear" ? "var(--bear)" : s.type === "bull" ? "var(--bull)" : "var(--neutral-c)",
                    }}
                  >
                    {s.type.toUpperCase()}
                  </span>
                  <span className="flex-1" style={{ color: "var(--text-secondary)" }}>
                    {s.title}
                  </span>
                  <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                    {s.probability}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Biais Instruments */}
        <div className="card">
          <div className="card-header flex items-center gap-3">
            <Compass size={15} style={{ color: "var(--text-muted)" }} />
            <span className="section-label">BIAIS INSTRUMENTS</span>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>· moyen terme</span>
          </div>
          <div className="card-body p-0">
            {instrumentBiases.map((b, i) => (
              <div
                key={b.instrument}
                className="flex items-center justify-between px-6 py-3.5"
                style={{ borderBottom: i < instrumentBiases.length - 1 ? "1px solid var(--border-light)" : "none" }}
              >
                <span className="font-medium text-sm">{b.instrument}</span>
                <div className="flex items-center gap-4">
                  <span
                    className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded"
                    style={{
                      background: b.direction === "long" ? "var(--bull-bg)" : b.direction === "short" ? "var(--bear-bg)" : "var(--neutral-bg)",
                      color: b.direction === "long" ? "var(--bull)" : b.direction === "short" ? "var(--bear)" : "var(--neutral-c)",
                    }}
                  >
                    {b.direction === "long" && <TrendingUp size={10} />}
                    {b.direction === "short" && <TrendingDown size={10} />}
                    {b.direction === "flat" && <Minus size={10} />}
                    {b.direction.toUpperCase()}
                  </span>
                  <span className="font-mono text-sm min-w-[60px] text-right" style={{ color: "var(--text-secondary)" }}>
                    {b.price}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* These macro */}
      <div className="card mb-12">
        <div className="card-header flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm">These macro en cours</h3>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              Court terme (semaine) et long terme (trimestre)
            </p>
          </div>
          <button type="button" className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
            <Pencil size={12} /> Editer
          </button>
        </div>
        <div className="card-body grid grid-cols-2 gap-0">
          <div className="pr-8 border-r" style={{ borderColor: "var(--border-light)" }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="tag font-bold text-[10px]" style={{ background: "var(--text-primary)", color: "white" }}>COURT TERME</span>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>Semaine {currentWeek.weekNumber}</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {currentWeek.thesisShortTerm}
            </p>
          </div>
          <div className="pl-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="tag font-bold text-[10px]" style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>LONG TERME</span>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>Q2 2026</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {currentWeek.thesisLongTerm}
            </p>
          </div>
        </div>
      </div>

      {/* Derniers rapports + Precision */}
      <div className="grid grid-cols-[1fr_420px] gap-6">
        {/* Derniers rapports */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText size={15} style={{ color: "var(--text-muted)" }} />
              <span className="section-label">DERNIERS RAPPORTS</span>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("bibliotheque")}
              className="flex items-center gap-1 text-xs font-medium hover:underline"
              style={{ color: "var(--text-secondary)" }}
            >
              Tout voir <ArrowRight size={12} />
            </button>
          </div>
          <div className="card-body p-0">
            {recentReports.slice(0, 5).map((r, i) => (
              <div
                key={r.id}
                className="flex items-start gap-5 px-6 py-4 hover:bg-gray-50/50 cursor-pointer transition-colors"
                style={{ borderBottom: i < 4 ? "1px solid var(--border-light)" : "none" }}
              >
                <div className="text-center min-w-[55px]">
                  <div className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                    {r.date.slice(5)}
                  </div>
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded mt-1.5 inline-block uppercase"
                    style={{
                      background: r.type === "daily" ? "var(--accent-light)" : r.type === "weekly" ? "var(--neutral-bg)" : "var(--accent-gold-light)",
                      color: r.type === "daily" ? "var(--accent)" : r.type === "weekly" ? "var(--neutral-c)" : "var(--accent-gold)",
                    }}
                  >
                    {r.type === "daily" ? "DAILY" : r.type === "weekly" ? "WEEKLY" : "FUNDAMENTAL"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium">{r.title}</h4>
                  <p className="text-xs mt-1 line-clamp-1" style={{ color: "var(--text-muted)" }}>
                    {r.summary}
                  </p>
                </div>
                {r.pnlPct !== null && (
                  <div className="text-right flex-shrink-0">
                    <span
                      className="font-mono text-sm font-medium"
                      style={{ color: r.pnlPct > 0 ? "var(--bull)" : r.pnlPct < 0 ? "var(--bear)" : "var(--text-muted)" }}
                    >
                      {r.pnlPct > 0 ? "+" : ""}{r.pnlPct}%
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Precision chart */}
        <div className="card">
          <div className="card-header flex items-center gap-3">
            <SparklesIcon size={15} style={{ color: "var(--text-muted)" }} />
            <span className="section-label">PRECISION — 12 DERNIERES SEMAINES</span>
          </div>
          <div className="card-body">
            {/* Bar chart */}
            <div className="flex items-end gap-2 h-[130px] mb-3">
              {weeklyPrecision.map((val, i) => {
                const isLast = i === weeklyPrecision.length - 1;
                const maxVal = Math.max(...weeklyPrecision);
                const height = (val / maxVal) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                    <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
                      {val}
                    </span>
                    <div
                      className="w-full rounded-sm"
                      style={{
                        height: `${height}%`,
                        background: isLast ? "var(--accent)" : "#c8d6e5",
                        minHeight: "8px",
                      }}
                    />
                  </div>
                );
              })}
            </div>
            {/* Labels */}
            <div className="flex justify-between text-[10px] mb-5" style={{ color: "var(--text-muted)" }}>
              <span>S5</span>
              <span>S8</span>
              <span>S11</span>
              <span>S14 (en cours)</span>
            </div>

            {/* Observation */}
            <div className="p-4 rounded-lg" style={{ background: "var(--bg-elevated)" }}>
              <div className="text-[10px] font-bold tracking-wider uppercase mb-2" style={{ color: "var(--text-secondary)" }}>
                OBSERVATION
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                Tes scenarios &quot;neutral&quot; sont valides a <strong>74%</strong>, contre <strong>61%</strong> pour les extremes directionnels. Piste : resserrer les scenarios bull/bear.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
  subColor,
  sparkline,
}: {
  label: string;
  value: string;
  sub: string;
  subColor?: string;
  sparkline?: boolean;
}) {
  return (
    <div className="card" style={{ padding: "26px 28px" }}>
      <div
        className="text-[10px] font-bold tracking-[1.5px] uppercase mb-3"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </div>
      <div className="text-3xl font-light tracking-tight" style={{ fontFamily: "var(--font-mono)" }}>
        {value}
      </div>
      <div className="flex items-center gap-1 mt-2">
        <span className="text-xs" style={{ color: subColor || "var(--text-muted)" }}>
          {sub}
        </span>
      </div>
      {sparkline && (
        <svg viewBox="0 0 200 40" className="w-full h-8 mt-3" fill="none">
          <polyline
            points="0,35 20,30 40,32 60,25 80,28 100,20 120,22 140,15 160,18 180,12 200,10"
            stroke="var(--accent)"
            strokeWidth="2"
            fill="none"
          />
          <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.15" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
          <polygon
            points="0,35 20,30 40,32 60,25 80,28 100,20 120,22 140,15 160,18 180,12 200,10 200,40 0,40"
            fill="url(#spark)"
          />
        </svg>
      )}
    </div>
  );
}

function SparklesIcon({ size, style }: { size: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
}
