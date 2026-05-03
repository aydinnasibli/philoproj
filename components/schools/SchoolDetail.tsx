"use client";

import Image from "next/image";
import Link from "next/link";
import type { SchoolWithPhilosophers } from "@/lib/types";

function HoverLink({ href, children, dir }: { href: string; children: React.ReactNode; dir?: "left" | "right" }) {
  return (
    <Link
      href={href}
      style={{
        fontFamily: "var(--font-sans)", fontSize: "0.72rem",
        color: "var(--ink-muted)", textDecoration: "none",
        padding: "5px 12px",
        border: "1px solid rgba(17,21,26,0.1)",
        borderRadius: 2, transition: "border-color 0.2s, color 0.2s",
        display: "inline-block",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(132,84,0,0.3)";
        (e.currentTarget as HTMLElement).style.color = "var(--accent)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(17,21,26,0.1)";
        (e.currentTarget as HTMLElement).style.color = "var(--ink-muted)";
      }}
    >
      {dir === "left" && "← "}{children}{dir === "right" && " →"}
    </Link>
  );
}

export default function SchoolDetail({ school }: { school: SchoolWithPhilosophers }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--parchment)", paddingLeft: 80 }}>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "64px 48px 96px" }}>

        <Link href="/schools" style={{
          display: "flex", alignItems: "center", gap: 6, width: "fit-content",
          fontFamily: "var(--font-sans)", fontSize: "0.7rem", fontWeight: 600,
          letterSpacing: "0.14em", textTransform: "uppercase",
          color: "var(--ink-muted)", textDecoration: "none",
          marginBottom: 44, opacity: 0.6,
          transition: "color 0.18s, opacity 0.18s",
        }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.color = "var(--accent)";
            el.style.opacity = "1";
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.color = "var(--ink-muted)";
            el.style.opacity = "0.6";
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Schools
        </Link>

        <div style={{
          display: "inline-block",
          fontFamily: "var(--font-sans)", fontSize: "7px", fontWeight: 700,
          letterSpacing: "0.22em", textTransform: "uppercase",
          color: "var(--accent)", background: "rgba(132,84,0,0.08)",
          border: "1px solid rgba(132,84,0,0.2)",
          padding: "4px 10px", borderRadius: 2, marginBottom: 16,
        }}>
          {school.eraRange}
        </div>

        <h1 style={{
          fontFamily: "var(--font-serif)", fontStyle: "italic",
          fontSize: "clamp(2.4rem, 5vw, 3.6rem)", fontWeight: 400,
          color: "var(--ink)", lineHeight: 1.08, letterSpacing: "-0.01em",
          margin: "0 0 28px",
        }}>
          {school.title}
        </h1>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 36 }}>
          <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, rgba(132,84,0,0.2), transparent)" }} />
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <circle cx="4" cy="4" r="1.5" fill="rgba(132,84,0,0.5)" />
            <circle cx="4" cy="4" r="3.5" stroke="rgba(132,84,0,0.2)" strokeWidth="0.75" fill="none" />
          </svg>
          <div style={{ flex: 1, height: 1, background: "linear-gradient(to left, rgba(132,84,0,0.2), transparent)" }} />
        </div>

        <p style={{
          fontFamily: "var(--font-sans)", fontSize: "0.88rem",
          lineHeight: 1.85, color: "var(--ink-muted)", marginBottom: 48,
        }}>
          {school.description}
        </p>

        {school.coreIdeas.length > 0 && (
          <div style={{ marginBottom: 48 }}>
            <div style={{
              fontFamily: "var(--font-sans)", fontSize: "8px", fontWeight: 700,
              letterSpacing: "0.22em", textTransform: "uppercase",
              color: "var(--ink-muted)", marginBottom: 18,
              paddingBottom: 10, borderBottom: "1px solid rgba(17,21,26,0.07)",
            }}>
              Core Ideas
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {school.coreIdeas.map((idea, i) => (
                <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{
                    width: 4, height: 4, borderRadius: "50%",
                    background: "var(--accent)", opacity: 0.55,
                    marginTop: 8, flexShrink: 0,
                  }} />
                  <span style={{
                    fontFamily: "var(--font-sans)", fontSize: "0.82rem",
                    lineHeight: 1.72, color: "var(--ink-muted)",
                  }}>
                    {idea}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {(school.influencedBy.length > 0 || school.influencedTo.length > 0) && (
          <div style={{ display: "flex", gap: 32, marginBottom: 48 }}>
            {school.influencedBy.length > 0 && (
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: "var(--font-sans)", fontSize: "8px", fontWeight: 700,
                  letterSpacing: "0.22em", textTransform: "uppercase",
                  color: "var(--ink-muted)", marginBottom: 12,
                  paddingBottom: 10, borderBottom: "1px solid rgba(17,21,26,0.07)",
                }}>
                  Received From
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {school.influencedBy.map(s => (
                    <HoverLink key={s._id} href={`/schools/${s.slug}`} dir="left">{s.title}</HoverLink>
                  ))}
                </div>
              </div>
            )}
            {school.influencedTo.length > 0 && (
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: "var(--font-sans)", fontSize: "8px", fontWeight: 700,
                  letterSpacing: "0.22em", textTransform: "uppercase",
                  color: "var(--ink-muted)", marginBottom: 12,
                  paddingBottom: 10, borderBottom: "1px solid rgba(17,21,26,0.07)",
                }}>
                  Passed Forward
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {school.influencedTo.map(s => (
                    <HoverLink key={s._id} href={`/schools/${s.slug}`} dir="right">{s.title}</HoverLink>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {school.philosophers.length > 0 && (
          <div>
            <div style={{
              fontFamily: "var(--font-sans)", fontSize: "8px", fontWeight: 700,
              letterSpacing: "0.22em", textTransform: "uppercase",
              color: "var(--ink-muted)", marginBottom: 18,
              paddingBottom: 10, borderBottom: "1px solid rgba(17,21,26,0.07)",
            }}>
              Key Thinkers
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {school.philosophers.map(p => (
                <Link
                  key={p._id}
                  href={`/philosophers/${p.slug}`}
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "14px 16px",
                    background: "rgba(253,250,245,0.6)",
                    border: "1px solid rgba(17,21,26,0.05)",
                    textDecoration: "none",
                    transition: "background 0.2s, border-color 0.2s",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(253,250,245,1)";
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(132,84,0,0.15)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(253,250,245,0.6)";
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(17,21,26,0.05)";
                  }}
                >
                  <div style={{
                    position: "relative",
                    width: 42, height: 42, borderRadius: "50%", flexShrink: 0,
                    overflow: "hidden", background: "rgba(132,84,0,0.1)",
                    border: "1px solid rgba(132,84,0,0.2)",
                  }}>
                    {p.avatarUrl ? (
                      <Image src={p.avatarUrl} alt={p.name} fill sizes="42px"
                        style={{ objectFit: "cover", filter: "sepia(30%) grayscale(0.2)" }} />
                    ) : (
                      <div style={{
                        width: "100%", height: "100%", display: "flex",
                        alignItems: "center", justifyContent: "center",
                        fontFamily: "var(--font-serif)", fontStyle: "italic",
                        fontSize: "1.1rem", color: "var(--accent)",
                      }}>
                        {p.name[0]}
                      </div>
                    )}
                  </div>
                  <div>
                    <div style={{
                      fontFamily: "var(--font-serif)", fontSize: "0.95rem",
                      color: "var(--ink)", fontWeight: 500, marginBottom: 2,
                    }}>
                      {p.name}
                    </div>
                    <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.68rem", color: "var(--ink-muted)" }}>
                      {p.coreBranch}
                    </div>
                  </div>
                  <div style={{ marginLeft: "auto", fontFamily: "var(--font-sans)", fontSize: "0.68rem", color: "rgba(132,84,0,0.5)" }}>
                    View →
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
