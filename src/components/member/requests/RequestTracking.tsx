"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { callApi } from "@/lib/api-client";
import Link from "next/link";
import {
  Eye,
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
} from "lucide-react";

export type RequestStatus = "pending" | "processing" | "processed" | "rejected";

export interface MilesRequest {
  id: string; // request_number nếu có, fallback id
  type: "missing-flight" | "partner-purchase" | "other";
  description: string;
  submittedDate: string; // ISO
  status: RequestStatus;
  expectedMiles: number;
  actualMiles?: number;
  rejectionReason?: string;
  processingNotes?: string;
}

/** Map status từ API -> UI */
function mapStatus(apiStatus: string): RequestStatus {
  const s = (apiStatus || "").toLowerCase();
  if (s === "processed" || s === "approved" || s === "success") return "processed";
  if (s === "rejected" || s === "declined") return "rejected";
  if (s === "pending") return "pending";
  return "processing";
}

/** Map type từ API -> UI */
function mapType(apiType: string): MilesRequest["type"] {
  const t = (apiType || "").toLowerCase();
  if (t === "flight") return "missing-flight";
  if (t === "purchase") return "partner-purchase";
  return "other";
}

/** Tạo mô tả đẹp cho flight (nếu có đủ field) */
function flightDescription(it: any, locale: string | undefined) {
  const df = new Intl.DateTimeFormat(locale ?? "en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  if (it.flight_departure_airport && it.flight_arrival_airport && it.flight_code) {
    const d = it.flight_departure_date ? df.format(new Date(it.flight_departure_date)) : "";
    return `${it.flight_departure_airport} → ${it.flight_arrival_airport} (${it.flight_code})${d ? ` • ${d}` : ""}`;
  }
  return it.description || "";
}

