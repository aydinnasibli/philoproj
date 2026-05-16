// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://16dd6cf8f37fb9b39e573b37522d20ff@o4511399204880384.ingest.de.sentry.io/4511399205994576",

  // Only propagate trace headers to our own origin — prevents CORS failures on third-party APIs (Clerk, Sanity, etc.)
  tracePropagationTargets: [/^\//, /^https:\/\/thelivingmanuscript\.com/],

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,
  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
