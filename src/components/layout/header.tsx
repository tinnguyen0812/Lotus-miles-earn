"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { LanguageSwitcher } from "../language-switcher";
import { UserNav } from "./user-nav";
import { useTranslation } from "@/lib/i18n";

export function AppHeader() {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <div className="flex w-full items-center justify-end gap-4">
        <h1 className="text-lg font-semibold md:text-xl hidden sm:block mr-auto">
          {t('header.title')}
        </h1>
        <LanguageSwitcher />
        <UserNav />
      </div>
    </header>
  );
}
