/**
 * Geocode facility addresses → update lat/lng + formatted_address in Supabase.
 *
 * Usage:  node scripts/geocode-facilities.mjs
 * Reads:  .env.local (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY)
 *         facilities_rows.json (or fetches from DB if --from-db flag is used)
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// ── load env ──────────────────────────────────────────────
function loadEnv() {
  const raw = readFileSync(resolve(ROOT, ".env.local"), "utf8");
  const map = {};
  for (const line of raw.split(/\r?\n/)) {
    const i = line.indexOf("=");
    if (i < 0) continue;
    map[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, "");
  }
  return map;
}

const env = loadEnv();
const MAPS_KEY = env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY ?? env.SUPABASE_KEY;

if (!MAPS_KEY) { console.error("Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"); process.exit(1); }
if (!SUPABASE_URL) { console.error("Missing NEXT_PUBLIC_SUPABASE_URL"); process.exit(1); }
if (!SUPABASE_KEY) { console.error("Missing SUPABASE_SERVICE_ROLE_KEY"); process.exit(1); }

// ── helpers ───────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function geocode(address) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${MAPS_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.status === "OK" && data.results?.length) {
    const r = data.results[0];
    return {
      lat: r.geometry.location.lat,
      lng: r.geometry.location.lng,
      formatted_address: r.formatted_address,
    };
  }
  return null;
}

// ── facilities to geocode ─────────────────────────────────
// Each entry: { id, name_en, address }
const FACILITIES = [
  // Section A — street address found
  { id: "5b69ac76-325d-43cc-b033-c80a394094da", name_en: "Asia Royal Hospital", address: "No. 14, Baho Street, Sanchaung Township, Yangon" },
  { id: "c0475aaa-057f-4972-b22d-5bb3a04940ea", name_en: "500-bed Specialty Hospital", address: "Min Ye Kyaw Swar Road, Lanmadaw Township, Yangon" },
  { id: "b1e14dfe-b7c4-4e16-8002-14e3bcef5622", name_en: "Yangon Mental Health Hospital", address: "Ywar Thar Gyi Ward, East Dagon Township, Yangon" },
  { id: "12490c52-bc48-4785-951b-92ffd0f33a89", name_en: "Grand Hantha International Hospital", address: "Kan Yeik Thar Road, Dagon Township, Yangon" },
  { id: "c7a5c670-4f10-4f38-a250-ea4854cd69b8", name_en: "Kan Thar Yar International Specialist Hospital", address: "No. 138, Kan Thar Yar Street, Bahan Township, Yangon" },
  { id: "61f15046-ce5e-4c76-bee3-58ad5a6c5e7d", name_en: "Pun Hlaing International Hospital", address: "Pun Hlaing Estate, Hlaing Tharyar Township, Yangon" },
  { id: "f9fc9779-ea53-4e3f-a5a8-94519d9c3292", name_en: "Parami General Hospital", address: "Parami Road, Mayangone Township, Yangon" },
  { id: "197cd562-975f-42f6-8875-24b4b6b31474", name_en: "Bahosi Medical Centre", address: "Bahosi Housing Complex, Lanmadaw Township, Yangon" },
  { id: "7cbc36b3-bed9-4151-990b-b2a5aff0f115", name_en: "Myanmar Red Cross Society HQ", address: "Theinbyu Road, Botataung Township, Yangon" },

  // Section B — township confirmed
  { id: "4c6fc274-3d41-4d25-8394-37a9015b613f", name_en: "East Yangon General Hospital", address: "Botataung Township, Yangon" },
  { id: "c6a3a353-6026-4984-ae0c-9b52338c93fc", name_en: "Insein General Hospital", address: "Insein Township, Yangon" },
  { id: "59640cfa-2106-4df5-b52b-00f273c4f570", name_en: "North Okkalapa General Hospital", address: "North Okkalapa Township, Yangon" },
  { id: "2f57d6b2-336a-40cd-8662-0ff9bd9e8d0e", name_en: "Thingangyun Sanpya General Hospital", address: "Thingangyun Township, Yangon" },
  { id: "c2862c98-8a22-4a1b-90b3-4f94476898c2", name_en: "Yangon General Hospital", address: "U Wisara Road, Bahan Township, Yangon" },
  { id: "8188d1fe-f042-41e3-ab02-55bbdbbde473", name_en: "New Yangon General Hospital", address: "Dagon Township, Yangon" },
  { id: "02591342-5f52-4dba-8720-330238ae35f5", name_en: "New Yangon Specialist Hospital", address: "Downtown Yangon" },
  { id: "01651941-f281-4b29-96d3-4fe0628aed45", name_en: "West Yangon General Hospital", address: "Bahan Township, Yangon" },
  { id: "5599f22d-bbbd-41d8-a793-1ded8fc834f5", name_en: "Yangon Children's Hospital", address: "Myenigon compound, Bahan Township, Yangon" },
  { id: "a37939ed-6ec4-4663-9391-bed51bb8c51e", name_en: "Yankin Children's Hospital", address: "Yankin Township, Yangon" },
  { id: "4102e7f3-d4f2-4ed6-a6bd-83d1bb058ef8", name_en: "Yangon ENT Hospital", address: "Yangon" },
  { id: "b06b877a-4f10-4797-a0d9-6c832d59aa4e", name_en: "Central Women's Hospital Yangon", address: "Downtown Yangon" },
  { id: "22ed250a-af51-4cb7-8ee8-6052e37dfe97", name_en: "South Okkalapa Women and Children Hospital", address: "South Okkalapa Township, Yangon" },
  { id: "863c8246-a8a7-4aee-8a9c-4a456aac9cba", name_en: "Yangon Orthopaedic Hospital", address: "Thaketa Township, Yangon" },
  { id: "e74cc9b9-181c-4c5b-8dc3-a7653822edf6", name_en: "Waibargi Hospital", address: "North Okkalapa area, Yangon" },
  { id: "ba772f0c-bace-4591-a786-4da5fc661cd5", name_en: "Yangon Workers' Hospital", address: "Yangon" },
  { id: "319f00c4-4ff7-46d6-b20f-25b3803a5d0e", name_en: "Mandalay General Hospital", address: "Chanayethazan Township, Mandalay" },

  // Section C — Urban Health Centers
  { id: "ec5ccdb6-c159-460c-93f1-463d30e6060d", name_en: "Bahan Urban Health Center", address: "Bahan Township, Yangon" },
  { id: "06846308-5871-45b5-b846-a394725b5e76", name_en: "Sanchaung Urban Health Center", address: "Sanchaung Township, Yangon" },
  { id: "61774602-9908-4d77-b1a0-5421125d19d9", name_en: "Hlaing Urban Health Center", address: "Hlaing Township, Yangon" },
  { id: "3288c355-b0ba-4348-b739-c07712c3c12e", name_en: "Mayangone Urban Health Center", address: "Mayangone Township, Yangon" },
  { id: "03e701ea-19a0-45ec-b992-087e9aa441c0", name_en: "Insein Urban Health Center", address: "Insein Township, Yangon" },
  { id: "39ec2a00-e6e8-40c4-bfdb-532270038786", name_en: "Thingangyun Urban Health Center", address: "Thingangyun Township, Yangon" },
  { id: "81c6879e-1f90-4c78-8284-c4fe1f0a520f", name_en: "North Okkalapa Urban Health Center", address: "North Okkalapa Township, Yangon" },
  { id: "19dec6aa-6763-4df3-a30c-562c75187ad2", name_en: "South Okkalapa Urban Health Center", address: "South Okkalapa Township, Yangon" },
  { id: "340e89b1-73a8-4c9c-954e-7a19b117fecf", name_en: "Chanayethazan Urban Health Center", address: "Chanayethazan Township, Mandalay" },
];

// ── main ──────────────────────────────────────────────────
async function main() {
  let ok = 0, fail = 0, skip = 0;

  for (const f of FACILITIES) {
    const result = await geocode(f.address);
    if (!result) {
      console.log(`  SKIP  ${f.name_en} — geocode returned no results`);
      skip++;
      continue;
    }

    const payload = {
      latitude: result.lat,
      longitude: result.lng,
      formatted_address: result.formatted_address,
      updated_at: new Date().toISOString(),
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/facilities?id=eq.${f.id}`, {
      method: "PATCH",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      console.log(`  OK    ${f.name_en} → ${result.lat.toFixed(5)}, ${result.lng.toFixed(5)}`);
      ok++;
    } else {
      const body = await res.text();
      console.error(`  FAIL  ${f.name_en} — ${res.status}: ${body}`);
      fail++;
    }

    // respect rate limits (10 req/s free tier)
    await sleep(120);
  }

  console.log(`\nDone: ${ok} updated, ${skip} skipped, ${fail} failed`);
}

main().catch((e) => { console.error(e); process.exit(1); });
