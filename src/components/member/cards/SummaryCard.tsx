"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, MapPin, Calendar, Star, Loader2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { callApi } from "@/lib/api-client";

export type MemberInfo = {
  name: string;
  email: string;
  membershipTier: "Platinum" | "Gold" | "Silver" | "Bronze" | string;
  totalMiles: number;
  milesThisYear: number;
  nextTierMiles: number; // threshold (min_points) of next tier; 0 if max tier
};

/* ===== API types for recent activity ===== */
type RecentApiItem = {
  id: string;
  request_type: "flight" | "purchase" | "other" | string;
  status: string; // processed | processing | pending | rejected ...
  points: number;
  description?: string;
  uploaded_at?: string;
  processed_at?: string;
  flight_departure_airport?: string | null;
  flight_arrival_airport?: string | null;
};

type RecentRow = {
  id: string;
  title: string;
  dateISO: string;
  points?: number; // show +miles when processed/approved
  status?: "processing" | "pending" | "rejected"; // else undefined = processed/approved
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

  // ====== Upgrade progress ======
  const hasNext = memberInfo.nextTierMiles > 0;
  const progress = hasNext
    ? Math.min(100, Math.max(0, (memberInfo.totalMiles / memberInfo.nextTierMiles) * 100))
    : 100;
  const remaining = hasNext
    ? Math.max(0, memberInfo.nextTierMiles - memberInfo.totalMiles)
    : 0;

  const tierKey = `member.tier.${memberInfo.membershipTier.toLowerCase()}`;

  // ====== Recent activity state & fetch ======
  const [recent, setRecent] = React.useState<RecentRow[]>([]);
  const [recentLoading, setRecentLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      setRecentLoading(true);
      try {
        const token = localStorage.getItem("token") || "";
        const xUserId =
          localStorage.getItem("x-user-id") ||
          localStorage.getItem("user_id") ||
          process.env.NEXT_PUBLIC_X_USER_ID ||
          "";

        const res = await callApi<any>({
          method: "GET",
          path: `/ms-loyalty/member/claim-miles-manual?size=3&page=1&sort=desc`, // base: /api/v1
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
            "x-user-id": xUserId,
          },
        });

        const list: RecentApiItem[] =
          res?.data?.data?.data ?? res?.data?.data ?? res?.data ?? [];

        const rows: RecentRow[] = list.map((it) => {
          const dep = (it.flight_departure_airport || "").trim();
          const arr = (it.flight_arrival_airport || "").trim();
          const type = String(it.request_type || "").toLowerCase();

          const title =
            type === "flight" && dep && arr
              ? t("member.dashboard.activity.flight", { route: `${dep} → ${arr}` })
              : type === "purchase"
              ? t("member.dashboard.activity.partner_purchase")
              : t("member.dashboard.activity.manual_claim");

          const s = String(it.status || "").toLowerCase();
          const isProcessed = s === "processed" || s === "approved";

          const status: RecentRow["status"] =
            isProcessed ? undefined : s === "rejected" ? "rejected" : s === "pending" ? "pending" : "processing";

          return {
            id: it.id,
            title,
            dateISO: it.processed_at || it.uploaded_at || new Date().toISOString(),
            points: isProcessed ? Number(it.points || 0) : undefined,
            status,
          };
        });

        if (!cancelled) setRecent(rows);
      } catch {
        if (!cancelled) setRecent([]);
      } finally {
        if (!cancelled) setRecentLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [locale]);

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
                ? t("member.dashboard.miles_remaining", { count: nf.format(remaining) })
                : t("member.dashboard.max_tier") || "You are at the highest tier"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent activity (from API) */}
      <Card className="border-teal-200">
        <CardHeader>
          <CardTitle className="text-teal-600">
            {t("member.dashboard.recent_activity")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentLoading ? (
            <div className="p-3 flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("common.loading") || "Loading..."}
            </div>
          ) : recent.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              {t("common.no_data") || "No data"}
            </div>
          ) : (
            <div className="space-y-3">
              {recent.map((r) => {
                const rowBg =
                  r.status === "rejected"
                    ? "bg-red-50"
                    : r.status
                    ? "bg-orange-50"
                    : "bg-teal-50";
                const titleColor =
                  r.status === "rejected"
                    ? "text-red-700"
                    : r.status
                    ? "text-orange-700"
                    : "text-teal-700";

                return (
                  <div
                    key={r.id}
                    className={`flex items-center justify-between rounded-lg ${rowBg} p-3`}
                  >
                    <div>
                      <p className={`font-medium ${titleColor}`}>{r.title}</p>
                      <p className="text-sm text-gray-600">
                        {df.format(new Date(r.dateISO))}
                      </p>
                    </div>

                    {typeof r.points === "number" ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {t("member.dashboard.activity.miles_plus", {
                          count: nf.format(r.points),
                        })}
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className={
                          r.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-orange-100 text-orange-800"
                        }
                      >
                        {r.status === "rejected"
                          ? t("member.dashboard.activity.rejected") || "Rejected"
                          : t("member.dashboard.activity.processing")}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
