/**
 * Captures an exception in Sentry. Safe to use in both client and server environments.
 * Uses dynamic import to avoid loading @sentry/nextjs when Sentry DSN is not configured.
 * @param error The error to capture
 * @param context Additional context to include with the error
 */
export const captureException = (error: Error | unknown, context?: Record<string, unknown>) => {
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
 * Uses dynamic import to avoid loading @sentry/nextjs when Sentry DSN is not configured.
 * @param message The message to capture
 * @param level The severity level of the message
 * @param context Additional context to include with the message
 */
export const captureMessage = (
  message: string,
  level: 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug' = 'info',
  context?: Record<string, unknown>
) => {
  import('@sentry/nextjs').then((Sentry) => {
    Sentry.captureMessage(message, {
      level,
      extra: context,
    });
  }).catch(() => {
    // Sentry not available, silently ignore
  });
};
