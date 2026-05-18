"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { SignInButton, UserButton, useAuth, useUser } from "@clerk/nextjs";
import { useTheme } from "next-themes";

function GlobeIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "1.5" : "1.25"} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
function TimelineIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "1.5" : "1.25"} strokeLinecap="round" strokeLinejoin="round">
      <line x1="17" y1="7" x2="7" y2="7" /><line x1="17" y1="12" x2="7" y2="12" /><line x1="17" y1="17" x2="7" y2="17" />
      <circle cx="4" cy="7" r="1.5" /><circle cx="4" cy="12" r="1.5" /><circle cx="4" cy="17" r="1.5" />
    </svg>
  );
}
function ArchiveIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "1.5" : "1.25"} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="21 8 21 21 3 21 3 8" /><rect x="1" y="3" width="22" height="5" /><line x1="10" y1="12" x2="14" y2="12" />
    </svg>
  );
}
function SchoolsIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "1.5" : "1.25"} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}
function NotebookIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? "1.5" : "1.25"} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}

const NAV_ITEMS = [
  { href: "/",             label: "Network",  Icon: GlobeIcon    },
  { href: "/lineage",      label: "Lineage",  Icon: TimelineIcon },
  { href: "/schools",      label: "Schools",  Icon: SchoolsIcon  },
  { href: "/philosophers", label: "Thinkers", Icon: ArchiveIcon  },
  { href: "/my-notes",     label: "My Notes", Icon: NotebookIcon },
] as const;

export default function NavigationSidebar() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === "dark";

  const ThemeButton = ({ size = 32 }: { size?: number }) => (
    <button
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      style={{ width: size, height: size }}
      className="rounded-full flex items-center justify-center border border-accent/20 bg-accent/6 text-accent cursor-pointer transition-opacity duration-250 opacity-70 hover:opacity-100"
    >
      {isDark ? <MoonIcon /> : <SunIcon />}
    </button>
  );

  const AuthButton = ({ avatarSize = 40, avatarRadius = 10 }: { avatarSize?: number; avatarRadius?: number }) =>
    !isSignedIn ? (
      <SignInButton mode="modal">
        <button
          title="Sign in"
          className="flex items-center justify-center text-ink-muted opacity-50 hover:opacity-100 transition-opacity duration-250 cursor-pointer bg-transparent border-none"
        >
          <div
            style={{ width: avatarSize, height: avatarSize, borderRadius: avatarRadius }}
            className="flex items-center justify-center border border-[rgba(132,84,0,0.18)] bg-[rgba(132,84,0,0.04)]"
          >
            <UserIcon />
          </div>
        </button>
      </SignInButton>
    ) : (
      <UserButton
        appearance={{
          elements: {
            userButtonAvatarBox: { width: avatarSize, height: avatarSize, borderRadius: avatarRadius, border: "1px solid rgba(132,84,0,0.22)" },
            userButtonTrigger: { boxShadow: "none", "&:focus": { boxShadow: "none" } },
          },
        }}
      />
    );

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────── */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-[80px] bg-canvas border-r border-border-pale flex-col items-center pt-[40px] pb-8 z-40">
        <Link href="/" className="no-underline mb-[36px]">
          <div className="font-serif italic text-xs text-[rgba(17,21,26,0.45)] [writing-mode:vertical-lr] rotate-180 tracking-[0.12em] whitespace-nowrap">
            The Living Manuscript
          </div>
        </Link>

        <div className="flex flex-col items-center gap-8 flex-1 pt-3">
          {NAV_ITEMS.map(({ href, label, Icon }) => {
            const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link key={href} href={href} className="no-underline">
                <div
                  title={label}
                  className={`flex flex-col items-center gap-1.5 transition-all duration-350 ease-(--ease-smooth) relative ${isActive ? "text-accent opacity-100" : "text-ink-muted opacity-[0.55]"}`}
                >
                  {isActive && (
                    <div className="absolute left-[-16px] top-1/2 -translate-y-1/2 w-[2px] h-[20px] bg-accent rounded-r-[2px]" />
                  )}
                  <div
                    className={`w-[40px] h-[40px] rounded-[10px] flex items-center justify-center transition-[background] duration-300 ${isActive ? "bg-[rgba(132,84,0,0.09)]" : "bg-transparent"}`}
                  >
                    <Icon active={isActive} />
                  </div>
                  <span className="font-sans text-5xs font-semibold tracking-[0.16em] uppercase">
                    {label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="flex flex-col items-center gap-2.5">
          <ThemeButton size={32} />
          <AuthButton avatarSize={40} avatarRadius={10} />
          {isSignedIn && user?.username && (
            <span className="font-sans text-[9px] font-medium tracking-widest text-ink-muted opacity-50 max-w-[64px] truncate text-center">
              {user.username}
            </span>
          )}
        </div>
      </nav>

      {/* ── Mobile top bar ──────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 h-[52px] bg-canvas/95 backdrop-blur-sm border-b border-border-pale flex items-center justify-between px-4 md:hidden z-50">
        <Link href="/" className="no-underline">
          <span className="font-serif italic text-2xs text-ink/40 tracking-[0.10em]">
            The Living Manuscript
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeButton size={32} />
          <AuthButton avatarSize={32} avatarRadius={8} />
        </div>
      </header>

      {/* ── Mobile bottom nav ───────────────────────────────── */}
      <nav
        className="fixed bottom-0 left-0 right-0 bg-canvas/95 backdrop-blur-sm border-t border-border-pale flex items-center justify-around md:hidden z-50"
        style={{ paddingTop: "8px", paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}
      >
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link key={href} href={href} className="no-underline flex flex-col items-center gap-1 relative px-2">
              {isActive && (
                <div className="absolute -top-[9px] left-1/2 -translate-x-1/2 w-4 h-[2px] bg-accent rounded-b-[2px]" />
              )}
              <div
                className={`w-9 h-9 rounded-[9px] flex items-center justify-center transition-[background,color] duration-200 ${
                  isActive ? "bg-[rgba(132,84,0,0.09)] text-accent" : "bg-transparent text-ink-muted opacity-50"
                }`}
              >
                <Icon active={isActive} />
              </div>
              <span className={`font-sans text-[7px] font-semibold tracking-[0.14em] uppercase ${isActive ? "text-accent" : "text-ink-muted opacity-50"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
