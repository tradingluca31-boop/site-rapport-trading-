"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageId } from "@/types";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import DashboardPage from "@/components/pages/DashboardPage";
import PreparationPage from "@/components/pages/PreparationPage";
import RapportPage from "@/components/pages/RapportPage";
import TrackRecordPage from "@/components/pages/TrackRecordPage";
import FondamentauxPage from "@/components/pages/FondamentauxPage";
import BibliothequePage from "@/components/pages/BibliothequePage";

const PAGE_ROUTES: Record<PageId, string> = {
  dashboard: "/",
  preparation: "/preparation",
  rapport: "/rapport",
  "track-record": "/track-record",
  fondamentaux: "/fondamentaux",
  bibliotheque: "/bibliotheque",
  parametres: "/parametres",
};

export default function AppShell({ initialPage }: { initialPage: PageId }) {
  const router = useRouter();
  const [activePage, setActivePage] = useState<PageId>(initialPage);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const subtitles: Partial<Record<PageId, string>> = {
    preparation: "Semaine 16",
    rapport: "14 avril 2026",
  };

  const handleNavigate = (page: PageId) => {
    setActivePage(page);
    setMobileOpen(false);
    router.push(PAGE_ROUTES[page]);
  };

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        activePage={activePage}
        onNavigate={handleNavigate}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileOpen}
      />

      {mobileOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <main
        className="main-content flex-1 min-w-0 overflow-x-hidden transition-[margin] duration-200"
        style={{
          marginLeft: sidebarCollapsed ? "var(--sidebar-collapsed)" : "var(--sidebar-width)",
        }}
      >
        <TopBar
          activePage={activePage}
          subtitle={subtitles[activePage]}
          onMobileMenuToggle={() => setMobileOpen((o) => !o)}
        />

        {activePage === "dashboard" && <DashboardPage onNavigate={handleNavigate} />}
        {activePage === "preparation" && <PreparationPage />}
        {activePage === "rapport" && <RapportPage />}
        {activePage === "track-record" && <TrackRecordPage />}
        {activePage === "fondamentaux" && <FondamentauxPage />}
        {activePage === "bibliotheque" && <BibliothequePage />}
        {activePage === "parametres" && (
          <div className="page-root px-10 py-12 text-center">
            <h1 className="text-2xl font-light mb-2" style={{ fontFamily: "var(--font-display)" }}>
              Parametres
            </h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Configuration, tweaks, et preferences — bientot disponible.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
