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
  Flame,
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

const CURRENCY_COLORS: Record<string, string> = {
  USD: "#2563eb",
  EUR: "#7c3aed",
  GBP: "#db2777",
  JPY: "#dc2626",
  CHF: "#ea580c",
  AUD: "#16a34a",
  NZD: "#0891b2",
  CAD: "#c026d3",
  CNY: "#eab308",
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

function formatDayFull(weekStartDate: string, dayOffset: number): string {
  const d = new Date(weekStartDate);
  d.setDate(d.getDate() + dayOffset);
  const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
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
  const [lastUpdateTime, setLastUpdateTime] = useState("—");

  useEffect(() => {
    let cancelled = false;
    setLoadingEvents(true);
    fetchWeekEvents(week.startDate, week.endDate)
      .then((evts) => {
        if (!cancelled) {
          setRealEvents(evts);
          const now = new Date();
          setLastUpdateTime(
            `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`
          );
        }
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

  // Event principal de la semaine : prochain HIGH impact (ou premier HIGH si passé)
  const mainEvent = useMemo<EcoEvent | null>(() => {
    const highs = realEvents.filter((e) => e.impact === "high");
    if (highs.length === 0) return null;
    const now = new Date();
    const upcoming = highs
      .map((e) => ({ e, t: new Date(`${e.date}T${e.time}:00`).getTime() }))
      .filter((x) => !isNaN(x.t))
      .sort((a, b) => a.t - b.t);
    const next = upcoming.find((x) => x.t >= now.getTime());
    return (next ?? upcoming[0])?.e ?? highs[0];
  }, [realEvents]);

  const [nowTick, setNowTick] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNowTick(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const mainEventCountdown = useMemo(() => {
    if (!mainEvent) return null;
    const t = new Date(`${mainEvent.date}T${mainEvent.time}:00`).getTime();
    if (isNaN(t)) return null;
    const diffMs = t - nowTick;
    if (diffMs <= 0) return "MAINTENANT";
    const totalMin = Math.floor(diffMs / 60000);
    const days = Math.floor(totalMin / 1440);
    const hours = Math.floor((totalMin % 1440) / 60);
    const min = totalMin % 60;
    if (days > 0) return `DANS ${days}J ${hours}H`;
    if (hours > 0) return `DANS ${hours}H ${min}MIN`;
    return `DANS ${min}MIN`;
  }, [mainEvent, nowTick]);

  const mainEventFormatted = useMemo(() => {
    if (!mainEvent) return null;
    const d = new Date(`${mainEvent.date}T00:00:00`);
    const days = ["DIMANCHE", "LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI", "SAMEDI"];
    const months = ["JANVIER", "FEVRIER", "MARS", "AVRIL", "MAI", "JUIN", "JUILLET", "AOUT", "SEPTEMBRE", "OCTOBRE", "NOVEMBRE", "DECEMBRE"];
    return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} · ${mainEvent.time} GMT+2`;
  }, [mainEvent]);

  const mainEventScenariosCount = useMemo(() => {
    if (!mainEvent) return 0;
    return week.scenarios.filter((s) => s.eventId === mainEvent.id).length;
  }, [mainEvent, week.scenarios]);

  // Jour "point chaud" = jour avec le plus d'events HIGH (>= 2)
  const hotDayIdx = useMemo(() => {
    let bestIdx = -1;
    let bestCount = 1;
    eventsByDay.forEach((grp, i) => {
      const highs = grp.filter((e) => e.impact === "high").length;
      if (highs >= 2 && highs > bestCount) {
        bestCount = highs;
        bestIdx = i;
      }
    });
    return bestIdx;
  }, [eventsByDay]);

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

      {/* Filtres — sections bien separees (IMPACT / DEVISES / CATEGORIE) */}
      <div
        className="mb-6"
        style={{
          padding: "18px 22px",
          background: "var(--bg-card)",
          border: "1px solid var(--border-light)",
          borderRadius: 12,
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Filter size={13} style={{ color: "var(--text-muted)" }} />
          <span className="section-label">FILTRES</span>
          {activeFilterCount > 0 && (
            <span
              className="inline-flex items-center justify-center text-[9px] font-bold rounded ml-1"
              style={{
                minWidth: 16,
                padding: "1px 6px",
                background: "var(--bg-elevated)",
                color: "var(--text-muted)",
              }}
            >
              {activeFilterCount}
            </span>
          )}
          <span
            className="text-[11px] font-mono ml-auto"
            style={{ color: "var(--text-muted)" }}
          >
            {filteredEvents.length} / {realEvents.length} annonce{realEvents.length > 1 ? "s" : ""}
          </span>
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-[11px] font-semibold transition-colors px-2 py-1 rounded-md"
              style={{ color: "var(--text-secondary)", background: "var(--bg-elevated)" }}
            >
              <XIcon size={11} /> Reset
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <FilterRow label="Impact">
            {ALL_IMPACTS.map((imp) => (
              <PillChip
                key={imp}
                label={IMPACT_LABELS[imp].label}
                active={filterImpact.has(imp)}
                color={IMPACT_LABELS[imp].color}
                onClick={() => setFilterImpact((s) => toggleFrom(s, imp))}
              />
            ))}
          </FilterRow>

          <FilterRow label="Devises">
            {(availableCurrencies.length > 0 ? availableCurrencies : ALL_CURRENCIES).map((cur) => (
              <PillChip
                key={cur}
                label={cur}
                dot={CURRENCY_COLORS[cur] ?? "var(--accent)"}
                active={filterCurrency.has(cur)}
                color={CURRENCY_COLORS[cur] ?? "var(--accent)"}
                onClick={() => setFilterCurrency((s) => toggleFrom(s, cur))}
              />
            ))}
          </FilterRow>

          {availableCategories.length > 0 && (
            <FilterRow label="Categorie">
              {availableCategories.map((cat) => (
                <PillChip
                  key={cat}
                  label={CATEGORY_LABELS[cat]}
                  active={filterCategory.has(cat)}
                  color="var(--accent-gold)"
                  onClick={() => setFilterCategory((s) => toggleFrom(s, cat))}
                />
              ))}
            </FilterRow>
          )}
        </div>
      </div>

      {/* Hero Event principal — version claire fond site */}
      {mainEvent && (
        <div
          className="rounded-xl mb-6 relative overflow-hidden"
          style={{
            padding: "28px 32px",
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: "linear-gradient(90deg, var(--accent-gold) 0%, var(--bear) 100%)",
            }}
          />
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame size={13} style={{ color: "var(--accent-gold)" }} />
              <span
                className="text-[10px] font-bold"
                style={{ letterSpacing: 2, color: "var(--accent-gold)" }}
              >
                EVENT PRINCIPAL DE LA SEMAINE
                {mainEventCountdown && (
                  <>
                    <span style={{ margin: "0 8px", color: "var(--text-muted)" }}>·</span>
                    <span style={{ color: "var(--text-secondary)" }}>{mainEventCountdown}</span>
                  </>
                )}
              </span>
            </div>
            <span
              className="text-[10px] font-bold tracking-wider"
              style={{
                padding: "3px 8px",
                borderRadius: 4,
                background: "var(--bear-bg)",
                color: "var(--bear)",
              }}
            >
              HIGH IMPACT
            </span>
          </div>
          <div className="flex items-start gap-4 mb-5">
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 44,
                height: 44,
                borderRadius: 12,
                background: `${CURRENCY_COLORS[mainEvent.currency] ?? "var(--accent)"}15`,
                border: `1px solid ${CURRENCY_COLORS[mainEvent.currency] ?? "var(--accent)"}40`,
                color: CURRENCY_COLORS[mainEvent.currency] ?? "var(--accent)",
                fontFamily: "var(--font-mono)",
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 1,
                flexShrink: 0,
              }}
            >
              {mainEvent.currency}
            </div>
            <div className="flex-1 min-w-0">
              <div
                className="text-[11px] font-mono mb-1"
                style={{ color: "var(--text-muted)" }}
              >
                {mainEventFormatted}
              </div>
              <h2
                className="font-medium leading-tight mb-1.5"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 26,
                  color: "var(--text-primary)",
                }}
              >
                {mainEvent.title}
              </h2>
              <p className="text-[13px]" style={{ color: "var(--text-secondary)", maxWidth: 640 }}>
                {mainEvent.forecast || mainEvent.previous ? (
                  <>
                    Consensus{" "}
                    <strong style={{ color: "var(--accent-gold)" }}>
                      {mainEvent.forecast ?? "—"}
                    </strong>
                    <span style={{ margin: "0 6px", color: "var(--text-muted)" }}>·</span>
                    précédent{" "}
                    <strong style={{ color: "var(--text-primary)" }}>
                      {mainEvent.previous ?? "—"}
                    </strong>
                    .{" "}
                  </>
                ) : null}
                {mainEventScenariosCount > 0
                  ? `${mainEventScenariosCount} scénarios préparés.`
                  : "Aucun scénario préparé pour le moment."}
              </p>
            </div>
          </div>
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => {
                setOpenEvent(mainEvent.id);
                document
                  .getElementById(`scenarios-anchor`)
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="text-[12px] font-semibold transition-colors"
              style={{
                padding: "8px 16px",
                borderRadius: 6,
                background: "#0A0B0E",
                color: "#FFFFFF",
                border: "none",
              }}
            >
              Voir les scénarios
            </button>
            <button
              type="button"
              onClick={() => {
                document
                  .getElementById("theses-anchor")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="text-[12px] font-semibold transition-colors"
              style={{
                padding: "8px 16px",
                borderRadius: 6,
                background: "var(--bg-elevated)",
                color: "var(--text-primary)",
                border: "1px solid var(--border)",
              }}
            >
              Éditer ma thèse
            </button>
          </div>
        </div>
      )}

      {/* Calendrier — cards claires groupees par jour */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="section-label">CALENDRIER ECONOMIQUE · S{week.weekNumber}</div>
          <div className="text-[11px] mt-1 font-mono" style={{ color: "var(--text-muted)" }}>
            {formatDateRange(week.startDate, week.endDate)} · {filteredEvents.length} événement{filteredEvents.length > 1 ? "s" : ""} après filtres
          </div>
        </div>
        <div className="text-[11px] font-mono" style={{ color: "var(--text-muted)" }}>
          Dernière mise à jour : {lastUpdateTime}
        </div>
      </div>

      {loadingEvents ? (
        <div
          className="rounded-xl p-6"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}
        >
          <div className="h-10 rounded animate-pulse" style={{ background: "var(--bg-elevated)" }} />
        </div>
      ) : filteredEvents.length === 0 ? (
        <div
          className="rounded-xl px-4 py-16 text-center text-sm"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-light)",
            color: "var(--text-muted)",
          }}
        >
          Aucune annonce pour cette semaine avec ces filtres
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Header colonnes */}
          <div
            className="grid gap-4 px-5 py-2 text-[10px] font-bold uppercase tracking-[1px]"
            style={{
              gridTemplateColumns: "72px 80px 80px 1fr 100px 100px 100px",
              color: "var(--text-muted)",
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
          {DAYS.map((day, i) => {
            const dayEvents = eventsByDay[i];
            if (dayEvents.length === 0) return null;
            const now = new Date();
            const todayDDMM = `${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1).toString().padStart(2, "0")}`;
            const isToday = dates[i] === todayDDMM;
            const isHot = hotDayIdx === i;
            return (
              <div
                key={day}
                className="rounded-xl overflow-hidden"
                style={{
                  background: "var(--bg-card)",
                  border: `1px solid ${isHot ? "var(--bear)" : "var(--border-light)"}`,
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                {/* Header jour */}
                <div
                  className="px-5 py-3 flex items-center gap-3"
                  style={{
                    background: isHot ? "var(--bear-bg)" : "var(--bg-muted)",
                    borderBottom: "1px solid var(--border-light)",
                  }}
                >
                  <h3
                    className="text-sm font-medium"
                    style={{
                      fontFamily: "var(--font-display)",
                      color: isHot ? "var(--bear)" : "var(--text-primary)",
                    }}
                  >
                    {formatDayFull(week.startDate, i)}
                  </h3>
                  {isHot && (
                    <span
                      className="text-[9px] font-bold tracking-[0.15em] px-2 py-0.5 rounded"
                      style={{ background: "var(--accent-gold)", color: "#0a0a0a" }}
                    >
                      POINT CHAUD
                    </span>
                  )}
                  {isToday && (
                    <span
                      className="text-[9px] font-bold tracking-[0.15em] px-2 py-0.5 rounded"
                      style={{ background: "var(--accent)", color: "#FFFFFF" }}
                    >
                      AUJOURD&apos;HUI
                    </span>
                  )}
                  <span
                    className="ml-auto text-[11px] font-mono"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {dayEvents.length} annonce{dayEvents.length > 1 ? "s" : ""}
                  </span>
                </div>

                {/* Events rows */}
                <div>
                  {dayEvents.map((event, idx) => {
                    const isHighImpact = event.impact === "high";
                    const impactColors =
                      event.impact === "high"
                        ? { bg: "var(--bear-bg)", text: "var(--bear)", label: "HAUT" }
                        : event.impact === "medium"
                        ? { bg: "var(--neutral-bg)", text: "var(--neutral-color)", label: "MOY." }
                        : { bg: "var(--bg-muted)", text: "var(--text-muted)", label: "BAS" };
                    const trend = getValueTrend(event.forecast, event.actual);
                    const curColor = CURRENCY_COLORS[event.currency] ?? "var(--accent)";
                    return (
                      <div
                        key={event.id}
                        className="grid gap-4 px-5 py-3 items-center transition-colors"
                        style={{
                          gridTemplateColumns: "72px 80px 80px 1fr 100px 100px 100px",
                          borderBottom:
                            idx < dayEvents.length - 1
                              ? "1px solid var(--border-light)"
                              : "none",
                          background: isHighImpact
                            ? "rgba(255, 46, 99, 0.025)"
                            : "transparent",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLDivElement).style.background =
                            "var(--bg-muted)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLDivElement).style.background =
                            isHighImpact ? "rgba(255, 46, 99, 0.025)" : "transparent";
                        }}
                      >
                        {/* Heure */}
                        <div
                          className="text-sm font-mono"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {event.time}
                        </div>
                        {/* Devise — code + dot, pas de drapeau */}
                        <div>
                          <span
                            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold"
                            style={{
                              background: `${curColor}12`,
                              border: `1px solid ${curColor}40`,
                              color: curColor,
                            }}
                          >
                            <span
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                background: curColor,
                              }}
                            />
                            <span className="font-mono tracking-wider">{event.currency}</span>
                          </span>
                        </div>
                        {/* Impact */}
                        <div>
                          <span
                            className="inline-flex items-center justify-center rounded-md px-2 py-1 text-[10px] font-bold tracking-wider"
                            style={{
                              background: impactColors.bg,
                              color: impactColors.text,
                            }}
                          >
                            {impactColors.label}
                          </span>
                        </div>
                        {/* Événement */}
                        <div
                          className="text-sm font-medium truncate"
                          style={{ color: "var(--text-primary)" }}
                          title={event.title}
                        >
                          {event.title}
                        </div>
                        {/* Consensus */}
                        <div
                          className="text-sm text-right font-mono"
                          style={{ color: event.forecast ? "var(--text-secondary)" : "var(--text-muted)" }}
                        >
                          {event.forecast ?? "—"}
                        </div>
                        {/* Précédent */}
                        <div
                          className="text-sm text-right font-mono"
                          style={{ color: event.previous ? "var(--text-muted)" : "var(--text-muted)" }}
                        >
                          {event.previous ?? "—"}
                        </div>
                        {/* Réel */}
                        <div
                          className="text-sm text-right font-mono font-semibold flex items-center justify-end gap-1"
                          style={{ color: event.actual ? "var(--text-primary)" : "var(--text-muted)" }}
                        >
                          <span>{event.actual ?? "—"}</span>
                          {trend === "up" && <TrendingUp className="w-3 h-3" style={{ color: "var(--bull)" }} />}
                          {trend === "down" && <TrendingDown className="w-3 h-3" style={{ color: "var(--bear)" }} />}
                          {trend === "eq" && <Minus className="w-3 h-3" style={{ color: "var(--text-muted)" }} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loadingEvents && realEvents.length === 0 && (
        <div
          className="text-center text-xs py-3 mt-2"
          style={{ color: "var(--text-muted)" }}
        >
          Aucune annonce Supabase pour cette semaine (S{week.weekNumber})
        </div>
      )}

      {/* Thèses macro — déplacé après le calendrier */}
      <div id="theses-anchor" className="card mt-10">
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
      <div id="scenarios-anchor" className="mt-10">
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

function PillChip({
  label,
  dot,
  active,
  color,
  onClick,
}: {
  label: string;
  dot?: string;
  active: boolean;
  color?: string;
  onClick: () => void;
}) {
  const accent = color ?? "var(--accent)";
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all"
      style={{
        background: active ? `${accent}15` : "var(--bg-card)",
        border: `1px solid ${active ? accent : "var(--border-light)"}`,
        color: active ? accent : "var(--text-secondary)",
      }}
    >
      {dot && (
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: dot,
            flexShrink: 0,
          }}
        />
      )}
      <span className="font-mono tracking-wider">{label}</span>
    </button>
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
