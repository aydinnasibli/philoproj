"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
  id: number;
  text: string;
  options: {
    text: string;
    score: Record<string, number>;
  }[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "How do you believe we primarily acquire knowledge about the world?",
    options: [
      {
        text: "Through pure reason and mathematical deduction.",
        score: { "school-rationalism": 3, "school-platonism": 2, "school-socratic-method": 1 },
      },
      {
        text: "Through sensory experience and empirical observation.",
        score: { "school-empiricism": 3, "school-critical-philosophy": 2, "school-aristotelianism": 1 },
      },
    ],
  },
  {
    id: 2,
    text: "What defines the essence of a meaningful life?",
    options: [
      {
        text: "Aligning one's will with the universal order of nature.",
        score: { "school-stoicism": 3, "school-neoplatonism": 2, "school-scholasticism": 1 },
      },
      {
        text: "Creating one's own meaning in an indifferent universe.",
        score: { "school-existentialism": 3, "school-analytic-philosophy": 2, "school-critical-philosophy": 1 },
      },
    ],
  },
  {
    id: 3,
    text: "Should society be guided by abstract ideals or pragmatic results?",
    options: [
      {
        text: "By immutable ideals and the pursuit of the Good.",
        score: { "school-platonism": 3, "school-socratic-method": 2, "school-rationalism": 1 },
      },
      {
        text: "By observable outcomes and practical flourishing.",
        score: { "school-aristotelianism": 3, "school-empiricism": 2, "school-analytic-philosophy": 1 },
      },
    ],
  },
];

interface Props {
  onClose: () => void;
  onResult: (schoolId: string) => void;
}

