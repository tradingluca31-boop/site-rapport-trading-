"use client";

import { useCallback, useEffect, useState } from "react";
import { Flame, Snowflake, Minus, Newspaper, Pencil, Save, X as XIcon, ChevronLeft, ChevronRight, CalendarDays, Copy, Download, Check as CheckIcon, Sparkles } from "lucide-react";
import {
  Bias,
  FundamentalAsset,
  FundamentalReportInput,
  DEFAULT_ASSETS,
  buildDefaultReport,
  getReportByDate,
  upsertReport,
} from "@/lib/fundamentalReports";

const GREEN = "#08D9D6";
const RED = "#FF2E63";
const ACCENT = "#7C5CFF";

function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function frDateLong(dateIso: string): string {
  const [y, m, d] = dateIso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function biasColor(b: Bias): string {
  if (b === "hawkish") return GREEN;
  if (b === "dovish") return RED;
  if (b === "neutral") return "#6B7280";
  return "#E5E7EB";
}

function biasIcon(b: Bias) {
  if (b === "hawkish") return <Flame size={12} />;
  if (b === "dovish") return <Snowflake size={12} />;
  if (b === "neutral") return <Minus size={12} />;
  return null;
}

function biasLabel(b: Bias): string {
  if (b === "hawkish") return "HAWK";
  if (b === "dovish") return "DOVE";
  if (b === "neutral") return "NEUT";
  return "RAS";
}

function biasPill(b: Bias): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "3px 8px",
    borderRadius: 6,
    background: `${biasColor(b)}18`,
    color: biasColor(b),
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: 0.5,
  };
}

