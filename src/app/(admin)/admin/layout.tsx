"use client";

import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/layout/admin/sidebar";
import { AdminHeader } from "@/components/layout/admin/header";
import { useIsMobile } from "@/hooks/use-mobile";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <Sidebar>
        <AdminSidebar />
      </Sidebar>
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <SidebarInset className="p-4 sm:p-6 lg:p-8">{children}</SidebarInset>
      </div>
    </SidebarProvider>
  );
}
