"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Eye, MoreHorizontal, Filter } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export type AdminClaimRow = {
  id: string;
  memberName: string;
  date: string;                 // dd/MM/yyyy
  summary: string;
  status: "pending" | "processing" | "approved" | "rejected";
  miles: number;
  avatarText: string;
};

type Props = {
  rows?: AdminClaimRow[];
  stats?: { pending: number; approved: number; rejected: number; totalMiles: number };
  onViewRequest: (id: string) => void;
};

export default function AdminRequestsDashboard({ rows, stats, onViewRequest }: Props) {
  const { t } = useTranslation();

  // Mock khi chưa nối API
  const fallbackRows: AdminClaimRow[] = [
    { id: "MR-2024-001", memberName: "Nguyễn Thị Lan", date: "26/01/2024", summary: "Chuyến bay VN125 · SGN → HAN", status: "processing", miles: 2500, avatarText: "NL" },
    { id: "2", memberName: "Trần Văn Nam", date: "26/01/2024", summary: "Khách sạn InterContinental",       status: "processing", miles: 1200, avatarText: "TN" },
    { id: "3", memberName: "Lê Thị Hương", date: "25/01/2024", summary: "Thuê xe · 3 ngày",                  status: "processing", miles: 450,  avatarText: "LH" }
  ];
  const data = rows && rows.length ? rows : fallbackRows;

  const computed = useMemo(() => {
    const p = data.filter(x => x.status === "pending" || x.status === "processing").length;
    const a = data.filter(x => x.status === "approved").length;
    const r = data.filter(x => x.status === "rejected").length;
    const tm = data.reduce((s, x) => s + (x.miles || 0), 0);
    return {
      pending: stats?.pending ?? p,
      approved: stats?.approved ?? a,
      rejected: stats?.rejected ?? r,
      totalMiles: stats?.totalMiles ?? tm,
    };
  }, [data, stats]);

  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    if (!q.trim()) return data;
    const k = q.toLowerCase();
    return data.filter(r =>
      r.memberName.toLowerCase().includes(k) ||
      r.summary.toLowerCase().includes(k) ||
      r.date.toLowerCase().includes(k)
    );
  }, [data, q]);

  const Stat = ({
    label, value, color
  }: { label: string; value: string | number; color: "orange" | "green" | "red" | "blue" }) => {
    const map: Record<string, string> = {
      orange: "bg-orange-100 text-orange-600",
      green: "bg-green-100 text-green-600",
      red: "bg-red-100 text-red-600",
      blue: "bg-blue-100 text-blue-600",
    };
    return (
      <div className="bg-white rounded-lg p-4 border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">{label}</p>
            <p className="text-2xl font-semibold mt-1">{value}</p>
          </div>
          <div className={`w-10 h-10 rounded-lg ${map[color]} grid place-items-center`}>
            <div className="w-4 h-4 rounded-full bg-current opacity-60" />
          </div>
        </div>
      </div>
    );
  };

  const statusBadge = (s: AdminClaimRow["status"]) => {
    switch (s) {
      case "approved":
        return <Badge className="bg-green-100 text-green-700">{t("admin.claims.stats.approved")}</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-700">{t("admin.claims.stats.rejected")}</Badge>;
      case "processing":
        return <Badge className="bg-orange-100 text-orange-700">{t("admin.claims.stats.pending")}</Badge>;
      default:
        return <Badge variant="secondary">{t("admin.claims.stats.pending")}</Badge>;
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-[calc(100vh-64px)]">
      <div className="mb-6">
        <h1 className="text-2xl mb-2">{t("admin.claims.title")}</h1>
        <p className="text-gray-600">{t("admin.claims.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Stat label={t("admin.claims.stats.pending")}     value={computed.pending}                     color="orange" />
        <Stat label={t("admin.claims.stats.approved")}    value={computed.approved}                    color="green" />
        <Stat label={t("admin.claims.stats.rejected")}    value={computed.rejected}                    color="red" />
        <Stat label={t("admin.claims.stats.total_miles")} value={computed.totalMiles.toLocaleString()} color="blue" />
      </div>

      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg">{t("admin.claims.queue_title")}</h2>
          <Button className="bg-blue-600 hover:bg-blue-700">
            {t("admin.claims.buttons.export")}
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder={t("admin.claims.search_placeholder")}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter size={16} />
            {/* bạn có thể thêm key i18n riêng cho "Filter" nếu muốn */}
            Filter
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="text-left p-4 text-sm text-gray-600">{t("admin.claims.table.member")}</th>
                <th className="text-left p-4 text-sm text-gray-600">{t("admin.claims.table.time")}</th>
                <th className="text-left p-4 text-sm text-gray-600">{t("admin.claims.table.status")}</th>
                <th className="text-left p-4 text-sm text-gray-600">{t("admin.claims.table.actions")}</th>
                <th className="text-center p-4 text-sm text-gray-600" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b last:border-b-0 hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                          {r.avatarText}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{r.memberName}</p>
                        <p className="text-sm text-gray-500">{r.summary}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">{r.date}</td>
                  <td className="p-4">{statusBadge(r.status)}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewRequest(r.id)}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        <Eye size={14} className="mr-1" />
                        {t("admin.claims.buttons.view")}
                      </Button>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                      <MoreHorizontal size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td className="p-6 text-center text-sm text-muted-foreground" colSpan={5}>
                    {t("admin.claims.empty")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between p-4 border-t">
          <p className="text-sm text-gray-600">
            {t("admin.claims.showing", { count: Math.min(filtered.length, 10), total: filtered.length })}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              {t("admin.claims.buttons.prev")}
            </Button>
            <Button size="sm" className="bg-blue-600 text-white">1</Button>
            <Button variant="outline" size="sm">2</Button>
            <Button variant="outline" size="sm">3</Button>
            <Button variant="outline" size="sm">
              {t("admin.claims.buttons.next")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
