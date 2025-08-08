"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import en from "@/locales/en.json";
import vi from "@/locales/vi.json";

const dictionaries: Record<string, any> = { en, vi };

type LanguageContextType = {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const LanguageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [locale, setLocale] = useState("en");
  const [dict, setDict] = useState(dictionaries.en);

  useEffect(() => {
    const browserLang = navigator.language.split('-')[0];
    const storedLang = localStorage.getItem('locale');
    const initialLang = storedLang || (dictionaries[browserLang] ? browserLang : 'en');
    setLocale(initialLang);
  }, []);

  useEffect(() => {
    if (dictionaries[locale]) {
      setDict(dictionaries[locale]);
      localStorage.setItem('locale', locale);
    }
  }, [locale]);

  const t = (key: string): string => {
    return key.split(".").reduce((o, i) => o?.[i], dict) || key;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    // Provide a fallback for server components or tests
    return {
        locale: 'en',
        setLocale: () => {},
        t: (key: string) => key.split('.').reduce((o, i) => o?.[i], en) || key
    }
  }
  return context;
};
