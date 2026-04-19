"use client";

import { PageId } from "@/types";

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
      className="sticky top-0 z-40 flex items-center justify-between px-48 border-b"
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

    </header>
  );
}
