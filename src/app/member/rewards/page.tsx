"use client";

import withMemberGuard from "@/components/auth/withMemberGuard";
import { useTranslation } from "@/lib/i18n";

function RewardsPage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">{t("member.rewards.title")}</h1>
      <p className="text-muted-foreground">{t("member.rewards.placeholder")}</p>
    </div>
  );
}

export default withMemberGuard(RewardsPage);
