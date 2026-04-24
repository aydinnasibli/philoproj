"use client";

import { useRef } from "react";
import type { PhilosopherListItem } from "@/lib/mockData";
import DirectoryRow from "./DirectoryRow";

type Props = { philosophers: PhilosopherListItem[] };

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function DirectoryList({ philosophers }: Props) {
  const letterRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const grouped = philosophers.reduce<Record<string, PhilosopherListItem[]>>(
    (acc, p) => {
      const letter = p.name[0].toUpperCase();
      if (!acc[letter]) acc[letter] = [];
      acc[letter].push(p);
      return acc;
    },
    {}
  );

  const presentLetters = Object.keys(grouped).sort();

  function scrollToLetter(letter: string) {
    const el = letterRefs.current[letter];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (philosophers.length === 0) {
    return (
      <div style={{ padding: "4rem 2.5rem", color: "var(--ink-muted)", fontFamily: "var(--font-serif)", fontStyle: "italic" }}>
        No philosophers found. Run <code>npm run seed</code>.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", position: "relative", paddingTop: "68px" }}>
      {/* Main directory */}
      <div style={{ flex: 1, paddingRight: "52px" }}>
        {/* Header stats */}
        <div
          style={{
            padding: "2rem 2.5rem 1.5rem",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "baseline",
            gap: "20px",
            background: "linear-gradient(180deg, var(--surface) 0%, transparent 100%)",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
            <span style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontSize: "3rem",
              fontWeight: 400,
              lineHeight: 1,
              color: "var(--ink)",
              letterSpacing: "-0.03em",
            }}>
              {philosophers.length}
            </span>
            <span style={{
              fontFamily: "var(--font-sans)",
              fontSize: "10px",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--ink-muted)",
              fontWeight: 600,
            }}>
              Thinkers
            </span>
          </div>
          <div
            style={{
              width: "1px",
              height: "20px",
              background: "var(--border)",
            }}
          />
          <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
            <span style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontSize: "3rem",
              fontWeight: 400,
              lineHeight: 1,
              color: "var(--ink)",
              letterSpacing: "-0.03em",
            }}>
              {presentLetters.length}
            </span>
            <span style={{
              fontFamily: "var(--font-sans)",
              fontSize: "10px",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--ink-muted)",
              fontWeight: 600,
            }}>
              Letters
            </span>
          </div>
        </div>

        {/* Column headers */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 200px 200px",
            padding: "7px 2.5rem",
            borderBottom: "1px solid var(--border-pale)",
            backgroundColor: "var(--canvas-warm)",
          }}
        >
          {["Name", "Era", "Branch"].map((h) => (
            <span
              key={h}
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "9.5px",
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--ink-faint)",
              }}
            >
              {h}
            </span>
          ))}
        </div>

        {/* Letter groups */}
        {presentLetters.map((letter) => (
          <div
            key={letter}
            ref={(el) => { letterRefs.current[letter] = el; }}
          >
            {/* Sticky letter header */}
            <div
              style={{
                position: "sticky",
                top: "60px",
                zIndex: 10,
                padding: "0 2.5rem",
                background: "rgba(12, 14, 21, 0.92)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                borderBottom: "1px solid var(--border-pale)",
                borderTop: "1px solid var(--border-pale)",
                display: "flex",
                alignItems: "center",
                gap: "1.25rem",
                overflow: "hidden",
                height: "52px",
              }}
            >
              {/* Ghost large letter */}
              <span
                aria-hidden="true"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "4.5rem",
                  fontWeight: 700,
                  fontStyle: "italic",
                  color: "var(--accent)",
                  opacity: 0.06,
                  lineHeight: 1,
                  letterSpacing: "-0.04em",
                  userSelect: "none",
                  flexShrink: 0,
                  marginTop: "6px",
                }}
              >
                {letter}
              </span>
              {/* Visible label */}
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.05rem",
                  fontStyle: "italic",
                  color: "var(--accent)",
                  fontWeight: 500,
                  lineHeight: 1,
                }}
              >
                {letter}
              </span>
              <div style={{ width: "16px", height: "1px", background: "var(--border)" }} />
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "9.5px",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--ink-faint)",
                  fontWeight: 600,
                }}
              >
                {grouped[letter].length} {grouped[letter].length === 1 ? "thinker" : "thinkers"}
              </span>
            </div>

            {grouped[letter].map((p) => (
              <DirectoryRow key={p._id} philosopher={p} />
            ))}
          </div>
        ))}
      </div>

      {/* Sticky A-Z sidebar */}
      <div
        style={{
          position: "sticky",
          top: "60px",
          height: "calc(100vh - 60px)",
          width: "44px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1px",
          borderLeft: "1px solid var(--border-pale)",
          flexShrink: 0,
          backgroundColor: "var(--canvas-warm)",
          overflowY: "auto",
          padding: "8px 0",
        }}
      >
        {ALPHABET.map((letter) => {
          const hasPhilosophers = !!grouped[letter];
          return (
            <button
              key={letter}
              onClick={() => hasPhilosophers && scrollToLetter(letter)}
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "9.5px",
                fontWeight: 600,
                letterSpacing: "0.05em",
                color: hasPhilosophers ? "var(--ink-muted)" : "var(--ink-faint)",
                background: "none",
                border: "none",
                cursor: hasPhilosophers ? "pointer" : "default",
                padding: "2px 0",
                width: "28px",
                textAlign: "center",
                transition: "color 0.15s",
                lineHeight: 1.4,
                opacity: hasPhilosophers ? 1 : 0.3,
              }}
              onMouseEnter={(e) => {
                if (hasPhilosophers) {
                  (e.currentTarget as HTMLElement).style.color = "var(--accent)";
                }
              }}
              onMouseLeave={(e) => {
                if (hasPhilosophers) {
                  (e.currentTarget as HTMLElement).style.color = "var(--ink-muted)";
                }
              }}
            >
              {letter}
            </button>
          );
        })}
      </div>
    </div>
  );
}
