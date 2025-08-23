"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "../../logo"; // hoặc "./Logo" nếu bạn đang để chung
import {
  LayoutDashboard,
  FileText,
  Users,
  CreditCard,
  PlusCircle,
  LogOut,
  Globe
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils"; // (nếu bạn có helper cn); nếu không, thay bằng template string
import { useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  useSidebar
} from "@/components/ui/sidebar";
type Item = {
  href: string;
  id: keyof typeof navKeys;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const navKeys = {
  dashboard: "admin.nav.dashboard",
  requests: "admin.nav.requests",
  members: "admin.nav.members",
  transactions: "admin.nav.transactions",
  add_miles: "admin.nav.add_miles",
  settings: "admin.nav.settings",
  help: "admin.nav.help",
  logout: "admin.nav.logout"
} as const;

export default function AdminSidebar() {
  const { t, locale, setLocale } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const { setOpenMobile } = useSidebar();

  const handleLogout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
    } catch {}
    router.replace("/admin/login");
  };
  const menu: Item[] = [
    { href: "/admin/dashboard",  id: "dashboard",   icon: LayoutDashboard },
    { href: "/admin/claims",     id: "requests",    icon: FileText },
    { href: "/admin/members",    id: "members",     icon: Users },
    { href: "/admin/rewards",    id: "transactions",icon: CreditCard },
    { href: "/admin/add-miles",  id: "add_miles",   icon: PlusCircle }
  ];

  const bottom: Item[] = [
  ];

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="border-b border-gray-200">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <Logo size="xs" />
          </div>
          <p className="mt-1 text-xs text-gray-500">{t("admin.brand")}</p>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-3">
        <nav className="flex-1 space-y-1">
          {menu.map(({ href, id, icon: Icon }) => {
            const active = pathname === href || pathname?.startsWith(href + "/");
            return (
              <Link
                key={id}
                href={href}
                onClick={() => setOpenMobile(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-50",
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{t(navKeys[id])}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto space-y-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-start gap-3">
                <Globe className="h-5 w-5" />
                <span className="text-sm">
                  {t("admin.language.current", { lang: t(`admin.language.${locale}`) })}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem onClick={() => setLocale("en")}>
                🇬🇧 {t("admin.language.en")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocale("vi")}>
                🇻🇳 {t("admin.language.vi")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="space-y-1 border-t border-gray-200 pt-3">
            {bottom.map(({ href, id, icon: Icon }) => (
              <Link
                key={id}
                href={href}
                onClick={() => setOpenMobile(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                <Icon className="h-5 w-5" />
                <span>{t(navKeys[id])}</span>
              </Link>
            ))}

            <button
              onClick={handleLogout}
              className="mt-2 flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-5 w-5" />
              <span>{t(navKeys.logout)}</span>
            </button>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
