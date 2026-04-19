"use client";

import { useState } from "react";
import { currentWeek } from "@/lib/mock-data";
import { EcoEvent, Scenario, ScenarioType, WeeklyScenario, WeeklyScenarioKind } from "@/types";
import {
  CheckSquare,
  Plus,
  ChevronDown,
  ChevronRight,
  Check,
  TrendingDown,
  TrendingUp,
  Minus,
  CalendarDays,
  Clock,
  BookOpen,
  Rewind,
} from "lucide-react";

type ViewMode = "timeline" | "liste" | "grille";
type PageSection = "preparation" | "retro";

const SCENARIO_COLORS: Record<ScenarioType, { color: string; bg: string; label: string }> = {
  bear: { color: "var(--bear)", bg: "var(--bear-bg)", label: "BEAR" },
  neutral: { color: "var(--neutral-color)", bg: "var(--neutral-bg)", label: "NEUTRE" },
  bull: { color: "var(--bull)", bg: "var(--bull-bg)", label: "BULL" },
};

const WEEKLY_COLORS: Record<WeeklyScenarioKind, { color: string; bg: string; label: string }> = {
  dovish: { color: "var(--bull)", bg: "var(--bull-bg)", label: "DOVISH" },
  base: { color: "var(--neutral-color)", bg: "var(--neutral-bg)", label: "BASE" },
  hawkish: { color: "var(--bear)", bg: "var(--bear-bg)", label: "HAWKISH" },
};

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven"];
const TIME_SLOTS = ["09:00", "11:00", "13:00", "14:30", "16:00", "20:00"];

function getEventDay(event: EcoEvent): number {
  const d = new Date(event.date);
  return d.getDay() - 1; // 0=Mon
}

function getEventSlot(event: EcoEvent): number {
  return TIME_SLOTS.findIndex((t) => t === event.time);
}

