"use client";

import { useState } from "react";
import { Flame, Snowflake, Minus, Newspaper, Globe2, LayoutGrid, Terminal, BookOpen } from "lucide-react";

type Bias = "hawkish" | "dovish" | "neutral" | "ras";

type AssetData = {
  ticker: string;
  flag: string;
  name: string;
  bias: Bias;
  score: number; // -5..+5
  monetary: string | null;
  macro: string | null;
  geo: string | null;
  sentiment: string | null;
  thesis: string[];
  sources: string[];
  lastUpdate: string;
};

// Donnees exemple basees sur news investinglive du 22/04/2026
const ASSETS: AssetData[] = [
  {
    ticker: "USD", flag: "🇺🇸", name: "Dollar US", bias: "dovish", score: -2,
    monetary: "Fed neutre, pas de nouveau catalyst",
    macro: null,
    geo: "Cessez-le-feu Iran prolonge + blocus continue, US serre Iraq (-500M$)",
    sentiment: "JPMorgan selectivement bearish USD post-ceasefire",
    thesis: [
      "JPMorgan favorise AUD/NZD/EM au detriment de l'USD",
      "Safe-haven USD perd de son attrait avec l'apaisement geopolitique",
      "Dollar reste dominant long-terme (Lane ECB reconnait)",
    ],
    sources: ["JPMorgan", "ECB (Lane)"],
    lastUpdate: "14:30",
  },
  {
    ticker: "EUR", flag: "🇪🇺", name: "Euro", bias: "dovish", score: -2,
    monetary: "ECB Simkus + Kazaks dovish avril (pas de hausse)",
    macro: null,
    geo: null,
    sentiment: "68% proba hausse pour juin seulement",
    thesis: [
      "ECB pas pressee (Kazaks) + inflation proche 2%",
      "Lane : EUR ne peut pas remplacer USD comme safe-haven",
      "Morgan Stanley : pause sur actions europeennes",
    ],
    sources: ["ECB Simkus", "ECB Kazaks", "ECB Lane", "Morgan Stanley"],
    lastUpdate: "13:15",
  },
  {
    ticker: "GBP", flag: "🇬🇧", name: "Livre sterling", bias: "neutral", score: 0,
    monetary: null,
    macro: "CPI mars 3.3% conforme, core 3.1% (vs 3.2% att.)",
    geo: null,
    sentiment: "Services inflation +4.5% persistante",
    thesis: [
      "Core softer que prevu → legerement dovish BoE",
      "Transport prices +4.7% y/y (carburant)",
      "Aucun catalyst fort a court terme",
    ],
    sources: ["UK ONS"],
    lastUpdate: "10:00",
  },
  {
    ticker: "JPY", flag: "🇯🇵", name: "Yen japonais", bias: "dovish", score: -3,
    monetary: "BoJ pas presse, JPMorgan bearish JPY",
    macro: "Exports +11.7% y/y mais surplus reduit a ¥667B",
    geo: null,
    sentiment: "Import costs compriment le yen",
    thesis: [
      "Couts energetiques elevent les imports",
      "Surplus en compression → pression baissiere JPY",
      "Nikkei all-time high (decorrelation avec yen)",
    ],
    sources: ["BoJ", "JPMorgan", "MOF Japan"],
    lastUpdate: "08:00",
  },
  {
    ticker: "CHF", flag: "🇨🇭", name: "Franc suisse", bias: "ras",
    score: 0, monetary: null, macro: null, geo: null, sentiment: null,
    thesis: [], sources: [], lastUpdate: "—",
  },
  {
    ticker: "AUD", flag: "🇦🇺", name: "Dollar australien", bias: "dovish", score: -2,
    monetary: null,
    macro: "Leading index sous sa tendance (1ere fois depuis aout)",
    geo: null,
    sentiment: "JPMorgan long AUD paradoxalement",
    thesis: [
      "Ralentissement economique confirme",
      "Taux eleves + chocs energie pesent",
      "Mais JPMorgan privilegie AUD pour carry",
    ],
    sources: ["Westpac", "JPMorgan"],
    lastUpdate: "06:30",
  },
  {
    ticker: "NZD", flag: "🇳🇿", name: "Dollar NZ", bias: "ras",
    score: 0, monetary: null, macro: null, geo: null, sentiment: null,
    thesis: [], sources: [], lastUpdate: "—",
  },
  {
    ticker: "CAD", flag: "🇨🇦", name: "Dollar canadien", bias: "neutral", score: 0,
    monetary: null,
    macro: null,
    geo: "USMCA review vu comme checkpoint, pas cliff",
    sentiment: "Tensions tarifs acier/autos/bois non resolues",
    thesis: [
      "Flexibilite Canada stabilise sentiment commercial",
      "Pression sectorielle maintient volatilite CAD",
    ],
    sources: ["Gov. Canada"],
    lastUpdate: "11:45",
  },
  {
    ticker: "XAUUSD", flag: "🥇", name: "Or", bias: "hawkish", score: 3,
    monetary: null,
    macro: null,
    geo: "Rebond depuis 4 668$ vers 4 765$, detroit Hormuz ferme de facto",
    sentiment: "Optimisme prudent, news Iran driver principal",
    thesis: [
      "Iran refuse cessez-le-feu → catalyst haussier",
      "Saisie 2 cargos (MSC Francesca + Epaminondas)",
      "Resistance 4800, support 4650",
    ],
    sources: ["Tasnim", "Reuters"],
    lastUpdate: "15:00",
  },
  {
    ticker: "XAGUSD", flag: "🥈", name: "Argent", bias: "ras",
    score: 0, monetary: null, macro: null, geo: null, sentiment: null,
    thesis: [], sources: [], lastUpdate: "—",
  },
  {
    ticker: "USOIL", flag: "🛢️", name: "Petrole WTI", bias: "neutral", score: 1,
    monetary: null,
    macro: null,
    geo: "Volatilite extreme 78-93$, crackdown maritime en ocean Indien",
    sentiment: "Trump : Jones Act waiver prolonge (+70% shipping domestique)",
    thesis: [
      "Iran refuse talks → hausse, puis consolidation sur ceasefire ext.",
      "30+ pays planifient reouverture Hormuz militairement (Londres)",
      "Resistance 93$, support 78$",
    ],
    sources: ["Trump tweet", "JPMorgan", "Reuters"],
    lastUpdate: "14:50",
  },
];

