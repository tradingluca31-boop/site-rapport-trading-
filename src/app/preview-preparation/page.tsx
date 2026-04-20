"use client";

import { useState } from "react";
import {
  CalendarDays,
  Clock,
  Target,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  ChevronLeft,
  Filter,
  CheckCircle2,
  Flame,
  BarChart3,
} from "lucide-react";

type Variant = "A" | "B" | "C" | null;

export default function PreviewPreparationPage() {
  const [choice, setChoice] = useState<Variant>(null);

  return (
    <div style={{ minHeight: "100vh", background: "#f1efea", padding: "40px 32px" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <header style={{ marginBottom: 40 }}>
          <div className="section-label">PREPARATION SEMAINE · MCP 21ST PREVIEW</div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 32,
              fontWeight: 700,
              marginTop: 8,
              color: "var(--text-primary)",
            }}
          >
            Choisis le design de la Preparation
          </h1>
          <p style={{ color: "var(--text-secondary)", marginTop: 6 }}>
            3 variantes rendues avec tes vraies donnees (calendrier eco, theses, scenarios).
            Clique celle qui te plait, ou melange des pieces.
          </p>
        </header>

        <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
          <VariantCard
            label="Option A — Timeline verticale"
            sub="Rail vertical lundi -> vendredi, events empiles par jour, vue calendrier epuree"
            selected={choice === "A"}
            onSelect={() => setChoice("A")}
          >
            <MockPreparationA />
          </VariantCard>

          <VariantCard
            label="Option B — Hero Event + Cards horizontales"
            sub="Event principal en hero (CPI US), cards evenements en scroll horizontal, theses compactes, scenarios accordeon"
            selected={choice === "B"}
            onSelect={() => setChoice("B")}
          >
            <MockPreparationB />
          </VariantCard>

          <VariantCard
            label="Option C — Terminal Bloomberg (grille dense)"
            sub="Layout 2 colonnes : calendrier dense a gauche, side panel theses + scenarios semaine a droite"
            selected={choice === "C"}
            onSelect={() => setChoice("C")}
          >
            <MockPreparationC />
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
              Preparation :{" "}
              <span style={{ color: choice ? "var(--accent)" : "var(--text-muted)" }}>
                {choice ? `Option ${choice}` : "pas encore choisi"}
              </span>
            </div>
          </div>
          <div style={{ marginLeft: "auto", fontSize: 13, color: "var(--text-secondary)" }}>
            Dis-moi ton choix ou quelles pieces de chaque option tu veux garder.
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
    <section
      onClick={onSelect}
      style={{
        padding: 20,
        background: "var(--bg-card)",
        border: `2px solid ${selected ? "var(--accent)" : "var(--border)"}`,
        borderRadius: 16,
        boxShadow: selected ? "0 0 0 4px var(--accent-light)" : "var(--shadow-sm)",
        cursor: "pointer",
        transition: "all 0.15s",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 20,
          marginBottom: 16,
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 22,
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            {label}
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>{sub}</p>
        </div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 1.2,
            padding: "4px 10px",
            borderRadius: 6,
            background: selected ? "var(--accent)" : "var(--bg-elevated)",
            color: selected ? "white" : "var(--text-muted)",
            whiteSpace: "nowrap",
          }}
        >
          {selected ? "✓ SELECTIONNE" : "CLIQUE"}
        </div>
      </div>
      {children}
    </section>
  );
}

/* ==================== OPTION A — TIMELINE VERTICALE ==================== */

