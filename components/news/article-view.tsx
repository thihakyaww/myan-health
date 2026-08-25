"use client";

import { usePreferences } from "@/lib/i18n/preferences";
import { formatDate } from "@/lib/utils/date";
import { mmLineHeight } from "@/components/ui/card";
import { Badge, pillTone } from "@/components/ui/badge";
import { ArticleMedia } from "./article-card";
import { MarkdownLite } from "@/components/markdown-lite";
import { ArticleActions } from "./article-actions";

export interface ArticleDetail {
  id: string;
  slug: string;
  title_mm: string;
  title_en: string | null;
  body_mm: string;
  body_en: string | null;
  cover_image_url?: string | null;
  category: string | null;
  tags: string[];
  published_at: string | null;
}

const fmtDate = formatDate;

export function ArticleView({
  article,
  likeCount,
  initiallyLiked,
  initiallySaved,
  isLoggedIn,
}: {
  article: ArticleDetail;
  likeCount: number;
  initiallyLiked: boolean;
  initiallySaved: boolean;
  isLoggedIn: boolean;
}) {
  const { lang } = usePreferences();
  const title = lang === "en" && article.title_en ? article.title_en : article.title_mm;
  const body = lang === "en" && article.body_en ? article.body_en : article.body_mm;

  return (
    <article className="mx-auto max-w-3xl overflow-hidden rounded-[var(--radius)] border border-line bg-card shadow-[var(--shadow)]">
      {/* Hero media */}
      <ArticleMedia imageUrl={article.cover_image_url ?? null} category={article.category} compact />

      {/* Header block */}
      <header className="px-6 pt-8 md:px-12">
        <p className="eyebrow text-teal-dark/70">MyanHealth Blog</p>
        <h1
          className={`mt-3 font-bold tracking-tight text-ink ${
            lang === "my" ? `text-2xl md:text-[1.7rem] ${mmLineHeight}` : "font-serif text-3xl md:text-4xl"
          }`}
        >
          {title}
        </h1>
        {lang === "en" && article.title_en && article.title_mm !== article.title_en && (
          <p className={`mt-2 text-lg text-muted ${mmLineHeight}`}>{article.title_mm}</p>
        )}
        <div className="mt-5 flex flex-wrap items-center gap-3 border-b border-line pb-5">
          <time className="text-sm text-muted-foreground">{fmtDate(article.published_at, lang)}</time>
          {article.category && (
            <Badge tone={pillTone[article.category] ?? "teal"} dot>
              {article.category.replace(/_/g, " ").toLowerCase()}
            </Badge>
          )}
          {/* Like / Save / Share (§8) */}
          <div className="ml-auto">
            <ArticleActions
              articleId={article.id}
              slug={article.slug}
              title={title}
              likeCount={likeCount}
              initiallyLiked={initiallyLiked}
              initiallySaved={initiallySaved}
              isLoggedIn={isLoggedIn}
            />
          </div>
        </div>
      </header>

      {/* Body — generous reading rhythm */}
      <div
        className={`px-6 py-8 text-ink/90 md:px-12 ${
          lang === "my" ? "[&>div]:text-[1.02rem] [&>div]:leading-loose" : ""
        }`}
      >
        <MarkdownLite text={body} />
      </div>

      {/* Tags */}
      {article.tags.length > 0 && (
        <footer className="flex flex-wrap gap-2 border-t border-line px-6 py-5 md:px-12">
          {article.tags.map((tg) => (
            <Badge key={tg}>#{tg}</Badge>
          ))}
        </footer>
      )}
    </article>
  );
}
