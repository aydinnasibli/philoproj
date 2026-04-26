"use client";

import { motion } from "framer-motion";
import type { SchoolWithPhilosophers } from "@/lib/mockData";

interface Props {
  schoolA: SchoolWithPhilosophers | null;
  schoolB: SchoolWithPhilosophers | null;
  onClose: () => void;
}

function EmptyColumn({ label }: { label: string }) {
  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", gap: 10, padding: "24px 32px",
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: "50%",
        border: "1.5px dashed rgba(196,112,41,0.25)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(196,112,41,0.2)" }} />
      </div>
      <span style={{
        fontFamily: "var(--font-serif)", fontStyle: "italic",
        fontSize: "0.82rem", color: "rgba(17,21,26,0.3)",
      }}>
        {label}
      </span>
    </div>
  );
}

function SchoolColumn({
  school,
  side,
  accentColor,
}: {
  school: SchoolWithPhilosophers | null;
  side: "left" | "right";
  accentColor: string;
}) {
  if (!school) {
    return (
      <EmptyColumn label={side === "left" ? "Select first school on map" : "Select second school on map"} />
    );
  }

  return (
    <div style={{
      flex: 1, padding: "24px 28px 20px",
      overflowY: "auto",
      borderRight: side === "left" ? "1px solid rgba(17,21,26,0.07)" : "none",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <div style={{
            display: "inline-block",
            fontFamily: "var(--font-sans)", fontSize: "7px", fontWeight: 700,
            letterSpacing: "0.22em", textTransform: "uppercase",
            color: accentColor,
            background: `${accentColor}14`,
            border: `1px solid ${accentColor}30`,
            padding: "3px 9px", borderRadius: 2, marginBottom: 10,
          }}>
            {school.eraRange}
          </div>
          <h3 style={{
            fontFamily: "var(--font-serif)", fontSize: "1.55rem", fontStyle: "italic",
            color: "#11151a", lineHeight: 1.1, fontWeight: 400, margin: 0,
          }}>
            {school.title}
          </h3>
        </div>
        <div style={{
          width: 28, height: 28, borderRadius: "50%",
          background: `${accentColor}18`,
          border: `1.5px solid ${accentColor}40`,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, marginTop: 4,
        }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: accentColor, opacity: 0.7 }} />
        </div>
      </div>

      <div style={{ height: 1, background: "linear-gradient(to right, rgba(17,21,26,0.08), transparent)", marginBottom: 14 }} />

      <p style={{
        fontFamily: "var(--font-sans)", fontSize: "0.74rem",
        lineHeight: 1.75, color: "#5F6A78", marginBottom: 16,
      }}>
        {school.description.slice(0, 200)}{school.description.length > 200 ? "…" : ""}
      </p>

      {school.coreIdeas.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{
            fontFamily: "var(--font-sans)", fontSize: "7px", fontWeight: 700,
            letterSpacing: "0.18em", textTransform: "uppercase",
            color: "#5F6A78", marginBottom: 10,
          }}>
            Core Ideas
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {school.coreIdeas.slice(0, 3).map((idea, i) => (
              <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                <div style={{
                  width: 3, height: 3, borderRadius: "50%",
                  background: accentColor, opacity: 0.6,
                  marginTop: 6, flexShrink: 0,
                }} />
                <span style={{
                  fontFamily: "var(--font-sans)", fontSize: "0.71rem",
                  lineHeight: 1.65, color: "#43474c",
                }}>
                  {idea}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {school.philosophers.length > 0 && (
        <div>
          <div style={{
            fontFamily: "var(--font-sans)", fontSize: "7px", fontWeight: 700,
            letterSpacing: "0.18em", textTransform: "uppercase",
            color: "#5F6A78", marginBottom: 10,
          }}>
            Key Thinkers
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {school.philosophers.slice(0, 4).map((p) => (
              <div key={p._id} style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "5px 10px 5px 6px",
                background: "rgba(17,21,26,0.03)",
                border: "1px solid rgba(17,21,26,0.08)",
                borderRadius: 100,
              }}>
                <div style={{
                  width: 20, height: 20, borderRadius: "50%",
                  background: `${accentColor}18`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-serif)", fontSize: "0.65rem",
                  color: accentColor, fontWeight: 500, flexShrink: 0,
                }}>
                  {p.name.charAt(0)}
                </div>
                <span style={{
                  fontFamily: "var(--font-sans)", fontSize: "0.68rem", color: "#43474c",
                }}>
                  {p.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ComparisonPanel({ schoolA, schoolB, onClose }: Props) {
  return (
    <motion.div
      initial={{ y: "100%", opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: "100%", opacity: 0 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      data-panel="true"
      onMouseDown={(e) => e.stopPropagation()}
      style={{
        position: "fixed",
        bottom: 0,
        left: 80,
        right: 0,
        height: 340,
        zIndex: 70,
        background: "rgba(253,250,245,0.98)",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        borderTop: "1px solid rgba(132,84,0,0.14)",
        boxShadow: "0 -16px 64px rgba(17,21,26,0.12)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top accent line */}
      <div style={{
        height: 2,
        background: "linear-gradient(to right, #c47029 0%, #c4702960 40%, transparent 100%)",
      }} />

      {/* Header */}
      <div style={{
        padding: "12px 28px",
        borderBottom: "1px solid rgba(17,21,26,0.06)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "rgba(253,250,245,0.7)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            fontFamily: "var(--font-sans)", fontSize: "8px", fontWeight: 700,
            letterSpacing: "0.22em", textTransform: "uppercase", color: "#11151a",
          }}>
            Dialectical Comparison
          </div>
          <div style={{ height: 12, width: 1, background: "rgba(17,21,26,0.12)" }} />
          <div style={{
            fontFamily: "var(--font-serif)", fontStyle: "italic",
            fontSize: "0.75rem", color: "rgba(17,21,26,0.4)",
          }}>
            {schoolA && schoolB
              ? `${schoolA.title} · ${schoolB.title}`
              : schoolA
              ? `${schoolA.title} · select second`
              : "Select two schools on the map"}
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "rgba(17,21,26,0.05)",
            border: "1px solid rgba(17,21,26,0.1)",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            color: "rgba(17,21,26,0.4)", fontSize: "0.7rem",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(17,21,26,0.1)";
            e.currentTarget.style.color = "#11151a";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "rgba(17,21,26,0.05)";
            e.currentTarget.style.color = "rgba(17,21,26,0.4)";
          }}
        >
          ✕
        </button>
      </div>

      {/* Columns */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <SchoolColumn school={schoolA} side="left" accentColor="#c47029" />
        <SchoolColumn school={schoolB} side="right" accentColor="#5A6999" />
      </div>
    </motion.div>
  );
}
