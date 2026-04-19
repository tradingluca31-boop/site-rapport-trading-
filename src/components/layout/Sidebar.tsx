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
  badge?: string;
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
}

export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
  const workspaceItems = NAV_ITEMS.filter((i) => i.section === "workspaces");
  const metaItems = NAV_ITEMS.filter((i) => i.section === "meta");

  return (
    <aside
      className="fixed top-0 left-0 bottom-0 z-50 flex flex-col border-r"
      style={{
        width: "var(--sidebar-width)",
        background: "var(--bg-sidebar)",
        borderColor: "var(--border-sidebar)",
      }}
    >
      {/* Logo */}
      <div className="px-4 pt-5 pb-4 border-b" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{ background: "var(--accent)" }}
          >
            R
          </div>
          <div>
            <div className="text-white font-semibold text-sm tracking-wide">RAPPORT TRADING</div>
            <div className="text-xs" style={{ color: "var(--accent-gold)", opacity: 0.8 }}>
              V0.1 · L. TRADING DESK
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto">
        <div className="mb-1 px-3">
          <span
            className="text-[9px] font-bold tracking-[2px] uppercase"
            style={{ color: "rgba(138,135,128,0.35)" }}
          >
            WORKSPACES
          </span>
        </div>

        {workspaceItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md mb-0.5 transition-all text-left"
              style={{
                background: isActive ? "rgba(44, 82, 130, 0.12)" : "transparent",
                color: isActive ? "#7EB0E6" : "var(--text-sidebar)",
                borderLeft: isActive ? "3px solid #7EB0E6" : "3px solid transparent",
              }}
            >
              {item.icon}
              <span className="text-[13px] font-medium flex-1">{item.label}</span>
              {item.shortcut && (
                <span
                  className="text-[10px] font-mono opacity-40"
                  style={{ color: "var(--text-sidebar)" }}
                >
                  {item.shortcut}
                </span>
              )}
            </button>
          );
        })}

        <div className="mt-5 mb-1 px-3">
          <span
            className="text-[9px] font-bold tracking-[2px] uppercase"
            style={{ color: "rgba(138,135,128,0.35)" }}
          >
            META
          </span>
        </div>

        <button
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md mb-0.5 transition-all text-left"
          style={{ color: "var(--text-sidebar)" }}
        >
          <Sparkles size={18} />
          <span className="text-[13px] font-medium flex-1">Insights IA</span>
          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded text-white" style={{ background: "var(--accent)" }}>
            SOON
          </span>
        </button>

        {metaItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md mb-0.5 transition-all text-left"
            style={{
              background: activePage === item.id ? "rgba(44, 82, 130, 0.12)" : "transparent",
              color: activePage === item.id ? "#7EB0E6" : "var(--text-sidebar)",
            }}
          >
            {item.icon}
            <span className="text-[13px] font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* User */}
      <div className="px-4 py-3 border-t" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
            style={{ background: "var(--accent)", color: "white" }}
          >
            LT
          </div>
          <div>
            <div className="text-white text-sm font-medium">Luca T.</div>
            <div className="text-[11px]" style={{ color: "var(--text-sidebar)" }}>
              Discretionary · Macro
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
