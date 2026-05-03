"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Option {
  text: string;
  score: Record<string, number>;
}

interface Question {
  id: number;
  label: string;
  text: string;
  options: Option[];
}

const SCHOOL_META: Record<string, { title: string; tagline: string; description: string; accent: string }> = {
  "school-socratic-method": {
    title: "The Socratic Method",
    tagline: "Dialectic & Examination",
    description: "You are a relentless questioner. Where others accept received wisdom, you probe assumptions through dialogue. Truth, for you, is not handed down — it is drawn out through rigorous cross-examination, and the unexamined life is simply not worth living.",
    accent: "#C47029",
  },
  "school-platonism": {
    title: "Platonism",
    tagline: "The Realm of Forms",
    description: "You believe reality lies beyond appearances. The flickering world of the senses is a pale shadow of an eternal realm of perfect Forms — the true objects of knowledge. Philosophy is the soul's ascent from illusion toward the blinding clarity of genuine being.",
    accent: "#C47029",
  },
  "school-aristotelianism": {
    title: "Aristotelianism",
    tagline: "Logic & Virtue",
    description: "You are a systematic thinker grounded in the observable world. Where Plato transcends experience, you interrogate it. Logic, virtue, and flourishing — eudaimonia — are achieved not through retreat from life but through disciplined engagement with it.",
    accent: "#C47029",
  },
  "school-stoicism": {
    title: "Stoicism",
    tagline: "Reason & Equanimity",
    description: "You seek serenity through alignment with rational nature. Externals — wealth, reputation, even death — are neither good nor bad. What matters is the quality of your will. Virtue is the only true good, and wisdom consists in controlling what is within your power.",
    accent: "#8B6229",
  },
  "school-neoplatonism": {
    title: "Neoplatonism",
    tagline: "Emanation & The One",
    description: "You sense that all things flow from a single, ineffable source — the One — and that the soul's highest purpose is to return to that unity. Philosophy, for you, is not merely argument but a spiritual ascent toward mystical union with the ground of all being.",
    accent: "#8B6229",
  },
  "school-scholasticism": {
    title: "Scholasticism",
    tagline: "Faith & Reason",
    description: "You hold that reason and revelation illuminate the same truth from different angles. The great tradition of Aristotle, harmonised with Christian theology, offers a comprehensive architecture of knowledge — from natural science to divine mystery.",
    accent: "#6B7A47",
  },
  "school-rationalism": {
    title: "Rationalism",
    tagline: "Reason Supreme",
    description: "You believe that the most certain truths are known not through the senses but through pure reason. Innate ideas, mathematical necessity, and the power of deduction are your instruments. The mind, properly used, can unlock the structure of reality itself.",
    accent: "#8B6914",
  },
  "school-empiricism": {
    title: "Empiricism",
    tagline: "Sensation & Proof",
    description: "You trust experience above all. The mind begins as a blank slate, and knowledge is built from the bottom up — through sensation, reflection, and careful induction. Claims that outrun observation are suspect; the laboratory and the senses are the final court of appeal.",
    accent: "#8B6914",
  },
  "school-critical-philosophy": {
    title: "Critical Philosophy",
    tagline: "Mind's Frontier",
    description: "You believe knowledge is the joint product of sensation and the mind's own structuring activity. There are things we can know — and a hard boundary beyond which pure reason overreaches. Ethics demands acting on principles you could will to be universal law.",
    accent: "#5A6999",
  },
  "school-german-idealism": {
    title: "German Idealism",
    tagline: "Spirit & Dialectic",
    description: "You see history as the unfolding of Spirit coming to know itself through contradiction and synthesis. Reality is not a fixed thing but a dynamic process — and freedom, fully realised, is not the absence of constraint but rational self-determination within a living whole.",
    accent: "#5A6999",
  },
  "school-existentialism": {
    title: "Existentialism",
    tagline: "Being & Void",
    description: "You begin with the raw fact of existence — thrown into a world without given meaning — and insist that this is not a tragedy but a summons. Existence precedes essence: you are what you choose. Authenticity, anguish, and radical freedom define the human condition.",
    accent: "#7A5C6E",
  },
  "school-analytic-philosophy": {
    title: "Analytic Philosophy",
    tagline: "Language as Limit",
    description: "You believe that most philosophical problems are, at bottom, problems of language and logic. Clarity is the cardinal virtue; confusion the cardinal sin. Through rigorous analysis of concepts and arguments, you aim to dissolve metaphysical puzzles rather than merely live with them.",
    accent: "#4A5568",
  },
};

