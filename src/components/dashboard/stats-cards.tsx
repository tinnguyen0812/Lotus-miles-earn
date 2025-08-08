"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Award, Gauge, PlaneTakeoff, ShieldCheck } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { callApi } from "@/lib/api-client";

interface DashboardStats {
  totalMiles: number;
  tierStatus: string;
  tierProgress: string;
  pendingClaims: number;
}

export function StatsCards() {
  const { t } = useTranslation();
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    callApi<DashboardStats>({ method: "GET", path: "/api/stats" })
      .then((data) => setStats(data))
      .catch((err: any) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.stats.total_miles")}</CardTitle>
          </CardHeader>
          <CardContent>Loading...</CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return <div className="text-destructive">{error}</div>;
  }

  if (!stats) {
    return <div>{t("dashboard.stats.total_miles")}: 0</div>;
  }

  const statItems = [
    {
      title: t("dashboard.stats.total_miles"),
      value: stats.totalMiles.toLocaleString(),
      Icon: PlaneTakeoff,
    },
    {
      title: t("dashboard.stats.tier_status"),
      value: stats.tierStatus,
      Icon: Award,
    },
    {
      title: t("dashboard.stats.tier_progress"),
      value: stats.tierProgress,
      Icon: Gauge,
    },
    {
      title: t("dashboard.stats.pending_claims"),
      value: stats.pendingClaims.toString(),
      Icon: ShieldCheck,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statItems.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.Icon className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
