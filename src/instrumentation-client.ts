const dsn = process.env.SENTRY_DSN;

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
