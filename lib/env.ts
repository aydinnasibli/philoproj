/**
 * Validates environment variables at server startup so a misconfigured
 * deploy fails fast with a clear signal instead of opaque runtime errors.
 * Called from instrumentation.ts `register()`.
 */

// App is non-functional without these — throw if missing.
const REQUIRED = [
  "MONGODB_URI",
  "NEXT_PUBLIC_SANITY_PROJECT_ID",
  "NEXT_PUBLIC_SANITY_DATASET",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "CLERK_SECRET_KEY",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
] as const;

// Feature-specific — warn if missing (that feature degrades) but don't crash.
const RECOMMENDED = [
  "OPENAI_API_KEY",        // Dialogue feature
  "SANITY_WEBHOOK_SECRET", // On-demand revalidation webhook
  "STUDIO_ADMIN_EMAILS",   // Studio admin access
  "NEXT_PUBLIC_SITE_URL",  // Canonical URLs (falls back to prod domain)
] as const;

export function validateEnv(): void {
  const missingRequired = REQUIRED.filter((k) => !process.env[k]);
  const missingRecommended = RECOMMENDED.filter((k) => !process.env[k]);

  if (missingRecommended.length > 0) {
    console.warn(
      `[env] Missing recommended environment variables (some features will be disabled): ${missingRecommended.join(", ")}`,
    );
  }

  if (missingRequired.length > 0) {
    throw new Error(
      `[env] Missing required environment variables: ${missingRequired.join(", ")}. The application cannot start.`,
    );
  }
}