function MockPreparationA() {
  const days = [
    { label: "LUN 14/04", date: "14 Avril", events: [] as MockEvent[] },
    {
      label: "MAR 15/04",
      date: "15 Avril",
      events: [
        { time: "09:00", cur: "EUR", flag: "🇪🇺", title: "Sentiment ZEW", impact: "medium" as Impact, forecast: "-3.2", prev: "-5.8" },
      ],
    },
    {
      label: "MER 16/04",
      date: "16 Avril",
      events: [
        { time: "14:30", cur: "USD", flag: "🇺🇸", title: "CPI US (MoM & YoY, core & headline)", impact: "high" as Impact, forecast: "0.2% / 3.1%", prev: "0.3% / 3.2%" },
        { time: "20:00", cur: "USD", flag: "🇺🇸", title: "FOMC Minutes", impact: "high" as Impact, forecast: "—", prev: "—" },
      ],
    },
    {
      label: "JEU 17/04",
      date: "17 Avril",
      events: [
        { time: "08:30", cur: "GBP", flag: "🇬🇧", title: "UK Retail Sales", impact: "medium" as Impact, forecast: "0.3%", prev: "0.1%" },
      ],
    },
    {
      label: "VEN 18/04",
      date: "18 Avril",
      events: [
        { time: "14:30", cur: "USD", flag: "🇺🇸", title: "Non-Farm Payrolls", impact: "high" as Impact, forecast: "185K", prev: "254K" },
      ],
    },
  ];

  return (
    <div style={{ background: "var(--bg)", padding: 24, borderRadius: 8 }}>
      {/* Header */}
      <div style={{ marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <WeekSelector />
            <span className="tag tag-bull" style={{ fontSize: 9 }}>EN COURS</span>
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 400 }}>
            Preparation de la semaine
          </h2>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
            Semaine 17 · 14 au 18 avril 2026 · theme —{" "}
            <em>Desinflation en attente confirmation</em>
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            className="card"
            style={{ padding: "6px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer", border: "1px solid var(--border)" }}
          >
            + Evenement custom
          </button>
          <button
            type="button"
            style={{
              padding: "6px 14px",
              fontSize: 11,
              fontWeight: 600,
              background: "var(--text-primary)",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            ✓ Valider la semaine
          </button>
        </div>
      </div>

      {/* Filters pills */}
      <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
        <FilterPill icon={<Filter size={11} />} label="Filtres" count={2} />
        <FilterPill label="HIGH" active color="var(--bear)" />
        <FilterPill label="USD" active color="var(--accent)" />
        <FilterPill label="EUR" />
        <FilterPill label="Inflation" />
        <FilterPill label="Politique monetaire" />
      </div>

      {/* Timeline */}
      <div style={{ position: "relative" }}>
        {/* rail vertical */}
        <div
          style={{
            position: "absolute",
            left: 120,
            top: 8,
            bottom: 8,
            width: 2,
            background: "var(--border-light)",
          }}
        />
        {days.map((d, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 24, marginBottom: 20 }}>
            {/* Date label */}
            <div style={{ width: 100, textAlign: "right", flexShrink: 0, paddingTop: 4 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: "var(--text-muted)" }}>
                {d.label}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--text-secondary)",
                  fontFamily: "var(--font-mono)",
                  marginTop: 2,
                }}
              >
                {d.events.length} annonce{d.events.length > 1 ? "s" : ""}
              </div>
            </div>
            {/* Dot */}
            <div style={{ position: "relative", flexShrink: 0, marginLeft: -4, marginTop: 8 }}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: d.events.some((e) => e.impact === "high") ? "var(--bear)" : d.events.length > 0 ? "var(--accent)" : "var(--border)",
                  border: "3px solid var(--bg)",
                  boxShadow: "0 0 0 1px var(--border)",
                }}
              />
            </div>
            {/* Events stack */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, paddingLeft: 12 }}>
              {d.events.length === 0 ? (
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--text-muted)",
                    fontStyle: "italic",
                    padding: 8,
                  }}
                >
                  Pas d'evenement majeur
                </div>
              ) : (
                d.events.map((e, j) => <EventRowA key={j} event={e} />)
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Theses macro compact */}
      <div className="card" style={{ marginTop: 24, padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <BookOpen size={13} color="var(--text-muted)" />
          <span className="section-label">THESES MACRO</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <ThesisCompact
            label="COURT TERME · S17"
            text="Desinflation US en attente confirmation, DXY support 104."
            accent="var(--accent)"
          />
          <ThesisCompact
            label="LONG TERME · Q2 2026"
            text="Cycle baissier USD, rotation vers or et matieres premieres."
            accent="var(--accent-gold)"
          />
        </div>
      </div>
    </div>
  );
}

/* ==================== OPTION B — HERO + CARDS HORIZONTALES ==================== */

