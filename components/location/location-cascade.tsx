"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Select } from "@/components/ui/input";
import { usePreferences } from "@/lib/i18n/preferences";
import type { City, Region, Township } from "@/lib/types";

export interface CascadeValue {
  region_id: string;
  city_id: string;
  township_id: string;
}

/**
 * Region → City(district) → Township cascading selects.
 * Data comes from the COD-AB seed (18/80/330).
 */
export function LocationCascade({
  value,
  onChange,
}: {
  value: CascadeValue;
  onChange: (patch: Partial<CascadeValue>) => void;
}) {
  const { lang } = usePreferences();
  const [regions, setRegions] = useState<Region[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [townships, setTownships] = useState<Township[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingTownships, setLoadingTownships] = useState(false);

  useEffect(() => {
    createClient()
      .from("regions")
      .select("id,name_en,name_mm")
      .order("name_en")
      .then(({ data }) => setRegions(data ?? []));
  }, []);

  useEffect(() => {
    if (!value.region_id) {
      setCities([]);
      return;
    }
    setLoadingCities(true);
    createClient()
      .from("cities")
      .select("id,region_id,name_en,name_mm")
      .eq("region_id", value.region_id)
      .order("name_en")
      .then(({ data }) => {
        setCities(data ?? []);
        setLoadingCities(false);
      });
  }, [value.region_id]);

  useEffect(() => {
    if (!value.city_id) {
      setTownships([]);
      return;
    }
    setLoadingTownships(true);
    createClient()
      .from("townships")
      .select("id,city_id,name_en,name_mm")
      .eq("city_id", value.city_id)
      .order("name_en")
      .then(({ data }) => {
        setTownships(data ?? []);
        setLoadingTownships(false);
      });
  }, [value.city_id]);

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold">{lang === "en" ? "Region" : "တိုင်းဒေသကြီး"}</label>
        <Select
          value={value.region_id}
          onChange={(e) =>
            onChange({ region_id: e.target.value, city_id: "", township_id: "" })
          }
        >
          <option value="">Select…</option>
          {regions.map((r) => (
            <option key={r.id} value={r.id}>
              {lang === "en" ? r.name_en : (r.name_mm ?? r.name_en)}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-semibold">{lang === "en" ? "District" : "ခရိုင်"}</label>
        <Select
          value={value.city_id}
          disabled={!value.region_id || loadingCities}
          onChange={(e) =>
            onChange({ city_id: e.target.value, township_id: "" })
          }
        >
          <option value="">{loadingCities ? "Loading…" : "Select…"}</option>
          {cities.map((c) => (
            <option key={c.id} value={c.id}>
              {lang === "en" ? c.name_en : (c.name_mm ?? c.name_en)}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-semibold">{lang === "en" ? "Township" : "မြို့နယ်"}</label>
        <Select
          value={value.township_id}
          disabled={!value.city_id || loadingTownships}
          onChange={(e) => onChange({ township_id: e.target.value })}
        >
          <option value="">{loadingTownships ? "Loading…" : "Select…"}</option>
          {townships.map((t) => (
            <option key={t.id} value={t.id}>
              {lang === "en" ? t.name_en : (t.name_mm ?? t.name_en)}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
