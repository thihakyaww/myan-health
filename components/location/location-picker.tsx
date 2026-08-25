"use client";

import dynamic from "next/dynamic";
import type { PickedLocation } from "./location-picker-inner";

// Google Maps is heavy — keep it out of the initial bundle (bundle-dynamic-imports)
const LocationPickerInner = dynamic(() => import("./location-picker-inner"), {
  ssr: false,
  loading: () => (
    <div className="h-[19rem] w-full animate-pulse rounded-[var(--radius)] border border-line bg-sky/30" />
  ),
});

export function LocationPicker({
  value,
  onChange,
}: {
  value: PickedLocation | null;
  onChange: (v: PickedLocation | null) => void;
}) {
  return <LocationPickerInner value={value} onChange={onChange} />;
}

export type { PickedLocation };