function MockPreparationB() {
  return (
    <div style={{ background: "var(--bg)", padding: 24, borderRadius: 8 }}>
      {/* Header bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <WeekSelector />
        <div style={{ display: "flex", gap: 6 }}>
          <FilterPill icon={<Filter size={11} />} label="Importance" count={1} />
          <FilterPill label="Pays" count={3} />
          <FilterPill label="Categorie" />
        </div>
      </div>

      {/* HERO event principal */}
      <div
        style={{
          padding: "24px 28px",
          borderRadius: 12,
          background: "linear-gradient(135deg, #1a1a1a 0%, #2c3e50 100%)",
          color: "white",
          marginBottom: 16,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Flame size={14} color="#f8c471" />
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 2,
                color: "#f8c471",
              }}
            >
              EVENT PRINCIPAL DE LA SEMAINE · DANS 6H 48MIN
            </span>
          </div>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              padding: "3px 8px",
              borderRadius: 4,
              background: "rgba(239,68,68,0.2)",
              color: "#f87171",
              letterSpacing: 1.2,
            }}
          >
            HIGH IMPACT
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 18 }}>
          <span style={{ fontSize: 36 }}>🇺🇸</span>
          <div>
            <div style={{ fontSize: 11, opacity: 0.55, fontFamily: "var(--font-mono)", marginBottom: 4 }}>
              MERCREDI 16 AVRIL · 14:30 GMT+2
            </div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 26,
                fontWeight: 500,
                lineHeight: 1.15,
                marginBottom: 6,
              }}
            >
              CPI US (MoM &amp; YoY, core &amp; headline)
            </h2>
            <p style={{ fontSize: 13, opacity: 0.8, maxWidth: 540 }}>
              Consensus <strong style={{ color: "#f8c471" }}>0.2% / 3.1%</strong> · precedent{" "}
              <strong style={{ opacity: 0.7 }}>0.3% / 3.2%</strong>. Un print hot relance DXY et
              pese sur Gold/EURUSD. 3 scenarios prepares.
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              background: "white",
              color: "#1a1a1a",
              fontSize: 12,
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
            }}
          >
            Voir les 3 scenarios
          </button>
          <button
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              background: "rgba(255,255,255,0.1)",
              color: "white",
              fontSize: 12,
              fontWeight: 600,
              border: "1px solid rgba(255,255,255,0.2)",
              cursor: "pointer",
            }}
          >
            Editer ma these
          </button>
        </div>
      </div>

      {/* Cards horizontales autres events */}
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <CalendarDays size={13} color="var(--text-muted)" />
            <span className="section-label">AUTRES EVENTS · 5 ANNONCES</span>
          </div>
          <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Tout voir →</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          <EventCardB day="MAR 15" time="09:00" flag="🇪🇺" cur="EUR" title="Sentiment ZEW" impact="medium" forecast="-3.2" prev="-5.8" />
          <EventCardB day="MER 16" time="20:00" flag="🇺🇸" cur="USD" title="FOMC Minutes" impact="high" forecast="—" prev="—" />
          <EventCardB day="JEU 17" time="08:30" flag="🇬🇧" cur="GBP" title="UK Retail Sales" impact="medium" forecast="0.3%" prev="0.1%" />
          <EventCardB day="VEN 18" time="14:30" flag="🇺🇸" cur="USD" title="Non-Farm Payrolls" impact="high" forecast="185K" prev="254K" />
        </div>
      </div>

      {/* Theses + Scenarios semaine en grille */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <BookOpen size={13} color="var(--text-muted)" />
              <span className="section-label">THESES MACRO</span>
            </div>
            <span style={{ fontSize: 10, color: "var(--text-muted)" }}>✎ Editer</span>
          </div>
          <ThesisCompact label="CT · S17" text="Desinflation US en attente confirmation, DXY support 104." accent="var(--accent)" />
          <div style={{ height: 10 }} />
          <ThesisCompact label="LT · Q2 2026" text="Cycle baissier USD, rotation vers or et matieres premieres." accent="var(--accent-gold)" />
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Target size={13} color="var(--text-muted)" />
            <span className="section-label">SCENARIOS SEMAINE</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <WeeklyScenarioRow kind="hawkish" title="Fed ferme, DXY > 105" pct={40} />
            <WeeklyScenarioRow kind="base" title="Statu quo, range preserve" pct={35} />
            <WeeklyScenarioRow kind="dovish" title="Cuts reprices, gold > 2080" pct={25} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==================== OPTION C — TERMINAL BLOOMBERG ==================== */

function MockPreparationC() {
  return (
    <div style={{ background: "var(--bg)", padding: 24, borderRadius: 8 }}>
      {/* Header compact */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          marginBottom: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <WeekSelector />
          <span className="tag tag-bull" style={{ fontSize: 9 }}>EN COURS</span>
          <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>
            Semaine 17 · 14 au 18 avril 2026
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
            12 evenements · 3 HIGH
          </span>
          <button
            type="button"
            style={{
              padding: "6px 12px",
              fontSize: 11,
              fontWeight: 600,
              background: "var(--text-primary)",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            ✓ Valider semaine
          </button>
        </div>
      </div>

      {/* Grid 2 cols */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 14 }}>
        {/* LEFT: calendrier dense style terminal */}
        <div
          style={{
            borderRadius: 10,
            overflow: "hidden",
            background: "#0d0d0d",
            border: "1px solid #1f1f1f",
          }}
        >
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #1f1f1f", background: "#0d0d0d" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#f8c471" }}>
              CALENDRIER ECONOMIQUE · S17
            </div>
            <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 2, fontFamily: "var(--font-mono)" }}>
              14/04 — 18/04 · 12 evenements apres filtres
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "60px 80px 70px 1fr 70px 70px",
              gap: 10,
              padding: "8px 16px",
              background: "#080808",
              borderBottom: "1px solid #1f1f1f",
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: 1.2,
              color: "#6b7280",
            }}
          >
            <div>HEURE</div>
            <div>DEVISE</div>
            <div>IMPACT</div>
            <div>EVENEMENT</div>
            <div style={{ textAlign: "right" }}>CONS.</div>
            <div style={{ textAlign: "right" }}>PREC.</div>
          </div>

          <DaySeparator label="MARDI 15 AVRIL" count={1} />
          <TerminalRow time="09:00" flag="🇪🇺" cur="EUR" impact="MOY" title="Sentiment ZEW" forecast="-3.2" prev="-5.8" />

          <DaySeparator label="MERCREDI 16 AVRIL" count={2} highlight />
          <TerminalRow time="14:30" flag="🇺🇸" cur="USD" impact="HIGH" title="CPI US (MoM & YoY, core & headline)" forecast="0.2%" prev="0.3%" isHigh />
          <TerminalRow time="20:00" flag="🇺🇸" cur="USD" impact="HIGH" title="FOMC Minutes" forecast="—" prev="—" isHigh />

          <DaySeparator label="JEUDI 17 AVRIL" count={1} />
          <TerminalRow time="08:30" flag="🇬🇧" cur="GBP" impact="MOY" title="UK Retail Sales" forecast="0.3%" prev="0.1%" />

          <DaySeparator label="VENDREDI 18 AVRIL" count={1} />
          <TerminalRow time="14:30" flag="🇺🇸" cur="USD" impact="HIGH" title="Non-Farm Payrolls" forecast="185K" prev="254K" isHigh />

          <div
            style={{
              padding: "10px 16px",
              background: "#0d0d0d",
              borderTop: "1px solid #1f1f1f",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 10,
              color: "#6b7280",
              fontFamily: "var(--font-mono)",
            }}
          >
            <div style={{ display: "flex", gap: 12 }}>
              <LegendDot color="rgba(239,68,68,0.5)" label="HIGH" />
              <LegendDot color="rgba(249,115,22,0.5)" label="MOY" />
              <LegendDot color="rgba(234,179,8,0.5)" label="BAS" />
            </div>
            <div>MAJ 17:15:42</div>
          </div>
        </div>

        {/* RIGHT: side panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Theses stack vertical */}
          <div className="card" style={{ padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <BookOpen size={13} color="var(--text-muted)" />
                <span className="section-label">THESES MACRO</span>
              </div>
              <span style={{ fontSize: 10, color: "var(--text-muted)" }}>✎</span>
            </div>
            <div style={{ marginBottom: 10, paddingLeft: 10, borderLeft: "3px solid var(--accent)" }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, color: "var(--accent)", marginBottom: 3 }}>
                COURT TERME · S17
              </div>
              <p style={{ fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Desinflation US en attente confirmation, DXY support 104.
              </p>
            </div>
            <div style={{ paddingLeft: 10, borderLeft: "3px solid var(--accent-gold)" }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, color: "var(--accent-gold)", marginBottom: 3 }}>
                LONG TERME · Q2 2026
              </div>
              <p style={{ fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Cycle baissier USD, rotation vers or et matieres premieres.
              </p>
            </div>
          </div>

          {/* Scenarios semaine */}
          <div className="card" style={{ padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Target size={13} color="var(--text-muted)" />
              <span className="section-label">SCENARIOS SEMAINE · 3 CHEMINS</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <WeeklyScenarioRow kind="hawkish" title="Fed ferme, DXY > 105" pct={40} />
              <WeeklyScenarioRow kind="base" title="Statu quo, range preserve" pct={35} />
              <WeeklyScenarioRow kind="dovish" title="Cuts reprices, gold > 2080" pct={25} />
            </div>
          </div>

          {/* Impact distribution */}
          <div className="card" style={{ padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <BarChart3 size={13} color="var(--text-muted)" />
              <span className="section-label">IMPACT SEMAINE</span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 60, marginBottom: 8 }}>
              <DayBar label="L" value={0} max={3} />
              <DayBar label="M" value={1} max={3} />
              <DayBar label="M" value={2} max={3} highlight />
              <DayBar label="J" value={1} max={3} />
              <DayBar label="V" value={1} max={3} />
            </div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              Mercredi = point chaud (CPI + FOMC)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==================== PRIMITIVES ==================== */

type Impact = "high" | "medium" | "low";
type MockEvent = {
  time: string;
  cur: string;
  flag: string;
  title: string;
  impact: Impact;
  forecast: string;
  prev: string;
};

function WeekSelector() {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: 6,
        overflow: "hidden",
        border: "1px solid var(--border)",
        background: "white",
      }}
    >
      <button
        type="button"
        style={{
          padding: "4px 8px",
          background: "transparent",
          border: "none",
          borderRight: "1px solid var(--border-light)",
          cursor: "pointer",
        }}
      >
        <ChevronLeft size={12} />
      </button>
      <div
        style={{
          padding: "4px 12px",
          fontSize: 11,
          fontWeight: 700,
          fontFamily: "var(--font-mono)",
        }}
      >
        S17 · 2026
      </div>
      <button
        type="button"
        style={{
          padding: "4px 8px",
          background: "transparent",
          border: "none",
          borderLeft: "1px solid var(--border-light)",
          cursor: "pointer",
        }}
      >
        <ChevronRight size={12} />
      </button>
    </div>
  );
}

function FilterPill({
  label,
  count,
  icon,
  active,
  color,
}: {
  label: string;
  count?: number;
  icon?: React.ReactNode;
  active?: boolean;
  color?: string;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "4px 9px",
        fontSize: 10,
        fontWeight: 600,
        borderRadius: 6,
        border: `1px solid ${active ? color || "var(--accent)" : "var(--border-light)"}`,
        background: active ? `${color || "var(--accent)"}15` : "var(--bg-card)",
        color: active ? color || "var(--accent)" : "var(--text-secondary)",
      }}
    >
      {icon}
      {label}
      {count !== undefined && count > 0 && (
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            padding: "1px 5px",
            borderRadius: 3,
            background: active ? color || "var(--accent)" : "var(--bg-elevated)",
            color: active ? "white" : "var(--text-muted)",
            minWidth: 14,
            textAlign: "center",
          }}
        >
          {count}
        </span>
      )}
    </span>
  );
}

