"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { currentWeek } from "@/lib/mock-data";
import { fetchWeekEvents } from "@/lib/mt5-calendar";
import { EcoEvent, EventCategory, Impact, Scenario, ScenarioType, WeeklyScenario, WeeklyScenarioKind } from "@/types";
import {
  CheckSquare,
  Plus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  TrendingDown,
  TrendingUp,
  Minus,
  CalendarDays,
  Clock,
  BookOpen,
  Rewind,
  Filter,
  X as XIcon,
} from "lucide-react";

type PageSection = "preparation" | "retro";

const CATEGORY_LABELS: Record<EventCategory, string> = {
  inflation: "Inflation",
  emploi: "Marché du travail",
  croissance: "Croissance",
  politique_monetaire: "Politique monétaire",
  discours: "Discours",
  sentiment: "Sentiment",
  autre: "Autre",
};

const ALL_CURRENCIES = ["USD", "EUR", "GBP", "JPY", "CHF", "AUD", "NZD", "CAD", "CNY"];
const ALL_IMPACTS: Impact[] = ["high", "medium", "low"];
const ALL_CATEGORIES: EventCategory[] = [
  "inflation",
  "emploi",
  "croissance",
  "politique_monetaire",
  "discours",
  "sentiment",
  "autre",
];
const CURRENCY_FLAGS: Record<string, string> = {
  USD: "🇺🇸",
  EUR: "🇪🇺",
  GBP: "🇬🇧",
  JPY: "🇯🇵",
  CHF: "🇨🇭",
  AUD: "🇦🇺",
  NZD: "🇳🇿",
  CAD: "🇨🇦",
  CNY: "🇨🇳",
};

const IMPACT_LABELS: Record<Impact, { label: string; color: string; bg: string }> = {
  high:   { label: "HAUT",  color: "var(--bear)",          bg: "var(--bear-bg)" },
  medium: { label: "MOYEN", color: "var(--neutral-color)", bg: "var(--neutral-bg)" },
  low:    { label: "BAS",   color: "var(--text-muted)",    bg: "var(--bg-muted)" },
};

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

function getMondayOfWeek(d: Date): Date {
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(d.getDate() + diff);
  return monday;
}

