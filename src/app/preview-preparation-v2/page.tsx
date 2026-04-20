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
  Flame,
  BarChart3,
  X as XIcon,
} from "lucide-react";

type Variant = "A" | "B" | "C" | null;
type Impact = "high" | "medium" | "low";

type MockEvent = {
  day: string;
  dayLabel: string;
  time: string;
  cur: string;
  title: string;
  impact: Impact;
  forecast: string;
  prev: string;
  category?: string;
};

const EVENTS: MockEvent[] = [
  { day: "MAR 15/04", dayLabel: "Mardi 15 avril", time: "09:00", cur: "EUR", title: "Sentiment ZEW", impact: "medium", forecast: "-3.2", prev: "-5.8", category: "Sentiment" },
  { day: "MER 16/04", dayLabel: "Mercredi 16 avril", time: "14:30", cur: "USD", title: "CPI US (MoM & YoY, core & headline)", impact: "high", forecast: "0.2% / 3.1%", prev: "0.3% / 3.2%", category: "Inflation" },
  { day: "MER 16/04", dayLabel: "Mercredi 16 avril", time: "20:00", cur: "USD", title: "FOMC Minutes", impact: "high", forecast: "—", prev: "—", category: "Politique monétaire" },
  { day: "JEU 17/04", dayLabel: "Jeudi 17 avril", time: "08:30", cur: "GBP", title: "UK Retail Sales", impact: "medium", forecast: "0.3%", prev: "0.1%", category: "Croissance" },
  { day: "VEN 18/04", dayLabel: "Vendredi 18 avril", time: "14:30", cur: "USD", title: "Non-Farm Payrolls", impact: "high", forecast: "185K", prev: "254K", category: "Emploi" },
];

const MAIN_EVENT = EVENTS[1]; // CPI US

const CURRENCY_COLORS: Record<string, string> = {
  USD: "#2563eb",
  EUR: "#7c3aed",
  GBP: "#db2777",
  JPY: "#dc2626",
  CHF: "#ea580c",
  AUD: "#16a34a",
  NZD: "#0891b2",
  CAD: "#c026d3",
};

