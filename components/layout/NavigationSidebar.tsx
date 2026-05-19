"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";
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
  { href: "/", label: "Network", Icon: GlobeIcon },
  { href: "/lineage", label: "Lineage", Icon: TimelineIcon },
  { href: "/schools", label: "Schools", Icon: SchoolsIcon },
  { href: "/philosophers", label: "Thinkers", Icon: ArchiveIcon },
  { href: "/my-notes", label: "My Notes", Icon: NotebookIcon },
] as const;

export default function NavigationSidebar() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === "dark";

  const ThemeButton = () => (
    <button
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="size-8 rounded-full flex items-center justify-center border border-amber-800/20 dark:border-amber-600/20 bg-amber-800/6 dark:bg-amber-600/6 text-amber-800 dark:text-amber-600 cursor-pointer transition-opacity duration-200 opacity-70 hover:opacity-100"
    >
      {isDark ? <MoonIcon /> : <SunIcon />}
    </button>
  );

  const AuthButton = ({ cls = "size-10 rounded-lg", clerkSize = 40, clerkRadius = 10 }: { cls?: string; clerkSize?: number; clerkRadius?: number }) =>
    !isSignedIn ? (
      <SignInButton mode="modal">
        <button
          title="Sign in"
          className="flex items-center justify-center text-slate-500 dark:text-stone-400 opacity-50 hover:opacity-100 transition-opacity duration-200 cursor-pointer bg-transparent border-none"
        >
          <div className={`flex items-center justify-center border border-amber-800/18 dark:border-amber-600/18 bg-amber-800/4 dark:bg-amber-600/4 ${cls}`}>
            <UserIcon />
          </div>
        </button>
      </SignInButton>
    ) : (
      <UserButton
        appearance={{
          elements: {
            userButtonAvatarBox: { width: clerkSize, height: clerkSize, borderRadius: clerkRadius, border: "1px solid rgba(132,84,0,0.22)" },
            userButtonTrigger: { boxShadow: "none", "&:focus": { boxShadow: "none" } },
          },
        }}
      />
    );

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────── */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-20 bg-stone-50 dark:bg-stone-900 border-r border-zinc-100 dark:border-zinc-800 flex-col items-center pt-10 pb-8 z-40">
        <Link href="/" className="no-underline mb-9">
          <div className="font-serif italic text-xs text-zinc-950/45 dark:text-stone-100/45 [writing-mode:vertical-lr] rotate-180 tracking-widest whitespace-nowrap">
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
                  className={`flex flex-col items-center gap-1.5 transition-[opacity] duration-300 ease-out relative ${isActive ? "text-amber-800 dark:text-amber-600 opacity-100" : "text-slate-500 dark:text-stone-400 opacity-55"}`}
                >
                  {isActive && (
                    <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-amber-800 dark:bg-amber-600 rounded-r-sm" />
                  )}
                  <div
                    className={`size-10 rounded-lg flex items-center justify-center transition-[background] duration-300 ${isActive ? "bg-amber-800/9 dark:bg-amber-600/9" : "bg-transparent"}`}
                  >
                    <Icon active={isActive} />
                  </div>
                  <span className="font-sans text-xs md:text-[10px] font-medium tracking-widest">
                    {label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="flex flex-col items-center gap-2.5">
          <ThemeButton />
          <AuthButton />
        </div>
      </nav>

      {/* ── Mobile top bar ──────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 min-h-13 bg-stone-50/95 dark:bg-stone-900/95 backdrop-blur-sm border-b border-zinc-100 dark:border-zinc-800 flex items-end justify-between px-4 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))] md:hidden z-50">
        <Link href="/" className="no-underline">
          <span className="font-serif italic text-xs text-zinc-950/40 dark:text-stone-100/40 tracking-widest">
            The Living Manuscript
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeButton />
          <AuthButton cls="size-8 rounded-lg" clerkSize={32} clerkRadius={8} />
        </div>
      </header>

      {/* ── Mobile bottom nav ───────────────────────────────── */}
      <nav
        className="fixed bottom-0 left-0 right-0 bg-stone-50/95 dark:bg-stone-900/95 backdrop-blur-sm border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-around md:hidden z-50 pt-2 pb-[max(8px,env(safe-area-inset-bottom))]"
      >
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link key={href} href={href} className="no-underline flex flex-col items-center gap-1 relative px-2">
              {isActive && (
                <div className="absolute -top-[9px] left-1/2 -translate-x-1/2 w-4 h-0.5 bg-amber-800 dark:bg-amber-600 rounded-b-sm" />
              )}
              <div
                className={`size-9 rounded-lg flex items-center justify-center transition-[background,color] duration-200 ${isActive ? "bg-amber-800/9 dark:bg-amber-600/9 text-amber-800 dark:text-amber-600" : "bg-transparent text-slate-500 dark:text-stone-400 opacity-50"
                  }`}
              >
                <Icon active={isActive} />
              </div>
              <span className={`font-sans text-xs font-medium tracking-widest ${isActive ? "text-amber-800 dark:text-amber-600" : "text-slate-500 dark:text-stone-400 opacity-50"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
