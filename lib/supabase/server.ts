/**
 * Server-side Supabase client (for Server Components, Route Handlers, middleware)
 * Reads/writes cookies so the session is maintained across SSR.
 *
 * ⚠️  This still uses the ANON key — RLS handles authorization.
 *     If you ever need admin operations, use the service role key here ONLY,
 *     and never expose it to the client bundle.
 */
import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";
import { cookies } from "next/headers";

type CookiesToSet = Parameters<NonNullable<CookieMethodsServer["setAll"]>>[0];

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll called from a Server Component — cookies are read-only.
            // Middleware handles the actual cookie setting.
          }
        },
      },
    }
  );
}
