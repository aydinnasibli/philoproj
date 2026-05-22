import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/my-notes(.*)"]);

const clerkFapi =
  process.env.NEXT_PUBLIC_CLERK_FAPI_URL ?? "https://*.clerk.accounts.dev";
const isDev = process.env.NODE_ENV === "development";

function buildCsp(): string {
  return [
    "default-src 'self'",
    [
      `script-src 'self' 'unsafe-inline'`,
      isDev ? "'unsafe-eval'" : "",
      isDev ? "http://localhost:8400" : "",
      clerkFapi,
      "https://challenges.cloudflare.com",
    ]
      .filter(Boolean)
      .join(" "),
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data: https://cdn.sanity.io https://img.clerk.com",
    "font-src 'self'",
    [
      "connect-src 'self'",
      clerkFapi,
      "https://*.sanity.io wss://*.sanity.io",
      "https://*.sentry.io https://*.ingest.de.sentry.io",
      isDev ? "http://localhost:8400" : "",
    ].filter(Boolean).join(" "),
    "worker-src 'self' blob:",
    "frame-src 'self' https://challenges.cloudflare.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    ...(!isDev ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}

const csp = buildCsp();

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  if (req.nextUrl.pathname.startsWith("/studio")) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  response.headers.set("Content-Security-Policy", csp);
  return response;
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
