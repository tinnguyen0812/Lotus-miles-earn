"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, MapPin, Calendar, Star } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export type MemberInfo = {
  name: string;
  email: string;
  membershipTier: "Platinum" | "Gold" | "Silver" | "Bronze" | string;
  totalMiles: number;
  milesThisYear: number;
  nextTierMiles: number; // threshold (min_points) of next tier; 0 if max tier
};

export function MemberDashboard({ memberInfo }: { memberInfo: MemberInfo }) {
  const { t, locale } = useTranslation();
  const nf = React.useMemo(() => new Intl.NumberFormat(locale || "en"), [locale]);
  const df = React.useMemo(
    () =>
      new Intl.DateTimeFormat(locale || "en", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }),
    [locale]
  );

  const getTierColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case "platinum":
        return "bg-gray-800 text-white";
      case "gold":
        return "bg-yellow-500 text-white";
      case "silver":
        return "bg-gray-400 text-white";
      default:
        return "bg-teal-600 text-white";
    }
  };

  // Tính tiến độ dựa trên tổng tích lũy so với mốc của tier kế tiếp
  const hasNext = memberInfo.nextTierMiles > 0;
  const progress = hasNext
    ? Math.min(100, Math.max(0, (memberInfo.totalMiles / memberInfo.nextTierMiles) * 100))
    : 100;
  const remaining = hasNext
    ? Math.max(0, memberInfo.nextTierMiles - memberInfo.totalMiles)
    : 0;

  const tierKey = `member.tier.${memberInfo.membershipTier.toLowerCase()}`;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="rounded-lg bg-gradient-to-r from-teal-600 to-teal-700 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              {t("member.dashboard.welcome", { name: memberInfo.name })}
            </h2>
            <p className="mt-1 text-teal-100">{memberInfo.email}</p>
          </div>
          <Badge className={getTierColor(memberInfo.membershipTier)}>
            <Star className="mr-1 h-4 w-4" />
            {t(tierKey)}
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="border-teal-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-teal-600">
              {t("member.dashboard.total_miles")}
            </CardTitle>
            <MapPin className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-700">
              {nf.format(memberInfo.totalMiles)}
            </div>
            <p className="mt-1 text-xs text-gray-600">
              {t("member.dashboard.accumulated_since_join")}
            </p>
          </CardContent>
        </Card>

        <Card className="border-teal-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-teal-600">
              {t("member.dashboard.miles_this_year")}
            </CardTitle>
            <Calendar className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-700">
              {nf.format(memberInfo.milesThisYear)}
            </div>
            <p className="mt-1 text-xs text-gray-600">
              {t("member.dashboard.from_date", { date: df.format(new Date("2025-01-01")) })}
            </p>
          </CardContent>
        </Card>

        <Card className="border-teal-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-teal-600">
              {t("member.dashboard.upgrade_progress")}
            </CardTitle>
            <Trophy className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-700">{Math.round(progress)}%</div>
            <div className="mt-2 h-2 w-full rounded-full bg-teal-100">
              <div
                className="h-2 rounded-full bg-teal-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-gray-600">
              {hasNext
                ? t("member.dashboard.miles_remaining", {
                    count: nf.format(remaining),
                  })
                : t("member.dashboard.max_tier") || "You are at the highest tier"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent activity (mock demo) */}
      <Card className="border-teal-200">
        <CardHeader>
          <CardTitle className="text-teal-600">{t("member.dashboard.recent_activity")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-teal-50 p-3">
              <div>
                <p className="font-medium text-teal-700">
                  {t("member.dashboard.activity.flight", { route: "SGN → HAN" })}
                </p>
                <p className="text-sm text-gray-600">{df.format(new Date("2025-08-08"))}</p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {t("member.dashboard.activity.miles_plus", { count: nf.format(1250) })}
              </Badge>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-teal-50 p-3">
              <div>
                <p className="font-medium text-teal-700">
                  {t("member.dashboard.activity.partner_purchase")}
                </p>
                <p className="text-sm text-gray-600">{df.format(new Date("2025-08-05"))}</p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {t("member.dashboard.activity.miles_plus", { count: nf.format(500) })}
              </Badge>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-orange-50 p-3">
              <div>
                <p className="font-medium text-orange-700">
                  {t("member.dashboard.activity.manual_claim")}
                </p>
                <p className="text-sm text-gray-600">{df.format(new Date("2025-08-03"))}</p>
              </div>
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                {t("member.dashboard.activity.processing")}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
