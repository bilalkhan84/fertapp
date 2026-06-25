import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/layout/AppLayout";
import ResultsClient from "./ResultsClient";

export default async function ResultsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [resultsRes, profileRes] = await Promise.all([
    supabase.from("semen_results").select("*").eq("user_id", user.id).order("result_date", { ascending: false }),
    supabase.from("profiles").select("province").eq("id", user.id).single(),
  ]);

  return (
    <AppLayout
      title="My Results"
      subtitle="Track your semen analysis results over time."
    >
      <ResultsClient
        initialResults={resultsRes.data ?? []}
        userId={user.id}
        province={profileRes.data?.province ?? "Ontario"}
      />
    </AppLayout>
  );
}
