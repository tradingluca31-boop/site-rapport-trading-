"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Library,
  Settings,
  CalendarRange,
  Search,
  Bell,
  ChevronDown,
  BarChart3,
  TrendingUp,
  Activity,
  Menu,
  User,
  Sparkles,
} from "lucide-react";

type Choice = { sidebar: "A" | "B" | "C" | null; topbar: "1" | "2" | "3" | null };

export default function PreviewDesignPage() {
  const [choice, setChoice] = useState<Choice>({ sidebar: null, topbar: null });

  return (
    <div style={{ minHeight: "100vh", background: "#f1efea", padding: "40px 32px" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <header style={{ marginBottom: 40 }}>
          <div className="section-label">DESIGN PREVIEW · MCP 21ST</div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 32,
              fontWeight: 700,
              marginTop: 8,
              color: "var(--text-primary)",
            }}
          >
            Choisis ta Sidebar + ta TopBar
          </h1>
          <p style={{ color: "var(--text-secondary)", marginTop: 6 }}>
            Clique sur les variantes qui te plaisent. Ton choix s&apos;affiche en bas — dis-moi
            quand c&apos;est bon, j&apos;integre.
          </p>
        </header>

        {/* SIDEBARS */}
        <section style={{ marginBottom: 56 }}>
          <h2 style={sectionTitle}>Sidebar — 3 variantes</h2>
          <div style={grid3}>
            <VariantCard
              label="Option A — Collapsible Sidebar"
              sub="Sidebar shadcn classique, groupes + profil footer"
              selected={choice.sidebar === "A"}
              onSelect={() => setChoice({ ...choice, sidebar: "A" })}
            >
              <SidebarMockA />
            </VariantCard>

            <VariantCard
              label="Option B — Structured Sidebar"
              sub="Sections delimites, sous-categories, dense"
              selected={choice.sidebar === "B"}
              onSelect={() => setChoice({ ...choice, sidebar: "B" })}
            >
              <SidebarMockB />
            </VariantCard>

            <VariantCard
              label="Option C — Toggle Nav"
              sub="Nav retractable icones + animations"
              selected={choice.sidebar === "C"}
              onSelect={() => setChoice({ ...choice, sidebar: "C" })}
            >
              <SidebarMockC />
            </VariantCard>
          </div>
        </section>

        {/* TOPBARS */}
        <section style={{ marginBottom: 56 }}>
          <h2 style={sectionTitle}>TopBar — 3 variantes</h2>
          <div style={grid3}>
            <VariantCard
              label="Option 1 — Header 05"
              sub="Breadcrumb + recherche + actions (notifs, avatar)"
              selected={choice.topbar === "1"}
              onSelect={() => setChoice({ ...choice, topbar: "1" })}
            >
              <TopbarMock1 />
            </VariantCard>

            <VariantCard
              label="Option 2 — Financial Topbar"
              sub="Infos marche live, tickers, horloge"
              selected={choice.topbar === "2"}
              onSelect={() => setChoice({ ...choice, topbar: "2" })}
            >
              <TopbarMock2 />
            </VariantCard>

            <VariantCard
              label="Option 3 — Nested Menu"
              sub="Menus deroulants multi-niveaux"
              selected={choice.topbar === "3"}
              onSelect={() => setChoice({ ...choice, topbar: "3" })}
            >
              <TopbarMock3 />
            </VariantCard>
          </div>
        </section>

        {/* CHOIX */}
        <section
          style={{
            position: "sticky",
            bottom: 24,
            padding: "20px 28px",
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            boxShadow: "var(--shadow-md)",
            display: "flex",
            alignItems: "center",
            gap: 32,
          }}
        >
          <div>
            <div className="section-label">TON CHOIX</div>
            <div style={{ marginTop: 8, fontSize: 18, fontWeight: 600 }}>
              Sidebar :{" "}
              <span style={{ color: choice.sidebar ? "var(--accent)" : "var(--text-muted)" }}>
                {choice.sidebar ? `Option ${choice.sidebar}` : "pas encore choisi"}
              </span>
              <span style={{ margin: "0 16px", color: "var(--border)" }}>|</span>
              TopBar :{" "}
              <span style={{ color: choice.topbar ? "var(--accent)" : "var(--text-muted)" }}>
                {choice.topbar ? `Option ${choice.topbar}` : "pas encore choisi"}
              </span>
            </div>
          </div>
          <div style={{ marginLeft: "auto" }}>
            {choice.sidebar && choice.topbar ? (
              <div
                style={{
                  padding: "10px 20px",
                  background: "var(--bull-bg)",
                  color: "var(--bull)",
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                OK · dis a Claude &quot;Sidebar {choice.sidebar} + TopBar {choice.topbar}&quot;
              </div>
            ) : (
              <div
                style={{
                  padding: "10px 20px",
                  background: "var(--bg-elevated)",
                  color: "var(--text-muted)",
                  borderRadius: 8,
                  fontSize: 13,
                }}
              >
                Selectionne les 2 options
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

const sectionTitle: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: 22,
  fontWeight: 700,
  color: "var(--text-primary)",
  marginBottom: 20,
};

const grid3: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 20,
};

function VariantCard({
  label,
  sub,
  selected,
  onSelect,
  children,
}: {
  label: string;
  sub: string;
  selected: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onSelect}
      style={{
        cursor: "pointer",
        background: "var(--bg-card)",
        border: selected ? "2px solid var(--accent)" : "1px solid var(--border)",
        borderRadius: 12,
        padding: 0,
        overflow: "hidden",
        boxShadow: selected ? "0 0 0 3px rgba(44,82,130,0.12)" : "var(--shadow-sm)",
        textAlign: "left",
        transition: "all 0.15s",
        fontFamily: "inherit",
      }}
    >
      <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border-light)" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{label}</div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{sub}</div>
      </div>
      <div style={{ background: "#fafafa", padding: 12, minHeight: 280 }}>{children}</div>
      <div
        style={{
          padding: "10px 16px",
          borderTop: "1px solid var(--border-light)",
          background: selected ? "var(--accent-light)" : "transparent",
          color: selected ? "var(--accent)" : "var(--text-muted)",
          fontSize: 12,
          fontWeight: 600,
          textAlign: "center",
        }}
      >
        {selected ? "✓ Selectionne" : "Cliquer pour choisir"}
      </div>
    </button>
  );
}

/* ====== SIDEBAR MOCKS ====== */

function SidebarMockA() {
  return (
    <div style={mockShell}>
      <div style={{ ...mockSidebar, background: "#fafafa" }}>
        <div style={mockLogoBlock}>
          <div style={mockLogoDot} />
          <div style={{ fontSize: 10, fontWeight: 700 }}>RAPPORT TRADING</div>
        </div>
        <div style={mockLabel}>PLATEFORME</div>
        <SideItem icon={<LayoutDashboard size={12} />} label="Tableau de bord" active />
        <SideItem icon={<CalendarRange size={12} />} label="Preparation" />
        <SideItem icon={<FileText size={12} />} label="Rapport journalier" />
        <SideItem icon={<Library size={12} />} label="Bibliotheque" />
        <div style={mockLabel}>META</div>
        <SideItem icon={<Sparkles size={12} />} label="Insights IA" />
        <SideItem icon={<Settings size={12} />} label="Parametres" />
        <div
          style={{
            marginTop: "auto",
            borderTop: "1px solid #eee",
            padding: "8px 6px",
            display: "flex",
            gap: 6,
            alignItems: "center",
          }}
        >
          <div style={mockAvatar}>LT</div>
          <div style={{ fontSize: 9 }}>
            <div style={{ fontWeight: 600 }}>Luca T.</div>
            <div style={{ color: "#999" }}>Macro</div>
          </div>
        </div>
      </div>
      <div style={mockContent}>contenu…</div>
    </div>
  );
}

function SidebarMockB() {
  return (
    <div style={mockShell}>
      <div style={{ ...mockSidebar, background: "#fafafa" }}>
        <div style={mockLogoBlock}>
          <div style={mockLogoDot} />
          <div style={{ fontSize: 10, fontWeight: 700 }}>RAPPORT</div>
        </div>

        <div style={mockLabel}>TRADING</div>
        <SideItem icon={<LayoutDashboard size={12} />} label="Dashboard" active />
        <SideItem icon={<TrendingUp size={12} />} label="Positions" />
        <SideItem icon={<Activity size={12} />} label="Performance" />

        <div style={mockLabel}>ANALYSE</div>
        <SideItem icon={<CalendarRange size={12} />} label="Preparation" />
        <SideItem icon={<FileText size={12} />} label="Journal" />
        <SideItem icon={<BarChart3 size={12} />} label="Statistiques" />

        <div style={mockLabel}>REF.</div>
        <SideItem icon={<Library size={12} />} label="Bibliotheque" />
        <SideItem icon={<Settings size={12} />} label="Parametres" />
      </div>
      <div style={mockContent}>contenu…</div>
    </div>
  );
}

function SidebarMockC() {
  return (
    <div style={mockShell}>
      <div style={{ ...mockSidebar, width: 44, padding: "10px 4px", background: "#fafafa" }}>
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            background: "var(--accent)",
            margin: "2px auto 10px",
          }}
        />
        <SideIconOnly icon={<LayoutDashboard size={14} />} active />
        <SideIconOnly icon={<CalendarRange size={14} />} />
        <SideIconOnly icon={<FileText size={14} />} />
        <SideIconOnly icon={<Library size={14} />} />
        <SideIconOnly icon={<BarChart3 size={14} />} />
        <div style={{ marginTop: "auto" }}>
          <SideIconOnly icon={<Settings size={14} />} />
          <SideIconOnly icon={<Menu size={14} />} />
        </div>
      </div>
      <div style={mockContent}>
        <div style={{ fontSize: 9, color: "#999", textAlign: "center", marginBottom: 6 }}>
          ← clic pour deplier
        </div>
        contenu…
      </div>
    </div>
  );
}