export default function PreviewPreparationV2Page() {
  const [choice, setChoice] = useState<Variant>(null);

  return (
    <div style={{ minHeight: "100vh", background: "#f1efea", padding: "40px 32px" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <header style={{ marginBottom: 40 }}>
          <div className="section-label">PREPARATION · V2 · REVISIONS (AERE + FOND SITE)</div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 32,
              fontWeight: 700,
              marginTop: 8,
              color: "var(--text-primary)",
            }}
          >
            3 nouveaux positionnements
          </h1>
          <p style={{ color: "var(--text-secondary)", marginTop: 6, maxWidth: 720 }}>
            Mêmes elements (filtres pills + hero event + tableau) mais plus aere, fond couleur du site (pas noir),
            et devise sans drapeau en double (juste le code + point colore).
          </p>
        </header>

        <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
          <VariantCard
            label="Option A — Split grid 2/3 + 1/3 (sidebar stats)"
            sub="Hero + tableau a gauche sur 2/3, sidebar droite avec countdown, distribution impact, devises actives"
            selected={choice === "A"}
            onSelect={() => setChoice("A")}
          >
            <MockPreparationA />
          </VariantCard>

          <VariantCard
            label="Option B — Stacked full-width (sections bien separees)"
            sub="Hero plein largeur, barre filtres avec titres de sections (Impact / Devises / Categorie), tableau aere"
            selected={choice === "B"}
            onSelect={() => setChoice("B")}
          >
            <MockPreparationB />
          </VariantCard>

          <VariantCard
            label="Option C — Tabs par jour + cartes events"
            sub="Tabs Lun/Mar/Mer/Jeu/Ven en haut, chaque jour affiche ses events en cartes aerees (style 21st EconomicCalendar)"
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
              V2 Preparation :{" "}
              <span style={{ color: choice ? "var(--accent)" : "var(--text-muted)" }}>
                {choice ? `Option ${choice}` : "pas encore choisi"}
              </span>
            </div>
          </div>
          <div style={{ marginLeft: "auto", fontSize: 13, color: "var(--text-secondary)" }}>
            Dis-moi ton choix ou quelles pieces tu veux garder.
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

/* ==================== OPTION A — SPLIT GRID 2/3 + 1/3 ==================== */

function MockPreparationA() {
  return (
    <div style={{ background: "var(--bg)", padding: 32, borderRadius: 12 }}>
      {/* Header bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <WeekSelector />
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 28,
              fontWeight: 400,
              marginTop: 10,
              marginBottom: 4,
              color: "var(--text-primary)",
            }}
          >
            Preparation de la semaine
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            Semaine 17 · 14 au 18 avril 2026 · thème — <em>Desinflation en attente confirmation</em>
          </p>
        </div>
      </div>

      {/* Filtres */}
      <FilterBarClear />

      {/* Grid 2 cols */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginTop: 24 }}>
        {/* LEFT: Hero + tableau */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <HeroEventLight />

          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-light)",
              borderRadius: 12,
              overflow: "hidden",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--border-light)" }}>
              <div className="section-label" style={{ color: "var(--accent)" }}>
                CALENDRIER ECONOMIQUE · S17
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 3, fontFamily: "var(--font-mono)" }}>
                5 evenements
              </div>
            </div>
            <TableLight />
          </div>
        </div>

        {/* RIGHT: sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <SidePanelCountdown />
          <SidePanelImpact />
          <SidePanelCurrencies />
        </div>
      </div>
    </div>
  );
}

/* ==================== OPTION B — STACKED FULL WIDTH ==================== */

function MockPreparationB() {
  return (
    <div style={{ background: "var(--bg)", padding: 32, borderRadius: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <WeekSelector />
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 28,
              fontWeight: 400,
              marginTop: 10,
              marginBottom: 4,
            }}
          >
            Preparation de la semaine
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            Semaine 17 · 14 au 18 avril 2026
          </p>
        </div>
      </div>

      {/* Hero plein largeur */}
      <HeroEventLight />

      {/* Filtres avec sections bien visibles */}
      <div
        style={{
          marginTop: 24,
          padding: "18px 22px",
          background: "var(--bg-card)",
          border: "1px solid var(--border-light)",
          borderRadius: 10,
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <Filter size={13} style={{ color: "var(--text-muted)" }} />
          <span className="section-label">FILTRES</span>
          <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: "auto", fontFamily: "var(--font-mono)" }}>
            4 / 5 annonces
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 10, alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, color: "var(--text-muted)" }}>IMPACT</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <PillChipMock label="HAUT" color="var(--bear)" active />
            <PillChipMock label="MOYEN" color="var(--neutral-color)" active />
            <PillChipMock label="BAS" color="var(--text-muted)" />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 10, alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, color: "var(--text-muted)" }}>DEVISES</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <PillChipMock label="USD" color="#2563eb" active withDot />
            <PillChipMock label="EUR" color="#7c3aed" active withDot />
            <PillChipMock label="GBP" color="#db2777" withDot />
            <PillChipMock label="JPY" color="#dc2626" withDot />
            <PillChipMock label="CHF" color="#ea580c" withDot />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 10, alignItems: "center" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, color: "var(--text-muted)" }}>CATEGORIE</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <PillChipMock label="Inflation" color="var(--accent-gold)" active />
            <PillChipMock label="Emploi" color="var(--accent-gold)" />
            <PillChipMock label="Politique monetaire" color="var(--accent-gold)" active />
            <PillChipMock label="Croissance" color="var(--accent-gold)" />
            <PillChipMock label="Sentiment" color="var(--accent-gold)" />
          </div>
        </div>
      </div>

      {/* Tableau en cards par jour */}
      <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
        {groupByDay(EVENTS).map((group) => (
          <div
            key={group.day}
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-light)",
              borderRadius: 10,
              overflow: "hidden",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div
              style={{
                padding: "14px 22px",
                background: group.hasHighImpact ? "rgba(255, 46, 99, 0.04)" : "var(--bg-muted)",
                borderBottom: "1px solid var(--border-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 15,
                    fontWeight: 500,
                    color: "var(--text-primary)",
                  }}
                >
                  {group.dayLabel}
                </h3>
                {group.hasHighImpact && (
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: 1.2,
                      padding: "2px 7px",
                      borderRadius: 4,
                      background: "var(--accent-gold)",
                      color: "#0a0a0a",
                    }}
                  >
                    POINT CHAUD
                  </span>
                )}
              </div>
              <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                {group.events.length} annonce{group.events.length > 1 ? "s" : ""}
              </span>
            </div>
            <div style={{ padding: "4px 0" }}>
              {group.events.map((e, i) => (
                <EventRowLight key={i} event={e} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ==================== OPTION C — TABS PAR JOUR + CARDS ==================== */

function MockPreparationC() {
  const days = ["LUN 14/04", "MAR 15/04", "MER 16/04", "JEU 17/04", "VEN 18/04"];
  const [activeDay, setActiveDay] = useState("MER 16/04");
  const dayEvents = EVENTS.filter((e) => e.day === activeDay);

  return (
    <div style={{ background: "var(--bg)", padding: 32, borderRadius: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <WeekSelector />
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 28,
              fontWeight: 400,
              marginTop: 10,
            }}
          >
            Preparation de la semaine
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            Semaine 17 · 14 au 18 avril 2026
          </p>
        </div>
      </div>

      <HeroEventLight />

      <FilterBarClear />

      {/* Tabs jours */}
      <div
        style={{
          marginTop: 24,
          display: "flex",
          gap: 6,
          padding: 5,
          background: "var(--bg-card)",
          border: "1px solid var(--border-light)",
          borderRadius: 12,
          boxShadow: "var(--shadow-sm)",
        }}
      >
        {days.map((d) => {
          const isActive = d === activeDay;
          const count = EVENTS.filter((e) => e.day === d).length;
          const hasHigh = EVENTS.some((e) => e.day === d && e.impact === "high");
          return (
            <button
              key={d}
              type="button"
              onClick={() => setActiveDay(d)}
              style={{
                flex: 1,
                padding: "12px 10px",
                background: isActive ? "var(--text-primary)" : "transparent",
                color: isActive ? "white" : "var(--text-secondary)",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                transition: "all 0.15s",
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 1.2,
                  fontFamily: "var(--font-mono)",
                }}
              >
                {d}
              </span>
              <span style={{ fontSize: 11, opacity: 0.7, display: "flex", alignItems: "center", gap: 4 }}>
                {count} event{count > 1 ? "s" : ""}
                {hasHigh && (
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: isActive ? "#f8c471" : "var(--bear)",
                    }}
                  />
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* Cards events du jour actif */}
      <div style={{ marginTop: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 18,
              fontWeight: 500,
              color: "var(--text-primary)",
            }}
          >
            {dayEvents[0]?.dayLabel ?? ""}
          </h3>
          <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
            {dayEvents.length} evenement{dayEvents.length > 1 ? "s" : ""}
          </span>
        </div>

        {dayEvents.length === 0 ? (
          <div
            style={{
              padding: "40px 20px",
              textAlign: "center",
              background: "var(--bg-card)",
              border: "1px dashed var(--border)",
              borderRadius: 10,
              color: "var(--text-muted)",
              fontSize: 13,
              fontStyle: "italic",
            }}
          >
            Aucun event pour ce jour
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
            {dayEvents.map((e, i) => (
              <EventCardAired key={i} event={e} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ==================== PRIMITIVES COMMUNES ==================== */

function WeekSelector() {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: 8,
        overflow: "hidden",
        border: "1px solid var(--border)",
        background: "white",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <button
        type="button"
        style={{
          padding: "6px 10px",
          background: "transparent",
          border: "none",
          borderRight: "1px solid var(--border-light)",
          cursor: "pointer",
          color: "var(--text-primary)",
        }}
      >
        <ChevronLeft size={13} />
      </button>
      <div
        style={{
          padding: "6px 14px",
          fontSize: 12,
          fontWeight: 700,
          fontFamily: "var(--font-mono)",
          color: "var(--text-primary)",
        }}
      >
        S17 · 2026
      </div>
      <button
        type="button"
        style={{
          padding: "6px 10px",
          background: "transparent",
          border: "none",
          borderLeft: "1px solid var(--border-light)",
          cursor: "pointer",
          color: "var(--text-primary)",
        }}
      >
        <ChevronRight size={13} />
      </button>
    </div>
  );
}

function HeroEventLight() {
  return (
    <div
      style={{
        padding: "28px 32px",
        borderRadius: 14,
        background: "linear-gradient(135deg, #1a1a1a 0%, #2c3e50 100%)",
        color: "white",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 12px 32px rgba(10, 11, 14, 0.22)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 18,
        }}
      >
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
            padding: "4px 10px",
            borderRadius: 5,
            background: "rgba(239,68,68,0.2)",
            color: "#f87171",
            letterSpacing: 1.2,
          }}
        >
          HIGH IMPACT
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 18, marginBottom: 22 }}>
        <CurrencyBadgeLarge cur={MAIN_EVENT.cur} />
        <div>
          <div style={{ fontSize: 11, opacity: 0.55, fontFamily: "var(--font-mono)", marginBottom: 5 }}>
            MERCREDI 16 AVRIL · 14:30 GMT+2
          </div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 28,
              fontWeight: 500,
              lineHeight: 1.15,
              marginBottom: 8,
            }}
          >
            {MAIN_EVENT.title}
          </h2>
          <p style={{ fontSize: 13.5, opacity: 0.82, maxWidth: 620, lineHeight: 1.55 }}>
            Consensus <strong style={{ color: "#f8c471" }}>{MAIN_EVENT.forecast}</strong> · precedent{" "}
            <strong style={{ opacity: 0.7 }}>{MAIN_EVENT.prev}</strong>. Un print hot relance DXY et
            pese sur Gold/EURUSD. 3 scenarios prepares.
          </p>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button
          style={{
            padding: "9px 18px",
            borderRadius: 7,
            background: "white",
            color: "#1a1a1a",
            fontSize: 12,
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
          }}
        >
          Voir les scenarios
        </button>
        <button
          style={{
            padding: "9px 18px",
            borderRadius: 7,
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
  );
}

function FilterBarClear() {
  return (
    <div
      style={{
        padding: "14px 18px",
        background: "var(--bg-card)",
        border: "1px solid var(--border-light)",
        borderRadius: 10,
        display: "flex",
        alignItems: "center",
        gap: 10,
        flexWrap: "wrap",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6, paddingRight: 10, borderRight: "1px solid var(--border-light)" }}>
        <Filter size={12} style={{ color: "var(--text-muted)" }} />
        <span className="section-label">FILTRES</span>
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            padding: "2px 6px",
            borderRadius: 4,
            background: "var(--accent)",
            color: "white",
          }}
        >
          2
        </span>
      </div>

      <PillChipMock label="HAUT" color="var(--bear)" active />
      <PillChipMock label="MOYEN" color="var(--neutral-color)" />
      <PillChipMock label="BAS" color="var(--text-muted)" />

      <span style={{ width: 1, height: 20, background: "var(--border-light)", margin: "0 4px" }} />

      <PillChipMock label="USD" color="#2563eb" active withDot />
      <PillChipMock label="EUR" color="#7c3aed" withDot />
      <PillChipMock label="GBP" color="#db2777" withDot />
      <PillChipMock label="JPY" color="#dc2626" withDot />

      <span style={{ width: 1, height: 20, background: "var(--border-light)", margin: "0 4px" }} />

      <PillChipMock label="Inflation" color="var(--accent-gold)" />
      <PillChipMock label="Politique monetaire" color="var(--accent-gold)" />

      <div style={{ flex: 1 }} />

      <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
        4 / 5
      </span>
      <button
        type="button"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          padding: "4px 8px",
          fontSize: 11,
          fontWeight: 600,
          background: "var(--bg-elevated)",
          color: "var(--text-secondary)",
          border: "none",
          borderRadius: 5,
          cursor: "pointer",
        }}
      >
        <XIcon size={11} /> Reset
      </button>
    </div>
  );
}

function PillChipMock({
  label,
  color,
  active,
  withDot,
}: {
  label: string;
  color: string;
  active?: boolean;
  withDot?: boolean;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "5px 10px",
        fontSize: 11,
        fontWeight: 600,
        borderRadius: 7,
        border: `1px solid ${active ? color : "var(--border-light)"}`,
        background: active ? `${color}15` : "var(--bg-card)",
        color: active ? color : "var(--text-secondary)",
      }}
    >
      {withDot && (
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: color,
            display: "inline-block",
          }}
        />
      )}
      {label}
    </span>
  );
}

