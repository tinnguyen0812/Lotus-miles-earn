"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Gauge,
  Plane,
  Settings,
  ShieldCheck,
  FilePlus,
} from "lucide-react";
import { LotusIcon } from "@/components/icons";
import { Button } from "../ui/button";
import { useTranslation } from "@/lib/i18n";
import React from "react";
import { useAuth } from "@/hooks/useAuth";


export function AppSidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { role } = useAuth();

  const menuItems = [
    {
      href: "/member/dashboard",
      label: t('sidebar.dashboard'),
      icon: Gauge,
      roles: ['member']
    },
    {
      href: "/member/claim-miles",
      label: t('sidebar.claim_miles'),
      icon: FilePlus,
      roles: ['member']
    },
    {
      href: "/admin/claims",
      label: t('sidebar.admin_review'),
      icon: ShieldCheck,
      roles: ['admin']
    },
  ];

  const filteredMenuItems = menuItems.filter(item => role && item.roles.includes(role));

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <Button variant="ghost" className="size-9 p-0" asChild>
                <Link href={role === 'admin' ? '/admin/claims' : '/member/dashboard'}>
                    <LotusIcon className="size-8 text-primary" />
                </Link>
            </Button>
            <span className="text-lg font-semibold text-primary tracking-tight">
                {t('app_name')}
            </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarMenu>
          {filteredMenuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.label}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/settings"}
              tooltip={t('sidebar.settings')}
            >
              <Link href="#">
                <Settings />
                <span>{t('sidebar.settings')}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
