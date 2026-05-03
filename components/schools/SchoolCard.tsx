"use client";

import Link from "next/link";
import type { SchoolWithPhilosophers } from "@/lib/types";

export default function SchoolCard({ school }: { school: SchoolWithPhilosophers }) {
  return (
    <Link href={`/schools/${school.slug}`} style={{ textDecoration: "none", display: "block" }}>
      <div
        style={{
          padding: "28px 28px 24px",
          background: "rgba(253,250,245,0.7)",
          border: "1px solid rgba(17,21,26,0.06)",
          transition: "background 0.22s, border-color 0.22s, transform 0.22s cubic-bezier(0.22,1,0.36,1), box-shadow 0.22s",
          cursor: "pointer",
          transform: "translateY(0)",
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement;
          el.style.background = "rgba(253,250,245,1)";
          el.style.borderColor = "rgba(132,84,0,0.18)";
          el.style.transform = "translateY(-3px)";
          el.style.boxShadow = "0 8px 28px rgba(17,21,26,0.08)";
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement;
          el.style.background = "rgba(253,250,245,0.7)";
          el.style.borderColor = "rgba(17,21,26,0.06)";
          el.style.transform = "translateY(0)";
          el.style.boxShadow = "none";
        }}
      >
        <div style={{
          fontFamily: "var(--font-sans)", fontSize: "7px", fontWeight: 700,
          letterSpacing: "0.22em", textTransform: "uppercase",
          color: "var(--accent)", marginBottom: 12,
        }}>
          {school.eraRange}
        </div>
        <div style={{
          fontFamily: "var(--font-serif)", fontStyle: "italic",
          fontSize: "1.35rem", fontWeight: 400,
          color: "var(--ink)", lineHeight: 1.2, marginBottom: 12,
        }}>
          {school.title}
        </div>
        <p style={{
          fontFamily: "var(--font-sans)", fontSize: "0.74rem",
          lineHeight: 1.72, color: "var(--ink-muted)",
          margin: "0 0 16px",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        } as React.CSSProperties}>
          {school.description}
        </p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {school.philosophers.slice(0, 3).map(p => (
              <span key={p._id} style={{
                fontFamily: "var(--font-sans)", fontSize: "0.62rem",
                color: "var(--ink-muted)",
                background: "rgba(17,21,26,0.04)",
                border: "1px solid rgba(17,21,26,0.07)",
                padding: "2px 7px", borderRadius: 2,
              }}>
                {p.name}
              </span>
            ))}
            {school.philosophers.length > 3 && (
              <span style={{
                fontFamily: "var(--font-sans)", fontSize: "0.62rem",
                color: "var(--ink-muted)", opacity: 0.6, padding: "2px 4px",
              }}>
                +{school.philosophers.length - 3}
              </span>
            )}
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(132,84,0,0.5)" strokeWidth="1.5">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
