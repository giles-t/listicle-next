/**
 * Ensure a URL string has a protocol prefix.
 * Vercel env vars like VERCEL_PROJECT_PRODUCTION_URL are bare hostnames.
 */
export function ensureProtocol(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://${url}`;
}

/**
 * Get the base URL for the app, safe for both server and client.
 */
export function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  const raw = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return ensureProtocol(raw);
}
