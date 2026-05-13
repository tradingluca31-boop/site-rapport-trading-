"use client";

import { Check } from "lucide-react";

type LucaScenarioKind = "best" | "neutral" | "worst" | "tail";

const LUCA_COLORS: Record<LucaScenarioKind, { color: string; bg: string; label: string }> = {
  best:    { color: "var(--neutral-color)", bg: "var(--neutral-bg)", label: "STARMER RESTE" },
  neutral: { color: "var(--bear)",          bg: "var(--bear-bg)",    label: "DEMISSION DIFFEREE" },
  worst:   { color: "var(--bear)",          bg: "var(--bear-bg)",    label: "DEMISSION IMMEDIATE" },
  tail:    { color: "var(--bear)",          bg: "var(--bear-bg)",    label: "TAIL RISK CRISE" },
};

const WEEKLY_DOVISH = { color: "var(--bull)", bg: "var(--bull-bg)", label: "DOVISH" };
const WEEKLY_BASE = { color: "var(--neutral-color)", bg: "var(--neutral-bg)", label: "BASE" };
const WEEKLY_HAWKISH = { color: "var(--bear)", bg: "var(--bear-bg)", label: "HAWKISH" };

const SCENARIOS_UK = {
  best: {
    title: "Starmer survit fragilise (slow leak)",
    description:
      "PM tient bon, State Opening passe sans encombre. Cabinet reste hostile en arriere-plan, ministres briefent contre le PM, risque permanent de nouvelle tentative de demission dans les 6 mois. GBPUSD reste en range 1.32-1.36 indefiniment, volatility croissante a chaque vague de pression. Pas de crise, mais pas de confiance non plus.",
    probability: 50,
    instruments: ["GBPUSD", "GBPJPY", "GILTS"],
  },
  neutral: {
    title: "Demission differee style May (lame duck)",
    description:
      "Demission annoncee mais reportee : Starmer reste jusqu'a l'election d'un successeur designe. PM devient lame duck, plus aucune decision majeure, cabinet en guerre de succession. Probleme cle : aucun candidat (Streeting / Miliband / Cooper / Burnham / Reeves) ne fait l'unanimite. Drift GBPUSD de 1.35 vers 1.32 sur 2-3 mois sans grand mouvement explosif.",
    probability: 25,
    instruments: ["GBPUSD", "GBPJPY"],
  },
  worst: {
    title: "Demission immediate + contest 6-10 semaines",
    description:
      "Starmer demissionne, leadership contest commence immediatement. Pendant 6 a 10 semaines, le UK n'a plus de gouvernement decisionnaire fort. GBP devient 'a la merci des autres devises' : pas de reponse coordonnee si Trump annonce des tarifs, si BoE doit bouger, si Iran s'aggrave. Reference historique : ete 2022 (Johnson → Truss → Sunak) ou GBPUSD 1.22 → 1.04 en 90 jours.",
    probability: 25,
    instruments: ["GBPUSD", "GBPJPY", "GILTS", "GBPCHF"],
  },
  tail: {
    title: "Crise totale (Truss moment bis)",
    description:
      "Demission soudaine + appel a elections anticipees + crise gilts simultanee + aggravateurs externes (tarifs Trump UK, escalation Iran, sondage Reform UK > 30%). Reference : Truss moment septembre 2022. GBPUSD -300 a -500 pips en 24-72h, vers 1.28-1.30. GBPJPY effondre (carry unwind). Gilts spike +200 bps. BoE intervention urgence.",
    probability: 10,
    instruments: ["GBPUSD", "GBPJPY", "GILTS", "GBPCHF"],
  },
} as const;

