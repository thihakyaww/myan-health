import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageContainer, PageHeader } from "@/components/layout/page-header";
import { ReportsView } from "@/components/reports/reports-view";

export const metadata = {
  title: "Reports",
  description: "Disease & Health reports",
};

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?redirect=%2Freports");

  // Parallel fetches (async-parallel rule): reference data + profile prefill
  const [diseaseTypesRes, symptomOptionsRes, profileRes] = await Promise.all([
    supabase.from("disease_types").select("id, name_en, name_mm").order("name_en"),
    supabase.from("symptom_options").select("id, name_en, name_mm").order("name_en"),
    supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("id", user.id)
      .maybeSingle(),
  ]);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Community surveillance"
        titleMy="ရောဂါနှင့် ကျန်းမာရေး အစီရင်ခံချက်"
        titleEn="Disease & Health reports"
        ledeMy="သင်တွေ့မြင်ရသည့် ကျန်းမာရေး အခြေအနေများကို အစီရင်ခံပါ။ ဒေသဆိုင်ရာ စောင့်ကြည့်လေ့လာရေးအတွက် အသုံးဝင်ပါသည်။"
        ledeEn="Report health conditions you observe. Useful for community-level disease surveillance."
      />
      <ReportsView
        diseaseTypes={diseaseTypesRes.data ?? []}
        symptomOptions={symptomOptionsRes.data ?? []}
        defaults={{
          fullName: profileRes.data?.full_name ?? "",
          phone: profileRes.data?.phone ?? "",
        }}
      />
    </PageContainer>
  );
}
