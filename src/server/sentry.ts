import { config } from './config';

const isValidDsn = (dsn: string | undefined): boolean =>
  typeof dsn === 'string' && dsn.startsWith('https://');

export const initSentry = async () => {
  if (!config.sentry.dsn || !isValidDsn(config.sentry.dsn)) {
    console.warn('Sentry DSN not provided, error tracking disabled');
    return;
  }

  const Sentry = await import('@sentry/nextjs');
  Sentry.init({
    dsn: config.sentry.dsn,
    tracesSampleRate: config.app.isProduction ? 0.2 : 1.0,
    environment: config.app.environment,
    enabled: config.app.isProduction,
  });
};

export const captureException = async (error: unknown, context?: Record<string, any>) => {
  if (!isValidDsn(config.sentry.dsn)) return;

  const Sentry = await import('@sentry/nextjs');
  Sentry.captureException(error, {
    extra: context,
  });
};

export const captureMessage = async (
  message: string,
  level: 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug' = 'info'
) => {
  if (!isValidDsn(config.sentry.dsn)) return;

  const Sentry = await import('@sentry/nextjs');
  Sentry.captureMessage(message, {
    level,
  });
};
