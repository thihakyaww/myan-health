# MyanHealth — Installation Guide (Fresh Machine)

Complete setup instructions for running MyanHealth on a new machine.
Estimated time: **10–15 minutes** (assuming accounts already exist).

---

## 1. Prerequisites

| Requirement | Version | Check command |
|---|---|---|
| Node.js | ≥ 20.9 (built on 24.x) | `node -v` |
| npm | ≥ 10 | `npm -v` |
| Git | any recent | `git --version` |
| Python 3 + openpyxl | 3.x / 3.1+ | `python3 -c "import openpyxl"` |
| psql (Postgres client) | 16/17 | `psql --version` |

Install notes:
- **Node**: use https://nodejs.org LTS or nvm (`nvm install 24`).
- **psql**:
  - Windows: install via https://www.postgresql.org/download/ (includes psql), or `winget install PostgreSQL.PostgreSQL`
  - macOS: `brew install libpq` (then `brew link --force libpq`)
  - Ubuntu/Debian: `sudo apt install postgresql-client`
- **openpyxl** (only needed to regenerate the admin-division seed): `pip3 install openpyxl`

You also need an existing **Supabase project** and two API keys:

| Key | Where to get it |
|---|---|
| Supabase (URL + anon + service-role + DB password) | https://supabase.com → your project → Settings → API / Database |
| Google Maps key (Maps JavaScript API + Places API enabled) | https://console.cloud.google.com → APIs & Services → Credentials |
| Gemini API key | https://aistudio.google.com/apikey — ⚠️ requests must originate from a supported region (US/EU/JP/**SG**). If blocked: "User location is not supported" |

---

## 2. Get the code

```bash
# unzip the project archive (or clone)
unzip myanhealth-project.zip
cd myanhealth
```

---

## 3. Configure environment

`.env.local` is included in this archive with **testing credentials**.
For anything beyond local testing, replace every value below:

```env
NEXT_PUBLIC_SUPABASE_URL="https://<project-ref>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<anon key>"
SUPABASE_SERVICE_ROLE_KEY="<service role key>"   # server-only, never exposed to browser
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="<maps browser key>"
OPENROUTER_API_KEY="<openrouter key>"             # server-only
SUPABASE_STORAGE_BUCKET="post-images"
ADMIN_EMAIL="admin@myanhealth.dev"
ADMIN_PASSWORD="<your admin password>"
```

Never commit `.env.local` (already git-ignored).

> **If you are pointing at a BRAND-NEW empty Supabase project**, run step 4.
> If you reuse the bundled database (already migrated + seeded), skip to step 5.

---

## 4. Database setup (fresh Supabase project only)

Run migrations **in order** through the SQL editor (Supabase Dashboard → SQL Editor) or psql:

```bash
# psql one-liner template:
PGPASSWORD='<DB_PASSWORD>' psql -h aws-0-ap-southeast-1.pooler.supabase.com \
  -p 5432 -U postgres.<project-ref> -d postgres -v ON_ERROR_STOP=1 \
  -f supabase/migrations/XXXX_name.sql
```

Order (each depends on the previous):

| # | File | Purpose |
|---|---|---|
| 0 | *(optional reset)* `DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;` | wipe old data |
| 1 | `0001_schema.sql` | enums, 12 tables, indexes, triggers |
| 2 | `0002_rls_storage.sql` | RLS policies + `post-images` bucket |
| 3 | `0003_seed_reference.sql` | disease types + symptoms |
| 4 | `0004_seed_admin_divisions.sql` | 18 regions / 80 districts / 330 townships (bilingual) |
| 5 | `0005_platform_grants.sql` | ⚠️ **mandatory after any schema reset** — restores PostgREST grants |
| 6 | `0006_seed_articles.sql` | 3 bilingual sample articles |
| 7 | `0007_seed_facilities_sample.sql` | initial facilities (idempotent) |
| 8 | `0008_seed_facilities_phase7.sql` | full facility set (38 real entries, idempotent) |

### Create the admin account (fresh DB only)

The Auth API can't be called from raw SQL alone, so either:
- **Dashboard method**: Authentication → Users → *Add user* (email + password, auto-confirm) — then promote:
  ```sql
  UPDATE public.profiles SET role='ADMIN' WHERE email='<that email>';
  ```
  (run inside Dashboard SQL editor where RLS context allows it; if the trigger blocks it, disable `trg_profiles_guard_role` first and re-enable after)
- or let the app create it: sign up via `/auth/signup`, then run the UPDATE above.

---

## 5. Install & run

```bash
npm install
npm run dev        # http://localhost:3000
```

Production:

```bash
npm run build
npm start
```

Sign in at `/auth/login` with the admin account → `/admin` becomes available.

---

## 6. Feature map

| Route | What it is |
|---|---|
| `/` | Landing (hero + features) |
| `/news`, `/news/[slug]` | Health articles (public reads PUBLISHED only) |
| `/healthcare`, `/healthcare/[id]` | Facility directory, 4 category tabs |
| `/reports` | Disease & Health report forms + own submissions |
| `/chat` | Burmese-first AI health assistant (Gemini direct) |
| `/profile` | Account + language (မြန်မာ/English) + high-contrast toggles |
| `/auth/login`, `/auth/signup` | Email/password auth |
| `/admin/*` | Overview stats/charts, Articles CRUD, Facilities CRUD, Report review queues, CSV export, User management |

## 7. Regenerating seeds (optional)

Admin divisions come from OCHA's COD-AB Myanmar dataset:

```bash
# download XLSX from https://data.humdata.org/dataset/cod-ab-mmr
curl -L -o /tmp/opencode/mmr_admin_boundaries.xlsx "<XLSX resource URL>"
python3 scripts/generate_admin_divisions_seed.py
# → writes supabase/migrations/0004_seed_admin_divisions.sql (idempotent)
```

## 8. Troubleshooting

| Symptom | Cause & fix |
|---|---|
| Everything loads but all lists are empty / "permission denied for table …" | Platform grants missing → re-run `0005_platform_grants.sql` |
| AI chat says "location not supported" | Gemini geo-block — route through US/SG/EU/JP network (VPN exit matters) |
| Map shows "Map unavailable" | `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` missing, or Maps JS / Places APIs not enabled for the key |
| Login loops back / 401s everywhere | Stale session → sign out, clear site data for localhost, sign in again |
| CSV opens with broken Burmese in Excel | Ensure export includes UTF-8 BOM (it does by default); don't strip it with other tools |
| Port 3000 busy | `npm run dev -- -p 3100` |

## 9. Security notes for this test bundle

- `.env.local` ships with **test-only** credentials by request of the project owner.
- Before any real deployment: rotate ALL keys (Supabase service-role, DB password, Maps, Gemini), restrict the Maps key to your domain, enable email confirmation flow review, and re-review RLS policies.