/* ====== TOPBAR MOCKS ====== */

function TopbarMock1() {
  return (
    <div style={mockShell}>
      <div style={{ width: "100%" }}>
        <div
          style={{
            height: 36,
            background: "#fafafa",
            borderBottom: "1px solid #e8e2d8",
            display: "flex",
            alignItems: "center",
            padding: "0 12px",
            gap: 12,
            fontSize: 10,
          }}
        >
          <span style={{ color: "#999" }}>Workspace</span>
          <span style={{ color: "#c4bfb4" }}>/</span>
          <span style={{ fontWeight: 600 }}>Preparation</span>
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "4px 10px",
              border: "1px solid #e8e2d8",
              borderRadius: 6,
              background: "white",
              width: 160,
            }}
          >
            <Search size={11} color="#999" />
            <span style={{ color: "#c4bfb4", fontSize: 9 }}>Rechercher…</span>
          </div>
          <Bell size={13} color="#555" />
          <div style={mockAvatar}>LT</div>
        </div>
        <div style={{ ...mockContentOnly, paddingTop: 16 }}>contenu de la page…</div>
      </div>
    </div>
  );
}

function TopbarMock2() {
  return (
    <div style={mockShell}>
      <div style={{ width: "100%" }}>
        <div
          style={{
            height: 44,
            background: "#fafafa",
            borderBottom: "1px solid #e8e2d8",
            display: "flex",
            alignItems: "center",
            padding: "0 12px",
            gap: 10,
            fontSize: 9,
          }}
        >
          <span style={{ fontWeight: 600, fontSize: 10 }}>Preparation</span>
          <div style={{ display: "flex", gap: 6, marginLeft: 12 }}>
            <Ticker label="XAUUSD" val="3284.5" up />
            <Ticker label="EURUSD" val="1.0842" up />
            <Ticker label="DXY" val="104.12" />
            <Ticker label="US10Y" val="4.32%" />
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                padding: "2px 6px",
                background: "var(--bull-bg)",
                color: "var(--bull)",
                borderRadius: 4,
                fontWeight: 600,
              }}
            >
              MARCHE OUVERT
            </span>
            <span style={{ fontFamily: "monospace" }}>17:03 GMT</span>
            <div style={mockAvatar}>LT</div>
          </div>
        </div>
        <div style={{ ...mockContentOnly, paddingTop: 16 }}>contenu de la page…</div>
      </div>
    </div>
  );
}

