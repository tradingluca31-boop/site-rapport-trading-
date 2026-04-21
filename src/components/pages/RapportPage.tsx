"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Lightbulb,
  Target,
  Newspaper,
  Plus,
  Pencil,
  X as XIcon,
  Check,
  Trash2,
} from "lucide-react";

const ACCENT = "#7C5CFF";
const GREEN = "#08D9D6";
const RED = "#FF2E63";
const GOLD = "#C59E3A";

type Sentiment = "hawkish" | "dovish" | "neutral";
type TradeDirection = "long" | "short";
type TradeStatus = "open" | "closed-win" | "closed-loss";

type FondaEntry = {
  id: string;
  time: string;
  title: string;
  summary: string;
  sentiment: Sentiment;
};

type TradeEntry = {
  id: string;
  time: string;
  pair: string;
  direction: TradeDirection;
  entry: string;
  sl: string;
  tp: string;
  size: string;
  status: TradeStatus;
  idea: string;
  pnl: string;
};

type Idea = { id: string; text: string };

type DayReport = {
  editoTitle: string;
  editoSummary: string;
  fonda: FondaEntry[];
  trades: TradeEntry[];
  ideas: Idea[];
};

const EMPTY_DAY: DayReport = {
  editoTitle: "",
  editoSummary: "",
  fonda: [],
  trades: [],
  ideas: [],
};

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatTodayHeader() {
  const now = new Date();
  const weekday = now.toLocaleDateString("fr-FR", { weekday: "long" }).toUpperCase();
  const full = now.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return { weekday, full };
}

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function RapportPage() {
  const dayKey = todayKey();
  const header = formatTodayHeader();

  const [data, setData] = useState<DayReport>(EMPTY_DAY);
  const [editingEdito, setEditingEdito] = useState(false);
  const [draftEdito, setDraftEdito] = useState({ title: "", summary: "" });

  const [fondaFormOpen, setFondaFormOpen] = useState(false);
  const [newFonda, setNewFonda] = useState<Omit<FondaEntry, "id">>({
    time: "",
    title: "",
    summary: "",
    sentiment: "neutral",
  });

  const [tradeFormOpen, setTradeFormOpen] = useState(false);
  const [newTrade, setNewTrade] = useState<Omit<TradeEntry, "id">>({
    time: "",
    pair: "",
    direction: "long",
    entry: "",
    sl: "",
    tp: "",
    size: "",
    status: "open",
    idea: "",
    pnl: "",
  });

  const [newIdea, setNewIdea] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(`rapport-${dayKey}`);
      setData(raw ? (JSON.parse(raw) as DayReport) : EMPTY_DAY);
    } catch {
      setData(EMPTY_DAY);
    }
  }, [dayKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(`rapport-${dayKey}`, JSON.stringify(data));
  }, [data, dayKey]);

  const pnlTotal = data.trades.reduce((acc, t) => {
    const n = parseFloat(t.pnl.replace(/[^\d.-]/g, ""));
    return acc + (isNaN(n) ? 0 : t.pnl.startsWith("-") ? -Math.abs(n) : Math.abs(n));
  }, 0);
  const wins = data.trades.filter((t) => t.status === "closed-win").length;
  const losses = data.trades.filter((t) => t.status === "closed-loss").length;
  const opens = data.trades.filter((t) => t.status === "open").length;

  const saveEdito = () => {
    setData((prev) => ({ ...prev, editoTitle: draftEdito.title, editoSummary: draftEdito.summary }));
    setEditingEdito(false);
  };

  const addFonda = () => {
    if (!newFonda.title.trim()) return;
    setData((prev) => ({ ...prev, fonda: [...prev.fonda, { ...newFonda, id: newId() }] }));
    setNewFonda({ time: "", title: "", summary: "", sentiment: "neutral" });
    setFondaFormOpen(false);
  };

  const deleteFonda = (id: string) => {
    setData((prev) => ({ ...prev, fonda: prev.fonda.filter((f) => f.id !== id) }));
  };

  const addTrade = () => {
    if (!newTrade.pair.trim()) return;
    setData((prev) => ({ ...prev, trades: [...prev.trades, { ...newTrade, id: newId() }] }));
    setNewTrade({
      time: "",
      pair: "",
      direction: "long",
      entry: "",
      sl: "",
      tp: "",
      size: "",
      status: "open",
      idea: "",
      pnl: "",
    });
    setTradeFormOpen(false);
  };

  const deleteTrade = (id: string) => {
    setData((prev) => ({ ...prev, trades: prev.trades.filter((t) => t.id !== id) }));
  };

  const addIdea = () => {
    if (!newIdea.trim()) return;
    setData((prev) => ({ ...prev, ideas: [...prev.ideas, { id: newId(), text: newIdea.trim() }] }));
    setNewIdea("");
  };

  const deleteIdea = (id: string) => {
    setData((prev) => ({ ...prev, ideas: prev.ideas.filter((i) => i.id !== id) }));
  };

  return (
    <div className="page-root" style={{ padding: "40px 32px", background: "var(--bg-page, #FAFAF9)", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1440, margin: "0 auto" }}>
        <header style={{ marginBottom: 36 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 2,
              color: "var(--text-muted, #6B7280)",
              marginBottom: 6,
            }}
          >
            {header.weekday} — RAPPORT DE SESSION
          </div>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 300,
              letterSpacing: "-0.01em",
              fontFamily: "var(--font-display, Georgia, serif)",
            }}
          >
            {header.full}
          </h1>
        </header>

        <div className="mobile-stack" style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: 28 }}>
          <main style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <EditoCard
              title={data.editoTitle}
              summary={data.editoSummary}
              editing={editingEdito}
              draft={draftEdito}
              onDraftChange={setDraftEdito}
              onEdit={() => {
                setDraftEdito({ title: data.editoTitle, summary: data.editoSummary });
                setEditingEdito(true);
              }}
              onSave={saveEdito}
              onCancel={() => setEditingEdito(false)}
            />

            <Section
              icon={<Newspaper size={16} />}
              title="FONDAMENTAL"
              accent={ACCENT}
              onAdd={() => setFondaFormOpen((v) => !v)}
              addOpen={fondaFormOpen}
            >
              {fondaFormOpen && (
                <FondaForm
                  value={newFonda}
                  onChange={setNewFonda}
                  onCancel={() => setFondaFormOpen(false)}
                  onSave={addFonda}
                />
              )}
              {data.fonda.length === 0 && !fondaFormOpen && (
                <EmptyState text="Aucune entree fondamentale pour aujourd'hui." />
              )}
              {data.fonda.length > 0 && (
                <div className="mobile-stack" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                  {data.fonda.map((f) => (
                    <FondaCard key={f.id} fonda={f} onDelete={() => deleteFonda(f.id)} />
                  ))}
                </div>
              )}
            </Section>

            <Section
              icon={<Target size={16} />}
              title="TRADES DU JOUR"
              accent={GREEN}
              onAdd={() => setTradeFormOpen((v) => !v)}
              addOpen={tradeFormOpen}
            >
              {tradeFormOpen && (
                <TradeForm
                  value={newTrade}
                  onChange={setNewTrade}
                  onCancel={() => setTradeFormOpen(false)}
                  onSave={addTrade}
                />
              )}
              {data.trades.length === 0 && !tradeFormOpen && (
                <EmptyState text="Aucun trade enregistre aujourd'hui." />
              )}
              {data.trades.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {data.trades.map((t) => (
                    <TradeCard key={t.id} trade={t} onDelete={() => deleteTrade(t.id)} />
                  ))}
                </div>
              )}
            </Section>
          </main>

          <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <PnlCard pnl={pnlTotal} wins={wins} losses={losses} opens={opens} />
            <IdeasCard
              ideas={data.ideas}
              newIdea={newIdea}
              onNewIdeaChange={setNewIdea}
              onAdd={addIdea}
              onDelete={deleteIdea}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}

