"use client";

import { useEffect, useRef, useState } from "react";
import { loadGoogleMaps } from "@/lib/maps/loader";

export function MapView({
  latitude,
  longitude,
  label,
  zoom = 15,
  className = "h-64 w-full rounded-[var(--radius)]",
}: {
  latitude: number;
  longitude: number;
  label?: string;
  zoom?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadGoogleMaps()
      .then((maps) => {
        if (cancelled || !ref.current) return;
        const center = { lat: latitude, lng: longitude };
        const map = new maps.Map(ref.current, {
          center,
          zoom,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
        // Classic marker for MVP (no Map ID requirement)
        new maps.Marker({ position: center, map, title: label });
      })
      .catch((e: Error) => !cancelled && setError(e.message));

    return () => {
      cancelled = true;
    };
  }, [latitude, longitude, label, zoom]);

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || error) {
    return (
      <div
        className={`flex items-center justify-center border border-line bg-sky/40 text-sm text-muted ${className}`}
      >
        {error ?? "Map unavailable — NEXT_PUBLIC_GOOGLE_MAPS_API_KEY not set"}
      </div>
    );
  }

  return <div ref={ref} className={className} aria-label={label} />;
}
