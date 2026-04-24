"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function GlobeIcon({ active }: { active: boolean }) {
  return active ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function TimelineIcon({ active }: { active: boolean }) {
  return active ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 5h14v2H3zm0 6h14v2H3zm0 6h14v2H3zm16-8h2v2h-2zm0 6h2v2h-2zm0 6h2v2h-2z" />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <line x1="17" y1="7" x2="7" y2="7" />
      <line x1="17" y1="12" x2="7" y2="12" />
      <line x1="17" y1="17" x2="7" y2="17" />
      <circle cx="4" cy="7" r="1.5" />
      <circle cx="4" cy="12" r="1.5" />
      <circle cx="4" cy="17" r="1.5" />
    </svg>
  );
}

function ArchiveIcon({ active }: { active: boolean }) {
  return active ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 3H3C2 3 1 4 1 5v4c0 .55.45 1 1 1h1v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V10h1c.55 0 1-.45 1-1V5c0-1-1-2-2-2zm-1 16H4V10h16v9zm1-11H3V5h18v3zM9 15h6c.55 0 1-.45 1-1s-.45-1-1-1H9c-.55 0-1 .45-1 1s.45 1 1 1z" />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="21 8 21 21 3 21 3 8" />
      <rect x="1" y="3" width="22" height="5" />
      <line x1="10" y1="12" x2="14" y2="12" />
    </svg>
  );
}

function EditNoteIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

const navItems = [
  { href: "/",        label: "NETWORK", Icon: GlobeIcon    },
  { href: "/lineage", label: "LINEAGE",  Icon: TimelineIcon },
  { href: "/archive", label: "ARCHIVE",  Icon: ArchiveIcon  },
] as const;

export default function NavigationSidebar() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        width: "76px",
        background: "rgba(12, 14, 21, 0.88)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderRight: "1px solid rgba(236,232,223,0.07)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "80px",
        paddingBottom: "28px",
        zIndex: 40,
      }}
    >
      {/* Logo mark at top */}
      <div
        style={{
          position: "absolute",
          top: "22px",
          width: "32px",
          height: "32px",
          borderRadius: "8px",
          background: "var(--accent-pale)",
          border: "1px solid var(--border-accent)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--accent)",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      </div>

      {/* Primary nav */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", width: "100%", marginTop: "8px" }}>
        {navItems.map(({ href, label, Icon }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link key={href} href={href} style={{ textDecoration: "none", width: "100%" }}>
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "5px",
                  padding: "12px 0",
                  cursor: "pointer",
                  color: isActive ? "var(--accent)" : "var(--ink-muted)",
                  transition: "color 0.25s ease",
                }}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "3px",
                      height: "28px",
                      borderRadius: "0 2px 2px 0",
                      background: "var(--accent)",
                      boxShadow: "0 0 12px var(--accent-glow)",
                    }}
                  />
                )}

                {/* Icon with glow when active */}
                <div
                  style={{
                    filter: isActive ? "drop-shadow(0 0 6px rgba(212,152,42,0.5))" : "none",
                    transition: "filter 0.25s ease",
                    transform: isActive ? "scale(1.08)" : "scale(1)",
                  }}
                >
                  <Icon active={isActive} />
                </div>

                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "7.5px",
                    fontWeight: 600,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    opacity: isActive ? 1 : 0.55,
                  }}
                >
                  {label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Divider */}
      <div
        style={{
          width: "28px",
          height: "1px",
          background: "linear-gradient(90deg, transparent, var(--border), transparent)",
          margin: "12px 0",
        }}
      />

      {/* Secondary nav */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", width: "100%" }}>
        {[
          { Icon: EditNoteIcon, label: "NOTES" },
          { Icon: SettingsIcon, label: "SETTINGS" },
        ].map(({ Icon, label }) => (
          <div
            key={label}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "5px",
              padding: "10px 0",
              cursor: "pointer",
              color: "var(--ink-faint)",
              opacity: 0.5,
              width: "100%",
            }}
          >
            <Icon />
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "7.5px", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase" }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </nav>
  );
}
