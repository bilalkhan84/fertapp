import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/layout/AppLayout";
import AccountClient from "./AccountClient";

export const metadata = { title: "Account — FertTrack" };

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  return (
    <AppLayout title="Account" subtitle="Manage your profile and settings">
      <AccountClient profile={profile} />
    </AppLayout>
  );
}
