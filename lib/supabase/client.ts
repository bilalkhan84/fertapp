/**
 * Browser-side Supabase client
 * Uses the anon key — safe because RLS is enabled on all tables.
 * Never import SUPABASE_SERVICE_ROLE_KEY in browser code.
 *
 * Set these in .env.local (local) or Netlify Environment Variables (production):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 */
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
