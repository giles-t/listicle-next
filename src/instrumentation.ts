import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN;
const isValidDsn = dsn && dsn.startsWith("https://");

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

export const onRequestError = isValidDsn
  ? Sentry.captureRequestError
  : undefined;
