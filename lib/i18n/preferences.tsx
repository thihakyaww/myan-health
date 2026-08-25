"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { LANG_DEFAULT, type Lang } from "./dictionary";

type Preferences = {
  lang: Lang;
  highContrast: boolean;
  ready: boolean;
  setLang: (l: Lang) => void;
  setHighContrast: (v: boolean) => void;
};

const Ctx = createContext<Preferences | null>(null);

const LS_LANG = "myanhealth.lang";
const LS_HC = "myanhealth.high-contrast";

export function applyToDocument(lang: Lang, hc: boolean) {
  document.documentElement.lang = lang === "en" ? "en" : "my";
  document.documentElement.classList.toggle("high-contrast", hc);
}

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(LANG_DEFAULT);
  const [highContrast, setHcState] = useState(false);
  const [ready, setReady] = useState(false);

  // Hydrate from localStorage (guests) — the inline pre-paint script in the
  // root layout has already applied the same values to <html>.
  useEffect(() => {
    const storedLang = (localStorage.getItem(LS_LANG) as Lang | null) ?? LANG_DEFAULT;
    const storedHc = localStorage.getItem(LS_HC) === "1";
    setLangState(storedLang);
    setHcState(storedHc);
    applyToDocument(storedLang, storedHc);
    setReady(true);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem(LS_LANG, l);
    applyToDocument(l, localStorage.getItem(LS_HC) === "1");
  }, []);

  const setHighContrast = useCallback((v: boolean) => {
    setHcState(v);
    localStorage.setItem(LS_HC, v ? "1" : "0");
    applyToDocument(
      (localStorage.getItem(LS_LANG) as Lang | null) ?? LANG_DEFAULT,
      v
    );
  }, []);

  return (
    <Ctx.Provider value={{ lang, highContrast, ready, setLang, setHighContrast }}>
      {children}
    </Ctx.Provider>
  );
}

export function usePreferences() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePreferences must be used inside PreferencesProvider");
  return ctx;
}
