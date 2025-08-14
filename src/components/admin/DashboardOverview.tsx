"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
} from "recharts";
import {
  Clock, CheckCircle, XCircle, Users, TrendingUp, ArrowUpRight, FileText, Award,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface DashboardOverviewProps {
  onNavigateToRequests: () => void;
}

export function DashboardOverview({ onNavigateToRequests }: DashboardOverviewProps) {
  const { t } = useTranslation();

  // mock số liệu — bạn có thể thay bằng dữ liệu API
  const pending = 24;
  const approved = 156;
  const rejected = 12;
  const totalMembers = 1248;
  const creditedThisMonth = 450_230;

  const requestStats = [
    { title: t("admin.dashboard.status.pending"),   value: String(pending),  change: t("admin.dashboard.status.change_day", { value: "+6" }),  color: "bg-orange-100 text-orange-600", icon: Clock },
    { title: t("admin.dashboard.status.approved"),  value: String(approved), change: t("admin.dashboard.status.change_week", { value: "+12" }), color: "bg-green-100 text-green-600",  icon: CheckCircle },
    { title: t("admin.dashboard.status.rejected"),  value: String(rejected), change: t("admin.dashboard.status.change_week", { value: "+3" }),  color: "bg-red-100 text-red-600",     icon: XCircle },
  ];

  const memberStats = [
    { title: t("admin.dashboard.members.total"), value: totalMembers.toLocaleString(), change: t("admin.dashboard.members.new_count", { value: "+45" }), color: "bg-blue-100 text-blue-600", icon: Users },
    { title: t("admin.dashboard.members.credited_this_month"), value: creditedThisMonth.toLocaleString(), change: t("admin.dashboard.members.vs_last_month", { value: "+15%" }), color: "bg-purple-100 text-purple-600", icon: Award },
  ];

  const activityData = [
    { day: t("admin.dashboard.weekday.mon_short"), requests: 18, processed: 15 },
    { day: t("admin.dashboard.weekday.tue_short"), requests: 22, processed: 19 },
    { day: t("admin.dashboard.weekday.wed_short"), requests: 16, processed: 18 },
    { day: t("admin.dashboard.weekday.thu_short"), requests: 28, processed: 24 },
    { day: t("admin.dashboard.weekday.fri_short"), requests: 25, processed: 22 },
    { day: t("admin.dashboard.weekday.sat_short"), requests: 19, processed: 17 },
    { day: t("admin.dashboard.weekday.sun_short"), requests: 14, processed: 12 },
  ];

  const processingSpeedData = [
    { time: "6h",  speed: 85 },
    { time: "12h", speed: 92 },
    { time: "18h", speed: 78 },
    { time: "24h", speed: 88 },
    { time: "30h", speed: 95 },
    { time: "36h", speed: 82 },
    { time: "42h", speed: 90 },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2">{t("admin.dashboard.title")}</h1>
        <p className="text-gray-600">{t("admin.dashboard.subtitle")}</p>
      </div>

      {/* Request overview widgets */}
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
                          <p className="font-semibold">{stat.value}</p>
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
                  <Bar dataKey="requests"  name={t("admin.dashboard.activity.new_requests")} fill="#3b82f6" radius={[4,4,0,0]} maxBarSize={40} />
                  <Bar dataKey="processed" name={t("admin.dashboard.activity.processed")}   fill="#10b981" radius={[4,4,0,0]} maxBarSize={40} />
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
                  <YAxis domain={[70, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
                  <Line type="monotone" dataKey="speed" stroke="#8b5cf6" strokeWidth={3}
                        dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: "#8b5cf6" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                {t("admin.dashboard.processing.avg_efficiency")}{" "}
                <span className="font-semibold text-purple-600">87.1%</span>
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
          {memberStats.map((stat, idx) => {
            const Icon = stat.icon;
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
                        <p className="font-semibold">{stat.value}</p>
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
