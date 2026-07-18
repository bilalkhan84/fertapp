import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

/**
 * Permanently delete the signed-in user's account.
 *
 * Flow:
 * 1. Verify the requester's session with the normal server client (anon key).
 * 2. Delete the auth user with a service-role client — all app data
 *    (profiles, results, plans, daily_actions) cascades via ON DELETE CASCADE;
 *    support_requests are kept with user_id set to NULL (ON DELETE SET NULL).
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in the server environment
 * (Netlify → Site → Environment variables). Never expose it client-side.
 */
export async function POST() {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) {
      console.error("account/delete: SUPABASE_SERVICE_ROLE_KEY is not set");
      return NextResponse.json(
        { error: "Account deletion is not configured. Please contact support." },
        { status: 501 }
      );
    }

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) {
      console.error("account/delete: deleteUser failed:", error);
      return NextResponse.json(
        { error: "Couldn't delete the account. Please try again or contact support." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("account/delete: unexpected error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