function Card({
  meta,
  title,
  description,
  probability,
  instruments,
  large = false,
}: {
  meta: { color: string; bg: string; label: string };
  title: string;
  description: string;
  probability: number;
  instruments: readonly string[];
  large?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border flex flex-col ${large ? "p-8 gap-5" : "p-5 gap-3"}`}
      style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}
    >
      <div className="flex items-center justify-between">
        <span
          className={`font-bold rounded tracking-wider ${large ? "text-sm px-3 py-1" : "text-[10px] px-2 py-0.5"}`}
          style={{ background: meta.bg, color: meta.color }}
        >
          {meta.label}
        </span>
        <span
          className={`font-mono font-bold ${large ? "text-2xl" : "text-xs"}`}
          style={{ color: large ? meta.color : "var(--text-muted)" }}
        >
          {probability}%
        </span>
      </div>
      <div>
        <div className={`font-semibold leading-snug ${large ? "text-xl mb-4" : "text-sm font-medium mb-2"}`}>
          {title}
        </div>
        <p
          className={`leading-relaxed ${large ? "text-base" : "text-xs"}`}
          style={{ color: "var(--text-secondary)" }}
        >
          {description}
        </p>
      </div>
      {instruments.length > 0 && (
        <div className={`flex flex-wrap ${large ? "gap-2" : "gap-1"}`}>
          {instruments.map((ins) => (
            <span
              key={ins}
              className={`font-mono rounded ${large ? "text-xs px-2.5 py-1" : "text-[10px] px-1.5 py-0.5"}`}
              style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)" }}
            >
              {ins}
            </span>
          ))}
        </div>
      )}
      <button
        type="button"
        className={`mt-auto w-full flex items-center justify-center rounded-md font-medium transition-colors ${large ? "gap-2 px-4 py-3 text-sm" : "gap-1.5 px-3 py-1.5 text-xs"}`}
        style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)" }}
      >
        <Check size={large ? 16 : 12} />
        Valider
      </button>
    </div>
  );
}

function SectionHeader({ num, title, sub }: { num: number; title: string; sub: string }) {
  return (
    <div className="flex items-baseline gap-3 mb-4 pb-3" style={{ borderBottom: "1px solid var(--border)" }}>
      <span
        className="text-2xl font-bold px-3 py-1 rounded"
        style={{ background: "var(--bg-elevated)", color: "var(--text-primary)" }}
      >
        {num}
      </span>
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{sub}</p>
      </div>
    </div>
  );
}

export default function PreviewScenariosUK() {
  return (
    <div className="min-h-screen p-8" style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}>
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-2xl font-bold mb-2">Preview — Scenarios politique UK (3 options)</h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Comparaison visuelle des 3 approches d&apos;integration. Choisis celle qui te plait, je deploie ensuite.
          </p>
        </header>

        <section className="mb-12">
          <SectionHeader
            num={1}
            title="Option 1 — Mapping sur structure existante (dovish/base/hawkish)"
            sub="3 sc&eacute;narios UK r&eacute;utilisant les composants WeeklyScenario d&eacute;j&agrave; styl&eacute;s. Z&eacute;ro nouveau code, juste data."
          />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card
              meta={WEEKLY_DOVISH}
              title={SCENARIOS_UK.best.title}
              description={SCENARIOS_UK.best.description}
              probability={SCENARIOS_UK.best.probability}
              instruments={SCENARIOS_UK.best.instruments}
              large
            />
            <Card
              meta={WEEKLY_BASE}
              title={SCENARIOS_UK.neutral.title}
              description={SCENARIOS_UK.neutral.description}
              probability={SCENARIOS_UK.neutral.probability}
              instruments={SCENARIOS_UK.neutral.instruments}
              large
            />
            <Card
              meta={WEEKLY_HAWKISH}
              title={SCENARIOS_UK.worst.title}
              description={SCENARIOS_UK.worst.description}
              probability={SCENARIOS_UK.worst.probability}
              instruments={SCENARIOS_UK.worst.instruments}
              large
            />
          </div>
          <p className="text-xs mt-4" style={{ color: "var(--text-muted)" }}>
            Format choisi par Luca : cards larges avec probabilit&eacute; en gros, titre plus visible, description bien a&eacute;r&eacute;e.
          </p>
        </section>

        <section className="mb-12">
          <SectionHeader
            num={2}
            title="Option 2 — Type d&eacute;di&eacute; (best / neutral / worst / tail)"
            sub="Nouveau type PoliticalScenario avec cat&eacute;gories s&eacute;mantiquement correctes. Inclut le sc&eacute;nario tail risk en bonus."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card
              meta={LUCA_COLORS.best}
              title={SCENARIOS_UK.best.title}
              description={SCENARIOS_UK.best.description}
              probability={SCENARIOS_UK.best.probability}
              instruments={SCENARIOS_UK.best.instruments}
            />
            <Card
              meta={LUCA_COLORS.neutral}
              title={SCENARIOS_UK.neutral.title}
              description={SCENARIOS_UK.neutral.description}
              probability={SCENARIOS_UK.neutral.probability}
              instruments={SCENARIOS_UK.neutral.instruments}
            />
            <Card
              meta={LUCA_COLORS.worst}
              title={SCENARIOS_UK.worst.title}
              description={SCENARIOS_UK.worst.description}
              probability={SCENARIOS_UK.worst.probability}
              instruments={SCENARIOS_UK.worst.instruments}
            />
            <Card
              meta={LUCA_COLORS.tail}
              title={SCENARIOS_UK.tail.title}
              description={SCENARIOS_UK.tail.description}
              probability={SCENARIOS_UK.tail.probability}
              instruments={SCENARIOS_UK.tail.instruments}
            />
          </div>
          <p className="text-xs mt-3" style={{ color: "var(--text-muted)" }}>
            Avantage : 4 cards, labels propres, scalable pour autres crises politiques. Demande de modifier types + composants.
          </p>
        </section>

        <section className="mb-12">
          <SectionHeader
            num={3}
            title="Option 3 — Prose + barre de probabilit&eacute;s"
            sub="Th&egrave;se courte et longue en prose, avec une barre visuelle qui affiche les 3 sc&eacute;narios et leurs probabilit&eacute;s en haut."
          />

          {/* Barre de probabilites des scenarios */}
          <div
            className="rounded-lg border p-5 mb-4"
            style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}
          >
            <h3 className="text-sm font-semibold mb-4 tracking-wider" style={{ color: "var(--text-muted)" }}>
              PROBABILITES DES SCENARIOS
            </h3>

            {/* Barre empilee */}
            <div className="flex h-8 rounded-md overflow-hidden mb-4" style={{ background: "var(--bg-elevated)" }}>
              <div
                className="flex items-center justify-center text-xs font-bold text-white"
                style={{ width: "50%", background: "var(--neutral-color)" }}
              >
                50%
              </div>
              <div
                className="flex items-center justify-center text-xs font-bold text-white"
                style={{ width: "25%", background: "var(--bear)", opacity: 0.7 }}
              >
                25%
              </div>
              <div
                className="flex items-center justify-center text-xs font-bold text-white"
                style={{ width: "25%", background: "var(--bear)" }}
              >
                25%
              </div>
            </div>

            {/* Legende */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-start gap-2">
                <span className="w-3 h-3 rounded-sm mt-1 flex-shrink-0" style={{ background: "var(--neutral-color)" }} />
                <div>
                  <div className="text-xs font-semibold flex items-center gap-2">
                    <span>Starmer reste fragilise</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: "var(--neutral-bg)", color: "var(--neutral-color)" }}>50%</span>
                  </div>
                  <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>Slow leak permanent, range 1.32-1.36</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-3 h-3 rounded-sm mt-1 flex-shrink-0" style={{ background: "var(--bear)", opacity: 0.7 }} />
                <div>
                  <div className="text-xs font-semibold flex items-center gap-2">
                    <span>Demission differee</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: "var(--bear-bg)", color: "var(--bear)" }}>25%</span>
                  </div>
                  <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>Lame duck, drift 1.35 → 1.32</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-3 h-3 rounded-sm mt-1 flex-shrink-0" style={{ background: "var(--bear)" }} />
                <div>
                  <div className="text-xs font-semibold flex items-center gap-2">
                    <span>Demission immediate</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: "var(--bear-bg)", color: "var(--bear)" }}>25%</span>
                  </div>
                  <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>Contest 6-10 sem, GBP a la merci</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div
              className="rounded-lg border p-5"
              style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}
            >
              <h3 className="text-sm font-semibold mb-3 tracking-wider" style={{ color: "var(--text-muted)" }}>
                THESE COURT TERME
              </h3>
              <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "var(--text-secondary)" }}>
{`Contexte UK : Pression croissante sur PM Starmer avec ~100 MPs Labour demandant demission. Streeting pousse, Miliband se positionne. Trois scenarios :

1. Demission immediate (25%) → leadership contest 6-10 semaines, GBP a la merci des autres devises, reference ete 2022 (Johnson → Truss). PIRE pour GBP.

2. Demission differee (25%) → PM lame duck, cabinet en guerre. Aucun candidat ne fait l'unanimite. Drift 1.35 → 1.32 sur 2-3 mois. MOYEN pour GBP.

3. Starmer reste fragilise (50%) → slow leak permanent, range 1.32-1.36. STABLE BEARISH.

Les 3 scenarios convergent dans la direction bearish GBP = asymetrie negative structurelle.`}
              </p>
            </div>

            <div
              className="rounded-lg border p-5"
              style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}
            >
              <h3 className="text-sm font-semibold mb-3 tracking-wider" style={{ color: "var(--text-muted)" }}>
                THESE LONG TERME
              </h3>
              <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "var(--text-secondary)" }}>
{`UK en political risk premium structurel 3-6 mois. Aucun retour rapide a la stabilite avant l'automne. Rebonds techniques GBPUSD vers 1.36-1.37 = opportunites de short a moyenne probabilite.

En parallele, transition Powell → Warsh (15 mai) cree incertitude USD : Warsh hawkish = USD long selectif (USDJPY/USDCHF), dovish = USD weakness + AUD bid.

Strategie LCM 10K : pas de short urgent. Setup alertes sur 1.36-1.37 + 1.345 (cassure). Si headline demission tombe, short sur 1er pullback technique 30-60 min apres l'annonce.`}
              </p>
            </div>
          </div>
          <p className="text-xs mt-3" style={{ color: "var(--text-muted)" }}>
            Format final : barre visuelle des probabilit&eacute;s + 2 blocs prose. Pas de cards par sc&eacute;nario, mais granularit&eacute; chiffr&eacute;e en haut.
          </p>
        </section>

        <footer className="mt-16 pt-6 text-center text-xs" style={{ borderTop: "1px solid var(--border)", color: "var(--text-muted)" }}>
          Page preview — non publi&eacute;e. Choisis ton option et je deploie sur la vraie page Preparation.
        </footer>
      </div>
    </div>
  );
}
