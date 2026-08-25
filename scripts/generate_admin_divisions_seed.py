"""Generate admin-division seed SQL from COD-AB Myanmar (OCHA HDX).

Maps: ADM1 State/Region -> regions, ADM2 District -> cities, ADM3 Township -> townships.
Deterministic UUIDs (uuid5 of p-codes) keep the seed idempotent.
"""
import sys
import uuid
import openpyxl

SRC = "/tmp/opencode/mmr_admin_boundaries.xlsx"
OUT = "supabase/migrations/0004_seed_admin_divisions.sql"
NS = uuid.UUID("6ba7b810-9dad-11d1-80b4-00c04fd430c8")  # URL namespace


def det_uuid(pcode: str) -> str:
    return str(uuid.uuid5(NS, f"https://data.humdata.org/cod-ab-mmr#{pcode}"))


def esc(s) -> str:
    if s is None or str(s).strip() == "":
        return "NULL"
    return "'" + str(s).strip().replace("'", "''") + "'"


def read_rows(ws, cols):
    it = ws.iter_rows(values_only=True)
    header = [str(h) if h else "" for h in next(it)]
    idx = {c: i for i, c in enumerate(header)}
    out = []
    for row in it:
        vals = {}
        blank = True
        for c in cols:
            v = row[idx[c]]
            if isinstance(v, str):
                v = v.strip()
            vals[c] = v
            if v not in (None, ""):
                blank = False
        if not blank:
            out.append(vals)
    return out


wb = openpyxl.load_workbook(SRC, read_only=True)

adm1 = read_rows(wb["mmr_admin1"], ["adm1_name", "adm1_name1", "adm1_pcode"])
adm2 = read_rows(wb["mmr_admin2"], ["adm2_name", "adm2_name1", "adm2_pcode", "adm1_pcode"])
adm3 = read_rows(
    wb["mmr_admin3"], ["adm3_name", "adm3_name1", "adm3_pcode", "adm2_pcode"]
)

lines = [
    "-- ============================================================",
    "-- Admin divisions seed from COD-AB Myanmar (OCHA/MIMU)",
    "-- ADM1=18 States/Regions, ADM2=Districts(cities), ADM3=Townships",
    "-- Deterministic UUIDs from p-codes => idempotent re-runs",
    "-- ============================================================",
    "",
]

seen_regions = set()
seen_cities = set()

lines.append("insert into public.regions (id, name_en, name_mm) values")
rvals = []
for r in adm1:
    rid = det_uuid(r["adm1_pcode"])
    if rid in seen_regions:
        continue
    seen_regions.add(rid)
    rvals.append(f"  ({esc(rid)}, {esc(r['adm1_name'])}, {esc(r['adm1_name1'])})")
lines.append(",\n".join(rvals) + "\non conflict (id) do nothing;\n")

lines.append("insert into public.cities (id, region_id, name_en, name_mm) values")
cvals = []
for c in adm2:
    cid = det_uuid(c["adm2_pcode"])
    if cid in seen_cities:
        continue
    seen_cities.add(cid)
    rid = det_uuid(c["adm1_pcode"])
    cvals.append(f"  ({esc(cid)}, {esc(rid)}, {esc(c['adm2_name'])}, {esc(c['adm2_name1'])})")
lines.append(",\n".join(cvals) + "\non conflict (id) do nothing;\n")

lines.append("insert into public.townships (id, city_id, name_en, name_mm) values")
tvals, seen_towns = [], set()
for t in adm3:
    tid = det_uuid(t["adm3_pcode"] + ":" + (t["adm2_pcode"] or ""))
    if tid in seen_towns:
        continue
    seen_towns.add(tid)
    cid = det_uuid(t["adm2_pcode"])
    tvals.append(f"  ({esc(tid)}, {esc(cid)}, {esc(t['adm3_name'])}, {esc(t['adm3_name1'])})")
lines.append(",\n".join(tvals) + "\non conflict (id) do nothing;\n")

with open(OUT, "w", encoding="utf-8") as f:
    f.write("\n".join(lines))

print(f"regions={len(seen_regions)} cities={len(seen_cities)} townships={len(seen_towns)} -> {OUT}")
