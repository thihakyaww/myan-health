import { PageHeader, BackLink } from "@/components/admin/admin-header";
import { FacilityForm } from "../facility-form";

export const dynamic = "force-dynamic";

export default function NewFacilityPage() {
  return (
    <>
      <BackLink href="/admin/facilities" label="Facilities" />
      <PageHeader eyebrow="Directory" titleMy="ဆေးရုံ အသစ်ထည့်ရန်" titleEn="New facility" />
      <FacilityForm />
    </>
  );
}
