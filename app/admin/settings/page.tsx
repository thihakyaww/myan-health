import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/admin/admin-header";
import { SettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirect=%2Fadmin%2Fsettings");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, phone")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        titleMy="ဆက်တင်များ"
        titleEn="Settings"
      />

      <SettingsForm
        name={profile?.full_name ?? ""}
        email={profile?.email ?? user.email ?? ""}
        phone={profile?.phone ?? ""}
      />
    </>
  );
}