function getISOWeek(d: Date): number {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((t.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function toYMD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getValueTrend(forecast: string | undefined, actual: string | undefined): "up" | "down" | "eq" | null {
  if (!forecast || !actual) return null;
  const parse = (v: string) => parseFloat(v.replace(/[%MK\s,]/g, ""));
  const a = parse(actual);
  const f = parse(forecast);
  if (isNaN(a) || isNaN(f)) return null;
  if (a > f) return "up";
  if (a < f) return "down";
  return "eq";
}

export default function PreparationPage() {
  const [section, setSection] = useState<PageSection>("preparation");
  const [openEvent, setOpenEvent] = useState<string | null>(null);
  const [validated, setValidated] = useState<Set<string>>(new Set());
  const [weekValidated, setWeekValidated] = useState(false);
  const [customFormOpen, setCustomFormOpen] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);
  const [weekPickerOpen, setWeekPickerOpen] = useState(false);
  const weekPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!weekPickerOpen) return;
    const handle = (e: MouseEvent) => {
      if (weekPickerRef.current && !weekPickerRef.current.contains(e.target as Node)) {
        setWeekPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [weekPickerOpen]);

  // Base = semaine courante calculée depuis new Date() (lun -> ven).
  // Les champs narratifs (theme, thesis, scenarios...) restent importés du mock en fallback.
  const baseWeek = useMemo(() => {
    const today = new Date();
    const monday = getMondayOfWeek(today);
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);
    return {
      ...currentWeek,
      startDate: toYMD(monday),
      endDate: toYMD(friday),
      weekNumber: getISOWeek(monday),
      year: monday.getFullYear(),
    };
  }, []);

  const shiftedDates = useMemo(() => {
    const start = new Date(baseWeek.startDate);
    start.setDate(start.getDate() + weekOffset * 7);
    const end = new Date(baseWeek.endDate);
    end.setDate(end.getDate() + weekOffset * 7);
    return {
      startDate: toYMD(start),
      endDate: toYMD(end),
      weekNumber: getISOWeek(start),
      year: start.getFullYear(),
    };
  }, [baseWeek, weekOffset]);

  const week = useMemo(
    () => ({ ...baseWeek, ...shiftedDates }),
    [baseWeek, shiftedDates]
  );

  const weekChoices = useMemo(() => {
    return Array.from({ length: 13 }, (_, i) => i - 6).map((off) => {
      const s = new Date(baseWeek.startDate);
      s.setDate(s.getDate() + off * 7);
      const e = new Date(baseWeek.endDate);
      e.setDate(e.getDate() + off * 7);
      return {
        offset: off,
        weekNumber: getISOWeek(s),
        year: s.getFullYear(),
        range: formatDateRange(toYMD(s), toYMD(e)),
      };
    });
  }, [baseWeek]);

  // Events réels depuis Supabase mt5_calendar
  const [realEvents, setRealEvents] = useState<EcoEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoadingEvents(true);
    fetchWeekEvents(week.startDate, week.endDate)
      .then((evts) => {
        if (!cancelled) setRealEvents(evts);
      })
      .finally(() => {
        if (!cancelled) setLoadingEvents(false);
      });
    return () => {
      cancelled = true;
    };
  }, [week.startDate, week.endDate]);

  // Filtres annonces (multiselect chips)
  const [filterImpact, setFilterImpact] = useState<Set<Impact>>(new Set());
  const [filterCurrency, setFilterCurrency] = useState<Set<string>>(new Set());
  const [filterCategory, setFilterCategory] = useState<Set<EventCategory>>(new Set());

  const availableCurrencies = useMemo(
    () => Array.from(new Set(realEvents.map((e) => e.currency))).sort(),
    [realEvents]
  );
  const availableCategories = useMemo(() => {
    const set = new Set<EventCategory>();
    realEvents.forEach((e) => { if (e.category) set.add(e.category); });
    return Array.from(set);
  }, [realEvents]);

  const filteredEvents = useMemo(() => {
    return realEvents.filter((ev) => {
      if (filterImpact.size > 0 && !filterImpact.has(ev.impact)) return false;
      if (filterCurrency.size > 0 && !filterCurrency.has(ev.currency)) return false;
      if (filterCategory.size > 0) {
        if (!ev.category || !filterCategory.has(ev.category)) return false;
      }
      return true;
    });
  }, [realEvents, filterImpact, filterCurrency, filterCategory]);

  // Regrouper les events par jour de la semaine sélectionnée
  const dayKeys = useMemo(() => {
    const start = new Date(`${week.startDate}T00:00:00`);
    return Array.from({ length: 5 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    });
  }, [week.startDate]);

  const eventsByDay = useMemo(() => {
    const groups: EcoEvent[][] = dayKeys.map(() => []);
    filteredEvents.forEach((ev) => {
      const idx = dayKeys.indexOf(ev.date);
      if (idx >= 0) groups[idx].push(ev);
    });
    groups.forEach((g) => g.sort((a, b) => a.time.localeCompare(b.time)));
    return groups;
  }, [filteredEvents, dayKeys]);

  const toggleFrom = <T,>(set: Set<T>, value: T) => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    return next;
  };

  const resetFilters = () => {
    setFilterImpact(new Set());
    setFilterCurrency(new Set());
    setFilterCategory(new Set());
  };

  const activeFilterCount = filterImpact.size + filterCurrency.size + filterCategory.size;

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

  const eventsWithScenarios = filteredEvents.filter((e) =>
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
      <div className="flex items-start justify-between mb-3 gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          {/* Sélecteur de semaine */}
          <div className="relative" ref={weekPickerRef}>
            <div
              className="inline-flex items-center rounded-lg overflow-hidden"
              style={{ border: "1px solid var(--border)", background: "#FFFFFF" }}
            >
              <button
                type="button"
                onClick={() => setWeekOffset((o) => o - 1)}
                className="px-2 py-1.5 transition-colors"
                style={{ color: "#0A0B0E", borderRight: "1px solid var(--border-light)" }}
                title="Semaine précédente"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                onClick={() => setWeekPickerOpen((v) => !v)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold"
                style={{ color: "#0A0B0E", minWidth: 120 }}
              >
                <span className="font-mono">S{week.weekNumber}</span>
                <span style={{ color: "var(--text-muted)" }}>·</span>
                <span className="font-mono" style={{ color: "var(--text-secondary)" }}>
                  {week.year}
                </span>
                <ChevronDown
                  size={12}
                  style={{
                    marginLeft: 2,
                    transition: "transform 0.2s",
                    transform: weekPickerOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </button>
              <button
                type="button"
                onClick={() => setWeekOffset((o) => o + 1)}
                className="px-2 py-1.5 transition-colors"
                style={{ color: "#0A0B0E", borderLeft: "1px solid var(--border-light)" }}
                title="Semaine suivante"
              >
                <ChevronRight size={14} />
              </button>
            </div>
            {weekPickerOpen && (
              <div
                className="absolute left-0 top-full mt-2 rounded-xl overflow-hidden z-50"
                style={{
                  background: "#FFFFFF",
                  border: "1px solid var(--border)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.06)",
                  minWidth: 280,
                  maxHeight: 360,
                  overflowY: "auto",
                }}
              >
                <div className="py-1.5">
                  {weekChoices.map((c) => {
                    const isCurrent = c.offset === weekOffset;
                    const isToday = c.offset === 0;
                    return (
                      <button
                        type="button"
                        key={c.offset}
                        onClick={() => {
                          setWeekOffset(c.offset);
                          setWeekPickerOpen(false);
                        }}
                        className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-xs font-medium transition-colors"
                        style={{
                          background: isCurrent ? "var(--accent-light)" : "transparent",
                          color: isCurrent ? "var(--accent)" : "#0A0B0E",
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold" style={{ minWidth: 42 }}>
                            S{c.weekNumber}
                          </span>
                          <span
                            className="font-mono text-[11px]"
                            style={{ color: isCurrent ? "var(--accent)" : "var(--text-muted)" }}
                          >
                            {c.range}
                          </span>
                        </div>
                        {isToday && (
                          <span
                            className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded"
                            style={{ background: "var(--bull-bg)", color: "var(--bull)" }}
                          >
                            EN COURS
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          {weekOffset === 0 && (
            <span
              className="text-[10px] font-bold px-2 py-1 rounded tracking-wider"
              style={{ background: "var(--bull-bg)", color: "var(--bull)" }}
            >
              EN COURS
            </span>
          )}
          {weekOffset < 0 && (
            <span
              className="text-[10px] font-bold px-2 py-1 rounded tracking-wider"
              style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}
            >
              PASSÉE
            </span>
          )}
          {weekOffset > 0 && (
            <span
              className="text-[10px] font-bold px-2 py-1 rounded tracking-wider"
              style={{ background: "var(--accent-light)", color: "var(--accent)" }}
            >
              À VENIR
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button
            type="button"
            onClick={() => setCustomFormOpen((v) => !v)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: "#FFFFFF",
              border: "1px solid var(--border)",
              color: "#0A0B0E",
            }}
          >
            <Plus size={13} /> Évènement custom
          </button>
          <button
            type="button"
            onClick={() => setWeekValidated((v) => !v)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white transition-all"
            style={{
              background: weekValidated ? "#16A34A" : "#0A0B0E",
            }}
          >
            <CheckSquare size={13} />
            {weekValidated ? "Semaine validée" : "Valider la semaine"}
          </button>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-4xl font-light mb-2" style={{ fontFamily: "var(--font-display)" }}>
        Préparation de la semaine
      </h1>
      <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
        Semaine {week.weekNumber} — {formatDateRange(week.startDate, week.endDate)} · thème — <em>{week.theme}</em>
      </p>

      {/* Onglets section */}
      <div className="flex items-center gap-1 mb-10 border-b" style={{ borderColor: "var(--border)" }}>
        {([
          ["preparation", "Préparation", CalendarDays],
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

      {/* Filtres annonces — dropdowns */}
      <div
        className="rounded-xl mb-5 px-5 py-4 flex items-center gap-3 flex-wrap"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}
      >
        <div className="flex items-center gap-2">
          <Filter size={14} style={{ color: "var(--text-muted)" }} />
          <span
            className="text-[10px] font-bold tracking-[1.5px] uppercase"
            style={{ color: "var(--text-secondary)" }}
          >
            Filtres
          </span>
        </div>

        <FilterDropdown
          label="Importance"
          count={filterImpact.size}
          options={ALL_IMPACTS.map((imp) => ({
            value: imp,
            selected: filterImpact.has(imp),
            render: (
              <div className="flex items-center gap-2.5">
                <span
                  className="w-2 h-2 rounded-full inline-block flex-shrink-0"
                  style={{ background: IMPACT_LABELS[imp].color }}
                />
                <span>{IMPACT_LABELS[imp].label}</span>
              </div>
            ),
            onToggle: () => setFilterImpact((s) => toggleFrom(s, imp)),
          }))}
        />

        <FilterDropdown
          label="Pays"
          count={filterCurrency.size}
          options={ALL_CURRENCIES.map((cur) => ({
            value: cur,
            selected: filterCurrency.has(cur),
            render: (
              <div className="flex items-center gap-2.5">
                <span className="text-base leading-none flex-shrink-0">{CURRENCY_FLAGS[cur] ?? "🌐"}</span>
                <span className="font-mono font-semibold">{cur}</span>
              </div>
            ),
            onToggle: () => setFilterCurrency((s) => toggleFrom(s, cur)),
          }))}
        />

        <FilterDropdown
          label="Catégorie"
          count={filterCategory.size}
          options={ALL_CATEGORIES.map((cat) => ({
            value: cat,
            selected: filterCategory.has(cat),
            render: <span>{CATEGORY_LABELS[cat]}</span>,
            onToggle: () => setFilterCategory((s) => toggleFrom(s, cat)),
          }))}
        />

        <div className="flex-1" />

        <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
          {filteredEvents.length} / {realEvents.length} annonces
        </span>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={resetFilters}
            className="flex items-center gap-1 text-xs font-semibold transition-colors px-2.5 py-1.5 rounded-md"
            style={{ color: "var(--text-secondary)", background: "var(--bg-elevated)" }}
          >
            <XIcon size={12} /> Réinitialiser ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Calendrier — Variante 1 : table lignes 21st.dev style, groupée par jour, sticky headers */}
      <div
        className="rounded-xl overflow-hidden shadow-2xl"
        style={{ background: "#111111", border: "1px solid #1f1f1f" }}
      >
        <div className="overflow-x-auto">
          <div className="min-w-[1000px]">
            {/* Header colonnes */}
            <div
              className="grid gap-4 px-6 py-3 text-[11px] font-bold uppercase tracking-wider"
              style={{
                gridTemplateColumns: "80px 120px 100px 1fr 120px 120px 120px",
                background: "#0d0d0d",
                borderBottom: "1px solid #1f1f1f",
                color: "#9ca3af",
              }}
            >
              <div>Heure</div>
              <div>Devise</div>
              <div>Impact</div>
              <div>Événement</div>
              <div className="text-right">Consensus</div>
              <div className="text-right">Précédent</div>
              <div className="text-right">Réel</div>
            </div>

            {loadingEvents ? (
              <div className="p-6">
                <div className="h-10 rounded animate-pulse" style={{ background: "#1f1f1f" }} />
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="px-4 py-16 text-center text-sm" style={{ color: "#9ca3af" }}>
                Aucune annonce pour cette semaine avec ces filtres
              </div>
            ) : (
              DAYS.map((day, i) => {
                const dayEvents = eventsByDay[i];
                if (dayEvents.length === 0) return null;
                const now = new Date();
                const todayDDMM = `${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1).toString().padStart(2, "0")}`;
                const isToday = dates[i] === todayDDMM;
                return (
                  <div key={day}>
                    {/* Séparateur de jour — sticky */}
                    <div
                      className="sticky top-0 z-10 px-6 py-3"
                      style={{
                        background: "#0d0d0d",
                        borderTop: "1px solid rgba(31,31,31,0.5)",
                        borderBottom: "1px solid rgba(31,31,31,0.5)",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <h2 className="text-sm font-semibold" style={{ color: "#d1d5db" }}>
                          {day} {dates[i]}
                        </h2>
                        {isToday && (
                          <span
                            className="text-[9px] font-bold tracking-[0.15em] px-2 py-0.5 rounded"
                            style={{ background: "#22d3ee", color: "#0a0a0a" }}
                          >
                            AUJOURD&apos;HUI
                          </span>
                        )}
                        <span
                          className="ml-auto text-[11px] font-mono"
                          style={{ color: "#6b7280" }}
                        >
                          {dayEvents.length} annonce{dayEvents.length > 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                    {/* Rows */}
                    {dayEvents.map((event) => {
                      const isHighImpact = event.impact === "high";
                      const impactColors =
                        event.impact === "high"
                          ? { bg: "rgba(239,68,68,0.2)", text: "#f87171", border: "rgba(239,68,68,0.3)", label: "HAUT" }
                          : event.impact === "medium"
                          ? { bg: "rgba(249,115,22,0.2)", text: "#fb923c", border: "rgba(249,115,22,0.3)", label: "MOY." }
                          : { bg: "rgba(234,179,8,0.2)", text: "#facc15", border: "rgba(234,179,8,0.3)", label: "BAS" };
                      const flag = CURRENCY_FLAGS[event.currency] ?? "";
                      const trend = getValueTrend(event.forecast, event.actual);
                      const baseBg = isHighImpact ? "rgba(127,29,29,0.1)" : "transparent";
                      return (
                        <div
                          key={event.id}
                          className="grid gap-4 px-6 py-3 cursor-pointer transition-all duration-150"
                          style={{
                            gridTemplateColumns: "80px 120px 100px 1fr 120px 120px 120px",
                            background: baseBg,
                            borderBottom: "1px solid rgba(31,31,31,0.3)",
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLDivElement).style.background = "rgba(31,41,55,0.3)";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLDivElement).style.background = baseBg;
                          }}
                        >
                          {/* Heure */}
                          <div className="text-sm font-mono flex items-center" style={{ color: "#d1d5db" }}>
                            {event.time}
                          </div>
                          {/* Devise */}
                          <div className="flex items-center">
                            <span
                              className="inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-semibold"
                              style={{
                                background: "rgba(31,41,55,0.5)",
                                borderColor: "#374151",
                                color: "#e5e7eb",
                              }}
                            >
                              <span className="text-base leading-none">{flag}</span>
                              <span className="font-mono tracking-wider">{event.currency}</span>
                            </span>
                          </div>
                          {/* Impact */}
                          <div className="flex items-center">
                            <span
                              className="inline-flex items-center justify-center rounded-md border px-2 py-1 text-xs font-bold tracking-wider"
                              style={{
                                background: impactColors.bg,
                                color: impactColors.text,
                                borderColor: impactColors.border,
                              }}
                            >
                              {impactColors.label}
                            </span>
                          </div>
                          {/* Événement */}
                          <div
                            className="text-sm flex items-center font-medium truncate"
                            style={{ color: "#e5e7eb" }}
                            title={event.title}
                          >
                            {event.title}
                          </div>
                          {/* Consensus */}
                          <div
                            className="text-sm text-right flex items-center justify-end font-mono"
                            style={{ color: event.forecast ? "#d1d5db" : "#4b5563" }}
                          >
                            {event.forecast ?? "—"}
                          </div>
                          {/* Précédent */}
                          <div
                            className="text-sm text-right flex items-center justify-end font-mono"
                            style={{ color: event.previous ? "#9ca3af" : "#4b5563" }}
                          >
                            {event.previous ?? "—"}
                          </div>
                          {/* Réel */}
                          <div
                            className="text-sm text-right flex items-center justify-end font-mono font-semibold gap-1"
                            style={{ color: event.actual ? "#ffffff" : "#4b5563" }}
                          >
                            <span>{event.actual ?? "—"}</span>
                            {trend === "up" && <TrendingUp className="w-3 h-3" style={{ color: "#4ade80" }} />}
                            {trend === "down" && <TrendingDown className="w-3 h-3" style={{ color: "#f87171" }} />}
                            {trend === "eq" && <Minus className="w-3 h-3" style={{ color: "#6b7280" }} />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })
            )}

            {/* Footer légende */}
            <div
              className="px-6 py-4"
              style={{ background: "#0d0d0d", borderTop: "1px solid #1f1f1f" }}
            >
              <div className="flex items-center justify-between text-xs" style={{ color: "#6b7280" }}>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full border"
                      style={{ background: "rgba(239,68,68,0.3)", borderColor: "rgba(239,68,68,0.5)" }}
                    />
                    <span>Impact Haut</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full border"
                      style={{ background: "rgba(249,115,22,0.3)", borderColor: "rgba(249,115,22,0.5)" }}
                    />
                    <span>Impact Moyen</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full border"
                      style={{ background: "rgba(234,179,8,0.3)", borderColor: "rgba(234,179,8,0.5)" }}
                    />
                    <span>Impact Bas</span>
                  </div>
                </div>
                <div>{filteredEvents.length} annonce{filteredEvents.length > 1 ? "s" : ""} au total</div>
              </div>
            </div>
          </div>
        </div>
        {!loadingEvents && realEvents.length === 0 && (
          <div
            className="text-center text-xs py-3 border-t"
            style={{ color: "var(--text-muted)", borderColor: "var(--border-light)" }}
          >
            Aucune annonce Supabase pour cette semaine (S{week.weekNumber})
          </div>
        )}
      </div>

      {/* Thèses macro — déplacé après le calendrier */}
      <div className="card mt-10">
        <div className="card-header flex items-center gap-3">
          <BookOpen size={15} style={{ color: "var(--text-muted)" }} />
          <span className="section-label">THÈSES MACRO EN COURS</span>
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

      {/* Scenarios par annonce (accordeon) */}
      <div className="mt-10">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-xl font-light" style={{ fontFamily: "var(--font-display)" }}>
            Scénarios par annonce
          </h2>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {validated.size} validé{validated.size > 1 ? "s" : ""} sur {week.scenarios.length + week.weeklyScenarios.length}
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
                      {validCount}/3 validé{validCount > 1 ? "s" : ""}
                    </span>
                  )}
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {eventScenarios.length} scénarios
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

type DropdownOption = {
  value: string;
  selected: boolean;
  render: React.ReactNode;
  onToggle: () => void;
};

function FilterDropdown({
  label,
  count,
  options,
}: {
  label: string;
  count: number;
  options: DropdownOption[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const isActive = count > 0 || open;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all"
        style={{
          background: isActive ? "#0A0B0E" : "#FFFFFF",
          color: isActive ? "#FFFFFF" : "#0A0B0E",
          border: `1px solid ${isActive ? "#0A0B0E" : "var(--border)"}`,
        }}
      >
        <span>{label}</span>
        {count > 0 && (
          <span
            className="inline-flex items-center justify-center text-[10px] font-bold rounded-full"
            style={{
              minWidth: 18,
              height: 18,
              padding: "0 6px",
              background: "#FFFFFF",
              color: "#0A0B0E",
            }}
          >
            {count}
          </span>
        )}
        <ChevronDown
          size={13}
          style={{
            transition: "transform 0.2s",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>
      {open && (
        <div
          className="absolute left-0 top-full mt-2 rounded-xl overflow-hidden z-50"
          style={{
            background: "#FFFFFF",
            border: "1px solid var(--border)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.06)",
            minWidth: 220,
          }}
        >
          <div className="py-1.5">
            {options.map((opt) => (
              <button
                type="button"
                key={opt.value}
                onClick={opt.onToggle}
                className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-xs font-medium transition-colors"
                style={{
                  background: opt.selected ? "var(--accent-light)" : "transparent",
                  color: opt.selected ? "var(--accent)" : "#0A0B0E",
                }}
              >
                <span className="flex-1 text-left">{opt.render}</span>
                <span
                  className="inline-flex items-center justify-center flex-shrink-0 rounded"
                  style={{
                    width: 16,
                    height: 16,
                    background: opt.selected ? "var(--accent)" : "transparent",
                    border: opt.selected ? "none" : "1.5px solid var(--border)",
                  }}
                >
                  {opt.selected && <Check size={11} strokeWidth={3} style={{ color: "#FFFFFF" }} />}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span
        className="text-[10px] font-bold tracking-[1px] uppercase w-20 flex-shrink-0"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </span>
      <div className="flex items-center gap-1.5 flex-wrap">{children}</div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
  color,
  bg,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  color?: string;
  bg?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all"
      style={
        active
          ? {
              background: bg ?? "var(--accent-light)",
              color: color ?? "var(--accent)",
              border: `1px solid ${color ?? "var(--accent)"}`,
            }
          : {
              background: "transparent",
              color: "var(--text-secondary)",
              border: "1px solid var(--border)",
            }
      }
    >
      {children}
    </button>
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
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: `linear-gradient(145deg, ${tint} 0%, ${tint} 40%, transparent 100%)`,
        border: "1px solid var(--border-light)",
        padding: "44px 48px 48px 60px",
        minHeight: 380,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
      }}
    >
      <div
        className="absolute top-0 left-0 bottom-0"
        style={{ background: accent, width: 6 }}
      />
      {/* filigrane decoratif */}
      <div
        className="absolute"
        style={{
          right: -40,
          bottom: -40,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: accent,
          opacity: 0.035,
          pointerEvents: "none",
        }}
      />
      <div
        className="absolute"
        style={{
          right: 32,
          top: 32,
          color: accent,
          opacity: 0.08,
          transform: "scale(4)",
          transformOrigin: "top right",
          pointerEvents: "none",
        }}
      >
        {icon}
      </div>

      <div className="flex items-center justify-between mb-8 relative">
        <div className="flex items-center gap-3">
          <span
            className="text-[11px] font-bold tracking-[2.5px] uppercase px-3.5 py-2 rounded-md inline-flex items-center gap-2"
            style={{ background: accent, color: "white" }}
          >
            {icon}
            {label}
          </span>
          <span
            className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded"
            style={{ color: accent, background: "white", border: `1px solid ${accent}20` }}
          >
            {period}
          </span>
        </div>
      </div>

      <div className="relative">
        <span
          className="absolute font-serif"
          style={{
            left: -36,
            top: -20,
            fontSize: 60,
            color: accent,
            opacity: 0.25,
            lineHeight: 1,
            fontFamily: "var(--font-display)",
          }}
        >
          &ldquo;
        </span>
        <p
          className="text-[18px] leading-[1.9]"
          style={{
            color: "var(--text-primary)",
            fontFamily: "var(--font-display)",
            fontWeight: 400,
            position: "relative",
          }}
        >
          {text}
        </p>
      </div>
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
            Débrief de la semaine passée
          </span>
        </div>
        <h2 className="text-3xl font-light mb-2" style={{ fontFamily: "var(--font-display)" }}>
          Et la semaine dernière, qu'as-tu réellement fait ?
        </h2>
        <p className="text-sm max-w-2xl" style={{ color: "var(--text-secondary)", fontStyle: "italic" }}>
          Relis ta préparation de la semaine S{week.weekNumber - 1}. Réponds honnêtement :
          qu'est-ce qui s'est passé, qu'est-ce qui s'est réalisé, et qu'est-ce que tu ajustes ?
        </p>
      </div>

      <RetroBlock
        title="Thèses macro"
        subtitle="Ton biais court terme était-il juste ?"
      >
        <RetroQuestion
          qKey="thesis-st"
          question="Ton biais court terme annoncé a-t-il été validé par le marché ?"
          answers={answers}
          onChange={updateAnswer}
          placeholder="Explique en 2-3 phrases : ce qui a marché, ce qui n'a pas..."
        />
        <RetroQuestion
          qKey="thesis-lt"
          question="Ta vision long terme reste-t-elle la même ?"
          answers={answers}
          onChange={updateAnswer}
          placeholder="Ajustement de thèse Q2, niveaux revus..."
        />
      </RetroBlock>

      <RetroBlock
        title="Scénarios par annonce"
        subtitle="Pour chaque annonce majeure (high impact), le scénario le plus probable s'est-il réalisé ?"
      >
        {week.events
          .filter((ev) => ev.impact === "high")
          .map((ev) => {
            const evScenarios = week.scenarios.filter((s) => s.eventId === ev.id);
            if (evScenarios.length === 0) return null;
            const top = evScenarios.reduce(
              (max, s) => (s.probability > max.probability ? s : max),
              evScenarios[0]
            );
            return (
              <RetroQuestion
                key={top.id}
                qKey={`sc-${top.id}`}
                question={`${ev.currency} · ${ev.title} — le scénario le plus probable (« ${top.title} ») s'est-il réalisé ?`}
                subLabel={`${SCENARIO_COLORS[top.type].label} · ${top.probability}% annoncés · ${formatEventDate(ev.date)} ${ev.time}`}
                answers={answers}
                onChange={updateAnswer}
                placeholder="Réalisé partiellement / totalement / pas du tout. Détails..."
              />
            );
          })}
      </RetroBlock>

      <RetroBlock
        title="Exécution"
        subtitle="As-tu appliqué ton plan ?"
      >
        <RetroQuestion
          qKey="exec-setups"
          question="As-tu tradé les setups que tu avais préparés ?"
          answers={answers}
          onChange={updateAnswer}
          placeholder="Setups pris vs attendus. Raisons si skip."
        />
        <RetroQuestion
          qKey="exec-discipline"
          question="As-tu respecté ton sizing et ton risk ?"
          answers={answers}
          onChange={updateAnswer}
          placeholder="Ex : 1 dérive sur EURUSD mardi, +0.5R ajouté..."
        />
        <RetroQuestion
          qKey="exec-offplan"
          question="As-tu pris des trades non prévus ?"
          answers={answers}
          onChange={updateAnswer}
          placeholder="Ce qui t'a fait sortir du plan, et résultat."
        />
      </RetroBlock>

      <RetroBlock
        title="Synthèse & ajustements"
        subtitle="Qu'est-ce que tu gardes pour la semaine prochaine ?"
      >
        <FreeTextQuestion
          qKey="worked"
          question="Qu'est-ce qui a le mieux fonctionné cette semaine ?"
          value={freeText["worked"] ?? ""}
          onChange={(v) => setFreeText((p) => ({ ...p, worked: v }))}
          placeholder="Setup, timing, discipline, routine..."
        />
        <FreeTextQuestion
          qKey="failed"
          question="Qu'est-ce qui n'a pas fonctionné ?"
          value={freeText["failed"] ?? ""}
          onChange={(v) => setFreeText((p) => ({ ...p, failed: v }))}
          placeholder="Erreurs d'analyse, d'exécution, émotionnel..."
        />
        <FreeTextQuestion
          qKey="lesson"
          question="La leçon à ancrer pour la semaine prochaine ?"
          value={freeText["lesson"] ?? ""}
          onChange={(v) => setFreeText((p) => ({ ...p, lesson: v }))}
          placeholder="Une phrase, brutale et claire."
        />
        <FreeTextQuestion
          qKey="adjust"
          question="Qu'est-ce que tu ajustes sur ta prochaine préparation ?"
          value={freeText["adjust"] ?? ""}
          onChange={(v) => setFreeText((p) => ({ ...p, adjust: v }))}
          placeholder="Ex : ajouter un scénario intermédiaire, surveiller aussi DXY..."
        />
      </RetroBlock>

      <div className="flex justify-end mt-10">
        <button
          type="button"
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white"
          style={{ background: "var(--bull)" }}
        >
          <CheckSquare size={14} /> Clôturer la rétrospective
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
