import { PageHeader } from "@/components/admin/admin-header";
import { ReportQueue } from "@/components/admin/report-queue";

export const dynamic = "force-dynamic";

export default async function AdminDiseaseReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  return (
    <>
      <PageHeader
        eyebrow="Surveillance"
        titleMy="ရောဂါ အစီရင်ခံချက် စီမံခန့်ခွဲမှု"
        titleEn="Disease reports"
      />
      <ReportQueue kind="disease" searchParams={sp} />
    </>
  );
}
