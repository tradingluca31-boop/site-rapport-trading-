"use client";

import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Target,
  BookOpen,
  FileText,
  Sparkles,
  Activity,
  DollarSign,
  BarChart3,
} from "lucide-react";

type Variant = "A" | "B" | "C" | null;

export default function PreviewDashboardPage() {
  const [choice, setChoice] = useState<Variant>(null);

  return (
    <div style={{ minHeight: "100vh", background: "#f1efea", padding: "40px 32px" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <header style={{ marginBottom: 40 }}>
          <div className="section-label">DASHBOARD · MCP 21ST PREVIEW</div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 32,
              fontWeight: 700,
              marginTop: 8,
              color: "var(--text-primary)",
            }}
          >
            Choisis le design du Dashboard
          </h1>
          <p style={{ color: "var(--text-secondary)", marginTop: 6 }}>
            3 variantes rendues avec tes vraies donnees (CPI US, theses Q2, rapports).
            Clique celle qui te plait.
          </p>
        </header>

        <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
          <VariantCard
            label="Option A — KPI Focus"
            sub="4 grosses cards metriques en haut, catalyseur + theses compactes en dessous"
            selected={choice === "A"}
            onSelect={() => setChoice("A")}
          >
            <MockDashboardA />
          </VariantCard>

          <VariantCard
            label="Option B — Grille 2x2 editoriale"
            sub="Layout magazine : bloc hero catalyseur, KPI, theses, rapports en grille"
            selected={choice === "B"}
            onSelect={() => setChoice("B")}
          >
            <MockDashboardB />
          </VariantCard>

          <VariantCard
            label="Option C — Hero + Stats asymetriques"
            sub="Welcome hero + metrique principale geante + side panels"
            selected={choice === "C"}
            onSelect={() => setChoice("C")}
          >
            <MockDashboardC />
          </VariantCard>
        </div>

        {/* Sticky footer */}
        <section
          style={{
            position: "sticky",
            bottom: 24,
            marginTop: 40,
            padding: "20px 28px",
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            boxShadow: "var(--shadow-md)",
            display: "flex",
            alignItems: "center",
            gap: 32,
          }}
        >
          <div>
            <div className="section-label">TON CHOIX</div>
            <div style={{ marginTop: 8, fontSize: 18, fontWeight: 600 }}>
              Dashboard :{" "}
              <span style={{ color: choice ? "var(--accent)" : "var(--text-muted)" }}>
                {choice ? `Option ${choice}` : "pas encore choisi"}
              </span>
            </div>
          </div>
          <div style={{ marginLeft: "auto" }}>
            {choice ? (
              <div
                style={{
                  padding: "10px 20px",
                  background: "var(--bull-bg)",
                  color: "var(--bull)",
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                OK · dis a Claude &quot;Dashboard {choice}&quot;
              </div>
            ) : (
              <div
                style={{
                  padding: "10px 20px",
                  background: "var(--bg-elevated)",
                  color: "var(--text-muted)",
                  borderRadius: 8,
                  fontSize: 13,
                }}
              >
                Selectionne une option
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function VariantCard({
  label,
  sub,
  selected,
  onSelect,
  children,
}: {
  label: string;
  sub: string;
  selected: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onSelect}
      style={{
        cursor: "pointer",
        background: "var(--bg-card)",
        border: selected ? "2px solid var(--accent)" : "1px solid var(--border)",
        borderRadius: 12,
        padding: 0,
        overflow: "hidden",
        boxShadow: selected ? "0 0 0 3px rgba(44,82,130,0.12)" : "var(--shadow-sm)",
        textAlign: "left",
        transition: "all 0.15s",
        fontFamily: "inherit",
      }}
    >
      <div
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid var(--border-light)",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>
            {label}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{sub}</div>
        </div>
        <div
          style={{
            padding: "6px 12px",
            borderRadius: 6,
            background: selected ? "var(--accent-light)" : "var(--bg-elevated)",
            color: selected ? "var(--accent)" : "var(--text-muted)",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1,
          }}
        >
          {selected ? "✓ CHOISI" : "CLIQUER"}
        </div>
      </div>
      <div style={{ background: "#fafaf7", padding: 24 }}>{children}</div>
    </button>
  );
}

/* ==================== OPTION A — KPI FOCUS ==================== */

function MockDashboardA() {
  return (
    <div style={{ background: "var(--bg)", padding: 24, borderRadius: 8 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 400 }}>
          Bonjour Luca.
        </h2>
        <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>
          Lundi 20 avril · 17:15 GMT+2 · CPI US à 14h30 · 1 prép validée cette semaine
        </p>
      </div>

      {/* 4 KPI cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <KpiA label="WIN RATE" value="64%" delta="+2.1pt" icon={<Activity size={14} />} up />
        <KpiA label="P&L MOIS" value="+8.6%" delta="+1.2pt" icon={<DollarSign size={14} />} up />
        <KpiA label="RR MOYEN" value="1.85" delta="-0.05" icon={<Target size={14} />} />
        <KpiA label="TRADES / SEM" value="6" delta="+1" icon={<BarChart3 size={14} />} up />
      </div>

      {/* Catalyseur + Theses row */}
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 12 }}>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Target size={13} color="var(--text-muted)" />
            <span className="section-label">PROCHAIN CATALYSEUR · 6h48</span>
          </div>
          <div
            style={{
              display: "flex",
              gap: 6,
              marginBottom: 10,
            }}
          >
            <span className="tag tag-high" style={{ fontSize: 10 }}>
              HIGH
            </span>
            <span className="tag" style={{ fontSize: 10 }}>USD</span>
            <span className="tag" style={{ fontSize: 10 }}>Mar 14 · 14:30</span>
          </div>
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 16,
              fontWeight: 500,
              marginBottom: 4,
            }}
          >
            CPI US (MoM &amp; YoY, core &amp; headline)
          </h3>
          <p style={{ fontSize: 11, color: "var(--text-secondary)" }}>
            Consensus <strong>0.2% / 3.1%</strong> · précédent 0.3% / 3.2%
          </p>
          <div style={{ display: "flex", height: 6, gap: 2, marginTop: 12, borderRadius: 3 }}>
            <div style={{ width: "40%", background: "var(--bear)" }} />
            <div style={{ width: "30%", background: "var(--accent)" }} />
            <div style={{ width: "30%", background: "var(--bull)" }} />
          </div>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <BookOpen size={13} color="var(--text-muted)" />
            <span className="section-label">THESES MACRO</span>
          </div>
          <div style={{ marginBottom: 10 }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 1,
                color: "var(--accent)",
                marginBottom: 4,
              }}
            >
              COURT TERME · S17
            </div>
            <p style={{ fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.5 }}>
              Desinflation US en attente confirmation, DXY support 104.
            </p>
          </div>
          <div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 1,
                color: "var(--accent-gold)",
                marginBottom: 4,
              }}
            >
              LONG TERME · Q2 2026
            </div>
            <p style={{ fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.5 }}>
              Cycle baissier USD, rotation vers or et matieres premieres.
            </p>
          </div>
        </div>
      </div>

      {/* Rapports row */}
      <div className="card" style={{ marginTop: 12, padding: "12px 16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <FileText size={13} color="var(--text-muted)" />
            <span className="section-label">DERNIERS RAPPORTS</span>
          </div>
          <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Tout voir →</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          <MiniReport date="19/04" type="DAILY" title="Post-CPI US · long XAU" pnl="+2.3%" />
          <MiniReport date="18/04" type="DAILY" title="FOMC mins · trade flat" pnl="+0%" />
          <MiniReport date="14/04" type="WEEKLY" title="S15 bilan" pnl="+1.8%" />
        </div>
      </div>
    </div>
  );
}

