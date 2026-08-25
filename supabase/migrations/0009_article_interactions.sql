-- 0009: Article interactions — Like & Save/Bookmark (Continuation Spec §8)
-- Users manage their own rows only; public reads aggregate counts via a view
-- (rows themselves stay hidden behind RLS).

create table if not exists public.article_likes (
  user_id    uuid not null references public.profiles(id)   on delete cascade,
  article_id uuid not null references public.articles(id)   on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, article_id)
);

create table if not exists public.article_bookmarks (
  user_id    uuid not null references public.profiles(id)   on delete cascade,
  article_id uuid not null references public.articles(id)   on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, article_id)
);

create index if not exists idx_article_likes_article    on public.article_likes(article_id);
create index if not exists idx_article_bookmarks_article on public.article_bookmarks(article_id);

alter table public.article_likes    enable row level security;
alter table public.article_bookmarks enable row level security;

-- Users manage their own rows only
create policy "article_likes_select_own" on public.article_likes
  for select to authenticated using (auth.uid() = user_id);
create policy "article_likes_insert_own" on public.article_likes
  for insert to authenticated with check (auth.uid() = user_id);
create policy "article_likes_delete_own" on public.article_likes
  for delete to authenticated using (auth.uid() = user_id);

create policy "article_bookmarks_select_own" on public.article_bookmarks
  for select to authenticated using (auth.uid() = user_id);
create policy "article_bookmarks_insert_own" on public.article_bookmarks
  for insert to authenticated with check (auth.uid() = user_id);
create policy "article_bookmarks_delete_own" on public.article_bookmarks
  for delete to authenticated using (auth.uid() = user_id);

-- Public aggregate counts only (view owner bypasses RLS; no user rows exposed)
create or replace view public.article_public_stats as
select
  a.id as article_id,
  coalesce(l.like_count, 0)::int      as like_count,
  coalesce(b.bookmark_count, 0)::int  as bookmark_count
from public.articles a
left join (
  select article_id, count(*) as like_count
  from public.article_likes group by article_id
) l on l.article_id = a.id
left join (
  select article_id, count(*) as bookmark_count
  from public.article_bookmarks group by article_id
) b on b.article_id = a.id;

grant select on public.article_public_stats to anon, authenticated;
