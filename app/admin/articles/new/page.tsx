import { PageHeader, BackLink } from "@/components/admin/admin-header";
import { ArticleForm } from "../article-form";

export const dynamic = "force-dynamic";

export default function NewArticlePage() {
  return (
    <>
      <BackLink href="/admin/articles" label="Articles" />
      <PageHeader eyebrow="Content" titleMy="သတင်း အသစ်ရေးရန်" titleEn="New article" />
      <ArticleForm />
    </>
  );
}
