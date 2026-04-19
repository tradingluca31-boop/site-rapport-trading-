"use client";

import { useState, useEffect, useRef } from "react";
import { currentDailyReport } from "@/lib/mock-data";
import {
  Save,
  CheckCircle2,
  Star,
  Sunrise,
  Target,
  Heart,
  BookOpenCheck,
  Quote,
} from "lucide-react";

const EMOTIONS = ["FOMO", "Peur", "Revenge", "Overconfidence", "Hesitation", "Euphorie", "Aucun"];

const CHAPTERS = [
  { id: "pre-marche", num: "01", label: "Avant la seance", icon: Sunrise },
  { id: "execution", num: "02", label: "Execution", icon: Target },
  { id: "emotionnel", num: "03", label: "Etat emotionnel", icon: Heart },
  { id: "debrief", num: "04", label: "Debrief", icon: BookOpenCheck },
];

function formatTodayHeader() {
  const now = new Date();
  const weekday = now.toLocaleDateString("fr-FR", { weekday: "long" }).toUpperCase();
  const day = now.getDate();
  const month = now.toLocaleDateString("fr-FR", { month: "short" }).toUpperCase().replace(".", "");
  const year = now.getFullYear();
  const full = now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  return { weekday, shortDate: `${day} ${month} ${year}`, full };
}

