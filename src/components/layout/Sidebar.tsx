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

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ReactNode;
  shortcut?: string;
  section: "workspaces" | "meta";
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Tableau de bord", icon: <LayoutDashboard size={18} />, shortcut: "D", section: "workspaces" },
  { id: "preparation", label: "Preparation semaine", icon: <CalendarRange size={18} />, shortcut: "P", section: "workspaces" },
  { id: "rapport", label: "Rapport journalier", icon: <FileText size={18} />, shortcut: "J", section: "workspaces" },
  { id: "bibliotheque", label: "Bibliotheque", icon: <Library size={18} />, shortcut: "B", section: "workspaces" },
  { id: "parametres", label: "Parametres", icon: <Settings size={18} />, section: "meta" },
];

interface SidebarProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ activePage, onNavigate, collapsed, onToggle }: SidebarProps) {
  const workspaceItems = NAV_ITEMS.filter((i) => i.section === "workspaces");
  const metaItems = NAV_ITEMS.filter((i) => i.section === "meta");

  return (
    <aside className={`sidebar ${collapsed ? "sidebar-collapsed" : ""}`}>
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

      {/* Navigation */}
      <nav className="sidebar-nav">
        {!collapsed && <div className="sidebar-section-label">WORKSPACES</div>}

        {workspaceItems.map((item) => {
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

        {!collapsed && <div className="sidebar-section-label sidebar-section-meta">META</div>}
        {collapsed && <div className="sidebar-divider" />}

        <button type="button" className="sidebar-link" title={collapsed ? "Insights IA" : undefined}>
          <span className="sidebar-link-icon"><Sparkles size={18} /></span>
          {!collapsed && (
            <>
              <span className="sidebar-link-label">Insights IA</span>
              <span className="sidebar-badge-soon">SOON</span>
            </>
          )}
        </button>

        {metaItems.map((item) => (
          <button
            type="button"
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`sidebar-link ${activePage === item.id ? "active" : ""}`}
            title={collapsed ? item.label : undefined}
          >
            <span className="sidebar-link-icon">{item.icon}</span>
            {!collapsed && <span className="sidebar-link-label">{item.label}</span>}
          </button>
        ))}
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
