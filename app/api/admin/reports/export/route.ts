import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const COLUMNS = [
  "ID", "Report Type", "Reporter", "Phone", "Region", "City", "Township",
  "Disease/Health Type", "Severity", "Description", "Latitude", "Longitude",
  "Formatted Address", "Status", "Created At", "Reviewed At",
];

function csvField(v: unknown): string {
  if (v == null) return "";
  const s = String(v);
  // Quote when the value contains quotes, commas, or newlines (RFC 4180)
  if (/[",\n\r]/.test(s)) return `"${s.replaceAll('"', '""')}"`;
  return s;
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Admin-only (PRD §10)
  if (!user) return new NextResponse("Unauthorized", { status: 401 });
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "ADMIN") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const sp = request.nextUrl.searchParams;
  const type = sp.get("type") === "health" ? "health" : "disease";
  const table = type === "health" ? "health_reports" : "disease_reports";

  const diseaseSelect: string =
    "id, created_at, reviewed_at, status, reporter_name, reporter_phone, formatted_address, latitude, longitude, description, severity, disease_type_id, region_id, city_id, township_id";
  const healthSelect: string =
    "id, created_at, reviewed_at, status, reporter_name, reporter_phone, formatted_address, latitude, longitude, description, report_type, region_id, city_id, township_id";
  let query = supabase
    .from(table)
    .select(type === "disease" ? diseaseSelect : healthSelect);

  const status = sp.get("status") ?? "";
  if (["SUBMITTED", "UNDER_REVIEW", "VERIFIED", "REJECTED"].includes(status))
    query = query.eq("status", status);
  const regionId = sp.get("region_id") ?? "";
  if (regionId) query = query.eq("region_id", regionId);
  const dateFrom = sp.get("date_from") ?? "";
  if (dateFrom) query = query.gte("created_at", `${dateFrom}T00:00:00Z`);
  const dateTo = sp.get("date_to") ?? "";
  if (dateTo) query = query.lte("created_at", `${dateTo}T23:59:59Z`);

  const [rowsRes, regionsRes, citiesRes, townshipsRes, typesRes] = await Promise.all([
    query.order("created_at", { ascending: false }),
    supabase.from("regions").select("id, name_en"),
    supabase.from("cities").select("id, name_en"),
    supabase.from("townships").select("id, name_en"),
    supabase.from("disease_types").select("id, name_en"),
  ]);
  if (rowsRes.error) return new NextResponse(rowsRes.error.message, { status: 500 });
  const rows = rowsRes.data;

  const regionName = new Map((regionsRes.data ?? []).map((x) => [x.id, x.name_en]));
  const cityName = new Map((citiesRes.data ?? []).map((x) => [x.id, x.name_en]));
  const townshipName = new Map((townshipsRes.data ?? []).map((x) => [x.id, x.name_en]));
  const typeName = new Map((typesRes.data ?? []).map((x) => [x.id, x.name_en]));

  const lines = [COLUMNS.join(",")];
  for (const raw of rows ?? []) {
    const r = raw as unknown as Record<string, unknown>;
    const one = (
      m: Map<string, string>,
      idv: unknown
    ) => (typeof idv === "string" ? (m.get(idv) ?? "") : "");
    lines.push(
      [
        r.id,
        type === "disease" ? "Disease Report" : "Health Report",
        r.reporter_name,
        r.reporter_phone,
        one(regionName, r.region_id),
        one(cityName, r.city_id),
        one(townshipName, r.township_id),
        type === "disease"
          ? one(typeName, r.disease_type_id)
          : String(r.report_type ?? "").toLowerCase().replace(/_/g, " "),
        type === "disease" ? r.severity : "",
        r.description,
        r.latitude,
        r.longitude,
        r.formatted_address,
        r.status,
        r.created_at,
        r.reviewed_at,
      ]
        .map(csvField)
        .join(",")
    );
  }

  // UTF-8 BOM so Burmese text opens correctly in Excel (PRD §10)
  const body = "\uFEFF" + lines.join("\r\n");
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="myanhealth-${type}-reports.csv"`,
    },
  });
}
