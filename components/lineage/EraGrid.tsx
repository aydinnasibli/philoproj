"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { EraWithPhilosophers } from "@/lib/types";

function formatYear(y: number) {
  if (y < 0) return `${Math.abs(y)} BC`;
  return `${y} AD`;
}

type Props = { eras: EraWithPhilosophers[] };

export default function EraGrid({ eras }: Props) {
  if (eras.length === 0) {
    return (
      <div style={{ padding: "4rem 2.5rem", color: "var(--ink-muted)", fontFamily: "var(--font-serif)", fontStyle: "italic" }}>
        No eras found. Run <code>npm run seed</code>.
      </div>
    );
  }

  return (
    <div
      style={{
        paddingTop: "96px",
        paddingBottom: "3rem",
        paddingLeft: "2.5rem",
        paddingRight: "2.5rem",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
        gap: "1.5px",
        backgroundColor: "var(--border)",
      }}
    >
      {eras.map((era, idx) => (
        <motion.div
          key={era._id}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.08, duration: 0.5, ease: "easeOut" }}
          style={{ backgroundColor: "var(--canvas)" }}
        >
          <DashboardCard era={era} />
        </motion.div>
      ))}
    </div>
  );
}

function DashboardCard({ era }: { era: EraWithPhilosophers }) {
  return (
    <div
      style={{
        padding: "2.5rem",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
        position: "relative",
        overflow: "hidden",
        minHeight: "300px",
      }}
      className="group"
    >
      {/* Accent top border reveal */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: `linear-gradient(90deg, var(--accent), transparent)`,
          opacity: 0.6,
        }}
      />

      {/* Era number */}
      <span
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "10px",
          fontWeight: 600,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--accent)",
        }}
      >
        {formatYear(era.startYear)} — {formatYear(era.endYear)}
      </span>

      {/* Era title */}
      <h2
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "1.75rem",
          fontWeight: 500,
          lineHeight: 1.15,
          color: "var(--ink)",
        }}
      >
        {era.title}
      </h2>

      {/* Description */}
      <p
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.875rem",
          lineHeight: 1.75,
          color: "var(--ink-muted)",
          flex: 1,
        }}
      >
        {era.description}
      </p>

      {/* Philosopher chips */}
      {era.philosophers.length > 0 && (
        <div>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "10px",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "var(--ink-muted)",
              marginBottom: "10px",
              fontWeight: 600,
            }}
          >
            Notable Thinkers
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {era.philosophers.map((p) => (
              <Link
                key={p._id}
                href={`/philosophers/${p.slug}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 10px",
                  border: "1px solid var(--border)",
                  fontSize: "12px",
                  fontFamily: "var(--font-sans)",
                  color: "var(--ink)",
                  textDecoration: "none",
                  transition: "border-color 0.2s, color 0.2s",
                  backgroundColor: "transparent",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
                  (e.currentTarget as HTMLElement).style.color = "var(--accent)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                  (e.currentTarget as HTMLElement).style.color = "var(--ink)";
                }}
              >
                {p.avatarUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.avatarUrl}
                    alt={p.name}
                    width={18}
                    height={18}
                    style={{ borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                  />
                )}
                {p.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
