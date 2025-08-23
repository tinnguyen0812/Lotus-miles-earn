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
      {/* ✅ BẮT BUỘC có Sidebar để SidebarTrigger hoạt động đúng */}
      <Sidebar className="z-40">
        <AdminSidebar />
      </Sidebar>

      {/* isolate tạo stacking context riêng để header luôn on-top */}
      <SidebarInset className="relative isolate">
        {/* Header sticky + z rất cao để không bị nội dung “đè” khi list render */}
        <div className="sticky top-0 z-[9999] bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <AdminHeader>
            {/* ✅ Dùng trigger trực tiếp, không wrap thêm Button */}
            <SidebarTrigger className="mr-2 lg:hidden" />
          </AdminHeader>
        </div>

        {/* Main không có z cao để khỏi che header */}
        <main className="relative z-0 mx-auto w-full max-w-screen-xl px-3 sm:px-4 lg:px-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
