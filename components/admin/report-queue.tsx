import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Badge, pillTone } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/date";

export type ReportKind = "disease" | "health";

const STATUSES = ["SUBMITTED", "UNDER_REVIEW", "VERIFIED", "REJECTED"] as const;

/**
 * Server-rendered admin queue for one report type.
 * Plain-column query + JS join (the typed parser rejects dynamic-table embeds).
 */
export async function ReportQueue({
  kind,
  searchParams,
}: {
  kind: ReportKind;
  searchParams: Record<string, string | undefined>;
}) {
  const status = searchParams.status ?? "";
  const regionId = searchParams.region_id ?? "";
  const dateFrom = searchParams.date_from ?? "";
  const dateTo = searchParams.date_to ?? "";

  const supabase = await createClient();
  const table = kind === "disease" ? "disease_reports" : "health_reports";

  // Type-specific columns must match each table exactly — a wrong column makes
  // PostgREST return 42703 and (previously) the queue silently showed empty.
  const diseaseSelect: string =
    "id, created_at, status, reporter_name, formatted_address, severity, disease_type_id, region_id, city_id, township_id";
  const healthSelect: string =
    "id, created_at, status, reporter_name, formatted_address, report_type, region_id, city_id, township_id";

  let query = supabase
    .from(table)
    .select(kind === "disease" ? diseaseSelect : healthSelect);

  if ((STATUSES as readonly string[]).includes(status)) query = query.eq("status", status);
  if (regionId) query = query.eq("region_id", regionId);
  if (dateFrom) query = query.gte("created_at", `${dateFrom}T00:00:00Z`);
  if (dateTo) query = query.lte("created_at", `${dateTo}T23:59:59Z`);

  const [rowsRes, regionsRes, citiesRes, townshipsRes, typesRes] = await Promise.all([
    query.order("created_at", { ascending: false }).limit(200),
    supabase.from("regions").select("id, name_en").order("name_en"),
    supabase.from("cities").select("id, name_en"),
    supabase.from("townships").select("id, name_en"),
    supabase.from("disease_types").select("id, name_en"),
  ]);

  if (rowsRes.error)
    console.error("[ReportQueue] fetch failed:", rowsRes.error.message);
  const rows = ((rowsRes.data ?? []) as unknown) as Record<string, unknown>[];
  const regionName = new Map((regionsRes.data ?? []).map((r) => [r.id, r.name_en]));
  const cityName = new Map((citiesRes.data ?? []).map((c) => [c.id, c.name_en]));
  const townshipName = new Map((townshipsRes.data ?? []).map((t) => [t.id, t.name_en]));
  const typeName = new Map((typesRes.data ?? []).map((t) => [t.id, t.name_en]));

  return (
    <>
      {/* Filter bar */}
      <form className="mb-5 flex flex-wrap items-end gap-2" action={`/admin/reports/${kind}`}>
        <label className="space-y-1">
          <span className="block text-xs font-semibold text-muted-foreground">Status</span>
          <select
            name="status"
            defaultValue={status}
            className="rounded-[var(--radius)] border border-line bg-card px-3 py-2 text-sm"
          >
            <option value="">All</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ").toLowerCase()}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className="block text-xs font-semibold text-muted-foreground">Region</span>
          <select
            name="region_id"
            defaultValue={regionId}
            className="rounded-[var(--radius)] border border-line bg-card px-3 py-2 text-sm"
          >
            <option value="">All</option>
            {(regionsRes.data ?? []).map((r) => (
              <option key={r.id} value={r.id}>
                {r.name_en}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className="block text-xs font-semibold text-muted-foreground">From</span>
          <input
            type="date"
            name="date_from"
            defaultValue={dateFrom}
            className="rounded-[var(--radius)] border border-line bg-card px-3 py-2 text-sm"
          />
        </label>
        <label className="space-y-1">
          <span className="block text-xs font-semibold text-muted-foreground">To</span>
          <input
            type="date"
            name="date_to"
            defaultValue={dateTo}
            className="rounded-[var(--radius)] border border-line bg-card px-3 py-2 text-sm"
          />
        </label>
        <button className="rounded-[var(--radius)] bg-paper-deep px-4 py-2 text-sm font-semibold hover:bg-moss">
          Apply
        </button>
        {/* CSV export respects these exact filters (PRD §10) */}
        <a
          href={`/api/admin/reports/export?type=${kind}&status=${status}&region_id=${regionId}&date_from=${dateFrom}&date_to=${dateTo}`}
          className="ml-auto rounded-[var(--radius)] bg-sky px-4 py-2 text-sm font-semibold text-teal-dark hover:bg-sky/70"
        >
          ⬇ Export CSV
        </a>
      </form>

      <div className="space-y-2.5">
        {rows.map((r) => {
          const place = [
            r.township_id ? townshipName.get(r.township_id) : null,
            r.city_id ? cityName.get(r.city_id) : null,
          ]
            .filter(Boolean)
            .join(" · ");
          return (
            <Card key={r.id as string} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={pillTone[r.status as string] ?? "neutral"} dot>
                    {String(r.status).toLowerCase().replace(/_/g, " ")}
                  </Badge>
                  {kind === "disease" && typeof r.disease_type_id === "string" && (
                    <Badge>{typeName.get(r.disease_type_id as string) ?? "Unknown"}</Badge>
                  )}
                  {kind === "health" && typeof r.report_type === "string" && (
                    <Badge>{String(r.report_type).toLowerCase().replace(/_/g, " ")}</Badge>
                  )}
                  {kind === "disease" && r.severity != null && (
                    <Badge tone={pillTone[r.severity as string] ?? "neutral"}>
                      {String(r.severity).toLowerCase()}
                    </Badge>
                  )}
                </div>
                <p className="mt-1.5 truncate text-sm font-semibold">
                  {r.reporter_name as string}
                </p>
                <p className="truncate text-xs text-muted">
                  {place || (r.formatted_address as string) || "—"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <time className="text-xs text-muted-foreground">
                  {formatDate(r.created_at as string, "en")}
                </time>
                <Link
                  href={`/admin/reports/${kind}/${r.id as string}`}
                  className="rounded-[var(--radius)] bg-sky px-3 py-1.5 text-xs font-semibold text-teal-dark hover:bg-sky/70"
                >
                  Review
                </Link>
              </div>
            </Card>
          );
        })}
        {rows.length === 0 && (
          <p className="py-12 text-center text-muted">No reports match these filters.</p>
        )}
      </div>
    </>
  );
}
