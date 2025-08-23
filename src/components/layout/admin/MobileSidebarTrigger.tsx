"use client";

import { Button } from "@/components/ui/button";
import { PanelLeft } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

// helper gộp class nếu bạn có (bỏ nếu không dùng)
function cn(...a: Array<string | undefined>) {
  return a.filter(Boolean).join(" ");
}

export default function MobileSidebarTrigger({ className }: { className?: string }) {
  const { open, setOpen } = useSidebar();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setOpen(!open);
      }}
      aria-label="Toggle sidebar"
      className={cn("lg:hidden relative z-[10000] pointer-events-auto", className)}
    >
      <PanelLeft className="h-5 w-5" />
    </Button>
  );
}
