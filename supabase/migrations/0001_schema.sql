-- ============================================================
-- MyanHealth Schema Migration (PRD §6)
-- Next.js + Supabase stack. UUID PKs, timestamptz defaults.
-- ============================================================

-- ---------- Enums ----------
create type public.user_role            as enum ('USER','ADMIN');
create type public.facility_type        as enum ('PUBLIC_HOSPITAL','PRIVATE_HOSPITAL','HEALTH_CENTER','RED_CROSS_TEAM');
create type public.facility_org         as enum ('GOVERNMENT','PRIVATE','MYANMAR_RED_CROSS');
create type public.article_status       as enum ('DRAFT','PUBLISHED');
create type public.report_status        as enum ('SUBMITTED','UNDER_REVIEW','VERIFIED','REJECTED');
create type public.severity_level       as enum ('MILD','MODERATE','SEVERE');
create type public.health_report_type   as enum ('HEALTH_SERVICE_ISSUE','FACILITY_ISSUE','MEDICINE_AVAILABILITY','PUBLIC_HEALTH_CONCERN','OTHER');
create type public.chat_role            as enum ('USER','ASSISTANT','SYSTEM');
create type public.confidence_level     as enum ('high','medium','low');

-- ---------- updated_at helper ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------- Location hierarchy ----------
create table public.regions (
  id          uuid primary key default gen_random_uuid(),
  name_en     text not null,
  name_mm     text,
  created_at  timestamptz not null default now()
);

create table public.cities (
  id          uuid primary key default gen_random_uuid(),
  region_id   uuid not null references public.regions(id) on delete cascade,
  name_en     text not null,
  name_mm     text,
  created_at  timestamptz not null default now(),
  unique (region_id, name_en)
);

create table public.townships (
  id          uuid primary key default gen_random_uuid(),
  city_id     uuid not null references public.cities(id) on delete cascade,
  name_en     text not null,
  name_mm     text,
  created_at  timestamptz not null default now(),
  unique (city_id, name_en)
);

-- ---------- Profiles ----------
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text,
  full_name    text,
  phone        text,
  region_id    uuid references public.regions(id)   on delete set null,
  city_id      uuid references public.cities(id)    on delete set null,
  township_id  uuid references public.townships(id) on delete set null,
  role         public.user_role not null default 'USER',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Prevent non-admins from escalating their own role
create or replace function public.guard_profile_role_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Only admins can change roles';
  end if;
  return new;
end $$;

-- ---------- Articles ----------
create table public.articles (
  id               uuid primary key default gen_random_uuid(),
  title_mm         text not null,
  title_en         text,
  slug             text not null unique,
  body_mm          text not null,
  body_en          text,
  cover_image_url  text,
  category         text,
  tags             text[] not null default '{}',
  author_id        uuid references public.profiles(id) on delete set null,
  status           public.article_status not null default 'DRAFT',
  published_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ---------- Facilities (single table, category field) ----------
create table public.facilities (
  id                 uuid primary key default gen_random_uuid(),
  name_mm            text not null,
  name_en            text not null,
  facility_type      public.facility_type not null,
  organization       public.facility_org,
  region_id          uuid references public.regions(id)   on delete set null,
  city_id            uuid references public.cities(id)    on delete set null,
  township_id        uuid references public.townships(id) on delete set null,
  address            text,
  formatted_address  text,
  phone              text,
  description_mm     text,
  description_en     text,
  opening_hours      text,
  is_24_7            boolean not null default false,
  services           text[] not null default '{}',
  latitude           numeric(10,7),
  longitude          numeric(10,7),
  image_url          text,
  source_url         text,
  source_checked     timestamptz,
  confidence         public.confidence_level,
  created_by         uuid references public.profiles(id) on delete set null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- ---------- Reference options ----------
create table public.disease_types (
  id         uuid primary key default gen_random_uuid(),
  name_en    text not null unique,
  name_mm    text,
  category   text
);

create table public.symptom_options (
  id         uuid primary key default gen_random_uuid(),
  name_en    text not null unique,
  name_mm    text
);

-- ---------- Disease Reports ----------
create table public.disease_reports (
  id                uuid primary key default gen_random_uuid(),
  reporter_id       uuid not null references public.profiles(id) on delete cascade,
  reporter_name     text not null,
  reporter_phone    text,
  region_id         uuid not null references public.regions(id),
  city_id           uuid not null references public.cities(id),
  township_id       uuid references public.townships(id),
  disease_type_id   uuid not null references public.disease_types(id),
  symptoms          text[] not null default '{}',
  onset_date        date,
  severity          public.severity_level,
  formatted_address text,
  latitude          numeric(10,7),
  longitude         numeric(10,7),
  description       text,
  status            public.report_status not null default 'SUBMITTED',
  reviewed_by       uuid references public.profiles(id) on delete set null,
  reviewed_at       timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ---------- Health Reports ----------
create table public.health_reports (
  id                uuid primary key default gen_random_uuid(),
  reporter_id       uuid not null references public.profiles(id) on delete cascade,
  reporter_name     text not null,
  reporter_phone    text,
  region_id         uuid not null references public.regions(id),
  city_id           uuid not null references public.cities(id),
  township_id       uuid references public.townships(id),
  report_type       public.health_report_type not null,
  formatted_address text,
  latitude          numeric(10,7),
  longitude         numeric(10,7),
  description       text,
  status            public.report_status not null default 'SUBMITTED',
  reviewed_by       uuid references public.profiles(id) on delete set null,
  reviewed_at       timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ---------- AI Chat ----------
create table public.chat_sessions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles(id) on delete cascade,
  title       text not null default 'New Chat',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.chat_messages (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references public.chat_sessions(id) on delete cascade,
  role        public.chat_role not null,
  content     text not null,
  created_at  timestamptz not null default now()
);

-- ---------- updated_at triggers ----------
create trigger trg_profiles_updated_at        before update on public.profiles        for each row execute function public.set_updated_at();
create trigger trg_articles_updated_at        before update on public.articles        for each row execute function public.set_updated_at();
create trigger trg_facilities_updated_at      before update on public.facilities      for each row execute function public.set_updated_at();
create trigger trg_disease_reports_updated_at before update on public.disease_reports for each row execute function public.set_updated_at();
create trigger trg_health_reports_updated_at  before update on public.health_reports  for each row execute function public.set_updated_at();
create trigger trg_chat_sessions_updated_at   before update on public.chat_sessions   for each row execute function public.set_updated_at();

-- ---------- Indexes (PRD §6) ----------
create index idx_articles_status            on public.articles(status);
create index idx_facilities_lookup          on public.facilities(facility_type, region_id, city_id, township_id);
create index idx_disease_reports_filter     on public.disease_reports(status, region_id, city_id, township_id, disease_type_id, created_at);
create index idx_health_reports_filter      on public.health_reports(status, region_id, city_id, township_id, report_type, created_at);
create index idx_chat_messages_session      on public.chat_messages(session_id);