export default function FondamentauxPage() {
  const [currentDate, setCurrentDate] = useState<string>(isoDate(new Date()));
  const [report, setReport] = useState<FundamentalReportInput | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [promptModal, setPromptModal] = useState(false);
  const [importModal, setImportModal] = useState(false);

  const load = useCallback(async (date: string) => {
    setLoading(true);
    const existing = await getReportByDate(date);
    if (existing) {
      setReport({
        report_date: existing.report_date,
        headline: existing.headline ?? "",
        intro: existing.intro ?? "",
        assets: existing.assets && existing.assets.length > 0 ? existing.assets : buildDefaultReport(date).assets,
      });
    } else {
      setReport(buildDefaultReport(date));
    }
    setEditing(false);
    setSaveMsg(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    load(currentDate);
  }, [currentDate, load]);

  const changeDay = (offset: number) => {
    const [y, m, d] = currentDate.split("-").map(Number);
    const dt = new Date(y, m - 1, d + offset);
    setCurrentDate(isoDate(dt));
  };

  const save = async () => {
    if (!report || saving) return;
    setSaving(true);
    const res = await upsertReport(report);
    setSaving(false);
    if (res) {
      setSaveMsg("Enregistre");
      setEditing(false);
      setTimeout(() => setSaveMsg(null), 2000);
    } else {
      setSaveMsg("Erreur (voir console)");
    }
  };

  const updateAsset = (ticker: string, patch: Partial<FundamentalAsset>) => {
    if (!report) return;
    setReport({
      ...report,
      assets: report.assets.map((a) => (a.ticker === ticker ? { ...a, ...patch } : a)),
    });
  };

  if (loading || !report) {
    return (
      <div className="page-root" style={{ padding: 60, textAlign: "center", color: "#9CA3AF", fontSize: 14 }}>
        Chargement du rapport...
      </div>
    );
  }

  return (
    <div className="page-root" style={{ padding: "32px 28px", minHeight: "100vh", background: "var(--bg-page, #FAFAF9)" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <header style={{ marginBottom: 20, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: "#6B7280", marginBottom: 6 }}>
              RAPPORT FONDAMENTAL
            </div>
            <h1 style={{ fontSize: 30, fontWeight: 300, letterSpacing: "-0.01em", fontFamily: "var(--font-display, Georgia, serif)", color: "#111", textTransform: "capitalize" }}>
              {frDateLong(currentDate)}
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button type="button" onClick={() => changeDay(-1)} aria-label="Jour precedent" style={navBtn}><ChevronLeft size={16} /></button>
            <div style={{ position: "relative" }}>
              <input
                type="date"
                value={currentDate}
                onChange={(e) => setCurrentDate(e.target.value)}
                aria-label="Date du rapport"
                style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #E5E7EB", background: "white", color: "#111", fontSize: 12 }}
              />
            </div>
            <button type="button" onClick={() => changeDay(1)} aria-label="Jour suivant" style={navBtn}><ChevronRight size={16} /></button>
            <button type="button" onClick={() => setCurrentDate(isoDate(new Date()))} style={{ ...navBtn, width: "auto", padding: "0 12px", fontSize: 11, fontWeight: 700 }}>
              <CalendarDays size={14} style={{ marginRight: 5 }} />Aujourd&apos;hui
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
            {editing ? (
              <>
                <button
                  type="button"
                  onClick={() => { setEditing(false); load(currentDate); }}
                  disabled={saving}
                  style={{ padding: "7px 14px", borderRadius: 8, background: "white", border: "1px solid #E5E7EB", color: "#6B7280", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
                >
                  <XIcon size={13} /> Annuler
                </button>
                <button
                  type="button"
                  onClick={save}
                  disabled={saving}
                  style={{ padding: "7px 16px", borderRadius: 8, background: GREEN, border: "none", color: "white", fontSize: 12, fontWeight: 700, cursor: saving ? "wait" : "pointer", display: "inline-flex", alignItems: "center", gap: 6, opacity: saving ? 0.6 : 1 }}
                >
                  <Save size={13} /> {saving ? "Sauvegarde..." : "Enregistrer"}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setEditing(true)}
                style={{ padding: "7px 16px", borderRadius: 8, background: ACCENT, border: "none", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <Pencil size={13} /> Editer
              </button>
            )}
          </div>
        </header>

        {saveMsg && (
          <div style={{ marginBottom: 14, padding: "8px 14px", borderRadius: 8, background: `${GREEN}15`, color: GREEN, fontSize: 12, fontWeight: 600 }}>
            {saveMsg}
          </div>
        )}

        <div style={{ background: "white", borderRadius: 14, border: "1px solid #E5E7EB", padding: "36px 40px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, color: ACCENT }}>
            <Newspaper size={16} />
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 3 }}>DAILY MACRO BRIEF</span>
          </div>

          {editing ? (
            <input
              type="text"
              value={report.headline}
              onChange={(e) => setReport({ ...report, headline: e.target.value })}
              placeholder="Titre du jour (ex: Cessez-le-feu etendu, marches sur le qui-vive)"
              aria-label="Titre du brief"
              style={{ width: "100%", fontSize: 24, fontWeight: 300, fontFamily: "Georgia, serif", padding: 12, border: "1px solid #E5E7EB", borderRadius: 10, marginBottom: 14, outline: "none" }}
            />
          ) : (
            <h2 style={{ fontSize: 28, fontWeight: 300, fontFamily: "Georgia, serif", lineHeight: 1.2, marginBottom: 14, color: report.headline ? "#111" : "#9CA3AF" }}>
              {report.headline || "Aucun titre — clique sur Editer pour en ajouter un."}
            </h2>
          )}

          {editing ? (
            <textarea
              value={report.intro}
              onChange={(e) => setReport({ ...report, intro: e.target.value })}
              placeholder="Resume de la journee en 2-4 lignes..."
              rows={4}
              aria-label="Intro du brief"
              style={{ width: "100%", fontSize: 14, fontFamily: "Georgia, serif", lineHeight: 1.7, padding: 12, border: "1px solid #E5E7EB", borderRadius: 10, marginBottom: 28, outline: "none", resize: "vertical", minHeight: 90 }}
            />
          ) : (
            report.intro ? (
              <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, fontFamily: "Georgia, serif", marginBottom: 28 }}>
                {report.intro}
              </p>
            ) : (
              <p style={{ fontSize: 13, color: "#9CA3AF", fontStyle: "italic", marginBottom: 28, fontFamily: "Georgia, serif" }}>
                Aucune intro pour le moment.
              </p>
            )
          )}

          {report.assets.map((a) => (
            <AssetSection
              key={a.ticker}
              asset={a}
              editing={editing}
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
            <div style={{ fontSize: 16, fontWeight: 600, color: "#111" }}>Rapport du {frDateLong(date)}</div>
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
      // Cherche le premier "{" et le dernier "}" pour etre tolerant
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
              <div style={{ marginBottom: 8 }}><strong>Actifs :</strong> {parsed.assets.length} ({parsed.assets.filter((a) => a.bias !== "ras").length} avec biais, {parsed.assets.filter((a) => a.bias === "ras").length} en RAS)</div>
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
  const report_date = typeof o.report_date === "string" ? o.report_date : null;
  if (!report_date || !/^\d{4}-\d{2}-\d{2}$/.test(report_date)) {
    throw new Error("Champ 'report_date' manquant ou mauvais format (YYYY-MM-DD attendu)");
  }
  const headline = typeof o.headline === "string" ? o.headline : "";
  const intro = typeof o.intro === "string" ? o.intro : "";
  const rawAssets = Array.isArray(o.assets) ? o.assets : [];

  // Reconstruit en forcant l'ordre + complete RAS pour manquants
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
    return {
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
    };
  });

  return { report_date, headline, intro, assets };
}

function buildClaudePrompt(date: string): string {
  return `Tu es un analyste macro hedge-fund senior. Je vais te donner 3 wraps InvestingLive (Asia Pacific / European / US) d'une meme journee. Tu dois produire UN JSON STRICT qui sera importe directement dans mon site de rapport fondamental. Si le JSON est mal forme, l'import echoue.

===== CONTEXTE SITE =====
Le site attend un rapport "Daily Macro Brief" pour la date ${date}, avec 12 actifs (8 devises + Yuan chinois + 3 matieres premieres). Chaque actif a un biais (hawkish/dovish/neutral/ras) et 4 categories de news (Monetaire / Macro / Geo / Sentiment). Quand tu n'as rien de significatif sur un actif, tu dois le marquer en "ras" (Rien A Signaler) et laisser les 4 categories a null.

===== CE QUE JE VAIS TE COLLER APRES CE PROMPT =====
3 URLs vers les wraps du ${date} :
1. Asia Pacific (le plus ancien)
2. European
3. US (le plus RECENT, fait AUTORITE en cas de contradiction)

===== TA MISSION =====
ETAPE 1 - Fetch et lis les 3 wraps.
ETAPE 2 - IMPORTANT : dans chaque wrap, identifie tous les HYPERLIENS internes (vers d'autres articles investinglive.com) et LIS-LES aussi. Les wraps sont des resumes condenses, mais chaque sous-article contient des details, heures precises, chiffres exacts qui ne sont PAS repris dans le wrap. Tu dois lire TOUS les sous-articles pour avoir une image complete.
ETAPE 3 - Regroupe chronologiquement tous les evenements (du plus ancien au plus recent). Si une annonce a 08:00 est contredite/modifiee/annulee a 14:00, tu gardes UNIQUEMENT la version finale. Si le US wrap (plus tardif) dit l'inverse du European wrap, c'est le US qui fait foi.
ETAPE 4 - Pour chacun des 12 actifs ci-dessous, extrais ce qui est pertinent et remplis un objet JSON.
ETAPE 5 - Renvoie UNIQUEMENT le JSON, rien avant, rien apres, pas de markdown, pas de \`\`\`.

===== 12 ACTIFS OBLIGATOIRES (ordre et spelling exacts) =====
USD, EUR, GBP, JPY, CHF, AUD, NZD, CAD, CNY, XAUUSD, XAGUSD, USOIL

Les 12 DOIVENT apparaitre dans le JSON, meme en RAS. Ne renomme jamais (pas "EURUSD", pas "GOLD", pas "DXY", pas "BRENT"). Si tu ecris autre chose que ces 12 tickers exacts, l'import echoue.

===== SCHEMA JSON EXACT =====
{
  "report_date": "${date}",
  "headline": "string - titre percutant 1 ligne (max 80 char)",
  "intro": "string - synthese 2-4 lignes de la journee, contexte macro global",
  "assets": [
    {
      "ticker": "USD",
      "bias": "hawkish",
      "score": 2,
      "monetary": "Fed Powell reitere pas de baisse avant CPI clair",
      "macro": "Retail sales +0.6% vs +0.3% att.",
      "geo": null,
      "sentiment": "JPMorgan releve cible S&P a 7600",
      "sources": ["Fed", "BEA", "JPMorgan"],
      "last_update": "20:30"
    },
    { ... objet identique pour EUR, GBP, JPY, CHF, AUD, NZD, CAD, CNY, XAUUSD, XAGUSD, USOIL }
  ]
}

===== VALEURS AUTORISEES CHAMP PAR CHAMP =====
- "bias" : exactement une des 4 valeurs : "hawkish" | "dovish" | "neutral" | "ras"
  * hawkish = flux haussier (BC hawkish, data forte, safe-haven en tension) → JE VEUX LONG cet actif
  * dovish = flux baissier (BC dovish, data faible, risque-off) → JE VEUX SHORT cet actif
  * neutral = news mixtes, pas de biais clair
  * ras = RIEN d'important sur l'actif aujourd'hui (OBLIGATOIRE : monetary/macro/geo/sentiment tous a null, sources: [], last_update: "—")
- "score" : entier -5 a +5. -5 = tres dovish, 0 = neutre/ras, +5 = tres hawkish. Pas de decimales.
- "monetary" : string OU null. Une phrase courte en francais (banque centrale, taux, forward guidance).
- "macro" : string OU null. Une phrase (data macro : CPI, PMI, emploi, PIB, ventes).
- "geo" : string OU null. Une phrase (guerre, sanctions, tarifs, tensions).
- "sentiment" : string OU null. Une phrase (flows institutionnels, notes de banques, positionnement retail).
- "sources" : array de strings. Exemples valides : ["ECB Lagarde"], ["Fed", "JPMorgan", "BEA"], [].
- "last_update" : string au format "HH:MM" (24h, UTC). Si RAS, mets "—".

===== REGLES DE QUALITE =====
1. Chaque phrase texte doit etre **specifique** (chiffres, noms, citations) — pas de generalites type "contexte incertain".
2. "bias" doit refleter le FLUX DU JOUR, pas le trend long-terme. Exemple : USD en long-terme haussier, mais si la data du jour est faible → bias="dovish" score=-2.
3. Si un actif a 2+ news (ex : Fed dovish ET retail sales forte), prends la plus recente ou la plus impactante dans le wrap US (autorite).
4. La categorie "sentiment" est pour les flows/positioning (pas le sentiment retail du public — plutot les calls institutionnels, changements de cible de banques).

===== CHECKLIST AVANT D'ENVOYER LE JSON =====
Relis ton JSON et verifie :
[ ] Exactement 12 objets dans "assets"
[ ] Tickers exactement : USD, EUR, GBP, JPY, CHF, AUD, NZD, CAD, CNY, XAUUSD, XAGUSD, USOIL (dans cet ordre)
[ ] Chaque "bias" est dans {"hawkish","dovish","neutral","ras"}
[ ] Chaque "score" est entier entre -5 et +5
[ ] Les actifs en "ras" ont tous leurs 4 champs texte a null ET sources:[] ET last_update:"—"
[ ] "report_date" = "${date}"
[ ] Aucun markdown, aucun texte hors du JSON, aucun bloc \`\`\`

Maintenant attends que je te colle les 3 URLs du ${date}.`;
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

function AssetSection({
  asset,
  editing,
  onChange,
}: {
  asset: FundamentalAsset;
  editing: boolean;
  onChange: (patch: Partial<FundamentalAsset>) => void;
}) {
  const ras = asset.bias === "ras";

  return (
    <section style={{ marginBottom: 28, paddingBottom: 24, borderBottom: "1px solid #F3F4F6" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
        <span style={{ fontSize: 20 }}>{asset.flag}</span>
        <h3 style={{ fontSize: 18, fontWeight: 600, color: "#111", fontFamily: "Georgia, serif" }}>
          {asset.name} <span style={{ color: "#9CA3AF", fontSize: 14, fontWeight: 400 }}>· {asset.ticker}</span>
        </h3>
        {editing ? (
          <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}>
            <select
              value={asset.bias}
              onChange={(e) => onChange({ bias: e.target.value as Bias })}
              aria-label={`Biais ${asset.ticker}`}
              style={{ padding: "4px 8px", fontSize: 11, fontWeight: 700, borderRadius: 6, border: `1px solid ${biasColor(asset.bias)}40`, color: biasColor(asset.bias), background: "white" }}
            >
              <option value="ras">RAS</option>
              <option value="hawkish">HAWK</option>
              <option value="dovish">DOVE</option>
              <option value="neutral">NEUT</option>
            </select>
            <input
              type="number"
              min={-5}
              max={5}
              step={1}
              value={asset.score}
              onChange={(e) => onChange({ score: Number(e.target.value) })}
              aria-label={`Score ${asset.ticker}`}
              style={{ width: 56, padding: "4px 8px", fontSize: 11, fontWeight: 700, borderRadius: 6, border: "1px solid #E5E7EB", background: "white", color: "#111" }}
            />
          </div>
        ) : (
          <span style={{ ...biasPill(asset.bias), marginLeft: "auto" }}>
            {biasIcon(asset.bias)}
            <span>{biasLabel(asset.bias)}</span>
          </span>
        )}
      </div>

      {editing ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <EditField label="🏦 Monetaire" value={asset.monetary} onChange={(v) => onChange({ monetary: v })} />
          <EditField label="📊 Macro data" value={asset.macro} onChange={(v) => onChange({ macro: v })} />
          <EditField label="🌍 Geopolitique" value={asset.geo} onChange={(v) => onChange({ geo: v })} />
          <EditField label="💬 Sentiment" value={asset.sentiment} onChange={(v) => onChange({ sentiment: v })} />
          <div style={{ gridColumn: "span 2", display: "grid", gridTemplateColumns: "1fr 140px", gap: 10 }}>
            <EditField label="Sources (separees par · )" value={asset.sources.join(" · ")} onChange={(v) => onChange({ sources: v.split("·").map((s) => s.trim()).filter(Boolean) })} />
            <EditField label="Maj" value={asset.last_update === "—" ? "" : asset.last_update} onChange={(v) => onChange({ last_update: v || "—" })} />
          </div>
        </div>
      ) : ras ? (
        <p style={{ fontSize: 13, color: "#9CA3AF", fontStyle: "italic", fontFamily: "Georgia, serif" }}>
          Aucun catalyseur fondamental significatif aujourd&apos;hui — RAS.
        </p>
      ) : (
        <>
          {[asset.monetary, asset.macro, asset.geo, asset.sentiment].filter(Boolean).map((t, i) => (
            <p key={i} style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, fontFamily: "Georgia, serif", marginBottom: 8 }}>
              {t}
            </p>
          ))}
          <div style={{ marginTop: 12, padding: "10px 14px", background: `${biasColor(asset.bias)}08`, borderLeft: `3px solid ${biasColor(asset.bias)}`, borderRadius: 4, display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, color: biasColor(asset.bias) }}>→ BIAIS TRADING :</span>
            <span style={{ fontSize: 13, color: "#111", fontWeight: 600 }}>
              {asset.bias === "hawkish" ? `LONG ${asset.ticker} favori (score ${asset.score > 0 ? "+" : ""}${asset.score})` :
               asset.bias === "dovish" ? `SHORT ${asset.ticker} favori (score ${asset.score > 0 ? "+" : ""}${asset.score})` :
               "Flat, attendre confirmation"}
            </span>
          </div>
          {asset.sources.length > 0 && (
            <div style={{ marginTop: 10, fontSize: 10, color: "#9CA3AF", fontStyle: "italic" }}>
              Sources : {asset.sources.join(" · ")}{asset.last_update && asset.last_update !== "—" ? ` — maj ${asset.last_update}` : ""}
            </div>
          )}
        </>
      )}
    </section>
  );
}

function EditField({ label, value, onChange }: { label: string; value: string | null; onChange: (v: string) => void }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1, color: "#6B7280" }}>{label}</span>
      <textarea
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        placeholder="—"
        aria-label={label}
        style={{ width: "100%", padding: "8px 10px", fontSize: 12, borderRadius: 8, border: "1px solid #E5E7EB", outline: "none", background: "white", color: "#111", resize: "vertical", fontFamily: "inherit", minHeight: 48 }}
      />
    </label>
  );
}
