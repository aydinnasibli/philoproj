"use client";

import { motion } from "framer-motion";

type Work = { title: string; year: number; synopsis: string };

type Props =
  | { type: "works"; works: Work[] }
  | { type: "takeaways"; takeaways: string[] };

function BookIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function LightbulbIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M9 21h6" />
      <path d="M12 3a6 6 0 0 1 6 6c0 2.22-1.21 4.16-3 5.2V17H9v-2.8A6.002 6.002 0 0 1 6 9a6 6 0 0 1 6-6z" />
    </svg>
  );
}

const cardStyle = {
  backgroundColor: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "2px",
  padding: "1.75rem",
};

const sectionLabelStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  marginBottom: "1.5rem",
  color: "var(--accent)",
};

export default function LearningHighlight(props: Props) {
  if (props.type === "works") {
    return (
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        style={{ marginTop: "3rem" }}
      >
        <div style={cardStyle}>
          <div style={sectionLabelStyle}>
            <BookIcon />
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "9.5px",
                fontWeight: 700,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
              }}
            >
              Important Works
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {props.works.map((work, i) => (
              <div
                key={i}
                style={{
                  borderBottom: i < props.works.length - 1 ? "1px solid var(--border-pale)" : "none",
                  paddingBottom: i < props.works.length - 1 ? "1.25rem" : 0,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "12px" }}>
                  <h4
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontStyle: "italic",
                      fontSize: "1rem",
                      fontWeight: 400,
                      color: "var(--ink)",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {work.title}
                  </h4>
                  {work.year && (
                    <span
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "10.5px",
                        color: "var(--ink-faint)",
                        flexShrink: 0,
                        letterSpacing: "0.05em",
                      }}
                    >
                      {work.year < 0 ? `${Math.abs(work.year)} BC` : work.year}
                    </span>
                  )}
                </div>
                {work.synopsis && (
                  <p
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.84rem",
                      lineHeight: 1.75,
                      color: "var(--ink-muted)",
                      marginTop: "5px",
                    }}
                  >
                    {work.synopsis}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.section>
    );
  }

  // Takeaways
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45, duration: 0.5 }}
      style={{ marginTop: "2rem" }}
    >
      <div style={cardStyle}>
        <div style={sectionLabelStyle}>
          <LightbulbIcon />
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "9.5px",
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
            }}
          >
            Key Takeaways
          </span>
        </div>

        <ul style={{ display: "flex", flexDirection: "column", gap: "12px", listStyle: "none" }}>
          {props.takeaways.map((point, i) => (
            <li key={i} style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
              <span
                style={{
                  display: "inline-block",
                  width: "5px",
                  height: "5px",
                  borderRadius: "50%",
                  backgroundColor: "var(--accent)",
                  flexShrink: 0,
                  marginTop: "9px",
                  boxShadow: "0 0 6px var(--accent-glow)",
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.875rem",
                  lineHeight: 1.75,
                  color: "var(--ink-muted)",
                }}
              >
                {point}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </motion.section>
  );
}
