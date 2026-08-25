import { PageHeader } from "@/components/admin/admin-header";
import { ReportQueue } from "@/components/admin/report-queue";

export const dynamic = "force-dynamic";

export default async function AdminHealthReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  return (
    <>
      <PageHeader
        eyebrow="Community watch"
        titleMy="ကျန်းမာရေး အစီရင်ခံချက် စီမံခန့်ခွဲမှု"
        titleEn="Health reports"
      />
      <ReportQueue kind="health" searchParams={sp} />
    </>
  );
}
