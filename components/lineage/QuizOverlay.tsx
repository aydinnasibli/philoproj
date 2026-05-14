"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Option { text: string; score: Record<string, number>; }
interface Question { id: number; label: string; text: string; options: Option[]; }

const SCHOOL_META: Record<string, { title: string; tagline: string; description: string; accent: string }> = {
  "school-socratic-method": { title: "The Socratic Method", tagline: "Dialectic & Examination", description: "You are a relentless questioner. Where others accept received wisdom, you probe assumptions through dialogue. Truth, for you, is not handed down — it is drawn out through rigorous cross-examination, and the unexamined life is simply not worth living.", accent: "#C47029" },
  "school-platonism": { title: "Platonism", tagline: "The Realm of Forms", description: "You believe reality lies beyond appearances. The flickering world of the senses is a pale shadow of an eternal realm of perfect Forms — the true objects of knowledge. Philosophy is the soul's ascent from illusion toward the blinding clarity of genuine being.", accent: "#C47029" },
  "school-aristotelianism": { title: "Aristotelianism", tagline: "Logic & Virtue", description: "You are a systematic thinker grounded in the observable world. Where Plato transcends experience, you interrogate it. Logic, virtue, and flourishing — eudaimonia — are achieved not through retreat from life but through disciplined engagement with it.", accent: "#C47029" },
  "school-stoicism": { title: "Stoicism", tagline: "Reason & Equanimity", description: "You seek serenity through alignment with rational nature. Externals — wealth, reputation, even death — are neither good nor bad. What matters is the quality of your will. Virtue is the only true good, and wisdom consists in controlling what is within your power.", accent: "#8B6229" },
  "school-neoplatonism": { title: "Neoplatonism", tagline: "Emanation & The One", description: "You sense that all things flow from a single, ineffable source — the One — and that the soul's highest purpose is to return to that unity. Philosophy, for you, is not merely argument but a spiritual ascent toward mystical union with the ground of all being.", accent: "#8B6229" },
  "school-scholasticism": { title: "Scholasticism", tagline: "Faith & Reason", description: "You hold that reason and revelation illuminate the same truth from different angles. The great tradition of Aristotle, harmonised with Christian theology, offers a comprehensive architecture of knowledge — from natural science to divine mystery.", accent: "#6B7A47" },
  "school-rationalism": { title: "Rationalism", tagline: "Reason Supreme", description: "You believe that the most certain truths are known not through the senses but through pure reason. Innate ideas, mathematical necessity, and the power of deduction are your instruments. The mind, properly used, can unlock the structure of reality itself.", accent: "#8B6914" },
  "school-empiricism": { title: "Empiricism", tagline: "Sensation & Proof", description: "You trust experience above all. The mind begins as a blank slate, and knowledge is built from the bottom up — through sensation, reflection, and careful induction. Claims that outrun observation are suspect; the laboratory and the senses are the final court of appeal.", accent: "#8B6914" },
  "school-critical-philosophy": { title: "Critical Philosophy", tagline: "Mind's Frontier", description: "You believe knowledge is the joint product of sensation and the mind's own structuring activity. There are things we can know — and a hard boundary beyond which pure reason overreaches. Ethics demands acting on principles you could will to be universal law.", accent: "#5A6999" },
  "school-german-idealism": { title: "German Idealism", tagline: "Spirit & Dialectic", description: "You see history as the unfolding of Spirit coming to know itself through contradiction and synthesis. Reality is not a fixed thing but a dynamic process — and freedom, fully realised, is not the absence of constraint but rational self-determination within a living whole.", accent: "#5A6999" },
  "school-existentialism": { title: "Existentialism", tagline: "Being & Void", description: "You begin with the raw fact of existence — thrown into a world without given meaning — and insist that this is not a tragedy but a summons. Existence precedes essence: you are what you choose. Authenticity, anguish, and radical freedom define the human condition.", accent: "#7A5C6E" },
  "school-analytic-philosophy": { title: "Analytic Philosophy", tagline: "Language as Limit", description: "You believe that most philosophical problems are, at bottom, problems of language and logic. Clarity is the cardinal virtue; confusion the cardinal sin. Through rigorous analysis of concepts and arguments, you aim to dissolve metaphysical puzzles rather than merely live with them.", accent: "#4A5568" },
};

