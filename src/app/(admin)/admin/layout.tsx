"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AdminSidebar from "@/components/layout/admin/sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider className="bg-gray-50">
      <AdminSidebar />
      <SidebarInset>
        <div className="mx-auto w-full max-w-screen-xl px-3 sm:px-4 lg:px-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
