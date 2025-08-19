"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
} from "recharts";
import {
  Clock, CheckCircle, XCircle, Users, TrendingUp, ArrowUpRight, FileText, Award,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { callApi } from "@/lib/api-client";

interface DashboardOverviewProps {
  onNavigateToRequests: () => void;
}

/** ----- API types ----- */
type TSItem = { ts: string; count: number };
type OverviewRes = {
  requests: {
    processed: number; // đã duyệt
    rejected: number;
    processing: number; // đang chờ/đang xử lý
    total_miles: number;
    delta: {
      processing_vs_yesterday: number;
      approved_vs_week: number;
      rejected_vs_week: number;
    };
  };
  requests_timeseries: {
    new_requests: TSItem[];
    processed: TSItem[];
    miles_credited: TSItem[];
  };
  processing_speed: {
    bins: number[]; // giờ [6,12,...]
    cumulative_percent: number[]; // % tích lũy theo bin
    percentiles: { p50: number; p90: number; p95: number };
  };
  members: {
    total_members: number;
    new_members: number;
    active_members: number;
    by_tier: { member: number; bronze: number; silver: number; gold: number };
  };
  miles_this_month: number;
};

/** ----- helpers ----- */
const fmtDelta = (n: number) => `${n > 0 ? "+" : ""}${n}`;

function makeLastNDays(n: number, tz: string) {
  // tạo mảng ngày (local) dạng yyyy-mm-dd cho 7 ngày gần nhất (bao gồm hôm nay)
  const out: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    // ISO ngắn (yyyy-mm-dd)
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

export function DashboardOverview({ onNavigateToRequests }: DashboardOverviewProps) {
  const { t, locale } = useTranslation();

  const [data, setData] = useState<OverviewRes | null>(null);
  const [loading, setLoading] = useState(false);

  // gọi API overview
  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    let canceled = false;

    (async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token") || "";
        const res = await callApi<{ data: OverviewRes }>({
          method: "GET",
          path: `/ms-loyalty/admin/dashboard/overview?tz=${encodeURIComponent(tz)}&bucket=day`,
          headers: { Authorization: `Bearer ${token}` }, 
        });
        if (!canceled) setData(res?.data ?? null);
      } catch {
        if (!canceled) setData(null);
      } finally {
        if (!canceled) setLoading(false);
      }
    })();

    return () => {
      canceled = true;
    };
  }, []);

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

  // ----- map dữ liệu về UI -----
  const pending = data?.requests.processing ?? 0;
  const approved = data?.requests.processed ?? 0;
  const rejected = data?.requests.rejected ?? 0;

  const totalMembers = data?.members.total_members ?? 0;
  const creditedThisMonth = data?.miles_this_month ?? 0;

  const deltaProcessing = fmtDelta(data?.requests.delta.processing_vs_yesterday ?? 0);
  const deltaApproved = fmtDelta(data?.requests.delta.approved_vs_week ?? 0);
  const deltaRejected = fmtDelta(data?.requests.delta.rejected_vs_week ?? 0);

  const requestStats = [
    {
      title: t("admin.dashboard.status.pending"),
      value: String(pending),
      change: t("admin.dashboard.status.change_day", { value: deltaProcessing }),
      color: "bg-orange-100 text-orange-600",
      icon: Clock,
    },
    {
      title: t("admin.dashboard.status.approved"),
      value: String(approved),
      change: t("admin.dashboard.status.change_week", { value: deltaApproved }),
      color: "bg-green-100 text-green-600",
      icon: CheckCircle,
    },
    {
      title: t("admin.dashboard.status.rejected"),
      value: String(rejected),
      change: t("admin.dashboard.status.change_week", { value: deltaRejected }),
      color: "bg-red-100 text-red-600",
      icon: XCircle,
    },
  ];

  // Activity (7 ngày gần nhất): gộp new_requests + processed, fill 0 nếu thiếu ngày
  const activityData = useMemo(() => {
    const days = makeLastNDays(7, tz);
    const reqMap = new Map<string, number>();
    const proMap = new Map<string, number>();
    (data?.requests_timeseries.new_requests ?? []).forEach((i) =>
      reqMap.set(i.ts.slice(0, 10), (reqMap.get(i.ts.slice(0, 10)) ?? 0) + i.count)
    );
    (data?.requests_timeseries.processed ?? []).forEach((i) =>
      proMap.set(i.ts.slice(0, 10), (proMap.get(i.ts.slice(0, 10)) ?? 0) + i.count)
    );

    return days.map((iso) => {
      const d = new Date(iso);
      const dayLabel =
        new Intl.DateTimeFormat(locale ?? "en-US", { weekday: "short" }).format(d); // Mon, Tue...
      return {
        day: dayLabel,
        requests: reqMap.get(iso) ?? 0,
        processed: proMap.get(iso) ?? 0,
      };
    });
  }, [data, locale, tz]);

  // Processing speed: dùng cumulative_percent theo bins
  const { processingSpeedData, avgEff } = useMemo(() => {
    const bins = data?.processing_speed.bins ?? [6, 12, 18, 24, 30, 36, 42];
    const cp = data?.processing_speed.cumulative_percent ?? new Array(bins.length).fill(0);
    const list = bins.map((b, i) => ({
      time: `${b}h`,
      speed: cp[i] ?? 0,
    }));

    // lấy giá trị cuối cùng làm "average efficiency" (hoặc trung bình nếu muốn)
    const last = cp.length ? cp[cp.length - 1] : 0;
    return { processingSpeedData: list, avgEff: last };
  }, [data]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2">{t("admin.dashboard.title")}</h1>
        <p className="text-gray-600">{t("admin.dashboard.subtitle")}</p>
      </div>

      {/* Requests overview */}
      <div className="mb-8">
        <h2 className="mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          {t("admin.dashboard.requests_overview")}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {requestStats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={idx} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                          <Icon size={24} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                          <p className="font-semibold">{loading ? "—" : stat.value}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <ArrowUpRight size={14} className="text-green-500" />
                        <span className="text-sm text-gray-500">{stat.change}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA card */}
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="mb-2 text-blue-900">{t("admin.dashboard.cta.title")}</h3>
                <p className="text-sm text-blue-700 mb-4">
                  {t("admin.dashboard.cta.desc", { count: String(pending) })}
                </p>
                <Button onClick={onNavigateToRequests} className="bg-blue-600 hover:bg-blue-700 text-white" size="lg">
                  {t("admin.dashboard.cta.button")}
                  <ArrowUpRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              <div className="hidden md:block">
                <div className="w-24 h-24 bg-blue-200 rounded-full flex items-center justify-center">
                  <FileText className="w-12 h-12 text-blue-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Activity chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              {t("admin.dashboard.activity.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
                  <Bar dataKey="requests" name={t("admin.dashboard.activity.new_requests")} fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="processed" name={t("admin.dashboard.activity.processed")} fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-sm" />
                <span className="text-gray-600">{t("admin.dashboard.activity.new_requests")}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-sm" />
                <span className="text-gray-600">{t("admin.dashboard.activity.processed")}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Processing speed chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              {t("admin.dashboard.processing.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={processingSpeedData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
                  <Line
                    type="monotone"
                    dataKey="speed"
                    name="%"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: "#8b5cf6" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                {t("admin.dashboard.processing.avg_efficiency")}{" "}
                <span className="font-semibold text-purple-600">
                  {typeof avgEff === "number" ? `${avgEff.toFixed(1)}%` : "—"}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Member stats */}
      <div className="mt-8">
        <h2 className="mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          {t("admin.dashboard.members.title")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              title: t("admin.dashboard.members.total"),
              value: totalMembers.toLocaleString(),
              change: t("admin.dashboard.members.new_count", {
                value: fmtDelta(data?.members.new_members ?? 0),
              }),
              color: "bg-blue-100 text-blue-600",
              icon: Users,
            },
            {
              title: t("admin.dashboard.members.credited_this_month"),
              value: creditedThisMonth.toLocaleString(),
              change: t("admin.dashboard.members.vs_last_month", { value: "—" }),
              color: "bg-purple-100 text-purple-600",
              icon: Award,
            },
          ].map((stat, idx) => {
            const Icon = stat.icon as any;
            return (
              <Card key={idx} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-lg ${stat.color} flex items-center justify-center`}>
                        <Icon size={28} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                        <p className="font-semibold">{loading ? "—" : stat.value}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <ArrowUpRight size={14} className="text-green-500" />
                          <span className="text-sm text-gray-500">{stat.change}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