function EditoCard({
  title,
  summary,
  editing,
  draft,
  onDraftChange,
  onEdit,
  onSave,
  onCancel,
}: {
  title: string;
  summary: string;
  editing: boolean;
  draft: { title: string; summary: string };
  onDraftChange: (v: { title: string; summary: string }) => void;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const empty = !title && !summary;
  return (
    <div
      style={{
        position: "relative",
        background: "white",
        borderRadius: 20,
        border: "1px solid var(--border, #E5E7EB)",
        padding: 36,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${ACCENT}, ${GREEN})`,
        }}
      />
      <div style={{ position: "absolute", top: 16, right: 16, display: "flex", gap: 6 }}>
        {!editing ? (
          <button
            type="button"
            onClick={onEdit}
            title="Modifier l'edito"
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "white",
              border: `1px solid ${ACCENT}30`,
              color: ACCENT,
              boxShadow: `0 2px 6px ${ACCENT}20`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <Pencil size={14} />
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={onCancel}
              title="Annuler"
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "white",
                border: "1px solid rgba(0,0,0,0.08)",
                color: "var(--text-muted, #6B7280)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <XIcon size={14} />
            </button>
            <button
              type="button"
              onClick={onSave}
              title="Enregistrer"
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: ACCENT,
                border: "none",
                color: "white",
                boxShadow: `0 2px 6px ${ACCENT}40`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <Check size={14} />
            </button>
          </>
        )}
      </div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: 2,
          color: "var(--text-muted, #6B7280)",
          marginBottom: 12,
        }}
      >
        EDITO DU JOUR
      </div>

      {editing ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="text"
            value={draft.title}
            onChange={(e) => onDraftChange({ ...draft, title: e.target.value })}
            placeholder="Titre du jour (ex: CPI hot renverse la narrative disinflation...)"
            aria-label="Titre edito"
            style={{
              fontSize: 24,
              fontWeight: 400,
              fontFamily: "Georgia, serif",
              padding: 12,
              borderRadius: 10,
              border: "1px solid rgba(0,0,0,0.1)",
              outline: "none",
              width: "100%",
            }}
          />
          <textarea
            value={draft.summary}
            onChange={(e) => onDraftChange({ ...draft, summary: e.target.value })}
            placeholder="Synthese de ta journee, contexte, lessons..."
            aria-label="Summary edito"
            rows={6}
            style={{
              fontSize: 15,
              fontFamily: "Georgia, serif",
              lineHeight: 1.7,
              padding: 12,
              borderRadius: 10,
              border: "1px solid rgba(0,0,0,0.1)",
              outline: "none",
              width: "100%",
              resize: "vertical",
              minHeight: 140,
            }}
          />
        </div>
      ) : empty ? (
        <div style={{ color: "var(--text-muted, #9CA3AF)", fontSize: 14, padding: "8px 0" }}>
          Clique sur le crayon pour ecrire ton edito du jour (titre + synthese).
        </div>
      ) : (
        <>
          {title && (
            <h3
              style={{
                fontSize: 28,
                fontWeight: 400,
                letterSpacing: "-0.01em",
                lineHeight: 1.3,
                marginBottom: 16,
                fontFamily: "Georgia, serif",
              }}
            >
              {title}
            </h3>
          )}
          {summary && (
            <p
              style={{
                fontSize: 15,
                color: "var(--text-secondary, #374151)",
                lineHeight: 1.8,
                fontFamily: "Georgia, serif",
                whiteSpace: "pre-wrap",
              }}
            >
              {summary}
            </p>
          )}
        </>
      )}
    </div>
  );
}

function Section({
  icon,
  title,
  accent,
  onAdd,
  addOpen,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  accent: string;
  onAdd?: () => void;
  addOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 16,
        border: "1px solid var(--border, #E5E7EB)",
        padding: 28,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 18,
        }}
      >
        <div style={{ color: accent }}>{icon}</div>
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2 }}>{title}</span>
        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            title={addOpen ? "Fermer" : "Ajouter"}
            style={{
              marginLeft: "auto",
              width: 28,
              height: 28,
              borderRadius: 8,
              background: addOpen ? "var(--bg-elevated, #F3F4F6)" : accent,
              border: addOpen ? "1px solid var(--border, #E5E7EB)" : "none",
              color: addOpen ? "var(--text-muted, #6B7280)" : "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            {addOpen ? <XIcon size={14} /> : <Plus size={14} />}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div
      style={{
        fontSize: 13,
        color: "var(--text-muted, #9CA3AF)",
        padding: "14px 0",
        fontStyle: "italic",
      }}
    >
      {text}
    </div>
  );
}

function FondaCard({ fonda, onDelete }: { fonda: FondaEntry; onDelete: () => void }) {
  const color = fonda.sentiment === "hawkish" ? RED : fonda.sentiment === "dovish" ? GREEN : "#6B7280";
  return (
    <div
      style={{
        position: "relative",
        padding: 16,
        background: "var(--bg-page, #FAFAF9)",
        borderRadius: 12,
        border: "1px solid #F3F4F6",
      }}
    >
      <button
        type="button"
        onClick={onDelete}
        title="Supprimer"
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          width: 22,
          height: 22,
          borderRadius: 6,
          background: "transparent",
          border: "none",
          color: "var(--text-muted, #9CA3AF)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          opacity: 0.5,
        }}
      >
        <Trash2 size={13} />
      </button>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        {fonda.time && (
          <span style={{ fontSize: 10, fontFamily: "monospace", color: "#9CA3AF" }}>{fonda.time}</span>
        )}
        <span
          style={{
            fontSize: 9,
            fontWeight: 800,
            padding: "2px 6px",
            borderRadius: 3,
            background: `${color}15`,
            color,
            letterSpacing: 1,
          }}
        >
          {fonda.sentiment.toUpperCase()}
        </span>
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, lineHeight: 1.4 }}>{fonda.title}</div>
      {fonda.summary && (
        <div style={{ fontSize: 11, color: "var(--text-secondary, #6B7280)", lineHeight: 1.5 }}>
          {fonda.summary}
        </div>
      )}
    </div>
  );
}

function FondaForm({
  value,
  onChange,
  onCancel,
  onSave,
}: {
  value: Omit<FondaEntry, "id">;
  onChange: (v: Omit<FondaEntry, "id">) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <div
      style={{
        background: "var(--bg-page, #FAFAF9)",
        border: "1px solid var(--border, #E5E7EB)",
        borderRadius: 12,
        padding: 16,
        marginBottom: 14,
      }}
    >
      <div className="mobile-stack" style={{ display: "grid", gridTemplateColumns: "100px 1fr 140px", gap: 10, marginBottom: 10 }}>
        <input
          type="text"
          value={value.time}
          onChange={(e) => onChange({ ...value, time: e.target.value })}
          placeholder="09:15"
          aria-label="Heure"
          style={inputStyle}
        />
        <input
          type="text"
          value={value.title}
          onChange={(e) => onChange({ ...value, title: e.target.value })}
          placeholder="Titre du rapport (ex: CPI US core 3.1%)"
          aria-label="Titre"
          style={inputStyle}
        />
        <select
          value={value.sentiment}
          onChange={(e) => onChange({ ...value, sentiment: e.target.value as Sentiment })}
          aria-label="Sentiment"
          style={inputStyle}
        >
          <option value="neutral">Neutre</option>
          <option value="hawkish">Hawkish</option>
          <option value="dovish">Dovish</option>
        </select>
      </div>
      <textarea
        value={value.summary}
        onChange={(e) => onChange({ ...value, summary: e.target.value })}
        placeholder="Ton analyse / implications marche..."
        aria-label="Summary"
        rows={3}
        style={{ ...inputStyle, width: "100%", resize: "vertical", minHeight: 70, marginBottom: 10 }}
      />
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <button type="button" onClick={onCancel} style={btnGhost}>
          Annuler
        </button>
        <button type="button" onClick={onSave} style={{ ...btnPrimary, background: ACCENT }}>
          Ajouter
        </button>
      </div>
    </div>
  );
}

function TradeCard({ trade, onDelete }: { trade: TradeEntry; onDelete: () => void }) {
  const isLong = trade.direction === "long";
  const statusColor = trade.status === "closed-win" ? GREEN : trade.status === "closed-loss" ? RED : "#6B7280";
  return (
    <div
      style={{
        position: "relative",
        padding: 16,
        borderRadius: 12,
        border: "1px solid #F3F4F6",
        background: "var(--bg-page, #FAFAF9)",
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        gap: 14,
        alignItems: "center",
      }}
    >
      <button
        type="button"
        onClick={onDelete}
        title="Supprimer"
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          width: 22,
          height: 22,
          borderRadius: 6,
          background: "transparent",
          border: "none",
          color: "var(--text-muted, #9CA3AF)",
          cursor: "pointer",
          opacity: 0.5,
        }}
      >
        <Trash2 size={13} />
      </button>
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: isLong ? `${GREEN}15` : `${RED}15`,
          color: isLong ? GREEN : RED,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isLong ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
      </div>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
          <span style={{ fontSize: 14, fontWeight: 700 }}>{trade.pair}</span>
          {trade.time && (
            <span style={{ fontSize: 10, fontFamily: "monospace", color: "#9CA3AF" }}>{trade.time}</span>
          )}
          {trade.size && (
            <span style={{ fontSize: 10, color: "#9CA3AF", fontFamily: "monospace" }}>{trade.size}</span>
          )}
        </div>
        <div style={{ fontSize: 11, color: "#9CA3AF", fontFamily: "monospace", marginBottom: trade.idea ? 4 : 0 }}>
          {trade.entry && <>Entry {trade.entry}</>}
          {trade.sl && <> · SL {trade.sl}</>}
          {trade.tp && <> · TP {trade.tp}</>}
        </div>
        {trade.idea && (
          <div style={{ fontSize: 12, color: "var(--text-secondary, #374151)", fontStyle: "italic" }}>
            &ldquo;{trade.idea}&rdquo;
          </div>
        )}
      </div>
      <div style={{ textAlign: "right", paddingRight: 20 }}>
        {trade.pnl && (
          <div style={{ fontSize: 16, fontWeight: 700, color: statusColor, fontFamily: "monospace" }}>
            {trade.pnl}
          </div>
        )}
        {trade.status === "open" && (
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "var(--text-muted, #6B7280)",
              padding: "3px 8px",
              border: "1px solid var(--border, #E5E7EB)",
              borderRadius: 4,
              marginTop: 4,
            }}
          >
            EN COURS
          </div>
        )}
      </div>
    </div>
  );
}

function TradeForm({
  value,
  onChange,
  onCancel,
  onSave,
}: {
  value: Omit<TradeEntry, "id">;
  onChange: (v: Omit<TradeEntry, "id">) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <div
      style={{
        background: "var(--bg-page, #FAFAF9)",
        border: "1px solid var(--border, #E5E7EB)",
        borderRadius: 12,
        padding: 16,
        marginBottom: 14,
      }}
    >
      <div className="mobile-stack-2" style={{ display: "grid", gridTemplateColumns: "80px 120px 90px 140px", gap: 10, marginBottom: 10 }}>
        <input
          type="text"
          value={value.time}
          onChange={(e) => onChange({ ...value, time: e.target.value })}
          placeholder="10:42"
          aria-label="Heure"
          style={inputStyle}
        />
        <input
          type="text"
          value={value.pair}
          onChange={(e) => onChange({ ...value, pair: e.target.value.toUpperCase() })}
          placeholder="XAUUSD"
          aria-label="Paire"
          style={inputStyle}
        />
        <select
          value={value.direction}
          onChange={(e) => onChange({ ...value, direction: e.target.value as TradeDirection })}
          aria-label="Direction"
          style={inputStyle}
        >
          <option value="long">LONG</option>
          <option value="short">SHORT</option>
        </select>
        <select
          value={value.status}
          onChange={(e) => onChange({ ...value, status: e.target.value as TradeStatus })}
          aria-label="Status"
          style={inputStyle}
        >
          <option value="open">En cours</option>
          <option value="closed-win">Ferme WIN</option>
          <option value="closed-loss">Ferme LOSS</option>
        </select>
      </div>
      <div className="mobile-stack-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
        <input
          type="text"
          value={value.entry}
          onChange={(e) => onChange({ ...value, entry: e.target.value })}
          placeholder="Entry"
          aria-label="Entry"
          style={inputStyle}
        />
        <input
          type="text"
          value={value.sl}
          onChange={(e) => onChange({ ...value, sl: e.target.value })}
          placeholder="SL"
          aria-label="SL"
          style={inputStyle}
        />
        <input
          type="text"
          value={value.tp}
          onChange={(e) => onChange({ ...value, tp: e.target.value })}
          placeholder="TP"
          aria-label="TP"
          style={inputStyle}
        />
        <input
          type="text"
          value={value.size}
          onChange={(e) => onChange({ ...value, size: e.target.value })}
          placeholder="Size (0.5 lot)"
          aria-label="Size"
          style={inputStyle}
        />
        <input
          type="text"
          value={value.pnl}
          onChange={(e) => onChange({ ...value, pnl: e.target.value })}
          placeholder="+$340 / -$125"
          aria-label="PnL"
          style={inputStyle}
        />
      </div>
      <textarea
        value={value.idea}
        onChange={(e) => onChange({ ...value, idea: e.target.value })}
        placeholder="Ta these / raison d'entree..."
        aria-label="Idee"
        rows={2}
        style={{ ...inputStyle, width: "100%", resize: "vertical", minHeight: 50, marginBottom: 10 }}
      />
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <button type="button" onClick={onCancel} style={btnGhost}>
          Annuler
        </button>
        <button type="button" onClick={onSave} style={{ ...btnPrimary, background: GREEN }}>
          Ajouter
        </button>
      </div>
    </div>
  );
}

function PnlCard({ pnl, wins, losses, opens }: { pnl: number; wins: number; losses: number; opens: number }) {
  const positive = pnl >= 0;
  return (
    <div
      style={{
        background: positive
          ? `linear-gradient(135deg, ${GREEN}, #06B6B4)`
          : `linear-gradient(135deg, ${RED}, #E11D48)`,
        color: "white",
        borderRadius: 16,
        padding: 24,
      }}
    >
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, opacity: 0.85 }}>P&L DU JOUR</div>
      <div style={{ fontSize: 36, fontWeight: 700, marginTop: 4, fontFamily: "monospace" }}>
        {positive ? "+" : ""}${Math.round(pnl)}
      </div>
      <div style={{ fontSize: 12, opacity: 0.9, marginTop: 6 }}>
        {wins} WIN · {losses} LOSS · {opens} en cours
      </div>
    </div>
  );
}