function TopbarMock3() {
  return (
    <div style={mockShell}>
      <div style={{ width: "100%" }}>
        <div
          style={{
            height: 40,
            background: "#fafafa",
            borderBottom: "1px solid #e8e2d8",
            display: "flex",
            alignItems: "center",
            padding: "0 12px",
            gap: 16,
            fontSize: 10,
          }}
        >
          <span style={{ fontWeight: 600 }}>Rapport Trading</span>
          <NestedItem label="Analyse" />
          <NestedItem label="Trading" />
          <NestedItem label="Rapports" />
          <NestedItem label="Outils" />
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Bell size={12} color="#555" />
            <User size={12} color="#555" />
          </div>
        </div>
        {/* dropdown hint */}
        <div
          style={{
            position: "relative",
            height: 0,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 120,
              background: "white",
              border: "1px solid #e8e2d8",
              borderRadius: 6,
              padding: "6px 8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              fontSize: 9,
              minWidth: 120,
              zIndex: 1,
            }}
          >
            <div style={{ padding: "3px 4px" }}>- Vue technique</div>
            <div style={{ padding: "3px 4px" }}>- Vue fondamentale</div>
            <div style={{ padding: "3px 4px" }}>- Calendrier eco</div>
          </div>
        </div>
        <div style={{ ...mockContentOnly, paddingTop: 80 }}>contenu de la page…</div>
      </div>
    </div>
  );
}

