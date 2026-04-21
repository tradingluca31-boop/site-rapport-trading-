"use client";

import { PageId } from "@/types";
import {
  LayoutDashboard,
  CalendarRange,
  FileText,
  Library,
  Sparkles,
  Settings,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

type Section = "trading" | "analyse" | "reference";

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ReactNode;
  shortcut?: string;
  section: Section;
}

const SECTION_LABELS: Record<Section, string> = {
  trading: "TRADING",
  analyse: "ANALYSE",
  reference: "REFERENCE",
};

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Tableau de bord", icon: <LayoutDashboard size={18} />, shortcut: "D", section: "trading" },
  { id: "preparation", label: "Preparation semaine", icon: <CalendarRange size={18} />, shortcut: "P", section: "analyse" },
  { id: "rapport", label: "Rapport journalier", icon: <FileText size={18} />, shortcut: "J", section: "analyse" },
  { id: "bibliotheque", label: "Bibliotheque", icon: <Library size={18} />, shortcut: "B", section: "reference" },
  { id: "parametres", label: "Parametres", icon: <Settings size={18} />, section: "reference" },
];

interface SidebarProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen?: boolean;
}

export default function Sidebar({ activePage, onNavigate, collapsed, onToggle, mobileOpen }: SidebarProps) {
  const sections: Section[] = ["trading", "analyse", "reference"];

  return (
    <aside className={`sidebar ${collapsed ? "sidebar-collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">R</div>
        {!collapsed && (
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-title">RAPPORT TRADING</span>
            <span className="sidebar-logo-sub">V0.1 · L. TRADING DESK</span>
          </div>
        )}
        <button type="button" className="sidebar-toggle" onClick={onToggle}>
          {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
        </button>
      </div>

      {/* Navigation — 3 sections (Sidebar B) */}
      <nav className="sidebar-nav">
        {sections.map((sec, idx) => {
          const items = NAV_ITEMS.filter((i) => i.section === sec);
          if (items.length === 0) return null;
          return (
            <div key={sec} className={idx > 0 ? "sidebar-section-meta" : undefined}>
              {!collapsed && (
                <div className="sidebar-section-label">{SECTION_LABELS[sec]}</div>
              )}
              {collapsed && idx > 0 && <div className="sidebar-divider" />}

              {items.map((item) => {
                const isActive = activePage === item.id;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`sidebar-link ${isActive ? "active" : ""}`}
                    title={collapsed ? item.label : undefined}
                  >
                    <span className="sidebar-link-icon">{item.icon}</span>
                    {!collapsed && (
                      <>
                        <span className="sidebar-link-label">{item.label}</span>
                        {item.shortcut && (
                          <span className="sidebar-link-shortcut">{item.shortcut}</span>
                        )}
                      </>
                    )}
                  </button>
                );
              })}

              {/* Insights IA placeholder dans ANALYSE */}
              {sec === "analyse" && (
                <button
                  type="button"
                  className="sidebar-link"
                  title={collapsed ? "Insights IA" : undefined}
                >
                  <span className="sidebar-link-icon">
                    <Sparkles size={18} />
                  </span>
                  {!collapsed && (
                    <>
                      <span className="sidebar-link-label">Insights IA</span>
                      <span className="sidebar-badge-soon">SOON</span>
                    </>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </nav>

      {/* User */}
      <div className="sidebar-user">
        <div className="sidebar-user-avatar">LT</div>
        {!collapsed && (
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">Luca T.</span>
            <span className="sidebar-user-role">Discretionary · Macro</span>
          </div>
        )}
      </div>
    </aside>
  );
}