/* ==================== OPTION B — GRILLE 2x2 EDITORIALE ==================== */

function MockDashboardB() {
  return (
    <div style={{ background: "var(--bg)", padding: 24, borderRadius: 8 }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 400 }}>
          Bonjour Luca.
        </h2>
        <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>
          Lundi 20 avril · 17:15 GMT+2
        </p>
      </div>

      {/* HERO catalyseur pleine largeur */}
      <div
        className="card"
        style={{
          padding: 20,
          marginBottom: 12,
          background: "linear-gradient(135deg, var(--bear-bg) 0%, transparent 50%)",
          borderColor: "var(--bear)",
          borderLeftWidth: 4,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Sparkles size={14} color="var(--bear)" />
            <span
              className="section-label"
              style={{ color: "var(--bear)" }}
            >
              EVENT PRINCIPAL · DANS 6H 48MIN
            </span>
          </div>
          <div style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 600 }}>
            Ouvrir la prep →
          </div>
        </div>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 24,
            fontWeight: 500,
            marginBottom: 8,
            lineHeight: 1.2,
          }}
        >
          CPI US · 14:30 GMT+2
        </h2>
        <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
          Consensus <strong>0.2% MoM / 3.1% YoY</strong> · précédent{" "}
          <strong>0.3% / 3.2%</strong> — 3 scénarios préparés.
        </p>
      </div>

      {/* 2x2 grille */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {/* KPI block */}
        <div className="card" style={{ padding: 16 }}>
          <div
            style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}
          >
            <Activity size={13} color="var(--text-muted)" />
            <span className="section-label">PERFORMANCE 30J</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <KpiMini label="WIN RATE" value="64%" sub="RR 1.85" up />
            <KpiMini label="P&L MOIS" value="+8.6%" sub="6 trades/sem" up />
          </div>
          <div
            style={{
              marginTop: 14,
              paddingTop: 12,
              borderTop: "1px solid var(--border-light)",
              display: "flex",
              gap: 6,
              fontSize: 10,
            }}
          >
            <span className="tag tag-bull" style={{ fontSize: 10 }}>W: 12</span>
            <span className="tag tag-bear" style={{ fontSize: 10 }}>L: 7</span>
            <span className="tag" style={{ fontSize: 10 }}>BE: 2</span>
          </div>
        </div>

        {/* Theses block */}
        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <BookOpen size={13} color="var(--text-muted)" />
            <span className="section-label">THESES MACRO</span>
          </div>
          <div
            style={{
              padding: 10,
              borderRadius: 6,
              background: "var(--accent-light)",
              borderLeft: "3px solid var(--accent)",
              marginBottom: 8,
            }}
          >
            <div
              style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: 1,
                color: "var(--accent)",
              }}
            >
              CT · S17
            </div>
            <p
              style={{
                fontSize: 11,
                color: "var(--text-primary)",
                marginTop: 3,
                fontFamily: "var(--font-display)",
              }}
            >
              Desinflation US en attente confirmation.
            </p>
          </div>
          <div
            style={{
              padding: 10,
              borderRadius: 6,
              background: "var(--accent-gold-light)",
              borderLeft: "3px solid var(--accent-gold)",
            }}
          >
            <div
              style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: 1,
                color: "var(--accent-gold)",
              }}
            >
              LT · Q2 2026
            </div>
            <p
              style={{
                fontSize: 11,
                color: "var(--text-primary)",
                marginTop: 3,
                fontFamily: "var(--font-display)",
              }}
            >
              Cycle baissier USD, rotation or.
            </p>
          </div>
        </div>

        {/* Scenarios block */}
        <div className="card" style={{ padding: 16 }}>
          <div
            style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}
          >
            <Target size={13} color="var(--text-muted)" />
            <span className="section-label">SCENARIOS CPI</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <ScenarioRow type="BEAR" title="Hotter-than-expected" pct={40} />
            <ScenarioRow type="BASE" title="Meet consensus" pct={30} />
            <ScenarioRow type="BULL" title="Cooler-than-expected" pct={30} />
          </div>
        </div>

        {/* Rapports block */}
        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <FileText size={13} color="var(--text-muted)" />
            <span className="section-label">RAPPORTS RECENTS</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <MiniReport date="19/04" type="DAILY" title="Post-CPI US · long XAU" pnl="+2.3%" />
            <MiniReport date="18/04" type="DAILY" title="FOMC mins · trade flat" pnl="+0%" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==================== OPTION C — HERO + STATS ASYMETRIQUES ==================== */

