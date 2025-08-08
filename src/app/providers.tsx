"use client";

import { LanguageProvider } from "@/lib/i18n.tsx";

export function Providers({ children }: { children: React.ReactNode }) {
  // In a real app, you would also wrap this with your auth provider
  return <LanguageProvider>{children}</LanguageProvider>;
}