const GREEN = "#08D9D6";
const RED = "#FF2E63";
const ACCENT = "#7C5CFF";
const GOLD = "#C59E3A";

type Variant = "matrix" | "cards" | "terminal" | "brief";

export default function FondamentauxPage() {
  const [variant, setVariant] = useState<Variant>("matrix");

  return (
    <div className="page-root" style={{ padding: "32px 28px", minHeight: "100vh", background: "var(--bg-page, #FAFAF9)" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <header style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: "#6B7280", marginBottom: 6 }}>
            RAPPORT FONDAMENTAL · 22 AVRIL 2026
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 300, letterSpacing: "-0.01em", fontFamily: "var(--font-display, Georgia, serif)", color: "#111" }}>
            Biais devises & matieres premieres
          </h1>
          <div style={{ fontSize: 13, color: "#6B7280", marginTop: 6 }}>
            4 variantes d&apos;affichage — choisis celle qui te parle et dis-moi laquelle garder.
          </div>
        </header>

        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {[
            { id: "matrix" as Variant, label: "A · Sentiment Matrix", icon: <LayoutGrid size={14} /> },
            { id: "cards" as Variant, label: "B · Sentiment Cards", icon: <Globe2 size={14} /> },
            { id: "terminal" as Variant, label: "C · Terminal Pro", icon: <Terminal size={14} /> },
            { id: "brief" as Variant, label: "D · Daily Brief", icon: <BookOpen size={14} /> },
          ].map((t) => {
            const isActive = variant === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setVariant(t.id)}
                style={{
                  padding: "8px 14px",
                  fontSize: 12,
                  fontWeight: 700,
                  borderRadius: 10,
                  background: isActive ? ACCENT : "white",
                  border: `1px solid ${isActive ? ACCENT : "#E5E7EB"}`,
                  color: isActive ? "white" : "#111",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  boxShadow: isActive ? `0 2px 8px ${ACCENT}40` : "none",
                }}
              >
                {t.icon}
                {t.label}
              </button>
            );
          })}
        </div>

        {variant === "matrix" && <VariantMatrix />}
        {variant === "cards" && <VariantCards />}
        {variant === "terminal" && <VariantTerminal />}
        {variant === "brief" && <VariantBrief />}
      </div>
    </div>
  );
}

