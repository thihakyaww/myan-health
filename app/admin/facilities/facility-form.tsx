"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { ImageUpload } from "@/components/admin/image-upload";
import { LocationCascade, type CascadeValue } from "@/components/location/location-cascade";
import { LocationPicker, type PickedLocation } from "@/components/location/location-picker";

export interface FacilityDraft {
  id?: string;
  name_mm: string;
  name_en: string;
  facility_type: string;
  organization: string;
  address: string;
  formatted_address: string;
  phone: string;
  description_mm: string;
  description_en: string;
  opening_hours: string;
  is_24_7: boolean;
  services: string;
  latitude: number | null;
  longitude: number | null;
  region_id: string;
  city_id: string;
  township_id: string;
  image_url: string | null;
  source_url: string;
  confidence: string;
}

const EMPTY: FacilityDraft = {
  name_mm: "",
  name_en: "",
  facility_type: "PUBLIC_HOSPITAL",
  organization: "GOVERNMENT",
  address: "",
  formatted_address: "",
  phone: "",
  description_mm: "",
  description_en: "",
  opening_hours: "",
  is_24_7: false,
  services: "",
  latitude: null,
  longitude: null,
  region_id: "",
  city_id: "",
  township_id: "",
  image_url: null,
  source_url: "",
  confidence: "",
};