const QUESTIONS: Question[] = [
  {
    id: 1,
    label: "On Knowledge",
    text: "How do you believe we most reliably come to know the world?",
    options: [
      {
        text: "Through pure reason — the mind contains innate structures that reveal necessary truths independently of experience.",
        score: { "school-rationalism": 3, "school-platonism": 2, "school-critical-philosophy": 1 },
      },
      {
        text: "Through sensory experience — knowledge is built from observation, experiment, and careful induction.",
        score: { "school-empiricism": 3, "school-aristotelianism": 2, "school-analytic-philosophy": 1 },
      },
      {
        text: "Through dialectical questioning — genuine knowledge emerges only when assumptions are rigorously tested in dialogue.",
        score: { "school-socratic-method": 3, "school-critical-philosophy": 1, "school-existentialism": 1 },
      },
      {
        text: "Through both faith and reason working together — revelation completes what natural inquiry cannot reach alone.",
        score: { "school-scholasticism": 3, "school-neoplatonism": 2, "school-rationalism": 1 },
      },
    ],
  },
  {
    id: 2,
    label: "On Reality",
    text: "What is the deepest nature of the world we inhabit?",
    options: [
      {
        text: "An eternal realm of perfect, unchanging Forms — the physical world is merely their imperfect reflection.",
        score: { "school-platonism": 3, "school-neoplatonism": 2, "school-rationalism": 1 },
      },
      {
        text: "The material world itself — real, lawful, and knowable through observation and logical analysis.",
        score: { "school-aristotelianism": 3, "school-empiricism": 2, "school-analytic-philosophy": 2 },
      },
      {
        text: "Mind or Spirit — matter is a manifestation of rational consciousness unfolding through history.",
        score: { "school-german-idealism": 3, "school-neoplatonism": 2, "school-critical-philosophy": 1 },
      },
      {
        text: "A rational, unified substance — God and Nature are ultimately one and the same infinite reality.",
        score: { "school-rationalism": 3, "school-scholasticism": 2, "school-neoplatonism": 1 },
      },
    ],
  },
  {
    id: 3,
    label: "On the Self",
    text: "What are you, at your most fundamental level?",
    options: [
      {
        text: "A rational soul temporarily housed in a body, whose true home is the realm of eternal truth.",
        score: { "school-platonism": 3, "school-neoplatonism": 2, "school-scholasticism": 1 },
      },
      {
        text: "A being defined entirely by your choices — you have no fixed nature prior to the life you live.",
        score: { "school-existentialism": 3, "school-socratic-method": 1, "school-critical-philosophy": 1 },
      },
      {
        text: "A social and rational animal, whose flourishing depends on community, virtue, and purposive activity.",
        score: { "school-aristotelianism": 3, "school-stoicism": 2, "school-scholasticism": 1 },
      },
      {
        text: "A thinking subject whose mind actively structures the experience it receives from the senses.",
        score: { "school-critical-philosophy": 3, "school-rationalism": 2, "school-german-idealism": 1 },
      },
    ],
  },
  {
    id: 4,
    label: "On Ethics",
    text: "What is the proper foundation of moral life?",
    options: [
      {
        text: "Virtue — a stable character forged through habit and reason, oriented toward genuine human flourishing.",
        score: { "school-aristotelianism": 3, "school-stoicism": 2, "school-socratic-method": 1 },
      },
      {
        text: "Duty — act only on principles you could consistently will every rational being to follow.",
        score: { "school-critical-philosophy": 3, "school-rationalism": 2, "school-scholasticism": 1 },
      },
      {
        text: "Authenticity — the honest confrontation with your freedom and responsibility in a world without given values.",
        score: { "school-existentialism": 3, "school-socratic-method": 1, "school-analytic-philosophy": 1 },
      },
      {
        text: "Natural order — living in accordance with reason and the rational structure of the cosmos.",
        score: { "school-stoicism": 3, "school-neoplatonism": 2, "school-aristotelianism": 1 },
      },
    ],
  },
  {
    id: 5,
    label: "On Language",
    text: "What is the relationship between language and philosophical truth?",
    options: [
      {
        text: "The limits of my language are the limits of my world — philosophy's task is the clarification of what can be said.",
        score: { "school-analytic-philosophy": 3, "school-critical-philosophy": 2, "school-empiricism": 1 },
      },
      {
        text: "The highest truths lie beyond what language can capture — they must be approached through contemplation.",
        score: { "school-neoplatonism": 3, "school-german-idealism": 2, "school-platonism": 1 },
      },
      {
        text: "Language is a tool for dialogue — truth emerges through the back-and-forth of question and answer.",
        score: { "school-socratic-method": 3, "school-aristotelianism": 1, "school-existentialism": 1 },
      },
      {
        text: "Concepts are structured by the mind — language reflects the categories through which reason organises experience.",
        score: { "school-critical-philosophy": 3, "school-rationalism": 2, "school-german-idealism": 1 },
      },
    ],
  },
  {
    id: 6,
    label: "On Transcendence",
    text: "How do you conceive of the divine or ultimate ground of existence?",
    options: [
      {
        text: "As an infinite, perfect Being whose existence can be approached through reason and natural theology.",
        score: { "school-scholasticism": 3, "school-rationalism": 2, "school-neoplatonism": 1 },
      },
      {
        text: "As the One — ineffable, beyond being itself, from which all things emanate and toward which the soul yearns.",
        score: { "school-neoplatonism": 3, "school-platonism": 2, "school-german-idealism": 1 },
      },
      {
        text: "As the Absolute — the totality of Spirit realising itself through the rational unfolding of history.",
        score: { "school-german-idealism": 3, "school-neoplatonism": 1, "school-scholasticism": 1 },
      },
      {
        text: "As a question requiring conceptual clarification before it can even be meaningfully addressed.",
        score: { "school-analytic-philosophy": 3, "school-critical-philosophy": 2, "school-empiricism": 1 },
      },
    ],
  },
  {
    id: 7,
    label: "On History",
    text: "How do you understand the movement of human history?",
    options: [
      {
        text: "As the progressive unfolding of Spirit through contradiction — each era negating and preserving the last.",
        score: { "school-german-idealism": 3, "school-critical-philosophy": 1, "school-scholasticism": 1 },
      },
      {
        text: "As essentially static at its core — human nature and the conditions of the good life are fixed across time.",
        score: { "school-stoicism": 3, "school-aristotelianism": 2, "school-platonism": 1 },
      },
      {
        text: "As a succession of epochs, each requiring a new confrontation with freedom and the absence of fixed meaning.",
        score: { "school-existentialism": 3, "school-german-idealism": 1, "school-socratic-method": 1 },
      },
      {
        text: "As the accumulation of knowledge — gradual, correctable, and oriented toward a clearer picture of reality.",
        score: { "school-empiricism": 3, "school-analytic-philosophy": 2, "school-rationalism": 1 },
      },
    ],
  },
  {
    id: 8,
    label: "On Politics",
    text: "What is the legitimate basis for political authority?",
    options: [
      {
        text: "Knowledge of the Good — the ideal state should be governed by those with genuine philosophical wisdom.",
        score: { "school-platonism": 3, "school-rationalism": 2, "school-scholasticism": 1 },
      },
      {
        text: "Human flourishing — good governance cultivates the conditions in which citizens can live well and develop virtue.",
        score: { "school-aristotelianism": 3, "school-stoicism": 2, "school-scholasticism": 1 },
      },
      {
        text: "Rational consent and individual liberty — authority is legitimate only when grounded in free agreement.",
        score: { "school-empiricism": 3, "school-critical-philosophy": 2, "school-existentialism": 1 },
      },
      {
        text: "Ethical rationality — a state is legitimate insofar as it embodies the freedom of rational self-determination.",
        score: { "school-german-idealism": 3, "school-critical-philosophy": 2, "school-rationalism": 1 },
      },
    ],
  },
  {
    id: 9,
    label: "On the Examined Life",
    text: "What does it mean to live philosophically?",
    options: [
      {
        text: "To question ceaselessly — most especially one's own convictions — and to follow the argument wherever it leads.",
        score: { "school-socratic-method": 3, "school-analytic-philosophy": 2, "school-existentialism": 1 },
      },
      {
        text: "To cultivate inner freedom — to remain undisturbed by fortune by mastering what is truly within one's power.",
        score: { "school-stoicism": 3, "school-neoplatonism": 2, "school-scholasticism": 1 },
      },
      {
        text: "To investigate the world with patient, systematic curiosity — building knowledge from evidence and careful logic.",
        score: { "school-aristotelianism": 3, "school-empiricism": 2, "school-analytic-philosophy": 1 },
      },
      {
        text: "To ascend — whether toward the Forms, the One, or Absolute Spirit — through contemplative or dialectical effort.",
        score: { "school-neoplatonism": 3, "school-platonism": 2, "school-german-idealism": 2 },
      },
    ],
  },
  {
    id: 10,
    label: "On the Central Problem",
    text: "Which philosophical question strikes you as the most urgent and inescapable?",
    options: [
      {
        text: "How can finite minds attain certainty — and where exactly does genuine knowledge end and illusion begin?",
        score: { "school-critical-philosophy": 3, "school-rationalism": 2, "school-empiricism": 2 },
      },
      {
        text: "What does it truly mean to exist — to be thrown into a world, condemned to be free, without prior essence?",
        score: { "school-existentialism": 3, "school-socratic-method": 2, "school-critical-philosophy": 1 },
      },
      {
        text: "What is the logical structure underlying language, thought, and our claims about the world?",
        score: { "school-analytic-philosophy": 3, "school-critical-philosophy": 2, "school-rationalism": 1 },
      },
      {
        text: "How does multiplicity arise from unity — and how can the soul return to the source from which it emanated?",
        score: { "school-neoplatonism": 3, "school-german-idealism": 2, "school-platonism": 2 },
      },
    ],
  },
];