function biasColor(b: Bias): string {
  if (b === "hawkish") return GREEN;
  if (b === "dovish") return RED;
  if (b === "neutral") return "#6B7280";
  return "#E5E7EB";
}

function biasIcon(b: Bias) {
  if (b === "hawkish") return <Flame size={12} />;
  if (b === "dovish") return <Snowflake size={12} />;
  if (b === "neutral") return <Minus size={12} />;
  return null;
}

function biasLabel(b: Bias): string {
  if (b === "hawkish") return "HAWK";
  if (b === "dovish") return "DOVE";
  if (b === "neutral") return "NEUT";
  return "RAS";
}

/* ============ A. MATRIX ============ */
function VariantMatrix() {
  return (
    <div style={{ background: "white", borderRadius: 14, border: "1px solid #E5E7EB", overflow: "hidden" }}>
      <div style={{ padding: "14px 18px", borderBottom: "1px solid #F3F4F6", fontSize: 11, fontWeight: 800, letterSpacing: 2, color: "#6B7280" }}>
        SENTIMENT MATRIX · 11 ACTIFS × 4 DIMENSIONS
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ background: "#FAFAF9" }}>
              <th style={thMatrix}>Actif</th>
              <th style={thMatrix}>Biais global</th>
              <th style={thMatrix}>🏦 Politique monetaire</th>
              <th style={thMatrix}>📊 Macro data</th>
              <th style={thMatrix}>🌍 Geopolitique</th>
              <th style={thMatrix}>💬 Sentiment / flows</th>
            </tr>
          </thead>
          <tbody>
            {ASSETS.map((a) => (
              <tr key={a.ticker} style={{ borderBottom: "1px solid #F3F4F6" }}>
                <td style={{ ...tdMatrix, fontWeight: 700 }}>
                  <span style={{ marginRight: 6 }}>{a.flag}</span>{a.ticker}
                </td>
                <td style={tdMatrix}>
                  <span style={biasPill(a.bias)}>
                    {biasIcon(a.bias)}
                    <span>{biasLabel(a.bias)}</span>
                  </span>
                </td>
                <Cell text={a.monetary} />
                <Cell text={a.macro} />
                <Cell text={a.geo} />
                <Cell text={a.sentiment} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Cell({ text }: { text: string | null }) {
  if (!text) {
    return <td style={{ ...tdMatrix, color: "#9CA3AF", fontStyle: "italic", fontSize: 11 }}>RAS</td>;
  }
  return <td style={{ ...tdMatrix, color: "#374151" }}>{text}</td>;
}

const thMatrix: React.CSSProperties = { padding: "10px 12px", textAlign: "left", fontSize: 10, fontWeight: 800, letterSpacing: 1, color: "#6B7280", borderBottom: "1px solid #E5E7EB" };
const tdMatrix: React.CSSProperties = { padding: "12px", verticalAlign: "top", fontSize: 12, lineHeight: 1.5 };

function biasPill(b: Bias): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "3px 8px",
    borderRadius: 6,
    background: `${biasColor(b)}18`,
    color: biasColor(b),
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: 0.5,
  };
}

/* ============ B. CARDS ============ */
function VariantCards() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
      {ASSETS.map((a) => {
        const ras = a.bias === "ras";
        return (
          <div
            key={a.ticker}
            style={{
              background: ras ? "#F9FAFB" : "white",
              borderRadius: 14,
              border: `1px solid ${ras ? "#F3F4F6" : biasColor(a.bias) + "40"}`,
              padding: 18,
              display: "flex",
              flexDirection: "column",
              gap: 10,
              minHeight: 220,
              opacity: ras ? 0.55 : 1,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 24 }}>{a.flag}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>{a.ticker}</div>
                <div style={{ fontSize: 10, color: "#6B7280", letterSpacing: 0.5 }}>{a.name}</div>
              </div>
              <span style={biasPill(a.bias)}>
                {biasIcon(a.bias)}
                <span>{biasLabel(a.bias)}</span>
              </span>
            </div>

            {ras ? (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: 32, fontWeight: 700, color: "#9CA3AF", fontFamily: "monospace" }}>RAS</div>
              </div>
            ) : (
              <>
                <Gauge score={a.score} />
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 5 }}>
                  {a.thesis.map((t, i) => (
                    <li key={i} style={{ fontSize: 12, color: "#374151", lineHeight: 1.45, display: "flex", gap: 6 }}>
                      <span style={{ color: biasColor(a.bias) }}>•</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: "auto", paddingTop: 8, borderTop: "1px solid #F3F4F6" }}>
                  {a.sources.map((s) => (
                    <span key={s} style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: "#F3F4F6", color: "#6B7280", fontWeight: 600 }}>{s}</span>
                  ))}
                  <span style={{ fontSize: 9, marginLeft: "auto", color: "#9CA3AF" }}>maj {a.lastUpdate}</span>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Gauge({ score }: { score: number }) {
  const pct = ((score + 5) / 10) * 100;
  const color = score > 0 ? GREEN : score < 0 ? RED : "#9CA3AF";
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#6B7280", marginBottom: 4 }}>
        <span>-5 DOVE</span>
        <span style={{ fontWeight: 700, color }}>{score > 0 ? "+" : ""}{score}</span>
        <span>+5 HAWK</span>
      </div>
      <div style={{ height: 6, background: "#F3F4F6", borderRadius: 3, position: "relative" }}>
        <div style={{ position: "absolute", top: 0, bottom: 0, left: `${pct}%`, width: 3, background: color, borderRadius: 2, transform: "translateX(-1.5px)" }} />
      </div>
    </div>
  );
}

/* ============ C. TERMINAL ============ */
function VariantTerminal() {
  return (
    <div style={{ background: "#05060A", borderRadius: 14, border: "1px solid #1F2937", overflow: "hidden", fontFamily: "monospace", color: "#D1D5DB" }}>
      <div style={{ padding: "12px 18px", borderBottom: "1px solid #1F2937", fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#7C5CFF", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span>LT-TERMINAL v1.0 · FUNDAMENTAL FLOW · 2026-04-22 15:00</span>
        <span style={{ color: "#10B981" }}>● LIVE</span>
      </div>
      <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 18 }}>
        {ASSETS.map((a) => {
          const ras = a.bias === "ras";
          const color = ras ? "#6B7280" : biasColor(a.bias);
          return (
            <div key={a.ticker} style={{ borderLeft: `3px solid ${color}`, paddingLeft: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13, marginBottom: ras ? 0 : 6 }}>
                <span style={{ color: "#FBBF24", fontWeight: 700 }}>▸ {a.ticker.padEnd(7, " ")}</span>
                <span style={{ color, fontWeight: 700, letterSpacing: 1, fontSize: 11 }}>| BIAS: {biasLabel(a.bias)}</span>
                {!ras && <span style={{ color: "#9CA3AF", fontSize: 11 }}>| SCORE: {a.score > 0 ? "+" : ""}{a.score}</span>}
                <span style={{ marginLeft: "auto", fontSize: 10, color: "#6B7280" }}>last: {a.lastUpdate}</span>
              </div>
              {ras ? (
                <div style={{ fontSize: 11, color: "#6B7280", fontStyle: "italic", paddingLeft: 0 }}>  RAS — rien a signaler</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 3, fontSize: 11, lineHeight: 1.5 }}>
                  {a.monetary && <TermLine tag="MON" color="#7C5CFF" text={a.monetary} />}
                  {a.macro && <TermLine tag="MAC" color="#F59E0B" text={a.macro} />}
                  {a.geo && <TermLine tag="GEO" color="#EF4444" text={a.geo} />}
                  {a.sentiment && <TermLine tag="SEN" color="#10B981" text={a.sentiment} />}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TermLine({ tag, color, text }: { tag: string; color: string; text: string }) {
  return (
    <div style={{ display: "flex", gap: 10 }}>
      <span style={{ color, fontWeight: 700, minWidth: 36 }}>[{tag}]</span>
      <span style={{ color: "#D1D5DB" }}>{text}</span>
    </div>
  );
}

/* ============ D. DAILY BRIEF ============ */
function VariantBrief() {
  return (
    <div style={{ background: "white", borderRadius: 14, border: "1px solid #E5E7EB", padding: "36px 40px", maxWidth: 820, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, color: ACCENT }}>
        <Newspaper size={16} />
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 3 }}>DAILY MACRO BRIEF</span>
      </div>
      <h2 style={{ fontSize: 28, fontWeight: 300, fontFamily: "Georgia, serif", lineHeight: 1.2, marginBottom: 14, color: "#111" }}>
        Cessez-le-feu etendu, blocus maintenu — les marches restent sur le qui-vive
      </h2>
      <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, fontFamily: "Georgia, serif", marginBottom: 28 }}>
        Trump prolonge le cessez-le-feu Iran mais le blocus naval US continue, et Teheran a saisi deux cargos dans le detroit d&apos;Ormuz. JPMorgan tourne selectivement bearish USD, ECB dovish pour avril, or rebondit a 4&nbsp;765$. 11 actifs passes en revue ci-dessous.
      </p>

      {ASSETS.map((a) => {
        const ras = a.bias === "ras";
        return (
          <section key={a.ticker} style={{ marginBottom: 28, paddingBottom: 24, borderBottom: "1px solid #F3F4F6" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 20 }}>{a.flag}</span>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: "#111", fontFamily: "Georgia, serif" }}>
                {a.name} <span style={{ color: "#9CA3AF", fontSize: 14, fontWeight: 400 }}>· {a.ticker}</span>
              </h3>
              <span style={{ ...biasPill(a.bias), marginLeft: "auto" }}>
                {biasIcon(a.bias)}
                <span>{biasLabel(a.bias)}</span>
              </span>
            </div>
            {ras ? (
              <p style={{ fontSize: 13, color: "#9CA3AF", fontStyle: "italic", fontFamily: "Georgia, serif" }}>
                Aucun catalyseur fondamental significatif aujourd&apos;hui — RAS.
              </p>
            ) : (
              <>
                {[a.monetary, a.macro, a.geo, a.sentiment].filter(Boolean).map((t, i) => (
                  <p key={i} style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, fontFamily: "Georgia, serif", marginBottom: 8 }}>
                    {t}
                  </p>
                ))}
                <div style={{ marginTop: 12, padding: "10px 14px", background: `${biasColor(a.bias)}08`, borderLeft: `3px solid ${biasColor(a.bias)}`, borderRadius: 4, display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, color: biasColor(a.bias) }}>→ BIAIS TRADING :</span>
                  <span style={{ fontSize: 13, color: "#111", fontWeight: 600 }}>
                    {a.bias === "hawkish" ? `LONG ${a.ticker} favori (score ${a.score > 0 ? "+" : ""}${a.score})` :
                     a.bias === "dovish" ? `SHORT ${a.ticker} favori (score ${a.score > 0 ? "+" : ""}${a.score})` :
                     "Flat, attendre confirmation"}
                  </span>
                </div>
                {a.sources.length > 0 && (
                  <div style={{ marginTop: 10, fontSize: 10, color: "#9CA3AF", fontStyle: "italic" }}>
                    Sources : {a.sources.join(" · ")} — maj {a.lastUpdate}
                  </div>
                )}
              </>
            )}
          </section>
        );
      })}
    </div>
  );
}