export default function RapportPage() {
  const report = currentDailyReport;
  const today = formatTodayHeader();

  const [activeChapter, setActiveChapter] = useState("pre-marche");

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

  const chapterRefs = {
    "pre-marche": useRef<HTMLDivElement>(null),
    execution: useRef<HTMLDivElement>(null),
    emotionnel: useRef<HTMLDivElement>(null),
    debrief: useRef<HTMLDivElement>(null),
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveChapter(entry.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -50% 0px" }
    );
    Object.values(chapterRefs).forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollToChapter = (id: string) => {
    const ref = chapterRefs[id as keyof typeof chapterRefs];
    ref?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="relative animate-in" style={{ background: "var(--bg)" }}>
      {/* Sticky chapter sidebar */}
      <aside
        className="hidden xl:block fixed top-[120px] z-30"
        style={{ left: "calc(var(--sidebar-width) + 40px)", width: 180 }}
      >
        <div className="text-[9px] font-bold tracking-[2.5px] uppercase mb-5" style={{ color: "var(--text-muted)" }}>
          Chapitres
        </div>
        <nav className="flex flex-col gap-1">
          {CHAPTERS.map((c) => {
            const Icon = c.icon;
            const isActive = activeChapter === c.id;
            return (
              <button
                type="button"
                key={c.id}
                onClick={() => scrollToChapter(c.id)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-all"
                style={{
                  background: isActive ? "var(--bg-card)" : "transparent",
                  color: isActive ? "var(--text-primary)" : "var(--text-muted)",
                  border: isActive ? "1px solid var(--border-light)" : "1px solid transparent",
                }}
              >
                <Icon size={14} style={{ color: isActive ? "var(--accent)" : "var(--text-faint)" }} />
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-mono" style={{ color: "var(--text-faint)" }}>
                    {c.num}
                  </div>
                  <div className="text-xs font-medium leading-tight">{c.label}</div>
                </div>
              </button>
            );
          })}
        </nav>
      </aside>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 48px 100px" }}>
        {/* Header meta bar */}
        <div className="flex items-center justify-between mb-16 gap-6">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="tag font-mono text-[11px]">{today.shortDate}</span>
            <span
              className="text-[10px] font-bold px-2.5 py-1 rounded tracking-wider"
              style={{ background: "var(--accent-light)", color: "var(--accent)" }}
            >
              {today.weekday}
            </span>
            {report.catalysts.map((c) => (
              <span key={c} className="tag tag-high font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--high-impact)" }} />
                {c}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
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

        {/* Hero cover */}
        <section className="mb-24 relative">
          <div className="text-[10px] font-bold tracking-[3px] uppercase mb-6" style={{ color: "var(--accent-gold)" }}>
            Journal de trading — entree du jour
          </div>
          <h1
            className="mb-8 leading-[0.95]"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 400,
              fontSize: "clamp(56px, 7vw, 88px)",
              letterSpacing: "-0.02em",
            }}
          >
            Journal <br />
            <span style={{ fontStyle: "italic", color: "var(--text-secondary)" }}>du jour.</span>
          </h1>
          <div className="flex items-start gap-4 max-w-xl">
            <Quote size={24} style={{ color: "var(--accent-gold)", flexShrink: 0, marginTop: 4 }} />
            <p
              className="text-[17px] leading-[1.7]"
              style={{
                color: "var(--text-secondary)",
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
                fontWeight: 400,
              }}
            >
              Ecris comme tu penses. Pas de filtre, pas de jugement. Ce journal est ton miroir — relis-le dans un mois.
            </p>
          </div>
          <div
            className="mt-10 inline-flex items-center gap-3 px-4 py-2 rounded-full"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: "var(--bull)" }} />
            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
              {today.full}
            </span>
          </div>
        </section>

        {/* ===== CHAPITRE 01 ===== */}
        <div id="pre-marche" ref={chapterRefs["pre-marche"]}>
          <ChapterHeading icon={<Sunrise size={22} />} number="01" label="Avant la seance" subtitle="Prepare ta tete avant d'ouvrir le marche." />
        </div>

        <JournalCard question="Comment te sens-tu ce matin ?" hint="Sommeil, energie, clarte mentale. Ecris librement.">
          <textarea
            value={mentalNote}
            onChange={(e) => setMentalNote(e.target.value)}
            placeholder="Ex: Bien dormi, 7h30. Calme. Pas de news perso qui parasite..."
            style={{ minHeight: 120 }}
          />
          <div
            className="flex items-center gap-5 mt-5 px-5 py-4 rounded-lg"
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-light)" }}
          >
            <span className="text-[10px] font-bold tracking-[2px] uppercase" style={{ color: "var(--text-secondary)" }}>
              Forme
            </span>
            <input
              type="range"
              min={1}
              max={10}
              value={mentalState}
              onChange={(e) => setMentalState(Number(e.target.value))}
              className="flex-1"
            />
            <span className="font-mono text-lg font-medium min-w-[56px] text-right" style={{ color: "var(--text-primary)" }}>
              {mentalState}
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>/10</span>
            </span>
          </div>
        </JournalCard>

        <JournalCard question="Quel est ton biais macro du jour ?" hint="En 1-2 phrases : direction, logique, conditions.">
          <textarea
            value={biasMacro}
            onChange={(e) => setBiasMacro(e.target.value)}
            placeholder="Ex: Biais DXY bear si CPI core < 3.0%. EURUSD long 1.0870..."
            style={{ minHeight: 120 }}
          />
        </JournalCard>

        <JournalCard question="Quelles annonces & catalyseurs aujourd'hui ?" hint="Une par ligne. Heure + nom + impact attendu.">
          <textarea
            value={announcementsText}
            onChange={(e) => setAnnouncementsText(e.target.value)}
            placeholder={"Ex:\n14:30 — CPI US core (consensus 3.1%)\n16:00 — Fed Powell speech"}
            style={{ minHeight: 130 }}
          />
        </JournalCard>

        <JournalCard question="Tes niveaux techniques a surveiller ?" hint="Instrument → R / S. Une ligne par paire.">
          <textarea
            value={techLevelsText}
            onChange={(e) => setTechLevelsText(e.target.value)}
            placeholder={"Ex:\nEURUSD : R 1.0935 / S 1.0870\nXAUUSD : R 3020 / S 2985"}
            style={{ minHeight: 130 }}
          />
        </JournalCard>

        {/* ===== CHAPITRE 02 ===== */}
        <div id="execution" ref={chapterRefs.execution}>
          <ChapterHeading icon={<Target size={22} />} number="02" label="Execution" subtitle="Ce que tu as fait pendant la seance." />
        </div>

        <JournalCard question="Qu'est-ce que tu as pris comme position ?" hint="Raconte : direction, taille, entry, SL, TP, et surtout pourquoi.">
          <textarea
            value={positionTaken}
            onChange={(e) => setPositionTaken(e.target.value)}
            placeholder="Ex: Long EURUSD 0.3%, entry 1.0888, SL 1.0865, TP 1.0940. Thesis : ..."
            style={{ minHeight: 160 }}
          />
        </JournalCard>

        <JournalCard question="As-tu respecte ton plan / checklist ?" hint="Choisis puis explique en 2-3 phrases.">
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
            style={{ minHeight: 110 }}
          />
        </JournalCard>

        <JournalCard question="Qualite d'execution : entry, gestion, sortie" hint="Note et commente. Les 3 moments se jugent separement.">
          <div
            className="flex items-center gap-3 mb-4 px-5 py-4 rounded-lg"
            style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-light)" }}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                type="button"
                key={n}
                onClick={() => setExecQuality(n)}
                title={`Note ${n}`}
                className="p-1 transition-colors"
              >
                <Star
                  size={28}
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
            style={{ minHeight: 110 }}
          />
        </JournalCard>

        {/* ===== CHAPITRE 03 ===== */}
        <div id="emotionnel" ref={chapterRefs.emotionnel}>
          <ChapterHeading icon={<Heart size={22} />} number="03" label="Etat emotionnel" subtitle="La partie qu'on oublie toujours. La plus importante." />
        </div>

        <JournalCard question="Qu'as-tu ressenti pendant la seance ?" hint="Coche ce qui s'applique, puis raconte la scene.">
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
            style={{ minHeight: 140 }}
          />
        </JournalCard>

        <JournalCard question="Process ou emotion : qu'est-ce qui a dirige tes decisions ?" hint="Sois brutal avec toi-meme. C'est le seul moyen d'evoluer.">
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
            style={{ minHeight: 110 }}
          />
        </JournalCard>

        {/* ===== CHAPITRE 04 ===== */}
        <div id="debrief" ref={chapterRefs.debrief}>
          <ChapterHeading icon={<BookOpenCheck size={22} />} number="04" label="Debrief" subtitle="Ce que la journee t'apprend. A froid." />
        </div>

        <JournalCard question="Que s'est-il passe aujourd'hui sur les marches ?" hint="Raconte les mouvements cles, les news, ce qui a bouge l'aiguille.">
          <textarea
            value={marketEvents}
            onChange={(e) => setMarketEvents(e.target.value)}
            placeholder="Ex: CPI sorti a 3.0%, DXY cassure 104.20, Gold +1.8%..."
            style={{ minHeight: 170 }}
          />
        </JournalCard>

        <JournalCard question="Qu'est-ce qui t'a surpris ?" hint="Ce que tu n'avais pas anticipe. Les bonnes surprises comme les mauvaises.">
          <textarea
            value={surprises}
            onChange={(e) => setSurprises(e.target.value)}
            placeholder="Ex: La vigueur du rebond EUR alors que la BCE etait attendue dovish..."
            style={{ minHeight: 140 }}
          />
        </JournalCard>

        <JournalCard question="Une erreur a ne plus jamais repeter" hint="Sois specifique. Une seule erreur. La plus couteuse.">
          <textarea
            value={mistakeToAvoid}
            onChange={(e) => setMistakeToAvoid(e.target.value)}
            placeholder="Ex: Ne plus ajouter a une perte sans raison technique..."
            style={{ minHeight: 100 }}
          />
        </JournalCard>

        <JournalCard question="Une lecon a ancrer" hint="Une phrase que tu voudrais retenir dans 6 mois.">
          <textarea
            value={lessonLearned}
            onChange={(e) => setLessonLearned(e.target.value)}
            placeholder="Ex: La patience paye plus que l'anticipation..."
            style={{ minHeight: 100 }}
          />
        </JournalCard>

        {/* Synthese finale */}
        <div
          className="mt-16 relative overflow-hidden"
          style={{
            padding: "40px 44px 44px",
            borderRadius: 16,
            background: "linear-gradient(135deg, var(--accent-gold-light) 0%, transparent 70%)",
            border: "1px solid var(--border)",
          }}
        >
          <div
            className="absolute top-0 left-0 bottom-0 w-[4px]"
            style={{ background: "var(--accent-gold)" }}
          />
          <div className="flex items-center gap-3 mb-6">
            <span
              className="text-[10px] font-bold tracking-[2.5px] uppercase px-3 py-1.5 rounded"
              style={{ background: "var(--accent-gold)", color: "white" }}
            >
              SYNTHESE
            </span>
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Les 3 takeaways du jour
            </span>
          </div>
          <h3
            className="text-2xl mb-5"
            style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontStyle: "italic" }}
          >
            Si tu ne devais retenir que 3 choses…
          </h3>
          <textarea
            value={synthesis}
            onChange={(e) => setSynthesis(e.target.value)}
            placeholder={"1. …\n2. …\n3. …"}
            style={{ minHeight: 200, background: "var(--bg-card)", fontSize: 14 }}
          />
        </div>
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
    <div className="mt-24 mb-10 relative">
      <div className="flex items-center gap-4 mb-6">
        <div
          className="h-px flex-shrink-0"
          style={{ width: 36, background: "var(--accent-gold)" }}
        />
        <span
          className="text-[10px] font-bold tracking-[3px] uppercase"
          style={{ color: "var(--accent-gold)" }}
        >
          Chapitre {number}
        </span>
      </div>
      <div className="flex items-center gap-5">
        <span
          className="flex items-center justify-center rounded-xl flex-shrink-0"
          style={{
            width: 52,
            height: 52,
            background: "var(--bg-card)",
            border: "1px solid var(--border-light)",
            color: "var(--accent)",
          }}
        >
          {icon}
        </span>
        <div>
          <h2
            className="text-4xl leading-none mb-1"
            style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
          >
            {label}
          </h2>
          <p className="text-sm" style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}

function JournalCard({
  question,
  hint,
  children,
}: {
  question: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <article
      className="mb-6 relative"
      style={{
        padding: "28px 30px 30px",
        borderRadius: 12,
        background: "var(--bg-card)",
        border: "1px solid var(--border-light)",
        boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
      }}
    >
      <h3
        className="text-[19px] mb-2"
        style={{ fontFamily: "var(--font-display)", fontWeight: 500, color: "var(--text-primary)", letterSpacing: "-0.01em" }}
      >
        {question}
      </h3>
      <p className="text-[12px] mb-5" style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
        {hint}
      </p>
      {children}
    </article>
  );
}
