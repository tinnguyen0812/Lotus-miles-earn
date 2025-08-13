"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export default function AdminShell({
  titleKey,
  backHref = "/admin/claims",
  actions,
  children,
}: {
  titleKey?: string;          // ví dụ: "admin.claims.detail.breadcrumb"
  backHref?: string;          // đường dẫn khi bấm quay lại
  actions?: ReactNode;        // nơi gắn button phụ nếu cần
  children: ReactNode;
}) {
  const { t } = useTranslation();

  return (
    <div className="p-6 space-y-6">
      {titleKey && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={backHref}
              className="inline-flex items-center text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-semibold">{t(titleKey)}</h1>
          </div>
          {actions}
        </div>
      )}
      {children}
    </div>
  );
}
