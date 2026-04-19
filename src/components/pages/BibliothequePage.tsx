"use client";

import { useState } from "react";
import { recentReports } from "@/lib/mock-data";
import { ReportType } from "@/types";
import {
  Search,
  SlidersHorizontal,
  Plus,
  MoreHorizontal,
} from "lucide-react";

type Filter = "tout" | "daily" | "weekly" | "fundamental";

export default function BibliothequePage() {
  const [filter, setFilter] = useState<Filter>("tout");
  const [search, setSearch] = useState("");

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

      <h1 className="text-4xl font-light mb-2" style={{ fontFamily: "var(--font-display)" }}>
        Bibliotheque fondamentale
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
        Tes rapports quotidiens, hebdo et theses fondamentales — consultables, filtrables, chainables.
      </p>

      {/* Search + Filter */}
      <div className="flex items-center gap-5 mb-8">
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
      <div className="grid grid-cols-4 gap-5">
        {filtered.map((r) => (
          <ReportCard key={r.id} report={r} />
        ))}
      </div>
    </div>
  );
}

function ReportCard({ report }: { report: typeof recentReports[0] }) {
  const typeStyles: Record<ReportType, { bg: string; color: string; label: string }> = {
    daily: { bg: "var(--accent-light)", color: "var(--accent)", label: "DAILY" },
    weekly: { bg: "var(--neutral-bg)", color: "var(--neutral-c)", label: "WEEKLY" },
    fundamental: { bg: "var(--accent-gold-light)", color: "var(--accent-gold)", label: "FUNDAMENTAL" },
  };
  const ts = typeStyles[report.type];

  return (
    <div
      className="card p-5 flex flex-col hover:shadow-md transition-shadow cursor-pointer"
      style={{ minHeight: "200px" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className="text-[9px] font-bold px-2 py-0.5 rounded tracking-wider"
            style={{ background: ts.bg, color: ts.color }}
          >
            {ts.label}
          </span>
          <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
            {report.date}
          </span>
        </div>
        <button className="p-0.5 rounded hover:bg-gray-100">
          <MoreHorizontal size={14} style={{ color: "var(--text-muted)" }} />
        </button>
      </div>

      {/* Title */}
      <h3
        className="text-base font-medium mb-2 leading-snug"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {report.title}
      </h3>

      {/* Summary */}
      <p className="text-xs leading-relaxed flex-1 mb-3" style={{ color: "var(--text-secondary)" }}>
        {report.summary}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {report.tags.map((t) => (
            <span key={t} className="tag text-[10px]">#{t}</span>
          ))}
        </div>
        {report.pnlPct !== null && (
          <span
            className="text-xs font-mono font-medium px-1.5 py-0.5 rounded"
            style={{
              background: report.pnlPct > 0 ? "var(--bull-bg)" : report.pnlPct < 0 ? "var(--bear-bg)" : "var(--bg-tag)",
              color: report.pnlPct > 0 ? "var(--bull)" : report.pnlPct < 0 ? "var(--bear)" : "var(--text-muted)",
            }}
          >
            {report.pnlPct > 0 ? "+" : ""}{report.pnlPct}%
          </span>
        )}
      </div>
    </div>
  );
}
