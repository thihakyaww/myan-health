import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageContainer, PageHeader } from "@/components/layout/page-header";
import { LogoMark } from "@/components/ui/logo";
import SignOutButton from "./sign-out-button";
import { PreferencesPanel } from "./preferences-panel";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?redirect=%2Fprofile");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .single();

  const { data: savedBookmarks } = await supabase
    .from("article_bookmarks")
    .select("article_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const articleIds = (savedBookmarks ?? []).map((b) => b.article_id);
  const { data: savedArticlesRaw } = articleIds.length
    ? await supabase
        .from("articles")
        .select("id, title_en, title_mm, slug, category")
        .in("id", articleIds)
    : { data: [] as { id: string; title_en: string; title_mm: string; slug: string; category: string }[] };
  const savedArticles = savedArticlesRaw ?? [];

  const displayName = profile?.full_name ?? "—";
  const email = profile?.email ?? user.email ?? "";
  const initial = displayName.trim().charAt(0).toUpperCase() || "M";

  return (
    <PageContainer width="reading">
      <PageHeader eyebrow="MyanHealth Account" titleMy="ကိုယ်ရေးအကျဉ်း" titleEn="Your profile" />

      <div className="space-y-6">
        {/* Identity card */}
        <section className="rounded-[var(--radius)] border border-line bg-card p-6 shadow-[var(--shadow)]">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-teal text-xl font-bold text-white">
              {initial}
            </span>
            <div className="min-w-0">
              <p className="truncate text-lg font-bold">{displayName}</p>
              <p className="truncate text-sm text-muted-foreground">{email}</p>
            </div>
          </div>
        </section>

        {/* Saved articles */}
        <section className="rounded-[var(--radius)] border border-line bg-card p-6 shadow-[var(--shadow)]">
          <h2 className="eyebrow mb-4 flex items-center gap-2 text-teal-dark/70">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h12a1 1 0 0 1 1 1v17l-7-4.5L5 22V5a1 1 0 0 1 1-1z" /></svg>
            Saved articles
          </h2>
          {savedArticles.length === 0 ? (
            <p className="text-sm text-muted">You haven't saved any articles yet.</p>
          ) : (
            <ul className="space-y-3">
              {savedArticles.map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/news/${a.slug}`}
                    className="flex items-center justify-between rounded-lg border border-line px-4 py-3 text-sm font-semibold hover:border-teal/40 hover:text-teal transition-colors"
                  >
                    <span className="truncate">{a.title_en}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 opacity-40"><path d="M9 18l6-6-6-6" /></svg>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Language + high-contrast toggles (PRD §15 accessibility) */}
        <PreferencesPanel />

        <section className="rounded-[var(--radius)] border border-line bg-card p-6 shadow-[var(--shadow)]">
          <h2 className="eyebrow mb-4 flex items-center gap-2 text-teal-dark/70">
            <LogoMark size={18} /> Session
          </h2>
          <SignOutButton />
        </section>
      </div>
    </PageContainer>
  );
}
