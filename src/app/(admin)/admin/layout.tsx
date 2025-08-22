"use client";

import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import AdminSidebar from "@/components/layout/admin/sidebar";
import AdminHeader from "@/components/layout/admin/header";
import { useIsMobile } from "@/hooks/use-mobile";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <Sidebar>
        <AdminSidebar />
      </Sidebar>
      <SidebarInset>
        <AdminHeader>
          <SidebarTrigger className="mr-2" />
        </AdminHeader>
        <main className="mx-auto w-full max-w-screen-xl px-3 sm:px-4 lg:px-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