function EventRowA({ event }: { event: MockEvent }) {
  const isHigh = event.impact === "high";
  const impactColors =
    event.impact === "high"
      ? { bg: "var(--bear-bg)", text: "var(--bear)", label: "HIGH" }
      : event.impact === "medium"
      ? { bg: "var(--neutral-bg)", text: "var(--neutral-color)", label: "MOY" }
      : { bg: "var(--bg-elevated)", text: "var(--text-muted)", label: "BAS" };
  return (
    <div
      className="card"
      style={{
        padding: "10px 14px",
        background: isHigh ? "var(--bear-bg)" : "var(--bg-card)",
        borderLeft: isHigh ? "3px solid var(--bear)" : "1px solid var(--border-light)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 600, minWidth: 44 }}>
          {event.time}
        </span>
        <span style={{ fontSize: 16 }}>{event.flag}</span>
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            padding: "2px 5px",
            borderRadius: 3,
            background: impactColors.bg,
            color: impactColors.text,
            letterSpacing: 0.5,
          }}
        >
          {impactColors.label}
        </span>
        <span style={{ fontSize: 12, fontWeight: 500, flex: 1 }}>{event.title}</span>
        <span
          style={{
            fontSize: 10,
            fontFamily: "var(--font-mono)",
            color: "var(--text-muted)",
          }}
        >
          <span style={{ color: "var(--text-secondary)" }}>C: {event.forecast}</span>
          <span style={{ margin: "0 6px", opacity: 0.4 }}>·</span>
          <span>P: {event.prev}</span>
        </span>
      </div>
    </div>
  );
}

