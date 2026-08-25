import { createClient } from "@/lib/supabase/server";
import { FacilityDirectory } from "@/components/healthcare/facility-directory";
import { PageContainer, PageHeader } from "@/components/layout/page-header";

export const metadata = {
  title: "Healthcare Facilities & Teams",
  description:
    "Public & private hospitals, health centers and Red Cross teams in Myanmar",
};

export const dynamic = "force-dynamic";

export default async function HealthcarePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("facilities")
    .select(
      `id, name_mm, name_en, facility_type, description_mm, description_en, is_24_7,
       cities ( name_en, name_mm ),
       townships ( name_en, name_mm )`
    )
    .order("facility_type")
    .order("name_en");

  const facilities: (import("@/components/healthcare/facility-directory").FacilityListItem)[] =
    (data ?? []).map((f) => {
      type Row = {
        id: string;
        name_mm: string;
        name_en: string;
        facility_type: import("@/lib/types").FacilityType;
        description_mm: string | null;
        description_en: string | null;
        is_24_7: boolean;
        cities: { name_en: string; name_mm: string | null }[] | null;
        townships: { name_en: string; name_mm: string | null }[] | null;
      };
      const r = f as unknown as Row;
      return {
        id: r.id,
        name_mm: r.name_mm,
        name_en: r.name_en,
        facility_type: r.facility_type,
        description_mm: r.description_mm,
        description_en: r.description_en,
        is_24_7: r.is_24_7,
        city_name_en: r.cities?.[0]?.name_en ?? null,
        city_name_mm: r.cities?.[0]?.name_mm ?? null,
        township_name_en: r.townships?.[0]?.name_en ?? null,
        township_name_mm: r.townships?.[0]?.name_mm ?? null,
      };
    });

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Directory"
        titleMy="ကျန်းမာရေး ဝန်ဆောင်မှု လမ်းညွှန်"
        titleEn="Healthcare Facilities & Teams"
        ledeMy="အစိုးရဆေးရုံ · ပုဂ္ဂလိကဆေးရုံ · ကျန်းမာရေးဌာန · ကြက်ခြေနီအဖွဲ့များ — ဒေတာများကို အရင်းအမြစ်နှင့်တကွ ဖော်ပြထားပါသည်။"
        ledeEn="Government hospitals, private hospitals, health centers and Red Cross teams — data sourced and verified."
      />
      <FacilityDirectory facilities={facilities} />
    </PageContainer>
  );
}
