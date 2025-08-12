import {RequestDetail, RequestDetailData} from "@/components/admin/RequestDetail";
import {callApi} from "@/lib/api-client";
import AdminShell from "@/components/layout/admin/AdminShell"; // header + sidebar wrapper (nếu bạn đã có)
import {notFound} from "next/navigation";

async function getData(id: string): Promise<RequestDetailData | null> {
  // TODO: map đúng API thật của bạn
  // const res = await callApi<{data: any}>({ method: "GET", path: `/ms-admin/manual-claims/${id}` });
  // return mapToRequestDetailData(res.data);

  // Mock shape để chạy ngay:
  return {
    id,
    submittedAt: new Date().toISOString(),
    status: "pending",
    expectedMiles: 2500,
    reason:
      "Customer claims missing miles for flight VN125 from Ho Chi Minh City to Ha Noi on 19/01/2024.",
    member: {
      initials: "NK",
      fullName: "Nguyễn Văn Khải",
      memberCode: "LM-106751",
      email: "khai.nguyen@email.com",
      phone: "+84 932 456 789",
      tier: "Business",
      tenureMonths: 24,
      totalMiles: 19860,
    },
    flight: {
      number: "VN125",
      date: "2024-01-19T00:00:00Z",
      routeFrom: "SGN",
      routeTo: "HAN",
      cabin: "Business",
      distanceKm: 430,
    },
    attachments: [
      { id: "a1", name: "boarding-pass.pdf", sizeBytes: 2.5 * 1024 * 1024, url: "/api/files/a1" },
      { id: "a2", name: "ticket-receipt.pdf",  sizeBytes: 1.1 * 1024 * 1024, url: "/api/files/a2" },
      { id: "a3", name: "payment-confirmation.pdf", sizeBytes: 890*1024, url: "/api/files/a3" },
    ]
  };
}

export default async function Page({params}: {params: {id: string}}) {
  const data = await getData(params.id);
  if (!data) return notFound();

  async function approve() {
    "use server";
    // await callApi({ method: "POST", path: `/ms-admin/manual-claims/${params.id}/approve` });
  }

  async function reject(reason: string) {
    "use server";
    // await callApi({ method: "POST", path: `/ms-admin/manual-claims/${params.id}/reject`, body: { reason } });
  }

  return (
    <AdminShell titleKey="admin.claims.detail.breadcrumb">
      {/* If you don't have AdminShell, render RequestDetail directly inside your admin layout */}
      <RequestDetail data={data} onApprove={approve} onReject={reject} />
    </AdminShell>
  );
}
