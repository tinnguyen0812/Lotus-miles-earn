"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarHeader, SidebarContent, SidebarFooter,
  SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarRail,
} from "@/components/ui/sidebar";
import { LayoutDashboard, ListChecks, Users, Gift, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

const NAV = [
  { href: "/admin",          key: "admin.nav.dashboard", icon: LayoutDashboard },
  { href: "/admin/claims",   key: "admin.nav.claims",    icon: ListChecks },
  { href: "/admin/members",  key: "admin.nav.members",   icon: Users },
  { href: "/admin/rewards",  key: "admin.nav.rewards",   icon: Gift },
  { href: "/admin/settings", key: "admin.nav.settings",  icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      <SidebarHeader className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
            <span className="text-primary text-xs font-bold">LM</span>
          </div>
          <div className="leading-tight">
            <div className="font-semibold text-base">LotusMiles</div>
            <div className="text-xs text-muted-foreground">Admin Portal</div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {NAV.map(({ href, key, icon: Icon }) => {
            const active = isActive(href);
            return (
              <SidebarMenuItem key={href}>
                <SidebarMenuButton asChild isActive={active}>
                  <Link
                    href={href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                  >
                    <Icon className={active ? "h-4 w-4 text-primary" : "h-4 w-4"} />
                    <span className="font-medium">{t(key)}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="px-4 py-3 text-xs text-muted-foreground">
        © {new Date().getFullYear()} Lotus Loyalty Center
      </SidebarFooter>

      <SidebarRail />
    </>
  );
}
