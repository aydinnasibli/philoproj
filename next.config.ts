import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Clerk FAPI URL — find yours at clerk.com/dashboard → API Keys
// e.g. https://clerk.thelivingmanuscript.com or https://xxxx.clerk.accounts.dev
// Falls back to wildcard so Clerk isn't blocked when the var isn't set.
const clerkFapi = process.env.NEXT_PUBLIC_CLERK_FAPI_URL ?? "https://*.clerk.accounts.dev";

const cspHeader = [
  "default-src 'self'",
  [
    "script-src 'self' 'unsafe-inline'",
    isDev ? "'unsafe-eval'" : "",
    clerkFapi,
    "https://challenges.cloudflare.com",
  ].filter(Boolean).join(" "),
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data: https://cdn.sanity.io https://img.clerk.com",
  "font-src 'self'",
  [
    "connect-src 'self'",
    clerkFapi,
    "https://*.sanity.io wss://*.sanity.io",
  ].filter(Boolean).join(" "),
  "worker-src 'self' blob:",
  "frame-src 'self' https://challenges.cloudflare.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
    ],
  },
  async headers() {
    return [
      {
        // HSTS and basic headers on every route including /studio
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options",     value: "nosniff" },
          { key: "X-Frame-Options",             value: "DENY" },
          { key: "Referrer-Policy",             value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",          value: "camera=(), microphone=(), geolocation=()" },
          { key: "X-DNS-Prefetch-Control",      value: "on" },
          { key: "Strict-Transport-Security",   value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
      {
        // CSP on everything except /studio (Sanity Studio needs unsafe-eval)
        source: "/((?!studio).*)",
        headers: [
          { key: "Content-Security-Policy", value: cspHeader },
        ],
      },
    ];
  },
};

export default nextConfig;
