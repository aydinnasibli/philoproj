"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TopNav() {
  const pathname = usePathname();

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: "80px", 
        right: 0,
        height: "80px",
        display: "flex",
        alignItems: "center",
        padding: "0 3rem",
        zIndex: 40,
        justifyContent: "space-between",
        backgroundColor: "transparent", 
      }}
    >
      {/* Left: Title */}
      <div style={{ flex: 1 }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.6rem",
              fontStyle: "italic",
              fontWeight: 500,
              color: "var(--ink)",
              letterSpacing: "-0.02em",
              whiteSpace: "nowrap",
            }}
          >
            The Intellectual Cartography
          </h1>
        </Link>
      </div>

      {/* Center: Nav Links */}
      <nav style={{ display: "flex", gap: "3rem", flex: 1, justifyContent: "center" }}>
        {[
          { href: "/", label: "NETWORK" },
          { href: "/lineage", label: "LINEAGE" },
          { href: "/archive", label: "ARCHIVE" }
        ].map((link) => {
          const isActive = pathname === "/" ? link.href === "/" : pathname.startsWith(link.href) && link.href !== "/";
          return (
            <Link key={link.href} href={link.href} style={{ textDecoration: "none" }}>
              <div style={{ position: "relative", paddingBottom: "6px", paddingTop: "6px" }}>
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    letterSpacing: "0.15em",
                    color: isActive ? "var(--accent)" : "var(--ink-muted)",
                    transition: "color 0.2s",
                  }}
                >
                  {link.label}
                </span>
                {isActive && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "0",
                      left: 0,
                      right: 0,
                      height: "2px",
                      backgroundColor: "var(--accent)",
                    }}
                  />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Right: Icons */}
      <div style={{ flex: 1, display: "flex", justifyContent: "flex-end", gap: "1.5rem", alignItems: "center", color: "var(--ink-muted)" }}>
        <button style={{ background: "none", border: "none", cursor: "pointer", color: "inherit" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
        </button>
        <button style={{ background: "none", border: "none", cursor: "pointer", color: "inherit" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        </button>
        <button style={{ background: "var(--ink)", border: "none", cursor: "pointer", color: "var(--canvas)", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </button>
      </div>
    </header>
  );
}
