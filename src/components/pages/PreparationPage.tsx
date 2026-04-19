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
} from "lucide-react";

type ViewMode = "timeline" | "liste" | "grille";

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
      <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
        Semaine {week.weekNumber} — {formatDateRange(week.startDate, week.endDate)} · theme — <em>{week.theme}</em>
      </p>

      {/* These macro */}
      <div className="card mb-8">
        <div className="card-body grid grid-cols-2 gap-0">
          <div className="pr-5 border-r" style={{ borderColor: "var(--border-light)" }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="tag font-bold text-[10px]" style={{ background: "var(--text-primary)", color: "white" }}>COURT TERME</span>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>Semaine {week.weekNumber}</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {week.thesisShortTerm}
            </p>
          </div>
          <div className="pl-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="tag font-bold text-[10px]" style={{ border: "1px solid var(--border)", background: "var(--bg-card)" }}>LONG TERME</span>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>Q2 2026</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {week.thesisLongTerm}
            </p>
          </div>
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
