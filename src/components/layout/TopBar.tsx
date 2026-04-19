"use client";

import { PageId } from "@/types";
import { Search, Settings2, Bell } from "lucide-react";

const PAGE_LABELS: Record<PageId, string> = {
  dashboard: "Tableau de bord",
  preparation: "Preparation",
  rapport: "Rapport",
  bibliotheque: "Bibliotheque",
  parametres: "Parametres",
};

interface TopBarProps {
  activePage: PageId;
  subtitle?: string;
}

export default function TopBar({ activePage, subtitle }: TopBarProps) {
  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between px-40 border-b"
      style={{
        height: "var(--topbar-height)",
        background: "var(--bg)",
        borderColor: "var(--border)",
      }}
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span style={{ color: "var(--text-muted)" }}>Workspace</span>
        <span style={{ color: "var(--text-faint)" }}>/</span>
        <span className="font-medium" style={{ color: "var(--text-primary)" }}>
          {PAGE_LABELS[activePage]}
        </span>
        {subtitle && (
          <>
            <span style={{ color: "var(--text-faint)" }}>/</span>
            <span className="font-medium" style={{ color: "var(--text-primary)" }}>
              {subtitle}
            </span>
          </>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border" style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}>
          <Search size={14} style={{ color: "var(--text-muted)" }} />
          <span className="text-sm" style={{ color: "var(--text-muted)" }}>
            Recherche globale
          </span>
          <kbd
            className="ml-6 text-[10px] font-mono px-1.5 py-0.5 rounded border"
            style={{
              borderColor: "var(--border)",
              background: "var(--bg-elevated)",
              color: "var(--text-muted)",
            }}
          >
            {"\u2318"}K
          </kbd>
        </div>

        {/* Tweaks */}
        <button
          className="flex items-center gap-2 px-3 py-1.5 rounded-md border transition-colors hover:border-gray-400"
          style={{ borderColor: "var(--border)", background: "var(--bg-card)" }}
        >
          <Settings2 size={14} style={{ color: "var(--text-secondary)" }} />
          <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
            Tweaks
          </span>
        </button>

        {/* Notifications */}
        <button
          className="p-2 rounded-md transition-colors hover:bg-gray-100"
        >
          <Bell size={16} style={{ color: "var(--text-muted)" }} />
        </button>
      </div>
    </header>
  );
}
