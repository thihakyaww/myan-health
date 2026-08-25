"use client";

import { useEffect, useRef, useState } from "react";
import { loadGoogleMaps, type GoogleMapsApi } from "@/lib/maps/loader";

export interface PickedLocation {
  latitude: number;
  longitude: number;
  formatted_address: string;
}

type MarkerT = InstanceType<GoogleMapsApi["Marker"]>;

export default function LocationPickerInner({
  value,
  onChange,
}: {
  value: PickedLocation | null;
  onChange: (v: PickedLocation | null) => void;
}) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const markerRef = useRef<MarkerT | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  // Keep latest onChange without re-initializing maps on every parent render
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    let cancelled = false;

    loadGoogleMaps()
      .then((maps) => {
        if (cancelled || !mapDivRef.current) return;

        const geocoder = new maps.Geocoder();

        const reverseGeocode = (lat: number, lng: number) => {
          setStatus("Resolving address…");
          geocoder.geocode({ location: { lat, lng } }, (results) => {
            if (cancelled) return;
            setStatus(null);
            const address =
              results?.[0]?.formatted_address ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
            onChangeRef.current({ latitude: lat, longitude: lng, formatted_address: address });
          });
        };

        const center = value
          ? { lat: value.latitude, lng: value.longitude }
          : { lat: 16.8665, lng: 96.1951 }; // Yangon default view

        const map = new maps.Map(mapDivRef.current, {
          center,
          zoom: value ? 16 : 11,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        const marker = new maps.Marker({
          map,
          position: center,
          draggable: true,
          title: "Report location",
        });
        markerRef.current = marker;

        marker.addListener("dragend", () => {
          const pos = marker.getPosition();
          if (!pos) return;
          reverseGeocode(pos.lat(), pos.lng());
        });

        if (inputRef.current) {
          const ac = new maps.places.Autocomplete(inputRef.current, {
            fields: ["geometry", "formatted_address"],
            componentRestrictions: { country: "mm" },
          });
          ac.addListener("place_changed", () => {
            const place = ac.getPlace();
            const loc = place.geometry?.location;
            if (!loc) return;
            const lat = loc.lat();
            const lng = loc.lng();
            map.panTo({ lat, lng });
            map.setZoom(16);
            marker.setPosition({ lat, lng });
            onChangeRef.current({
              latitude: lat,
              longitude: lng,
              formatted_address:
                place.formatted_address ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
            });
          });
        }
      })
      .catch((e: Error) => !cancelled && setStatus(e.message));

    return () => {
      cancelled = true;
    };
    // Initialize once; value changes are reflected imperatively by the parent remount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function useMyLocation() {
    if (!navigator.geolocation) {
      setStatus("Geolocation is not supported on this device");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setLocating(false);
        const lat = p.coords.latitude;
        const lng = p.coords.longitude;
        markerRef.current?.setPosition({ lat, lng });

        loadGoogleMaps().then((maps) => {
          new maps.Geocoder().geocode({ location: { lat, lng } }, (results) => {
            const address =
              results?.[0]?.formatted_address ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
            onChangeRef.current({ latitude: lat, longitude: lng, formatted_address: address });
          });
        });
      },
      () => {
        setLocating(false);
        setStatus("Location permission denied — search or drag the pin instead");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search a place… / နေရာ ရှာပါ"
          className="w-full rounded-[var(--radius)] border border-line bg-card px-4 py-2.5 outline-none focus:border-teal focus:ring-2 focus:ring-ring/40"
        />
        <button
          type="button"
          onClick={useMyLocation}
          disabled={locating}
          className="shrink-0 rounded-[var(--radius)] bg-paper-deep px-3 py-2 text-sm font-semibold transition-colors hover:bg-moss disabled:opacity-60"
        >
          {locating ? "…" : "◎ My location"}
        </button>
      </div>

      <div className="relative">
        <div ref={mapDivRef} className="h-64 w-full rounded-[var(--radius)] border border-line" />
        {!value && (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
            <span className="rounded-full bg-ink/80 px-3 py-1 text-xs font-semibold text-white">
              Search, or drag the pin to the exact spot
            </span>
          </div>
        )}
      </div>

      {status && <p className="text-sm text-muted">{status}</p>}
      {value && (
        <p className="rounded-[var(--radius)] bg-sky/50 px-3 py-2 text-sm leading-[1.75]">
          📍 {value.formatted_address}
          <span className="ml-2 text-xs text-muted-foreground">
            ({value.latitude.toFixed(5)}, {value.longitude.toFixed(5)})
          </span>
        </p>
      )}
    </div>
  );
}
