/**
 * Supabase OAuth callback handler
 * After Google sign-in, Supabase redirects here with a code.
 * We exchange it for a session, then route the user appropriately.
 *
 * Add this URL to:
 *   Supabase → Authentication → URL Configuration → Redirect URLs
 *   e.g. https://your-app.netlify.app/auth/callback
 */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check if user has completed onboarding
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_complete")
          .eq("id", user.id)
          .single();

        if (!profile?.onboarding_complete) {
          return NextResponse.redirect(new URL("/onboarding", requestUrl.origin));
        }
      }

      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }
  }

  // Auth error — redirect to login with error message
  return NextResponse.redirect(
    new URL("/login?error=auth_callback_failed", requestUrl.origin)
  );
}
