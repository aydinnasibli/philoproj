"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { PhilosopherNode } from "@/lib/mockData";
import HoverCard from "./HoverCard";

type Props = {
  philosopher: PhilosopherNode;
  isHovered: boolean;
  isDimmed: boolean;
  onHover: (id: string | null) => void;
  xPx: number;
  yPx: number;
};

export default function PhilosopherNode({
  philosopher,
  isHovered,
  isDimmed,
  onHover,
  xPx,
  yPx,
}: Props) {
  const [showCard, setShowCard] = useState(false);

  return (
    <div
      style={{
        position: "absolute",
        left: xPx,
        top: yPx,
        width: "96px",
        zIndex: isHovered ? 20 : 10,
        opacity: isDimmed ? 0.3 : 1,
        transition: "opacity 0.3s ease",
      }}
      onMouseEnter={() => {
        onHover(philosopher._id);
        setShowCard(true);
      }}
      onMouseLeave={() => {
        onHover(null);
        setShowCard(false);
      }}
    >
      <Link href={`/philosophers/${philosopher.slug}`} style={{ display: "block", textDecoration: "none" }}>
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          style={{ textAlign: "center" }}
        >
          <div
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              overflow: "hidden",
              border: `4px solid ${isHovered ? "var(--accent)" : "var(--ink)"}`,
              padding: "2px", // Inner gap
              backgroundColor: "var(--canvas)",
              boxShadow: isHovered
                ? "0 0 0 2px var(--canvas), 0 0 0 4px var(--accent)"
                : "none",
              transition: "border-color 0.2s ease, box-shadow 0.2s ease",
              flexShrink: 0,
              margin: "0 auto",
            }}
          >
            {philosopher.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={philosopher.avatarUrl}
                alt={philosopher.name}
                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%", filter: "saturate(0.1) contrast(1.1) brightness(0.95)" }}
                loading="lazy"
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background: "var(--canvas-warm)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2rem",
                  fontFamily: "var(--font-serif)",
                  color: "var(--ink-muted)",
                }}
              >
                {philosopher.name[0]}
              </div>
            )}
          </div>

          {/* Name */}
          <h3
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: "1.1rem",
              fontWeight: 500,
              color: "var(--ink)",
              marginTop: "12px",
              lineHeight: 1.2,
              textAlign: "center",
            }}
          >
            {philosopher.name}
          </h3>

          {/* Branch */}
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "8px",
              fontWeight: 600,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "var(--ink-muted)",
              display: "block",
              marginTop: "4px",
              textAlign: "center",
              lineHeight: 1.4,
            }}
          >
            {philosopher.coreBranch}
          </span>
        </motion.div>
      </Link>

      {/* Hover Card */}
      <AnimatePresence>
        {showCard && (
          <HoverCard philosopher={philosopher} />
        )}
      </AnimatePresence>
    </div>
  );
}
