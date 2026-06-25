import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/layout/AppLayout";
import PlanClient from "./PlanClient";

export default async function PlanPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [planRes, profileRes] = await Promise.all([
    supabase.from("fertility_plans").select("*").eq("user_id", user.id).eq("status", "active").order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("profiles").select("province").eq("id", user.id).single(),
  ]);

  return (
    <AppLayout
      title="90-Day Plan"
      subtitle="Your personalized fertility improvement roadmap."
    >
      <PlanClient
        initialPlan={planRes.data}
        userId={user.id}
        province={profileRes.data?.province ?? "Ontario"}
      />
    </AppLayout>
  );
}
