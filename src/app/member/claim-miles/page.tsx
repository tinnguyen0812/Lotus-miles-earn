"use client";

import withMemberGuard from "@/components/auth/withMemberGuard";
import { ClaimForm } from "@/components/claims/claim-form";
import { useTranslation } from "@/lib/i18n";

function ClaimMilesPage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("member.claim_miles.title")}</h1>
        <p className="text-muted-foreground">{t("member.claim_miles.description")}</p>
      </div>
      <ClaimForm />
    </div>
  );
}

export default withMemberGuard(ClaimMilesPage);
