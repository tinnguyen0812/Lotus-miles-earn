"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useTranslation } from "@/lib/i18n";
import { Logo } from "@/components/logo";
import { Home, History, Send, Search, User, Menu, X, LogOut } from "lucide-react";

type Nav = { href: string; key: string; icon: React.ComponentType<any> };

export function MemberHeader() {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const items: Nav[] = [
    { href: "/member/dashboard", key: "home",            icon: Home   },
    { href: "/member/history",   key: "history",         icon: History},
    { href: "/member/claim-miles", key: "manual_request",icon: Send   },
    { href: "/member/requests",  key: "request_tracking",icon: Search },
    { href: "/member/profile",   key: "account_info",    icon: User   },
  ];

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur border-b border-teal-100 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo nhỏ + brand */}
        <Link href="/member/dashboard" className="flex items-center gap-2 shrink-0">
          <Logo size="xs" withText={false} />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-2">
          {items.map(({ href, key, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={[
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                isActive(href)
                  ? "bg-teal-100 text-teal-700 font-medium"
                  : "text-gray-600 hover:text-teal-700 hover:bg-teal-50",
              ].join(" ")}
            >
              <Icon className="h-4 w-4" />
              <span>{t(`member.nav.${key}`)}</span>
            </Link>
          ))}
        </nav>

        {/* Right: Language + Logout + Mobile menu */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="hidden md:inline-flex border-teal-600 text-teal-700 hover:bg-teal-50"
          >
            <LogOut className="h-4 w-4 mr-2" />
            {t("member.nav.logout")} {/* thêm key 'common.logout' trong locales */}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile nav + logout */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-teal-100 bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-3 space-y-2">
            {items.map(({ href, key, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={[
                  "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors",
                  isActive(href)
                    ? "bg-teal-100 text-teal-700 font-medium"
                    : "text-gray-600 hover:text-teal-700 hover:bg-teal-50",
                ].join(" ")}
              >
                <Icon className="h-5 w-5" />
                <span>{t(`member.nav.${key}`)}</span>
              </Link>
            ))}

            <div className="pt-3 border-t border-gray-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setMobileOpen(false); handleLogout(); }}
                className="w-full border-teal-600 text-teal-700 hover:bg-teal-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {t("nav.logout")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
