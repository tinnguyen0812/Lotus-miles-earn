"use client";

import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/sidebar";
import { AppHeader } from "@/components/layout/header";
import { useIsMobile } from "@/hooks/use-mobile";

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider defaultOpen={!isMobile}>
        <Sidebar>
            <AppSidebar />
        </Sidebar>
        <div className="flex-1 flex flex-col">
            <AppHeader />
            <SidebarInset className="p-4 sm:p-6 lg:p-8">
                {children}
            </SidebarInset>
        </div>
    </SidebarProvider>
  );
}
