const dsn = process.env.SENTRY_DSN;
const isValidDsn = dsn && dsn.startsWith("https://");

export async function register() {
  if (isValidDsn) {
    if (process.env.NEXT_RUNTIME === "nodejs") {
      await import("../sentry.server.config");
    }

    if (process.env.NEXT_RUNTIME === "edge") {
      await import("../sentry.edge.config");
    }
  }
}

// Only capture request errors when a valid Sentry DSN is configured.
// Uses dynamic import to avoid loading @sentry/nextjs (which validates
// the SENTRY_DSN env var on import) when the DSN is a placeholder.
export async function onRequestError(
  ...args: unknown[]
) {
  if (!isValidDsn) return;
  const Sentry = await import("@sentry/nextjs");
  // @ts-expect-error -- forwarding args to Sentry.captureRequestError
  Sentry.captureRequestError(...args);
}
