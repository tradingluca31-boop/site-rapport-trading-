"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Newspaper, Save, X as XIcon, ChevronLeft, ChevronRight, CalendarDays, Copy, Download, Check as CheckIcon, Sparkles } from "lucide-react";
import {
  FundamentalAsset,
  FundamentalReportInput,
  DEFAULT_ASSETS,
  buildDefaultReport,
  getReportByDate,
  upsertReport,
  sentiment10ToBiasScore,
  biasScoreToSentiment10,
  getAssetSummary,
  Bias,
} from "@/lib/fundamentalReports";

const GREEN = "#08D9D6";
const RED = "#FF2E63";
const ACCENT = "#7C5CFF";
const NEUTRAL = "#6B7280";

function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Retourne le lundi de la semaine ISO contenant `d` (lundi = 1, dimanche = 0)
function mondayOf(d: Date): Date {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  const day = out.getDay();                         // 0..6 (dim..sam)
  const diff = day === 0 ? -6 : 1 - day;            // distance au lundi
  out.setDate(out.getDate() + diff);
  return out;
}

function mondayIso(d: Date): string {
  return isoDate(mondayOf(d));
}

function currentWeekMondayIso(): string {
  return mondayIso(new Date());
}

// Numero de semaine ISO (1..53)
function isoWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

// Label "Semaine 20 · 11 - 15 mai 2026"
function frWeekLabel(mondayIso: string): { weekNum: number; range: string; long: string } {
  const [y, m, d] = mondayIso.split("-").map(Number);
  const monday = new Date(y, m - 1, d);
  const friday = new Date(monday);
  friday.setDate(friday.getDate() + 4);
  const weekNum = isoWeekNumber(monday);
  const sameMonth = monday.getMonth() === friday.getMonth();
  const sameYear = monday.getFullYear() === friday.getFullYear();
  const mondayPart = monday.toLocaleDateString("fr-FR", { day: "numeric", month: sameMonth ? undefined : "long", year: sameYear ? undefined : "numeric" });
  const fridayPart = friday.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  const range = `${mondayPart} - ${fridayPart}`;
  const long = `Semaine ${weekNum} · ${range}`;
  return { weekNum, range, long };
}

// 0..10 -> couleur du gradient (rouge → gris → vert)
function colorForScore(s: number): string {
  if (s <= 3) return RED;
  if (s >= 7) return GREEN;
  return NEUTRAL;
}

function labelForScore(s: number): string {
  if (s <= 2) return "VENDEUR FORT";
  if (s <= 4) return "VENDEUR";
  if (s === 5) return "NEUTRE";
  if (s <= 7) return "ACHETEUR";
  return "ACHETEUR FORT";
}

