"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";

/* ── Icons ── */
function GlobeIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={active ? "1.5" : "1.25"}
      strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function TimelineIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={active ? "1.5" : "1.25"}
      strokeLinecap="round" strokeLinejoin="round">
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
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={active ? "1.5" : "1.25"}
      strokeLinecap="round" strokeLinejoin="round">
      <polyline points="21 8 21 21 3 21 3 8" />
      <rect x="1" y="3" width="22" height="5" />
      <line x1="10" y1="12" x2="14" y2="12" />
    </svg>
  );
}

function SchoolsIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={active ? "1.5" : "1.25"}
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

const NAV_ITEMS = [
  { href: "/",        label: "Network",  Icon: GlobeIcon    },
  { href: "/lineage", label: "Lineage",  Icon: TimelineIcon },
  { href: "/schools", label: "Schools",  Icon: SchoolsIcon  },
  { href: "/philosophers", label: "Thinkers", Icon: ArchiveIcon  },
] as const;

export default function NavigationSidebar() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();

  return (
    <nav style={{
      position: "fixed", left: 0, top: 0, bottom: 0, width: "80px",
      backgroundColor: "rgba(250, 248, 243, 0.72)",
      backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)",
      borderRight: "1px solid rgba(17,21,26,0.06)",
      display: "flex", flexDirection: "column", alignItems: "center",
      paddingTop: "40px", paddingBottom: "32px", zIndex: 40,
    }}>
      {/* Brand mark — small ornament */}
      <div style={{
        width: 32, height: 32, marginBottom: 36,
        display: "flex", alignItems: "center", justifyContent: "center",
        borderRadius: "50%",
        border: "1px solid rgba(132,84,0,0.22)",
        background: "rgba(132,84,0,0.06)",
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#845400" strokeWidth="1.5">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
        </svg>
      </div>

      {/* Nav Items */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "32px", flex: 1 }}>
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link key={href} href={href} style={{ textDecoration: "none" }}>
              <div
                title={label}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
                  color: isActive ? "var(--accent)" : "var(--ink-muted)",
                  opacity: isActive ? 1 : 0.55,
                  transition: "all 0.35s var(--ease-smooth)",
                  position: "relative",
                }}
              >
                {/* Active indicator */}
                {isActive && (
                  <div style={{
                    position: "absolute", left: -16, top: "50%", transform: "translateY(-50%)",
                    width: 2, height: 20, background: "var(--accent)",
                    borderRadius: "0 2px 2px 0",
                  }} />
                )}
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: isActive ? "rgba(132,84,0,0.09)" : "transparent",
                  transition: "background 0.3s ease",
                }}>
                  <Icon active={isActive} />
                </div>
                <span style={{
                  fontFamily: "var(--font-sans)", fontSize: "7.5px", fontWeight: 600,
                  letterSpacing: "0.16em", textTransform: "uppercase",
                }}>
                  {label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Bottom: Auth + divider + version mark */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>

        {/* Auth */}
        {!isSignedIn ? (
          <SignInButton mode="modal">
            <button
              title="Sign in"
              style={{
                all: "unset",
                cursor: "pointer",
                display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
                color: "var(--ink-muted)",
                opacity: 0.5,
                transition: "opacity 0.25s ease",
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "0.5")}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "1px solid rgba(132,84,0,0.18)",
                background: "rgba(132,84,0,0.04)",
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <span style={{
                fontFamily: "var(--font-sans)", fontSize: "7.5px", fontWeight: 600,
                letterSpacing: "0.16em", textTransform: "uppercase",
              }}>
                Sign In
              </span>
            </button>
          </SignInButton>
        ) : (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
          }}>
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: {
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    border: "1px solid rgba(132,84,0,0.22)",
                  },
                  userButtonTrigger: {
                    boxShadow: "none",
                    "&:focus": { boxShadow: "none" },
                  },
                },
              }}
            />
            <span style={{
              fontFamily: "var(--font-sans)", fontSize: "7.5px", fontWeight: 600,
              letterSpacing: "0.16em", textTransform: "uppercase",
              color: "var(--ink-muted)", opacity: 0.55,
            }}>
              Account
            </span>
          </div>
        )}

        <div style={{ width: 20, height: 1, background: "rgba(17,21,26,0.10)" }} />
        <div style={{
          fontFamily: "var(--font-serif)", fontStyle: "italic",
          fontSize: "7px", color: "var(--ink-muted)", opacity: 0.35,
          letterSpacing: "0.05em", writingMode: "vertical-rl",
          transform: "rotate(180deg)",
        }}>
          Manuscript
        </div>
      </div>
    </nav>
  );
}
