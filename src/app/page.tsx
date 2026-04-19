"use client";

import { useState } from "react";
import { PageId } from "@/types";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import DashboardPage from "@/components/pages/DashboardPage";
import PreparationPage from "@/components/pages/PreparationPage";
import RapportPage from "@/components/pages/RapportPage";
import BibliothequePage from "@/components/pages/BibliothequePage";

export default function Home() {
  const [activePage, setActivePage] = useState<PageId>("dashboard");

  const subtitles: Partial<Record<PageId, string>> = {
    preparation: "Semaine 16",
    rapport: "14 avril 2026",
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      <main className="flex-1" style={{ marginLeft: "var(--sidebar-width)" }}>
        <TopBar activePage={activePage} subtitle={subtitles[activePage]} />

        {activePage === "dashboard" && <DashboardPage onNavigate={setActivePage} />}
        {activePage === "preparation" && <PreparationPage />}
        {activePage === "rapport" && <RapportPage />}
        {activePage === "bibliotheque" && <BibliothequePage />}
        {activePage === "parametres" && (
          <div className="max-w-[900px] mx-auto px-6 py-12 text-center">
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