export default function FondamentauxPage() {
  const [currentDate, setCurrentDate] = useState<string>(currentWeekMondayIso());
  const [report, setReport] = useState<FundamentalReportInput | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [promptModal, setPromptModal] = useState(false);
  const [importModal, setImportModal] = useState(false);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async (date: string) => {
    setLoading(true);
    setLoadError(null);

    // Timeout de securite : si Supabase ne repond pas en 5s, on bascule sur le skeleton
    const timeoutId = setTimeout(() => {
      setReport((curr) => curr ?? buildDefaultReport(date));
      setLoadError("Supabase n'a pas repondu en 5s — utilisation du squelette local (les modifs ne seront pas sauvegardees tant que la connexion echoue).");
      setLoading(false);
    }, 5000);

    try {
      const existing = await getReportByDate(date);
      clearTimeout(timeoutId);
      if (existing) {
        const baseAssets =
          existing.assets && Array.isArray(existing.assets) && existing.assets.length > 0
            ? existing.assets
            : buildDefaultReport(date).assets;
        const assets = baseAssets.map((a) => ({
          ...a,
          sentiment10: biasScoreToSentiment10(a),
          summary: typeof a.summary === "string" ? a.summary : getAssetSummary(a),
        }));
        setReport({
          report_date: existing.report_date,
          headline: existing.headline ?? "",
          intro: existing.intro ?? "",
          assets,
        });
      } else {
        setReport(buildDefaultReport(date));
      }
      setSaveMsg(null);
    } catch (e) {
      clearTimeout(timeoutId);
      console.error("[FondamentauxPage] load", e);
      setReport(buildDefaultReport(date));
      setLoadError(e instanceof Error ? e.message : "Erreur chargement (voir console)");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(currentDate);
  }, [currentDate, load]);

  // Auto-save debouncé (1.5s)
  const scheduleAutoSave = useCallback((next: FundamentalReportInput) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      const ok = await upsertReport(next);
      setSaving(false);
      if (ok) {
        setSaveMsg("Enregistre");
        setTimeout(() => setSaveMsg(null), 1500);
      } else {
        setSaveMsg("Erreur sauvegarde");
      }
    }, 1500);
  }, []);

  const patchReport = (patch: Partial<FundamentalReportInput>) => {
    if (!report) return;
    const next = { ...report, ...patch };
    setReport(next);
    scheduleAutoSave(next);
  };

  const changeWeek = (offset: number) => {
    const [y, m, d] = currentDate.split("-").map(Number);
    const dt = new Date(y, m - 1, d + offset * 7);
    setCurrentDate(mondayIso(dt));
  };

  const updateAsset = (ticker: string, patch: Partial<FundamentalAsset>) => {
    if (!report) return;
    const next: FundamentalReportInput = {
      ...report,
      assets: report.assets.map((a) => (a.ticker === ticker ? { ...a, ...patch } : a)),
    };
    setReport(next);
    scheduleAutoSave(next);
  };

  if (loading && !report) {
    return (
      <div className="page-root" style={{ padding: 60, textAlign: "center", color: "#9CA3AF", fontSize: 14 }}>
        <div style={{ marginBottom: 14 }}>Chargement du rapport...</div>
        <div style={{ fontSize: 11, color: "#D1D5DB" }}>
          (max 5s — si ca depasse, le squelette local s&apos;affiche pour que tu puisses commencer a taper)
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="page-root" style={{ padding: 60, textAlign: "center", color: RED, fontSize: 14 }}>
        Impossible de charger le rapport. {loadError ?? ""}
      </div>
    );
  }

  return (
    <div className="page-root" style={{ padding: "32px 28px", minHeight: "100vh", background: "var(--bg-page, #FAFAF9)" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <header className="fondamentaux-header" style={{ marginBottom: 20, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: "#6B7280", marginBottom: 6 }}>
              RAPPORT FONDAMENTAL HEBDO
            </div>
            <h1 className="fondamentaux-title" style={{ fontSize: 30, fontWeight: 300, letterSpacing: "-0.01em", fontFamily: "var(--font-display, Georgia, serif)", color: "#111" }}>
              Semaine {frWeekLabel(currentDate).weekNum} <span style={{ color: "#9CA3AF", fontSize: 18 }}>· {frWeekLabel(currentDate).range}</span>
            </h1>
          </div>
          <div className="fondamentaux-controls" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <button type="button" onClick={() => changeWeek(-1)} aria-label="Semaine precedente" style={navBtn}><ChevronLeft size={16} /></button>
            <div style={{ position: "relative" }}>
              <input
                type="date"
                value={currentDate}
                onChange={(e) => e.target.value && setCurrentDate(mondayIso(new Date(e.target.value)))}
                aria-label="Date dans la semaine du rapport"
                title="Snap au lundi de la semaine choisie"
                style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #E5E7EB", background: "white", color: "#111", fontSize: 12 }}
              />
            </div>
            <button type="button" onClick={() => changeWeek(1)} aria-label="Semaine suivante" style={navBtn}><ChevronRight size={16} /></button>
            <button type="button" onClick={() => setCurrentDate(currentWeekMondayIso())} style={{ ...navBtn, width: "auto", padding: "0 12px", fontSize: 11, fontWeight: 700 }}>
              <CalendarDays size={14} style={{ marginRight: 5 }} />Cette semaine
            </button>
            <button
              type="button"
              onClick={() => setPromptModal(true)}
              title="Copier un prompt pret pour Claude mobile"
              style={{ ...navBtn, width: "auto", padding: "0 12px", fontSize: 11, fontWeight: 700, borderColor: `${ACCENT}60`, color: ACCENT }}
            >
              <Sparkles size={13} style={{ marginRight: 5 }} />Prompt Claude
            </button>
            <button
              type="button"
              onClick={() => setImportModal(true)}
              title="Importer un JSON genere par Claude"
              style={{ ...navBtn, width: "auto", padding: "0 12px", fontSize: 11, fontWeight: 700, background: ACCENT, color: "white", borderColor: ACCENT }}
            >
              <Download size={13} style={{ marginRight: 5 }} />Importer JSON
            </button>
            <span style={{ fontSize: 11, fontWeight: 600, color: saveMsg === "Erreur sauvegarde" ? RED : NEUTRAL, minWidth: 80, textAlign: "right" }}>
              {saving ? "Sauvegarde..." : saveMsg ?? ""}
            </span>
          </div>
        </header>

        {loadError && (
          <div style={{ marginBottom: 14, padding: "12px 16px", borderRadius: 10, background: `${RED}10`, border: `1px solid ${RED}40`, color: RED, fontSize: 12, fontWeight: 600 }}>
            ⚠ {loadError}
          </div>
        )}

        <div className="fondamentaux-brief-card" style={{ background: "white", borderRadius: 14, border: "1px solid #E5E7EB", padding: "36px 40px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, color: ACCENT }}>
            <Newspaper size={16} />
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 3 }}>DAILY MACRO BRIEF</span>
          </div>

          <input
            type="text"
            value={report.headline}
            onChange={(e) => patchReport({ headline: e.target.value })}
            placeholder="Titre du jour (clique et tape directement)"
            aria-label="Titre du brief"
            style={{
              width: "100%",
              fontSize: 28,
              fontWeight: 300,
              fontFamily: "Georgia, serif",
              padding: "10px 0",
              border: "none",
              borderBottom: "1px solid transparent",
              outline: "none",
              marginBottom: 12,
              background: "transparent",
              color: "#111",
            }}
            onFocus={(e) => (e.currentTarget.style.borderBottomColor = "#E5E7EB")}
            onBlur={(e) => (e.currentTarget.style.borderBottomColor = "transparent")}
          />

          <textarea
            value={report.intro}
            onChange={(e) => patchReport({ intro: e.target.value })}
            placeholder="Resume de la journee en 2-4 lignes (clique et tape directement)..."
            rows={3}
            aria-label="Intro du brief"
            style={{
              width: "100%",
              fontSize: 14,
              fontFamily: "Georgia, serif",
              lineHeight: 1.7,
              padding: "10px 0",
              border: "none",
              borderBottom: "1px solid transparent",
              outline: "none",
              marginBottom: 24,
              resize: "vertical",
              minHeight: 70,
              background: "transparent",
              color: "#374151",
            }}
            onFocus={(e) => (e.currentTarget.style.borderBottomColor = "#E5E7EB")}
            onBlur={(e) => (e.currentTarget.style.borderBottomColor = "transparent")}
          />

          {report.assets.map((a) => (
            <AssetSection
              key={a.ticker}
              asset={a}
              onChange={(patch) => updateAsset(a.ticker, patch)}
            />
          ))}
        </div>
      </div>
      {promptModal && <PromptModal date={currentDate} onClose={() => setPromptModal(false)} />}
      {importModal && (
        <ImportModal
          targetDate={currentDate}
          onClose={() => setImportModal(false)}
          onImported={async (imported) => {
            setReport(imported);
            const saved = await upsertReport(imported);
            if (saved) {
              setImportModal(false);
              setSaveMsg("Rapport importe et enregistre");
              setTimeout(() => setSaveMsg(null), 3000);
              setCurrentDate(imported.report_date);
            }
          }}
        />
      )}
    </div>
  );
}

function AssetSection({
  asset,
  onChange,
}: {
  asset: FundamentalAsset;
  onChange: (patch: Partial<FundamentalAsset>) => void;
}) {
  const score = biasScoreToSentiment10(asset);                  // undefined si pas encore note
  const rated = typeof score === "number";
  const displayScore = rated ? (score as number) : 5;            // position visuelle quand non note
  const summary = typeof asset.summary === "string" ? asset.summary : getAssetSummary(asset);
  const color = rated ? colorForScore(displayScore) : "#D1D5DB";
  const label = rated ? labelForScore(displayScore) : "PAS ENCORE NOTE";

  const updateScore = (val: number) => {
    const v = Math.max(0, Math.min(10, Math.round(val)));
    const mapped = sentiment10ToBiasScore(v);
    onChange({ sentiment10: v, bias: mapped.bias as Bias, score: mapped.score });
  };

  const resetScore = () => {
    onChange({ sentiment10: undefined, bias: "ras", score: 0 });
  };

  return (
    <section style={{ marginBottom: 28, paddingBottom: 24, borderBottom: "1px solid #F3F4F6" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
        <span style={{ fontSize: 20, opacity: rated ? 1 : 0.5 }}>{asset.flag}</span>
        <h3 style={{ fontSize: 18, fontWeight: 600, color: rated ? "#111" : "#9CA3AF", fontFamily: "Georgia, serif", margin: 0 }}>
          {asset.name} <span style={{ color: "#9CA3AF", fontSize: 14, fontWeight: 400 }}>· {asset.ticker}</span>
        </h3>
        <span
          style={{
            marginLeft: "auto",
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: 1,
            color,
            padding: "3px 10px",
            borderRadius: 6,
            background: rated ? `${color}15` : "transparent",
            border: rated ? "none" : "1px dashed #E5E7EB",
          }}
        >
          {rated ? `${label} · ${displayScore}/10` : label}
        </span>
        {rated && (
          <button
            type="button"
            onClick={resetScore}
            title="Reset (pas encore note)"
            style={{ background: "transparent", border: "none", color: "#9CA3AF", fontSize: 10, cursor: "pointer", textDecoration: "underline" }}
          >
            reset
          </button>
        )}
      </div>

      {/* Slider 0-10 */}
      <div style={{ marginBottom: 14, opacity: rated ? 1 : 0.45 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, fontWeight: 700, color: "#9CA3AF", letterSpacing: 1, marginBottom: 4 }}>
          <span style={{ color: rated ? RED : "#9CA3AF" }}>VENDEUR</span>
          <span>{rated ? "NEUTRE" : "GLISSE POUR EVALUER"}</span>
          <span style={{ color: rated ? GREEN : "#9CA3AF" }}>ACHETEUR</span>
        </div>
        <input
          type="range"
          min={0}
          max={10}
          step={1}
          value={displayScore}
          onChange={(e) => updateScore(Number(e.target.value))}
          aria-label={`Sentiment ${asset.ticker} (0 vendeur, 10 acheteur)`}
          style={{
            width: "100%",
            accentColor: color,
            cursor: "pointer",
          }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#D1D5DB", fontFamily: "monospace", marginTop: 2 }}>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <span key={n} style={{ color: rated && n === displayScore ? color : "#D1D5DB", fontWeight: rated && n === displayScore ? 700 : 400 }}>{n}</span>
          ))}
        </div>
      </div>

      {/* Zone de texte unique */}
      <textarea
        value={summary}
        onChange={(e) => onChange({ summary: e.target.value })}
        placeholder="Note tout ce que tu veux pour cet actif : monetaire, macro, geopolitique, sentiment, sources, citations... (clique et tape direct)"
        rows={4}
        aria-label={`Notes ${asset.ticker}`}
        style={{
          width: "100%",
          fontSize: 14,
          fontFamily: "Georgia, serif",
          lineHeight: 1.7,
          padding: "10px 12px",
          border: "1px solid #F3F4F6",
          borderRadius: 10,
          outline: "none",
          resize: "vertical",
          minHeight: 90,
          background: "#FAFAF9",
          color: "#374151",
          transition: "border-color 0.15s, background 0.15s",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = `${rated ? color : ACCENT}60`;
          e.currentTarget.style.background = "white";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "#F3F4F6";
          e.currentTarget.style.background = "#FAFAF9";
        }}
      />
    </section>
  );
}

function PromptModal({ date, onClose }: { date: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const prompt = buildClaudePrompt(date);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div onClick={onClose} style={modalOverlay}>
      <div onClick={(e) => e.stopPropagation()} style={{ ...modalBox, maxWidth: 720 }}>
        <div style={modalHeader}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: "#6B7280", marginBottom: 4 }}>PROMPT POUR CLAUDE MOBILE</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#111" }}>{frWeekLabel(date).long}</div>
          </div>
          <button type="button" onClick={onClose} aria-label="Fermer" style={modalCloseBtn}><XIcon size={16} /></button>
        </div>
        <div style={{ padding: "18px 24px", fontSize: 12, color: "#6B7280", lineHeight: 1.6, borderBottom: "1px solid #F3F4F6" }}>
          <strong style={{ color: "#111" }}>Workflow :</strong>
          <ol style={{ margin: "8px 0 0 20px", padding: 0 }}>
            <li>Clique <strong>Copier le prompt</strong> ci-dessous</li>
            <li>Ouvre l&apos;app Claude mobile, colle le prompt</li>
            <li>Attends que Claude lise les 3 wraps + tous les sous-liens</li>
            <li>Claude renvoie un JSON → copie-le</li>
            <li>Reviens ici → bouton <strong>Importer JSON</strong> → colle → Valider</li>
          </ol>
        </div>
        <div style={{ padding: "16px 24px", flex: 1, overflow: "auto" }}>
          <pre style={{ fontSize: 11, fontFamily: "monospace", background: "#0F172A", color: "#E2E8F0", padding: 16, borderRadius: 10, whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.5, maxHeight: "45vh", overflow: "auto" }}>
{prompt}
          </pre>
        </div>
        <div style={modalFooter}>
          <button type="button" onClick={onClose} style={btnGhost}>Fermer</button>
          <button
            type="button"
            onClick={copy}
            style={{ ...btnPrimary, background: copied ? GREEN : ACCENT }}
          >
            {copied ? <><CheckIcon size={13} /> Copie !</> : <><Copy size={13} /> Copier le prompt</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function ImportModal({ targetDate, onClose, onImported }: { targetDate: string; onClose: () => void; onImported: (report: FundamentalReportInput) => void }) {
  const [jsonText, setJsonText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [parsed, setParsed] = useState<FundamentalReportInput | null>(null);

  const tryParse = (text: string) => {
    setJsonText(text);
    setError(null);
    setParsed(null);
    if (!text.trim()) return;
    try {
      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");
      if (start < 0 || end < 0) throw new Error("JSON invalide (pas d'objet detecte)");
      const raw = text.slice(start, end + 1);
      const obj = JSON.parse(raw);
      const validated = validateReport(obj);
      setParsed(validated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "JSON invalide");
    }
  };

  return (
    <div onClick={onClose} style={modalOverlay}>
      <div onClick={(e) => e.stopPropagation()} style={{ ...modalBox, maxWidth: 720 }}>
        <div style={modalHeader}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: "#6B7280", marginBottom: 4 }}>IMPORTER JSON</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#111" }}>Rapport genere par Claude mobile</div>
          </div>
          <button type="button" onClick={onClose} aria-label="Fermer" style={modalCloseBtn}><XIcon size={16} /></button>
        </div>
        <div style={{ padding: "16px 24px", flex: 1, overflow: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
          <textarea
            value={jsonText}
            onChange={(e) => tryParse(e.target.value)}
            placeholder="Colle ici le JSON genere par Claude..."
            aria-label="JSON a importer"
            rows={12}
            style={{ width: "100%", fontFamily: "monospace", fontSize: 11, padding: 12, border: `1px solid ${error ? RED : parsed ? GREEN : "#E5E7EB"}`, borderRadius: 10, outline: "none", lineHeight: 1.5, resize: "vertical", minHeight: 180 }}
          />
          {error && (
            <div style={{ padding: "10px 14px", borderRadius: 8, background: `${RED}10`, color: RED, fontSize: 12, fontWeight: 600 }}>
              ❌ {error}
            </div>
          )}
          {parsed && (
            <div style={{ padding: "14px 16px", borderRadius: 10, background: `${GREEN}10`, border: `1px solid ${GREEN}40`, fontSize: 12, color: "#111" }}>
              <div style={{ fontWeight: 700, marginBottom: 6, color: GREEN }}>✅ JSON valide</div>
              <div style={{ marginBottom: 4 }}><strong>Date :</strong> {parsed.report_date}</div>
              <div style={{ marginBottom: 4 }}><strong>Titre :</strong> {parsed.headline || <em style={{ color: "#9CA3AF" }}>vide</em>}</div>
              <div style={{ marginBottom: 8 }}><strong>Actifs :</strong> {parsed.assets.length}</div>
              {parsed.report_date !== targetDate && (
                <div style={{ padding: "6px 10px", borderRadius: 6, background: "#FEF3C7", color: "#92400E", fontSize: 11, fontWeight: 600 }}>
                  ⚠️ La date du JSON ({parsed.report_date}) est differente de la page courante ({targetDate}). A l&apos;import, la page naviguera vers {parsed.report_date}.
                </div>
              )}
            </div>
          )}
        </div>
        <div style={modalFooter}>
          <button type="button" onClick={onClose} style={btnGhost}>Annuler</button>
          <button
            type="button"
            onClick={() => parsed && onImported(parsed)}
            disabled={!parsed}
            style={{ ...btnPrimary, background: parsed ? GREEN : "#E5E7EB", color: parsed ? "white" : "#9CA3AF", cursor: parsed ? "pointer" : "not-allowed" }}
          >
            <Download size={13} /> Importer et enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

function validateReport(obj: unknown): FundamentalReportInput {
  if (!obj || typeof obj !== "object") throw new Error("Racine JSON invalide");
  const o = obj as Record<string, unknown>;
  const rawDate = typeof o.report_date === "string" ? o.report_date : null;
  if (!rawDate || !/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
    throw new Error("Champ 'report_date' manquant ou mauvais format (YYYY-MM-DD attendu)");
  }
  // Snap automatique au lundi de la semaine (clef hebdo)
  const [yy, mm, dd] = rawDate.split("-").map(Number);
  const report_date = mondayIso(new Date(yy, mm - 1, dd));
  const headline = typeof o.headline === "string" ? o.headline : "";
  const intro = typeof o.intro === "string" ? o.intro : "";
  const rawAssets = Array.isArray(o.assets) ? o.assets : [];

  const byTicker = new Map<string, Partial<FundamentalAsset>>();
  for (const a of rawAssets) {
    if (a && typeof a === "object" && "ticker" in a && typeof (a as Record<string, unknown>).ticker === "string") {
      byTicker.set((a as Record<string, unknown>).ticker as string, a as Partial<FundamentalAsset>);
    }
  }

  const assets: FundamentalAsset[] = DEFAULT_ASSETS.map((def) => {
    const src = byTicker.get(def.ticker);
    if (!src) return { ...def };
    const biasRaw = typeof src.bias === "string" ? src.bias : "ras";
    const bias: Bias = biasRaw === "hawkish" || biasRaw === "dovish" || biasRaw === "neutral" || biasRaw === "ras" ? biasRaw : "ras";
    const scoreN = typeof src.score === "number" ? Math.max(-5, Math.min(5, Math.round(src.score))) : 0;
    const merged: FundamentalAsset = {
      ticker: def.ticker,
      flag: def.flag,
      name: def.name,
      bias,
      score: scoreN,
      monetary: typeof src.monetary === "string" && src.monetary.trim() ? src.monetary.trim() : null,
      macro: typeof src.macro === "string" && src.macro.trim() ? src.macro.trim() : null,
      geo: typeof src.geo === "string" && src.geo.trim() ? src.geo.trim() : null,
      sentiment: typeof src.sentiment === "string" && src.sentiment.trim() ? src.sentiment.trim() : null,
      sources: Array.isArray(src.sources) ? (src.sources as unknown[]).filter((s): s is string => typeof s === "string") : [],
      last_update: typeof src.last_update === "string" && src.last_update.trim() ? src.last_update.trim() : "—",
      sentiment10: typeof src.sentiment10 === "number" ? Math.max(0, Math.min(10, Math.round(src.sentiment10))) : undefined,
      summary: typeof src.summary === "string" ? src.summary : null,
    };
    if (typeof merged.sentiment10 !== "number") merged.sentiment10 = biasScoreToSentiment10(merged);
    if (typeof merged.summary !== "string" || merged.summary === null) merged.summary = getAssetSummary(merged);
    return merged;
  });

  return { report_date, headline, intro, assets };
}

function buildClaudePrompt(mondayDate: string): string {
  const { weekNum, range } = frWeekLabel(mondayDate);
  return `Tu es un analyste macro hedge-fund senior. Je vais te donner les wraps InvestingLive (Asia Pacific / European / US) des 5 jours de la SEMAINE ${weekNum} (${range}, lundi-vendredi). Tu dois produire UN JSON STRICT qui sera importe directement dans mon site de rapport fondamental hebdo.

===== CONTEXTE SITE =====
Le site attend un rapport "Weekly Macro Brief" pour la semaine demarrant le ${mondayDate} (lundi), avec 12 actifs (8 devises + Yuan + 3 matieres premieres). Chaque actif a un score de sentiment 0-10 (0=vendeur fort, 5=neutre, 10=acheteur fort) et un champ "summary" qui resume la SEMAINE complete (monetaire + macro + geo + sentiment + sources, en prose, avec horaires et dates).

===== TA MISSION =====
ETAPE 1 - Fetch les wraps de chaque jour de la semaine (Asia / European / US par jour, 5 jours = jusqu'a 15 wraps).
ETAPE 2 - OBLIGATION : pour chaque wrap, fetch les hyperliens internes investinglive.com pour avoir chiffres precis, citations, horodatages.
ETAPE 3 - Regroupe chronologiquement (lundi au vendredi). Mentionne les retournements de narratives intra-semaine et les events cles (BC, data majeures, geo).
ETAPE 4 - Pour chacun des 12 actifs, remplis un objet JSON. Le "summary" est UNE PROSE en francais qui retrace l'arc de la semaine : ouverture, events cles datees, fermeture vendredi. Cite chiffres et BC.
ETAPE 5 - Renvoie UNIQUEMENT le JSON, rien avant, rien apres, pas de markdown.

===== 12 ACTIFS OBLIGATOIRES (ordre et spelling exacts) =====
USD, EUR, GBP, JPY, CHF, AUD, NZD, CAD, CNY, XAUUSD, XAGUSD, USOIL

===== SCHEMA JSON EXACT =====
{
  "report_date": "${mondayDate}",
  "headline": "string - titre 1 ligne max 80 char (theme dominant de la semaine)",
  "intro": "string - synthese 3-5 lignes de la semaine (events cles, biais general)",
  "assets": [
    {
      "ticker": "USD",
      "sentiment10": 7,
      "summary": "LUN 12 : Retail sales +0.6%. MER 14 : Powell repete pas de baisse avant CPI clair. VEN 16 : JPMorgan releve cible S&P a 7600. Net hebdo : USD hawkish modere. Sources : Fed, BEA, JPMorgan.",
      "bias": "hawkish",
      "score": 2
    },
    { ... idem pour les 11 autres }
  ]
}

===== REGLES =====
- "report_date" : EXACTEMENT le lundi de la semaine = "${mondayDate}".
- "sentiment10" : entier 0-10 (CHAMP PRINCIPAL : 0 vendeur fort, 5 neutre, 10 acheteur fort). Reflete le NET de la semaine, pas la moyenne.
- "summary" : prose francaise hebdo, datee jour par jour (LUN/MAR/MER/JEU/VEN + chiffre), citations BC, sources en fin. Si RAS sur la semaine : "" et sentiment10 absent.
- "bias" : "hawkish" si sentiment10 > 5, "dovish" si < 5, "neutral" si = 5 (legacy auto).
- "score" : sentiment10 - 5 (legacy).
- TOUS les 12 tickers DOIVENT etre presents.

Maintenant attends que je te colle les URLs des wraps de la semaine ${weekNum} (${range}).`;
}

const modalOverlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.55)",
  zIndex: 1000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
};

const modalBox: React.CSSProperties = {
  background: "white",
  borderRadius: 16,
  width: "100%",
  maxHeight: "90vh",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
};

const modalHeader: React.CSSProperties = {
  padding: "20px 24px",
  borderBottom: "1px solid #E5E7EB",
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const modalCloseBtn: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 8,
  background: "#F3F4F6",
  border: "none",
  color: "#6B7280",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginLeft: "auto",
};

const modalFooter: React.CSSProperties = {
  padding: "16px 24px",
  borderTop: "1px solid #E5E7EB",
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
};

const btnGhost: React.CSSProperties = {
  padding: "8px 16px",
  borderRadius: 8,
  background: "white",
  border: "1px solid #E5E7EB",
  color: "#6B7280",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
};

const btnPrimary: React.CSSProperties = {
  padding: "8px 18px",
  borderRadius: 8,
  background: ACCENT,
  border: "none",
  color: "white",
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
};

const navBtn: React.CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: 8,
  background: "white",
  border: "1px solid #E5E7EB",
  color: "#111",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

// Save import unused — silence linter en pretendant l'utiliser
void Save;
