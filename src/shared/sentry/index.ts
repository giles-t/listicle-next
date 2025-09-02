import * as Sentry from '@sentry/nextjs';

/**
 * Captures an exception in Sentry. Safe to use in both client and server environments.
 * @param error The error to capture
 * @param context Additional context to include with the error
 */
export const captureException = (error: Error | unknown, context?: Record<string, unknown>) => {
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
 * @param message The message to capture
 * @param level The severity level of the message
 * @param context Additional context to include with the message
 */
export const captureMessage = (
  message: string,
  level: Sentry.SeverityLevel = 'info',
  context?: Record<string, unknown>
) => {
  Sentry.captureMessage(message, {
    level,
    extra: context,
  });
}; 