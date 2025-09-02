import { createBrowserClient } from '@supabase/ssr';

// Create a Supabase client for client-side usage with SSR support
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
