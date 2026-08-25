import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ArticleView } from "@/components/news/article-view";
import { BackLink, PageContainer } from "@/components/layout/page-header";

export const dynamic = "force-dynamic";

async function getArticle(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("articles")
    .select(
      "id, slug, title_mm, title_en, body_mm, body_en, cover_image_url, category, tags, published_at"
    )
    .eq("slug", slug)
    .eq("status", "PUBLISHED")
    .maybeSingle();
  return data;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: "Not found" };
  return {
    title: article.title_en ?? article.title_mm,
    description: (article.body_en ?? article.body_mm).slice(0, 150),
  };
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Aggregate counts (public view) + current user's own interaction state
  const [{ data: stats }, likedRes, savedRes] = await Promise.all([
    supabase
      .from("article_public_stats")
      .select("like_count, bookmark_count")
      .eq("article_id", article.id)
      .maybeSingle(),
    user
      ? supabase
          .from("article_likes")
          .select("user_id")
          .eq("article_id", article.id)
          .eq("user_id", user.id)
          .maybeSingle()
      : Promise.resolve({ data: null } as { data: unknown }),
    user
      ? supabase
          .from("article_bookmarks")
          .select("user_id")
          .eq("article_id", article.id)
          .eq("user_id", user.id)
          .maybeSingle()
      : Promise.resolve({ data: null } as { data: unknown }),
  ]);

  const statsRow = (stats ?? null) as { like_count?: number; bookmark_count?: number } | null;

  return (
    <PageContainer>
      <BackLink href="/news" label="News" />
      <ArticleView
        article={article}
        likeCount={statsRow?.like_count ?? 0}
        initiallyLiked={!!likedRes?.data}
        initiallySaved={!!savedRes?.data}
        isLoggedIn={!!user}
      />
    </PageContainer>
  );
}
