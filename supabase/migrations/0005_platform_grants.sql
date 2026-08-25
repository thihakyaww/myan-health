-- ============================================================
-- Restore Supabase platform grants lost during schema reset.
-- PostgREST executes as anon / authenticated / service_role.
-- RLS policies (0002) still govern which rows are visible.
-- ============================================================

grant usage on schema public to anon, authenticated, service_role;

grant all on all tables    in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;

-- Keep future tables usable too
alter default privileges in schema public grant all on tables    to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;

-- Functions must be executable as well
grant execute on all functions in schema public to anon, authenticated, service_role;
