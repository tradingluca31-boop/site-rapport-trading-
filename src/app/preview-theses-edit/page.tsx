"use client";

import { useState } from "react";
import { BookOpen, CalendarDays, Clock, Pencil, Check, X as XIcon, RotateCcw, MoreHorizontal, Save } from "lucide-react";

const ACCENT = "#7C5CFF";
const ACCENT_LIGHT = "#F3F0FF";
const GOLD = "#C59E3A";
const GOLD_LIGHT = "#FBF5E7";

const TEXT_SHORT =
  "Le marche attend un CPI US core en-dessous de 3.0% pour valider la sequence de baisses FED. Un print hot relance DXY et pese sur Gold/EURUSD. Cote BCE, Lagarde doit confirmer la pause apres la baisse de mars — toute hawkish surprise soutient EURUSD.";
const TEXT_LONG =
  "Regime desinflation US en deceleration, zone de fin de cycle de baisses FED (2-3 cuts prices 2026). EUR structurellement soutenu par differentiel de croissance favorable et fin d'assouplissement BCE prevue H2 2026. Or tenu par achats BC + flux refuge sur tensions geopolitiques. Biais moyen terme : EUR/USD long sur repli 1.0850, Gold long sur pullback 2980, DXY short sur rebond 103.";

export default function PreviewThesesEditPage() {
  return (
    <div style={{ padding: "64px 48px", background: "#FAFAF9", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1440, margin: "0 auto" }}>
        <div style={{ marginBottom: 48 }}>
          <h1 style={{ fontSize: 36, fontWeight: 300, letterSpacing: "-0.02em", marginBottom: 8 }}>
            Preview — Edition theses macro
          </h1>
          <p style={{ color: "#6B7280", fontSize: 15 }}>
            4 variantes de boutons Modifier / Reset. Dis-moi laquelle tu veux.
          </p>
        </div>

        <Variant
          num="A"
          title="Pill outline (actuel)"
          note="Texte en capitales, bordure fine. Discret mais peut se confondre avec les chips (SEMAINE / Q2)."
        >
          <ThesisCardA text={TEXT_SHORT} label="COURT TERME" period="SEMAINE 17" accent={ACCENT} tint={ACCENT_LIGHT} icon={<CalendarDays size={13} />} hasReset />
          <ThesisCardA text={TEXT_LONG} label="LONG TERME" period="Q2 2026" accent={GOLD} tint={GOLD_LIGHT} icon={<Clock size={13} />} />
        </Variant>

        <Variant
          num="B"
          title="Icone crayon flottante"
          note="Bouton rond en haut a droite, icone seule. Le plus epuré, pas de texte qui concurrence les labels."
        >
          <ThesisCardB text={TEXT_SHORT} label="COURT TERME" period="SEMAINE 17" accent={ACCENT} tint={ACCENT_LIGHT} icon={<CalendarDays size={13} />} hasReset />
          <ThesisCardB text={TEXT_LONG} label="LONG TERME" period="Q2 2026" accent={GOLD} tint={GOLD_LIGHT} icon={<Clock size={13} />} />
        </Variant>

        <Variant
          num="C"
          title="CTA accent + icone reset"
          note="Bouton Modifier plein accent (visible), reset en icone fantome. Hierarchie claire."
        >
          <ThesisCardC text={TEXT_SHORT} label="COURT TERME" period="SEMAINE 17" accent={ACCENT} tint={ACCENT_LIGHT} icon={<CalendarDays size={13} />} hasReset />
          <ThesisCardC text={TEXT_LONG} label="LONG TERME" period="Q2 2026" accent={GOLD} tint={GOLD_LIGHT} icon={<Clock size={13} />} />
        </Variant>

        <Variant
          num="D"
          title="Menu ⋯ au survol de la carte"
          note="Bouton menu qui apparait au hover de la carte, ouvre un popover (Modifier / Reset). Zero pollution visuelle."
        >
          <ThesisCardD text={TEXT_SHORT} label="COURT TERME" period="SEMAINE 17" accent={ACCENT} tint={ACCENT_LIGHT} icon={<CalendarDays size={13} />} hasReset />
          <ThesisCardD text={TEXT_LONG} label="LONG TERME" period="Q2 2026" accent={GOLD} tint={GOLD_LIGHT} icon={<Clock size={13} />} />
        </Variant>
      </div>
    </div>
  );
}

function Variant({ num, title, note, children }: { num: string; title: string; note: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 64 }}>
      <div style={{ marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid #E5E7EB" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 2,
              background: "#111",
              color: "white",
              padding: "6px 10px",
              borderRadius: 6,
            }}
          >
            VARIANTE {num}
          </span>
          <h2 style={{ fontSize: 20, fontWeight: 500 }}>{title}</h2>
        </div>
        <p style={{ marginTop: 8, fontSize: 13, color: "#6B7280", maxWidth: 900 }}>{note}</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>{children}</div>
    </section>
  );
}

type CardProps = {
  text: string;
  label: string;
  period: string;
  accent: string;
  tint: string;
  icon: React.ReactNode;
  hasReset?: boolean;
};

function CardShell({
  accent,
  tint,
  children,
}: {
  accent: string;
  tint: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="group"
      style={{
        position: "relative",
        borderRadius: 16,
        overflow: "hidden",
        background: `linear-gradient(145deg, ${tint} 0%, ${tint} 40%, transparent 100%)`,
        border: "1px solid rgba(0,0,0,0.06)",
        padding: "44px 48px 48px 60px",
        minHeight: 320,
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 6, background: accent }} />
      {children}
    </div>
  );
}

