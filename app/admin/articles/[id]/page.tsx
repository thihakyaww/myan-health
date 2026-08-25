import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, BackLink } from "@/components/admin/admin-header";
import { ArticleForm } from "../article-form";

export const dynamic = "force-dynamic";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const supabase = await createClient();
  const { data: a } = await supabase.from("articles").select("*").eq("id", id).maybeSingle();
  if (!a) notFound();

  return (
    <>
      <BackLink href="/admin/articles" label="Articles" />
      <PageHeader eyebrow="Content" titleMy="သတင်း ပြင်ဆင်ခြင်း" titleEn={a.title_en || a.title_mm} />
      <ArticleForm
        initial={{
          id: a.id,
          title_mm: a.title_mm,
          title_en: a.title_en ?? "",
          slug: a.slug,
          body_mm: a.body_mm,
          body_en: a.body_en ?? "",
          cover_image_url: a.cover_image_url,
          category: a.category ?? "",
          tags: (a.tags ?? []).join(", "),
          status: a.status,
        }}
      />
    </>
  );
}
