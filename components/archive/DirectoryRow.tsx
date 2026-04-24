"use client";

import Link from "next/link";
import { useState } from "react";
import type { PhilosopherListItem } from "@/lib/mockData";

const ERA_DOT: Record<string, string> = {
  "era-1": "#D7AA32",
  "era-2": "#D7AA32",
  "era-3": "#C36437",
  "era-4": "#5A69AF",
};

const ERA_GLOW: Record<string, string> = {
  "era-1": "rgba(215,170,50,0.35)",
  "era-2": "rgba(215,170,50,0.35)",
  "era-3": "rgba(195,100,55,0.35)",
  "era-4": "rgba(90,105,175,0.35)",
};

function formatYears(birth?: number, death?: number) {
  if (!birth && !death) return "";
  const b = birth ? (birth < 0 ? `${Math.abs(birth)} BC` : `${birth} AD`) : "?";
  const d = death ? (death < 0 ? `${Math.abs(death)} BC` : `${death} AD`) : "?";
  return `${b} — ${d}`;
}

export default function DirectoryRow({ philosopher }: { philosopher: PhilosopherListItem }) {
  const [hovered, setHovered] = useState(false);
  const dotColour = ERA_DOT[philosopher.eraId] ?? "var(--accent)";
  const dotGlow   = ERA_GLOW[philosopher.eraId] ?? "rgba(212,152,42,0.35)";

  return (
    <Link
      href={`/philosophers/${philosopher.slug}`}
      style={{ textDecoration: "none" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 200px 200px",
          alignItems: "center",
          padding: "13px 2.5rem",
          borderBottom: "1px solid var(--border-pale)",
          backgroundColor: hovered ? "rgba(212,152,42,0.04)" : "transparent",
          boxShadow: hovered ? `inset 3px 0 0 ${dotColour}` : "inset 3px 0 0 transparent",
          transition: "background-color 0.18s ease, box-shadow 0.18s ease",
          cursor: "pointer",
        }}
      >
        {/* Name + avatar */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Era colour dot */}
          <div
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              backgroundColor: dotColour,
              flexShrink: 0,
              opacity: hovered ? 1 : 0.5,
              boxShadow: hovered ? `0 0 8px ${dotGlow}` : "none",
              transition: "opacity 0.18s, box-shadow 0.18s",
            }}
          />

          {philosopher.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={philosopher.avatarUrl}
              alt={philosopher.name}
              width={38}
              height={38}
              style={{
                borderRadius: "50%",
                objectFit: "cover",
                flexShrink: 0,
                border: hovered ? `1.5px solid ${dotColour}` : "1.5px solid var(--border)",
                transition: "border-color 0.18s",
                boxShadow: hovered ? `0 0 12px ${dotGlow}` : "none",
              }}
              loading="lazy"
            />
          ) : (
            <div
              style={{
                width: 38, height: 38, borderRadius: "50%",
                backgroundColor: "var(--surface)",
                border: hovered ? `1.5px solid ${dotColour}` : "1.5px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "13px", fontFamily: "var(--font-serif)", color: "var(--ink-muted)",
                flexShrink: 0,
                transition: "border-color 0.18s",
              }}
            >
              {philosopher.name[0]}
            </div>
          )}

          <div
            style={{
              transform: hovered ? "translateX(3px)" : "translateX(0)",
              transition: "transform 0.2s ease",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: hovered ? "italic" : "normal",
                fontSize: "1rem",
                color: hovered ? "var(--ink)" : "var(--ink)",
                transition: "font-style 0.18s",
                display: "block",
                letterSpacing: "-0.01em",
              }}
            >
              {philosopher.name}
            </span>
            {(philosopher.birthYear || philosopher.deathYear) && (
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "11px",
                  color: "var(--ink-muted)",
                  display: "block",
                  marginTop: "1px",
                  opacity: 0.7,
                }}
              >
                {formatYears(philosopher.birthYear, philosopher.deathYear)}
              </span>
            )}
          </div>
        </div>

        {/* Era */}
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "11.5px",
            color: "var(--ink-muted)",
            letterSpacing: "0.01em",
          }}
        >
          {philosopher.eraTitle}
        </span>

        {/* Branch */}
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: hovered ? dotColour : "var(--ink-faint)",
            transition: "color 0.18s",
          }}
        >
          {philosopher.coreBranch}
        </span>
      </div>
    </Link>
  );
}
