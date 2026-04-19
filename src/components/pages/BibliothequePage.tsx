"use client";

import { useState } from "react";
import { recentReports } from "@/lib/mock-data";
import { LibraryEntry, ReportType } from "@/types";
import {
  Search,
  SlidersHorizontal,
  Plus,
  MoreHorizontal,
  X,
  Calendar,
  Tag as TagIcon,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

type Filter = "tout" | "daily" | "weekly" | "fundamental";

const TYPE_STYLES: Record<ReportType, { bg: string; color: string; label: string; accent: string }> = {
  daily: { bg: "var(--accent-light)", color: "var(--accent)", label: "DAILY", accent: "var(--accent)" },
  weekly: { bg: "var(--neutral-bg)", color: "var(--neutral-c)", label: "WEEKLY", accent: "var(--neutral-c)" },
  fundamental: { bg: "var(--accent-gold-light)", color: "var(--accent-gold)", label: "FUNDAMENTAL", accent: "var(--accent-gold)" },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export default function BibliothequePage() {
  const [filter, setFilter] = useState<Filter>("tout");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<LibraryEntry | null>(null);

  const filtered = recentReports.filter((r) => {
    if (filter !== "tout" && r.type !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.summary.toLowerCase().includes(q) ||
        r.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <>
      <div className="px-12 py-10 animate-in">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <span className="tag text-xs">{recentReports.length} entrees · archivees</span>
          <div className="flex gap-3">
            <button
              className="flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-medium hover:bg-gray-50"
              style={{ borderColor: "var(--border)" }}
            >
              <SlidersHorizontal size={13} /> Filtres avances
            </button>
            <button
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium text-white"
              style={{ background: "var(--text-primary)" }}
            >
              <Plus size={13} /> Nouvelle these
            </button>
          </div>
        </div>

        <h1 className="text-5xl font-light mb-3" style={{ fontFamily: "var(--font-display)" }}>
          Bibliotheque fondamentale
        </h1>
        <p className="text-[15px] mb-10 max-w-2xl" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-display)", fontStyle: "italic" }}>
          Tes rapports quotidiens, hebdo et theses fondamentales. Clique une carte pour ouvrir le detail.
        </p>

        {/* Search + Filter */}
        <div className="flex items-center gap-5 mb-10">
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Chercher par titre, tag, contenu..."
              className="pl-9"
            />
          </div>
          <div className="flex border rounded-md overflow-hidden" style={{ borderColor: "var(--border)" }}>
            {([
              ["tout", "Tout"],
              ["daily", "Journaliers"],
              ["weekly", "Hebdo"],
              ["fundamental", "Theses"],
            ] as [Filter, string][]).map(([val, label]) => (
              <button
                type="button"
                key={val}
                onClick={() => setFilter(val)}
                className="px-4 py-2 text-xs font-medium transition-colors"
                style={{
                  background: filter === val ? "var(--text-primary)" : "var(--bg-card)",
                  color: filter === val ? "white" : "var(--text-secondary)",
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <span className="text-xs font-mono ml-auto" style={{ color: "var(--text-muted)" }}>
            {filtered.length} resultats
          </span>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-3 gap-6">
          {filtered.map((r) => (
            <ReportCard key={r.id} report={r} onClick={() => setSelected(r)} />
          ))}
        </div>
      </div>

      {selected && <DetailModal report={selected} onClose={() => setSelected(null)} />}
    </>
  );
}

function ReportCard({ report, onClick }: { report: LibraryEntry; onClick: () => void }) {
  const ts = TYPE_STYLES[report.type];
  const hasPnl = report.pnlPct !== null;
  const pnlPositive = hasPnl && report.pnlPct! > 0;
  const pnlNegative = hasPnl && report.pnlPct! < 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className="card relative flex flex-col text-left group overflow-hidden"
      style={{
        minHeight: 280,
        transition: "all 0.2s ease",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 12px 28px rgba(0,0,0,0.10)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "var(--shadow-sm)";
      }}
    >
      {/* Accent bar top */}
      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: ts.accent }} />

      <div className="p-6 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span
              className="text-[9px] font-bold px-2 py-1 rounded tracking-[1.5px]"
              style={{ background: ts.bg, color: ts.color }}
            >
              {ts.label}
            </span>
            <span className="text-[11px] font-mono" style={{ color: "var(--text-muted)" }}>
              {report.date}
            </span>
          </div>
          <button
            type="button"
            title="Options"
            onClick={(e) => e.stopPropagation()}
            className="p-1 rounded hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal size={14} style={{ color: "var(--text-muted)" }} />
          </button>
        </div>

        {/* Title */}
        <h3
          className="text-[19px] mb-3 leading-tight"
          style={{ fontFamily: "var(--font-display)", fontWeight: 500, color: "var(--text-primary)" }}
        >
          {report.title}
        </h3>

        {/* Summary */}
        <p
          className="text-[13px] leading-relaxed flex-1 mb-5 line-clamp-4"
          style={{ color: "var(--text-secondary)" }}
        >
          {report.summary}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t" style={{ borderColor: "var(--border-light)" }}>
          <div className="flex gap-1.5 flex-wrap flex-1 min-w-0">
            {report.tags.slice(0, 3).map((t) => (
              <span key={t} className="tag text-[10px]">#{t}</span>
            ))}
            {report.tags.length > 3 && (
              <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                +{report.tags.length - 3}
              </span>
            )}
          </div>
          {hasPnl && (
            <span
              className="flex items-center gap-1 text-xs font-mono font-semibold px-2 py-1 rounded flex-shrink-0"
              style={{
                background: pnlPositive ? "var(--bull-bg)" : pnlNegative ? "var(--bear-bg)" : "var(--bg-tag)",
                color: pnlPositive ? "var(--bull)" : pnlNegative ? "var(--bear)" : "var(--text-muted)",
              }}
            >
              {pnlPositive && <TrendingUp size={11} />}
              {pnlNegative && <TrendingDown size={11} />}
              {pnlPositive ? "+" : ""}{report.pnlPct}%
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function DetailModal({ report, onClose }: { report: LibraryEntry; onClose: () => void }) {
  const ts = TYPE_STYLES[report.type];
  const hasPnl = report.pnlPct !== null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-in"
      style={{ background: "rgba(15, 15, 15, 0.55)" }}
      onClick={onClose}
    >
      <div
        className="card relative overflow-hidden"
        style={{
          width: "100%",
          maxWidth: 820,
          maxHeight: "88vh",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Accent bar */}
        <div className="absolute top-0 left-0 right-0 h-[4px]" style={{ background: ts.accent }} />

        {/* Header */}
        <div
          className="flex items-start justify-between p-8 pb-6"
          style={{ borderBottom: "1px solid var(--border-light)" }}
        >
          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-center gap-3 mb-4">
              <span
                className="text-[10px] font-bold px-2.5 py-1 rounded tracking-[2px]"
                style={{ background: ts.bg, color: ts.color }}
              >
                {ts.label}
              </span>
              <span className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                <Calendar size={12} />
                {formatDate(report.date)}
              </span>
              {hasPnl && (
                <span
                  className="flex items-center gap-1 text-xs font-mono font-semibold px-2 py-1 rounded"
                  style={{
                    background: report.pnlPct! > 0 ? "var(--bull-bg)" : report.pnlPct! < 0 ? "var(--bear-bg)" : "var(--bg-tag)",
                    color: report.pnlPct! > 0 ? "var(--bull)" : report.pnlPct! < 0 ? "var(--bear)" : "var(--text-muted)",
                  }}
                >
                  {report.pnlPct! > 0 && <TrendingUp size={11} />}
                  {report.pnlPct! < 0 && <TrendingDown size={11} />}
                  {report.pnlPct! > 0 ? "+" : ""}{report.pnlPct}%
                </span>
              )}
            </div>
            <h2
              className="text-3xl leading-tight"
              style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
            >
              {report.title}
            </h2>
          </div>
          <button
            type="button"
            title="Fermer"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 flex-shrink-0"
          >
            <X size={18} style={{ color: "var(--text-muted)" }} />
          </button>
        </div>

        {/* Body scrollable */}
        <div className="flex-1 overflow-y-auto p-8">
          <p
            className="text-[15px] leading-[1.8] mb-6"
            style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)", fontStyle: "italic" }}
          >
            {report.summary}
          </p>

          {report.content && (
            <div className="pt-6 mt-6" style={{ borderTop: "1px solid var(--border-light)" }}>
              <p
                className="text-[14px] leading-[1.85] whitespace-pre-line"
                style={{ color: "var(--text-secondary)" }}
              >
                {report.content}
              </p>
            </div>
          )}

          {!report.content && (
            <div
              className="mt-6 p-5 rounded-lg text-center text-sm"
              style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}
            >
              Le contenu detaille de ce rapport sera affiche ici lorsque tu connecteras la source de donnees (journal du jour ou notes enregistrees).
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between gap-4 px-8 py-5"
          style={{ borderTop: "1px solid var(--border-light)", background: "var(--bg-elevated)" }}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <TagIcon size={13} style={{ color: "var(--text-muted)" }} />
            {report.tags.map((t) => (
              <span key={t} className="tag text-[11px]">#{t}</span>
            ))}
          </div>
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium text-white"
            style={{ background: "var(--text-primary)" }}
          >
            Editer
          </button>
        </div>
      </div>
    </div>
  );
}
