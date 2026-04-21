"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  CheckSquare,
  CalendarDays,
  Rewind,
  TrendingUp,
  Sparkles,
  Flame,
  Calendar,
} from "lucide-react";

const ACCENT = "#7C5CFF";
const GREEN = "#16A34A";
const GREEN_BG = "rgba(22,163,74,0.12)";
const BORDER = "rgba(0,0,0,0.08)";
const BORDER_LIGHT = "rgba(0,0,0,0.05)";
const TEXT_MUTED = "#6B7280";
const TEXT_SECONDARY = "#4B5563";
const ACCENT_LIGHT = "rgba(124,92,255,0.10)";
const BG_ELEVATED = "#F5F5F4";

const WEEK = {
  weekNumber: 17,
  year: 2026,
  startDate: "2026-04-20",
  endDate: "2026-04-24",
  range: "20 au 24 Avril 2026",
  theme: "Inflation US + divergence BCE/FED",
};

const STATS = [
  { label: "Events majeurs", value: "14" },
  { label: "Red news", value: "3" },
  { label: "Thèses actives", value: "2" },
  { label: "Paires focus", value: "5" },
];

export default function PreviewPreparationHeaderPage() {
  return (
    <div style={{ background: "#FAFAF9", minHeight: "100vh", padding: "32px 48px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <h1 style={{ fontSize: 28, fontWeight: 300, marginBottom: 8, fontFamily: "Georgia, serif" }}>
          Preview — Header page Préparation
        </h1>
        <p style={{ fontSize: 13, color: TEXT_MUTED, marginBottom: 40 }}>
          4 variantes de présentation du début de la page. Choisis celle que tu préfères.
        </p>

        {/* VARIANTE A */}
        <VariantWrapper
          title="VARIANTE A — Hero éditorial magazine"
          desc="Grande carte hero avec thème mis en valeur. Style magazine / journal pro."
        >
          <HeroEditorial />
        </VariantWrapper>

        {/* VARIANTE B */}
        <VariantWrapper
          title="VARIANTE B — Dashboard compact avec stats"
          desc="Bandeau dense avec KPIs (events majeurs, red news, thèses). Style terminal pro Bloomberg."
        >
          <DashboardCompact />
        </VariantWrapper>

        {/* VARIANTE C */}
        <VariantWrapper
          title="VARIANTE C — Split asymétrique titre / thème"
          desc="2 colonnes : à gauche titre + sélecteur, à droite carte thème bien visible avec icône."
        >
          <SplitAsym />
        </VariantWrapper>

        {/* VARIANTE D */}
        <VariantWrapper
          title="VARIANTE D — Minimal breadcrumb + timeline semaine"
          desc="Très épuré : breadcrumb, titre XXL, mini-timeline des 5 jours avec events comptés."
        >
          <MinimalTimeline />
        </VariantWrapper>
      </div>
    </div>
  );
}

function VariantWrapper({
  title,
  desc,
  children,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 56 }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: ACCENT, marginBottom: 4 }}>
          {title}
        </div>
        <div style={{ fontSize: 12, color: TEXT_MUTED }}>{desc}</div>
      </div>
      <div
        style={{
          background: "white",
          border: `1px solid ${BORDER}`,
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/* --------------- VARIANTE A --------------- */
function HeroEditorial() {
  return (
    <div style={{ padding: "40px 48px", background: "linear-gradient(180deg, #fff 0%, #FAFAF9 100%)" }}>
      {/* Top bar : week selector + actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <WeekSelectorMini />
        <div style={{ display: "flex", gap: 8 }}>
          <button style={pillBtn()}><Plus size={13} /> Évènement custom</button>
          <button style={pillBtnPrimary()}><CheckSquare size={13} /> Valider la semaine</button>
        </div>
      </div>

      {/* Hero content */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 48 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span style={badgeGreen()}>EN COURS</span>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.5, color: TEXT_MUTED }}>
              SEMAINE {WEEK.weekNumber} · {WEEK.year}
            </span>
          </div>
          <h1 style={{ fontSize: 52, fontWeight: 300, lineHeight: 1.05, fontFamily: "Georgia, serif", marginBottom: 14, letterSpacing: -0.5 }}>
            Préparation de la semaine
          </h1>
          <p style={{ fontSize: 15, color: TEXT_SECONDARY, marginBottom: 0 }}>
            Du <strong style={{ color: "#0A0B0E", fontWeight: 600 }}>{WEEK.range}</strong>
          </p>
        </div>

        {/* Thème highlight card */}
        <div
          style={{
            width: 340,
            padding: "20px 24px",
            background: "white",
            border: `1px solid ${ACCENT}30`,
            borderRadius: 14,
            boxShadow: `0 4px 16px ${ACCENT}15`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Flame size={14} color={ACCENT} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: ACCENT }}>
              THÈME DE LA SEMAINE
            </span>
          </div>
          <div style={{ fontSize: 17, fontWeight: 500, lineHeight: 1.35, color: "#0A0B0E" }}>
            {WEEK.theme}
          </div>
        </div>
      </div>

      <TabsBar />
    </div>
  );
}

/* --------------- VARIANTE B --------------- */
function DashboardCompact() {
  return (
    <div style={{ padding: "28px 40px" }}>
      {/* Top row : week + actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <WeekSelectorMini />
          <span style={badgeGreen()}>EN COURS</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={pillBtn()}><Plus size={13} /> Évènement custom</button>
          <button style={pillBtnPrimary()}><CheckSquare size={13} /> Valider la semaine</button>
        </div>
      </div>

      {/* Title + meta inline */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 20 }}>
        <h1 style={{ fontSize: 34, fontWeight: 400, fontFamily: "Georgia, serif", margin: 0, letterSpacing: -0.3 }}>
          Préparation
        </h1>
        <span style={{ fontSize: 13, color: TEXT_MUTED, fontFamily: "ui-monospace, monospace" }}>
          {WEEK.range}
        </span>
      </div>

      {/* Stats strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
          gap: 0,
          border: `1px solid ${BORDER}`,
          borderRadius: 12,
          overflow: "hidden",
          marginBottom: 28,
          background: "white",
        }}
      >
        <div style={{ padding: "14px 20px", background: `linear-gradient(90deg, ${ACCENT}08, transparent)`, borderRight: `1px solid ${BORDER}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: ACCENT, marginBottom: 4 }}>
            THÈME
          </div>
          <div style={{ fontSize: 14, fontWeight: 500, color: "#0A0B0E" }}>{WEEK.theme}</div>
        </div>
        {STATS.map((s, i) => (
          <div
            key={s.label}
            style={{ padding: "14px 16px", borderRight: i < STATS.length - 1 ? `1px solid ${BORDER}` : "none" }}
          >
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, color: TEXT_MUTED, marginBottom: 4 }}>
              {s.label}
            </div>
            <div style={{ fontSize: 20, fontWeight: 600, fontFamily: "ui-monospace, monospace", color: "#0A0B0E" }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <TabsBar />
    </div>
  );
}

/* --------------- VARIANTE C --------------- */
function SplitAsym() {
  return (
    <div style={{ padding: "32px 40px" }}>
      {/* Actions top right */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 24 }}>
        <button style={pillBtn()}><Plus size={13} /> Évènement custom</button>
        <button style={pillBtnPrimary()}><CheckSquare size={13} /> Valider la semaine</button>
      </div>

      {/* Split content */}
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 32, marginBottom: 32 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <WeekSelectorMini />
            <span style={badgeGreen()}>EN COURS</span>
          </div>
          <h1 style={{ fontSize: 44, fontWeight: 300, lineHeight: 1.05, fontFamily: "Georgia, serif", marginBottom: 8, letterSpacing: -0.4 }}>
            Préparation de la semaine
          </h1>
          <p style={{ fontSize: 14, color: TEXT_SECONDARY, margin: 0 }}>
            {WEEK.range}
          </p>
        </div>

        {/* Theme card large */}
        <div
          style={{
            background: `linear-gradient(135deg, ${ACCENT} 0%, #9C7AFF 100%)`,
            borderRadius: 16,
            padding: "22px 24px",
            color: "white",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", top: -20, right: -20, opacity: 0.15 }}>
            <Sparkles size={120} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, position: "relative" }}>
            <Flame size={14} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, opacity: 0.9 }}>
              THÈME MACRO DE LA SEMAINE
            </span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 500, lineHeight: 1.25, position: "relative" }}>
            {WEEK.theme}
          </div>
          <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 6, fontSize: 12, opacity: 0.9, position: "relative" }}>
            <TrendingUp size={13} />
            2 thèses actives · 14 events
          </div>
        </div>
      </div>

      <TabsBar />
    </div>
  );
}

