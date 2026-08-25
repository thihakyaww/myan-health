import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, BackLink } from "@/components/admin/admin-header";
import { FacilityForm } from "../facility-form";

export const dynamic = "force-dynamic";

export default async function EditFacilityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const supabase = await createClient();
  const { data: f } = await supabase.from("facilities").select("*").eq("id", id).maybeSingle();
  if (!f) notFound();

  return (
    <>
      <BackLink href="/admin/facilities" label="Facilities" />
      <PageHeader eyebrow="Directory" titleMy="ဆေးရုံ ပြင်ဆင်ခြင်း" titleEn={f.name_en} />
      <FacilityForm
        initial={{
          id: f.id,
          name_mm: f.name_mm,
          name_en: f.name_en,
          facility_type: f.facility_type,
          organization: f.organization ?? "GOVERNMENT",
          address: f.address ?? "",
          formatted_address: f.formatted_address ?? "",
          phone: f.phone ?? "",
          description_mm: f.description_mm ?? "",
          description_en: f.description_en ?? "",
          opening_hours: f.opening_hours ?? "",
          is_24_7: f.is_24_7,
          services: (f.services ?? []).join(", "),
          latitude: f.latitude != null ? Number(f.latitude) : null,
          longitude: f.longitude != null ? Number(f.longitude) : null,
          region_id: f.region_id ?? "",
          city_id: f.city_id ?? "",
          township_id: f.township_id ?? "",
          image_url: f.image_url,
          source_url: f.source_url ?? "",
          confidence: f.confidence ?? "",
        }}
      />
    </>
  );
}
