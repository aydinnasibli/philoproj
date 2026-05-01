import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Not Found" };

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "var(--font-serif)",
      background: "var(--canvas)",
      gap: "1.5rem",
      textAlign: "center",
      padding: "2rem",
    }}>
      <div style={{
        fontFamily: "var(--font-sans)", fontSize: "8px", fontWeight: 700,
        letterSpacing: "0.28em", textTransform: "uppercase",
        color: "var(--accent)",
      }}>
        404
      </div>
      <h1 style={{
        fontStyle: "italic", fontSize: "clamp(2rem, 5vw, 3.5rem)",
        fontWeight: 400, color: "var(--ink)", lineHeight: 1.1,
      }}>
        This page has been lost to history
      </h1>
      <p style={{
        fontFamily: "var(--font-sans)", fontSize: "0.9rem",
        color: "var(--ink-muted)", maxWidth: "40ch", lineHeight: 1.7,
      }}>
        The entry you were looking for could not be found in the manuscript.
      </p>
      <Link href="/" style={{
        fontFamily: "var(--font-sans)", fontSize: "9px", fontWeight: 700,
        letterSpacing: "0.2em", textTransform: "uppercase",
        color: "var(--accent)", textDecoration: "none",
        borderBottom: "1px solid currentColor", paddingBottom: "2px",
      }}>
        Return to the Network
      </Link>
    </div>
  );
}
