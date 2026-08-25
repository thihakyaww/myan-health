import { createClient } from "@/lib/supabase/server";
import { FacilitiesTable } from "@/components/admin/facilities-table";

export const dynamic = "force-dynamic";

export default async function AdminFacilitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const { q, type } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("facilities")
    .select(
      `id, name_mm, name_en, facility_type, is_24_7,
       regions!region_id ( name_en )`
    )
    .order("facility_type")
    .order("name_en")
    .limit(200);
  if (q) query = query.or(`name_mm.ilike.%${q}%,name_en.ilike.%${q}%`);
  if (
    type === "PUBLIC_HOSPITAL" ||
    type === "PRIVATE_HOSPITAL" ||
    type === "HEALTH_CENTER" ||
    type === "RED_CROSS_TEAM"
  )
    query = query.eq("facility_type", type);

  const { data } = await query;

  const facilities = (data ?? []).map((f) => {
    type Row = {
      id: string;
      name_mm: string | null;
      name_en: string;
      facility_type: string;
      is_24_7: boolean;
      regions: { name_en: string } | null;
    };
    const r = f as unknown as Row;
    return {
      id: r.id,
      name_mm: r.name_mm,
      name_en: r.name_en,
      facility_type: r.facility_type,
      is_24_7: r.is_24_7,
      region_name: r.regions?.name_en ?? null,
    };
  });

  return (
    <FacilitiesTable
      key={`${q}-${type}`}
      facilities={facilities}
      q={q}
      type={type}
    />
  );
}
