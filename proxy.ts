import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/my-notes(.*)"]);

const clerkFapi =
  process.env.NEXT_PUBLIC_CLERK_FAPI_URL ?? "https://*.clerk.accounts.dev";
const isDev = process.env.NODE_ENV === "development";

function buildCsp(nonce: string): string {
  return [
    "default-src 'self'",
    [
      `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
      isDev ? "'unsafe-eval'" : "",
      clerkFapi,
      "https://challenges.cloudflare.com",
    ]
      .filter(Boolean)
      .join(" "),
    `style-src 'self' ${isDev ? "'unsafe-inline'" : `'nonce-${nonce}'`}`,
    "img-src 'self' blob: data: https://cdn.sanity.io https://img.clerk.com",
    "font-src 'self'",
    [
      "connect-src 'self'",
      clerkFapi,
      "https://*.sanity.io wss://*.sanity.io",
      "https://*.sentry.io https://*.ingest.de.sentry.io",
    ].join(" "),
    "worker-src 'self' blob:",
    "frame-src 'self' https://challenges.cloudflare.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    ...(!isDev ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // Sanity Studio requires unsafe-eval and manages its own CSP needs
  if (req.nextUrl.pathname.startsWith("/studio")) {
    return NextResponse.next();
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildCsp(nonce);

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
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
