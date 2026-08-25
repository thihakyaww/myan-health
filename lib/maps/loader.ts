"use client";

// Minimal structural typing for the Maps JS API surface we use.
// Avoids pulling in @types/google.maps (PRD: no unlisted dependencies).
export interface MapsLatLng {
  lat(): number;
  lng(): number;
}

export interface GoogleMapsApi {
  Map: new (
    element: HTMLElement,
    opts?: Record<string, unknown>
  ) => {
    panTo(pos: { lat: number; lng: number }): void;
    setZoom(zoom: number): void;
  };
  Marker: new (opts?: Record<string, unknown>) => {
    addListener(event: string, handler: () => void): void;
    setPosition(pos: { lat: number; lng: number }): void;
    getPosition(): MapsLatLng | null;
  };
  Geocoder: new () => {
    geocode(
      request: { location?: MapsLatLng | { lat: number; lng: number }; address?: string },
      callback: (
        results: { formatted_address: string; geometry: { location: MapsLatLng } }[] | null,
        status: string
      ) => void
    ): void;
  };
  places: {
    Autocomplete: new (input: HTMLInputElement, opts?: Record<string, unknown>) => {
      addListener(event: string, handler: () => void): void;
      getPlace(): {
        geometry?: { location: MapsLatLng };
        formatted_address?: string;
      };
    };
  };
}

let loadPromise: Promise<GoogleMapsApi> | null = null;

export function loadGoogleMaps(): Promise<GoogleMapsApi> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("loadGoogleMaps is browser-only"));
  }

  const w = window as unknown as {
    google?: { maps?: GoogleMapsApi };
    __myanhealth_maps_ready?: () => void;
  };

  if (w.google?.maps) return Promise.resolve(w.google.maps);
  if (loadPromise) return loadPromise;

  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!key) {
    loadPromise = Promise.reject(
      new Error("Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY (see .env.example)")
    );
    return loadPromise;
  }

  loadPromise = new Promise((resolve, reject) => {
    w.__myanhealth_maps_ready = () => {
      if (w.google?.maps) resolve(w.google.maps);
      else reject(new Error("google.maps missing after script load"));
    };

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&loading=async&callback=__myanhealth_maps_ready&v=weekly&libraries=places`;
    script.async = true;
    script.onerror = () => {
      loadPromise = null;
      reject(new Error("Failed to load Google Maps JS API"));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}
