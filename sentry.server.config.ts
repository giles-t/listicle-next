import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN;
const isValidDsn = dsn && dsn.startsWith("https://");

if (isValidDsn) {
  Sentry.init({
    dsn,

    // Sample 20% of transactions in production, all in development
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,

    environment: process.env.NODE_ENV || "development",

    // Only send errors in production
    enabled: process.env.NODE_ENV === "production",
  });
}
