"use client";

import "@/styles/member-tokens.css";
import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";
import { MemberSidebar } from "@/components/member/layout/MemberSidebar";
import { MemberHeader } from "@/components/member/layout/MemberHeader";
import { useIsMobile } from "@/hooks/use-mobile";

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <Sidebar>
        <MemberSidebar />
      </Sidebar>
      <div className="flex-1 flex flex-col">
        <MemberHeader />
        <SidebarInset className="p-4 sm:p-6 lg:p-8">
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
