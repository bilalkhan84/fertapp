import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/layout/AppLayout";
import ResultsClient from "./ResultsClient";

export default async function ResultsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: results } = await supabase
    .from("semen_results")
    .select("*")
    .eq("user_id", user.id)
    .order("result_date", { ascending: false });

  return (
    <AppLayout
      title="My Results"
      subtitle="Track your semen analysis results over time."
    >
      <ResultsClient initialResults={results ?? []} userId={user.id} />
    </AppLayout>
  );
}
