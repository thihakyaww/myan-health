"use client";

import Link from "next/link";
import { usePreferences } from "@/lib/i18n/preferences";
import { formatDate } from "@/lib/utils/date";
import { Card, mmLineHeight } from "@/components/ui/card";
import { Badge, pillTone } from "@/components/ui/badge";
import { NewsIcon } from "@/components/icons";

export interface ArticleListItem {
  id: string;
  slug: string;
  title_mm: string;
  title_en: string | null;
  body_mm: string;
  body_en: string | null;
  cover_image_url: string | null;
  category: string | null;
  tags: string[];
  published_at: string | null;
}

function excerpt(s: string, n = 130) {
  const flat = s.replace(/[*#]/g, "").replace(/\s+/g, " ").trim();
  return flat.length > n ? flat.slice(0, n) + "…" : flat;
}

const fmtDate = formatDate;

/** Unified media block: real cover when present, quiet editorial placeholder when not. */
export function ArticleMedia({
  imageUrl,
  category,
  compact = false,
}: {
  imageUrl: string | null;
  category: string | null;
  compact?: boolean;
}) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt=""
        className={`w-full bg-sky object-cover ${compact ? "aspect-[16/6]" : "aspect-[16/8]"}`}
      />
    );
  }
  return (
    <div
      aria-hidden
      className={`relative flex w-full items-center justify-center bg-gradient-to-br from-sky via-sky to-moss ${
        compact ? "aspect-[16/6]" : "aspect-[16/8]"
      }`}
    >
      <NewsIcon width={compact ? 34 : 44} height={compact ? 34 : 44} className="text-teal-dark/30" />
      {category && (
        <span className="absolute bottom-3 left-3">
          <Badge tone={pillTone[category] ?? "teal"} dot>
            {category.replace(/_/g, " ").toLowerCase()}
          </Badge>
        </span>
      )}
    </div>
  );
}

export function ArticleCard({ article }: { article: ArticleListItem }) {
  const { lang } = usePreferences();
  const title = lang === "en" && article.title_en ? article.title_en : article.title_mm;
  const body = lang === "en" && article.body_en ? article.body_en : article.body_mm;
  const date = fmtDate(article.published_at, lang);

  return (
    <Link
      href={`/news/${article.slug}`}
      className="group block rounded-[var(--radius)] focus-visible:outline-2"
    >
      <Card className="h-full overflow-hidden transition-all hover:border-teal/30 hover:shadow-[0_8px_30px_rgba(11,103,96,0.12)]">
        <ArticleMedia imageUrl={article.cover_image_url} category={article.category} compact />
        <div className="p-5">
          <p className="text-xs text-muted-foreground">{date}</p>
          <h3
            className={`mt-1.5 font-bold leading-snug group-hover:text-teal-dark ${
              lang === "my" ? mmLineHeight : ""
            }`}
          >
            {title}
          </h3>
          <p className={`mt-2 text-sm text-muted ${lang === "my" ? mmLineHeight : ""}`}>
            {excerpt(body)}
          </p>
          <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-teal group-hover:underline">
            {lang === "en" ? "Read more" : "ဆက်ဖတ်ရန်"} →
          </span>
        </div>
      </Card>
    </Link>
  );
}

export function ArticleGrid({ articles }: { articles: ArticleListItem[] }) {
  const { lang } = usePreferences();
  if (articles.length === 0) {
    return (
      <p className={`py-12 text-center text-muted ${mmLineHeight}`}>
        {lang === "en" ? "No articles yet. New stories will appear here." : "သတင်း မရှိသေးပါ။ သတင်းအသစ်များ ဤနေရာတွင် ပေါ်လာမည်။"}
      </p>
    );
  }
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((a) => (
        <ArticleCard key={a.id} article={a} />
      ))}
    </div>
  );
}
