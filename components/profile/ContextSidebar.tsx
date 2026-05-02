"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { FullPhilosopher } from "@/lib/types";

const ERA_COLOUR: Record<string, string> = {
  "era-1": "rgba(215,170,50,0.90)",
  "era-2": "rgba(215,170,50,0.90)",
  "era-3": "rgba(195,100,55,0.90)",
  "era-4": "rgba(90,105,175,0.90)",
};

type Person = FullPhilosopher["mentors"][number];

function MiniAvatar({ person }: { person: Person }) {
  return (
    <Link
      href={`/philosophers/${person.slug}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "8px 0",
        textDecoration: "none",
        borderBottom: "1px solid var(--border-pale)",
      }}
      className="group"
    >
      <div
        style={{
          position: "relative",
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          overflow: "hidden",
          border: "2px solid var(--border)",
          flexShrink: 0,
          transition: "border-color 0.2s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
        }}
      >
        {person.avatarUrl ? (
          <Image
            src={person.avatarUrl}
            alt={person.name}
            fill
            sizes="44px"
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: "100%", height: "100%",
              background: "var(--canvas-warm)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--font-serif)", fontSize: "14px", color: "var(--ink-muted)",
            }}
          >
            {person.name[0]}
          </div>
        )}
      </div>

      <div>
        <span
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: "0.9rem",
            color: "var(--ink)",
            display: "block",
            lineHeight: 1.2,
          }}
        >
          {person.name}
        </span>
        {person.coreBranch && (
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "10px",
              color: "var(--ink-muted)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              fontWeight: 600,
              display: "block",
              marginTop: "2px",
            }}
          >
            {person.coreBranch}
          </span>
        )}
      </div>
    </Link>
  );
}

function SidebarSection({ label, people, accentColour }: { label: string; people: Person[]; accentColour: string }) {
  if (people.length === 0) return null;
  return (
    <div style={{ marginBottom: "2rem" }}>
      <p
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: accentColour,
          marginBottom: "1rem",
          paddingBottom: "0.5rem",
          borderBottom: `1px solid ${accentColour.replace("0.90", "0.25")}`,
        }}
      >
        {label}
      </p>
      <div>
        {people.map((p) => (
          <MiniAvatar key={p._id} person={p} />
        ))}
      </div>
    </div>
  );
}

export default function ContextSidebar({ philosopher }: { philosopher: FullPhilosopher }) {
  const eraColour = ERA_COLOUR[philosopher.eraId] ?? "var(--accent)";

  function fmtYear(y: number) {
    return y < 0 ? `${Math.abs(y)} BC` : `${y} AD`;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
    >
      {/* Info card */}
      <div
        style={{
          border: "1px solid var(--border)",
          borderTop: `3px solid ${eraColour}`,
          padding: "1.5rem",
          marginBottom: "2rem",
          backgroundColor: "var(--canvas-warm)",
        }}
      >
        <p style={{ fontFamily: "var(--font-sans)", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600, color: "var(--ink-muted)", marginBottom: "1rem" }}>
          At a Glance
        </p>

        {/* Era */}
        {philosopher.eraTitle && (
          <div style={{ marginBottom: "12px" }}>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "10px", color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>
              Era
            </span>
            <p style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "0.9rem", color: "var(--ink)", marginTop: "2px" }}>
              {philosopher.eraTitle}
            </p>
          </div>
        )}

        {/* Lifespan — single merged row */}
        {(philosopher.birthYear || philosopher.deathYear) && (
          <div style={{ marginBottom: "12px" }}>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "10px", color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>
              Lifespan
            </span>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.875rem", color: "var(--ink)", marginTop: "2px" }}>
              {philosopher.birthYear ? fmtYear(philosopher.birthYear) : "?"}
              {" – "}
              {philosopher.deathYear ? fmtYear(philosopher.deathYear) : "present"}
            </p>
          </div>
        )}

        {philosopher.coreBranch && (
          <div>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "10px", color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>
              Branch
            </span>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.875rem", color: "var(--ink)", marginTop: "2px" }}>
              {philosopher.coreBranch}
            </p>
          </div>
        )}
      </div>

      {/* Mentors */}
      <SidebarSection label="Mentors" people={philosopher.mentors} accentColour={eraColour} />

      {/* Students */}
      <SidebarSection label="Students" people={philosopher.students} accentColour={eraColour} />

      {/* Navigation links */}
      <div
        style={{
          borderTop: "1px solid var(--border)",
          paddingTop: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <Link
          href="/philosophers"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--ink-muted)",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ink-muted)")}
        >
          ← Back to Archive
        </Link>
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--ink-muted)",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ink-muted)")}
        >
          ⊕ View Network
        </Link>
      </div>
    </motion.div>
  );
}