function MockDashboardC() {
  return (
    <div style={{ background: "var(--bg)", padding: 24, borderRadius: 8 }}>
      {/* Big welcome hero */}
      <div
        style={{
          padding: "28px 32px",
          background: "linear-gradient(135deg, #1a1a1a 0%, #2c3e50 100%)",
          borderRadius: 12,
          color: "white",
          marginBottom: 16,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -40,
            top: -40,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
          }}
        />
        <div style={{ position: "relative" }}>
          <div
            style={{
              fontSize: 10,
              letterSpacing: 2,
              fontWeight: 700,
              opacity: 0.6,
              marginBottom: 8,
            }}
          >
            LUNDI 20 AVRIL · 17:15 GMT+2
          </div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 32,
              fontWeight: 400,
              marginBottom: 8,
              lineHeight: 1.1,
            }}
          >
            Bonjour Luca.
          </h2>
          <p style={{ fontSize: 13, opacity: 0.8, maxWidth: 480, lineHeight: 1.6 }}>
            CPI US dans <strong style={{ color: "#f8c471" }}>6h 48min</strong>. Semaine 17 en
            cours · 1 prép validée · 2 trades ouverts.
          </p>
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button
              style={{
                padding: "6px 14px",
                borderRadius: 6,
                background: "white",
                color: "#1a1a1a",
                fontSize: 11,
                fontWeight: 600,
                border: "none",
              }}
            >
              Voir la semaine
            </button>
            <button
              style={{
                padding: "6px 14px",
                borderRadius: 6,
                background: "rgba(255,255,255,0.1)",
                color: "white",
                fontSize: 11,
                fontWeight: 600,
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              + Rapport
            </button>
          </div>
        </div>
      </div>

      {/* Asymetric grid: 1 big + 2 stacked */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
        {/* LEFT: Big KPI + Catalyseur */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Hero KPI */}
          <div
            className="card"
            style={{
              padding: "24px 28px",
              background:
                "linear-gradient(145deg, var(--bull-bg) 0%, transparent 70%)",
              borderLeft: "4px solid var(--bull)",
            }}
          >
            <div
              style={{
                fontSize: 10,
                letterSpacing: 1.5,
                fontWeight: 700,
                color: "var(--text-muted)",
                marginBottom: 8,
              }}
            >
              P&amp;L DU MOIS (AVRIL 2026)
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 42,
                fontWeight: 300,
                color: "var(--bull)",
                lineHeight: 1,
              }}
            >
              +8.6%
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginTop: 8,
                fontSize: 11,
                color: "var(--text-secondary)",
              }}
            >
              <TrendingUp size={12} color="var(--bull)" />
              <span>+1.2pt vs mois dernier · 19 trades (12W / 7L / 2BE)</span>
            </div>
          </div>

          {/* Catalyseur */}
          <div className="card" style={{ padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Target size={13} color="var(--text-muted)" />
              <span className="section-label">PROCHAIN CATALYSEUR</span>
              <span style={{ fontSize: 10, color: "var(--text-muted)" }}>· dans 6h 48min</span>
            </div>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 17,
                fontWeight: 500,
                marginTop: 4,
                marginBottom: 4,
              }}
            >
              CPI US · 14h30
            </h3>
            <p style={{ fontSize: 11, color: "var(--text-secondary)" }}>
              Consensus 0.2% / 3.1% · 3 scénarios préparés
            </p>
          </div>
        </div>

        {/* RIGHT: stacked small cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <StatC label="WIN RATE" value="64%" sub="30 jours" color="var(--bull)" />
          <StatC label="RR MOYEN" value="1.85" sub="tous setups" color="var(--accent)" />
          <StatC label="TRADES / SEM" value="6" sub="frequence" color="var(--accent-gold)" />
        </div>
      </div>

      {/* Rapports row en bas */}
      <div className="card" style={{ marginTop: 12, padding: "12px 16px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <FileText size={13} color="var(--text-muted)" />
            <span className="section-label">DERNIERS RAPPORTS</span>
          </div>
          <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Tout voir →</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          <MiniReport date="19/04" type="DAILY" title="Post-CPI US · long XAU" pnl="+2.3%" />
          <MiniReport date="18/04" type="DAILY" title="FOMC mins · trade flat" pnl="+0%" />
          <MiniReport date="14/04" type="WEEKLY" title="S15 bilan" pnl="+1.8%" />
        </div>
      </div>
    </div>
  );
}

