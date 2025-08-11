"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { LanguageSwitcher } from "@/components/language-switcher";
import { LotusIcon } from "@/components/icons";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import { MemberUserMenu } from "./MemberUserMenu";

export function MemberHeader() {
  const { t } = useTranslation();
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2">
        <div className="md:hidden">
          <SidebarTrigger />
        </div>
        <Link href="/member/dashboard" className="flex items-center gap-2">
          <LotusIcon className="size-8 text-primary" />
          <span className="font-semibold tracking-tight">
            {t("member.app_name")}
          </span>
        </Link>
      </div>
      <div className="flex flex-1 items-center justify-end gap-4">
        <LanguageSwitcher />
        <MemberUserMenu />
      </div>
    </header>
  );
}
