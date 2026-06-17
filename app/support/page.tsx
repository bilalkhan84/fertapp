import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppLayout from "@/components/layout/AppLayout";
import SupportClient from "./SupportClient";

export default async function SupportPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <AppLayout
      title="Support"
      subtitle="You're not alone. Resources, guidance, and community."
    >
      <SupportClient userId={user.id} />
    </AppLayout>
  );
}
