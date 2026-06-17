import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Root route — redirect to dashboard if signed in, otherwise to login.
 */
export default async function RootPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
