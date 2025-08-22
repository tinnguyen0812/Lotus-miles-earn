"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AdminRequestsDashboard, { type AdminClaimRow } from "@/components/admin/claims-table";
import { callApi } from "@/lib/api-client";
import withAdminGuard from "@/components/auth/withAdminGuard";

type ApiItem = {
  id: string;                      // UUID (dùng để điều hướng / gọi detail)
  request_type: string;
  status: string;
  points: number;
  description: string;
  user?: { first_name?: string | null; last_name?: string | null; user_name?: string | null } | null;
  uploaded_at?: string;
  request_number?: string;         // REQ-xxxxx (chỉ để hiển thị)
  flight_code?: string;
  flight_departure_airport?: string;
  flight_arrival_airport?: string;
};

function mapStatus(s: string): AdminClaimRow["status"] {
  const x = (s || "").toLowerCase();
  if (x === "processed" || x === "approved" || x === "success") return "processed";
  if (x === "rejected" || x === "declined") return "rejected";
  if (x === "pending") return "pending";
  return "processing"; // xem như pending ở UI
}

function initials(name: string) {
  const p = name.trim().split(/\s+/);
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

function AdminClaimsPage() {
  const router = useRouter();

  // bảng: phân trang
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);

  // bảng: dữ liệu trang hiện tại
  const [rows, setRows] = useState<AdminClaimRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // thống kê toàn hệ thống (KHÔNG phụ thuộc page/size)
  const [sysStats, setSysStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    totalMiles: 0,
  });
  const [statsLoading, setStatsLoading] = useState(false);

  // --- tải list theo trang ---
  useEffect(() => {
    const ac = new AbortController();
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token") || "";
        const res = await callApi<any>({
          method: "GET",
          path: `/ms-loyalty/admin/claim-miles-manual?size=${size}&page=${page}`,
          headers: { Authorization: `Bearer ${token}` },
        });

        const items: ApiItem[] = res?.data?.data ?? [];
        const pg = res?.data?.pagination ?? { total: 0, page, size, totalPages: 1 };

        const df = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

        const mapped: AdminClaimRow[] = items.map((it) => {
          const name =
            [it.user?.first_name, it.user?.last_name].filter(Boolean).join(" ").trim() ||
            it.user?.user_name ||
            "Member";
          const isFlight = (it.request_type || "").toLowerCase() === "flight";
          const summary = isFlight
            ? `Chuyến bay ${it.flight_code ?? ""} · ${it.flight_departure_airport ?? ""} → ${it.flight_arrival_airport ?? ""}`.trim()
            : (it.description || "—");
          return {
            id: it.id,                              // ✅ UUID – dùng để View/Detail
            reqNo: it.request_number,  // (optional) REQ-xxxxx để hiển thị nếu muốn
            memberName: name,
            date: it.uploaded_at ? df.format(new Date(it.uploaded_at)) : "",
            summary,
            status: mapStatus(it.status),
            miles: Number(it.points || 0),
            avatarText: initials(name),
          };
        });
        if (cancelled) {
          return
        }
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
    return () => {
      cancelled = true;
      ac.abort()
    };
  }, [page, size]);

  // --- tải THỐNG KÊ TOÀN HỆ THỐNG 1 lần (quét hết các trang) ---
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setStatsLoading(true);
        const token = localStorage.getItem("token") || "";
        const BATCH_SIZE = 200; // tăng để giảm số lượt gọi
        let p = 1;
        let tp = 1;

        let approved = 0;
        let rejected = 0;
        let pending = 0; // gồm cả "processing"
        let totalMiles = 0;

        do {
          const res = await callApi<any>({
            method: "GET",
            path: `/ms-loyalty/admin/claim-miles-manual?size=${BATCH_SIZE}&page=${p}`,
            headers: { Authorization: `Bearer ${token}` },
          });

          const items: ApiItem[] = res?.data?.data ?? [];
          const pg = res?.data?.pagination ?? {};
          tp = Number(pg.totalPages || Math.ceil((pg.total ?? 0) / BATCH_SIZE) || 1);

          for (const it of items) {
            const s = mapStatus(it.status);
            if (s === "processed") approved++;
            else if (s === "rejected") rejected++;
            else pending++; // pending + processing
            totalMiles += Number(it.points || 0);
          }
          p++;
        } while (p <= tp);

        if (!cancelled) setSysStats({ pending, approved, rejected, totalMiles });
      } catch {
        if (!cancelled) setSysStats({ pending: 0, approved: 0, rejected: 0, totalMiles: 0 });
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []); // chỉ chạy 1 lần khi vào trang

  const handleView = (id: string) => router.push(`/admin/claims/${encodeURIComponent(id)}`);

  // nếu đang tải thống kê lần đầu, vẫn truyền 0 để UI không nhấp nháy số theo page
  const stats = useMemo(
    () => sysStats,
    [sysStats]
  );

  return (
    <AdminRequestsDashboard
      rows={rows}
      stats={stats}                // <- số liệu toàn hệ thống, không phụ thuộc page
      loading={loading || statsLoading}
      page={page}
      size={size}
      total={total}
      totalPages={totalPages}
      onViewRequest={handleView}
      onPageChange={setPage}
      onPageSizeChange={(n) => {
        setPage(1);
        setSize(n);
      }}
    />
  );
}

export default withAdminGuard(AdminClaimsPage);
