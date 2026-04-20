"use client";

import {
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  FileText,
  Lightbulb,
  Target,
  Newspaper,
  Sunrise,
  Sun,
  Moon,
  BookOpenCheck,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Circle,
} from "lucide-react";

const ACCENT = "#7C5CFF";
const GREEN = "#08D9D6";
const RED = "#FF2E63";
const GOLD = "#C59E3A";

/* ─────────── Donnees mock ─────────── */

const FONDA = [
  {
    time: "09:15",
    title: "CPI US core 3.1% vs 3.0% attendu",
    summary:
      "Print hot — marche prix 0 baisse FED en mai. DXY +0.4%, Gold -15$. Bias: short EURUSD, short Gold intraday.",
    sentiment: "hawkish",
  },
  {
    time: "11:00",
    title: "Lagarde BCE : pause confirmee",
    summary:
      "Ton plutot neutre, refuse de commenter mars. Marche lit dovish. EURUSD +30 pips apres les commentaires.",
    sentiment: "dovish",
  },
  {
    time: "14:30",
    title: "Jobless Claims 215k vs 220k",
    summary:
      "Marche du travail resiste. Renforce thesis FED pause longue. US10Y +4bp.",
    sentiment: "hawkish",
  },
];

const TRADES = [
  {
    time: "10:42",
    pair: "XAUUSD",
    direction: "short",
    entry: 3015,
    sl: 3024,
    tp: 2992,
    size: "0.8 lot",
    status: "open",
    idea: "Rejet 3020 apres CPI hot, structure H1 bearish.",
  },
  {
    time: "15:10",
    pair: "EURUSD",
    direction: "long",
    entry: 1.0872,
    sl: 1.0850,
    tp: 1.0920,
    size: "1.2 lot",
    status: "closed-win",
    pnl: "+$340",
    idea: "Retest 1.0875 apres Lagarde, divergence RSI H1.",
  },
  {
    time: "16:55",
    pair: "GBPUSD",
    direction: "short",
    entry: 1.267,
    sl: 1.2695,
    tp: 1.262,
    size: "0.5 lot",
    status: "closed-loss",
    pnl: "-$125",
    idea: "Cassure 1.268, stop trop pres.",
  },
];

const IDEES = [
  "Si DXY casse 104.50 → long USDJPY sur retest 150.20.",
  "Watchlist demain : NFP vendredi, reduire exposition jeudi soir.",
  "Idee perso : trader uniquement les setups post-news (moins de chop).",
];

/* ─────────── Page ─────────── */

export default function PreviewRapportV2() {
  return (
    <div style={{ padding: "56px 40px", background: "#FAFAF9", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1440, margin: "0 auto" }}>
        <header style={{ marginBottom: 56 }}>
          <h1 style={{ fontSize: 36, fontWeight: 300, letterSpacing: "-0.02em" }}>
            Preview — Page /rapport (journal de journee)
          </h1>
          <p style={{ color: "#6B7280", fontSize: 15, marginTop: 8 }}>
            4 variantes pour afficher fonda du jour + trades pris + idees. Dis-moi laquelle.
          </p>
        </header>

        <Variant num="A" title="Timeline verticale (journal chronologique)" note="Tout dans l'ordre du temps. Tres lisible pour retracer la journee. Bon pour revoir ses decisions en contexte.">
          <VariantA />
        </Variant>

        <Variant num="B" title="Dashboard 3 colonnes (fonda | trades | idees)" note="Separation nette. Rapide pour comparer, parfait si tu veux voir l'etat global d'un coup d'oeil.">
          <VariantB />
        </Variant>

        <Variant num="C" title="Kanban par session (Asie | Londres | US)" note="Organise par session de marche. Pertinent si ta journee suit vraiment les sessions.">
          <VariantC />
        </Variant>

        <Variant num="D" title="Feed magazine (cards editoriales)" note="Style blog/magazine. Chaque element est une grosse card. Premium, lisible, un peu plus long a scroller.">
          <VariantD />
        </Variant>
      </div>
    </div>
  );
}

