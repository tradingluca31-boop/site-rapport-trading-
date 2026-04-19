"use client";

import { PageId } from "@/types";
import {
  LayoutDashboard,
  CalendarRange,
  FileText,
  Library,
  Sparkles,
  Settings,
} from "lucide-react";

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ReactNode;
  shortcut?: string;
  section: "workspaces" | "meta";
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Tableau de bord", icon: <LayoutDashboard size={16} />, shortcut: "D", section: "workspaces" },
  { id: "preparation", label: "Preparation semaine", icon: <CalendarRange size={16} />, shortcut: "P", section: "workspaces" },
  { id: "rapport", label: "Rapport journalier", icon: <FileText size={16} />, shortcut: "J", section: "workspaces" },
  { id: "bibliotheque", label: "Bibliotheque", icon: <Library size={16} />, shortcut: "B", section: "workspaces" },
  { id: "parametres", label: "Parametres", icon: <Settings size={16} />, section: "meta" },
];

interface SidebarProps {
  activePage: PageId;
  onNavigate: (page: PageId) => void;
}

export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
  const workspaceItems = NAV_ITEMS.filter((i) => i.section === "workspaces");
  const metaItems = NAV_ITEMS.filter((i) => i.section === "meta");

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">R</div>
        <div className="sidebar-logo-text">
          <span className="sidebar-logo-title">RAPPORT TRADING</span>
          <span className="sidebar-logo-sub">V0.1 · L. TRADING DESK</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">WORKSPACES</div>

        {workspaceItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`sidebar-link ${isActive ? "active" : ""}`}
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              <span className="sidebar-link-label">{item.label}</span>
              {item.shortcut && (
                <span className="sidebar-link-shortcut">{item.shortcut}</span>
              )}
            </button>
          );
        })}

        <div className="sidebar-section-label" style={{ marginTop: 24 }}>META</div>

        <button className="sidebar-link">
          <span className="sidebar-link-icon"><Sparkles size={16} /></span>
          <span className="sidebar-link-label">Insights IA</span>
          <span className="sidebar-badge-soon">SOON</span>
        </button>

        {metaItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`sidebar-link ${activePage === item.id ? "active" : ""}`}
          >
            <span className="sidebar-link-icon">{item.icon}</span>
            <span className="sidebar-link-label">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* User */}
      <div className="sidebar-user">
        <div className="sidebar-user-avatar">LT</div>
        <div className="sidebar-user-info">
          <span className="sidebar-user-name">Luca T.</span>
          <span className="sidebar-user-role">Discretionary · Macro</span>
        </div>
      </div>
    </aside>
  );
}
