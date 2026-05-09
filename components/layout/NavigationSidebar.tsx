"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";

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

  return (
    <nav className="fixed left-0 top-0 bottom-0 w-[80px] bg-[rgb(250,248,243)] border-r border-[rgba(17,21,26,0.06)] flex flex-col items-center pt-[40px] pb-[32px] z-40">

      <Link href="/" className="no-underline mb-[36px]">
        <div className="font-serif italic text-[8px] text-[rgba(17,21,26,0.45)] [writing-mode:vertical-lr] rotate-180 tracking-[0.12em] whitespace-nowrap">
          The Living Manuscript
        </div>
      </Link>

      <div className="flex flex-col items-center gap-[32px] flex-1 pt-[12px]">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link key={href} href={href} className="no-underline">
              <div
                title={label}
                className={`flex flex-col items-center gap-[6px] transition-all duration-350 ease-(--ease-smooth) relative ${isActive ? "text-accent opacity-100" : "text-ink-muted opacity-[0.55]"}`}
              >
                {isActive && (
                  <div className="absolute left-[-16px] top-1/2 -translate-y-1/2 w-[2px] h-[20px] bg-accent rounded-r-[2px]" />
                )}
                <div
                  className={`w-[40px] h-[40px] rounded-[10px] flex items-center justify-center transition-[background] duration-300 ${isActive ? "bg-[rgba(132,84,0,0.09)]" : "bg-transparent"}`}
                >
                  <Icon active={isActive} />
                </div>
                <span className="font-sans text-[7.5px] font-semibold tracking-[0.16em] uppercase">
                  {label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="flex flex-col items-center gap-[10px]">
        <div className="w-[32px] h-[32px] rounded-full flex items-center justify-center border border-[rgba(132,84,0,0.22)] bg-[rgba(132,84,0,0.06)] text-[#845400] relative top-[-2px]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
          </svg>
        </div>

        {!isSignedIn ? (
          <SignInButton mode="modal">
            <button
              title="Sign in"
              className="flex items-center justify-center text-ink-muted opacity-50 hover:opacity-100 transition-opacity duration-[250ms] cursor-pointer bg-transparent border-none"
            >
              <div className="w-[40px] h-[40px] rounded-[10px] flex items-center justify-center border border-[rgba(132,84,0,0.18)] bg-[rgba(132,84,0,0.04)]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            </button>
          </SignInButton>
        ) : (
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox: { width: 40, height: 40, borderRadius: 10, border: "1px solid rgba(132,84,0,0.22)" },
                userButtonTrigger: { boxShadow: "none", "&:focus": { boxShadow: "none" } },
              },
            }}
          />
        )}
      </div>
    </nav>
  );
}
