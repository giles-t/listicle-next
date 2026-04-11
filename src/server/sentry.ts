// Server-side Sentry utilities
// Initialization is handled by sentry.server.config.ts via the instrumentation hook
export { captureException, captureMessage } from '@/shared/sentry';
export * as Sentry from '@sentry/nextjs';
