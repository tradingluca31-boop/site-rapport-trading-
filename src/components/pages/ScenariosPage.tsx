"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  Search,
  Pin,
  PinOff,
  Trash2,
  Tag as TagIcon,
  X as XIcon,
  Sparkles,
  FileText,
} from "lucide-react";
import {
  Scenario,
  createScenario,
  deleteScenario,
  listScenarios,
  updateScenario,
} from "@/lib/scenarios";

const ACCENT = "#7C5CFF";
const GREEN = "#08D9D6";
const RED = "#FF2E63";
const GOLD = "#C59E3A";
const NEUTRAL = "#6B7280";

const PRESET_CATEGORIES = ["Trading", "Macro", "EA", "Perso", "Geopolitique", "Tech"] as const;

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) +
    " " + d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function categoryColor(cat: string | null): string {
  if (!cat) return NEUTRAL;
  const lc = cat.toLowerCase();
  if (lc.includes("trading")) return GREEN;
  if (lc.includes("macro")) return ACCENT;
  if (lc.includes("ea")) return GOLD;
  if (lc.includes("perso")) return "#EC4899";
  if (lc.includes("geo")) return RED;
  if (lc.includes("tech")) return "#0EA5E9";
  return NEUTRAL;
}

export default function ScenariosPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [savingMsg, setSavingMsg] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await listScenarios();
      setScenarios(list);
      if (list.length > 0 && !selectedId) setSelectedId(list[0].id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected = useMemo(() => scenarios.find((s) => s.id === selectedId) ?? null, [scenarios, selectedId]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const s of scenarios) if (s.category) set.add(s.category);
    return Array.from(set).sort();
  }, [scenarios]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return scenarios.filter((s) => {
      if (filterCategory && s.category !== filterCategory) return false;
      if (!q) return true;
      return (
        s.title.toLowerCase().includes(q) ||
        s.content.toLowerCase().includes(q) ||
        (s.tags ?? []).some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [scenarios, query, filterCategory]);

  const handleNew = async () => {
    const created = await createScenario({
      title: "Nouveau scenario",
      content: "",
      category: filterCategory ?? null,
    });
    if (created) {
      setScenarios((prev) => [created, ...prev]);
      setSelectedId(created.id);
    } else {
      setError("Impossible de creer le scenario (table Supabase manquante ?)");
    }
  };

  const scheduleSave = useCallback((id: string, patch: Partial<Scenario>) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSavingMsg("Sauvegarde...");
    saveTimer.current = setTimeout(async () => {
      const updated = await updateScenario(id, patch);
      if (updated) {
        setScenarios((prev) =>
          prev
            .map((s) => (s.id === id ? updated : s))
            .sort((a, b) => {
              if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
              return b.updated_at.localeCompare(a.updated_at);
            }),
        );
        setSavingMsg("Enregistre");
        setTimeout(() => setSavingMsg(null), 1500);
      } else {
        setSavingMsg("Erreur");
      }
    }, 900);
  }, []);

  const patchSelected = (patch: Partial<Scenario>) => {
    if (!selected) return;
    setScenarios((prev) => prev.map((s) => (s.id === selected.id ? { ...s, ...patch } : s)));
    scheduleSave(selected.id, patch);
  };

  const togglePin = async () => {
    if (!selected) return;
    patchSelected({ pinned: !selected.pinned });
  };

  const removeSelected = async () => {
    if (!selected) return;
    if (!window.confirm(`Supprimer "${selected.title}" ?`)) return;
    const ok = await deleteScenario(selected.id);
    if (ok) {
      const next = scenarios.filter((s) => s.id !== selected.id);
      setScenarios(next);
      setSelectedId(next[0]?.id ?? null);
    }
  };

  const addTag = (tag: string) => {
    if (!selected) return;
    const t = tag.trim();
    if (!t) return;
    if (selected.tags?.includes(t)) return;
    patchSelected({ tags: [...(selected.tags ?? []), t] });
  };

  const removeTag = (tag: string) => {
    if (!selected) return;
    patchSelected({ tags: (selected.tags ?? []).filter((x) => x !== tag) });
  };

  return (
    <div className="page-root" style={{ minHeight: "100vh", background: "var(--bg-page, #FAFAF9)", padding: "32px 28px" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <header style={{ marginBottom: 24, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: NEUTRAL, marginBottom: 6 }}>
              SCENARIOS
            </div>
            <h1 style={{ fontSize: 30, fontWeight: 300, letterSpacing: "-0.01em", fontFamily: "var(--font-display, Georgia, serif)", color: "#111" }}>
              Mes scenarios
            </h1>
            <p style={{ fontSize: 13, color: NEUTRAL, marginTop: 6, fontFamily: "Georgia, serif" }}>
              Classe tes scenarios par titre, categorie, tags — sur n&apos;importe quel sujet.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 11, color: savingMsg === "Erreur" ? RED : NEUTRAL, fontWeight: 600, minWidth: 80, textAlign: "right" }}>
              {savingMsg ?? ""}
            </span>
            <button
              type="button"
              onClick={handleNew}
              style={{ padding: "10px 18px", borderRadius: 10, background: ACCENT, border: "none", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              <Plus size={15} /> Nouveau scenario
            </button>
          </div>
        </header>

        {error && (
          <div style={{ marginBottom: 14, padding: "12px 16px", borderRadius: 10, background: `${RED}12`, border: `1px solid ${RED}40`, color: RED, fontSize: 13, fontWeight: 600 }}>
            ⚠ {error}
            <div style={{ marginTop: 6, fontSize: 11, color: "#7F1D1D", fontWeight: 400 }}>
              Si la table n&apos;existe pas, applique <code>sql/rapport_trading/002_scenarios.sql</code> dans Supabase SQL Editor.
            </div>
          </div>
        )}

        <div className="scenarios-grid" style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 20, alignItems: "start" }}>
          {/* Liste */}
          <aside style={{ background: "white", borderRadius: 14, border: "1px solid #E5E7EB", padding: 16, minHeight: 600 }}>
            <div style={{ position: "relative", marginBottom: 10 }}>
              <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: NEUTRAL }} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher..."
                aria-label="Rechercher un scenario"
                style={{
                  width: "100%",
                  padding: "8px 10px 8px 32px",
                  fontSize: 12,
                  border: "1px solid #E5E7EB",
                  borderRadius: 8,
                  outline: "none",
                  background: "#FAFAF9",
                  color: "#111",
                }}
              />
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12 }}>
              <CategoryChip
                label="Tous"
                active={filterCategory === null}
                onClick={() => setFilterCategory(null)}
                color={NEUTRAL}
              />
              {categories.map((c) => (
                <CategoryChip
                  key={c}
                  label={c}
                  active={filterCategory === c}
                  onClick={() => setFilterCategory(filterCategory === c ? null : c)}
                  color={categoryColor(c)}
                />
              ))}
            </div>

            {loading ? (
              <div style={{ padding: 20, textAlign: "center", color: NEUTRAL, fontSize: 12 }}>Chargement...</div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: 20, textAlign: "center", color: NEUTRAL, fontSize: 12, fontStyle: "italic" }}>
                {scenarios.length === 0 ? "Aucun scenario. Clique sur \"Nouveau scenario\"." : "Aucun resultat."}
              </div>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                {filtered.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(s.id)}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "10px 12px",
                        borderRadius: 8,
                        border: "1px solid transparent",
                        background: selectedId === s.id ? `${ACCENT}10` : "transparent",
                        borderColor: selectedId === s.id ? `${ACCENT}40` : "transparent",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {s.pinned && <Pin size={11} style={{ color: GOLD }} />}
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#111", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {s.title || "Sans titre"}
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: 5, alignItems: "center", flexWrap: "wrap" }}>
                        {s.category && (
                          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.5, padding: "1px 6px", borderRadius: 4, background: `${categoryColor(s.category)}15`, color: categoryColor(s.category) }}>
                            {s.category.toUpperCase()}
                          </span>
                        )}
                        {(s.tags ?? []).slice(0, 3).map((t) => (
                          <span key={t} style={{ fontSize: 9, color: NEUTRAL, fontFamily: "monospace" }}>#{t}</span>
                        ))}
                      </div>
                      <span style={{ fontSize: 10, color: "#9CA3AF" }}>{fmtDate(s.updated_at)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </aside>

          {/* Editeur */}
          <main style={{ background: "white", borderRadius: 14, border: "1px solid #E5E7EB", padding: 28, minHeight: 600 }}>
            {selected ? (
              <ScenarioEditor
                scenario={selected}
                onPatch={patchSelected}
                onTogglePin={togglePin}
                onDelete={removeSelected}
                onAddTag={addTag}
                onRemoveTag={removeTag}
              />
            ) : (
              <div style={{ textAlign: "center", padding: 60, color: NEUTRAL }}>
                <Sparkles size={32} style={{ color: ACCENT, marginBottom: 12 }} />
                <h3 style={{ fontSize: 18, fontWeight: 400, fontFamily: "Georgia, serif", color: "#111", marginBottom: 6 }}>
                  Aucun scenario selectionne
                </h3>
                <p style={{ fontSize: 13, color: NEUTRAL, fontFamily: "Georgia, serif", marginBottom: 18 }}>
                  Cree ton premier scenario pour commencer.
                </p>
                <button
                  type="button"
                  onClick={handleNew}
                  style={{ padding: "10px 18px", borderRadius: 10, background: ACCENT, border: "none", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}
                >
                  <Plus size={15} /> Nouveau scenario
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function CategoryChip({ label, active, onClick, color }: { label: string; active: boolean; onClick: () => void; color: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "3px 8px",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: 0.5,
        borderRadius: 6,
        border: `1px solid ${active ? color : "transparent"}`,
        background: active ? `${color}15` : "transparent",
        color: active ? color : NEUTRAL,
        cursor: "pointer",
        textTransform: "uppercase",
      }}
    >
      {label}
    </button>
  );
}

function ScenarioEditor({
  scenario,
  onPatch,
  onTogglePin,
  onDelete,
  onAddTag,
  onRemoveTag,
}: {
  scenario: Scenario;
  onPatch: (patch: Partial<Scenario>) => void;
  onTogglePin: () => void;
  onDelete: () => void;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}) {
  const [newTag, setNewTag] = useState("");
  const catColor = categoryColor(scenario.category);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header : actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <FileText size={14} style={{ color: ACCENT }} />
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, color: NEUTRAL }}>SCENARIO</span>
        <span style={{ marginLeft: "auto", fontSize: 10, color: "#9CA3AF" }}>
          Maj {fmtDate(scenario.updated_at)}
        </span>
        <button
          type="button"
          onClick={onTogglePin}
          title={scenario.pinned ? "Detacher" : "Epingler"}
          style={{ width: 30, height: 30, borderRadius: 8, background: scenario.pinned ? `${GOLD}15` : "transparent", border: "1px solid #E5E7EB", color: scenario.pinned ? GOLD : NEUTRAL, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
        >
          {scenario.pinned ? <Pin size={13} /> : <PinOff size={13} />}
        </button>
        <button
          type="button"
          onClick={onDelete}
          title="Supprimer"
          style={{ width: 30, height: 30, borderRadius: 8, background: "transparent", border: "1px solid #E5E7EB", color: RED, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Titre inline */}
      <input
        type="text"
        value={scenario.title}
        onChange={(e) => onPatch({ title: e.target.value })}
        placeholder="Titre du scenario (clique et tape)"
        aria-label="Titre"
        style={{
          width: "100%",
          fontSize: 26,
          fontWeight: 400,
          fontFamily: "Georgia, serif",
          padding: "8px 0",
          border: "none",
          borderBottom: "1px solid transparent",
          outline: "none",
          color: "#111",
          background: "transparent",
        }}
        onFocus={(e) => (e.currentTarget.style.borderBottomColor = "#E5E7EB")}
        onBlur={(e) => (e.currentTarget.style.borderBottomColor = "transparent")}
      />

      {/* Categorie + tags */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: NEUTRAL }}>CATEGORIE</span>
          <select
            value={scenario.category ?? ""}
            onChange={(e) => onPatch({ category: e.target.value || null })}
            aria-label="Categorie"
            style={{
              padding: "4px 8px",
              fontSize: 11,
              fontWeight: 700,
              borderRadius: 6,
              border: `1px solid ${catColor}40`,
              color: catColor,
              background: "white",
            }}
          >
            <option value="">— aucune —</option>
            {PRESET_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
            {scenario.category && !(PRESET_CATEGORIES as readonly string[]).includes(scenario.category) && (
              <option value={scenario.category}>{scenario.category}</option>
            )}
          </select>
        </div>

        <div style={{ flex: 1, minWidth: 240, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <TagIcon size={12} style={{ color: NEUTRAL }} />
          {(scenario.tags ?? []).map((t) => (
            <span
              key={t}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 11,
                padding: "2px 8px",
                borderRadius: 6,
                background: "#F3F4F6",
                color: "#374151",
                fontFamily: "monospace",
              }}
            >
              #{t}
              <button
                type="button"
                onClick={() => onRemoveTag(t)}
                aria-label={`Supprimer tag ${t}`}
                style={{ background: "transparent", border: "none", color: NEUTRAL, cursor: "pointer", padding: 0, display: "inline-flex" }}
              >
                <XIcon size={10} />
              </button>
            </span>
          ))}
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                onAddTag(newTag);
                setNewTag("");
              }
            }}
            placeholder="+ tag"
            aria-label="Nouveau tag"
            style={{ padding: "3px 8px", fontSize: 11, border: "1px solid #E5E7EB", borderRadius: 6, outline: "none", minWidth: 80, background: "#FAFAF9" }}
          />
        </div>
      </div>

      {/* Contenu inline */}
      <textarea
        value={scenario.content}
        onChange={(e) => onPatch({ content: e.target.value })}
        placeholder="Decris ton scenario, ta these, les implications, les niveaux, les conditions de validation... (clique et tape direct)"
        aria-label="Contenu"
        rows={20}
        style={{
          width: "100%",
          fontSize: 15,
          fontFamily: "Georgia, serif",
          lineHeight: 1.75,
          padding: "14px 16px",
          border: "1px solid #F3F4F6",
          borderRadius: 10,
          outline: "none",
          resize: "vertical",
          minHeight: 360,
          background: "#FAFAF9",
          color: "#374151",
          transition: "border-color 0.15s, background 0.15s",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = `${ACCENT}50`;
          e.currentTarget.style.background = "white";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "#F3F4F6";
          e.currentTarget.style.background = "#FAFAF9";
        }}
      />
    </div>
  );
}