const QUESTIONS: Question[] = [
  { id: 1, label: "On Knowledge", text: "How do you believe we most reliably come to know the world?", options: [{ text: "Through pure reason — the mind contains innate structures that reveal necessary truths independently of experience.", score: { "school-rationalism": 3, "school-platonism": 2, "school-critical-philosophy": 1 } }, { text: "Through sensory experience — knowledge is built from observation, experiment, and careful induction.", score: { "school-empiricism": 3, "school-aristotelianism": 2, "school-analytic-philosophy": 1 } }, { text: "Through dialectical questioning — genuine knowledge emerges only when assumptions are rigorously tested in dialogue.", score: { "school-socratic-method": 3, "school-critical-philosophy": 1, "school-existentialism": 1 } }, { text: "Through both faith and reason working together — revelation completes what natural inquiry cannot reach alone.", score: { "school-scholasticism": 3, "school-neoplatonism": 2, "school-rationalism": 1 } }] },
  { id: 2, label: "On Reality", text: "What is the deepest nature of the world we inhabit?", options: [{ text: "An eternal realm of perfect, unchanging Forms — the physical world is merely their imperfect reflection.", score: { "school-platonism": 3, "school-neoplatonism": 2, "school-rationalism": 1 } }, { text: "The material world itself — real, lawful, and knowable through observation and logical analysis.", score: { "school-aristotelianism": 3, "school-empiricism": 2, "school-analytic-philosophy": 2 } }, { text: "Mind or Spirit — matter is a manifestation of rational consciousness unfolding through history.", score: { "school-german-idealism": 3, "school-neoplatonism": 2, "school-critical-philosophy": 1 } }, { text: "A rational, unified substance — God and Nature are ultimately one and the same infinite reality.", score: { "school-rationalism": 3, "school-scholasticism": 2, "school-neoplatonism": 1 } }] },
  { id: 3, label: "On the Self", text: "What are you, at your most fundamental level?", options: [{ text: "A rational soul temporarily housed in a body, whose true home is the realm of eternal truth.", score: { "school-platonism": 3, "school-neoplatonism": 2, "school-scholasticism": 1 } }, { text: "A being defined entirely by your choices — you have no fixed nature prior to the life you live.", score: { "school-existentialism": 3, "school-socratic-method": 1, "school-critical-philosophy": 1 } }, { text: "A social and rational animal, whose flourishing depends on community, virtue, and purposive activity.", score: { "school-aristotelianism": 3, "school-stoicism": 2, "school-scholasticism": 1 } }, { text: "A thinking subject whose mind actively structures the experience it receives from the senses.", score: { "school-critical-philosophy": 3, "school-rationalism": 2, "school-german-idealism": 1 } }] },
  { id: 4, label: "On Ethics", text: "What is the proper foundation of moral life?", options: [{ text: "Virtue — a stable character forged through habit and reason, oriented toward genuine human flourishing.", score: { "school-aristotelianism": 3, "school-stoicism": 2, "school-socratic-method": 1 } }, { text: "Duty — act only on principles you could consistently will every rational being to follow.", score: { "school-critical-philosophy": 3, "school-rationalism": 2, "school-scholasticism": 1 } }, { text: "Authenticity — the honest confrontation with your freedom and responsibility in a world without given values.", score: { "school-existentialism": 3, "school-socratic-method": 1, "school-analytic-philosophy": 1 } }, { text: "Natural order — living in accordance with reason and the rational structure of the cosmos.", score: { "school-stoicism": 3, "school-neoplatonism": 2, "school-aristotelianism": 1 } }] },
  { id: 5, label: "On Language", text: "What is the relationship between language and philosophical truth?", options: [{ text: "The limits of my language are the limits of my world — philosophy's task is the clarification of what can be said.", score: { "school-analytic-philosophy": 3, "school-critical-philosophy": 2, "school-empiricism": 1 } }, { text: "The highest truths lie beyond what language can capture — they must be approached through contemplation.", score: { "school-neoplatonism": 3, "school-german-idealism": 2, "school-platonism": 1 } }, { text: "Language is a tool for dialogue — truth emerges through the back-and-forth of question and answer.", score: { "school-socratic-method": 3, "school-aristotelianism": 1, "school-existentialism": 1 } }, { text: "Concepts are structured by the mind — language reflects the categories through which reason organises experience.", score: { "school-critical-philosophy": 3, "school-rationalism": 2, "school-german-idealism": 1 } }] },
  { id: 6, label: "On Transcendence", text: "How do you conceive of the divine or ultimate ground of existence?", options: [{ text: "As an infinite, perfect Being whose existence can be approached through reason and natural theology.", score: { "school-scholasticism": 3, "school-rationalism": 2, "school-neoplatonism": 1 } }, { text: "As the One — ineffable, beyond being itself, from which all things emanate and toward which the soul yearns.", score: { "school-neoplatonism": 3, "school-platonism": 2, "school-german-idealism": 1 } }, { text: "As the Absolute — the totality of Spirit realising itself through the rational unfolding of history.", score: { "school-german-idealism": 3, "school-neoplatonism": 1, "school-scholasticism": 1 } }, { text: "As a question requiring conceptual clarification before it can even be meaningfully addressed.", score: { "school-analytic-philosophy": 3, "school-critical-philosophy": 2, "school-empiricism": 1 } }] },
  { id: 7, label: "On History", text: "How do you understand the movement of human history?", options: [{ text: "As the progressive unfolding of Spirit through contradiction — each era negating and preserving the last.", score: { "school-german-idealism": 3, "school-critical-philosophy": 1, "school-scholasticism": 1 } }, { text: "As essentially static at its core — human nature and the conditions of the good life are fixed across time.", score: { "school-stoicism": 3, "school-aristotelianism": 2, "school-platonism": 1 } }, { text: "As a succession of epochs, each requiring a new confrontation with freedom and the absence of fixed meaning.", score: { "school-existentialism": 3, "school-german-idealism": 1, "school-socratic-method": 1 } }, { text: "As the accumulation of knowledge — gradual, correctable, and oriented toward a clearer picture of reality.", score: { "school-empiricism": 3, "school-analytic-philosophy": 2, "school-rationalism": 1 } }] },
  { id: 8, label: "On Politics", text: "What is the legitimate basis for political authority?", options: [{ text: "Knowledge of the Good — the ideal state should be governed by those with genuine philosophical wisdom.", score: { "school-platonism": 3, "school-rationalism": 2, "school-scholasticism": 1 } }, { text: "Human flourishing — good governance cultivates the conditions in which citizens can live well and develop virtue.", score: { "school-aristotelianism": 3, "school-stoicism": 2, "school-scholasticism": 1 } }, { text: "Rational consent and individual liberty — authority is legitimate only when grounded in free agreement.", score: { "school-empiricism": 3, "school-critical-philosophy": 2, "school-existentialism": 1 } }, { text: "Ethical rationality — a state is legitimate insofar as it embodies the freedom of rational self-determination.", score: { "school-german-idealism": 3, "school-critical-philosophy": 2, "school-rationalism": 1 } }] },
  { id: 9, label: "On the Examined Life", text: "What does it mean to live philosophically?", options: [{ text: "To question ceaselessly — most especially one's own convictions — and to follow the argument wherever it leads.", score: { "school-socratic-method": 3, "school-analytic-philosophy": 2, "school-existentialism": 1 } }, { text: "To cultivate inner freedom — to remain undisturbed by fortune by mastering what is truly within one's power.", score: { "school-stoicism": 3, "school-neoplatonism": 2, "school-scholasticism": 1 } }, { text: "To investigate the world with patient, systematic curiosity — building knowledge from evidence and careful logic.", score: { "school-aristotelianism": 3, "school-empiricism": 2, "school-analytic-philosophy": 1 } }, { text: "To ascend — whether toward the Forms, the One, or Absolute Spirit — through contemplative or dialectical effort.", score: { "school-neoplatonism": 3, "school-platonism": 2, "school-german-idealism": 2 } }] },
  { id: 10, label: "On the Central Problem", text: "Which philosophical question strikes you as the most urgent and inescapable?", options: [{ text: "How can finite minds attain certainty — and where exactly does genuine knowledge end and illusion begin?", score: { "school-critical-philosophy": 3, "school-rationalism": 2, "school-empiricism": 2 } }, { text: "What does it truly mean to exist — to be thrown into a world, condemned to be free, without prior essence?", score: { "school-existentialism": 3, "school-socratic-method": 2, "school-critical-philosophy": 1 } }, { text: "What is the logical structure underlying language, thought, and our claims about the world?", score: { "school-analytic-philosophy": 3, "school-critical-philosophy": 2, "school-rationalism": 1 } }, { text: "How does multiplicity arise from unity — and how can the soul return to the source from which it emanated?", score: { "school-neoplatonism": 3, "school-german-idealism": 2, "school-platonism": 2 } }] },
];