function CurrencyBadge({ cur }: { cur: string }) {
  const color = CURRENCY_COLORS[cur] ?? "var(--accent)";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 8px",
        borderRadius: 5,
        background: `${color}18`,
        border: `1px solid ${color}40`,
        color,
        fontSize: 10.5,
        fontWeight: 700,
        fontFamily: "var(--font-mono)",
        letterSpacing: 0.8,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: color,
          display: "inline-block",
        }}
      />
      {cur}
    </span>
  );
}

function CurrencyBadgeLarge({ cur }: { cur: string }) {
  const color = CURRENCY_COLORS[cur] ?? "#f8c471";
  return (
    <div
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: 54,
        height: 54,
        borderRadius: 10,
        background: `${color}25`,
        border: `2px solid ${color}60`,
        color: "white",
        fontFamily: "var(--font-mono)",
        fontWeight: 700,
      }}
    >
      <span style={{ fontSize: 16, letterSpacing: 1 }}>{cur}</span>
    </div>
  );
}

function ImpactBadge({ impact }: { impact: Impact }) {
  const meta =
    impact === "high"
      ? { label: "HAUT", color: "var(--bear)", bg: "var(--bear-bg)" }
      : impact === "medium"
      ? { label: "MOYEN", color: "var(--neutral-color)", bg: "var(--neutral-bg)" }
      : { label: "BAS", color: "var(--text-muted)", bg: "var(--bg-muted)" };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "3px 7px",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: 0.8,
        borderRadius: 5,
        background: meta.bg,
        color: meta.color,
        border: `1px solid ${meta.color}30`,
      }}
    >
      <VolatilityIcon impact={impact} />
      {meta.label}
    </span>
  );
}

