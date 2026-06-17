import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/layout/AppLayout";
import CareClient from "./CareClient";

export default async function CarePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("province")
    .eq("id", user.id)
    .single();

  return (
    <AppLayout
      title="Care & Coverage"
      subtitle="Navigate Ontario's fertility healthcare system with confidence."
    >
      <CareClient province={profile?.province ?? "Ontario"} />
    </AppLayout>
  );
}
