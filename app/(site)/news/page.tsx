import { createClient } from "@/lib/supabase/server";
import { NewsDirectory } from "@/components/news/news-directory";
import { PageContainer, PageHeader } from "@/components/layout/page-header";

export const metadata = {
  title: "News",
  description: "Health news from MyanHealth",
};

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const supabase = await createClient();
  const { data: articles } = await supabase
    .from("articles")
    .select(
      "id, slug, title_mm, title_en, body_mm, body_en, cover_image_url, category, tags, published_at"
    )
    .eq("status", "PUBLISHED")
    .order("published_at", { ascending: false });

  return (
    <PageContainer>
      <PageHeader
        eyebrow="MyanHealth News"
        titleMy="ကျန်းမာရေး သတင်းများ"
        titleEn="Health news, verified and explained"
        ledeMy="ကာကွယ်ရေး၊ ကုသမှုနှင့် ကျန်းမာရေး ပညာပေး သတင်းများကို မြန်မာဘာသာဖြင့် ဖတ်ရှုနိုင်ပါသည်။"
        ledeEn="Read prevention, treatment and health education news in Burmese."
      />
      <NewsDirectory articles={articles ?? []} />
    </PageContainer>
  );
}