/* ====== SHARED PRIMITIVES ====== */

const mockShell: React.CSSProperties = {
  display: "flex",
  height: 260,
  background: "white",
  border: "1px solid #e8e2d8",
  borderRadius: 6,
  overflow: "hidden",
  fontSize: 10,
};

const mockSidebar: React.CSSProperties = {
  width: 110,
  padding: "8px 6px",
  borderRight: "1px solid #eee",
  display: "flex",
  flexDirection: "column",
  gap: 2,
};

const mockContent: React.CSSProperties = {
  flex: 1,
  padding: 12,
  color: "#c4bfb4",
  fontSize: 10,
};

const mockContentOnly: React.CSSProperties = {
  padding: 12,
  color: "#c4bfb4",
  fontSize: 10,
};

const mockLabel: React.CSSProperties = {
  fontSize: 7,
  letterSpacing: 1.5,
  color: "#c4bfb4",
  padding: "6px 6px 3px",
  fontWeight: 700,
};

const mockLogoBlock: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "4px 6px 10px",
  borderBottom: "1px solid #eee",
  marginBottom: 6,
};

const mockLogoDot: React.CSSProperties = {
  width: 18,
  height: 18,
  borderRadius: 4,
  background: "var(--accent)",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 9,
  fontWeight: 700,
};

const mockAvatar: React.CSSProperties = {
  width: 18,
  height: 18,
  borderRadius: "50%",
  background: "var(--accent)",
  color: "white",
  fontSize: 8,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 600,
};

function SideItem({
  icon,
  label,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 6px",
        borderRadius: 4,
        background: active ? "rgba(44,82,130,0.10)" : "transparent",
        color: active ? "var(--accent)" : "#555",
        fontSize: 9,
        fontWeight: active ? 600 : 500,
      }}
    >
      <span style={{ display: "flex" }}>{icon}</span>
      <span>{label}</span>
    </div>
  );
}

function SideIconOnly({ icon, active }: { icon: React.ReactNode; active?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 6,
        borderRadius: 4,
        background: active ? "rgba(44,82,130,0.10)" : "transparent",
        color: active ? "var(--accent)" : "#555",
        margin: "2px auto",
      }}
    >
      {icon}
    </div>
  );
}

function Ticker({ label, val, up }: { label: string; val: string; up?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 6px",
        background: "white",
        borderRadius: 4,
        border: "1px solid #eee",
      }}
    >
      <span style={{ fontWeight: 600 }}>{label}</span>
      <span
        style={{
          color: up ? "var(--bull)" : "var(--text-secondary)",
          fontFamily: "monospace",
        }}
      >
        {val}
      </span>
    </div>
  );
}

function NestedItem({ label }: { label: string }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 2, color: "#555" }}>
      {label}
      <ChevronDown size={10} />
    </span>
  );
}

