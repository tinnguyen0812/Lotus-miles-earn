"use client";

import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n";

export function StatusBadge({ status }: { status: "approved" | "pending" | "rejected" }) {
  const { t } = useTranslation();
  const variant =
    status === "approved" ? "default" : status === "pending" ? "secondary" : "destructive";
  return <Badge variant={variant}>{t(`member.status.${status}`)}</Badge>;
}
