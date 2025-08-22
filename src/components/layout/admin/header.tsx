"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n";
import { LotusIcon } from "@/components/icons"; // hoặc Logo nhỏ
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { LogOut, User, Cog } from "lucide-react";
import { ReactNode } from "react";

type Props = {
  title?: string;
  children?: ReactNode;
};

export default function AdminHeader({ title, children }: Props) {
  const { t } = useTranslation();

  return (
    <header className="h-16 border-b bg-white sticky top-0 z-20">
      <div className="max-w-full h-full px-4 lg:px-6 flex items-center justify-between">
        {/* Left: brand (small) + title */}
        <div className="flex items-center gap-3">
          {children}
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <LotusIcon className="h-6 w-6 text-teal-600" />
          </Link>
          <span className="mx-2 text-gray-300 hidden sm:inline">•</span>
          <h1 className="text-base font-medium text-gray-900">
            {title || t("admin.header.title_fallback")}
          </h1>
        </div>

        {/* Right: language + quick actions */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Button asChild variant="ghost" size="sm" className="text-gray-700">
            <Link href="/admin/profile"><User className="h-4 w-4 mr-2" />{t("admin.header.profile")}</Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="text-gray-700">
            <Link href="/admin/settings"><Cog className="h-4 w-4 mr-2" />{t("admin.nav.settings")}</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="border-red-300 text-red-600 hover:bg-red-50">
            <Link href="/logout"><LogOut className="h-4 w-4 mr-2" />{t("admin.nav.logout")}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
