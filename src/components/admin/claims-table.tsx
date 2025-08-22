"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Search,
  Eye,
  MoreHorizontal,
  Filter,
  Loader2,
  Download,
  Calendar,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { Mobile, Desktop } from "@/components/responsive";
import { useIsMobile } from "@/hooks/use-mobile";
export type AdminClaimRow = {
  id: string;
  memberName: string;
  date: string; // dd/MM/yyyy
  summary: string;
  status: "pending" | "processing" | "processed" | "rejected";
  miles: number;
  avatarText: string;
  /** optional – nếu có tier thì hiện chip nhỏ sau tên */
  tier?: "gold" | "silver" | "bronze" | "member";
  reqNo?: string
};

type Props = {
  rows?: AdminClaimRow[];
  stats?: {
    pending: number;
    approved: number;
    rejected: number;
    totalMiles: number;
  };
  loading?: boolean;

  // pagination
  page?: number;
  size?: number;
  total?: number;
  totalPages?: number;
  onPageChange?: (p: number) => void;
  onPageSizeChange?: (s: number) => void;

  onViewRequest: (id: string) => void;
};

export default function AdminRequestsDashboard({
  rows,
  stats,
  loading,
  page = 1,
  size = 10,
  total = 0,
  totalPages = 1,
  onPageChange,
  onPageSizeChange,
  onViewRequest,
}: Props) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const data = rows ?? [];

  const computed = useMemo(() => {
    const p =
      stats?.pending ??
      data.filter((x) => x.status === "pending" || x.status === "processing")
        .length;
    const a = stats?.approved ?? data.filter((x) => x.status === "processed").length;
    const r = stats?.rejected ?? data.filter((x) => x.status === "rejected").length;
    const tm = stats?.totalMiles ?? data.reduce((s, x) => s + (x.miles || 0), 0);
    return { pending: p, processed: a, rejected: r, totalMiles: tm };
  }, [data, stats]);

  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    if (!q.trim()) return data;
    const k = q.toLowerCase();
    return data.filter(
      (r) =>
        r.memberName.toLowerCase().includes(k) ||
        r.summary.toLowerCase().includes(k) ||
        r.date.toLowerCase().includes(k)
    );
  }, [data, q]);

  const Stat = ({
    label,
    value,
    color,
  }: {
    label: string;
    value: string | number;
    color: "orange" | "green" | "red" | "blue";
  }) => {
    const map: Record<string, string> = {
      orange: "bg-orange-100 text-orange-600",
      green: "bg-green-100 text-green-600",
      red: "bg-red-100 text-red-600",
      blue: "bg-blue-100 text-blue-600",
    };
    return (
      <div className="rounded-lg border bg-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">{label}</p>
            <p className="mt-1 text-2xl font-semibold">{value}</p>
          </div>
          <div className={`grid h-10 w-10 place-items-center rounded-lg ${map[color]}`}>
            <div className="h-4 w-4 rounded-full bg-current opacity-60" />
          </div>
        </div>
      </div>
    );
  };

  const stripeCls = (s: AdminClaimRow["status"]) =>
    s === "processed"
      ? "bg-green-500"
      : s === "rejected"
        ? "bg-red-500"
        : "bg-orange-400"; // pending/processing

  const statusBadge = (s: AdminClaimRow["status"]) => {
    switch (s) {
      case "processed":
        return (
          <Badge className="bg-green-100 text-green-700">
            {t("admin.claims.stats.approved")}
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-700">
            {t("admin.claims.stats.rejected")}
          </Badge>
        );
      case "processing":
      case "pending":
      default:
        return (
          <Badge className="bg-orange-100 text-orange-700">
            {t("admin.claims.stats.pending")}
          </Badge>
        );
    }
  };

  const tierBadge = (tier?: AdminClaimRow["tier"]) => {
    if (!tier) return null;

    // Khai báo map với key là union cụ thể để TS không phàn nàn khi index
    const cls: Record<NonNullable<AdminClaimRow["tier"]>, string> = {
      gold: "bg-yellow-100 text-yellow-700",
      silver: "bg-gray-100 text-gray-700",
      bronze: "bg-amber-100 text-amber-700",
      member: "bg-teal-100 text-teal-700",
    };

    // CHÚ Ý: chỉ truyền 1 tham số vào t(); tham số thứ 2 của t() là object params,
    // nên không truyền trực tiếp 'tier' (gây lỗi như screenshot).
    const label = t(`member.tier.${tier}`) || tier;

    return <Badge className={`ml-2 ${cls[tier]}`}>{label}</Badge>;
  };

  // helper hiển thị khoảng bản ghi
  const from = total ? (page - 1) * size + 1 : 0;
  const to = total ? Math.min(page * size, total) : 0;

  // dải trang ngắn gọn quanh current page
  const pageNumbers = useMemo(() => {
    const delta = 2;
    const start = Math.max(1, page - delta);
    const end = Math.min(totalPages, page + delta);
    const arr: number[] = [];
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  }, [page, totalPages]);
  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 p-6">
        {/* Title */}
        <div className="mb-6">
          <h1 className="mb-2 text-2xl">{t("admin.claims.title")}</h1>
          <p className="text-gray-600">{t("admin.claims.subtitle")}</p>
        </div>

        {/* Overview stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <Stat label={t("admin.claims.stats.pending")} value={computed.pending} color="orange" />
          <Stat label={t("admin.claims.stats.approved")} value={computed.processed} color="green" />
          <Stat label={t("admin.claims.stats.rejected")} value={computed.rejected} color="red" />
          <Stat
            label={t("admin.claims.stats.total_miles")}
            value={computed.totalMiles.toLocaleString()}
            color="blue"
          />
        </div>

        {/* Toolbar */}
        <div className="mb-4 rounded-lg border bg-white p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg">{t("admin.claims.queue_title")}</h2>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Download className="mr-2 h-4 w-4" />
              {t("admin.claims.buttons.export")}
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative max-w-md flex-1">
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
              {/* có thể i18n riêng cho Filter nếu muốn */}
              {t("common.filter") || "Filter"}
            </Button>
          </div>
        </div>

        {/* List */}
        <div className="rounded-lg border bg-white">
          {loading ? (
            <div className="flex items-center gap-2 p-6">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{t("common.loading") || "Loading..."}</span>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <ul className="divide-y">
                  {filtered.map((r) => (
                    <li key={r.id} className="relative">
                      {/* stripe trạng thái */}
                      <div className={`absolute left-0 top-0 h-full w-1 ${stripeCls(r.status)}`} />

                    <div className="flex items-center justify-between gap-4 p-4 pl-6 hover:bg-gray-50">
                      {/* left: avatar + info */}
                      <div className="flex min-w-0 items-start gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-blue-100 text-xs text-blue-600">
                            {r.avatarText}
                          </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0">
                          <div className="mb-1 flex flex-wrap items-center">
                            <span className="truncate text-sm font-medium text-gray-900">
                              {r.memberName}
                            </span>
                            {tierBadge(r.tier)}
                          </div>

                          <p className="truncate text-sm text-gray-600">{r.summary}</p>

                          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                            <span className="inline-flex items-center">
                              <Calendar className="mr-1 h-3.5 w-3.5" />
                              {r.date}
                            </span>
                            {/* miles */}
                            <span className="font-medium text-blue-600">
                              {r.miles.toLocaleString()} {t("common.miles") || "miles"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* right: status + actions */}
                      <div className="flex shrink-0 items-center gap-3">
                        {statusBadge(r.status)}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onViewRequest(r.id)}
                          className="border-blue-200 text-blue-600 hover:bg-blue-50"
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          {t("admin.claims.buttons.view")}
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-600">
                          <MoreHorizontal size={16} />
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}

                {filtered.length === 0 && (
                  <li className="p-6 text-center text-sm text-muted-foreground">
                    {t("admin.claims.empty")}
                  </li>
                )}
                </ul>
              </div>

              {/* footer + pagination */}
              <div className="flex flex-col gap-3 border-t p-4 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-gray-600">
                  {total
                    ? `Showing ${from}–${to} of ${total} results`
                    : t("admin.claims.showing", {
                      count: filtered.length,
                      total: filtered.length,
                    })}
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange?.(Math.max(1, page - 1))}
                    disabled={page <= 1}
                  >
                    {t("admin.claims.buttons.prev")}
                  </Button>

                  {pageNumbers[0] > 1 && <span className="px-1">…</span>}
                  {pageNumbers.map((n) => (
                    <Button
                      key={n}
                      variant={n === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => onPageChange?.(n)}
                      className={n === page ? "bg-blue-600 text-white" : undefined}
                    >
                      {n}
                    </Button>
                  ))}
                  {pageNumbers[pageNumbers.length - 1] < totalPages && (
                    <span className="px-1">…</span>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange?.(Math.min(totalPages, page + 1))}
                    disabled={page >= totalPages}
                  >
                    {t("admin.claims.buttons.next")}
                  </Button>

                  <select
                    className="ml-2 rounded-md border border-gray-300 p-2 text-sm"
                    value={size}
                    onChange={(e) => onPageSizeChange?.(Number(e.target.value) || 10)}
                  >
                    {[10, 20, 50].map((n) => (
                      <option key={n} value={n}>
                        {n} / page
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}
        </div>
    </div>
  )
}
