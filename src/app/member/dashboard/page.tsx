"use client";

import withMemberGuard from "@/components/auth/withMemberGuard";
import { SummaryCard } from "@/components/member/cards/SummaryCard";
import { ClaimsTable, Claim } from "@/components/member/claims/ClaimsTable";
import { useTranslation } from "@/lib/i18n";

function DashboardPage() {
  const { t } = useTranslation();
  const stats = [
    { title: t("member.dashboard.summary.total_miles"), value: "24,000" },
    { title: t("member.dashboard.summary.tier_status"), value: "Silver" },
    { title: t("member.dashboard.summary.tier_progress"), value: "60%" },
    { title: t("member.dashboard.summary.pending_claims"), value: "2" },
  ];

  const claims: Claim[] = [
    { id: "1", flightNumber: "VN123", date: "2024-06-01", status: "approved", miles: 1000 },
    { id: "2", flightNumber: "VN456", date: "2024-06-15", status: "pending", miles: 500 },
    { id: "3", flightNumber: "VN789", date: "2024-07-01", status: "rejected", miles: 750 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">{t("member.dashboard.title")}</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <SummaryCard key={s.title} title={s.title} value={s.value} />
        ))}
      </div>
      <ClaimsTable claims={claims} />
    </div>
  );
}

export default withMemberGuard(DashboardPage);
