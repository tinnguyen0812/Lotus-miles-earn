"use client";

import { useRouter } from "next/navigation";
import AdminRequestsDashboard, {
  type AdminClaimRow,
} from "@/components/admin/claims-table";

export default function AdminClaimsPage() {
  const router = useRouter();

  // TODO: gọi API thật & map về AdminClaimRow[]
  // const { data } = useSWR(...)

  const handleView = (id: string) => {
    // Điều hướng sang màn chi tiết — giữ đường dẫn bạn đang dùng
    router.push(`/admin/claims/${id}`);
  };

  return (
    <AdminRequestsDashboard
      onViewRequest={handleView}
      // rows={data} // <- bật khi có API
    />
  );
}
