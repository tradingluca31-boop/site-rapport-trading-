"use client";

import { PageId } from "@/types";
import { currentWeek, recentReports } from "@/lib/mock-data";
import { useEffect, useState } from "react";
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
} from "lucide-react";

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

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const nextEvent = currentWeek.events.find((e) => e.impact === "high");
  const scenarios = currentWeek.scenarios.filter((s) => s.eventId === nextEvent?.id);
  const [heroDate, setHeroDate] = useState<{ dateLine: string; summary: string }>({
    dateLine: "",
    summary: "",
  });

  useEffect(() => {
    setHeroDate(formatHeroDate());
    const id = setInterval(() => setHeroDate(formatHeroDate()), 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="px-24 py-10 animate-in" style={{ maxWidth: 1400, margin: "0 auto" }}>
      {/* ==================== HERO (Option C) ==================== */}
      <section
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
            CPI US dans{" "}
            <strong style={{ color: "#f8c471", fontWeight: 600 }}>6h 48min</strong>.{" "}
            {heroDate.summary}.
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
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 14,
          marginBottom: 24,
        }}
      >
        <KpiCard label="WIN RATE" value="64%" delta="+2.1pt" icon={<Activity size={16} />} up />
        <KpiCard label="P&L MOIS" value="+8.6%" delta="+1.2pt" icon={<DollarSign size={16} />} up />
        <KpiCard label="RR MOYEN" value="1.85" delta="-0.05" icon={<Target size={16} />} />
        <KpiCard label="TRADES / SEM" value="6" delta="+1" icon={<BarChart3 size={16} />} up />
      </div>

      {/* ==================== CATALYSEUR + THESES (Option A) ==================== */}
      <div
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
            <span className="section-label">PROCHAIN CATALYSEUR · 6H48</span>
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <span className="tag tag-high font-semibold flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "var(--high-impact)" }}
              />
              HIGH
            </span>
            <span className="tag">USD</span>
            <span className="tag flex items-center gap-1.5">
              <CalendarDays size={11} />
              Mar 14 · 14:30
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
            CPI US (MoM &amp; YoY, core &amp; headline)
          </h3>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 14 }}>
            Consensus <strong className="font-mono">0.2%</strong> /{" "}
            <strong className="font-mono">3.1%</strong>
            <span style={{ color: "var(--text-muted)" }}> · précédent </span>
            <span className="font-mono">0.3%</span> / <span className="font-mono">3.2%</span>
          </p>
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
        </div>

        {/* Theses Macro */}
        <div className="card" style={{ padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <BookOpen size={14} style={{ color: "var(--text-muted)" }} />
            <span className="section-label">THESES MACRO</span>
          </div>
          <div style={{ marginBottom: 14 }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 1.2,
                color: "var(--accent)",
                marginBottom: 5,
              }}
            >
              COURT TERME · S{currentWeek.weekNumber}
            </div>
            <p
              style={{
                fontSize: 13,
                color: "var(--text-secondary)",
                lineHeight: 1.55,
              }}
            >
              {currentWeek.thesisShortTerm}
            </p>
          </div>
          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 1.2,
                color: "var(--accent-gold)",
                marginBottom: 5,
              }}
            >
              LONG TERME · Q2 2026
            </div>
            <p
              style={{
                fontSize: 13,
                color: "var(--text-secondary)",
                lineHeight: 1.55,
              }}
            >
              {currentWeek.thesisLongTerm}
            </p>
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
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
