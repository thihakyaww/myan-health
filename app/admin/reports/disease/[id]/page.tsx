import { PageHeader } from "@/components/admin/admin-header";
import { ReportDetail, ReportBackLink } from "@/components/admin/report-detail";

export const dynamic = "force-dynamic";

export default async function DiseaseReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <>
      <ReportBackLink kind="disease" />
      <PageHeader eyebrow="Disease report" titleMy="အစီရင်ခံချက် သုံးသပ်ခြင်း" titleEn="Review report" />
      <ReportDetail kind="disease" id={id} />
    </>
  );
}
