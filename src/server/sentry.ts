import * as Sentry from '@sentry/nextjs';
import { config } from './config';

export const initSentry = () => {
  if (!config.sentry.dsn) {
    console.warn('Sentry DSN not provided, error tracking disabled');
    return;
  }

  Sentry.init({
    dsn: config.sentry.dsn,
    tracesSampleRate: config.app.isProduction ? 0.2 : 1.0, // Sample 20% of transactions in production
    environment: config.app.environment,
    // Don't send errors in development
    enabled: config.app.isProduction,
  });
};

export const captureException = (error: unknown, context?: Record<string, any>) => {
  Sentry.captureException(error, {
    extra: context,
  });
};

export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info') => {
  Sentry.captureMessage(message, {
    level,
  });
};

export { Sentry }; 
