// Server-side Sentry utilities
// Re-export from shared module which handles DSN validation and dynamic imports
export { captureException, captureMessage } from '@/shared/sentry';
