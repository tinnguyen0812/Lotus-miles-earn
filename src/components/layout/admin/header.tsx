"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { LanguageSwitcher } from "@/components/language-switcher";
import { UserNav } from "@/components/layout/user-nav";
import { useTranslation } from "@/lib/i18n";
import { usePathname } from "next/navigation";

export function AdminHeader() {
  const { t } = useTranslation();
  const pathname = usePathname();

  const title =
    pathname?.startsWith("/admin/claims")  ? t("admin.nav.claims")  :
    pathname?.startsWith("/admin/members") ? t("admin.nav.members") :
    pathname?.startsWith("/admin/rewards") ? t("admin.nav.rewards") :
    pathname?.startsWith("/admin/settings")? t("admin.nav.settings"):
    t("admin.nav.dashboard");

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <h1 className="text-lg font-semibold md:text-xl mr-auto">{title}</h1>
      <LanguageSwitcher />
      <UserNav />
    </header>
  );
}
