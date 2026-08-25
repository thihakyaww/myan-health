import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/admin-header";
import { StatCard, BarChart } from "@/components/admin/widgets";

export const dynamic = "force-dynamic";

async function count(supabase: Awaited<ReturnType<typeof createClient>>, table: string, filters: Record<string, string> = {}) {
  let q = supabase.from(table).select("id", { count: "exact", head: true });
  for (const [k, v] of Object.entries(filters)) q = q.eq(k, v);
  const { count } = await q;
  return count ?? 0;
}

function tally(rows: string[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const r of rows) m.set(r, (m.get(r) ?? 0) + 1);
  return m;
}

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  // Parallel counts (async-parallel)
  const [users, articles, facilities, dReports, hReports, pendingD, pendingH, totalLikes, totalBookmarks] =
    await Promise.all([
      count(supabase, "profiles"),
      count(supabase, "articles"),
      count(supabase, "facilities"),
      count(supabase, "disease_reports"),
      count(supabase, "health_reports"),
      count(supabase, "disease_reports", { status: "SUBMITTED" }),
      count(supabase, "health_reports", { status: "SUBMITTED" }),
      count(supabase, "article_likes"),
      count(supabase, "article_bookmarks"),
    ]);

  // Chart aggregates — fetch slim columns and tally in JS (MVP scale)
  const [dRows, hRows, dtRows, regionRows] = await Promise.all([
    supabase.from("disease_reports").select("status, disease_type_id"),
    supabase.from("health_reports").select("status, report_type"),
    supabase.from("disease_types").select("id, name_en"),
    supabase.from("regions").select("id, name_en"),
  ]);

  const statusTally = tally([
    ...(dRows.data ?? []).map((r) => r.status as string),
    ...(hRows.data ?? []).map((r) => r.status as string),
  ]);
  const diseaseTypeTally = tally(
    (dRows.data ?? []).map((r) => r.disease_type_id as string)
  );
  const healthTypeTally = tally(
    (hRows.data ?? []).map((r) => r.report_type as string)
  );

  // Region rollup straight from reports' region_id
  const { data: dRegionIds } = await supabase
    .from("disease_reports")
    .select("region_id");
  const { data: hRegionIds } = await supabase
    .from("health_reports")
    .select("region_id");
  const regionCount = new Map<string, number>();
  for (const r of [...(dRegionIds ?? []), ...(hRegionIds ?? [])]) {
    const id = (r as { region_id: string | null }).region_id;
    if (id) regionCount.set(id, (regionCount.get(id) ?? 0) + 1);
  }

  const dtName = new Map((dtRows.data ?? []).map((d) => [d.id, d.name_en]));
  const regionName = new Map((regionRows.data ?? []).map((r) => [r.id, r.name_en]));

  // Top articles by engagement
  const { data: engagementRows } = await supabase
    .from("article_public_stats")
    .select("article_id, like_count, bookmark_count")
    .order("like_count", { ascending: false })
    .limit(5);
  const topArticleIds = (engagementRows ?? []).map((r) => r.article_id);
  const { data: topArticles } = topArticleIds.length
    ? await supabase.from("articles").select("id, title_en, title_mm").in("id", topArticleIds)
    : { data: [] };
  const titleMap = new Map((topArticles ?? []).map((a) => [a.id, { en: a.title_en, mm: a.title_mm }]));
  const engagementData = (engagementRows ?? [])
    .map((r) => ({
      label: (titleMap.get(r.article_id)?.en ?? "Untitled").slice(0, 30),
      value: (r.like_count ?? 0) + (r.bookmark_count ?? 0),
    }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);

  return (
    <>
      <PageHeader eyebrow="Admin" titleMy="စီမံခန့်ခွဲမှု ဒက်ရ်ဗိုးဒ်" titleEn="Dashboard overview" />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total users" value={users} href="/admin/users" />
        <StatCard label="Articles" value={articles} accent="moss" href="/admin/articles" />
        <StatCard label="Facilities" value={facilities} accent="moss" href="/admin/facilities" />
        <StatCard label="Disease reports" value={dReports} accent="severe" href="/admin/reports/disease" />
        <StatCard label="Health reports" value={hReports} accent="teal" href="/admin/reports/health" />
        <StatCard label="Pending review" value={pendingD + pendingH} accent="saffron" href="/admin/notifications" />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total likes" value={totalLikes} accent="severe" />
        <StatCard label="Total saves" value={totalBookmarks} accent="teal" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <BarChart
          title="Reports by status"
          data={["SUBMITTED", "UNDER_REVIEW", "VERIFIED", "REJECTED"].map((s) => ({
            label: s.replace(/_/g, " ").toLowerCase(),
            value: statusTally.get(s) ?? 0,
          }))}
        />
        <BarChart
          title="Disease reports by type"
          data={(dRows.data ? Object.keys(diseaseTypeTally) : []).length === 0
            ? []
            : [...diseaseTypeTally.entries()]
                .map(([id, v]) => ({ label: dtName.get(id) ?? "Unknown", value: v }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 7)}
        />
        <BarChart
          title="Health reports by type"
          data={[...healthTypeTally.entries()]
            .map(([t, v]) => ({ label: t.toLowerCase().replace(/_/g, " "), value: v }))
            .sort((a, b) => b.value - a.value)}
        />
        <BarChart
          title="All reports by region"
          data={[...regionCount.entries()]
            .map(([id, v]) => ({ label: regionName.get(id) ?? "Unknown", value: v }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 8)}
        />
        <BarChart
          title="Top articles by engagement"
          data={engagementData}
        />
      </div>
    </>
  );
}