function Variant({ num, title, note, children }: { num: string; title: string; note: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 80 }}>
      <div style={{ marginBottom: 24, paddingBottom: 12, borderBottom: "1px solid #E5E7EB" }}>
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
          <h2 style={{ fontSize: 22, fontWeight: 500 }}>{title}</h2>
        </div>
        <p style={{ marginTop: 8, fontSize: 13, color: "#6B7280", maxWidth: 900 }}>{note}</p>
      </div>
      {children}
    </section>
  );
}

/* ─────────── Variant A : Timeline verticale ─────────── */

function VariantA() {
  const allEvents = [
    ...FONDA.map((f) => ({ ...f, kind: "fonda" as const })),
    ...TRADES.map((t) => ({ ...t, kind: "trade" as const })),
  ].sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 32 }}>
      <div style={{ background: "white", borderRadius: 16, border: "1px solid #E5E7EB", padding: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: ACCENT }} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#6B7280" }}>
            LUNDI 20 AVRIL 2026 — JOURNAL DE SESSION
          </span>
        </div>

        <div style={{ position: "relative", paddingLeft: 40 }}>
          <div style={{ position: "absolute", left: 11, top: 8, bottom: 8, width: 2, background: "#E5E7EB" }} />
          {allEvents.map((e, i) => (
            <TimelineItem key={i} event={e} />
          ))}
        </div>
      </div>

      <aside>
        <div style={{ background: "white", borderRadius: 16, border: "1px solid #E5E7EB", padding: 24, marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#6B7280", marginBottom: 12 }}>
            P&L DU JOUR
          </div>
          <div style={{ fontSize: 32, fontWeight: 600, color: GREEN, fontFamily: "var(--font-mono, monospace)" }}>
            +$215
          </div>
          <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>2 trades gagnants · 1 perdant</div>
        </div>
        <div style={{ background: "white", borderRadius: 16, border: "1px solid #E5E7EB", padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Lightbulb size={14} style={{ color: GOLD }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#6B7280" }}>IDEES / WATCHLIST</span>
          </div>
          {IDEES.map((idea, i) => (
            <div
              key={i}
              style={{ fontSize: 13, color: "#374151", padding: "10px 0", borderTop: i > 0 ? "1px solid #F3F4F6" : "none", lineHeight: 1.5 }}
            >
              {idea}
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

function TimelineItem({ event }: { event: { kind: "fonda" | "trade" } & Record<string, unknown> }) {
  const isFonda = event.kind === "fonda";
  const color = isFonda ? (event.sentiment === "hawkish" ? RED : event.sentiment === "dovish" ? GREEN : "#6B7280") : ACCENT;
  return (
    <div style={{ position: "relative", marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid #F3F4F6" }}>
      <div
        style={{
          position: "absolute",
          left: -35,
          top: 4,
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "white",
          border: `2px solid ${color}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <span style={{ fontFamily: "monospace", fontSize: 12, color: "#6B7280", fontWeight: 600 }}>{event.time as string}</span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: 1.5,
            padding: "3px 7px",
            borderRadius: 4,
            background: isFonda ? "#F3F4F6" : `${ACCENT}15`,
            color: isFonda ? "#6B7280" : ACCENT,
          }}
        >
          {isFonda ? "FONDA" : "TRADE"}
        </span>
      </div>
      {isFonda ? (
        <>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{event.title as string}</div>
          <div style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.6 }}>{event.summary as string}</div>
        </>
      ) : (
        <TradeLine trade={event as unknown as (typeof TRADES)[number]} />
      )}
    </div>
  );
}

function TradeLine({ trade }: { trade: (typeof TRADES)[number] }) {
  const isLong = trade.direction === "long";
  const statusColor =
    trade.status === "closed-win" ? GREEN : trade.status === "closed-loss" ? RED : "#6B7280";
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <span style={{ fontSize: 15, fontWeight: 700 }}>{trade.pair}</span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 800,
            padding: "3px 8px",
            borderRadius: 4,
            background: isLong ? `${GREEN}20` : `${RED}20`,
            color: isLong ? GREEN : RED,
            letterSpacing: 1,
          }}
        >
          {isLong ? "LONG" : "SHORT"}
        </span>
        {trade.pnl && (
          <span style={{ fontSize: 13, fontWeight: 700, color: statusColor, fontFamily: "monospace" }}>
            {trade.pnl}
          </span>
        )}
        {trade.status === "open" && (
          <span style={{ fontSize: 10, fontWeight: 700, color: "#6B7280", padding: "3px 7px", border: "1px solid #E5E7EB", borderRadius: 4 }}>
            EN COURS
          </span>
        )}
      </div>
      <div style={{ fontSize: 12, color: "#6B7280", fontFamily: "monospace", marginBottom: 6 }}>
        Entry {trade.entry} · SL {trade.sl} · TP {trade.tp} · {trade.size}
      </div>
      <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.5, fontStyle: "italic" }}>
        &ldquo;{trade.idea}&rdquo;
      </div>
    </div>
  );
}

/* ─────────── Variant B : 3 colonnes ─────────── */

function VariantB() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
      <Column icon={<Newspaper size={15} />} title="FONDA DU JOUR" accent={ACCENT}>
        {FONDA.map((f, i) => (
          <div key={i} style={{ padding: "14px 0", borderTop: i > 0 ? "1px solid #F3F4F6" : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ fontFamily: "monospace", fontSize: 11, color: "#9CA3AF" }}>{f.time}</span>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 800,
                  padding: "2px 6px",
                  borderRadius: 3,
                  background: f.sentiment === "hawkish" ? `${RED}15` : `${GREEN}15`,
                  color: f.sentiment === "hawkish" ? RED : GREEN,
                  letterSpacing: 1,
                }}
              >
                {f.sentiment.toUpperCase()}
              </span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{f.title}</div>
            <div style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.5 }}>{f.summary}</div>
          </div>
        ))}
      </Column>
      <Column icon={<Target size={15} />} title="TRADES" accent={GREEN}>
        {TRADES.map((t, i) => (
          <div key={i} style={{ padding: "14px 0", borderTop: i > 0 ? "1px solid #F3F4F6" : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ fontFamily: "monospace", fontSize: 11, color: "#9CA3AF" }}>{t.time}</span>
              <span style={{ fontSize: 13, fontWeight: 700 }}>{t.pair}</span>
              {t.direction === "long" ? <ArrowUpRight size={13} color={GREEN} /> : <ArrowDownRight size={13} color={RED} />}
              {t.pnl && (
                <span style={{ fontSize: 12, fontWeight: 700, color: t.pnl.startsWith("+") ? GREEN : RED, fontFamily: "monospace", marginLeft: "auto" }}>
                  {t.pnl}
                </span>
              )}
            </div>
            <div style={{ fontSize: 11, color: "#9CA3AF", fontFamily: "monospace", marginBottom: 4 }}>
              {t.entry} → TP {t.tp}
            </div>
            <div style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.5, fontStyle: "italic" }}>{t.idea}</div>
          </div>
        ))}
      </Column>
      <Column icon={<Lightbulb size={15} />} title="IDEES / NOTES" accent={GOLD}>
        {IDEES.map((idea, i) => (
          <div key={i} style={{ padding: "12px 0", borderTop: i > 0 ? "1px solid #F3F4F6" : "none", fontSize: 13, color: "#374151", lineHeight: 1.6, display: "flex", gap: 8 }}>
            <Circle size={6} fill={GOLD} color={GOLD} style={{ marginTop: 7, flexShrink: 0 }} />
            <span>{idea}</span>
          </div>
        ))}
        <button
          style={{
            marginTop: 12,
            width: "100%",
            padding: "10px",
            borderRadius: 8,
            border: "1px dashed #D1D5DB",
            background: "transparent",
            color: "#6B7280",
            fontSize: 12,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            cursor: "pointer",
          }}
        >
          <Plus size={13} /> Ajouter une idee
        </button>
      </Column>
    </div>
  );
}

function Column({ icon, title, accent, children }: { icon: React.ReactNode; title: string; accent: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "white", borderRadius: 16, border: "1px solid #E5E7EB", padding: 24, minHeight: 520 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, paddingBottom: 12, borderBottom: `2px solid ${accent}` }}>
        <div style={{ color: accent }}>{icon}</div>
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: "#111" }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

/* ─────────── Variant C : Kanban sessions ─────────── */

function VariantC() {
  const sessions = [
    {
      label: "ASIE / MATIN",
      icon: <Sunrise size={14} />,
      accent: "#F59E0B",
      items: [
        { kind: "fonda", title: "CPI US core 3.1%", subtitle: "09:15 · hawkish", tag: "FONDA" },
      ],
    },
    {
      label: "LONDRES",
      icon: <Sun size={14} />,
      accent: ACCENT,
      items: [
        { kind: "trade", title: "XAUUSD SHORT @ 3015", subtitle: "10:42 · en cours", tag: "TRADE" },
        { kind: "fonda", title: "Lagarde BCE pause", subtitle: "11:00 · dovish", tag: "FONDA" },
      ],
    },
    {
      label: "US",
      icon: <Sun size={14} />,
      accent: GREEN,
      items: [
        { kind: "fonda", title: "Jobless Claims 215k", subtitle: "14:30 · hawkish", tag: "FONDA" },
        { kind: "trade", title: "EURUSD LONG +$340", subtitle: "15:10 · WIN", tag: "TRADE" },
        { kind: "trade", title: "GBPUSD SHORT -$125", subtitle: "16:55 · LOSS", tag: "TRADE" },
      ],
    },
    {
      label: "SOIR / DEBRIEF",
      icon: <Moon size={14} />,
      accent: "#6366F1",
      items: IDEES.map((i) => ({ kind: "idea", title: i, subtitle: "", tag: "IDEE" })),
    },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
      {sessions.map((s, i) => (
        <div key={i} style={{ background: "white", borderRadius: 14, border: "1px solid #E5E7EB", padding: 16, minHeight: 480 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid #F3F4F6" }}>
            <div style={{ color: s.accent }}>{s.icon}</div>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: "#111" }}>{s.label}</span>
            <span style={{ marginLeft: "auto", fontSize: 10, color: "#9CA3AF", fontWeight: 600 }}>{s.items.length}</span>
          </div>
          {s.items.map((it, j) => (
            <div
              key={j}
              style={{
                background: "#FAFAF9",
                borderRadius: 8,
                padding: 10,
                marginBottom: 8,
                borderLeft: `3px solid ${s.accent}`,
              }}
            >
              <div style={{ fontSize: 9, fontWeight: 800, color: s.accent, letterSpacing: 1, marginBottom: 4 }}>{it.tag}</div>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: it.subtitle ? 3 : 0, lineHeight: 1.4 }}>{it.title}</div>
              {it.subtitle && <div style={{ fontSize: 10, color: "#9CA3AF" }}>{it.subtitle}</div>}
            </div>
          ))}
          <button
            style={{
              width: "100%",
              padding: "6px",
              marginTop: 4,
              fontSize: 10,
              color: "#9CA3AF",
              background: "transparent",
              border: "1px dashed #E5E7EB",
              borderRadius: 6,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              cursor: "pointer",
            }}
          >
            <Plus size={10} /> Ajouter
          </button>
        </div>
      ))}
    </div>
  );
}

/* ─────────── Variant D : Feed magazine ─────────── */

function VariantD() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: 28 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ background: "white", borderRadius: 20, border: "1px solid #E5E7EB", padding: 36, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${ACCENT}, ${GREEN})` }} />
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: "#6B7280", marginBottom: 12 }}>EDITO DU JOUR</div>
          <h3 style={{ fontSize: 28, fontWeight: 400, letterSpacing: "-0.01em", lineHeight: 1.3, marginBottom: 16, fontFamily: "Georgia, serif" }}>
            CPI hot a 3.1% renverse la narrative disinflation — le marche repositionne le calendrier FED
          </h3>
          <p style={{ fontSize: 15, color: "#374151", lineHeight: 1.8, fontFamily: "Georgia, serif" }}>
            Le print CPI US core a 3.1% (vs 3.0% attendu) a suffi pour effacer la probabilite d'une baisse FED en mai. DXY +0.4% sur la session, Gold -15$. Cote BCE, Lagarde a confirme la pause sans surprendre, EURUSD a rebondi mecaniquement sur les shorts debordes. La journee se solde par un P&L positif de +$215, avec une erreur d'execution sur GBPUSD (stop trop pres apres cassure 1.268) a capitaliser pour demain.
          </p>
        </div>

        <Section icon={<Newspaper size={16} />} title="FONDAMENTAL" accent={ACCENT}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            {FONDA.map((f, i) => (
              <div key={i} style={{ padding: 16, background: "#FAFAF9", borderRadius: 12, border: "1px solid #F3F4F6" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 10, fontFamily: "monospace", color: "#9CA3AF" }}>{f.time}</span>
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 800,
                      padding: "2px 6px",
                      borderRadius: 3,
                      background: f.sentiment === "hawkish" ? `${RED}15` : `${GREEN}15`,
                      color: f.sentiment === "hawkish" ? RED : GREEN,
                      letterSpacing: 1,
                    }}
                  >
                    {f.sentiment.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, lineHeight: 1.4 }}>{f.title}</div>
                <div style={{ fontSize: 11, color: "#6B7280", lineHeight: 1.5 }}>{f.summary}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section icon={<Target size={16} />} title="TRADES DU JOUR" accent={GREEN}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {TRADES.map((t, i) => (
              <TradeCardD key={i} trade={t} />
            ))}
          </div>
        </Section>
      </div>

      <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ background: `linear-gradient(135deg, ${GREEN}, #06B6B4)`, color: "white", borderRadius: 16, padding: 24 }}>
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, opacity: 0.8 }}>P&L DU JOUR</div>
          <div style={{ fontSize: 36, fontWeight: 700, marginTop: 4, fontFamily: "monospace" }}>+$215</div>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 6 }}>2 WIN · 1 LOSS · 1 en cours</div>
        </div>
        <div style={{ background: "white", borderRadius: 16, border: "1px solid #E5E7EB", padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Lightbulb size={14} style={{ color: GOLD }} />
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2 }}>IDEES</span>
          </div>
          {IDEES.map((idea, i) => (
            <div key={i} style={{ fontSize: 12, color: "#374151", padding: "10px 0", borderTop: i > 0 ? "1px solid #F3F4F6" : "none", lineHeight: 1.5 }}>
              {idea}
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

function Section({ icon, title, accent, children }: { icon: React.ReactNode; title: string; accent: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "white", borderRadius: 16, border: "1px solid #E5E7EB", padding: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <div style={{ color: accent }}>{icon}</div>
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2 }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function TradeCardD({ trade }: { trade: (typeof TRADES)[number] }) {
  const isLong = trade.direction === "long";
  const status = trade.status;
  const pnlColor = status === "closed-win" ? GREEN : status === "closed-loss" ? RED : "#6B7280";
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 12,
        border: "1px solid #F3F4F6",
        background: "#FAFAF9",
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        gap: 14,
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: isLong ? `${GREEN}15` : `${RED}15`,
          color: isLong ? GREEN : RED,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isLong ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
      </div>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
          <span style={{ fontSize: 14, fontWeight: 700 }}>{trade.pair}</span>
          <span style={{ fontSize: 10, fontFamily: "monospace", color: "#9CA3AF" }}>{trade.time}</span>
        </div>
        <div style={{ fontSize: 11, color: "#9CA3AF", fontFamily: "monospace", marginBottom: 4 }}>
          {trade.entry} · SL {trade.sl} · TP {trade.tp}
        </div>
        <div style={{ fontSize: 12, color: "#374151", fontStyle: "italic" }}>&ldquo;{trade.idea}&rdquo;</div>
      </div>
      <div style={{ textAlign: "right" }}>
        {trade.pnl && (
          <div style={{ fontSize: 16, fontWeight: 700, color: pnlColor, fontFamily: "monospace" }}>{trade.pnl}</div>
        )}
        {status === "open" && (
          <div style={{ fontSize: 10, fontWeight: 700, color: "#6B7280", padding: "3px 8px", border: "1px solid #E5E7EB", borderRadius: 4 }}>
            EN COURS
          </div>
        )}
      </div>
    </div>
  );
}
