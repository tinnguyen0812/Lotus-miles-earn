// src/components/member/requests/RequestDetailClient.tsx
"use client";

import { useRouter } from "next/navigation";
import RequestDetail, { RequestDetailData } from "./RequestDetail";

export default function RequestDetailClient({
  data,
  backTo = "/member/request-tracking",
  contactEmail = "support@lotusmiles.vn",
}: {
  data: RequestDetailData;
  backTo?: string;
  contactEmail?: string;
}) {
  const router = useRouter();
  return (
    <RequestDetail
      data={data}
      onBack={() => router.push(backTo)}
      contactEmail={contactEmail}
    />
  );
}
