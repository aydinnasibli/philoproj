"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function BookOpenIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

const centerLinks = [
  { href: "/lineage", label: "Chronology" },
  { href: "#themes", label: "Themes" },
  { href: "/archive", label: "Thinkers" },
];

export default function TopNav() {
  const pathname = usePathname();

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "72px",
        display: "flex",
        alignItems: "center",
        paddingLeft: "96px",
        paddingRight: "48px",
        zIndex: 50,
        justifyContent: "space-between",
        backgroundColor: "rgba(252, 251, 249, 0.82)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      {/* Left: Title */}
      <Link href="/" style={{ textDecoration: "none" }}>
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.35rem",
            fontStyle: "italic",
            fontWeight: 500,
            color: "var(--ink)",
            letterSpacing: "-0.02em",
            whiteSpace: "nowrap",
          }}
        >
          The Living Manuscript
        </h1>
      </Link>

      {/* Center: Serif Nav Links */}
      <nav style={{ display: "flex", gap: "48px" }}>
        {centerLinks.map((link) => {
          const isActive =
            link.href !== "#themes" &&
            (link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href));
          return (
            <Link key={link.href} href={link.href} style={{ textDecoration: "none" }}>
              <span
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "1rem",
                  fontWeight: 400,
                  color: isActive ? "var(--ink)" : "var(--ink-muted)",
                  transition: "color 0.3s ease",
                  letterSpacing: "0.01em",
                }}
              >
                {link.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Right: Book icon */}
      <div style={{ color: "var(--ink)", display: "flex", alignItems: "center" }}>
        <BookOpenIcon />
      </div>
    </header>
  );
}