function IdeasCard({
  ideas,
  newIdea,
  onNewIdeaChange,
  onAdd,
  onDelete,
}: {
  ideas: Idea[];
  newIdea: string;
  onNewIdeaChange: (v: string) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 16,
        border: "1px solid var(--border, #E5E7EB)",
        padding: 20,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <Lightbulb size={14} style={{ color: GOLD }} />
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2 }}>IDEES / WATCHLIST</span>
      </div>
      {ideas.map((idea, i) => (
        <div
          key={idea.id}
          style={{
            fontSize: 12,
            color: "var(--text-secondary, #374151)",
            padding: "10px 0",
            borderTop: i > 0 ? "1px solid #F3F4F6" : "none",
            lineHeight: 1.5,
            display: "flex",
            gap: 6,
            alignItems: "flex-start",
          }}
        >
          <span style={{ color: GOLD, marginTop: 2 }}>•</span>
          <span style={{ flex: 1 }}>{idea.text}</span>
          <button
            type="button"
            onClick={() => onDelete(idea.id)}
            title="Supprimer"
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-muted, #9CA3AF)",
              cursor: "pointer",
              padding: 0,
              opacity: 0.4,
            }}
          >
            <Trash2 size={12} />
          </button>
        </div>
      ))}
      <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
        <input
          type="text"
          value={newIdea}
          onChange={(e) => onNewIdeaChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onAdd();
          }}
          placeholder="Nouvelle idee..."
          aria-label="Nouvelle idee"
          style={{ ...inputStyle, flex: 1, fontSize: 12 }}
        />
        <button
          type="button"
          onClick={onAdd}
          title="Ajouter"
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: GOLD,
            border: "none",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid var(--border, #E5E7EB)",
  fontSize: 13,
  outline: "none",
  background: "white",
  color: "var(--text-primary, #111)",
  fontFamily: "inherit",
};

const btnGhost: React.CSSProperties = {
  padding: "7px 14px",
  borderRadius: 8,
  background: "white",
  border: "1px solid var(--border, #E5E7EB)",
  color: "var(--text-muted, #6B7280)",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
};

const btnPrimary: React.CSSProperties = {
  padding: "7px 16px",
  borderRadius: 8,
  background: ACCENT,
  border: "none",
  color: "white",
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
};
