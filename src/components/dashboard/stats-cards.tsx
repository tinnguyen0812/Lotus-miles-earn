"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Award, Gauge, PlaneTakeoff, ShieldCheck } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export function StatsCards() {
  const { t } = useTranslation();

  const stats = [
    {
      title: t("dashboard.stats.total_miles"),
      value: "124,530",
      Icon: PlaneTakeoff,
    },
    {
      title: t("dashboard.stats.tier_status"),
      value: "Gold",
      Icon: Award,
    },
    {
      title: t("dashboard.stats.tier_progress"),
      value: "4,470 miles to Platinum",
      Icon: Gauge,
    },
    {
      title: t("dashboard.stats.pending_claims"),
      value: "1",
      Icon: ShieldCheck,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
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
