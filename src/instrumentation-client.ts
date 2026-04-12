// Client-side code only has access to env vars prefixed with NEXT_PUBLIC_.
// `SENTRY_DSN` (without the prefix) is inlined as `undefined` on the client,
// so reading it here means Sentry never initialises in the browser and
// client-side errors are not captured in production Vercel deployments.
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn && dsn.startsWith("https://")) {
  import("@sentry/nextjs").then((Sentry) => {
    Sentry.init({
      dsn,

      // Sample 20% of transactions in production, all in development
      tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,

      environment: process.env.NODE_ENV || "development",

      // Only send errors in production
      enabled: process.env.NODE_ENV === "production",
    });
  });
}