function Header({ label, period, accent, icon }: { label: string; period: string; accent: string; icon: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 2.5,
          textTransform: "uppercase",
          padding: "8px 14px",
          borderRadius: 6,
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: accent,
          color: "white",
        }}
      >
        {icon}
        {label}
      </span>
      <span
        style={{
          fontSize: 11,
          fontFamily: "monospace",
          textTransform: "uppercase",
          letterSpacing: 1,
          padding: "4px 10px",
          borderRadius: 4,
          color: accent,
          background: "white",
          border: `1px solid ${accent}20`,
        }}
      >
        {period}
      </span>
    </div>
  );
}

function Quote({ text, accent }: { text: string; accent: string }) {
  return (
    <div style={{ position: "relative", marginTop: 32 }}>
      <span
        style={{
          position: "absolute",
          left: -36,
          top: -20,
          fontSize: 60,
          color: accent,
          opacity: 0.25,
          lineHeight: 1,
          fontFamily: "Georgia, serif",
        }}
      >
        &ldquo;
      </span>
      <p style={{ fontSize: 16, lineHeight: 1.85, color: "#0B0B0D", fontFamily: "Georgia, serif" }}>{text}</p>
    </div>
  );
}

// ──────────── Variant A : Pill outline (current)
function ThesisCardA({ text, label, period, accent, tint, icon, hasReset }: CardProps) {
  return (
    <CardShell accent={accent} tint={tint}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Header label={label} period={period} accent={accent} icon={icon} />
        <div style={{ display: "flex", gap: 8 }}>
          {hasReset && (
            <button
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: 1.2,
                textTransform: "uppercase",
                padding: "4px 8px",
                borderRadius: 4,
                color: "#6B7280",
                background: "white",
                border: "1px solid rgba(0,0,0,0.1)",
              }}
            >
              Reset
            </button>
          )}
          <button
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              padding: "4px 10px",
              borderRadius: 4,
              color: accent,
              background: "white",
              border: `1px solid ${accent}40`,
            }}
          >
            Modifier
          </button>
        </div>
      </div>
      <Quote text={text} accent={accent} />
    </CardShell>
  );
}

// ──────────── Variant B : Icon crayon flottante
function ThesisCardB({ text, label, period, accent, tint, icon, hasReset }: CardProps) {
  return (
    <CardShell accent={accent} tint={tint}>
      <Header label={label} period={period} accent={accent} icon={icon} />
      <div
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          display: "flex",
          gap: 6,
        }}
      >
        {hasReset && (
          <button
            title="Restaurer le texte par defaut"
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "white",
              border: "1px solid rgba(0,0,0,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6B7280",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
            }}
          >
            <RotateCcw size={14} />
          </button>
        )}
        <button
          title="Modifier"
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "white",
            border: `1px solid ${accent}30`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: accent,
            boxShadow: `0 2px 6px ${accent}20`,
          }}
        >
          <Pencil size={14} />
        </button>
      </div>
      <Quote text={text} accent={accent} />
    </CardShell>
  );
}

// ──────────── Variant C : CTA plein + reset ghost
function ThesisCardC({ text, label, period, accent, tint, icon, hasReset }: CardProps) {
  return (
    <CardShell accent={accent} tint={tint}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Header label={label} period={period} accent={accent} icon={icon} />
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {hasReset && (
            <button
              title="Reset"
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: "transparent",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#9CA3AF",
              }}
            >
              <RotateCcw size={14} />
            </button>
          )}
          <button
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              fontWeight: 600,
              padding: "7px 14px",
              borderRadius: 8,
              background: accent,
              color: "white",
              border: "none",
              boxShadow: `0 2px 8px ${accent}40`,
            }}
          >
            <Pencil size={13} />
            Modifier
          </button>
        </div>
      </div>
      <Quote text={text} accent={accent} />
    </CardShell>
  );
}

// ──────────── Variant D : Menu ⋯ au hover
function ThesisCardD({ text, label, period, accent, tint, icon, hasReset }: CardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <CardShell accent={accent} tint={tint}>
      <Header label={label} period={period} accent={accent} icon={icon} />
      <div style={{ position: "absolute", top: 16, right: 16 }}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          title="Actions"
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: menuOpen ? accent : "transparent",
            border: menuOpen ? "none" : "1px solid transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: menuOpen ? "white" : "#6B7280",
            transition: "all 0.15s",
          }}
          className="hover:bg-white hover:border-black/10"
        >
          <MoreHorizontal size={16} />
        </button>
        {menuOpen && (
          <div
            style={{
              position: "absolute",
              top: 40,
              right: 0,
              background: "white",
              borderRadius: 10,
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              border: "1px solid rgba(0,0,0,0.06)",
              padding: 4,
              minWidth: 160,
              zIndex: 10,
            }}
          >
            <MenuItem icon={<Pencil size={14} />} label="Modifier la these" />
            {hasReset && <MenuItem icon={<RotateCcw size={14} />} label="Restaurer defaut" muted />}
          </div>
        )}
      </div>
      <Quote text={text} accent={accent} />
    </CardShell>
  );
}

function MenuItem({ icon, label, muted }: { icon: React.ReactNode; label: string; muted?: boolean }) {
  return (
    <button
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        padding: "8px 12px",
        fontSize: 13,
        fontWeight: 500,
        color: muted ? "#6B7280" : "#111",
        background: "transparent",
        border: "none",
        borderRadius: 6,
        textAlign: "left",
        cursor: "pointer",
      }}
      className="hover:bg-gray-50"
    >
      {icon}
      {label}
    </button>
  );
}
