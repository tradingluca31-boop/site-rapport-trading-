"use client";

import { useState } from "react";
import { currentWeek } from "@/lib/mock-data";
import { EcoEvent } from "@/types";
import {
  CheckSquare,
  Plus,
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

  const week = currentWeek;

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
    </div>
  );
}

function formatDateRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const months = ["Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin", "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre"];
  return `${s.getDate()} au ${e.getDate()} ${months[s.getMonth()]} ${s.getFullYear()}`;
}