interface Props {
  onClose: () => void;
  onResult: (schoolId: string) => void;
}

export default function QuizOverlay({ onClose, onResult }: Props) {
  const [step, setStep]           = useState(0);
  const [scores, setScores]       = useState<Record<string, number>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [chosen, setChosen]       = useState<number | null>(null);

  const handleOption = (score: Record<string, number>, idx: number) => {
    if (chosen !== null) return;
    setChosen(idx);
    const next = { ...scores };
    Object.entries(score).forEach(([id, val]) => { next[id] = (next[id] || 0) + val; });
    setScores(next);
    setTimeout(() => {
      setChosen(null);
      if (step < QUESTIONS.length - 1) setStep(step + 1);
      else setIsFinished(true);
    }, 420);
  };

  const getSortedResults = () =>
    Object.entries(scores).sort((a, b) => b[1] - a[1]);

  const topId    = getSortedResults()[0]?.[0] || "school-socratic-method";
  const topMeta  = SCHOOL_META[topId];
  const maxScore = getSortedResults()[0]?.[1] || 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(249,246,240,0.98)",
        backdropFilter: "blur(32px)", WebkitBackdropFilter: "blur(32px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        overflowY: "auto",
      }}
      onMouseDown={e => e.stopPropagation()}
      onWheel={e => e.stopPropagation()}
    >
      {/* Ruled lines texture */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 47px, rgba(132,84,0,0.022) 48px)",
      }} />

      {/* Close */}
      <button
        onClick={onClose}
        style={{
          position: "fixed", top: 32, right: 36,
          background: "none", border: "none",
          color: "rgba(17,21,26,0.22)", fontSize: "0.7rem",
          cursor: "pointer", fontFamily: "var(--font-sans)",
          letterSpacing: "0.14em", textTransform: "uppercase",
          padding: "6px 10px", transition: "color 0.2s",
        }}
        onMouseEnter={e => (e.currentTarget.style.color = "rgba(17,21,26,0.6)")}
        onMouseLeave={e => (e.currentTarget.style.color = "rgba(17,21,26,0.22)")}
      >
        esc
      </button>

      <div style={{ width: "100%", maxWidth: 640, padding: "60px 48px", position: "relative" }}>
        <AnimatePresence mode="wait">

          {/* ── Question screen ── */}
          {!isFinished ? (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Progress bar */}
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 48 }}>
                {QUESTIONS.map((_, i) => (
                  <div key={i} style={{
                    height: 1.5, flex: 1, borderRadius: 2,
                    background: i < step ? "#c47029" : i === step ? "#c47029" : "rgba(17,21,26,0.1)",
                    opacity: i < step ? 0.4 : 1,
                    transition: "background 0.4s, opacity 0.4s",
                  }} />
                ))}
                <span style={{
                  fontFamily: "var(--font-sans)", fontSize: "7.5px", fontWeight: 700,
                  letterSpacing: "0.2em", textTransform: "uppercase",
                  color: "rgba(17,21,26,0.25)", marginLeft: 10, whiteSpace: "nowrap", flexShrink: 0,
                }}>
                  {step + 1} / {QUESTIONS.length}
                </span>
              </div>

              {/* Question label */}
              <div style={{
                fontFamily: "var(--font-sans)", fontSize: "7.5px", fontWeight: 700,
                letterSpacing: "0.3em", textTransform: "uppercase",
                color: "#c47029", marginBottom: 16,
              }}>
                {QUESTIONS[step].label}
              </div>

              {/* Question text */}
              <h2 style={{
                fontFamily: "var(--font-serif)", fontStyle: "italic",
                fontSize: "1.75rem", color: "#11151a",
                lineHeight: 1.4, marginBottom: 36,
                letterSpacing: "-0.01em", fontWeight: 400,
              }}>
                {QUESTIONS[step].text}
              </h2>

              <div style={{ height: 1, background: "linear-gradient(to right, rgba(132,84,0,0.14), transparent)", marginBottom: 28 }} />

              {/* Options */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {QUESTIONS[step].options.map((opt, i) => {
                  const isChosen = chosen === i;
                  return (
                    <button
                      key={i}
                      onClick={() => handleOption(opt.score, i)}
                      style={{
                        padding: "16px 20px",
                        background: isChosen ? "rgba(196,112,41,0.06)" : "rgba(17,21,26,0.025)",
                        border: `1px solid ${isChosen ? "rgba(196,112,41,0.45)" : "rgba(17,21,26,0.09)"}`,
                        borderRadius: 3,
                        color: "#3a3530",
                        fontFamily: "var(--font-sans)", fontSize: "0.84rem",
                        lineHeight: 1.65, cursor: chosen !== null ? "default" : "pointer",
                        textAlign: "left", transition: "all 0.2s ease",
                        display: "flex", alignItems: "flex-start", gap: 14,
                      }}
                      onMouseEnter={e => {
                        if (chosen !== null) return;
                        (e.currentTarget as HTMLElement).style.background = "rgba(17,21,26,0.045)";
                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(196,112,41,0.28)";
                      }}
                      onMouseLeave={e => {
                        if (chosen !== null) return;
                        (e.currentTarget as HTMLElement).style.background = "rgba(17,21,26,0.025)";
                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(17,21,26,0.09)";
                      }}
                    >
                      {/* Radio circle */}
                      <span style={{
                        width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                        border: `1.5px solid ${isChosen ? "#c47029" : "rgba(17,21,26,0.22)"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        marginTop: 3, transition: "border-color 0.2s",
                      }}>
                        {isChosen && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#c47029" }} />}
                      </span>
                      {opt.text}
                    </button>
                  );
                })}
              </div>
            </motion.div>

          ) : (

            /* ── Result screen ── */
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Ornament */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 40 }}>
                <div style={{ height: 1, flex: 1, background: `linear-gradient(to right, transparent, ${topMeta?.accent ?? "#c47029"}44)` }} />
                <div style={{ width: 8, height: 8, borderRadius: "50%", border: `1.5px solid ${topMeta?.accent ?? "#c47029"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 3, height: 3, borderRadius: "50%", background: topMeta?.accent ?? "#c47029" }} />
                </div>
                <div style={{ height: 1, flex: 1, background: `linear-gradient(to left, transparent, ${topMeta?.accent ?? "#c47029"}44)` }} />
              </div>

              {/* Label */}
              <div style={{
                fontFamily: "var(--font-sans)", fontSize: "7.5px", fontWeight: 700,
                letterSpacing: "0.3em", textTransform: "uppercase",
                color: topMeta?.accent ?? "#c47029", marginBottom: 14,
              }}>
                Your Philosophical Home
              </div>

              {/* School name */}
              <h2 style={{
                fontFamily: "var(--font-serif)", fontStyle: "italic",
                fontSize: "2.8rem", color: "#11151a",
                lineHeight: 1.1, marginBottom: 8, fontWeight: 400, letterSpacing: "-0.02em",
              }}>
                {topMeta?.title}
              </h2>

              {/* Tagline */}
              <div style={{
                fontFamily: "var(--font-sans)", fontSize: "8px", fontWeight: 700,
                letterSpacing: "0.22em", textTransform: "uppercase",
                color: "rgba(17,21,26,0.35)", marginBottom: 28,
              }}>
                {topMeta?.tagline}
              </div>

              <div style={{ height: 1, background: "linear-gradient(to right, rgba(132,84,0,0.18), transparent)", marginBottom: 28 }} />

              {/* Description */}
              <p style={{
                fontFamily: "var(--font-sans)", fontSize: "0.84rem",
                color: "#4a4540", lineHeight: 1.85, marginBottom: 40,
              }}>
                {topMeta?.description}
              </p>

              {/* Top 3 breakdown */}
              <div style={{ marginBottom: 44 }}>
                <div style={{
                  fontFamily: "var(--font-sans)", fontSize: "7.5px", fontWeight: 700,
                  letterSpacing: "0.22em", textTransform: "uppercase",
                  color: "rgba(17,21,26,0.3)", marginBottom: 16,
                }}>
                  Affinity breakdown
                </div>
                {getSortedResults().slice(0, 4).map(([id, val], i) => {
                  const meta   = SCHOOL_META[id];
                  const pct    = Math.round((val / maxScore) * 100);
                  return (
                    <div key={id} style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
                        <span style={{
                          fontFamily: "var(--font-serif)", fontStyle: "italic",
                          fontSize: i === 0 ? "0.95rem" : "0.82rem",
                          color: i === 0 ? "#11151a" : "#6a6560",
                        }}>
                          {meta?.title ?? id}
                        </span>
                        <span style={{
                          fontFamily: "var(--font-sans)", fontSize: "7.5px",
                          color: i === 0 ? (meta?.accent ?? "#c47029") : "rgba(17,21,26,0.3)",
                          fontWeight: 700, letterSpacing: "0.1em",
                        }}>
                          {pct}%
                        </span>
                      </div>
                      <div style={{ height: 2, background: "rgba(17,21,26,0.07)", borderRadius: 2, overflow: "hidden" }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                          style={{ height: "100%", background: meta?.accent ?? "#c47029", opacity: i === 0 ? 1 : 0.35, borderRadius: 2 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* CTA */}
              <button
                onClick={() => onResult(topId)}
                style={{
                  padding: "14px 48px",
                  background: topMeta?.accent ?? "#c47029",
                  color: "#fff", border: "none", borderRadius: 100,
                  fontFamily: "var(--font-sans)", fontSize: "0.7rem",
                  fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase",
                  cursor: "pointer",
                  boxShadow: `0 6px 28px ${(topMeta?.accent ?? "#c47029")}30`,
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "scale(1.04)";
                  e.currentTarget.style.boxShadow = `0 10px 40px ${(topMeta?.accent ?? "#c47029")}45`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = `0 6px 28px ${(topMeta?.accent ?? "#c47029")}30`;
                }}
              >
                Reveal on Map
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
