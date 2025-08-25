// app/member/request-tracking/[id]/page.tsx
import RequestDetailClient from "@/components/member/requests/RequestDetailClient";

export default function MemberRequestDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <RequestDetailClient
      requestId= {params.id}
      backTo="/member/requests"
      contactEmail="support@lotusmiles.vn"
    />
  );
}
