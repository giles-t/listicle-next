const isValidDsn = (dsn: string | undefined): boolean =>
  typeof dsn === 'string' && dsn.startsWith('https://');

/**
 * Captures an exception in Sentry. Safe to use in both client and server environments.
 * Only loads the Sentry SDK if a valid DSN is configured.
 * @param error The error to capture
 * @param context Additional context to include with the error
 */
export const captureException = async (error: Error | unknown, context?: Record<string, unknown>) => {
  if (!isValidDsn(process.env.NEXT_PUBLIC_SENTRY_DSN ?? process.env.SENTRY_DSN)) return;

  const Sentry = await import('@sentry/nextjs');
  if (error instanceof Error) {
    Sentry.captureException(error, {
      extra: context,
    });
  } else {
    Sentry.captureException(new Error(String(error)), {
      extra: context,
    });
  }
};

/**
 * Captures a message in Sentry. Safe to use in both client and server environments.
 * Only loads the Sentry SDK if a valid DSN is configured.
 * @param message The message to capture
 * @param level The severity level of the message
 * @param context Additional context to include with the message
 */
export const captureMessage = async (
  message: string,
  level: 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug' = 'info',
  context?: Record<string, unknown>
) => {
  if (!isValidDsn(process.env.NEXT_PUBLIC_SENTRY_DSN ?? process.env.SENTRY_DSN)) return;

  const Sentry = await import('@sentry/nextjs');
  Sentry.captureMessage(message, {
    level,
    extra: context,
  });
};
