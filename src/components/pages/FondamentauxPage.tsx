"use client";

import { Flame, Snowflake, Minus, Newspaper } from "lucide-react";

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
  sources: string[];
  lastUpdate: string;
};

// Donnees exemple basees sur news investinglive du 22/04/2026
const BRIEF_DATE = "22 avril 2026";
const BRIEF_HEADLINE = "Cessez-le-feu etendu, blocus maintenu — les marches restent sur le qui-vive";
const BRIEF_INTRO = "Trump prolonge le cessez-le-feu Iran mais le blocus naval US continue, et Teheran a saisi deux cargos dans le detroit d'Ormuz. JPMorgan tourne selectivement bearish USD, ECB dovish pour avril, or rebondit a 4 765$. 11 actifs passes en revue ci-dessous.";

const ASSETS: AssetData[] = [
  {
    ticker: "USD", flag: "🇺🇸", name: "Dollar US", bias: "dovish", score: -2,
    monetary: "Fed neutre, pas de nouveau catalyst",
    macro: null,
    geo: "Cessez-le-feu Iran prolonge + blocus continue, US serre Iraq (-500M$)",
    sentiment: "JPMorgan selectivement bearish USD post-ceasefire",
    sources: ["JPMorgan", "ECB (Lane)"],
    lastUpdate: "14:30",
  },
  {
    ticker: "EUR", flag: "🇪🇺", name: "Euro", bias: "dovish", score: -2,
    monetary: "ECB Simkus + Kazaks dovish avril (pas de hausse)",
    macro: null,
    geo: null,
    sentiment: "68% proba hausse pour juin seulement",
    sources: ["ECB Simkus", "ECB Kazaks", "ECB Lane"],
    lastUpdate: "13:15",
  },
  {
    ticker: "GBP", flag: "🇬🇧", name: "Livre sterling", bias: "neutral", score: 0,
    monetary: null,
    macro: "CPI mars 3.3% conforme, core 3.1% (vs 3.2% att.)",
    geo: null,
    sentiment: "Services inflation +4.5% persistante",
    sources: ["UK ONS"],
    lastUpdate: "10:00",
  },
  {
    ticker: "JPY", flag: "🇯🇵", name: "Yen japonais", bias: "dovish", score: -3,
    monetary: "BoJ pas presse, JPMorgan bearish JPY",
    macro: "Exports +11.7% y/y mais surplus reduit a ¥667B",
    geo: null,
    sentiment: "Import costs compriment le yen",
    sources: ["BoJ", "JPMorgan", "MOF Japan"],
    lastUpdate: "08:00",
  },
  {
    ticker: "CHF", flag: "🇨🇭", name: "Franc suisse", bias: "ras",
    score: 0, monetary: null, macro: null, geo: null, sentiment: null,
    sources: [], lastUpdate: "—",
  },
  {
    ticker: "AUD", flag: "🇦🇺", name: "Dollar australien", bias: "dovish", score: -2,
    monetary: null,
    macro: "Leading index sous sa tendance (1ere fois depuis aout)",
    geo: null,
    sentiment: "JPMorgan long AUD paradoxalement (carry)",
    sources: ["Westpac", "JPMorgan"],
    lastUpdate: "06:30",
  },
  {
    ticker: "NZD", flag: "🇳🇿", name: "Dollar NZ", bias: "ras",
    score: 0, monetary: null, macro: null, geo: null, sentiment: null,
    sources: [], lastUpdate: "—",
  },
  {
    ticker: "CAD", flag: "🇨🇦", name: "Dollar canadien", bias: "neutral", score: 0,
    monetary: null,
    macro: null,
    geo: "USMCA review vu comme checkpoint, pas cliff",
    sentiment: "Tensions tarifs acier/autos/bois non resolues",
    sources: ["Gov. Canada"],
    lastUpdate: "11:45",
  },
  {
    ticker: "XAUUSD", flag: "🥇", name: "Or", bias: "hawkish", score: 3,
    monetary: null,
    macro: null,
    geo: "Rebond depuis 4 668$ vers 4 765$, detroit Hormuz ferme de facto",
    sentiment: "Optimisme prudent, news Iran driver principal",
    sources: ["Tasnim", "Reuters"],
    lastUpdate: "15:00",
  },
  {
    ticker: "XAGUSD", flag: "🥈", name: "Argent", bias: "ras",
    score: 0, monetary: null, macro: null, geo: null, sentiment: null,
    sources: [], lastUpdate: "—",
  },
  {
    ticker: "USOIL", flag: "🛢️", name: "Petrole WTI", bias: "neutral", score: 1,
    monetary: null,
    macro: null,
    geo: "Volatilite extreme 78-93$, crackdown maritime en ocean Indien",
    sentiment: "Jones Act waiver prolonge (+70% shipping domestique)",
    sources: ["Trump tweet", "JPMorgan", "Reuters"],
    lastUpdate: "14:50",
  },
];

const GREEN = "#08D9D6";
const RED = "#FF2E63";
const ACCENT = "#7C5CFF";

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

export default function FondamentauxPage() {
  return (
    <div className="page-root" style={{ padding: "32px 28px", minHeight: "100vh", background: "var(--bg-page, #FAFAF9)" }}>
      <div style={{ maxWidth: 840, margin: "0 auto" }}>
        <header style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: "#6B7280", marginBottom: 6 }}>
            RAPPORT FONDAMENTAL
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 300, letterSpacing: "-0.01em", fontFamily: "var(--font-display, Georgia, serif)", color: "#111" }}>
            {BRIEF_DATE}
          </h1>
        </header>

        <div style={{ background: "white", borderRadius: 14, border: "1px solid #E5E7EB", padding: "36px 40px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, color: ACCENT }}>
            <Newspaper size={16} />
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 3 }}>DAILY MACRO BRIEF</span>
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 300, fontFamily: "Georgia, serif", lineHeight: 1.2, marginBottom: 14, color: "#111" }}>
            {BRIEF_HEADLINE}
          </h2>
          <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, fontFamily: "Georgia, serif", marginBottom: 28 }}>
            {BRIEF_INTRO}
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
      </div>
    </div>
  );
}
