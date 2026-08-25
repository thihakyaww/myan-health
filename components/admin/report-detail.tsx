import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardBody, mmLineHeight } from "@/components/ui/card";
import { Badge, pillTone } from "@/components/ui/badge";
import { MapView } from "@/components/maps/map-view";
import { StatusChanger } from "@/components/admin/status-changer";
import { formatDate } from "@/lib/utils/date";
import type { ReportKind } from "./report-queue";

export async function ReportDetail({
  kind,
  id,
}: {
  kind: ReportKind;
  id: string;
}) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const supabase = await createClient();
  const table = kind === "disease" ? "disease_reports" : "health_reports";
  // Type-specific columns must match each table exactly
  const diseaseSelect: string =
    "id, created_at, reviewed_at, reviewed_by, status, reporter_name, reporter_phone, formatted_address, latitude, longitude, description, severity, symptoms, onset_date, disease_type_id, region_id, city_id, township_id";
  const healthSelect: string =
    "id, created_at, reviewed_at, reviewed_by, status, reporter_name, reporter_phone, formatted_address, latitude, longitude, description, report_type, region_id, city_id, township_id";
  const { data } = await supabase
    .from(table)
    .select(kind === "disease" ? diseaseSelect : healthSelect)
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();
  const row = data as unknown as Record<string, unknown>;

  // Dictionary lookups instead of embeds (typed parser limitation)
  const [dt, region, city, township] = await Promise.all([
    row.disease_type_id
      ? supabase.from("disease_types").select("name_en, name_mm").eq("id", row.disease_type_id).maybeSingle()
      : Promise.resolve({ data: null }),
    row.region_id
      ? supabase.from("regions").select("name_en").eq("id", row.region_id).maybeSingle()
      : Promise.resolve({ data: null }),
    row.city_id
      ? supabase.from("cities").select("name_en").eq("id", row.city_id).maybeSingle()
      : Promise.resolve({ data: null }),
    row.township_id
      ? supabase.from("townships").select("name_en").eq("id", row.township_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);
  const diseaseName = (dt.data as { name_en?: string; name_mm?: string } | null) ?? null;
  const regionName = (region.data as { name_en?: string } | null)?.name_en;
  const cityName = (city.data as { name_en?: string } | null)?.name_en;
  const townshipName = (township.data as { name_en?: string } | null)?.name_en;

  // Look up symptom names from symptom_options
  const symptomIds = Array.isArray(row.symptoms) ? (row.symptoms as string[]) : [];
  let symptomNames: string[] = [];
  if (symptomIds.length > 0) {
    const { data: symptomRows } = await supabase
      .from("symptom_options")
      .select("id, name_en")
      .in("id", symptomIds);
    const symptomMap = new Map((symptomRows ?? []).map((s: { id: string; name_en: string }) => [s.id, s.name_en]));
    symptomNames = symptomIds.map((id) => symptomMap.get(id) ?? id);
  }

  const reviewerId = row.reviewed_by as string | null;
  const { data: reviewer } = reviewerId
    ? await supabase.from("profiles").select("full_name").eq("id", reviewerId).maybeSingle()
    : { data: null };


  const lat = row.latitude != null ? Number(row.latitude) : null;
  const lng = row.longitude != null ? Number(row.longitude) : null;

  function Row({ label, children }: { label: string; children: React.ReactNode }) {
    return (
      <div className="flex flex-wrap gap-x-4 py-2.5">
        <span className="w-32 shrink-0 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className={`min-w-0 flex-1 text-sm ${mmLineHeight}`}>{children || "—"}</span>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardBody className="p-6 md:p-8">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Badge tone={pillTone[row.status as string] ?? "neutral"} dot>
            {String(row.status).toLowerCase().replace(/_/g, " ")}
          </Badge>
          {kind === "disease" && (
            <>
              <Badge>{diseaseName?.name_en ?? "—"}</Badge>
              {row.severity != null && (
                <Badge tone={pillTone[row.severity as string] ?? "neutral"}>
                  {String(row.severity).toLowerCase()}
                </Badge>
              )}
            </>
          )}
          {kind === "health" && (
            <Badge>{String(row.report_type).toLowerCase().replace(/_/g, " ")}</Badge>
          )}
        </div>

        <div className="divide-y divide-line">
          <Row label="Reporter">{row.reporter_name as string}</Row>
          <Row label="Phone">{row.reporter_phone as string}</Row>
          <Row label="Location">
            {[townshipName, cityName, regionName].filter(Boolean).join(" · ") || "—"}
          </Row>
          {kind === "disease" && (
            <Row label="Symptoms">
              {symptomNames.length > 0
                ? symptomNames.join(", ")
                : "—"}
            </Row>
          )}
          {kind === "disease" && <Row label="Onset">{row.onset_date as string}</Row>}
          <Row label="Address">{(row.formatted_address as string) ?? ""}</Row>
          <Row label="Coordinates">
            {lat != null && lng != null
              ? `${lat.toFixed(6)}, ${lng.toFixed(6)}`
              : "not provided"}
          </Row>
          <Row label="Description">
            <span className={mmLineHeight}>{row.description as string}</span>
          </Row>
          <Row label="Submitted">{formatDate(row.created_at as string, "en")}</Row>
          <Row label="Review">
            {reviewer?.full_name
              ? `${reviewer.full_name} · ${formatDate(row.reviewed_at as string, "en")}`
              : "Not reviewed yet"}
          </Row>
        </div>

        <div className="mt-6 border-t border-line pt-5">
          <StatusChanger
            table={table}
            id={id}
            status={row.status as string}
            reviewedBy={reviewerId}
          />
        </div>
      </CardBody>

      {/* Map view per report — PRD §10 */}
      <div className="border-t border-line bg-sky/25 p-6 md:p-8">
        <h2 className="eyebrow mb-3 text-teal-dark/70">Report location</h2>
        {lat != null && lng != null ? (
          <MapView latitude={lat} longitude={lng} label="Report location" className="h-72 rounded-[var(--radius)] border border-line" />
        ) : (
          <p className="rounded-[var(--radius)] border border-dashed border-line bg-card/60 p-6 text-center text-sm text-muted">
            No coordinates captured for this report.
          </p>
        )}
      </div>
    </Card>
  );
}

export function ReportBackLink({ kind }: { kind: ReportKind }) {
  return (
    <Link href={`/admin/reports/${kind}`} className="mb-1 inline-block text-sm font-semibold text-teal hover:underline">
      ← Back to {kind} reports
    </Link>
  );
}
