"use client";

import { useRef } from "react";
import type { PhilosopherListItem } from "@/lib/types";
import DirectoryRow from "./DirectoryRow";

type Props = { philosophers: PhilosopherListItem[] };

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function DirectoryList({ philosophers }: Props) {
  const letterRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Group philosophers by first letter
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
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  if (philosophers.length === 0) {
    return (
      <div style={{ padding: "4rem 2.5rem", color: "var(--ink-muted)", fontFamily: "var(--font-serif)", fontStyle: "italic" }}>
        No philosophers found. Run <code>npm run seed</code>.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", position: "relative" }}>
      {/* Main directory */}
      <div style={{ flex: 1, paddingRight: "60px" }}>
        {/* Header stats */}
        <div
          style={{
            padding: "2rem 2.5rem 1.25rem",
            borderBottom: "2px solid var(--ink)",
            display: "flex",
            alignItems: "baseline",
            gap: "16px",
          }}
        >
          <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "2.5rem", fontWeight: 400, lineHeight: 1 }}>
            {philosophers.length}
          </span>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--ink-muted)", fontWeight: 600 }}>
            Thinkers
          </span>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "11px", color: "var(--border)", margin: "0 4px" }}>·</span>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--ink-muted)", fontWeight: 600 }}>
            {presentLetters.length} Letters
          </span>
        </div>

        {/* Column headers */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 200px 200px",
            padding: "8px 2.5rem",
            borderBottom: "1px solid var(--border)",
            backgroundColor: "var(--canvas-warm)",
          }}
        >
          {["Name", "Era", "Branch"].map((h) => (
            <span
              key={h}
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "var(--ink-muted)",
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
            {/* Sticky letter header — editorial chapter marker */}
            <div
              style={{
                position: "sticky",
                top: "0",
                zIndex: 10,
                padding: "0 2.5rem",
                backgroundColor: "var(--canvas-warm)",
                borderBottom: "1px solid var(--border)",
                borderTop: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                overflow: "hidden",
                height: "56px",
              }}
            >
              {/* Ghost large letter backdrop */}
              <span
                aria-hidden="true"
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "5rem",
                  fontWeight: 700,
                  color: "var(--ink)",
                  opacity: 0.06,
                  lineHeight: 1,
                  letterSpacing: "-0.04em",
                  userSelect: "none",
                  flexShrink: 0,
                  marginTop: "4px",
                }}
              >
                {letter}
              </span>
              {/* Visible small label */}
              <span
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "1.1rem",
                  fontStyle: "italic",
                  color: "var(--accent)",
                  fontWeight: 400,
                }}
              >
                {letter}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "10px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--ink-muted)",
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

      {/* Sticky A-Z index */}
      <div
        style={{
          position: "sticky",
          top: "64px",
          height: "calc(100vh - 64px)",
          width: "48px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "2px",
          borderLeft: "1px solid var(--border)",
          flexShrink: 0,
          backgroundColor: "var(--canvas)",
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
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.05em",
                color: hasPhilosophers ? "var(--ink)" : "var(--border)",
                background: "none",
                border: "none",
                cursor: hasPhilosophers ? "pointer" : "default",
                padding: "2px 0",
                width: "28px",
                textAlign: "center",
                transition: "color 0.15s",
                lineHeight: 1.3,
              }}
              onMouseEnter={(e) => {
                if (hasPhilosophers) {
                  (e.currentTarget as HTMLElement).style.color = "var(--accent)";
                }
              }}
              onMouseLeave={(e) => {
                if (hasPhilosophers) {
                  (e.currentTarget as HTMLElement).style.color = "var(--ink)";
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