function EventCardB({
  day,
  time,
  flag,
  cur,
  title,
  impact,
  forecast,
  prev,
}: {
  day: string;
  time: string;
  flag: string;
  cur: string;
  title: string;
  impact: Impact;
  forecast: string;
  prev: string;
}) {
  const impactColors =
    impact === "high"
      ? { bg: "var(--bear-bg)", text: "var(--bear)", label: "HIGH" }
      : { bg: "var(--neutral-bg)", text: "var(--neutral-color)", label: "MOY" };
  return (
    <div
      style={{
        padding: 12,
        borderRadius: 8,
        border: "1px solid var(--border-light)",
        background: "var(--bg-card)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, color: "var(--text-muted)" }}>
          {day}
        </span>
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            padding: "2px 5px",
            borderRadius: 3,
            background: impactColors.bg,
            color: impactColors.text,
          }}
        >
          {impactColors.label}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 20 }}>{flag}</span>
        <div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
            {cur} · {time}
          </div>
          <div style={{ fontSize: 12, fontWeight: 500, lineHeight: 1.2, marginTop: 2 }}>{title}</div>
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 6,
          fontSize: 10,
          fontFamily: "var(--font-mono)",
          paddingTop: 6,
          borderTop: "1px solid var(--border-light)",
        }}
      >
        <div>
          <div style={{ fontSize: 8, color: "var(--text-muted)", letterSpacing: 0.8 }}>CONSENSUS</div>
          <div style={{ fontWeight: 600, marginTop: 1 }}>{forecast}</div>
        </div>
        <div>
          <div style={{ fontSize: 8, color: "var(--text-muted)", letterSpacing: 0.8 }}>PRECEDENT</div>
          <div style={{ color: "var(--text-secondary)", marginTop: 1 }}>{prev}</div>
        </div>
      </div>
    </div>
  );
}

