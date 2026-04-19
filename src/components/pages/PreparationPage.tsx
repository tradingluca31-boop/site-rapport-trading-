"use client";

import { useState } from "react";
import { currentWeek } from "@/lib/mock-data";
import { EcoEvent, Scenario } from "@/types";
import {
  CalendarDays,
  Plus,
  CheckSquare,
  Pencil,
  MoreHorizontal,
} from "lucide-react";

type ViewMode = "timeline" | "liste" | "grille";

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
  const [selectedEvent, setSelectedEvent] = useState<EcoEvent | null>(
    currentWeek.events.find((e) => e.impact === "high") || null
  );

  const week = currentWeek;
  const scenarios = week.scenarios.filter((s) => s.eventId === selectedEvent?.id);

  const dates = DAYS.map((d, i) => {
    const start = new Date(week.startDate);
    start.setDate(start.getDate() + i);
    return `${start.getDate().toString().padStart(2, "0")}/${(start.getMonth() + 1).toString().padStart(2, "0")}`;
  });

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-6 animate-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
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
            {(["timeline", "liste", "grille"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className="px-3 py-1.5 text-xs font-medium capitalize transition-colors"
                style={{
                  background: viewMode === mode ? "var(--text-primary)" : "var(--bg-card)",
                  color: viewMode === mode ? "white" : "var(--text-secondary)",
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
      <h1 className="text-3xl font-light mb-1" style={{ fontFamily: "var(--font-display)" }}>
        Preparation de la semaine
      </h1>
      <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
        Semaine {week.weekNumber} — {formatDateRange(week.startDate, week.endDate)} · theme — <em>{week.theme}</em>
      </p>

      {/* These macro */}
      <div className="card mb-6">
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

      {/* Calendar + Scenario panel */}
      <div className="grid grid-cols-[1fr_380px] gap-4">
        {/* Calendar grid */}
        <div className="card overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th
                  className="text-[10px] font-bold tracking-wider uppercase text-left px-3 py-3 border-b"
                  style={{ color: "var(--text-muted)", borderColor: "var(--border-light)", width: "80px" }}
                >
                  HORAIRE
                </th>
                {DAYS.map((day, i) => (
                  <th
                    key={day}
                    className="text-left px-2 py-3 border-b border-l"
                    style={{ borderColor: "var(--border-light)" }}
                  >
                    <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{day}</span>
                    <span className="ml-2 font-mono text-xs" style={{ color: "var(--text-muted)" }}>{dates[i]}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS.map((time) => (
                <tr key={time}>
                  <td
                    className="px-3 py-4 text-xs font-mono border-b align-top"
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
                        className="px-2 py-2 border-b border-l align-top"
                        style={{ borderColor: "var(--border-light)", minHeight: "60px" }}
                      >
                        {event && (
                          <button
                            onClick={() => setSelectedEvent(event)}
                            className="w-full text-left p-2 rounded-md border-l-[3px] transition-all hover:shadow-sm"
                            style={{
                              borderLeftColor: event.impact === "high" ? "var(--bear)" : event.impact === "medium" ? "var(--accent)" : "var(--text-faint)",
                              background: selectedEvent?.id === event.id ? "var(--accent-light)" : "var(--bg-elevated)",
                              boxShadow: selectedEvent?.id === event.id ? "0 0 0 2px var(--accent)" : "none",
                            }}
                          >
                            <div className="text-[10px] font-mono mb-1" style={{ color: "var(--text-muted)" }}>
                              {event.currency} · {event.time}
                            </div>
                            <div className="text-xs font-medium leading-snug">
                              {event.title}
                            </div>
                            {event.impact === "high" && (
                              <div className="w-full h-0.5 mt-1.5 rounded" style={{ background: "var(--bear)" }} />
                            )}
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Scenario panel */}
        <div>
          {selectedEvent ? (
            <div className="card sticky top-16">
              {/* Event header */}
              <div className="card-header">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="tag tag-high font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--high-impact)" }} />
                      HIGH
                    </span>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      USD · MAR 14 14:30
                    </span>
                  </div>
                  <button className="p-1 rounded hover:bg-gray-100">
                    <MoreHorizontal size={14} style={{ color: "var(--text-muted)" }} />
                  </button>
                </div>
                <h3 className="text-base font-medium" style={{ fontFamily: "var(--font-display)" }}>
                  {selectedEvent.title}
                </h3>
                {selectedEvent.forecast && (
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                    Consensus <strong className="font-mono">{selectedEvent.forecast}</strong>
                    {selectedEvent.previous && (
                      <> · Prec. <span className="font-mono">{selectedEvent.previous}</span></>
                    )}
                  </p>
                )}
              </div>

              {/* Scenarios */}
              <div className="card-body">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: "var(--text-secondary)" }}>
                    SCENARIOS
                  </span>
                  <span className="text-[10px] font-mono" style={{ color: "var(--bear)" }}>
                    Total {scenarios.reduce((a, s) => a + s.probability, 0)}%
                  </span>
                </div>

                <div className="space-y-3">
                  {scenarios.map((s) => (
                    <ScenarioCard key={s.id} scenario={s} />
                  ))}
                </div>

                <button
                  className="w-full mt-3 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-md border border-dashed transition-colors hover:bg-gray-50"
                  style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
                >
                  <Plus size={13} /> Ajouter un scenario
                </button>

                <button
                  className="w-full mt-3 py-2.5 text-sm font-medium text-white rounded-md transition-colors"
                  style={{ background: "var(--text-primary)" }}
                >
                  <span className="flex items-center justify-center gap-2">
                    <CheckSquare size={14} /> Valider apres l&apos;annonce
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="card card-body text-center py-12">
              <CalendarDays size={32} className="mx-auto mb-3" style={{ color: "var(--text-faint)" }} />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Selectionne un evenement dans le calendrier
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ScenarioCard({ scenario }: { scenario: Scenario }) {
  const colors = {
    bear: { bg: "var(--bear-bg)", color: "var(--bear)", bar: "var(--bear)" },
    neutral: { bg: "var(--neutral-bg)", color: "var(--neutral-c)", bar: "var(--accent)" },
    bull: { bg: "var(--bull-bg)", color: "var(--bull)", bar: "var(--bull)" },
  };
  const c = colors[scenario.type];

  return (
    <div className="p-3 rounded-lg border" style={{ borderColor: "var(--border-light)" }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded"
            style={{ background: c.bg, color: c.color }}
          >
            {scenario.type.toUpperCase()}
          </span>
          <span className="text-sm font-medium">{scenario.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm" style={{ color: "var(--text-secondary)" }}>
            {scenario.probability}%
          </span>
          <button className="p-0.5 rounded hover:bg-gray-100">
            <Pencil size={12} style={{ color: "var(--text-muted)" }} />
          </button>
        </div>
      </div>
      {/* Probability bar */}
      <div className="h-1 rounded-full mb-2" style={{ background: "var(--bg-elevated)" }}>
        <div
          className="h-full rounded-full"
          style={{ width: `${scenario.probability}%`, background: c.bar }}
        />
      </div>
      <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>
        {scenario.description}
      </p>
      <div className="flex gap-1.5">
        {scenario.instruments.map((inst) => (
          <span key={inst} className="tag text-[10px]">{inst}</span>
        ))}
      </div>
    </div>
  );
}

function formatDateRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const months = ["Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin", "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre"];
  return `${s.getDate()} au ${e.getDate()} ${months[s.getMonth()]} ${s.getFullYear()}`;
}