export function RequestTracking() {
  const { t, locale } = useTranslation();

  // ----- pagination state -----
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // ----- data state -----
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<MilesRequest[]>([]);

  const fmtDate = (iso: string) =>
    new Intl.DateTimeFormat(locale ?? "en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(iso));

  const statusIcon = (s: RequestStatus) => {
    switch (s) {
      case "pending":
        return <Clock className="h-4 w-4 text-orange-500" />;
      case "processing":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "processed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const statusBadge = (s: RequestStatus) => {
    const map: Record<RequestStatus, string> = {
      pending: "member.requests.status.pending",
      processing: "member.requests.status.processing",
      processed: "member.requests.status.approved",
      rejected: "member.requests.status.rejected",
    };
    const cls: Record<RequestStatus, string> = {
      pending: "bg-orange-100 text-orange-800",
      processing: "bg-blue-100 text-blue-800",
      processed: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return <Badge className={cls[s]}>{t(map[s])}</Badge>;
  };

  const typeLabel = (type: MilesRequest["type"]) => t(`member.requests.type.${type}`);

  // ----- fetch list -----
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token") || "";
        const userId = localStorage.getItem("user_id") || localStorage.getItem("userId") || "";
        const res = await callApi<any>({
          method: "GET",
          path: `/ms-loyalty/member/claim-miles-manual?size=${size}&page=${page}`,
          headers: {
            Authorization: `Bearer ${token}`,
            "x-user-id": userId,
          },
        });

        const arr: any[] = res?.data?.data ?? [];
        const pg = res?.data?.pagination ?? { total: 0, page, size, totalPages: 1 };

        const mapped: MilesRequest[] = arr.map((it) => {
          const uiType = mapType(it.request_type);
          const id = it.request_number || it.id;
          const status = mapStatus(it.status);
          const description =
            uiType === "missing-flight" ? flightDescription(it, locale) : it.description || "";
          return {
            id,
            type: uiType,
            description,
            submittedDate: it.uploaded_at || it.processed_at || new Date().toISOString(),
            status,
            expectedMiles: Number(it.points || 0),
            // actualMiles: có thể map khi API trả riêng
          };
        });

        if (!cancelled) {
          setRequests(mapped);
          setTotal(Number(pg.total || 0));
          setTotalPages(Number(pg.totalPages || 1));
        }
      } catch (e) {
        if (!cancelled) {
          setRequests([]);
          setTotal(0);
          setTotalPages(1);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [page, size, locale]);

  const summary = useMemo(() => {
    const counts = {
      pending: requests.filter((r) => r.status === "pending").length,
      processing: requests.filter((r) => r.status === "processing").length,
      processed: requests.filter((r) => r.status === "processed").length,
      rejected: requests.filter((r) => r.status === "rejected").length,
    };
    return counts;
  }, [requests]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-teal-700 text-xl font-semibold">{t("member.requests.title")}</h2>
          <p className="text-muted-foreground">{t("member.requests.subtitle")}</p>
        </div>
        <Button asChild className="bg-teal-600 hover:bg-teal-700">
          <Link href="/member/claim-miles">{t("member.requests.create")}</Link>
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("member.requests.status.pending")}</p>
                <p className="text-2xl font-bold text-orange-600">{summary.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("member.requests.status.processing")}</p>
                <p className="text-2xl font-bold text-blue-600">{summary.processing}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("member.requests.status.approved")}</p>
                <p className="text-2xl font-bold text-green-600">{summary.processed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("member.requests.status.rejected")}</p>
                <p className="text-2xl font-bold text-red-600">{summary.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requests list */}
      <div className="space-y-4">
        {loading && (
          <Card className="border-teal-200">
            <CardContent className="p-6 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{t("common.loading") || "Loading..."}</span>
            </CardContent>
          </Card>
        )}

        {!loading &&
          requests.map((req) => (
            <Card key={req.id} className="border-teal-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      {statusIcon(req.status)}
                      <h3 className="font-medium text-teal-700">{req.id}</h3>
                      {statusBadge(req.status)}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span>{typeLabel(req.type)}</span>
                      </div>

                      <p className="text-foreground">{req.description}</p>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {t("member.requests.submitted_on")}: {fmtDate(req.submittedDate)}
                          </span>
                        </div>

                        <div>
                          {t("member.requests.expected")}:{" "}
                          <span className="font-medium text-teal-700">
                            {req.expectedMiles.toLocaleString()}
                          </span>
                        </div>

                        {typeof req.actualMiles === "number" && (
                          <div>
                            {t("member.requests.actual")}:{" "}
                            <span className="font-medium text-green-600">
                              {req.actualMiles.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {req.processingNotes && (
                        <div className="rounded-lg border-l-4 border-blue-400 bg-blue-50 p-3">
                          <p className="text-sm text-blue-700">
                            <strong>{t("member.requests.processing_notes")}:</strong>{" "}
                            {req.processingNotes}
                          </p>
                        </div>
                      )}

                      {req.rejectionReason && (
                        <div className="rounded-lg border-l-4 border-red-400 bg-red-50 p-3">
                          <p className="text-sm text-red-700">
                            <strong>{t("member.requests.rejection_reason")}:</strong>{" "}
                            {req.rejectionReason}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button asChild variant="outline" size="sm" className="ml-4">
                    <Link
                      href={`/member/requests/${encodeURIComponent(req.id)}`}
                      prefetch={false}
                      aria-label={t("member.requests.view_aria", { id: req.id })}
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      {t("common.detail")}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

        {!loading && requests.length === 0 && (
          <Card className="border-teal-200">
            <CardContent className="p-12 text-center">
              <FileText className="mx-auto mb-4 h-16 w-16 text-teal-200" />
              <h3 className="mb-2 text-teal-700">{t("member.requests.empty.title")}</h3>
              <p className="mb-4 text-muted-foreground">
                {t("member.requests.empty.subtitle")}
              </p>
              <Button className="bg-teal-600 hover:bg-teal-700">
                {t("member.requests.create_first")}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          {total > 0
            ? `Showing ${(page - 1) * size + 1}-${Math.min(page * size, total)} of ${total}`
            : null}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={loading || page <= 1}
          >
            {t("common.prev") || "Prev"}
          </Button>
          <span className="text-sm">
            {t("common.page") || "Page"} {page}/{totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={loading || page >= totalPages}
          >
            {t("common.next") || "Next"}
          </Button>

          <select
            className="ml-2 rounded-md border border-teal-200 p-2 text-sm"
            value={size}
            onChange={(e) => {
              setPage(1);
              setSize(Number(e.target.value) || 10);
            }}
          >
            {[10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
