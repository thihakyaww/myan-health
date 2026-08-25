-- ============================================================
-- MyanHealth RLS & Storage (PRD §11, §13)
-- ============================================================

-- ---------- Admin helper (security definer avoids recursion) ----------
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'ADMIN'
  )
$$;

-- Attach role-escalation guard (defined in 0001, now that is_admin exists)
create trigger trg_profiles_guard_role
before update on public.profiles
for each row execute function public.guard_profile_role_change();

-- ---------- Enable RLS everywhere ----------
alter table public.regions          enable row level security;
alter table public.cities           enable row level security;
alter table public.townships        enable row level security;
alter table public.profiles         enable row level security;
alter table public.articles         enable row level security;
alter table public.facilities       enable row level security;
alter table public.disease_types    enable row level security;
alter table public.symptom_options  enable row level security;
alter table public.disease_reports  enable row level security;
alter table public.health_reports   enable row level security;
alter table public.chat_sessions    enable row level security;
alter table public.chat_messages    enable row level security;

-- ---------- Location hierarchy: public read, admin write ----------
create policy "locations_public_read"  on public.regions   for select using (true);
create policy "locations_admin_write"  on public.regions   for all    using (public.is_admin());

create policy "cities_public_read"     on public.cities    for select using (true);
create policy "cities_admin_write"     on public.cities    for all    using (public.is_admin());

create policy "townships_public_read"  on public.townships for select using (true);
create policy "townships_admin_write"  on public.townships for all    using (public.is_admin());

-- ---------- Profiles ----------
create policy "profiles_read_own_or_admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid())
  with check (id = auth.uid());   -- role change blocked by trg_profiles_guard_role

-- inserts happen only via handle_new_user (security definer); deletes cascade from auth.users

-- ---------- Articles: public reads published, admin manages ----------
create policy "articles_public_read_published" on public.articles
  for select using (status = 'PUBLISHED' or public.is_admin());

create policy "articles_admin_all" on public.articles
  for all using (public.is_admin());

-- ---------- Facilities: public directory read, admin manages ----------
create policy "facilities_public_read" on public.facilities
  for select using (true);

create policy "facilities_admin_all" on public.facilities
  for all using (public.is_admin());

-- ---------- Reference options: public read, admin write ----------
create policy "disease_types_public_read"   on public.disease_types   for select using (true);
create policy "disease_types_admin_write"   on public.disease_types   for all using (public.is_admin());

create policy "symptom_options_public_read" on public.symptom_options for select using (true);
create policy "symptom_options_admin_write" on public.symptom_options for all using (public.is_admin());

-- ---------- Reports: create/read own only; admin reviews everything ----------
create policy "disease_reports_insert_own" on public.disease_reports
  for insert to authenticated
  with check (reporter_id = auth.uid());

create policy "disease_reports_read_own_or_admin" on public.disease_reports
  for select using (reporter_id = auth.uid() or public.is_admin());

create policy "disease_reports_admin_update" on public.disease_reports
  for update using (public.is_admin())
  with check (public.is_admin());

create policy "disease_reports_admin_delete" on public.disease_reports
  for delete using (public.is_admin());

create policy "health_reports_insert_own" on public.health_reports
  for insert to authenticated
  with check (reporter_id = auth.uid());

create policy "health_reports_read_own_or_admin" on public.health_reports
  for select using (reporter_id = auth.uid() or public.is_admin());

create policy "health_reports_admin_update" on public.health_reports
  for update using (public.is_admin())
  with check (public.is_admin());

create policy "health_reports_admin_delete" on public.health_reports
  for delete using (public.is_admin());

-- ---------- Chat: owner-only (guests stay ephemeral, never persisted) ----------
create policy "chat_sessions_owner_all" on public.chat_sessions
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "chat_messages_owner_all" on public.chat_messages
  for all
  using (exists (select 1 from public.chat_sessions s where s.id = session_id))
  with check (exists (select 1 from public.chat_sessions s where s.id = session_id));

-- ---------- Storage: post-images bucket (PRD §13) ----------
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

create policy "post_images_public_read"
  on storage.objects for select
  using (bucket_id = 'post-images');

create policy "post_images_admin_insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'post-images' and public.is_admin());

create policy "post_images_admin_update"
  on storage.objects for update to authenticated
  using (bucket_id = 'post-images' and public.is_admin())
  with check (bucket_id = 'post-images' and public.is_admin());

create policy "post_images_admin_delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'post-images' and public.is_admin());
