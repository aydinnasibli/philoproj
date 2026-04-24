"use client";

import Link from "next/link";
import { useState } from "react";
import type { PhilosopherListItem } from "@/lib/mockData";

const ERA_DOT: Record<string, string> = {
  "era-1": "rgba(215,170,50,0.90)",
  "era-2": "rgba(215,170,50,0.90)",
  "era-3": "rgba(195,100,55,0.90)",
  "era-4": "rgba(90,105,175,0.90)",
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
          padding: "14px 2.5rem",
          borderBottom: "1px solid var(--border-pale)",
          backgroundColor: hovered ? "rgba(139,115,85,0.04)" : "transparent",
          boxShadow: hovered ? `inset 3px 0 0 ${dotColour}` : "inset 3px 0 0 transparent",
          transition: "background-color 0.15s ease, box-shadow 0.15s ease",
          cursor: "pointer",
        }}
      >
        {/* Name + avatar */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Era colour dot */}
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: dotColour,
              flexShrink: 0,
              opacity: hovered ? 1 : 0.65,
              transition: "opacity 0.15s",
            }}
          />

          {philosopher.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={philosopher.avatarUrl}
              alt={philosopher.name}
              width={40}
              height={40}
              style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "1px solid var(--border)" }}
              loading="lazy"
            />
          ) : (
            <div
              style={{
                width: 40, height: 40, borderRadius: "50%",
                backgroundColor: "var(--canvas-warm)",
                border: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "13px", fontFamily: "var(--font-serif)", color: "var(--ink-muted)",
                flexShrink: 0,
              }}
            >
              {philosopher.name[0]}
            </div>
          )}

          <div
            style={{
              transform: hovered ? "translateX(4px)" : "translateX(0)",
              transition: "transform 0.18s ease",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: hovered ? "italic" : "normal",
                fontSize: "1rem",
                color: hovered ? "var(--accent)" : "var(--ink)",
                transition: "color 0.15s, font-style 0.15s",
                display: "block",
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
            fontSize: "12px",
            color: "var(--ink-muted)",
          }}
        >
          {philosopher.eraTitle}
        </span>

        {/* Branch */}
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: hovered ? "var(--accent)" : "var(--ink-muted)",
            transition: "color 0.15s",
          }}
        >
          {philosopher.coreBranch}
        </span>
      </div>
    </Link>
  );
}
