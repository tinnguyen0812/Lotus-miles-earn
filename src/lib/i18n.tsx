"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

// Common namespaces (giữ file hiện có)
import enCommon from "@/locales/en.json";
import viCommon from "@/locales/vi.json";
// Admin namespace (mới)
import enAdmin from "@/locales/en.json";
import viAdmin from "@/locales/vi.json";

// Deep-merge đơn giản (đủ dùng cho JSON config)
function deepMerge<T extends Record<string, any>>(a: T, b: T): T {
  const out: any = { ...a };
  for (const k of Object.keys(b)) {
    if (b[k] && typeof b[k] === "object" && !Array.isArray(b[k])) {
      out[k] = deepMerge(a[k] || {}, b[k]);
    } else {
      out[k] = b[k];
    }
  }
  return out;
}

// Gộp common + admin vào một từ điển per-locale
const dictionaries: Record<string, any> = {
  en: deepMerge(enCommon as any, { admin: enAdmin }),
  vi: deepMerge(viCommon as any, { admin: viAdmin })
};

type LanguageContextType = {
  locale: string;
  setLocale: (locale: "en" | "vi") => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [locale, setLocaleState] = useState<"en" | "vi">("en");
  const [dict, setDict] = useState(dictionaries.en);

  // init from browser/localStorage
  useEffect(() => {
    const browserLang = (typeof navigator !== "undefined" ? navigator.language.split("-")[0] : "en") as "en" | "vi";
    const storedLang = (typeof localStorage !== "undefined" ? localStorage.getItem("locale") : null) as "en" | "vi" | null;
    const initial = (storedLang && dictionaries[storedLang]) ? storedLang
      : (dictionaries[browserLang] ? browserLang : "en");
    setLocaleState(initial);
  }, []);

  useEffect(() => {
    const d = dictionaries[locale] || dictionaries.en;
    setDict(d);
    if (typeof document !== "undefined") document.documentElement.lang = locale;
    if (typeof localStorage !== "undefined") localStorage.setItem("locale", locale);
  }, [locale]);

  const setLocale = (lng: "en" | "vi") => setLocaleState(lng);

  // tiny ICU-like {{var}} interpolation
  const interpolate = (tmpl: string, vars?: Record<string, string | number>) =>
    tmpl.replace(/\{\{(\w+)\}\}/g, (_, k) => String(vars?.[k] ?? ""));

  const t = (key: string, vars?: Record<string, string | number>): string => {
    const parts = key.split(".");
    let cur: any = dict;
    for (const p of parts) cur = cur?.[p];
    const val = (typeof cur === "string" ? cur : undefined) ?? // exact match
                parts.reduce((o, i) => o?.[i], dictionaries.en as any); // fallback EN
    return typeof val === "string" ? interpolate(val, vars) : key;
  };

  const value = useMemo<LanguageContextType>(() => ({ locale, setLocale, t }), [locale, dict]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useTranslation = (): LanguageContextType => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    return {
      locale: "en",
      setLocale: () => {},
      t: (key: string, vars?: Record<string, string | number>) => {
        const parts = key.split(".");
        const val = parts.reduce((o: any, i: string) => o?.[i], dictionaries.en) as string | undefined;
        if (typeof val !== "string") return key;
        return val.replace(/\{\{(\w+)\}\}/g, (_, k) => String(vars?.[k] ?? ""));
      }
    };
  }
  return ctx;
};
