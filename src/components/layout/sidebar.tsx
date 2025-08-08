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

// A mock hook to simulate getting user role
const useUserRole = () => {
    // In a real app, this would get the user role from your auth context
    const [role, setRole] = React.useState('member');
    
    React.useEffect(() => {
        // Let's pretend we can be an admin by checking for a magic email in local storage or something
        // For this demo, we can just check if the email input on login page was set to admin
        const loginEmailInput = document.getElementById("email") as HTMLInputElement;
        if(loginEmailInput && loginEmailInput.value.includes('admin')){
            setRole('admin');
        }
    }, []);

    return role;
}


export function AppSidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const role = useUserRole();

  const menuItems = [
    {
      href: "/dashboard",
      label: t('sidebar.dashboard'),
      icon: Gauge,
      roles: ['member', 'admin']
    },
    {
      href: "/claim-miles",
      label: t('sidebar.claim_miles'),
      icon: FilePlus,
      roles: ['member', 'admin']
    },
    {
      href: "/admin/claims",
      label: t('sidebar.admin_review'),
      icon: ShieldCheck,
      roles: ['admin']
    },
  ];

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <Button variant="ghost" className="size-9 p-0" asChild>
                <Link href="/dashboard">
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
          {menuItems.filter(item => item.roles.includes(role)).map((item) => (
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