/* ==================== Primitives ==================== */

function KpiA({
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
    <div className="card" style={{ padding: 16 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
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
            gap: 2,
            fontSize: 10,
            color: up ? "var(--bull)" : "var(--text-muted)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {delta}
        </div>
      </div>
      <div
        style={{
          fontSize: 9,
          letterSpacing: 1.2,
          fontWeight: 700,
          color: "var(--text-muted)",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 300 }}>
        {value}
      </div>
    </div>
  );
}

function KpiMini({
  label,
  value,
  sub,
  up,
}: {
  label: string;
  value: string;
  sub: string;
  up?: boolean;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 9,
          letterSpacing: 1.2,
          fontWeight: 700,
          color: "var(--text-muted)",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 20,
          fontWeight: 300,
          color: up ? "var(--bull)" : "var(--text-primary)",
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{sub}</div>
    </div>
  );
}

function StatC({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <div
      className="card"
      style={{
        padding: 14,
        borderLeft: `3px solid ${color}`,
      }}
    >
      <div
        style={{
          fontSize: 9,
          letterSpacing: 1.2,
          fontWeight: 700,
          color: "var(--text-muted)",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 22,
          fontWeight: 300,
          marginTop: 3,
          color,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{sub}</div>
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
        padding: 10,
        border: "1px solid var(--border-light)",
        borderRadius: 6,
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 10,
        }}
      >
        <span style={{ fontFamily: "monospace", color: "var(--text-muted)" }}>{date}</span>
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            padding: "2px 5px",
            borderRadius: 3,
            background: type === "DAILY" ? "var(--accent-light)" : "var(--neutral-bg)",
            color: type === "DAILY" ? "var(--accent)" : "var(--neutral-c)",
          }}
        >
          {type}
        </span>
      </div>
      <div style={{ fontSize: 11, fontWeight: 500, lineHeight: 1.3 }}>{title}</div>
      <div
        style={{
          fontSize: 11,
          fontFamily: "var(--font-mono)",
          fontWeight: 500,
          color: isPos ? "var(--bull)" : "var(--text-muted)",
        }}
      >
        {pnl}
      </div>
    </div>
  );
}

function ScenarioRow({
  type,
  title,
  pct,
}: {
  type: "BEAR" | "BASE" | "BULL";
  title: string;
  pct: number;
}) {
  const bg =
    type === "BEAR"
      ? "var(--bear-bg)"
      : type === "BULL"
      ? "var(--bull-bg)"
      : "var(--neutral-bg)";
  const col =
    type === "BEAR" ? "var(--bear)" : type === "BULL" ? "var(--bull)" : "var(--neutral-c)";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: 11,
      }}
    >
      <span
        style={{
          fontSize: 9,
          fontWeight: 700,
          padding: "3px 7px",
          borderRadius: 3,
          background: bg,
          color: col,
          minWidth: 48,
          textAlign: "center",
        }}
      >
        {type}
      </span>
      <span style={{ flex: 1, color: "var(--text-secondary)" }}>{title}</span>
      <span style={{ fontFamily: "monospace", fontSize: 10, color: "var(--text-muted)" }}>
        {pct}%
      </span>
    </div>
  );
}