interface Props { onClose: () => void; onResult: (schoolId: string) => void; }

export default function QuizOverlay({ onClose, onResult }: Props) {
  const [step, setStep]             = useState(0);
  const [scores, setScores]         = useState<Record<string, number>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [chosen, setChosen]         = useState<number | null>(null);

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

  const getSortedResults = () => Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const topId    = getSortedResults()[0]?.[0] || "school-socratic-method";
  const topMeta  = SCHOOL_META[topId];
  const maxScore = getSortedResults()[0]?.[1] || 1;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[rgba(249,246,240,0.98)] backdrop-blur-[32px]"
      onPointerDown={e => e.stopPropagation()}
      onWheel={e => e.stopPropagation()}
    >
      {/* Ruled lines texture */}
      <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,transparent,transparent_47px,rgba(132,84,0,0.022)_48px)]" />

      {/* Close */}
      <button
        onClick={onClose}
        className="fixed top-8 right-9 bg-transparent border-none font-sans text-[0.7rem] tracking-[0.14em] uppercase cursor-pointer px-[10px] py-[6px] transition-colors duration-200 text-[rgba(17,21,26,0.22)] hover:text-[rgba(17,21,26,0.6)]"
      >
        esc
      </button>

      <div className="w-full max-w-[640px] px-12 py-[60px] relative">
        <AnimatePresence mode="wait">

          {/* ── Question screen ── */}
          {!isFinished ? (
            <motion.div key={step} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }} transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}>
              {/* Progress bar */}
              <div className="flex items-center gap-1 mb-12">
                {QUESTIONS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-[1.5px] flex-1 rounded-sm transition-[background,opacity] duration-400 ${i <= step ? "bg-[#c47029]" : "bg-[rgba(17,21,26,0.1)]"} ${i < step ? "opacity-40" : "opacity-100"}`}
                  />
                ))}
                <span className="font-sans text-[7.5px] font-bold tracking-[0.2em] uppercase text-[rgba(17,21,26,0.25)] ml-[10px] whitespace-nowrap shrink-0">
                  {step + 1} / {QUESTIONS.length}
                </span>
              </div>

              <div className="font-sans text-[7.5px] font-bold tracking-[0.3em] uppercase text-[#c47029] mb-4">
                {QUESTIONS[step].label}
              </div>
              <h2 className="font-serif italic text-[1.75rem] text-[#11151a] leading-[1.4] mb-9 tracking-[-0.01em] font-normal">
                {QUESTIONS[step].text}
              </h2>
              <div className="h-px bg-[linear-gradient(to_right,rgba(132,84,0,0.14),transparent)] mb-7" />

              <div className="flex flex-col gap-[10px]">
                {QUESTIONS[step].options.map((opt, i) => {
                  const isChosen = chosen === i;
                  return (
                    <button
                      key={i}
                      onClick={() => handleOption(opt.score, i)}
                      className={`px-5 py-4 rounded-[3px] text-[#3a3530] font-sans text-[0.84rem] leading-[1.65] text-left transition-all duration-200 flex items-start gap-[14px] border ${isChosen ? "bg-[rgba(196,112,41,0.06)] border-[rgba(196,112,41,0.45)]" : "bg-[rgba(17,21,26,0.025)] border-[rgba(17,21,26,0.09)]"} ${chosen === null ? "cursor-pointer hover:bg-[rgba(17,21,26,0.045)] hover:border-[rgba(196,112,41,0.28)]" : "cursor-default"}`}
                    >
                      <span
                        className={`w-[18px] h-[18px] rounded-full shrink-0 flex items-center justify-center mt-[3px] transition-[border-color] duration-200 border-[1.5px] ${isChosen ? "border-[#c47029]" : "border-[rgba(17,21,26,0.22)]"}`}
                      >
                        {isChosen && <span className="w-[6px] h-[6px] rounded-full bg-[#c47029]" />}
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
              data-school={topId}
              initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center gap-[14px] mb-10">
                <div className="h-px flex-1 bg-[linear-gradient(to_right,transparent,var(--a-44))]" />
                <div className="w-2 h-2 rounded-full flex items-center justify-center border-[1.5px] border-(--ac)">
                  <div className="w-[3px] h-[3px] rounded-full bg-(--ac)" />
                </div>
                <div className="h-px flex-1 bg-[linear-gradient(to_left,transparent,var(--a-44))]" />
              </div>

              <div className="font-sans text-[7.5px] font-bold tracking-[0.3em] uppercase text-(--ac) mb-[14px]">Your Philosophical Home</div>
              <h2 className="font-serif italic text-[2.8rem] text-[#11151a] leading-[1.1] mb-2 font-normal tracking-[-0.02em]">{topMeta?.title}</h2>
              <div className="font-sans text-[8px] font-bold tracking-[0.22em] uppercase text-[rgba(17,21,26,0.35)] mb-7">{topMeta?.tagline}</div>
              <div className="h-px bg-[linear-gradient(to_right,rgba(132,84,0,0.18),transparent)] mb-7" />
              <p className="font-sans text-[0.84rem] text-[#4a4540] leading-[1.85] mb-10">{topMeta?.description}</p>

              <div className="mb-11">
                <div className="font-sans text-[7.5px] font-bold tracking-[0.22em] uppercase text-[rgba(17,21,26,0.3)] mb-4">Affinity breakdown</div>
                {getSortedResults().slice(0, 4).map(([id, val], i) => {
                  const meta = SCHOOL_META[id];
                  const pct  = Math.round((val / maxScore) * 100);
                  return (
                    <div key={id} data-school={id} className="mb-3">
                      <div className="flex justify-between items-baseline mb-[5px]">
                        <span className={`font-serif italic ${i === 0 ? "text-[0.95rem] text-[#11151a]" : "text-[0.82rem] text-[#6a6560]"}`}>
                          {meta?.title ?? id}
                        </span>
                        <span className={`font-sans text-[7.5px] font-bold tracking-widest ${i === 0 ? "text-(--ac)" : "text-[rgba(17,21,26,0.3)]"}`}>
                          {pct}%
                        </span>
                      </div>
                      <div className="h-[2px] bg-[rgba(17,21,26,0.07)] rounded-sm overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                          className={`h-full rounded-sm bg-(--ac) ${i === 0 ? "opacity-100" : "opacity-35"}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => onResult(topId)}
                className="px-12 py-[14px] text-white border-none rounded-full font-sans text-[0.7rem] font-bold tracking-[0.22em] uppercase cursor-pointer bg-(--ac) shadow-[0_6px_28px_var(--a-30)] transition-[transform,box-shadow] duration-200 hover:scale-[1.04] hover:shadow-[0_10px_40px_var(--a-44)]"
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
