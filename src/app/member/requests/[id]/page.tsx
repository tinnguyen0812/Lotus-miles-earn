// app/member/request-tracking/[id]/page.tsx
import RequestDetailClient from "@/components/member/requests/RequestDetailClient";
import { RequestDetailData } from "@/components/member/requests/RequestDetail";
import { callApi } from "@/lib/api-client";
import { notFound } from "next/navigation";

/** ---- Config: chỉnh lại path cho đúng API của bạn ---- */
const API_PATH = (id: string) => `/ms-member/requests/${id}`;

/** Map API → UI shape */
function mapApiToDetail(api: any): RequestDetailData {
  // Chuẩn hoá status về: 'pending' | 'processing' | 'approved' | 'rejected'
  const statusMap: Record<string, RequestDetailData["status"]> = {
    pending: "pending",
    processing: "processing",
    approved: "approved",
    rejected: "rejected",
  };
  const normalizedStatus =
    statusMap[String(api?.status ?? "").toLowerCase()] ?? "pending";

  // Map attachments an toàn
  const attachments =
    (api?.attachments ?? []).map((a: any) => ({
      id: a?.id ?? a?.uuid ?? a?.name ?? Math.random().toString(36).slice(2),
      name: a?.filename ?? a?.name ?? "attachment",
      size: a?.size_human ?? a?.size ?? "",
      url: a?.url,
      type: a?.mime ?? a?.type,
    })) ?? [];

  // details tuỳ theo loại (ví dụ flight/hotel/partner...)
  const details: Record<string, string> = {};
  if (api?.type === "flight" || api?.flight_number) {
    if (api?.flight_number) details.flightNumber = api.flight_number;
    if (api?.departure_date) details.departureDate = api.departure_date;
    if (api?.arrival_date) details.arrivalDate = api.arrival_date;
    if (api?.booking_ref) details.bookingReference = api.booking_ref;
  }
  if (api?.merchant) details.merchant = api.merchant;
  if (api?.transaction_date) details.transactionDate = api.transaction_date;
  if (api?.amount) details.amount = String(api.amount);
  if (api?.receipt_number) details.receiptNumber = api.receipt_number;
  if (api?.hotel_name) details.hotelName = api.hotel_name;
  if (api?.check_in_date) details.checkInDate = api.check_in_date;
  if (api?.check_out_date) details.checkOutDate = api.check_out_date;

  return {
    id: api?.code ?? api?.id ?? "REQ-UNKNOWN",
    status: normalizedStatus,
    // type: nên là label đã i18n (nếu API trả code thì map ở server hoặc truyền code và i18n trong component)
    type: api?.type_label ?? api?.type ?? "",
    description: api?.description ?? "",
    submissionDate: api?.submitted_at ?? api?.created_at ?? new Date().toISOString(),
    expectedMiles: Number(api?.expected_miles ?? 0),
    actualMiles: api?.actual_miles ?? null,
    rejectionReason: api?.rejection_reason ?? null,
    adminNote: api?.admin_note ?? null,
    details,
    attachments,
  };
}

/** ---- MOCK fallback (khớp UI figma bạn đã đưa) ---- */
function mockById(id: string): RequestDetailData {
  const commonAttachments = [
    {
      id: 1,
      name: "boarding-pass-sgn-nrt.pdf",
      size: "245 KB",
      url: "#",
      type: "application/pdf",
    },
    {
      id: 2,
      name: "receipt-vietnam-airlines.jpg",
      size: "1.2 MB",
      url: "#",
      type: "image/jpeg",
    },
  ];

  const base: RequestDetailData = {
    id,
    status: "processing",
    type: "Flight",
    description: "Flight SGN → NRT",
    submissionDate: "2025-01-10",
    expectedMiles: 2500,
    actualMiles: null,
    rejectionReason: null,
    adminNote: null,
    details: {
      flightNumber: "VN301",
      departureDate: "2025-01-08",
      arrivalDate: "2025-01-08",
      bookingReference: "ABC123XYZ",
    },
    attachments: commonAttachments,
  };

  if (id.endsWith("2")) {
    return {
      ...base,
      id,
      status: "approved",
      type: "Partner purchase",
      description: "Invoice #VIN789012",
      expectedMiles: 500,
      actualMiles: 450,
      adminNote:
        "Transaction verified successfully. Applied rate 0.9 mile / 1000 VND for this type.",
      details: {
        merchant: "Vincom Center",
        transactionDate: "2025-01-05",
        amount: "500,000 VND",
        receiptNumber: "VIN789012",
      },
    };
  }

  if (id.endsWith("3")) {
    return {
      ...base,
      id,
      status: "rejected",
      type: "Hotel stay",
      description: "Paradise Resort",
      expectedMiles: 800,
      rejectionReason:
        "This hotel is not in the partner list of LotusMiles. Please check the partner list on website.",
      details: {
        hotelName: "Paradise Resort",
        checkInDate: "2025-01-01",
        checkOutDate: "2025-01-03",
        bookingReference: "HTL456789",
      },
    };
  }

  return base;
}

/** Fetch detail (try API → fallback mock) */
async function fetchDetail(id: string): Promise<RequestDetailData> {
  try {
    const resp = await callApi<{ data: any }>({
      method: "GET",
      path: API_PATH(id),
    });
    if (!resp?.data) throw new Error("Empty data");
    return mapApiToDetail(resp.data);
  } catch {
    // fallback mock khi API fail
    return mockById(id);
  }
}

export default async function MemberRequestDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const data = await fetchDetail(params.id);
  // Nếu muốn 404 khi cả API & mock đều không hợp lệ thì dùng notFound()
  if (!data?.id) notFound();

  return (
    <RequestDetailClient
      data={data}
      backTo="/member/request-tracking"
      contactEmail="support@lotusmiles.vn"
    />
  );
}
