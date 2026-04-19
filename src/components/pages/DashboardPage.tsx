"use client";

import { PageId } from "@/types";
import { currentWeek, recentReports } from "@/lib/mock-data";
import { useEffect, useState } from "react";
import {
  CalendarDays,
  FileText,
  ArrowRight,
  Target,
  Pencil,
  BookOpen,
  Clock,
} from "lucide-react";

interface DashboardPageProps {
  onNavigate: (page: PageId) => void;
}

function formatTodayLine(): string {
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
  const cap = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1);
  return `${cap} — ${timeLabel} ${tz}`;
}

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const nextEvent = currentWeek.events.find((e) => e.impact === "high");
  const scenarios = currentWeek.scenarios.filter((s) => s.eventId === nextEvent?.id);
  const [todayLine, setTodayLine] = useState<string>("");
  useEffect(() => {
    setTodayLine(formatTodayLine());
    const id = setInterval(() => setTodayLine(formatTodayLine()), 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="px-48 py-10 animate-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-14 gap-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-4xl" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
            Bonjour Luca.
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
            {todayLine || "\u00a0"} · CPI US à 14h30 · 1 prép validée cette semaine
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

      {/* KPI Cards — stats trading uniquement */}
      <div className="grid grid-cols-2 gap-6 mb-12">
        <KpiCard label="WIN RATE (30J)" value="64%" sub="RR 1.85" subColor="var(--bull)" />
        <KpiCard label="P&L MOIS (%)" value="+8.6%" sub="6 trades/semaine" subColor="var(--bull)" />
      </div>

      {/* Prochain Catalyseur — pleine largeur */}
      <div className="mb-12">
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

            <h3 className="text-xl mb-2" style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}>
              CPI US (MoM & YoY, core & headline)
            </h3>
            <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>
              Consensus <strong className="font-mono">0.2%</strong> / <strong className="font-mono">3.1%</strong>
              <span style={{ color: "var(--text-muted)" }}> · précédent </span>
              <span className="font-mono">0.3%</span> / <span className="font-mono">3.2%</span>
            </p>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold tracking-[1.5px] uppercase" style={{ color: "var(--text-secondary)" }}>
                  RÉPARTITION DES SCÉNARIOS
                </span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {scenarios.length} scénarios
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
      </div>

      {/* Theses macro — nouveau visuel */}
      <div className="card mb-12">
        <div className="card-header flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen size={15} style={{ color: "var(--text-muted)" }} />
            <span className="section-label">THESES MACRO EN COURS</span>
          </div>
          <button type="button" className="flex items-center gap-1.5 text-xs font-medium hover:underline" style={{ color: "var(--text-secondary)" }}>
            <Pencil size={12} /> Éditer
          </button>
        </div>
        <div className="card-body grid grid-cols-2 gap-5">
          <ThesisPanel
            label="COURT TERME"
            period={`Semaine ${currentWeek.weekNumber}`}
            text={currentWeek.thesisShortTerm}
            accent="var(--accent)"
            tint="var(--accent-light)"
            icon={<CalendarDays size={13} />}
          />
          <ThesisPanel
            label="LONG TERME"
            period="Q2 2026"
            text={currentWeek.thesisLongTerm}
            accent="var(--accent-gold)"
            tint="var(--accent-gold-light)"
            icon={<Clock size={13} />}
          />
        </div>
      </div>

      {/* Derniers rapports — pleine largeur */}
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
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
  subColor,
}: {
  label: string;
  value: string;
  sub: string;
  subColor?: string;
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
    </div>
  );
}

function ThesisPanel({
  label,
  period,
  text,
  accent,
  tint,
  icon,
}: {
  label: string;
  period: string;
  text: string;
  accent: string;
  tint: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: `linear-gradient(145deg, ${tint} 0%, ${tint} 40%, transparent 100%)`,
        border: "1px solid var(--border-light)",
        padding: "40px 44px 44px 56px",
        minHeight: 340,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
      }}
    >
      <div
        className="absolute top-0 left-0 bottom-0"
        style={{ background: accent, width: 6 }}
      />
      <div
        className="absolute"
        style={{
          right: -40,
          bottom: -40,
          width: 180,
          height: 180,
          borderRadius: "50%",
          background: accent,
          opacity: 0.035,
          pointerEvents: "none",
        }}
      />
      <div
        className="absolute"
        style={{
          right: 28,
          top: 28,
          color: accent,
          opacity: 0.08,
          transform: "scale(3.5)",
          transformOrigin: "top right",
          pointerEvents: "none",
        }}
      >
        {icon}
      </div>

      <div className="flex items-center gap-3 mb-7 relative">
        <span
          className="text-[11px] font-bold tracking-[2.5px] uppercase px-3.5 py-2 rounded-md inline-flex items-center gap-2"
          style={{ background: accent, color: "white" }}
        >
          {icon}
          {label}
        </span>
        <span
          className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded"
          style={{ color: accent, background: "white", border: `1px solid ${accent}20` }}
        >
          {period}
        </span>
      </div>

      <div className="relative">
        <span
          className="absolute"
          style={{
            left: -32,
            top: -18,
            fontSize: 54,
            color: accent,
            opacity: 0.25,
            lineHeight: 1,
            fontFamily: "var(--font-display)",
          }}
        >
          &ldquo;
        </span>
        <p
          className="text-[17px] leading-[1.9]"
          style={{
            color: "var(--text-primary)",
            fontFamily: "var(--font-display)",
            fontWeight: 400,
            position: "relative",
          }}
        >
          {text}
        </p>
      </div>
    </div>
  );
}
