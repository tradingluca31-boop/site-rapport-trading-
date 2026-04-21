"use client";

import { useEffect, useRef, useState } from "react";
import { PageId } from "@/types";
import {
  Bell,
  ChevronDown,
  FileDown,
  Calculator,
  Ruler,
  ArrowLeftRight,
  FileText,
  FileSpreadsheet,
  BookOpen,
  Keyboard,
  LifeBuoy,
  Menu,
} from "lucide-react";

const PAGE_LABELS: Record<PageId, string> = {
  dashboard: "Tableau de bord",
  preparation: "Preparation",
  rapport: "Rapport",
  "track-record": "Track record",
  bibliotheque: "Bibliotheque",
  parametres: "Parametres",
};

interface TopBarProps {
  activePage: PageId;
  subtitle?: string;
  onMobileMenuToggle?: () => void;
}

type MenuKey = "exporter" | "outils" | "aide" | null;

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

const MENUS: Record<Exclude<MenuKey, null>, { label: string; items: MenuItem[] }> = {
  exporter: {
    label: "Exporter",
    items: [
      { label: "PDF (page courante)", icon: <FileText size={14} />, disabled: true },
      { label: "CSV (donnees brutes)", icon: <FileSpreadsheet size={14} />, disabled: true },
      { label: "JSON (archive)", icon: <FileDown size={14} />, disabled: true },
    ],
  },
  outils: {
    label: "Outils",
    items: [
      { label: "Calculatrice risk", icon: <Calculator size={14} />, disabled: true },
      { label: "Position sizing", icon: <Ruler size={14} />, disabled: true },
      { label: "Convertisseur pips", icon: <ArrowLeftRight size={14} />, disabled: true },
    ],
  },
  aide: {
    label: "Aide",
    items: [
      { label: "Documentation", icon: <BookOpen size={14} />, disabled: true },
      { label: "Raccourcis clavier", icon: <Keyboard size={14} />, disabled: true },
      { label: "Contact / Support", icon: <LifeBuoy size={14} />, disabled: true },
    ],
  },
};

export default function TopBar({ activePage, subtitle, onMobileMenuToggle }: TopBarProps) {
  const [openMenu, setOpenMenu] = useState<MenuKey>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpenMenu(null);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <header
      ref={containerRef}
      className="topbar-root sticky top-0 z-40 flex items-center px-10 border-b"
      style={{
        height: "var(--topbar-height)",
        background: "var(--bg)",
        borderColor: "var(--border)",
      }}
    >
      {/* Hamburger — mobile only (CSS controls visibility) */}
      <button
        type="button"
        className="mobile-hamburger"
        onClick={onMobileMenuToggle}
        aria-label="Menu"
      >
        <Menu size={20} />
      </button>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2.5 text-sm">
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

      {/* Separateur vertical */}
      <div
        className="topbar-separator"
        style={{
          width: 1,
          height: 20,
          background: "var(--border)",
          marginLeft: 24,
          marginRight: 16,
        }}
      />

      {/* Menus deroulants (Nested Menu style) */}
      <nav className="topbar-menus flex items-center gap-2">
        {(Object.keys(MENUS) as Array<Exclude<MenuKey, null>>).map((key) => {
          const isOpen = openMenu === key;
          return (
            <div key={key} style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => setOpenMenu(isOpen ? null : key)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-md text-sm transition-colors"
                style={{
                  background: isOpen ? "var(--bg-elevated)" : "transparent",
                  color: isOpen ? "var(--text-primary)" : "var(--text-secondary)",
                  fontWeight: 500,
                }}
              >
                {MENUS[key].label}
                <ChevronDown
                  size={13}
                  style={{
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.15s",
                  }}
                />
              </button>

              {isOpen && (
                <div
                  className="animate-in"
                  style={{
                    position: "absolute",
                    top: "calc(100% + 4px)",
                    left: 0,
                    minWidth: 220,
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    boxShadow: "var(--shadow-md)",
                    padding: 6,
                    zIndex: 60,
                  }}
                >
                  {MENUS[key].items.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      disabled={item.disabled}
                      onClick={() => {
                        item.onClick?.();
                        setOpenMenu(null);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm text-left transition-colors"
                      style={{
                        color: item.disabled ? "var(--text-muted)" : "var(--text-primary)",
                        background: "transparent",
                        cursor: item.disabled ? "not-allowed" : "pointer",
                        opacity: item.disabled ? 0.75 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (!item.disabled) {
                          (e.currentTarget as HTMLButtonElement).style.background =
                            "var(--bg-elevated)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                      }}
                    >
                      <span style={{ color: "var(--text-muted)", display: "flex" }}>
                        {item.icon}
                      </span>
                      <span className="flex-1">{item.label}</span>
                      {item.disabled && (
                        <span
                          style={{
                            fontSize: 9,
                            letterSpacing: 0.5,
                            fontWeight: 700,
                            padding: "2px 5px",
                            borderRadius: 3,
                            background: "var(--bg-tag)",
                            color: "var(--text-muted)",
                          }}
                        >
                          SOON
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Actions droite */}
      <div className="ml-auto flex items-center gap-3">
        <button
          type="button"
          className="flex items-center justify-center rounded-md transition-colors"
          style={{
            width: 32,
            height: 32,
            color: "var(--text-secondary)",
            background: "transparent",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-elevated)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          }}
          title="Notifications"
        >
          <Bell size={16} />
        </button>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "var(--accent)",
            color: "white",
            fontSize: 11,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title="Luca T."
        >
          LT
        </div>
      </div>
    </header>
  );
}