export default function QuizOverlay({ onClose, onResult }: Props) {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [chosen, setChosen] = useState<number | null>(null);

  const handleOption = (score: Record<string, number>, idx: number) => {
    if (chosen !== null) return;
    setChosen(idx);
    const newScores = { ...scores };
    Object.entries(score).forEach(([id, val]) => {
      newScores[id] = (newScores[id] || 0) + val;
    });
    setScores(newScores);
    setTimeout(() => {
      setChosen(null);
      if (step < QUESTIONS.length - 1) {
        setStep(step + 1);
      } else {
        setIsFinished(true);
      }
    }, 380);
  };

  const getResult = () =>
    Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] || "school-socratic-method";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(248,245,240,0.97)",
        backdropFilter: "blur(32px)", WebkitBackdropFilter: "blur(32px)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
      onMouseDown={e => e.stopPropagation()}
      onWheel={e => e.stopPropagation()}
    >
      {/* Subtle texture lines */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 47px, rgba(132,84,0,0.025) 48px)",
      }} />

      {/* Close */}
      <button
        onClick={onClose}
        style={{
          position: "absolute", top: 32, right: 36,
          background: "none", border: "none",
          color: "rgba(17,21,26,0.2)", fontSize: "0.72rem",
          cursor: "pointer", fontFamily: "var(--font-sans)",
          letterSpacing: "0.12em", textTransform: "uppercase",
          padding: "6px 10px", transition: "color 0.2s",
        }}
        onMouseEnter={e => (e.currentTarget.style.color = "rgba(17,21,26,0.55)")}
        onMouseLeave={e => (e.currentTarget.style.color = "rgba(17,21,26,0.2)")}
      >
        esc
      </button>

      <div style={{ width: "100%", maxWidth: 600, padding: "0 40px", position: "relative" }}>
        <AnimatePresence mode="wait">
          {!isFinished ? (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Progress */}
              <div style={{
                display: "flex", alignItems: "center", gap: 6, marginBottom: 44,
              }}>
                {QUESTIONS.map((_, i) => (
                  <div
                    key={i}
                    style={{
                      height: 1.5, flex: 1, borderRadius: 2,
                      background: i <= step ? "#c47029" : "rgba(17,21,26,0.1)",
                      transition: "background 0.4s",
                    }}
                  />
                ))}
                <span style={{
                  fontFamily: "var(--font-sans)", fontSize: "8px", fontWeight: 700,
                  letterSpacing: "0.2em", textTransform: "uppercase",
                  color: "rgba(17,21,26,0.25)", marginLeft: 8, whiteSpace: "nowrap",
                }}>
                  {step + 1} / {QUESTIONS.length}
                </span>
              </div>

              {/* Label */}
              <div style={{
                fontFamily: "var(--font-sans)", fontSize: "8px", fontWeight: 700,
                letterSpacing: "0.32em", textTransform: "uppercase",
                color: "#c47029", marginBottom: 20,
              }}>
                Find Your School
              </div>

              {/* Question */}
              <h2 style={{
                fontFamily: "var(--font-serif)", fontStyle: "italic",
                fontSize: "1.85rem", color: "#11151a",
                lineHeight: 1.35, marginBottom: 40,
                letterSpacing: "-0.01em", fontWeight: 400,
              }}>
                {QUESTIONS[step].text}
              </h2>

              {/* Divider */}
              <div style={{
                height: 1,
                background: "linear-gradient(to right, rgba(132,84,0,0.15), transparent)",
                marginBottom: 28,
              }} />

              {/* Options */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {QUESTIONS[step].options.map((opt, i) => {
                  const isChosen = chosen === i;
                  return (
                    <button
                      key={i}
                      onClick={() => handleOption(opt.score, i)}
                      style={{
                        padding: "18px 22px",
                        background: isChosen ? "rgba(196,112,41,0.07)" : "rgba(17,21,26,0.02)",
                        border: `1px solid ${isChosen ? "rgba(196,112,41,0.4)" : "rgba(17,21,26,0.1)"}`,
                        borderRadius: 4,
                        color: isChosen ? "#11151a" : "#43474c",
                        fontFamily: "var(--font-sans)", fontSize: "0.88rem",
                        lineHeight: 1.55,
                        cursor: chosen !== null ? "default" : "pointer",
                        textAlign: "left",
                        transition: "all 0.22s ease",
                        display: "flex", alignItems: "flex-start", gap: 14,
                      }}
                      onMouseEnter={e => {
                        if (chosen !== null) return;
                        e.currentTarget.style.background = "rgba(17,21,26,0.04)";
                        e.currentTarget.style.borderColor = "rgba(196,112,41,0.3)";
                        e.currentTarget.style.color = "#11151a";
                      }}
                      onMouseLeave={e => {
                        if (chosen !== null) return;
                        e.currentTarget.style.background = "rgba(17,21,26,0.02)";
                        e.currentTarget.style.borderColor = "rgba(17,21,26,0.1)";
                        e.currentTarget.style.color = "#43474c";
                      }}
                    >
                      <span style={{
                        width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                        border: `1.5px solid ${isChosen ? "#c47029" : "rgba(17,21,26,0.2)"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        marginTop: 2, transition: "border-color 0.22s",
                      }}>
                        {isChosen && (
                          <span style={{
                            width: 7, height: 7, borderRadius: "50%",
                            background: "#c47029", display: "block",
                          }} />
                        )}
                      </span>
                      {opt.text}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{ textAlign: "center" }}
            >
              {/* Ornament */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 36 }}>
                <div style={{ height: 1, width: 60, background: "linear-gradient(to left, rgba(132,84,0,0.3), transparent)" }} />
                <div style={{
                  width: 10, height: 10, borderRadius: "50%",
                  border: "1.5px solid #c47029",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <div style={{ width: 3, height: 3, borderRadius: "50%", background: "#c47029" }} />
                </div>
                <div style={{ height: 1, width: 60, background: "linear-gradient(to right, rgba(132,84,0,0.3), transparent)" }} />
              </div>

              <div style={{
                fontFamily: "var(--font-sans)", fontSize: "8px", fontWeight: 700,
                letterSpacing: "0.32em", textTransform: "uppercase",
                color: "#c47029", marginBottom: 20,
              }}>
                Your Philosophical Home
              </div>
              <h2 style={{
                fontFamily: "var(--font-serif)", fontStyle: "italic",
                fontSize: "2.6rem", color: "#11151a",
                lineHeight: 1.2, marginBottom: 16, fontWeight: 400,
              }}>
                The analysis is complete.
              </h2>
              <p style={{
                fontFamily: "var(--font-sans)", fontSize: "0.82rem",
                color: "#5F6A78", marginBottom: 48,
                lineHeight: 1.75, maxWidth: 380, margin: "0 auto 48px",
              }}>
                Your patterns of thought align most closely with a distinct intellectual tradition.
                Discover it on the map.
              </p>

              <div style={{ height: 1, background: "rgba(17,21,26,0.06)", maxWidth: 200, margin: "0 auto 40px" }} />

              <button
                onClick={() => onResult(getResult())}
                style={{
                  padding: "14px 44px",
                  background: "#c47029",
                  color: "#fff",
                  border: "none",
                  borderRadius: 100,
                  fontFamily: "var(--font-sans)", fontSize: "0.72rem",
                  fontWeight: 700, letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  boxShadow: "0 6px 24px rgba(196,112,41,0.22)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "scale(1.04)";
                  e.currentTarget.style.boxShadow = "0 10px 36px rgba(196,112,41,0.32)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "0 6px 24px rgba(196,112,41,0.22)";
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