function ThesisCompact({
  label,
  text,
  accent,
}: {
  label: string;
  text: string;
  accent: string;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 1.2,
          color: accent,
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>{text}</p>
    </div>
  );
}

function WeeklyScenarioRow({
  kind,
  title,
  pct,
}: {
  kind: "hawkish" | "base" | "dovish";
  title: string;
  pct: number;
}) {
  const meta =
    kind === "hawkish"
      ? { bg: "var(--bear-bg)", color: "var(--bear)", label: "HAWK", icon: <TrendingDown size={10} /> }
      : kind === "dovish"
      ? { bg: "var(--bull-bg)", color: "var(--bull)", label: "DOVE", icon: <TrendingUp size={10} /> }
      : { bg: "var(--neutral-bg)", color: "var(--neutral-color)", label: "BASE", icon: <Minus size={10} /> };
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
          display: "inline-flex",
          alignItems: "center",
          gap: 3,
          fontSize: 9,
          fontWeight: 700,
          padding: "3px 6px",
          borderRadius: 3,
          background: meta.bg,
          color: meta.color,
          minWidth: 52,
          justifyContent: "center",
        }}
      >
        {meta.icon}
        {meta.label}
      </span>
      <span style={{ flex: 1, color: "var(--text-secondary)" }}>{title}</span>
      <span
        style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", fontWeight: 600 }}
      >
        {pct}%
      </span>
    </div>
  );
}