function VolatilityIcon({ impact }: { impact: Impact }) {
  const bars = impact === "high" ? 3 : impact === "medium" ? 2 : 1;
  return (
    <span style={{ display: "inline-flex", alignItems: "flex-end", gap: 1.5, height: 10 }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 2.5,
            height: i === 0 ? 4 : i === 1 ? 7 : 10,
            borderRadius: 1,
            background: i < bars ? "currentColor" : "currentColor",
            opacity: i < bars ? 1 : 0.25,
          }}
        />
      ))}
    </span>
  );
}

function EventRowLight({ event }: { event: MockEvent }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "70px 90px 90px 1fr 100px 100px",
        gap: 14,
        padding: "14px 22px",
        borderBottom: "1px solid var(--border-light)",
        alignItems: "center",
        fontSize: 13,
      }}
    >
      <div style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--text-primary)" }}>
        {event.time}
      </div>
      <CurrencyBadge cur={event.cur} />
      <ImpactBadge impact={event.impact} />
      <div style={{ fontWeight: 500, color: "var(--text-primary)" }}>{event.title}</div>
      <div style={{ textAlign: "right", fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>
        {event.forecast}
      </div>
      <div style={{ textAlign: "right", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
        {event.prev}
      </div>
    </div>
  );
}

function TableLight() {
  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "70px 90px 90px 1fr 100px 100px",
          gap: 14,
          padding: "10px 22px",
          background: "var(--bg-muted)",
          borderBottom: "1px solid var(--border-light)",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 1.2,
          color: "var(--text-muted)",
        }}
      >
        <div>HEURE</div>
        <div>DEVISE</div>
        <div>IMPACT</div>
        <div>EVENEMENT</div>
        <div style={{ textAlign: "right" }}>CONS.</div>
        <div style={{ textAlign: "right" }}>PREC.</div>
      </div>
      {groupByDay(EVENTS).map((group) => (
        <div key={group.day}>
          <div
            style={{
              padding: "10px 22px",
              background: group.hasHighImpact ? "rgba(255, 46, 99, 0.05)" : "var(--bg)",
              borderBottom: "1px solid var(--border-light)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-primary)" }}>
                {group.dayLabel}
              </span>
              {group.hasHighImpact && (
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: 1,
                    padding: "2px 6px",
                    borderRadius: 4,
                    background: "var(--accent-gold)",
                    color: "#0a0a0a",
                  }}
                >
                  POINT CHAUD
                </span>
              )}
            </div>
            <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              {group.events.length} annonce{group.events.length > 1 ? "s" : ""}
            </span>
          </div>
          {group.events.map((e, i) => (
            <EventRowLight key={i} event={e} />
          ))}
        </div>
      ))}
    </>
  );
}

