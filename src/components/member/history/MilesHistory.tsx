"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, ShoppingBag, Plane, Loader2 } from "lucide-react";
import { callApi } from "@/lib/api-client";

type TxType = "flight" | "partner" | "bonus" | "manual";
type TxStatus = "completed" | "pending" | "rejected";

export interface MileTransaction {
  id: string;
  type: TxType;
  description: string;
  date: string;   // ISO yyyy-mm-dd
  miles: number;  // giữ dấu
  status: TxStatus;
}

type ApiTx = {
  id: string;
  transaction_type?: "earn" | "burn" | string;
  description?: string;
  transaction_source?: string;
  transaction_date?: string;
  created_at?: string;
  status?: string; // processed/pending/rejected
  points_used?: number;
  reason?: string | null;
};

export function MilesHistory() {
  const { t, locale } = useTranslation();

  // ===== state list theo trang =====
  const [rows, setRows] = useState<MileTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // ===== state all-rows để tính summary =====
  const [allRows, setAllRows] = useState<MileTransaction[]>([]);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const fmtDate = (iso: string) =>
    new Intl.DateTimeFormat(locale ?? "en-US", { day: "2-digit", month: "2-digit", year: "numeric" })
      .format(new Date(iso));

  const iconByType = (type: TxType) => {
    switch (type) {
      case "flight":  return <Plane className="h-4 w-4 text-teal-700" />;
      case "partner": return <ShoppingBag className="h-4 w-4 text-emerald-700" />;
      case "manual":  return <MapPin className="h-4 w-4 text-orange-700" />;
      default:        return <Calendar className="h-4 w-4 text-violet-700" />;
    }
  };

  const statusBadge = (st: TxStatus) => {
    if (st === "completed") return <Badge className="bg-green-100 text-green-800">{t("member.history.status.completed")}</Badge>;
    if (st === "pending")   return <Badge className="bg-orange-100 text-orange-800">{t("member.history.status.pending")}</Badge>;
    if (st === "rejected")  return <Badge className="bg-red-100 text-red-800">{t("member.history.status.rejected")}</Badge>;
    return <Badge>—</Badge>;
  };

  const mapType = (x: ApiTx): TxType => {
    const desc = (x.description || "").toLowerCase();
    const reason = (x.reason || "").toLowerCase();
    const src = (x.transaction_source || "").toLowerCase();
    if (desc.includes("vn") || desc.includes("flight")) return "flight";
    if (reason.includes("manual") || desc.includes("manual") || src === "internal") return "manual";
    if (src === "partner" || desc.includes("vincom") || desc.includes("vietinbank")) return "partner";
    return "bonus";
  };

  const mapStatus = (s?: string): TxStatus => {
    const k = (s || "").toLowerCase();
    if (k === "pending") return "pending";
    if (k === "rejected") return "rejected";
    return "completed"; // processed -> completed
  };

  const unwrap = (res: any) => res?.data?.data ?? res?.data ?? res;

  // ===== fetch theo trang (hiển thị bảng) =====
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token") || "";
        const xUserId =
          localStorage.getItem("user_id") ||
          process.env.NEXT_PUBLIC_X_USER_ID ||
          "";

        const res = await callApi<any>({
          method: "GET",
          path: `/ms-reward/member/transactions?page=${page}&size=${size}`,
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
            "x-user-id": xUserId,
          },
        });

        const root = unwrap(res);
        const list: ApiTx[] =
          Array.isArray(root?.data) ? root.data
            : Array.isArray(root) ? root
            : Array.isArray(root?.data?.data) ? root.data.data
            : [];
        const pg = root?.pagination ?? res?.data?.pagination ?? { total: 0, page, size, totalPages: 1 };

        const mapped: MileTransaction[] = list.map((x) => {
          const dateIso = x.transaction_date || x.created_at || "";
          return {
            id: x.id,
            type: mapType(x),
            description: x.description || "",
            date: dateIso ? new Date(dateIso).toISOString().slice(0, 10) : "",
            miles: Number(x.points_used ?? 0),
            status: mapStatus(x.status),
          };
        });

        if (!cancelled) {
          setRows(mapped);
          setTotal(Number(pg.total || 0));
          setTotalPages(Number(pg.totalPages || 1));
        }
      } catch {
        if (!cancelled) {
          setRows([]);
          setTotal(0);
          setTotalPages(1);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [page, size, locale]);

  // ===== fetch toàn bộ để tính summary =====
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setSummaryLoading(true);
      try {
        const token = localStorage.getItem("token") || "";
        const xUserId =
          localStorage.getItem("user_id") ||
          process.env.NEXT_PUBLIC_X_USER_ID ||
          "";

        // gọi trang 1 để lấy tổng số trang
        const sizeAll = 100; // giảm số lần gọi
        const first = await callApi<any>({
          method: "GET",
          path: `/ms-reward/member/transactions?page=1&size=${sizeAll}`,
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
            "x-user-id": xUserId,
          },
        });
        const root1 = unwrap(first);
        const pg1 = root1?.pagination ?? { totalPages: 1, page: 1 };
        const list1: ApiTx[] =
          Array.isArray(root1?.data) ? root1.data
            : Array.isArray(root1) ? root1
            : Array.isArray(root1?.data?.data) ? root1.data.data
            : [];

        const acc: MileTransaction[] = list1.map((x) => {
          const dateIso = x.transaction_date || x.created_at || "";
          return {
            id: x.id,
            type: mapType(x),
            description: x.description || "",
            date: dateIso ? new Date(dateIso).toISOString().slice(0, 10) : "",
            miles: Number(x.points_used ?? 0),
            status: mapStatus(x.status),
          };
        });

        // lặp nốt các trang còn lại (sequential để tránh 429)
        for (let p = 2; p <= Number(pg1.totalPages || 1); p++) {
          const r = await callApi<any>({
            method: "GET",
            path: `/ms-reward/member/transactions?page=${p}&size=${sizeAll}`,
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${token}`,
              "x-user-id": xUserId,
            },
          });
          const root = unwrap(r);
          const list: ApiTx[] =
            Array.isArray(root?.data) ? root.data
              : Array.isArray(root) ? root
              : Array.isArray(root?.data?.data) ? root.data.data
              : [];
          acc.push(
            ...list.map((x) => {
              const dateIso = x.transaction_date || x.created_at || "";
              return {
                id: x.id,
                type: mapType(x),
                description: x.description || "",
                date: dateIso ? new Date(dateIso).toISOString().slice(0, 10) : "",
                miles: Number(x.points_used ?? 0),
                status: mapStatus(x.status),
              } as MileTransaction;
            })
          );
        }

        if (!cancelled) setAllRows(acc);
      } catch {
        if (!cancelled) setAllRows([]);
      } finally {
        if (!cancelled) setSummaryLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []); // chỉ cần load 1 lần (và khi user/token đổi)

  // ===== summary từ ALL rows =====
  const summary = useMemo(() => {
    const completed = allRows.filter(x => x.status === "completed").length;
    const pending   = allRows.filter(x => x.status === "pending").length;
    const now = new Date();
    const thisMonthTotal = allRows
      .filter(x => {
        if (!x.date) return false;
        const d = new Date(x.date);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      })
      .reduce((s, x) => s + Math.max(0, x.miles), 0);
    return { completed, pending, thisMonthTotal };
  }, [allRows]);

  const typeLabel = (type: TxType) => t(`member.history.type.${type}`);
  const from = total ? (page - 1) * size + 1 : 0;
  const to = total ? Math.min(page * size, total) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-teal-700 text-xl font-semibold">{t("member.history.title")}</h2>
        <p className="text-muted-foreground">{t("member.history.subtitle")}</p>
      </div>

      <Card className="border-teal-200 mt-4 md:mt-6">
        <CardHeader>
          <CardTitle className="text-teal-700">{t("member.history.recent_transactions")}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> {t("common.loading")}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="border-teal-100">
                    <TableHead className="text-teal-700">{t("member.history.columns.type")}</TableHead>
                    <TableHead className="text-teal-700">{t("member.history.columns.description")}</TableHead>
                    <TableHead className="text-teal-700">{t("member.history.columns.date")}</TableHead>
                    <TableHead className="text-teal-700">{t("member.history.columns.miles")}</TableHead>
                    <TableHead className="text-teal-700">{t("member.history.columns.status")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((tx, idx) => (
                    <TableRow key={tx.id} className={idx % 2 ? "bg-white" : "bg-teal-50/30"}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {iconByType(tx.type)}
                          <span className="capitalize">{typeLabel(tx.type)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate">{tx.description || "—"}</div>
                      </TableCell>
                      <TableCell>{tx.date ? fmtDate(tx.date) : "—"}</TableCell>
                      <TableCell>
                        <span className={`font-semibold ${tx.miles >= 0 ? "text-teal-700" : "text-red-600"}`}>
                          {tx.miles >= 0 ? "+" : "-"}{Math.abs(tx.miles).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>{statusBadge(tx.status)}</TableCell>
                    </TableRow>
                  ))}
                  {rows.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                        {t("common.no_data")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Pager */}
              <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-muted-foreground">
                  {total ? `${from}–${to} / ${total}` : ""}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    {t("admin.members.pager.prev")}
                  </Button>
                  <span className="text-sm">{page} / {totalPages}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    {t("admin.members.pager.next")}
                  </Button>
                  <select
                    className="ml-2 rounded-md border border-gray-300 p-2 text-sm"
                    value={size}
                    onChange={(e) => { setPage(1); setSize(Number(e.target.value) || 10); }}
                  >
                    {[10, 20, 50].map((n) => (
                      <option key={n} value={n}>{n} / page</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Summary cards: tính từ toàn bộ dữ liệu */}
      <div className="flex flex-col md:flex-row justify-center gap-4">
        <Card className="border-teal-200 w-full md:w-1/3">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-teal-700">
              {summaryLoading ? <Loader2 className="h-5 w-5 inline animate-spin" /> : summary.thisMonthTotal.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">{t("member.history.summary.this_month")}</p>
          </CardContent>
        </Card>
        <Card className="border-teal-200 w-full md:w-1/3">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-teal-700">
              {summaryLoading ? <Loader2 className="h-5 w-5 inline animate-spin" /> : summary.completed}
            </div>
            <p className="text-sm text-muted-foreground">{t("member.history.summary.completed")}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
