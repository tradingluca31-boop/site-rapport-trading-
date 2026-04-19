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
  FileText,
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
  const [filter] = useState<Filter>("tout");
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

        {/* Search */}
        <div className="flex items-center gap-5 mb-16">
          <div className="relative flex-1 max-w-md">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10"
              style={{ color: "var(--text-muted)" }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Chercher par titre, tag, contenu..."
              style={{ paddingLeft: "38px" }}
            />
          </div>
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
  const pnlPositive = hasPnl && report.pnlPct! > 0;
  const pnlNegative = hasPnl && report.pnlPct! < 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{
        background: "rgba(15, 15, 15, 0.45)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        animation: "fadeIn 0.2s ease-out",
      }}
      onClick={onClose}
    >
      <div
        className="relative overflow-hidden"
        style={{
          width: "100%",
          maxWidth: 760,
          maxHeight: "86vh",
          display: "flex",
          flexDirection: "column",
          background: "var(--bg-card)",
          borderRadius: 14,
          boxShadow: "0 30px 80px rgba(0,0,0,0.25), 0 10px 24px rgba(0,0,0,0.08)",
          border: "1px solid var(--border-light)",
          animation: "fadeIn 0.22s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Accent bar */}
        <div
          className="absolute top-0 left-0 right-0"
          style={{
            height: 3,
            background: `linear-gradient(90deg, ${ts.accent} 0%, ${ts.accent}88 100%)`,
          }}
        />

        {/* Close button (floating) */}
        <button
          type="button"
          title="Fermer"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full transition-colors"
          style={{
            background: "var(--bg-elevated)",
            color: "var(--text-muted)",
            zIndex: 10,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--border)";
            e.currentTarget.style.color = "var(--text-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--bg-elevated)";
            e.currentTarget.style.color = "var(--text-muted)";
          }}
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="px-10 pt-12 pb-7">
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <span
              className="text-[10px] font-bold px-2.5 py-1 rounded tracking-[2px]"
              style={{ background: ts.bg, color: ts.color }}
            >
              {ts.label}
            </span>
            <span
              className="flex items-center gap-1.5 text-[12px]"
              style={{ color: "var(--text-muted)" }}
            >
              <Calendar size={12} />
              {formatDate(report.date)}
            </span>
            {hasPnl && (
              <span
                className="flex items-center gap-1 text-[12px] font-mono font-semibold px-2.5 py-1 rounded"
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
          <h2
            className="leading-[1.15]"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              fontSize: 30,
              color: "var(--text-primary)",
              letterSpacing: "-0.01em",
            }}
          >
            {report.title}
          </h2>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "var(--border-light)", margin: "0 40px" }} />

        {/* Body scrollable */}
        <div className="flex-1 overflow-y-auto px-10 py-8">
          <p
            className="mb-2"
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontSize: 16,
              lineHeight: 1.7,
              color: "var(--text-primary)",
            }}
          >
            {report.summary}
          </p>

          {report.content ? (
            <div className="mt-8 pt-8" style={{ borderTop: "1px solid var(--border-light)" }}>
              <p
                className="whitespace-pre-line"
                style={{
                  fontSize: 14,
                  lineHeight: 1.85,
                  color: "var(--text-secondary)",
                }}
              >
                {report.content}
              </p>
            </div>
          ) : (
            <div
              className="mt-8 flex flex-col items-center justify-center text-center gap-3 py-10 rounded-xl"
              style={{
                background: "var(--bg-elevated)",
                border: "1px dashed var(--border)",
              }}
            >
              <div
                className="flex items-center justify-center rounded-full"
                style={{
                  width: 44,
                  height: 44,
                  background: "var(--bg-card)",
                  color: "var(--text-muted)",
                }}
              >
                <FileText size={18} />
              </div>
              <p
                className="text-[13px] max-w-sm"
                style={{ color: "var(--text-muted)", lineHeight: 1.6 }}
              >
                Le contenu detaille sera affiche ici lorsque tu connecteras la source de donnees (journal du jour ou notes enregistrees).
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between gap-4 px-10 py-5"
          style={{
            borderTop: "1px solid var(--border-light)",
            background: "var(--bg-elevated)",
          }}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <TagIcon size={13} style={{ color: "var(--text-muted)" }} />
            {report.tags.map((t) => (
              <span key={t} className="tag text-[11px]">#{t}</span>
            ))}
          </div>
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-transform"
            style={{ background: "var(--text-primary)" }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            Editer
          </button>
        </div>
      </div>
    </div>
  );
}