function EventCardAired({ event }: { event: MockEvent }) {
  const isHigh = event.impact === "high";
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: `1px solid ${isHigh ? "rgba(255, 46, 99, 0.3)" : "var(--border-light)"}`,
        borderRadius: 12,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        boxShadow: "var(--shadow-sm)",
        borderLeft: isHigh ? "4px solid var(--bear)" : `1px solid var(--border-light)`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            {event.time}
          </span>
          <span style={{ fontSize: 10, color: "var(--text-muted)" }}>GMT+2</span>
        </div>
        <ImpactBadge impact={event.impact} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <CurrencyBadge cur={event.cur} />
        {event.category && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              padding: "2px 6px",
              borderRadius: 4,
              background: "var(--accent-gold-light)",
              color: "var(--accent-gold)",
            }}
          >
            {event.category}
          </span>
        )}
      </div>
      <h4
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 16,
          fontWeight: 500,
          lineHeight: 1.3,
          color: "var(--text-primary)",
        }}
      >
        {event.title}
      </h4>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          paddingTop: 12,
          borderTop: "1px solid var(--border-light)",
        }}
      >
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, color: "var(--text-muted)" }}>
            CONSENSUS
          </div>
          <div
            style={{
              fontSize: 13,
              fontFamily: "var(--font-mono)",
              fontWeight: 600,
              marginTop: 2,
              color: "var(--text-primary)",
            }}
          >
            {event.forecast}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, color: "var(--text-muted)" }}>
            PRECEDENT
          </div>
          <div
            style={{
              fontSize: 13,
              fontFamily: "var(--font-mono)",
              marginTop: 2,
              color: "var(--text-secondary)",
            }}
          >
            {event.prev}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==================== SIDE PANELS (Option A) ==================== */

