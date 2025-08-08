"use client";

import { LanguageProvider } from "@/lib/i18n.tsx";
import { useAuth } from "@/hooks/useAuth";

function AuthProvider({ children }: { children: React.ReactNode }) {
    // This call initializes the auth state listener
    useAuth(); 
    return <>{children}</>;
}


export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
        <AuthProvider>
            {children}
        </AuthProvider>
    </LanguageProvider>
  );
}
