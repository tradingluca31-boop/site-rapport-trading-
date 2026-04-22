"use client";

import { useCallback, useEffect, useState } from "react";
import { Flame, Snowflake, Minus, Newspaper, Pencil, Save, X as XIcon, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import {
  Bias,
  FundamentalAsset,
  FundamentalReportInput,
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
    </div>
  );
}

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
