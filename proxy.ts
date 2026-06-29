import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/my-notes(.*)"]);

const clerkFapi =
  process.env.NEXT_PUBLIC_CLERK_FAPI_URL ?? "https://*.clerk.accounts.dev";
const isDev = process.env.NODE_ENV === "development";

// CSP note: `script-src` keeps `'unsafe-inline'` deliberately. Dropping it
// requires either per-request nonces — which force every page to render
// dynamically and break static generation / PPR (`cacheComponents`) — or
// hash-based CSP via Next's experimental `sri`, which doesn't cover the inline
// scripts injected by Clerk, Vercel Analytics, and Sanity Studio and would block
// them. For a statically-rendered app this is the documented, accepted approach;
// XSS risk is mitigated by the tight origin allowlist below, the non-script
// directives (object-src/base-uri/frame-ancestors/form-action), and React's
// auto-escaping (no dangerouslySetInnerHTML on user-controlled data).
function buildCsp(isStudio: boolean): string {
  return [
    "default-src 'self'",
    [
      `script-src 'self' 'unsafe-inline'`,
      // Sanity Studio requires eval at runtime; the rest of the app only in dev.
      isDev || isStudio ? "'unsafe-eval'" : "",
      isDev ? "http://localhost:8400" : "",
      clerkFapi,
      "https://challenges.cloudflare.com",
      "https://va.vercel-scripts.com",
    ]
      .filter(Boolean)
      .join(" "),
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data: https://cdn.sanity.io https://img.clerk.com https://*.wikimedia.org",
    "font-src 'self' data:",
    [
      "connect-src 'self'",
      clerkFapi,
      "https://*.sanity.io wss://*.sanity.io",
      "https://*.sentry.io https://*.ingest.de.sentry.io",
      "https://va.vercel-scripts.com",
      isDev ? "http://localhost:8400" : "",
    ].filter(Boolean).join(" "),
    "worker-src 'self' blob:",
    "frame-src 'self' https://challenges.cloudflare.com",
    // Studio embeds itself (presentation/preview); the public app is never framed.
    isStudio ? "frame-ancestors 'self'" : "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    ...(!isDev ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}

const appCsp = buildCsp(false);
const studioCsp = buildCsp(true);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  const response = NextResponse.next();
  const isStudio = req.nextUrl.pathname.startsWith("/studio");
  response.headers.set("Content-Security-Policy", isStudio ? studioCsp : appCsp);
  return response;
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