function SidePanelCountdown() {
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-light)",
        borderRadius: 12,
        padding: 20,
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <Clock size={13} style={{ color: "var(--text-muted)" }} />
        <span className="section-label">PROCHAIN EVENT HIGH</span>
      </div>
      <div style={{ textAlign: "center" }}>
        <CurrencyBadgeSmall cur="USD" />
        <div
          style={{
            fontSize: 32,
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            color: "var(--text-primary)",
            marginTop: 12,
          }}
        >
          6H 48MIN
        </div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, fontFamily: "var(--font-mono)" }}>
          MER 16/04 · 14:30 GMT+2
        </div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            marginTop: 10,
            padding: "10px 12px",
            background: "var(--bear-bg)",
            color: "var(--bear)",
            borderRadius: 8,
          }}
        >
          CPI US · HIGH IMPACT
        </div>
      </div>
    </div>
  );
}

function SidePanelImpact() {
  const days = [
    { label: "LUN", high: 0, med: 0 },
    { label: "MAR", high: 0, med: 1 },
    { label: "MER", high: 2, med: 0 },
    { label: "JEU", high: 0, med: 1 },
    { label: "VEN", high: 1, med: 0 },
  ];
  const max = 3;
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-light)",
        borderRadius: 12,
        padding: 20,
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <BarChart3 size={13} style={{ color: "var(--text-muted)" }} />
        <span className="section-label">DISTRIBUTION IMPACT</span>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 80 }}>
        {days.map((d) => {
          const total = d.high + d.med;
          const h = (total / max) * 100;
          return (
            <div
              key={d.label}
              style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}
            >
              <div
                style={{
                  width: "100%",
                  height: `${Math.max(h, 6)}%`,
                  minHeight: 6,
                  borderRadius: 4,
                  background: d.high >= 2 ? "var(--bear)" : d.high > 0 ? "var(--accent)" : "var(--border)",
                  transition: "all 0.2s",
                }}
              />
              <span style={{ fontSize: 9, fontWeight: 700, color: "var(--text-muted)" }}>
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
      <div
        style={{
          marginTop: 12,
          fontSize: 11,
          color: "var(--text-muted)",
          fontFamily: "var(--font-mono)",
          textAlign: "center",
        }}
      >
        Mercredi = point chaud
      </div>
    </div>
  );
}

function SidePanelCurrencies() {
  const currencies = [
    { cur: "USD", count: 3 },
    { cur: "EUR", count: 1 },
    { cur: "GBP", count: 1 },
  ];
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-light)",
        borderRadius: 12,
        padding: 20,
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <Target size={13} style={{ color: "var(--text-muted)" }} />
        <span className="section-label">DEVISES ACTIVES</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {currencies.map((c) => (
          <div key={c.cur} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <CurrencyBadgeSmall cur={c.cur} />
            <div style={{ flex: 1, position: "relative", height: 6, background: "var(--bg-muted)", borderRadius: 3 }}>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${(c.count / 3) * 100}%`,
                  background: CURRENCY_COLORS[c.cur],
                  borderRadius: 3,
                }}
              />
            </div>
            <span
              style={{
                fontSize: 11,
                fontFamily: "var(--font-mono)",
                fontWeight: 600,
                color: "var(--text-primary)",
                minWidth: 20,
                textAlign: "right",
              }}
            >
              {c.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CurrencyBadgeSmall({ cur }: { cur: string }) {
  return <CurrencyBadge cur={cur} />;
}

/* ==================== HELPERS ==================== */

function groupByDay(events: MockEvent[]) {
  const map = new Map<string, { day: string; dayLabel: string; events: MockEvent[]; hasHighImpact: boolean }>();
  events.forEach((e) => {
    if (!map.has(e.day)) {
      map.set(e.day, { day: e.day, dayLabel: e.dayLabel, events: [], hasHighImpact: false });
    }
    const g = map.get(e.day)!;
    g.events.push(e);
    if (e.impact === "high") g.hasHighImpact = g.events.filter((x) => x.impact === "high").length >= 2;
  });
  return Array.from(map.values());
}