export function FacilityForm({ initial }: { initial?: Partial<FacilityDraft> }) {
  const router = useRouter();
  const [draft, setDraft] = useState<FacilityDraft>({ ...EMPTY, ...initial });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof FacilityDraft>(k: K, v: FacilityDraft[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  async function save() {
    setError(null);
    if (!draft.name_mm.trim() || !draft.name_en.trim()) {
      setError("Both Myanmar and English names are required.");
      return;
    }
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const payload = {
      name_mm: draft.name_mm.trim(),
      name_en: draft.name_en.trim(),
      facility_type: draft.facility_type,
      organization:
        draft.facility_type === "RED_CROSS_TEAM"
          ? "MYANMAR_RED_CROSS"
          : draft.organization || null,
      address: draft.address.trim() || null,
      formatted_address: draft.formatted_address.trim() || null,
      phone: draft.phone.trim() || null,
      description_mm: draft.description_mm.trim() || null,
      description_en: draft.description_en.trim() || null,
      opening_hours: draft.opening_hours.trim() || null,
      is_24_7: draft.is_24_7,
      services: draft.services.split(",").map((s) => s.trim()).filter(Boolean),
      latitude: draft.latitude,
      longitude: draft.longitude,
      region_id: draft.region_id || null,
      city_id: draft.city_id || null,
      township_id: draft.township_id || null,
      image_url: draft.image_url,
      source_url: draft.source_url.trim() || null,
      confidence: draft.confidence || null,
      created_by: user?.id ?? null,
    };

    setSaving(true);
    const { error: err } = draft.id
      ? await supabase.from("facilities").update(payload).eq("id", draft.id)
      : await supabase.from("facilities").insert(payload);
    setSaving(false);

    if (err) {
      setError(err.message);
      return;
    }
    router.push("/admin/facilities");
    router.refresh();
  }

  const picked: PickedLocation | null =
    draft.latitude != null && draft.longitude != null
      ? {
          latitude: draft.latitude,
          longitude: draft.longitude,
          formatted_address: draft.formatted_address,
        }
      : null;

  return (
    <Card>
      <CardBody className="space-y-5 md:p-8">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold">Name (Myanmar) *</span>
            <Input value={draft.name_mm} onChange={(e) => set("name_mm", e.target.value)} />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold">Name (English) *</span>
            <Input value={draft.name_en} onChange={(e) => set("name_en", e.target.value)} />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold">Facility type *</span>
            <Select
              value={draft.facility_type}
              onChange={(e) => set("facility_type", e.target.value)}
            >
              <option value="PUBLIC_HOSPITAL">Public Hospital</option>
              <option value="PRIVATE_HOSPITAL">Private Hospital</option>
              <option value="HEALTH_CENTER">Health Center</option>
              <option value="RED_CROSS_TEAM">Red Cross Team</option>
            </Select>
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold">Organization</span>
            <Select
              value={draft.organization}
              disabled={draft.facility_type === "RED_CROSS_TEAM"}
              onChange={(e) => set("organization", e.target.value)}
            >
              <option value="GOVERNMENT">Government</option>
              <option value="PRIVATE">Private</option>
              <option value="MYANMAR_RED_CROSS">Myanmar Red Cross</option>
            </Select>
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold">Confidence</span>
            <Select
              value={draft.confidence}
              onChange={(e) => set("confidence", e.target.value)}
            >
              <option value="">—</option>
              <option value="high">high</option>
              <option value="medium">medium</option>
              <option value="low">low</option>
            </Select>
          </label>
        </div>

        <fieldset className="space-y-1.5">
          <legend className="text-sm font-semibold">Administrative location</legend>
          <LocationCascade
            value={{
              region_id: draft.region_id,
              city_id: draft.city_id,
              township_id: draft.township_id,
            }}
            onChange={(p) => {
              if (p.region_id !== undefined) set("region_id", p.region_id);
              if (p.city_id !== undefined) set("city_id", p.city_id);
              if (p.township_id !== undefined) set("township_id", p.township_id);
            }}
          />
        </fieldset>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold">Phone</span>
            <Input value={draft.phone} onChange={(e) => set("phone", e.target.value)} />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold">Opening hours</span>
            <Input
              value={draft.opening_hours}
              onChange={(e) => set("opening_hours", e.target.value)}
              placeholder="Emergency: 24/7"
            />
          </label>
        </div>

        <label className="flex items-center gap-3 text-sm font-semibold">
          <input
            type="checkbox"
            checked={draft.is_24_7}
            onChange={(e) => set("is_24_7", e.target.checked)}
            className="h-4 w-4 accent-[var(--teal)]"
          />
          Open 24/7
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-semibold">Services (comma separated)</span>
          <Input
            value={draft.services}
            onChange={(e) => set("services", e.target.value)}
            placeholder="Emergency, Surgery, ICU"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold">Description (Myanmar)</span>
            <Textarea rows={3} value={draft.description_mm} onChange={(e) => set("description_mm", e.target.value)} />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-semibold">Description (English)</span>
            <Textarea rows={3} value={draft.description_en} onChange={(e) => set("description_en", e.target.value)} />
          </label>
        </div>

        {/* Map coordinates — same picker as reports */}
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold">Map location (optional)</legend>
          <LocationPicker
            value={picked}
            onChange={(v) => {
              if (!v) {
                set("latitude", null);
                set("longitude", null);
                return;
              }
              set("latitude", v.latitude);
              set("longitude", v.longitude);
              if (!draft.formatted_address) set("formatted_address", v.formatted_address);
            }}
          />
        </fieldset>

        <label className="block space-y-1.5">
          <span className="text-sm font-semibold">Street address</span>
          <Input value={draft.address} onChange={(e) => set("address", e.target.value)} />
        </label>

        <ImageUpload
          folder="facilities"
          label="Facility image"
          value={draft.image_url}
          onChange={(url) => set("image_url", url)}
        />

        <label className="block space-y-1.5">
          <span className="text-sm font-semibold">Source URL (provenance)</span>
          <Input
            value={draft.source_url}
            onChange={(e) => set("source_url", e.target.value)}
            placeholder="https://…"
          />
        </label>

        {error && (
          <p className="rounded-[var(--radius)] bg-severe-soft px-4 py-3 text-sm text-severe">{error}</p>
        )}

        <div className="flex gap-2">
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving…" : draft.id ? "Save changes" : "Create facility"}
          </Button>
          <Button variant="ghost" onClick={() => router.push("/admin/facilities")}>
            Cancel
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