function DaySeparator({ label, count, highlight }: { label: string; count: number; highlight?: boolean }) {
  return (
    <div
      style={{
        padding: "8px 16px",
        background: highlight ? "rgba(127,29,29,0.15)" : "#0d0d0d",
        borderTop: "1px solid rgba(31,31,31,0.6)",
        borderBottom: "1px solid rgba(31,31,31,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: highlight ? "#fca5a5" : "#d1d5db",
        }}
      >
        {label}
        {highlight && (
          <span
            style={{
              marginLeft: 10,
              fontSize: 9,
              fontWeight: 700,
              padding: "2px 5px",
              borderRadius: 3,
              background: "#f8c471",
              color: "#0a0a0a",
              letterSpacing: 1,
            }}
          >
            POINT CHAUD
          </span>
        )}
      </span>
      <span style={{ fontSize: 10, color: "#6b7280", fontFamily: "var(--font-mono)" }}>
        {count} annonce{count > 1 ? "s" : ""}
      </span>
    </div>
  );
}

function TerminalRow({
  time,
  flag,
  cur,
  impact,
  title,
  forecast,
  prev,
  isHigh,
}: {
  time: string;
  flag: string;
  cur: string;
  impact: string;
  title: string;
  forecast: string;
  prev: string;
  isHigh?: boolean;
}) {
  const impactColors =
    impact === "HIGH"
      ? { bg: "rgba(239,68,68,0.2)", text: "#f87171", border: "rgba(239,68,68,0.3)" }
      : impact === "MOY"
      ? { bg: "rgba(249,115,22,0.2)", text: "#fb923c", border: "rgba(249,115,22,0.3)" }
      : { bg: "rgba(234,179,8,0.2)", text: "#facc15", border: "rgba(234,179,8,0.3)" };
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "60px 80px 70px 1fr 70px 70px",
        gap: 10,
        padding: "8px 16px",
        background: isHigh ? "rgba(127,29,29,0.08)" : "transparent",
        borderBottom: "1px solid rgba(31,31,31,0.3)",
        fontSize: 11,
        alignItems: "center",
      }}
    >
      <div style={{ color: "#d1d5db", fontFamily: "var(--font-mono)" }}>{time}</div>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          padding: "2px 6px",
          borderRadius: 4,
          background: "rgba(31,41,55,0.5)",
          color: "#e5e7eb",
          border: "1px solid #374151",
          width: "fit-content",
        }}
      >
        <span style={{ fontSize: 12 }}>{flag}</span>
        <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: 0.5 }}>{cur}</span>
      </div>
      <span
        style={{
          padding: "2px 5px",
          fontSize: 9,
          fontWeight: 700,
          borderRadius: 3,
          background: impactColors.bg,
          color: impactColors.text,
          border: `1px solid ${impactColors.border}`,
          letterSpacing: 0.8,
          width: "fit-content",
        }}
      >
        {impact}
      </span>
      <div style={{ color: "#e5e7eb", fontWeight: 500 }}>{title}</div>
      <div style={{ color: "#d1d5db", fontFamily: "var(--font-mono)", textAlign: "right" }}>{forecast}</div>
      <div style={{ color: "#9ca3af", fontFamily: "var(--font-mono)", textAlign: "right" }}>{prev}</div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
      <span>{label}</span>
    </div>
  );
}

function DayBar({ label, value, max, highlight }: { label: string; value: number; max: number; highlight?: boolean }) {
  const h = (value / max) * 100;
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div
        style={{
          width: "100%",
          height: `${Math.max(h, 8)}%`,
          background: highlight ? "var(--bear)" : value > 0 ? "var(--accent)" : "var(--border)",
          borderRadius: 3,
          minHeight: 4,
        }}
      />
      <span style={{ fontSize: 9, color: "var(--text-muted)", fontWeight: 600 }}>{label}</span>
    </div>
  );
}
