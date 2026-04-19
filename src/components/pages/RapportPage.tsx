"use client";

import { useState } from "react";
import { currentDailyReport } from "@/lib/mock-data";
import {
  Save,
  CheckCircle2,
  Star,
  Sunrise,
  Target,
  Heart,
  BookOpenCheck,
} from "lucide-react";

const EMOTIONS = ["FOMO", "Peur", "Revenge", "Overconfidence", "Hesitation", "Euphorie", "Aucun"];

export default function RapportPage() {
  const report = currentDailyReport;

  const [biasMacro, setBiasMacro] = useState(report.biasMacro);
  const [announcementsText, setAnnouncementsText] = useState(report.announcements.join("\n"));
  const [techLevelsText, setTechLevelsText] = useState(report.technicalLevels.join("\n"));
  const [mentalState, setMentalState] = useState(report.mentalState);
  const [mentalNote, setMentalNote] = useState("");

  const [positionTaken, setPositionTaken] = useState(report.positionTaken);
  const [planRespected, setPlanRespected] = useState<boolean | null>(report.planRespected);
  const [planReason, setPlanReason] = useState("");
  const [execQuality, setExecQuality] = useState(report.executionQuality);
  const [execNote, setExecNote] = useState("");

  const [emotions, setEmotions] = useState<string[]>(report.emotions);
  const [emotionsStory, setEmotionsStory] = useState("");
  const [decisionProcess, setDecisionProcess] = useState(report.decisionProcess);
  const [decisionNote, setDecisionNote] = useState("");

  const [marketEvents, setMarketEvents] = useState(report.marketEvents);
  const [surprises, setSurprises] = useState("");
  const [mistakeToAvoid, setMistakeToAvoid] = useState(report.mistakeToAvoid);
  const [lessonLearned, setLessonLearned] = useState(report.lessonLearned);
  const [synthesis, setSynthesis] = useState(report.synthesis);

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "40px 48px 80px" }} className="animate-in">
      {/* Header meta */}
      <div className="flex items-start justify-between mb-6 gap-6">
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
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            type="button"
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg border text-xs font-medium hover:bg-gray-50"
            style={{ borderColor: "var(--border)" }}
          >
            <Save size={13} /> Brouillon
          </button>
          <button
            type="button"
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium text-white"
            style={{ background: "var(--bull)" }}
          >
            <CheckCircle2 size={13} /> Cloturer
          </button>
        </div>
      </div>

      {/* Titre journal */}
      <h1 className="text-5xl mb-3" style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}>
        Journal du jour
      </h1>
      <p className="text-[15px] mb-12 leading-relaxed" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-display)", fontStyle: "italic" }}>
        &ldquo;Ecris comme tu penses. Pas de filtre, pas de jugement. Ce journal est ton miroir — relis-le dans un mois.&rdquo;
      </p>

      {/* ===== PRE-MARCHE ===== */}
      <ChapterHeading icon={<Sunrise size={18} />} number="01" label="Avant la seance" subtitle="Prepare ta tete avant d'ouvrir le marche." />

      <JournalQuestion
        question="Comment te sens-tu ce matin ?"
        hint="Sommeil, energie, clarte mentale. Ecris librement."
      >
        <textarea
          value={mentalNote}
          onChange={(e) => setMentalNote(e.target.value)}
          placeholder="Ex: Bien dormi, 7h30. Calme. Pas de news perso qui parasite..."
          style={{ minHeight: 110 }}
        />
        <div className="flex items-center gap-4 mt-4 py-3 px-4 rounded-lg" style={{ background: "var(--bg-elevated)" }}>
          <span className="text-[11px] font-bold tracking-wider uppercase" style={{ color: "var(--text-secondary)" }}>
            Score
          </span>
          <input
            type="range"
            min={1}
            max={10}
            value={mentalState}
            onChange={(e) => setMentalState(Number(e.target.value))}
            className="flex-1"
          />
          <span className="font-mono text-base font-medium min-w-[48px] text-right">{mentalState}/10</span>
        </div>
      </JournalQuestion>

      <JournalQuestion
        question="Quel est ton biais macro du jour ?"
        hint="En 1-2 phrases : direction, logique, conditions."
      >
        <textarea
          value={biasMacro}
          onChange={(e) => setBiasMacro(e.target.value)}
          placeholder="Ex: Biais DXY bear si CPI core < 3.0%. EURUSD long 1.0870..."
          style={{ minHeight: 110 }}
        />
      </JournalQuestion>

      <JournalQuestion
        question="Quelles annonces & catalyseurs aujourd'hui ?"
        hint="Une par ligne. Heure + nom + impact attendu."
      >
        <textarea
          value={announcementsText}
          onChange={(e) => setAnnouncementsText(e.target.value)}
          placeholder={"Ex:\n14:30 — CPI US core (consensus 3.1%)\n16:00 — Fed Powell speech"}
          style={{ minHeight: 120 }}
        />
      </JournalQuestion>

      <JournalQuestion
        question="Tes niveaux techniques a surveiller ?"
        hint="Instrument → R / S. Une ligne par paire."
      >
        <textarea
          value={techLevelsText}
          onChange={(e) => setTechLevelsText(e.target.value)}
          placeholder={"Ex:\nEURUSD : R 1.0935 / S 1.0870\nXAUUSD : R 3020 / S 2985"}
          style={{ minHeight: 120 }}
        />
      </JournalQuestion>

      {/* ===== EXECUTION ===== */}
      <ChapterHeading icon={<Target size={18} />} number="02" label="Execution" subtitle="Ce que tu as fait pendant la seance." />

      <JournalQuestion
        question="Qu'est-ce que tu as pris comme position ?"
        hint="Raconte : direction, taille, entry, SL, TP, et surtout pourquoi."
      >
        <textarea
          value={positionTaken}
          onChange={(e) => setPositionTaken(e.target.value)}
          placeholder="Ex: Long EURUSD 0.3%, entry 1.0888, SL 1.0865, TP 1.0940. Thesis : ..."
          style={{ minHeight: 150 }}
        />
      </JournalQuestion>

      <JournalQuestion
        question="As-tu respecte ton plan / checklist ?"
        hint="Choisis puis explique en 2-3 phrases."
      >
        <div className="flex gap-3 mb-4">
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
        <textarea
          value={planReason}
          onChange={(e) => setPlanReason(e.target.value)}
          placeholder="Pourquoi ? Qu'est-ce qui t'a fait sortir du plan (ou y rester) ?"
          style={{ minHeight: 100 }}
        />
      </JournalQuestion>

      <JournalQuestion
        question="Qualite d'execution : entry, gestion, sortie"
        hint="Note et commente. Les 3 moments se jugent separement."
      >
        <div className="flex items-center gap-3 mb-4 px-4 py-3 rounded-lg" style={{ background: "var(--bg-elevated)" }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              type="button"
              key={n}
              onClick={() => setExecQuality(n)}
              className="p-1 transition-colors"
            >
              <Star
                size={26}
                fill={n <= execQuality ? "var(--accent-gold)" : "none"}
                stroke={n <= execQuality ? "var(--accent-gold)" : "var(--text-faint)"}
              />
            </button>
          ))}
          <span className="ml-auto font-mono text-sm" style={{ color: "var(--text-muted)" }}>
            {execQuality}/5
          </span>
        </div>
        <textarea
          value={execNote}
          onChange={(e) => setExecNote(e.target.value)}
          placeholder="Ex: Entry timing bon, mais j'ai bouge mon SL 2x par peur. Sortie trop tot..."
          style={{ minHeight: 100 }}
        />
      </JournalQuestion>

      {/* ===== EMOTIONNEL ===== */}
      <ChapterHeading icon={<Heart size={18} />} number="03" label="Etat emotionnel" subtitle="La partie qu'on oublie toujours. La plus importante." />

      <JournalQuestion
        question="Qu'as-tu ressenti pendant la seance ?"
        hint="Coche ce qui s'applique, puis raconte la scene."
      >
        <div className="flex flex-wrap gap-2 mb-4">
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
        <textarea
          value={emotionsStory}
          onChange={(e) => setEmotionsStory(e.target.value)}
          placeholder="Raconte le moment precis. Qu'est-ce qui a declenche ? Comment as-tu reagi ?"
          style={{ minHeight: 130 }}
        />
      </JournalQuestion>

      <JournalQuestion
        question="Process ou emotion : honnetement, qu'est-ce qui a dirige tes decisions ?"
        hint="Sois brutal avec toi-meme. C'est le seul moyen d'evoluer."
      >
        <div className="flex gap-3 mb-4">
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
        <textarea
          value={decisionNote}
          onChange={(e) => setDecisionNote(e.target.value)}
          placeholder="Explique : sur quelle decision tu as derive, et pourquoi."
          style={{ minHeight: 100 }}
        />
      </JournalQuestion>

      {/* ===== DEBRIEF ===== */}
      <ChapterHeading icon={<BookOpenCheck size={18} />} number="04" label="Debrief" subtitle="Ce que la journee t'apprend. A froid." />

      <JournalQuestion
        question="Que s'est-il passe aujourd'hui sur les marches ?"
        hint="Raconte les mouvements cles, les news, ce qui a bouge l'aiguille."
      >
        <textarea
          value={marketEvents}
          onChange={(e) => setMarketEvents(e.target.value)}
          placeholder="Ex: CPI sorti a 3.0%, DXY cassure 104.20, Gold +1.8%..."
          style={{ minHeight: 160 }}
        />
      </JournalQuestion>

      <JournalQuestion
        question="Qu'est-ce qui t'a surpris ?"
        hint="Ce que tu n'avais pas anticipe. Les bonnes surprises comme les mauvaises."
      >
        <textarea
          value={surprises}
          onChange={(e) => setSurprises(e.target.value)}
          placeholder="Ex: La vigueur du rebond EUR alors que la BCE etait attendue dovish..."
          style={{ minHeight: 130 }}
        />
      </JournalQuestion>

      <JournalQuestion
        question="Une erreur a ne plus jamais repeter"
        hint="Sois specifique. Une seule erreur. La plus couteuse."
      >
        <textarea
          value={mistakeToAvoid}
          onChange={(e) => setMistakeToAvoid(e.target.value)}
          placeholder="Ex: Ne plus ajouter a une perte sans raison technique..."
          style={{ minHeight: 90 }}
        />
      </JournalQuestion>

      <JournalQuestion
        question="Une lecon a ancrer"
        hint="Une phrase que tu voudrais retenir dans 6 mois."
      >
        <textarea
          value={lessonLearned}
          onChange={(e) => setLessonLearned(e.target.value)}
          placeholder="Ex: La patience paye plus que l'anticipation..."
          style={{ minHeight: 90 }}
        />
      </JournalQuestion>

      {/* Synthese finale */}
      <div
        className="mt-12 p-8 rounded-xl"
        style={{
          background: "linear-gradient(135deg, var(--accent-gold-light) 0%, transparent 80%)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="flex items-center gap-3 mb-5">
          <span
            className="text-[9px] font-bold tracking-[2.5px] uppercase px-2.5 py-1 rounded"
            style={{ background: "var(--accent-gold)", color: "white" }}
          >
            SYNTHESE
          </span>
          <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Les 3 takeaways du jour
          </span>
        </div>
        <textarea
          value={synthesis}
          onChange={(e) => setSynthesis(e.target.value)}
          placeholder={"1. …\n2. …\n3. …"}
          style={{ minHeight: 180, background: "var(--bg-card)" }}
        />
      </div>
    </div>
  );
}

function ChapterHeading({
  icon,
  number,
  label,
  subtitle,
}: {
  icon: React.ReactNode;
  number: string;
  label: string;
  subtitle: string;
}) {
  return (
    <div className="mt-16 mb-8 pb-5 border-b" style={{ borderColor: "var(--border-light)" }}>
      <div className="flex items-center gap-3 mb-2">
        <span
          className="flex items-center justify-center w-9 h-9 rounded-lg"
          style={{ background: "var(--bg-elevated)", color: "var(--accent)" }}
        >
          {icon}
        </span>
        <span className="font-mono text-xs" style={{ color: "var(--text-muted)" }}>
          {number}
        </span>
        <h2
          className="text-2xl"
          style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
        >
          {label}
        </h2>
      </div>
      <p className="text-sm ml-12" style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
        {subtitle}
      </p>
    </div>
  );
}

function JournalQuestion({
  question,
  hint,
  children,
}: {
  question: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-10">
      <h3
        className="text-[17px] mb-1.5"
        style={{ fontFamily: "var(--font-display)", fontWeight: 500, color: "var(--text-primary)" }}
      >
        {question}
      </h3>
      <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
        {hint}
      </p>
      {children}
    </div>
  );
}