/* --------------- VARIANTE D --------------- */
function MinimalTimeline() {
  const days = [
    { day: "LUN", date: "20/04", events: 2, hasRed: false },
    { day: "MAR", date: "21/04", events: 3, hasRed: true },
    { day: "MER", date: "22/04", events: 4, hasRed: true },
    { day: "JEU", date: "23/04", events: 4, hasRed: true },
    { day: "VEN", date: "24/04", events: 1, hasRed: false },
  ];
  return (
    <div style={{ padding: "32px 48px" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: TEXT_MUTED, marginBottom: 20, fontWeight: 500, letterSpacing: 0.5 }}>
        <span>2026</span>
        <ChevronRight size={12} />
        <span>AVRIL</span>
        <ChevronRight size={12} />
        <span style={{ color: "#0A0B0E", fontWeight: 600 }}>SEMAINE {WEEK.weekNumber}</span>
        <span style={badgeGreen({ marginLeft: 8 })}>EN COURS</span>

        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button style={pillBtn()}><Plus size={13} /> Évènement custom</button>
          <button style={pillBtnPrimary()}><CheckSquare size={13} /> Valider</button>
        </div>
      </div>

      {/* Giant title */}
      <h1 style={{ fontSize: 64, fontWeight: 300, lineHeight: 1, fontFamily: "Georgia, serif", marginBottom: 10, letterSpacing: -1 }}>
        Préparation
      </h1>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4, fontSize: 15, color: TEXT_SECONDARY }}>
        <span>{WEEK.range}</span>
        <span style={{ color: BORDER }}>·</span>
        <em style={{ color: ACCENT, fontWeight: 500 }}>{WEEK.theme}</em>
      </div>

      {/* Timeline mini */}
      <div
        style={{
          marginTop: 28,
          marginBottom: 0,
          padding: "16px 20px",
          background: BG_ELEVATED,
          borderRadius: 12,
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 12,
        }}
      >
        {days.map((d, i) => (
          <div
            key={d.day}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              padding: "10px 12px",
              background: "white",
              borderRadius: 8,
              border: `1px solid ${BORDER_LIGHT}`,
              position: "relative",
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: TEXT_MUTED }}>
              {d.day}
            </div>
            <div style={{ fontSize: 18, fontWeight: 500, fontFamily: "ui-monospace, monospace", color: "#0A0B0E", margin: "2px 0 8px" }}>
              {d.date}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: TEXT_SECONDARY }}>
              <Calendar size={11} />
              <span>{d.events} events</span>
              {d.hasRed && (
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF2E63", marginLeft: 2 }} />
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 32 }}>
        <TabsBar />
      </div>
    </div>
  );
}

