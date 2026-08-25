"use client";

import { useMemo, useState } from "react";
import { usePreferences } from "@/lib/i18n/preferences";
import { ArticleCard, type ArticleListItem } from "./article-card";

const CATEGORIES = [
  { value: "", labelMy: "အားလုံး", labelEn: "All" },
  { value: "DISEASE_INFO", labelMy: "ရောဂါ", labelEn: "Disease Info" },
  { value: "HEALTH_TIPS", labelMy: "ကျန်းမာရေး", labelEn: "Health Tips" },
  { value: "PREVENTION", labelMy: "ကာကွယ်ရေး", labelEn: "Prevention" },
  { value: "NEWS", labelMy: "သတင်း", labelEn: "News" },
  { value: "ANNOUNCEMENT", labelMy: "ကြေညာချက်", labelEn: "Announcement" },
];

export function NewsDirectory({ articles }: { articles: ArticleListItem[] }) {
  const { lang } = usePreferences();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const filtered = useMemo(() => {
    let result = articles;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.title_en?.toLowerCase().includes(q) ||
          a.title_mm.toLowerCase().includes(q)
      );
    }
    if (category) {
      result = result.filter((a) => a.category === category);
    }
    return result;
  }, [articles, search, category]);

  return (
    <>
      {/* Search + category pills */}
      <div className="mb-8 space-y-4">
        <div className="relative">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={lang === "en" ? "Search articles…" : "ဆောင်းပါး ရှာဖွေရန်…"}
            className="w-full rounded-full border border-line bg-card py-3 pl-11 pr-4 text-sm outline-none focus:border-teal"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => {
            const active = category === c.value;
            return (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? "border-teal bg-teal text-white"
                    : "border-line bg-card text-muted hover:border-teal/40 hover:text-teal-dark"
                }`}
              >
                {lang === "en" ? c.labelEn : c.labelMy}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="py-12 text-center text-muted">
          {lang === "en" ? "No articles found." : "ဆောင်းပါး မတွေ့ပါ။"}
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      )}
    </>
  );
}
