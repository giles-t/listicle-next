// Check DSN validity once at module load (no SDK import, just env read).
// This prevents loading @sentry/nextjs entirely when the DSN is a
// placeholder like "your_sentry_dsn", which would trigger the
// "Invalid Sentry Dsn" runtime warning on every dynamic import.
const _dsn = typeof process !== 'undefined' ? process.env?.SENTRY_DSN ?? process.env?.NEXT_PUBLIC_SENTRY_DSN : undefined;
const _hasDsn = Boolean(_dsn && _dsn.startsWith('https://'));

/**
 * Captures an exception in Sentry. Safe to use in both client and server environments.
 * Skips the import entirely when the DSN is not a valid URL.
 */
export const captureException = (error: Error | unknown, context?: Record<string, unknown>) => {
  if (!_hasDsn) return;
  import('@sentry/nextjs').then((Sentry) => {
    if (error instanceof Error) {
      Sentry.captureException(error, {
        extra: context,
      });
    } else {
      Sentry.captureException(new Error(String(error)), {
        extra: context,
      });
    }
  }).catch(() => {
    // Sentry not available, silently ignore
  });
};

/**
 * Captures a message in Sentry. Safe to use in both client and server environments.
 * Skips the import entirely when the DSN is not a valid URL.
 */
export const captureMessage = (
  message: string,
  level: 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug' = 'info',
  context?: Record<string, unknown>
) => {
  if (!_hasDsn) return;
  import('@sentry/nextjs').then((Sentry) => {
    Sentry.captureMessage(message, {
      level,
      extra: context,
    });
  }).catch(() => {
    // Sentry not available, silently ignore
  });
};