/* --------------- SHARED SUB-COMPONENTS --------------- */
function WeekSelectorMini() {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        border: `1px solid ${BORDER}`,
        borderRadius: 8,
        background: "white",
        overflow: "hidden",
      }}
    >
      <button style={{ padding: "6px 8px", borderRight: `1px solid ${BORDER_LIGHT}`, background: "transparent", border: 0, cursor: "pointer" }}>
        <ChevronLeft size={14} />
      </button>
      <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", fontSize: 12, fontWeight: 600, fontFamily: "ui-monospace, monospace", background: "transparent", border: 0, cursor: "pointer" }}>
        S{WEEK.weekNumber} <span style={{ color: TEXT_MUTED }}>·</span> {WEEK.year}
        <ChevronDown size={12} />
      </button>
      <button style={{ padding: "6px 8px", borderLeft: `1px solid ${BORDER_LIGHT}`, background: "transparent", border: 0, cursor: "pointer" }}>
        <ChevronRight size={14} />
      </button>
    </div>
  );
}

function TabsBar() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, borderBottom: `1px solid ${BORDER}`, marginTop: 32 }}>
      <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", fontSize: 13, fontWeight: 500, color: "#0A0B0E", background: "transparent", border: 0, borderBottom: `2px solid ${ACCENT}`, cursor: "pointer", marginBottom: -1 }}>
        <CalendarDays size={14} /> Préparation
      </button>
      <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", fontSize: 13, fontWeight: 500, color: TEXT_MUTED, background: "transparent", border: 0, cursor: "pointer" }}>
        <Rewind size={14} /> Fin de semaine
      </button>
    </div>
  );
}

function pillBtn(): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 14px",
    fontSize: 12,
    fontWeight: 600,
    background: "white",
    border: `1px solid ${BORDER}`,
    borderRadius: 8,
    color: "#0A0B0E",
    cursor: "pointer",
  };
}

function pillBtnPrimary(): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 14px",
    fontSize: 12,
    fontWeight: 600,
    background: "#0A0B0E",
    border: "1px solid #0A0B0E",
    borderRadius: 8,
    color: "white",
    cursor: "pointer",
  };
}

function badgeGreen(extra: React.CSSProperties = {}): React.CSSProperties {
  return {
    display: "inline-block",
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: 1.5,
    padding: "3px 8px",
    borderRadius: 4,
    background: GREEN_BG,
    color: GREEN,
    ...extra,
  };
}
