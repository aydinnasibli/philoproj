"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function GlobeIcon({ active }: { active: boolean }) {
  return active ? (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
    </svg>
  ) : (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function TimelineIcon({ active }: { active: boolean }) {
  return active ? (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 15h7v2H4zm0-4h16v2H4zm0-4h16v2H4zm13 8h3v6h-3z" />
      <path d="M15 19h6v2h-6z" />
    </svg>
  ) : (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 6h-2.18c.07-.44.18-.88.18-1.36C18 2.53 15.48.02 12.36.02c-1.74 0-3.3.87-4.28 2.19C7.39 1.83 6.06 1.36 4.64 1.36 2.09 1.36 0 3.45 0 6c0 .48.11.92.18 1.36H0v2h24V6h-.18zm-14-1c0-1.1.9-2 2-2 .99 0 1.81.73 1.97 1.67-.01.11-.03.22-.03.33H6v-.36C6 5.78 6 5.64 6 5.5zm12 0c0 .15 0 .29-.01.44l-.01.2H13.7c.17-.96 1-1.68 1.98-1.68 1.1 0 2 .9 2 2zm-18 5h20v14H2V10zm8 5h4c.55 0 1-.45 1-1s-.45-1-1-1h-4c-.55 0-1 .45-1 1s.45 1 1 1z" />
    </svg>
  ) : (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="21 8 21 21 3 21 3 8" />
      <rect x="1" y="3" width="22" height="5" />
      <line x1="10" y1="12" x2="14" y2="12" />
    </svg>
  );
}

function EditNoteIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
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
        width: "80px",
        backgroundColor: "rgba(252, 251, 249, 0.5)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "80px",
        paddingBottom: "24px",
        zIndex: 40,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "36px", marginTop: "16px" }}>
        {navItems.map(({ href, label, Icon }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link key={href} href={href} style={{ textDecoration: "none" }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "5px",
                  cursor: "pointer",
                  color: isActive ? "var(--ink)" : "var(--ink-muted)",
                  transform: isActive ? "scale(1.1)" : "scale(1)",
                  transition: "all 0.4s ease",
                  opacity: isActive ? 1 : 0.55,
                }}
              >
                <Icon active={isActive} />
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "8px",
                    fontWeight: 600,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                  }}
                >
                  {label}
                </span>
              </div>
            </Link>
          );
        })}

        <div style={{ width: "24px", height: "1px", backgroundColor: "var(--border)", marginTop: "4px", marginBottom: "4px" }} />

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "5px", cursor: "pointer", color: "var(--ink-muted)", opacity: 0.4 }}>
          <EditNoteIcon />
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "8px", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase" }}>NOTES</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "5px", cursor: "pointer", color: "var(--ink-muted)", opacity: 0.4 }}>
          <SettingsIcon />
          <span style={{ fontFamily: "var(--font-sans)", fontSize: "8px", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase" }}>SETTINGS</span>
        </div>
      </div>
    </nav>
  );
}
