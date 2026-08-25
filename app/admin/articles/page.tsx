import { createClient } from "@/lib/supabase/server";
import { ArticlesTable } from "@/components/admin/articles-table";

export const dynamic = "force-dynamic";

export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; category?: string }>;
}) {
  const { q, status, category } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("articles")
    .select("id, title_mm, title_en, slug, category, status, published_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (q) query = query.or(`title_mm.ilike.%${q}%,title_en.ilike.%${q}%`);
  if (status === "DRAFT" || status === "PUBLISHED") query = query.eq("status", status);
  if (category) query = query.eq("category", category);

  const { data: articles } = await query;

  return (
    <ArticlesTable
      key={`${q}-${status}-${category}`}
      articles={articles ?? []}
      q={q}
      status={status}
      category={category}
    />
  );
}
