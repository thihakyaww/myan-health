import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FacilityView } from "@/components/healthcare/facility-view";
import { BackLink, PageContainer } from "@/components/layout/page-header";

export const dynamic = "force-dynamic";

async function getFacility(id: string) {
  // uuid guard — avoids Postgres 22P02 on garbage ids
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("facilities")
    .select(
      `id, name_mm, name_en, facility_type, organization, address, formatted_address,
       phone, description_mm, description_en, opening_hours, is_24_7, services,
       latitude, longitude, source_url, confidence`
    )
    .eq("id", id)
    .maybeSingle();
  return data;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const f = await getFacility(id);
  if (!f) return { title: "Not found" };
  return { title: f.name_en };
}

export default async function FacilityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const f = await getFacility(id);
  if (!f) notFound();

  return (
    <PageContainer>
      <BackLink href="/healthcare" label="Directory" />
      <FacilityView f={f} />
    </PageContainer>
  );
}
