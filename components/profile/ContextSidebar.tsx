"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { FullPhilosopher } from "@/lib/mockData";

const ERA_COLOUR: Record<string, string> = {
  "era-1": "#D7AA32",
  "era-2": "#D7AA32",
  "era-3": "#C36437",
  "era-4": "#5A69AF",
};

const ERA_GLOW: Record<string, string> = {
  "era-1": "rgba(215,170,50,0.22)",
  "era-2": "rgba(215,170,50,0.22)",
  "era-3": "rgba(195,100,55,0.22)",
  "era-4": "rgba(90,105,175,0.22)",
};

type Person = FullPhilosopher["mentors"][number];

function MiniAvatar({ person, eraColour, eraGlow }: { person: Person; eraColour: string; eraGlow: string }) {
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
        transition: "opacity 0.2s",
      }}
      onMouseEnter={e => (e.currentTarget.style.opacity = "0.8")}
      onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          overflow: "hidden",
          border: "1.5px solid var(--border)",
          flexShrink: 0,
          transition: "border-color 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = eraColour;
          (e.currentTarget as HTMLElement).style.boxShadow = `0 0 10px ${eraGlow}`;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
          (e.currentTarget as HTMLElement).style.boxShadow = "none";
        }}
      >
        {person.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={person.avatarUrl}
            alt={person.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            loading="lazy"
          />
        ) : (
          <div
            style={{
              width: "100%", height: "100%",
              background: "var(--surface)",
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
            fontSize: "0.875rem",
            color: "var(--ink)",
            display: "block",
            lineHeight: 1.25,
            letterSpacing: "-0.01em",
          }}
        >
          {person.name}
        </span>
        {person.coreBranch && (
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "9.5px",
              color: "var(--ink-faint)",
              letterSpacing: "0.08em",
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

function SidebarSection({ label, people, eraColour, eraGlow }: { label: string; people: Person[]; eraColour: string; eraGlow: string }) {
  if (people.length === 0) return null;
  return (
    <div style={{ marginBottom: "2rem" }}>
      <p
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "9.5px",
          fontWeight: 700,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: eraColour,
          marginBottom: "0.75rem",
          paddingBottom: "0.5rem",
          borderBottom: `1px solid rgba(${eraColour === "#D7AA32" ? "215,170,50" : eraColour === "#C36437" ? "195,100,55" : "90,105,175"},0.2)`,
        }}
      >
        {label}
      </p>
      <div>
        {people.map((p) => (
          <MiniAvatar key={p._id} person={p} eraColour={eraColour} eraGlow={eraGlow} />
        ))}
      </div>
    </div>
  );
}

export default function ContextSidebar({ philosopher }: { philosopher: FullPhilosopher }) {
  const eraColour = ERA_COLOUR[philosopher.eraId] ?? "var(--accent)";
  const eraGlow   = ERA_GLOW[philosopher.eraId]   ?? "rgba(212,152,42,0.22)";

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
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderTop: `3px solid ${eraColour}`,
          padding: "1.5rem",
          marginBottom: "2rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Faint era glow in corner */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "80px",
            height: "80px",
            background: `radial-gradient(circle at top right, ${eraGlow} 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />

        <p style={{
          fontFamily: "var(--font-sans)",
          fontSize: "9.5px",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          fontWeight: 700,
          color: "var(--ink-faint)",
          marginBottom: "1.25rem",
        }}>
          At a Glance
        </p>

        {philosopher.eraTitle && (
          <div style={{ marginBottom: "14px" }}>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "9.5px", color: "var(--ink-faint)", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 600, display: "block", marginBottom: "3px" }}>
              Era
            </span>
            <p style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "0.9rem", color: "var(--ink)", lineHeight: 1.3 }}>
              {philosopher.eraTitle}
            </p>
          </div>
        )}

        {(philosopher.birthYear || philosopher.deathYear) && (
          <div style={{ marginBottom: "14px" }}>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "9.5px", color: "var(--ink-faint)", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 600, display: "block", marginBottom: "3px" }}>
              Lifespan
            </span>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.875rem", color: "var(--ink-muted)", letterSpacing: "0.02em" }}>
              {philosopher.birthYear ? fmtYear(philosopher.birthYear) : "?"}
              {" – "}
              {philosopher.deathYear ? fmtYear(philosopher.deathYear) : "present"}
            </p>
          </div>
        )}

        {philosopher.coreBranch && (
          <div>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "9.5px", color: "var(--ink-faint)", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 600, display: "block", marginBottom: "3px" }}>
              Branch
            </span>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.875rem", color: "var(--ink-muted)", letterSpacing: "0.02em" }}>
              {philosopher.coreBranch}
            </p>
          </div>
        )}
      </div>

      <SidebarSection label="Mentors" people={philosopher.mentors} eraColour={eraColour} eraGlow={eraGlow} />
      <SidebarSection label="Students" people={philosopher.students} eraColour={eraColour} eraGlow={eraGlow} />

      {/* Navigation links */}
      <div
        style={{
          borderTop: "1px solid var(--border-pale)",
          paddingTop: "1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {[
          { href: "/archive", label: "← Back to Archive" },
          { href: "/",        label: "⊕ View Network"    },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--ink-faint)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "color 0.18s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ink-faint)")}
          >
            {label}
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
