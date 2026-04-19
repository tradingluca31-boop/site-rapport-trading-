"use client";

import { useState } from "react";
import { currentDailyReport } from "@/lib/mock-data";
import {
  Save,
  CheckCircle2,
  Plus,
  X,
  Star,
} from "lucide-react";

type Section = "pre-marche" | "execution" | "emotionnel" | "debrief";
type ViewMode = "form" | "chat" | "split";

const SECTIONS: { id: Section; label: string; count: number }[] = [
  { id: "pre-marche", label: "PRE-MARCHE", count: 4 },
  { id: "execution", label: "EXECUTION", count: 3 },
  { id: "emotionnel", label: "EMOTIONNEL", count: 2 },
  { id: "debrief", label: "DEBRIEF", count: 3 },
];

const EMOTIONS = ["FOMO", "Peur", "Revenge", "Overconfidence", "Hesitation", "Euphorie", "Aucun"];

export default function RapportPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("form");
  const [activeSection, setActiveSection] = useState<Section>("pre-marche");
  const report = currentDailyReport;

  const [biasMacro, setBiasMacro] = useState(report.biasMacro);
  const [announcements, setAnnouncements] = useState(report.announcements);
  const [techLevels, setTechLevels] = useState(report.technicalLevels);
  const [mentalState, setMentalState] = useState(report.mentalState);
  const [positionTaken, setPositionTaken] = useState(report.positionTaken);
  const [planRespected, setPlanRespected] = useState<boolean | null>(report.planRespected);
  const [execQuality, setExecQuality] = useState(report.executionQuality);
  const [emotions, setEmotions] = useState<string[]>(report.emotions);
  const [decisionProcess, setDecisionProcess] = useState(report.decisionProcess);
  const [marketEvents, setMarketEvents] = useState(report.marketEvents);
  const [mistakeToAvoid, setMistakeToAvoid] = useState(report.mistakeToAvoid);
  const [lessonLearned, setLessonLearned] = useState(report.lessonLearned);
  const [synthesis, setSynthesis] = useState(report.synthesis);

  const completedSections: Record<Section, number> = {
    "pre-marche": (biasMacro ? 1 : 0) + (announcements.length > 0 ? 1 : 0) + (techLevels.length > 0 ? 1 : 0) + 1,
    execution: (positionTaken ? 1 : 0) + (planRespected !== null ? 1 : 0) + (execQuality > 0 ? 1 : 0),
    emotionnel: (emotions.length > 0 ? 1 : 0) + (decisionProcess ? 1 : 0),
    debrief: (marketEvents ? 1 : 0) + (mistakeToAvoid ? 1 : 0) + (lessonLearned ? 1 : 0),
  };

  const totalCompleted = Object.values(completedSections).reduce((a, b) => a + b, 0);
  const totalQuestions = SECTIONS.reduce((a, s) => a + s.count, 0);

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", padding: "40px 48px" }} className="animate-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="tag font-mono text-xs">14 AVR 2026</span>
          <span
            className="text-[10px] font-bold px-2.5 py-1 rounded tracking-wider"
            style={{ background: "var(--accent-light)", color: "var(--accent)" }}
          >
            MARDI
          </span>
          {report.catalysts.map((c) => (
            <span key={c} className="tag tag-high font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--high-impact)" }} />
              {c}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-6">
          <div className="flex border rounded-md overflow-hidden" style={{ borderColor: "var(--border)" }}>
            {([["form", "A · Form"], ["chat", "B · Chat"], ["split", "C · Split"]] as [ViewMode, string][]).map(([mode, label], i) => (
              <button
                type="button"
                key={mode}
                onClick={() => setViewMode(mode)}
                className="px-4 py-2 text-xs font-medium transition-colors"
                style={{
                  background: viewMode === mode ? "var(--text-primary)" : "var(--bg-card)",
                  color: viewMode === mode ? "white" : "var(--text-secondary)",
                  borderLeft: i > 0 ? "1px solid var(--border)" : "none",
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-medium hover:bg-gray-50"
            style={{ borderColor: "var(--border)" }}
          >
            <Save size={13} /> Brouillon
          </button>
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium text-white"
            style={{ background: "var(--bull)" }}
          >
            <CheckCircle2 size={13} /> Cloturer la journee
          </button>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-4xl mb-2" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
        Rapport journalier
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
        Discipline · Process · Memoire. — {Math.round((totalCompleted / totalQuestions) * 100)}% complete · {totalQuestions - totalCompleted} questions restantes
      </p>

      {/* Section tabs */}
      <div className="grid grid-cols-4 mb-10 border rounded-lg overflow-hidden" style={{ borderColor: "var(--border)" }}>
        {SECTIONS.map((s, i) => {
          const isActive = activeSection === s.id;
          const completed = completedSections[s.id];
          const pct = (completed / s.count) * 100;
          return (
            <button
              type="button"
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className="relative py-4 px-5 text-left transition-colors"
              style={{
                background: isActive ? "var(--bg-card)" : "var(--bg-elevated)",
                borderLeft: i > 0 ? "1px solid var(--border)" : "none",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-[10px] font-bold tracking-wider"
                  style={{ color: isActive ? "var(--text-primary)" : "var(--text-muted)" }}
                >
                  {s.label}
                </span>
                <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                  {completed}/{s.count}
                </span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${pct}%` }} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Section content */}
      <div>
        {activeSection === "pre-marche" && (
          <div className="animate-in">
            <SectionTitle label="PRE-MARCHE" count={4} />

            <QuestionBlock label="QUEL EST TON BIAIS MACRO DU JOUR EN 1 PHRASE ?">
              <input
                type="text"
                value={biasMacro}
                onChange={(e) => setBiasMacro(e.target.value)}
                placeholder="Ex: Biais DXY bear si CPI core < 3.0%..."
              />
            </QuestionBlock>

            <QuestionBlock label="QUELLES ANNONCES / CATALYSEURS MAJEURS AUJOURD'HUI ?">
              <MultiInput values={announcements} onChange={setAnnouncements} placeholder="Ex: CPI US (14h30) — haute impact" />
            </QuestionBlock>

            <QuestionBlock label="QUELS NIVEAUX TECHNIQUES CLES SURVEILLES-TU ?">
              <MultiInput values={techLevels} onChange={setTechLevels} placeholder="Ex: EURUSD: 1.0935 (R) / 1.0870 (S)" />
            </QuestionBlock>

            <QuestionBlock label="ETAT MENTAL & PHYSIQUE (SOMMEIL, STRESS, CLARTE) ?">
              <div className="flex items-center gap-6 py-2">
                <span className="text-xs flex-shrink-0" style={{ color: "var(--text-muted)" }}>Faible</span>
                <div className="flex-1 flex flex-col items-center">
                  <span className="text-3xl font-light font-mono mb-3">{mentalState}/10</span>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={mentalState}
                    onChange={(e) => setMentalState(Number(e.target.value))}
                  />
                </div>
                <span className="text-xs flex-shrink-0" style={{ color: "var(--text-muted)" }}>Excellent</span>
              </div>
            </QuestionBlock>
          </div>
        )}

        {activeSection === "execution" && (
          <div className="animate-in">
            <SectionTitle label="EXECUTION" count={3} />

            <QuestionBlock label="AS-TU PRIS UNE POSITION ? SI OUI, LAQUELLE ET POURQUOI ?">
              <textarea
                value={positionTaken}
                onChange={(e) => setPositionTaken(e.target.value)}
                placeholder="Direction, instrument, taille, entry, SL, TP, these."
              />
            </QuestionBlock>

            <QuestionBlock label="LE SETUP RESPECTAIT-IL TON PLAN / CHECKLIST ?">
              <div className="flex gap-3">
                {([
                  [true, "Oui, plan respecte"],
                  [false, "Non, hors plan"],
                ] as [boolean, string][]).map(([val, label]) => (
                  <button
                    type="button"
                    key={label}
                    onClick={() => setPlanRespected(val)}
                    className="chip"
                    style={planRespected === val ? {
                      background: val ? "var(--bull-bg)" : "var(--bear-bg)",
                      borderColor: val ? "var(--bull)" : "var(--bear)",
                      color: val ? "var(--bull)" : "var(--bear)",
                    } : {}}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </QuestionBlock>

            <QuestionBlock label="QUALITE DE L'EXECUTION (ENTRY, GESTION, SORTIE) /5">
              <div className="flex items-center gap-3">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    type="button"
                    key={n}
                    onClick={() => setExecQuality(n)}
                    className="p-1 transition-colors"
                  >
                    <Star
                      size={28}
                      fill={n <= execQuality ? "var(--accent-gold)" : "none"}
                      stroke={n <= execQuality ? "var(--accent-gold)" : "var(--text-faint)"}
                    />
                  </button>
                ))}
                <span className="ml-3 font-mono text-sm" style={{ color: "var(--text-muted)" }}>
                  {execQuality}/5
                </span>
              </div>
            </QuestionBlock>
          </div>
        )}

        {activeSection === "emotionnel" && (
          <div className="animate-in">
            <SectionTitle label="EMOTIONNEL" count={2} />

            <QuestionBlock label="AS-TU RESSENTI FOMO, PEUR, REVENGE, OVERCONFIDENCE ?">
              <div className="flex flex-wrap gap-3">
                {EMOTIONS.map((e) => {
                  const isActive = emotions.includes(e);
                  const isDanger = ["FOMO", "Revenge", "Overconfidence"].includes(e);
                  return (
                    <button
                      type="button"
                      key={e}
                      onClick={() => {
                        if (isActive) setEmotions(emotions.filter((x) => x !== e));
                        else setEmotions([...emotions, e]);
                      }}
                      className="chip"
                      style={isActive ? {
                        background: isDanger ? "var(--bear-bg)" : "var(--bull-bg)",
                        borderColor: isDanger ? "var(--bear)" : "var(--bull)",
                        color: isDanger ? "var(--bear)" : "var(--bull)",
                      } : {}}
                    >
                      {e}
                    </button>
                  );
                })}
              </div>
            </QuestionBlock>

            <QuestionBlock label="DECISION PRISE SOUS EMOTION OU SOUS PROCESS ?">
              <div className="flex gap-3">
                {(["process", "mix", "emotion"] as const).map((val) => {
                  const labels = { process: "Process pur", mix: "Mix", emotion: "Emotion dominante" };
                  return (
                    <button
                      type="button"
                      key={val}
                      onClick={() => setDecisionProcess(val)}
                      className="chip"
                      style={decisionProcess === val ? {
                        background: "var(--accent-light)",
                        borderColor: "var(--accent)",
                        color: "var(--accent)",
                      } : {}}
                    >
                      {labels[val]}
                    </button>
                  );
                })}
              </div>
            </QuestionBlock>
          </div>
        )}

        {activeSection === "debrief" && (
          <div className="animate-in">
            <SectionTitle label="DEBRIEF" count={3} />

            <QuestionBlock label="QUE S'EST-IL PASSE DE MARQUANT AUJOURD'HUI SUR TES MARCHES ?">
              <textarea
                value={marketEvents}
                onChange={(e) => setMarketEvents(e.target.value)}
                placeholder="News, mouvements inattendus, rotations sectorielles..."
              />
            </QuestionBlock>

            <QuestionBlock label="UNE ERREUR A NE PLUS JAMAIS REPETER DEMAIN ?">
              <input
                type="text"
                value={mistakeToAvoid}
                onChange={(e) => setMistakeToAvoid(e.target.value)}
                placeholder="Si applicable."
              />
            </QuestionBlock>

            <QuestionBlock label="UNE LECON A ANCRER ?">
              <input
                type="text"
                value={lessonLearned}
                onChange={(e) => setLessonLearned(e.target.value)}
              />
            </QuestionBlock>

            {/* Synthese */}
            <div
              className="mt-10 p-6 rounded-xl border-2 border-dashed"
              style={{ borderColor: "var(--border)", background: "var(--bg-elevated)" }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="section-label" style={{ color: "var(--text-secondary)" }}>SYNTHESE DU JOUR</span>
              </div>
              <textarea
                value={synthesis}
                onChange={(e) => setSynthesis(e.target.value)}
                placeholder="Les 3 takeaways de la journee. Que retiens-tu ? Qu'est-ce qui change pour demain ?"
                className="min-h-[140px]"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionTitle({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center gap-3 mb-8 pb-4 border-b" style={{ borderColor: "var(--border-light)" }}>
      <span className="text-sm font-bold tracking-wider" style={{ color: "var(--text-primary)" }}>
        {label}
      </span>
      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
        · {count} questions
      </span>
    </div>
  );
}

function QuestionBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <label className="block text-[11px] font-bold tracking-wider uppercase mb-4" style={{ color: "var(--text-secondary)" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function MultiInput({
  values,
  onChange,
  placeholder,
}: {
  values: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState("");

  const add = () => {
    if (draft.trim()) {
      onChange([...values, draft.trim()]);
      setDraft("");
    }
  };

  return (
    <div className="space-y-3">
      {values.map((v, i) => (
        <div key={i} className="flex items-center gap-3">
          <input type="text" value={v} readOnly className="flex-1" />
          <button
            type="button"
            onClick={() => onChange(values.filter((_, j) => j !== i))}
            className="p-2 rounded-md hover:bg-gray-100 flex-shrink-0"
          >
            <X size={14} style={{ color: "var(--text-muted)" }} />
          </button>
        </div>
      ))}
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder={placeholder}
          className="flex-1"
          style={{ borderStyle: "dashed" }}
        />
      </div>
      <button
        type="button"
        onClick={add}
        className="flex items-center gap-1.5 text-xs font-medium px-2 py-1.5"
        style={{ color: "var(--text-secondary)" }}
      >
        <Plus size={12} /> Ajouter
      </button>
    </div>
  );
}
