"use client";

import { useEffect, useState, useMemo } from "react";
import RequestDetail, { RequestDetailData } from "./RequestDetail";
import { callApi } from "@/lib/api-client";
import { Loader2 } from "lucide-react";

// API path chuẩn (đã bỏ mock cũ)
const API_PATH = (id: string) =>
  `/ms-loyalty/member/claim-miles-manual/${encodeURIComponent(id)}`;

// Map dữ liệu từ API claim miles manual -> RequestDetailData
function mapClaimApiToDetail(api: any): RequestDetailData {
  // Status từ BE: pending | processing | processed | rejected ...
  const raw = String(api?.status ?? "").toLowerCase();
  const status: RequestDetailData["status"] =
    raw === "processed" || raw === "approved"
      ? "approved"
      : raw === "rejected"
      ? "rejected"
      : raw === "processing"
      ? "processing"
      : "pending";

  // Type
  const typeCode = String(api?.request_type ?? "").toLowerCase();
  const typeLabel =
    typeCode === "flight"
      ? "Flight"
      : typeCode === "purchase"
      ? "Purchase"
      : "Other";

  // Mô tả (route)
  const route =
    api?.flight_departure_airport && api?.flight_arrival_airport
      ? `Flight ${api.flight_departure_airport} → ${api.flight_arrival_airport}`
      : api?.description || "";

  // Ngày nộp: ưu tiên uploaded_at / created_at
  const submissionDate =
    api?.uploaded_at || api?.created_at || new Date().toISOString();

  // File đính kèm (API trả 1 url)
  const fileUrl = api?.file_url || "";
  const fileName = fileUrl
    ? decodeURIComponent(fileUrl.split("/").pop() || "attachment")
    : "attachment";

  // Chi tiết hiển thị (component có i18n cho các key phổ biến)
  const details: Record<string, string> = {};
  if (api?.flight_code) details.flightNumber = api.flight_code;
  if (api?.flight_departure_date) details.departureDate = api.flight_departure_date;
  if (api?.flight_arrival_date) details.arrivalDate = api.flight_arrival_date;
  if (api?.ticket_number) details.bookingReference = api.ticket_number;
  if (api?.seat_code) details.seatCode = api.seat_code;
  if (api?.seat_class) details.seatClass = api.seat_class;
  if (api?.distance != null) details.distance = String(api.distance);

  return {
    // Dùng request_number cho đúng UI “#REQ-...”, fallback sang id
    id: api?.request_number || api?.id || "REQ-UNKNOWN",
    status,
    type: typeLabel,
    description: route,
    submissionDate,
    expectedMiles: Number(api?.points ?? 0),
    actualMiles: status === "approved" ? Number(api?.points ?? 0) : null,
    rejectionReason: api?.rejection_reason ?? null,
    adminNote: api?.admin_note ?? null,
    details,
    attachments: fileUrl
      ? [
          {
            id: "file-1",
            name: fileName,
            url: fileUrl,
          },
        ]
      : [],
  };
}

export default function RequestDetailClient({
  requestId,
  backTo = "/member/requests",
  contactEmail = "support@lotusmiles.vn",
}: {
  requestId: string;
  backTo?: string;
  contactEmail?: string;
}) {
  const [data, setData] = useState<RequestDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  // fetch client-side để có token + x-user-id từ localStorage
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
        const xUserId =
          (typeof window !== "undefined" && localStorage.getItem("user_id")) ||
          process.env.NEXT_PUBLIC_X_USER_ID ||
          "";

        const res = await callApi<any>({
          method: "GET",
          path: API_PATH(requestId), // base: /api/v1
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${token}`,
            "x-user-id": xUserId,
          },
        });

        const root = res?.data ?? res;
        const api = root?.data ?? root; // payload: { success, data: {...} }
        const mapped = mapClaimApiToDetail(api);
        if (!cancelled) setData(mapped);
      } catch (e) {
        if (!cancelled)
          setData({
            id: requestId,
            status: "pending",
            type: "Manual",
            description: "",
            submissionDate: new Date().toISOString(),
            expectedMiles: 0,
            actualMiles: null,
            rejectionReason: null,
            adminNote: null,
            details: {},
            attachments: [],
          });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [requestId]);

  if (loading || !data) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-muted-foreground flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading…</span>
      </div>
    );
  }

  return (
    <RequestDetail
      data={data}
      onBack={() => (window.location.href = backTo)}
      contactEmail={contactEmail}
    />
  );
}
