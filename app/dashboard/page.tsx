import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/layout/AppLayout";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch profile, plan, latest results, and today's actions in parallel
  const today = new Date().toISOString().split("T")[0];

  const [profileRes, planRes, resultsRes, actionsRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("fertility_plans")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("semen_results")
      .select("*")
      .eq("user_id", user.id)
      .order("result_date", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("daily_actions")
      .select("*")
      .eq("user_id", user.id)
      .eq("action_date", today)
      .maybeSingle(),
  ]);

  return (
    <AppLayout>
      <DashboardClient
        profile={profileRes.data}
        plan={planRes.data}
        latestResult={resultsRes.data}
        todayActions={actionsRes.data}
        userId={user.id}
        today={today}
      />
    </AppLayout>
  );
}
