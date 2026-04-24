"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const centerLinks = [
  { href: "/",        label: "Network"  },
  { href: "/lineage", label: "Lineage"  },
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
        height: "68px",
        display: "flex",
        alignItems: "center",
        paddingLeft: "92px",
        paddingRight: "48px",
        zIndex: 50,
        justifyContent: "space-between",
        background: "rgba(12, 14, 21, 0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(236,232,223,0.07)",
      }}
    >
      {/* Subtle gold gradient line at very top of header */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "1px",
          background: "linear-gradient(90deg, transparent 0%, rgba(212,152,42,0.45) 30%, rgba(212,152,42,0.65) 50%, rgba(212,152,42,0.45) 70%, transparent 100%)",
        }}
      />

      {/* Left: Title */}
      <Link href="/" style={{ textDecoration: "none" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.3rem",
              fontStyle: "italic",
              fontWeight: 500,
              color: "var(--ink)",
              letterSpacing: "-0.01em",
              whiteSpace: "nowrap",
            }}
          >
            The Living Manuscript
          </h1>
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "9px",
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--accent)",
              opacity: 0.75,
              paddingBottom: "2px",
            }}
          >
            β
          </span>
        </div>
      </Link>

      {/* Center: Serif Nav Links */}
      <nav style={{ display: "flex", gap: "40px" }}>
        {centerLinks.map((link) => {
          const isActive =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);
          return (
            <Link key={link.href} href={link.href} style={{ textDecoration: "none" }}>
              <div style={{ position: "relative", paddingBottom: "2px" }}>
                <span
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "0.975rem",
                    fontWeight: isActive ? 500 : 400,
                    fontStyle: isActive ? "italic" : "normal",
                    color: isActive ? "var(--ink)" : "var(--ink-muted)",
                    transition: "color 0.25s ease, font-style 0.25s ease",
                    letterSpacing: "0.005em",
                  }}
                >
                  {link.label}
                </span>
                {/* Active dot below */}
                {isActive && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "-3px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: "3px",
                      height: "3px",
                      borderRadius: "50%",
                      background: "var(--accent)",
                      boxShadow: "0 0 6px var(--accent-glow)",
                    }}
                  />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Right: Era indicator */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          color: "var(--ink-muted)",
        }}
      >
        <div
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: "var(--accent)",
            boxShadow: "0 0 8px var(--accent-glow)",
            animation: "pulse 3s ease-in-out infinite",
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "var(--ink-faint)",
          }}
        >
          500 BC – 1960
        </span>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </header>
  );
}
