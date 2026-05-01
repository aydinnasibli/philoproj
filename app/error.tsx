"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

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
        Something went wrong
      </div>
      <h2 style={{
        fontStyle: "italic", fontSize: "clamp(1.8rem, 4vw, 3rem)",
        fontWeight: 400, color: "var(--ink)", lineHeight: 1.1,
      }}>
        The manuscript could not be loaded
      </h2>
      <p style={{
        fontFamily: "var(--font-sans)", fontSize: "0.9rem",
        color: "var(--ink-muted)", maxWidth: "42ch", lineHeight: 1.7,
      }}>
        An unexpected error occurred. You can try again or return to the network.
      </p>
      <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
        <button
          onClick={unstable_retry}
          style={{
            fontFamily: "var(--font-sans)", fontSize: "9px", fontWeight: 700,
            letterSpacing: "0.2em", textTransform: "uppercase",
            color: "var(--accent)", background: "none", border: "none",
            borderBottom: "1px solid currentColor", paddingBottom: "2px",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
        <Link href="/" style={{
          fontFamily: "var(--font-sans)", fontSize: "9px", fontWeight: 700,
          letterSpacing: "0.2em", textTransform: "uppercase",
          color: "var(--ink-muted)", textDecoration: "none",
          borderBottom: "1px solid currentColor", paddingBottom: "2px",
        }}>
          Return to Network
        </Link>
      </div>
    </div>
  );
}