export default function PreparationPage() {
  const [section, setSection] = useState<PageSection>("preparation");
  const [viewMode, setViewMode] = useState<ViewMode>("timeline");
  const [openEvent, setOpenEvent] = useState<string | null>(null);
  const [validated, setValidated] = useState<Set<string>>(new Set());

  const week = currentWeek;

  const toggleEvent = (eventId: string) => {
    setOpenEvent((prev) => (prev === eventId ? null : eventId));
  };

  const toggleValidation = (scenarioId: string) => {
    setValidated((prev) => {
      const next = new Set(prev);
      if (next.has(scenarioId)) next.delete(scenarioId);
      else next.add(scenarioId);
      return next;
    });
  };

  const eventsWithScenarios = week.events.filter((e) =>
    week.scenarios.some((s) => s.eventId === e.id)
  );

  const dates = DAYS.map((d, i) => {
    const start = new Date(week.startDate);
    start.setDate(start.getDate() + i);
    return `${start.getDate().toString().padStart(2, "0")}/${(start.getMonth() + 1).toString().padStart(2, "0")}`;
  });

  return (
    <div className="px-12 py-10 animate-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="tag font-mono text-xs">S{week.weekNumber} · {week.year}</span>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded tracking-wider"
            style={{ background: "var(--bull-bg)", color: "var(--bull)" }}
          >
            EN COURS
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex border rounded-md overflow-hidden" style={{ borderColor: "var(--border)" }}>
            {(["timeline", "liste", "grille"] as ViewMode[]).map((mode, i) => (
              <button
                type="button"
                key={mode}
                onClick={() => setViewMode(mode)}
                className="px-4 py-1.5 text-xs font-medium capitalize transition-colors"
                style={{
                  background: viewMode === mode ? "var(--text-primary)" : "var(--bg-card)",
                  color: viewMode === mode ? "white" : "var(--text-secondary)",
                  borderLeft: i > 0 ? "1px solid var(--border)" : "none",
                }}
              >
                {mode === "timeline" ? "Timeline" : mode === "liste" ? "Liste" : "Grille"}
              </button>
            ))}
          </div>
          <button
            className="flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-medium transition-colors hover:bg-gray-50"
            style={{ borderColor: "var(--border)" }}
          >
            <Plus size={13} /> Evenement custom
          </button>
          <button
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium text-white"
            style={{ background: "var(--text-primary)" }}
          >
            <CheckSquare size={13} /> Valider la semaine
          </button>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-4xl font-light mb-2" style={{ fontFamily: "var(--font-display)" }}>
        Preparation de la semaine
      </h1>
      <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
        Semaine {week.weekNumber} — {formatDateRange(week.startDate, week.endDate)} · theme — <em>{week.theme}</em>
      </p>

      {/* Onglets section */}
      <div className="flex items-center gap-1 mb-10 border-b" style={{ borderColor: "var(--border)" }}>
        {([
          ["preparation", "Preparation", CalendarDays],
          ["retro", "Fin de semaine", Rewind],
        ] as [PageSection, string, typeof CalendarDays][]).map(([id, label, Icon]) => {
          const isActive = section === id;
          return (
            <button
              type="button"
              key={id}
              onClick={() => setSection(id)}
              className="flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors relative"
              style={{
                color: isActive ? "var(--text-primary)" : "var(--text-muted)",
              }}
            >
              <Icon size={15} />
              {label}
              {isActive && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-[2px]"
                  style={{ background: "var(--accent)" }}
                />
              )}
            </button>
          );
        })}
      </div>

      {section === "preparation" && (<>

      {/* These macro — nouveau visuel */}
      <div className="card mb-10">
        <div className="card-header flex items-center gap-3">
          <BookOpen size={15} style={{ color: "var(--text-muted)" }} />
          <span className="section-label">THESES MACRO EN COURS</span>
        </div>
        <div className="card-body grid grid-cols-2 gap-5">
          <ThesisPanel
            label="COURT TERME"
            period={`Semaine ${week.weekNumber}`}
            text={week.thesisShortTerm}
            accent="var(--accent)"
            tint="var(--accent-light)"
            icon={<CalendarDays size={13} />}
          />
          <ThesisPanel
            label="LONG TERME"
            period="Q2 2026"
            text={week.thesisLongTerm}
            accent="var(--accent-gold)"
            tint="var(--accent-gold-light)"
            icon={<Clock size={13} />}
          />
        </div>
      </div>

      {/* Calendar full width */}
      <div className="card overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th
                className="text-[10px] font-bold tracking-wider uppercase text-left px-4 py-4 border-b"
                style={{ color: "var(--text-muted)", borderColor: "var(--border-light)", width: "90px" }}
              >
                HORAIRE
              </th>
              {DAYS.map((day, i) => (
                <th
                  key={day}
                  className="text-left px-4 py-4 border-b border-l"
                  style={{ borderColor: "var(--border-light)", width: "20%" }}
                >
                  <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>{day}</span>
                  <span className="ml-2 font-mono text-xs" style={{ color: "var(--text-muted)" }}>{dates[i]}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map((time) => (
              <tr key={time}>
                <td
                  className="px-4 py-5 text-xs font-mono border-b align-top"
                  style={{ color: "var(--text-muted)", borderColor: "var(--border-light)" }}
                >
                  {time}
                </td>
                {DAYS.map((_, dayIndex) => {
                  const event = week.events.find(
                    (e) => getEventDay(e) === dayIndex && getEventSlot(e) === TIME_SLOTS.indexOf(time)
                  );
                  return (
                    <td
                      key={dayIndex}
                      className="px-3 py-3 border-b border-l align-top"
                      style={{ borderColor: "var(--border-light)", minHeight: "70px" }}
                    >
                      {event && (
                        <div
                          className="w-full text-left p-3 rounded-lg border-l-[3px] transition-all hover:shadow-sm cursor-pointer"
                          style={{
                            borderLeftColor: event.impact === "high" ? "var(--bear)" : event.impact === "medium" ? "var(--accent)" : "var(--text-faint)",
                            background: "var(--bg-elevated)",
                          }}
                        >
                          <div className="text-[10px] font-mono mb-1.5" style={{ color: "var(--text-muted)" }}>
                            {event.currency} · {event.time}
                          </div>
                          <div className="text-sm font-medium leading-snug">
                            {event.title}
                          </div>
                          {event.forecast && (
                            <div className="text-[10px] font-mono mt-1.5" style={{ color: "var(--text-muted)" }}>
                              Cons. {event.forecast} {event.previous && `· Prec. ${event.previous}`}
                            </div>
                          )}
                          {event.impact === "high" && (
                            <div className="w-full h-0.5 mt-2 rounded" style={{ background: "var(--bear)" }} />
                          )}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Scenarios par annonce (accordeon) */}
      <div className="mt-10">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-xl font-light" style={{ fontFamily: "var(--font-display)" }}>
            Scenarios par annonce
          </h2>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {validated.size} valide{validated.size > 1 ? "s" : ""} sur {week.scenarios.length + week.weeklyScenarios.length}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {eventsWithScenarios.map((event) => {
            const eventScenarios = week.scenarios.filter((s) => s.eventId === event.id);
            const isOpen = openEvent === event.id;
            const validCount = eventScenarios.filter((s) => validated.has(s.id)).length;
            return (
              <div
                key={event.id}
                className="card overflow-hidden"
                style={{ padding: 0 }}
              >
                <button
                  type="button"
                  onClick={() => toggleEvent(event.id)}
                  className="w-full flex items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-gray-50"
                >
                  {isOpen ? (
                    <ChevronDown size={16} style={{ color: "var(--text-muted)" }} />
                  ) : (
                    <ChevronRight size={16} style={{ color: "var(--text-muted)" }} />
                  )}
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded tracking-wider"
                    style={{
                      background: event.impact === "high" ? "var(--bear-bg)" : "var(--neutral-bg)",
                      color: event.impact === "high" ? "var(--bear)" : "var(--neutral-color)",
                    }}
                  >
                    {event.impact === "high" ? "HAUT" : event.impact === "medium" ? "MOYEN" : "BAS"}
                  </span>
                  <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                    {event.currency} · {formatEventDate(event.date)} · {event.time}
                  </span>
                  <span className="text-sm font-medium flex-1">{event.title}</span>
                  {validCount > 0 && (
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded"
                      style={{ background: "var(--bull-bg)", color: "var(--bull)" }}
                    >
                      {validCount}/3 valide{validCount > 1 ? "s" : ""}
                    </span>
                  )}
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {eventScenarios.length} scenarios
                  </span>
                </button>
                {isOpen && (
                  <div
                    className="grid grid-cols-3 gap-3 px-5 pb-5 pt-1 border-t"
                    style={{ borderColor: "var(--border-light)" }}
                  >
                    {eventScenarios.map((sc) => (
                      <ScenarioCard
                        key={sc.id}
                        scenario={sc}
                        isValidated={validated.has(sc.id)}
                        onToggle={() => toggleValidation(sc.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Scenarios semaine (globaux) */}
      <div className="mt-10">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-xl font-light" style={{ fontFamily: "var(--font-display)" }}>
            Scenarios semaine
          </h2>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            Lecture globale — 3 chemins de la semaine
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {week.weeklyScenarios.map((ws) => (
            <WeeklyScenarioCard
              key={ws.id}
              scenario={ws}
              isValidated={validated.has(ws.id)}
              onToggle={() => toggleValidation(ws.id)}
            />
          ))}
        </div>
      </div>

      </>)}

      {section === "retro" && <RetroSection week={week} />}
    </div>
  );
}

function ThesisPanel({
  label,
  period,
  text,
  accent,
  tint,
  icon,
}: {
  label: string;
  period: string;
  text: string;
  accent: string;
  tint: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className="relative rounded-xl overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${tint} 0%, transparent 75%)`,
        border: "1px solid var(--border-light)",
        padding: "36px 40px 40px 52px",
        minHeight: 300,
      }}
    >
      <div
        className="absolute top-0 left-0 bottom-0 w-[4px]"
        style={{ background: accent }}
      />
      <div className="flex items-center justify-between mb-7">
        <div className="flex items-center gap-3">
          <span
            className="text-[10px] font-bold tracking-[2.5px] uppercase px-3 py-1.5 rounded"
            style={{ background: accent, color: "white" }}
          >
            {label}
          </span>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {period}
          </span>
        </div>
        <div style={{ color: accent, opacity: 0.5 }}>{icon}</div>
      </div>
      <p
        className="text-[17px] leading-[1.85]"
        style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)", fontWeight: 400 }}
      >
        {text}
      </p>
    </div>
  );
}

type RetroAnswer = { yesNo: boolean | null; note: string };

function RetroSection({ week }: { week: typeof currentWeek }) {
  const [answers, setAnswers] = useState<Record<string, RetroAnswer>>({});
  const [freeText, setFreeText] = useState<Record<string, string>>({});

  const updateAnswer = (key: string, patch: Partial<RetroAnswer>) => {
    setAnswers((prev) => ({ ...prev, [key]: { ...(prev[key] ?? { yesNo: null, note: "" }), ...patch } }));
  };

  return (
    <div className="animate-in">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <Rewind size={16} style={{ color: "var(--accent-gold)" }} />
          <span
            className="text-[10px] font-bold tracking-[3px] uppercase"
            style={{ color: "var(--accent-gold)" }}
          >
            Debrief de la semaine passee
          </span>
        </div>
        <h2 className="text-3xl font-light mb-2" style={{ fontFamily: "var(--font-display)" }}>
          Et la semaine derniere, qu'as-tu reellement fait ?
        </h2>
        <p className="text-sm max-w-2xl" style={{ color: "var(--text-secondary)", fontStyle: "italic" }}>
          Relis ta preparation de la semaine S{week.weekNumber - 1}. Repond honnetement :
          qu'est-ce qui s'est passe, qu'est-ce qui s'est realise, et qu'est-ce que tu ajustes ?
        </p>
      </div>

      <RetroBlock
        title="Theses macro"
        subtitle="Ton biais court terme etait-il juste ?"
      >
        <RetroQuestion
          qKey="thesis-st"
          question="Ton biais court terme annonce a-t-il ete valide par le marche ?"
          answers={answers}
          onChange={updateAnswer}
          placeholder="Explique en 2-3 phrases : ce qui a marche, ce qui n'a pas..."
        />
        <RetroQuestion
          qKey="thesis-lt"
          question="Ta vision long terme reste-t-elle la meme ?"
          answers={answers}
          onChange={updateAnswer}
          placeholder="Ajustement de thesis Q2, niveaux revus..."
        />
      </RetroBlock>

      <RetroBlock
        title="Scenarios par annonce"
        subtitle="Quels scenarios se sont realises, et comment as-tu trade ?"
      >
        {week.scenarios.slice(0, 4).map((sc) => (
          <RetroQuestion
            key={sc.id}
            qKey={`sc-${sc.id}`}
            question={`"${sc.title}" — ce scenario s'est-il realise ?`}
            subLabel={`${SCENARIO_COLORS[sc.type].label} · ${sc.probability}% annonces`}
            answers={answers}
            onChange={updateAnswer}
            placeholder="Realise partiellement / totalement / pas du tout. Details..."
          />
        ))}
      </RetroBlock>

      <RetroBlock
        title="Execution"
        subtitle="As-tu applique ton plan ?"
      >
        <RetroQuestion
          qKey="exec-setups"
          question="As-tu trade les setups que tu avais prepares ?"
          answers={answers}
          onChange={updateAnswer}
          placeholder="Setups pris vs attendus. Raisons si skip."
        />
        <RetroQuestion
          qKey="exec-discipline"
          question="As-tu respecte ton sizing et ton risk ?"
          answers={answers}
          onChange={updateAnswer}
          placeholder="Ex: 1 derive sur EURUSD mardi, +0.5R ajoute..."
        />
        <RetroQuestion
          qKey="exec-offplan"
          question="As-tu pris des trades non prevus ?"
          answers={answers}
          onChange={updateAnswer}
          placeholder="Ce qui t'a fait sortir du plan, et resultat."
        />
      </RetroBlock>

      <RetroBlock
        title="Synthese & ajustements"
        subtitle="Qu'est-ce que tu gardes pour S{n+1} ?"
      >
        <FreeTextQuestion
          qKey="worked"
          question="Qu'est-ce qui a le mieux fonctionne cette semaine ?"
          value={freeText["worked"] ?? ""}
          onChange={(v) => setFreeText((p) => ({ ...p, worked: v }))}
          placeholder="Setup, timing, discipline, routine..."
        />
        <FreeTextQuestion
          qKey="failed"
          question="Qu'est-ce qui n'a pas fonctionne ?"
          value={freeText["failed"] ?? ""}
          onChange={(v) => setFreeText((p) => ({ ...p, failed: v }))}
          placeholder="Erreurs d'analyse, d'execution, emotionnel..."
        />
        <FreeTextQuestion
          qKey="lesson"
          question="La lecon a ancrer pour la semaine prochaine ?"
          value={freeText["lesson"] ?? ""}
          onChange={(v) => setFreeText((p) => ({ ...p, lesson: v }))}
          placeholder="Une phrase, brutale et claire."
        />
        <FreeTextQuestion
          qKey="adjust"
          question="Qu'est-ce que tu ajustes sur ta prochaine preparation ?"
          value={freeText["adjust"] ?? ""}
          onChange={(v) => setFreeText((p) => ({ ...p, adjust: v }))}
          placeholder="Ex: ajouter un scenario intermediaire, surveiller aussi DXY..."
        />
      </RetroBlock>

      <div className="flex justify-end mt-10">
        <button
          type="button"
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white"
          style={{ background: "var(--bull)" }}
        >
          <CheckSquare size={14} /> Cloturer la retrospective
        </button>
      </div>
    </div>
  );
}

function RetroBlock({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <div className="mb-5 pb-3 border-b" style={{ borderColor: "var(--border-light)" }}>
        <h3 className="text-xl font-medium" style={{ fontFamily: "var(--font-display)" }}>
          {title}
        </h3>
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
          {subtitle}
        </p>
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

function RetroQuestion({
  qKey,
  question,
  subLabel,
  answers,
  onChange,
  placeholder,
}: {
  qKey: string;
  question: string;
  subLabel?: string;
  answers: Record<string, RetroAnswer>;
  onChange: (key: string, patch: Partial<RetroAnswer>) => void;
  placeholder: string;
}) {
  const a = answers[qKey] ?? { yesNo: null, note: "" };
  return (
    <div
      className="rounded-lg p-5"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1 min-w-0">
          {subLabel && (
            <div className="text-[10px] font-mono mb-1" style={{ color: "var(--text-muted)" }}>
              {subLabel}
            </div>
          )}
          <h4 className="text-[15px] font-medium" style={{ fontFamily: "var(--font-display)" }}>
            {question}
          </h4>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => onChange(qKey, { yesNo: true })}
            className="chip"
            style={a.yesNo === true ? {
              background: "var(--bull-bg)",
              borderColor: "var(--bull)",
              color: "var(--bull)",
            } : {}}
          >
            Oui
          </button>
          <button
            type="button"
            onClick={() => onChange(qKey, { yesNo: false })}
            className="chip"
            style={a.yesNo === false ? {
              background: "var(--bear-bg)",
              borderColor: "var(--bear)",
              color: "var(--bear)",
            } : {}}
          >
            Non
          </button>
        </div>
      </div>
      <textarea
        value={a.note}
        onChange={(e) => onChange(qKey, { note: e.target.value })}
        placeholder={placeholder}
        style={{ minHeight: 70 }}
      />
    </div>
  );
}

function FreeTextQuestion({
  qKey,
  question,
  value,
  onChange,
  placeholder,
}: {
  qKey: string;
  question: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div
      key={qKey}
      className="rounded-lg p-5"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}
    >
      <h4 className="text-[15px] font-medium mb-3" style={{ fontFamily: "var(--font-display)" }}>
        {question}
      </h4>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ minHeight: 90 }}
      />
    </div>
  );
}

function ScenarioCard({
  scenario,
  isValidated,
  onToggle,
}: {
  scenario: Scenario;
  isValidated: boolean;
  onToggle: () => void;
}) {
  const meta = SCENARIO_COLORS[scenario.type];
  const Icon = scenario.type === "bear" ? TrendingDown : scenario.type === "bull" ? TrendingUp : Minus;
  return (
    <div
      className="rounded-lg border p-4 flex flex-col gap-3 transition-all"
      style={{
        borderColor: isValidated ? meta.color : "var(--border)",
        background: isValidated ? meta.bg : "var(--bg-card)",
      }}
    >
      <div className="flex items-center justify-between">
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded tracking-wider flex items-center gap-1"
          style={{ background: meta.bg, color: meta.color }}
        >
          <Icon size={11} />
          {meta.label}
        </span>
        <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
          {scenario.probability}%
        </span>
      </div>
      <div>
        <div className="text-sm font-medium leading-snug mb-1.5">{scenario.title}</div>
        <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          {scenario.description}
        </p>
      </div>
      {scenario.instruments.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {scenario.instruments.map((ins) => (
            <span
              key={ins}
              className="text-[10px] font-mono px-1.5 py-0.5 rounded"
              style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)" }}
            >
              {ins}
            </span>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={onToggle}
        className="mt-auto w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
        style={{
          background: isValidated ? meta.color : "var(--bg-elevated)",
          color: isValidated ? "white" : "var(--text-secondary)",
        }}
      >
        <Check size={12} />
        {isValidated ? "Valide" : "Valider"}
      </button>
    </div>
  );
}

function WeeklyScenarioCard({
  scenario,
  isValidated,
  onToggle,
}: {
  scenario: WeeklyScenario;
  isValidated: boolean;
  onToggle: () => void;
}) {
  const meta = WEEKLY_COLORS[scenario.kind];
  return (
    <div
      className="rounded-lg border p-5 flex flex-col gap-3 transition-all"
      style={{
        borderColor: isValidated ? meta.color : "var(--border)",
        background: isValidated ? meta.bg : "var(--bg-card)",
      }}
    >
      <div className="flex items-center justify-between">
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded tracking-wider"
          style={{ background: meta.bg, color: meta.color }}
        >
          {meta.label}
        </span>
        <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
          {scenario.probability}%
        </span>
      </div>
      <div>
        <div className="text-sm font-medium leading-snug mb-2">{scenario.title}</div>
        <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          {scenario.description}
        </p>
      </div>
      {scenario.instruments.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {scenario.instruments.map((ins) => (
            <span
              key={ins}
              className="text-[10px] font-mono px-1.5 py-0.5 rounded"
              style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)" }}
            >
              {ins}
            </span>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={onToggle}
        className="mt-auto w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
        style={{
          background: isValidated ? meta.color : "var(--bg-elevated)",
          color: isValidated ? "white" : "var(--text-secondary)",
        }}
      >
        <Check size={12} />
        {isValidated ? "Valide" : "Valider"}
      </button>
    </div>
  );
}

function formatEventDate(iso: string): string {
  const d = new Date(iso);
  const days = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  return `${days[d.getDay()]} ${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`;
}

function formatDateRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const months = ["Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin", "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre"];
  return `${s.getDate()} au ${e.getDate()} ${months[s.getMonth()]} ${s.getFullYear()}`;
}
