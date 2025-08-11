"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Gauge, FilePlus, Gift, User } from "lucide-react";
import { LotusIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";

export function MemberSidebar() {
  const { t } = useTranslation();
  const pathname = usePathname();

  const items = [
    { href: "/member/dashboard", key: "dashboard", icon: Gauge },
    { href: "/member/claim-miles", key: "claim_miles", icon: FilePlus },
    { href: "/member/rewards", key: "rewards", icon: Gift },
    { href: "/member/profile", key: "profile", icon: User },
  ];

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
          <Button variant="ghost" className="size-9 p-0" asChild>
            <Link href="/member/dashboard">
              <LotusIcon className="size-8 text-primary" />
            </Link>
          </Button>
          <span className="text-lg font-semibold text-primary tracking-tight">
            {t("member.app_name")}
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={t(`member.sidebar.${item.key}`)}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{t(`member.sidebar.${item.key}`)}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </>
  );
}
